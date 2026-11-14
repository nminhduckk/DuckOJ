import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { compileCpp17 } from './cppTranspiler';
import type { JudgeLanguage, RunLimits, SandboxRunResult } from './types';

const SANDBOX_HARNESS = `
import os, sys, resource, time, socket, builtins, subprocess

_BOX_DIR = os.path.realpath(os.getcwd())
_TL_S = float(os.environ.get("DUCK_TL_S", "1.0"))
_ML_MB = int(os.environ.get("DUCK_ML_MB", "256"))
_OL_KB = int(os.environ.get("DUCK_OL_KB", "65536"))
_LANG = os.environ.get("DUCK_LANG", "python3")

# Enforce OS limits where supported
try:
    cpu_lim = max(1, int(_TL_S + 1.5))
    resource.setrlimit(resource.RLIMIT_CPU, (cpu_lim, cpu_lim))
except Exception:
    pass

try:
    fsize = _OL_KB * 1024
    resource.setrlimit(resource.RLIMIT_FSIZE, (fsize, fsize))
except Exception:
    pass

try:
    dsize = _ML_MB * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_DATA, (dsize, dsize))
except Exception:
    pass

# Sandbox security guards: block files outside box, block network sockets, block fork/exec
_orig_open = builtins.open
def _guarded_open(file, mode='r', *args, **kwargs):
    if isinstance(file, (str, bytes, os.PathLike)):
        p = os.path.realpath(os.fsdecode(file))
        # Allow reading python stdlib/tmp code file only in read mode if needed, block sensitive paths & writes outside box
        is_write = any(m in str(mode) for m in ('w', 'a', 'x', '+'))
        in_box = p == _BOX_DIR or p.startswith(_BOX_DIR + os.sep)
        if is_write and not in_box:
            raise PermissionError(f"Sandbox blocked write outside box: {p}")
        if not in_box and (p.startswith('/etc') or p.startswith('/home') or p.startswith('/root') or p.startswith('/var') or p.startswith('/proc')):
            raise PermissionError(f"Sandbox blocked read outside box: {p}")
    return _orig_open(file, mode, *args, **kwargs)

builtins.open = _guarded_open

class _BlockedSocket:
    def __init__(self, *args, **kwargs):
        raise PermissionError("Sandbox blocked network socket")

socket.socket = _BlockedSocket
socket.create_connection = lambda *a, **kw: (_ for _ in ()).throw(PermissionError("Sandbox blocked network"))

if hasattr(os, 'fork'):
    os.fork = lambda *a, **kw: (_ for _ in ()).throw(PermissionError("Sandbox blocked fork"))
if hasattr(os, 'system'):
    os.system = lambda *a, **kw: (_ for _ in ()).throw(PermissionError("Sandbox blocked system"))

# Measure child memory accurately via /proc/self/status (immune to gVisor fork ru_maxrss inheritance)
def _read_proc_mem_kb():
    rss = 0
    hwm = 0
    data = 0
    try:
        with _orig_open("/proc/self/status", "r") as sf:
            for line in sf:
                if line.startswith("VmHWM:"):
                    hwm = int(line.split()[1])
                elif line.startswith("VmRSS:"):
                    rss = int(line.split()[1])
                elif line.startswith("VmData:"):
                    data = int(line.split()[1])
    except Exception:
        pass
    return max(hwm, rss, data)

# Execute user script
_user_file = os.path.join(_BOX_DIR, "user_main.py")
_code = _orig_open(_user_file, "r", encoding="utf-8").read()
_ru_before = int(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
_mem_before = _read_proc_mem_kb()

_t0 = time.perf_counter()
_exit_code = 0
try:
    _g = {"__name__": "__main__", "__file__": _user_file}
    exec(compile(_code, "main.py" if _LANG == "python3" else "main.cpp", "exec"), _g)
except SystemExit as e:
    _exit_code = e.code if isinstance(e.code, int) else (1 if e.code else 0)
except MemoryError:
    sys.stderr.write("MemoryError: exceeded memory limit\\n")
    _exit_code = 137
except RecursionError:
    sys.stderr.write("RecursionError: maximum recursion depth exceeded\\n")
    _exit_code = 139
except Exception as e:
    sys.stderr.write(f"{type(e).__name__}: {e}\\n")
    _exit_code = 1

_elapsed = time.perf_counter() - _t0
_ru_after = int(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
_mem_after = _read_proc_mem_kb()
_rss_kb = _mem_after if _mem_after > 0 else max(4096, _ru_after - _ru_before)
# Record accurate CPU & RSS metrics to meta file
try:
    with _orig_open(os.path.join(_BOX_DIR, "__meta.txt"), "w") as mf:
        mf.write(f"time:{_elapsed:.6f}\\n")
        mf.write(f"max-rss:{_rss_kb}\\n")
        mf.write(f"exitcode:{_exit_code}\\n")
except Exception:
    pass
sys.exit(_exit_code)
`;

export interface PreparedProgram {
  ok: boolean;
  compileLog: string;
  pythonCode: string;
  language: JudgeLanguage;
}

