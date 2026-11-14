import type { SandboxMeta, Verdict } from './types';

export interface VerdictClassification {
  verdict: Verdict | 'OK';
  time_ms: number;
  memory_kb: number;
  reason: string;
}

/**
 * Parses an isolate-compatible meta.txt format (key:value per line) into SandboxMeta.
 */
export function parseMetaText(metaText: string): SandboxMeta {
  const map = new Map<string, string>();
  for (const line of metaText.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    map.set(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
  }
  const statusRaw = (map.get('status') || '').toUpperCase();
  const status = (['OK', 'TO', 'SG', 'RE', 'XX'].includes(statusRaw) ? statusRaw : '') as SandboxMeta['status'];
  return {
    status,
    time: Number.parseFloat(map.get('time') || '0') || 0,
    timeWall: Number.parseFloat(map.get('time-wall') || '0') || 0,
    maxRss: Number.parseInt(map.get('max-rss') || '0', 10) || 0,
    cgMem: Number.parseInt(map.get('cg-mem') || '0', 10) || 0,
    exitcode: Number.parseInt(map.get('exitcode') || '0', 10) || 0,
    exitsig: Number.parseInt(map.get('exitsig') || '0', 10) || 0,
    cgOomKilled: map.get('cg-oom-killed') === '1',
    killed: map.get('killed') === '1',
    message: map.get('message') || '',
  };
}

/**
 * Classifies execution meta according to §7.4 strict priority order:
 * 1. status == XX -> SE
 * 2. cg-oom-killed == 1 or memory >= ML * 1024 -> MLE
 * 3. exitsig == 25 (SIGXFSZ) -> OLE
 * 4. status == TO or time > TL -> TLE
 * 5. status == SG or RE or exitcode != 0 -> RE
 * 6. exitcode == 0 -> OK (proceed to checker)
 */
export function classifyVerdict(
  meta: SandboxMeta,
  timeLimitMs: number,
  memoryLimitMb: number,
  stdoutTruncated = false
): VerdictClassification {
  const time_ms = Math.max(0, Math.round(meta.time * 1000));
  const memory_kb = Math.max(meta.maxRss, meta.cgMem);

  if (meta.status === 'XX') {
    return { verdict: 'SE', time_ms, memory_kb, reason: meta.message || 'Lỗi nội bộ máy chấm (XX)' };
  }

  if (meta.cgOomKilled || memory_kb >= memoryLimitMb * 1024) {
    return { verdict: 'MLE', time_ms, memory_kb, reason: 'Vượt quá giới hạn bộ nhớ' };
  }

  if (meta.exitsig === 25 || stdoutTruncated) {
    return { verdict: 'OLE', time_ms, memory_kb, reason: 'Vượt quá giới hạn đầu ra (SIGXFSZ)' };
  }

  if (meta.status === 'TO' || time_ms > timeLimitMs) {
    return { verdict: 'TLE', time_ms, memory_kb, reason: 'Vượt quá giới hạn thời gian' };
  }

  if (meta.status === 'SG' || meta.status === 'RE' || meta.exitcode !== 0 || meta.exitsig !== 0) {
    return {
      verdict: 'RE',
      time_ms,
      memory_kb,
      reason:
        meta.message ||
        (meta.exitsig ? `Bị ngắt bởi tín hiệu ${meta.exitsig}` : `Mã thoát khác 0 (${meta.exitcode})`),
    };
  }

  return { verdict: 'OK', time_ms, memory_kb, reason: 'Chạy hoàn tất' };
}
