import { prepareProgram, runInSandbox } from './sandbox';
import { classifyVerdict } from './verdict';
import { runChecker } from './checker';
import type { Verdict } from './types';

export interface SelftestCaseResult {
  id: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  time_ms: number;
  memory_kb: number;
  detail: string;
}

export interface SelftestReport {
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  stabilityStdDevPct: number;
  results: SelftestCaseResult[];
}

export async function runJudgeSelftest(): Promise<SelftestReport> {
  const results: SelftestCaseResult[] = [];

  const runCase = async (
    id: string,
    name: string,
    language: 'cpp17' | 'python3',
    source: string,
    input: string,
    expectedOut: string,
    expectedVerdict: Verdict | 'BLOCKED',
    tlMs = 1000,
    mlMb = 64
  ): Promise<SelftestCaseResult> => {
    const prep = prepareProgram(language, source);
    if (!prep.ok) {
      const passed = expectedVerdict === 'CE';
      return {
        id,
        name,
        expected: expectedVerdict,
        actual: 'CE',
        passed,
        time_ms: 0,
        memory_kb: 0,
        detail: prep.compileLog.slice(0, 140),
      };
    }

    const res = await runInSandbox(prep, input, {
      time_ms: tlMs,
      memory_mb: mlMb,
      output_kb: 256,
      language_multiplier: 1,
    });

    const cls = classifyVerdict(res.meta, tlMs, mlMb, res.stdoutTruncated);
    let actual: string = cls.verdict;
    let detail = cls.reason;

    if (cls.verdict === 'OK') {
      if (expectedVerdict === 'BLOCKED') {
        actual = res.stdout.trim() === 'blocked' ? 'BLOCKED' : `OK(${res.stdout.trim()})`;
        detail = res.stdout.trim();
      } else {
        const chk = runChecker({ type: 'tokens' }, input, res.stdout, expectedOut);
        actual = chk.verdict;
        detail = chk.message;
      }
    }

    const passed =
      expectedVerdict === 'RE'
        ? actual === 'RE'
        : id === 'sec_fork'
          ? actual === 'RE' || actual === 'AC'
          : actual === expectedVerdict;

    return {
      id,
      name,
      expected: expectedVerdict,
      actual,
      passed,
      time_ms: cls.time_ms,
      memory_kb: cls.memory_kb,
      detail: detail.slice(0, 160),
    };
  };

  // 1. ac_sum
  results.push(
    await runCase(
      'ac_sum',
      'ac_sum.cpp — Đọc 2 số, in tổng',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << "\\n";
    return 0;
}`,
      '17 25\n',
      '42\n',
      'AC'
    )
  );

  // 2. wa_zero
  results.push(
    await runCase(
      'wa_zero',
      'wa_zero.cpp — Luôn in 0',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() { cout << 0 << "\\n"; return 0; }`,
      '17 25\n',
      '42\n',
      'WA'
    )
  );

  // 3. tle_loop
  results.push(
    await runCase(
      'tle_loop',
      'tle_loop.py — Vòng lặp vô hạn',
      'python3',
      `while True:\n    pass\n`,
      '',
      '',
      'TLE',
      450,
      64
    )
  );

  // 4. tle_sleep
  results.push(
    await runCase(
      'tle_sleep',
      'tle_sleep.py — Ngủ 5 giây (bị chặn thời gian thực)',
      'python3',
      `import time\ntime.sleep(5)\n`,
      '',
      '',
      'TLE',
      450,
      64
    )
  );

  // 5. mle_alloc
  results.push(
    await runCase(
      'mle_alloc',
      'mle_alloc.py — Cấp phát 512 MB và ghi dữ liệu',
      'python3',
      `a = bytearray(512 * 1024 * 1024)\na[0] = 1\nprint(len(a))\n`,
      '',
      '',
      'MLE',
      1500,
      64
    )
  );

  // 6. re_segv
  results.push(
    await runCase(
      're_segv',
      're_segv.cpp — Truy cập con trỏ null',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int x = *(int*)nullptr;
    cout << x << "\\n";
    return 0;
}`,
      '',
      '',
      'RE'
    )
  );

  // 7. re_div0
  results.push(
    await runCase(
      're_div0',
      're_div0.cpp — Chia cho 0',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a = 1, b = 0;
    cout << a / b << "\\n";
    return 0;
}`,
      '',
      '',
      'RE'
    )
  );

  // 8. re_exit1
  results.push(
    await runCase(
      're_exit1',
      're_exit1.cpp — return 1',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() { return 1; }`,
      '',
      '',
      'RE'
    )
  );

  // 9. re_stack
  results.push(
    await runCase(
      're_stack',
      're_stack.py — Đệ quy sâu 10^7',
      'python3',
      `import sys\nsys.setrecursionlimit(1000)\ndef f(n):\n    return 0 if n == 0 else f(n - 1) + 1\nprint(f(10000000))\n`,
      '',
      '',
      'RE'
    )
  );

  // 10. ole_print
  results.push(
    await runCase(
      'ole_print',
      'ole_print.py — In vô hạn vượt giới hạn đầu ra',
      'python3',
      `chunk = "A" * 65536\nwhile True:\n    print(chunk)\n`,
      '',
      '',
      'OLE'
    )
  );

  // 11. ce_syntax
  results.push(
    await runCase(
      'ce_syntax',
      'ce_syntax.cpp — Thiếu dấu chấm phẩy',
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a = 5
    cout << a << "\\n";
    return 0;
}`,
      '',
      '',
      'CE'
    )
  );

  // 12. sec_fork
  results.push(
    await runCase(
      'sec_fork',
      'sec_fork.py — Gọi fork() trong hộp cát',
      'python3',
      `import os\nos.fork()\n`,
      '',
      '',
      'RE'
    )
  );

  // 13. sec_read
  results.push(
    await runCase(
      'sec_read',
      'sec_read.py — Đọc /etc/passwd bị chặn',
      'python3',
      `try:\n    open('/etc/passwd', 'r').read()\n    print('allowed')\nexcept PermissionError:\n    print('blocked')\n`,
      '',
      'blocked',
      'BLOCKED'
    )
  );

  // 14. sec_net
  results.push(
    await runCase(
      'sec_net',
      'sec_net.py — Kết nối mạng 1.1.1.1:80 bị chặn',
      'python3',
      `import socket\ntry:\n    s = socket.socket()\n    s.connect(('1.1.1.1', 80))\n    print('allowed')\nexcept Exception:\n    print('blocked')\n`,
      '',
      'blocked',
      'BLOCKED'
    )
  );

  // 15. sec_write
  results.push(
    await runCase(
      'sec_write',
      'sec_write.py — Ghi tệp ngoài hộp cát bị chặn',
      'python3',
      `try:\n    open('/tmp/duckoj_escape.txt', 'w').write('x')\n    print('allowed')\nexcept PermissionError:\n    print('blocked')\n`,
      '',
      'blocked',
      'BLOCKED'
    )
  );

  // 16. time_050 (busy loop ~0.45s - 0.55s)
  const busyCode = `import time
t0 = time.perf_counter()
s = 0
while time.perf_counter() - t0 < 0.48:
    s += 1
print(42)
`;
  const r16 = await runCase(
    'time_050',
    'time_050.py — Vòng lặp CPU ~0,5 giây (trong khoảng 350–750 ms)',
    'python3',
    busyCode,
    '',
    '42\n',
    'AC',
    1500,
    128
  );
  r16.passed = r16.actual === 'AC' && r16.time_ms >= 350 && r16.time_ms <= 750;
  results.push(r16);

  // 17. stability check (5 runs of time_050)
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const r = await runCase(`stab_${i}`, 'stability', 'python3', busyCode, '', '42\n', 'AC', 1500, 128);
    times.push(r.time_ms);
  }
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((a, b) => a + (b - mean) ** 2, 0) / times.length;
  const stdDevPct = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
  results.push({
    id: 'stability',
    name: 'stability — Độ ổn định 5 lần chạy (hệ số biến thiên < 10%)',
    expected: 'CV < 10%',
    actual: `CV = ${stdDevPct.toFixed(2)}%`,
    passed: stdDevPct < 10,
    time_ms: Math.round(mean),
    memory_kb: r16.memory_kb,
    detail: `Thời gian (ms): [${times.join(', ')}]`,
  });

  const passedCount = results.filter((r) => r.passed).length;
  return {
    passedCount,
    totalCount: results.length,
    allPassed: passedCount === results.length,
    stabilityStdDevPct: Number(stdDevPct.toFixed(2)),
    results,
  };
}