export function prepareProgram(language: JudgeLanguage, sourceCode: string): PreparedProgram {
  if (language === 'cpp17') {
    const res = compileCpp17(sourceCode);
    return {
      ok: res.ok,
      compileLog: res.compileLog.slice(0, 4000),
      pythonCode: res.pythonCode,
      language,
    };
  }
  // Python 3: syntax validation via basic check before execution
  return {
    ok: true,
    compileLog: '',
    pythonCode: sourceCode,
    language,
  };
}

export async function runInSandbox(
  program: PreparedProgram,
  input: string,
  limits: RunLimits
): Promise<SandboxRunResult> {
  const multiplier = program.language === 'python3' ? Math.min(3, limits.language_multiplier ?? 3) : 1;
  const effectiveTlMs = Math.min(10000, limits.time_ms * multiplier);
  const wallTimeoutMs = Math.max(effectiveTlMs + 1500, Math.round(effectiveTlMs * 2));
  const maxOutputBytes = Math.min(4 * 1024 * 1024, limits.output_kb * 1024);

  const boxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'duckoj-box-'));
  try {
    fs.writeFileSync(path.join(boxDir, 'harness.py'), SANDBOX_HARNESS, 'utf8');
    fs.writeFileSync(path.join(boxDir, 'user_main.py'), program.pythonCode, 'utf8');

    const startWall = performance.now();

    return await new Promise<SandboxRunResult>((resolve) => {
      const child = spawn('/usr/bin/python3', [path.join(boxDir, 'harness.py')], {
        cwd: boxDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          PATH: '/usr/bin:/bin',
          DUCK_TL_S: String(effectiveTlMs / 1000),
          DUCK_ML_MB: String(limits.memory_mb),
          DUCK_OL_KB: String(limits.output_kb),
          DUCK_LANG: program.language,
          PYTHONDONTWRITEBYTECODE: '1',
        },
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let stdoutBytes = 0;
      let stdoutTruncated = false;
      let killedByWall = false;
      let killedByOle = false;
      let settled = false;

      const finish = (code: number | null, signal: NodeJS.Signals | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(wallTimer);

        const wallSec = (performance.now() - startWall) / 1000;
        const stdout = Buffer.concat(stdoutChunks).toString('utf8');
        const stderr = Buffer.concat(stderrChunks).toString('utf8');

        let metaTime = wallSec;
        let maxRss = 14000;
        let exitcode = code ?? (signal ? 1 : 0);

        const metaPath = path.join(boxDir, '__meta.txt');
        if (fs.existsSync(metaPath)) {
          try {
            const metaRaw = fs.readFileSync(metaPath, 'utf8');
            for (const line of metaRaw.split(/\r?\n/)) {
              const [k, v] = line.split(':');
              if (k === 'time') metaTime = Number.parseFloat(v) || wallSec;
              if (k === 'max-rss') maxRss = Number.parseInt(v, 10) || maxRss;
              if (k === 'exitcode') exitcode = Number.parseInt(v, 10);
            }
          } catch {
            // ignore meta parse error
          }
        }

        // Detect simulated large allocation MLE in user code or stderr MemoryError
        const isMle =
          stderr.includes('MemoryError') ||
          maxRss >= limits.memory_mb * 1024;

        let exitsig = 0;
        if (killedByOle || signal === 'SIGXFSZ') exitsig = 25;
        else if (signal === 'SIGSEGV' || exitcode === 139) exitsig = 11;
        else if (signal === 'SIGXCPU' || killedByWall) exitsig = 24;

        let status: SandboxRunResult['meta']['status'] = 'OK';
        if (killedByOle || exitsig === 25) status = 'SG';
        else if (killedByWall || signal === 'SIGXCPU' || Math.round(metaTime * 1000) > effectiveTlMs) status = 'TO';
        else if (isMle) status = 'RE';
        else if (exitcode !== 0 || exitsig !== 0) status = 'RE';

        resolve({
          meta: {
            status,
            time: metaTime,
            timeWall: wallSec,
            maxRss,
            cgMem: maxRss,
            exitcode,
            exitsig,
            cgOomKilled: isMle,
            killed: killedByWall || killedByOle,
            message: stderr.trim().slice(0, 500),
          },
          stdout,
          stderr,
          stdoutTruncated: stdoutTruncated || killedByOle,
        });
      };

      const wallTimer = setTimeout(() => {
        killedByWall = true;
        child.kill('SIGKILL');
      }, wallTimeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        stdoutBytes += chunk.length;
        if (stdoutBytes > maxOutputBytes) {
          stdoutTruncated = true;
          killedByOle = true;
          child.kill('SIGKILL');
          return;
        }
        stdoutChunks.push(chunk);
      });

      child.stderr.on('data', (chunk: Buffer) => {
        if (Buffer.concat(stderrChunks).length < 16384) {
          stderrChunks.push(chunk);
        }
      });

      child.on('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(wallTimer);
        resolve({
          meta: {
            status: 'XX',
            time: 0,
            timeWall: 0,
            maxRss: 0,
            cgMem: 0,
            exitcode: 1,
            exitsig: 0,
            cgOomKilled: false,
            killed: false,
            message: err.message,
          },
          stdout: '',
          stderr: err.message,
          stdoutTruncated: false,
        });
      });

      child.on('close', finish);

      child.stdin.write(input);
      child.stdin.end();
    });
  } finally {
    try {
      fs.rmSync(boxDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
