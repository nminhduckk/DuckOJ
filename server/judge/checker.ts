import type { CheckerConfig, CheckerResult } from './types';

function checkTokens(actual: string, expected: string): CheckerResult {
  const actTokens = actual.trim() ? actual.trim().split(/\s+/) : [];
  const expTokens = expected.trim() ? expected.trim().split(/\s+/) : [];

  if (actTokens.length !== expTokens.length) {
    return {
      verdict: 'WA',
      message: `Số lượng giá trị đầu ra chưa khớp: in ra ${actTokens.length}, đáp án có ${expTokens.length}.`.slice(0, 500),
    };
  }

  for (let i = 0; i < expTokens.length; i++) {
    if (actTokens[i] !== expTokens[i]) {
      return {
        verdict: 'WA',
        message: `Sai ở giá trị thứ ${i + 1}: in ra "${actTokens[i]}", đáp án là "${expTokens[i]}".`.slice(0, 500),
      };
    }
  }

  return { verdict: 'AC', message: `Khớp đúng ${expTokens.length} giá trị.` };
}

function checkLines(actual: string, expected: string): CheckerResult {
  const norm = (s: string) => {
    const lines = s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, ''));
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    return lines;
  };
  const actLines = norm(actual);
  const expLines = norm(expected);

  if (actLines.length !== expLines.length) {
    return {
      verdict: 'WA',
      message: `Số dòng đầu ra chưa khớp: in ra ${actLines.length}, đáp án có ${expLines.length}.`.slice(0, 500),
    };
  }

  for (let i = 0; i < expLines.length; i++) {
    if (actLines[i] !== expLines[i]) {
      return {
        verdict: 'WA',
        message: `Sai ở dòng ${i + 1}: in ra "${actLines[i]}", đáp án là "${expLines[i]}".`.slice(0, 500),
      };
    }
  }

  return { verdict: 'AC', message: `Khớp đúng ${expLines.length} dòng.` };
}

function checkFloat(actual: string, expected: string, eps = 1e-6): CheckerResult {
  const actTokens = actual.trim() ? actual.trim().split(/\s+/) : [];
  const expTokens = expected.trim() ? expected.trim().split(/\s+/) : [];

  if (actTokens.length !== expTokens.length) {
    return {
      verdict: 'WA',
      message: `Số lượng giá trị đầu ra chưa khớp: in ra ${actTokens.length}, đáp án có ${expTokens.length}.`.slice(0, 500),
    };
  }

  const numRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;
  for (let i = 0; i < expTokens.length; i++) {
    const a = actTokens[i];
    const e = expTokens[i];
    if (numRegex.test(e)) {
      if (!numRegex.test(a)) {
        return {
          verdict: 'WA',
          message: `Giá trị thứ ${i + 1} không phải số hợp lệ: "${a}".`.slice(0, 500),
        };
      }
      const av = Number(a);
      const ev = Number(e);
      if (!Number.isFinite(av) || !Number.isFinite(ev)) {
        return { verdict: 'WA', message: `Giá trị không hợp lệ (NaN/Inf) ở vị trí ${i + 1}.` };
      }
      const tol = eps * Math.max(1, Math.abs(ev));
      if (Math.abs(av - ev) > tol) {
        return {
          verdict: 'WA',
          message: `Sai số vượt mức ${eps} ở vị trí ${i + 1}: in ra ${a}, đáp án là ${e}.`.slice(0, 500),
        };
      }
    } else if (a !== e) {
      return {
        verdict: 'WA',
        message: `Sai ở vị trí ${i + 1}: in ra "${a}", đáp án là "${e}".`.slice(0, 500),
      };
    }
  }

  return { verdict: 'AC', message: `Đúng trong mức sai số ${eps}.` };
}

function checkEqualRowSums(input: string, actual: string): CheckerResult {
  const n = Number.parseInt(input.trim().split(/\s+/)[0] || '', 10);
  if (!Number.isInteger(n) || n < 1) {
    return { verdict: 'SE', message: 'Dữ liệu đầu vào kiểm tra không hợp lệ.' };
  }
  const tokens = actual.trim() ? actual.trim().split(/\s+/) : [];
  if (tokens.length !== n * n) {
    return {
      verdict: 'WA',
      message: `Ma trận cần đúng ${n * n} số nguyên, nhưng nhận được ${tokens.length}.`.slice(0, 500),
    };
  }
  const seen = new Uint8Array(n * n + 1);
  const nums: number[] = [];
  for (const t of tokens) {
    if (!/^-?\d+$/.test(t)) {
      return { verdict: 'WA', message: `Giá trị không phải số nguyên: "${t}".`.slice(0, 500) };
    }
    const v = Number.parseInt(t, 10);
    if (v < 1 || v > n * n) {
      return { verdict: 'WA', message: `Giá trị ${v} nằm ngoài đoạn [1, ${n * n}].`.slice(0, 500) };
    }
    if (seen[v]) {
      return { verdict: 'WA', message: `Số ${v} bị lặp lại trong ma trận.`.slice(0, 500) };
    }
    seen[v] = 1;
    nums.push(v);
  }
  let targetSum = -1;
  for (let r = 0; r < n; r++) {
    let rowSum = 0;
    for (let c = 0; c < n; c++) rowSum += nums[r * n + c];
    if (targetSum === -1) targetSum = rowSum;
    else if (rowSum !== targetSum) {
      return {
        verdict: 'WA',
        message: `Tổng hàng ${r + 1} (${rowSum}) khác tổng hàng 1 (${targetSum}).`.slice(0, 500),
      };
    }
  }
  return { verdict: 'AC', message: `Hợp lệ — tổng mỗi hàng đều bằng ${targetSum}.` };
}

export function runChecker(
  config: CheckerConfig,
  input: string,
  actual: string,
  expected: string
): CheckerResult {
  try {
    switch (config.type) {
      case 'tokens':
        return checkTokens(actual, expected);
      case 'lines':
        return checkLines(actual, expected);
      case 'float':
        return checkFloat(actual, expected, config.params?.eps ?? 1e-6);
      case 'custom': {
        const cid = config.params?.custom_id || 'equal_row_sums';
        if (cid === 'equal_row_sums') return checkEqualRowSums(input, actual);
        return { verdict: 'SE', message: `Kiểu chấm riêng "${cid}" chưa được hỗ trợ.` };
      }
      default:
        return { verdict: 'SE', message: 'Kiểu chấm không hợp lệ.' };
    }
  } catch (err) {
    return {
      verdict: 'SE',
      message: `Lỗi hệ thống chấm: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500),
    };
  }
}
