export interface NativeSample {
  input: string;
  output: string;
  explain?: string;
}

export interface NativeTestCase {
  name: string;
  grp: string;
  ord: number;
  is_sample: boolean;
  input: string;
  expected: string;
}

export interface NativeHint {
  level: number;
  type: 'nudge' | 'approach' | 'idea' | 'code';
  text_md: string;
}

export interface NativeProblemDef {
  slug: string;
  title: string;
  level: number;
  lessons: string[];
  tier: 'Khởi động' | 'Luyện tập' | 'Thử thách';
  topics: string[];
  time_limit_ms: number;
  memory_limit_mb: number;
  output_limit_kb: number;
  checker: 'tokens' | 'lines' | 'float' | 'custom';
  checker_params?: Record<string, unknown>;
  license_note: string;
  statement_md: string;
  input_spec_md: string;
  output_spec_md: string;
  notes_md: string;
  samples: NativeSample[];
  hints: NativeHint[];
  tests: NativeTestCase[];
}

// Deterministic PRNG (Mulberry32) so test generation is 100% reproducible
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function buildTests(
  samples: NativeSample[],
  extraCases: { grp: string; input: string; expected: string }[]
): NativeTestCase[] {
  const res: NativeTestCase[] = [];
  let ord = 1;
  samples.forEach((s, idx) => {
    res.push({
      name: `0${idx + 1}-samples`,
      grp: 'samples',
      ord: ord++,
      is_sample: true,
      input: s.input.trimEnd() + '\n',
      expected: s.output.trimEnd() + '\n',
    });
  });
  extraCases.forEach((c, idx) => {
    const num = String(samples.length + idx + 1).padStart(2, '0');
    res.push({
      name: `${num}-${c.grp}`,
      grp: c.grp,
      ord: ord++,
      is_sample: false,
      input: c.input.trimEnd() + '\n',
      expected: c.expected.trimEnd() + '\n',
    });
  });
  return res;
}

function padTests(
  base: { grp: string; input: string; expected: string }[],
  targetExtraCount: number,
  genOne: (idx: number) => { grp: string; input: string; expected: string }
) {
  const out = [...base];
  let idx = 0;
  while (out.length < targetExtraCount) {
    out.push(genOne(idx++));
  }
  return out;
}

function hints4(nudge: string, approach: string, idea: string, code: string): NativeHint[] {
  return [
    { level: 1, type: 'nudge', text_md: nudge },
    { level: 2, type: 'approach', text_md: approach },
    { level: 3, type: 'idea', text_md: idea },
    { level: 4, type: 'code', text_md: `\`\`\`cpp\n${code}\n\`\`\`` },
  ];
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function modPow(a: bigint, b: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let res = 1n % m;
  let base = ((a % m) + m) % m;
  let exp = b;
  while (exp > 0n) {
    if (exp & 1n) res = (res * base) % m;
    base = (base * base) % m;
    exp >>= 1n;
  }
  return res;
}

function isPrimeBig(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function generateNativeProblems(): NativeProblemDef[] {
  const list: NativeProblemDef[] = [];

  // 1. nat-sum-diff (0.1)
  {
    const samples: NativeSample[] = [
      { input: '7 3', output: '10 4', explain: '$7 + 3 = 10$, $7 - 3 = 4$.' },
      { input: '-5 5', output: '0 -10' },
    ];
    const extra = padTests(
      [
        { grp: 'edge', input: '0 0', expected: '0 0' },
        { grp: 'edge', input: '-1000000000 1000000000', expected: '0 -2000000000' },
        { grp: 'edge', input: '1000000000 -1000000000', expected: '0 2000000000' },
      ],
      18,
      (i) => {
        const rng = makeRng(101 + i);
        const a = randInt(rng, -1000000000, 1000000000);
        const b = randInt(rng, -1000000000, 1000000000);
        return { grp: 'random', input: `${a} ${b}`, expected: `${a + b} ${a - b}` };
      }
    );
    list.push({
      slug: 'nat-sum-diff',
      title: 'Tổng và hiệu hai số nguyên',
      level: 0,
      lessons: ['0.1'],
      tier: 'Khởi động',
      topics: ['io', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho hai số nguyên $a$ và $b$. Hãy tính và in ra tổng $(a + b)$ và hiệu $(a - b)$ cách nhau bởi một khoảng trắng.',
      input_spec_md: 'Một dòng duy nhất chứa hai số nguyên $a, b$ ($-10^9 \\le a, b \\le 10^9$).',
      output_spec_md: 'In ra hai số nguyên $a + b$ và $a - b$.',
      notes_md: 'Lưu ý các số có thể mang giá trị âm hoặc bằng $0$. Dùng kiểu `long long` để an toàn khi $|a|, |b| = 10^9$.',
      samples,
      hints: hints4(
        'Đọc hai số từ luồng vào chuẩn `cin >> a >> b;`.',
        'Kiểm tra xem $a - b$ với $a = -10^9, b = 10^9$ có thể viết thành `-2000000000` (vừa `int` nhưng nên dùng `long long` thành thói quen).',
        'In `cout << a + b << " " << a - b << "\\n";`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b << " " << a - b << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 2. nat-reverse-three (0.1)
  {
    const samples: NativeSample[] = [{ input: '1 2 3', output: '3 2 1' }];
    const extra = padTests(
      [{ grp: 'same', input: '7 7 7', expected: '7 7 7' }, { grp: 'neg', input: '-4 0 9', expected: '9 0 -4' }],
      19,
      (i) => {
        const rng = makeRng(202 + i);
        const a = randInt(rng, -100000, 100000);
        const b = randInt(rng, -100000, 100000);
        const c = randInt(rng, -100000, 100000);
        return { grp: 'random', input: `${a} ${b} ${c}`, expected: `${c} ${b} ${a}` };
      }
    );
    list.push({
      slug: 'nat-reverse-three',
      title: 'Đảo ngược ba số',
      level: 0,
      lessons: ['0.1'],
      tier: 'Khởi động',
      topics: ['io', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho ba số nguyên $a, b, c$. Hãy in ra ba số đó theo thứ tự ngược lại: $c, b, a$.',
      input_spec_md: 'Một dòng chứa ba số nguyên $a, b, c$ ($|a|, |b|, |c| \\le 10^9$).',
      output_spec_md: 'In ba số theo thứ tự $c, b, a$ cách nhau bằng khoảng trắng.',
      notes_md: 'Thực hành đọc nhiều biến trên một dòng và in theo thứ tự chỉ định.',
      samples,
      hints: hints4(
        'Khai báo 3 biến `a, b, c` và đọc lần lượt bằng `cin >> a >> b >> c;`.',
        'In ngược lại bằng `cout << c << " " << b << " " << a << "\\n";`.',
        'Không cần mảng cho bài toán cố định 3 phần tử.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long a, b, c;\n    cin >> a >> b >> c;\n    cout << c << " " << b << " " << a << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 3. nat-big-sum (0.2)
  {
    const samples: NativeSample[] = [{ input: '2000000000000000000 1000000000000000000', output: '3000000000000000000' }];
    const extra = padTests(
      [
        { grp: 'overflow', input: '2000000000 2000000000', expected: '4000000000' },
        { grp: 'overflow', input: '-2000000000 -2000000000', expected: '-4000000000' },
        { grp: 'boundary', input: '2147483647 1', expected: '2147483648' },
        { grp: 'boundary', input: '-2147483648 -1', expected: '-2147483649' },
        { grp: 'edge', input: '2000000000000000000 2000000000000000000', expected: '4000000000000000000' },
        { grp: 'edge', input: '-2000000000000000000 2000000000000000000', expected: '0' },
        { grp: 'edge', input: '-2000000000000000000 -2000000000000000000', expected: '-4000000000000000000' },
      ],
      19,
      (i) => {
        const rng = makeRng(303 + i);
        const a = BigInt(randInt(rng, -2000000000, 2000000000)) * 1000000000n + BigInt(randInt(rng, 0, 999999999));
        const b = BigInt(randInt(rng, -2000000000, 2000000000)) * 1000000000n + BigInt(randInt(rng, 0, 999999999));
        return { grp: 'random', input: `${a} ${b}`, expected: `${a + b}` };
      }
    );
    list.push({
      slug: 'nat-big-sum',
      title: 'Tổng hai số nguyên 64-bit',
      level: 0,
      lessons: ['0.2'],
      tier: 'Khởi động',
      topics: ['overflow', 'data-types'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho hai số nguyên $a$ và $b$ có giá trị tuyệt đối lên tới $2 \\cdot 10^{18}$. Hãy tính tổng $a + b$.',
      input_spec_md: 'Một dòng chứa hai số nguyên $a, b$ ($-2 \\cdot 10^{18} \\le a, b \\le 2 \\cdot 10^{18}$).',
      output_spec_md: 'In ra giá trị $a + b$.',
      notes_md: 'Kiểu `int` chỉ lưu được tới $\\approx 2.1 \\cdot 10^9$. Phải dùng `long long` (64-bit có dấu, lưu tới $\\approx 9.22 \\cdot 10^{18}$).',
      samples,
      hints: hints4(
        'Kiểu `int` sẽ bị tràn ngay khi đọc dữ liệu.',
        'Sử dụng kiểu `long long` trong C++.',
        'Tổng tối đa $4 \\cdot 10^{18} < 9.22 \\cdot 10^{18}$ nên `long long` lưu chính xác tuyệt đối.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 4. nat-product-overflow (0.2)
  {
    const samples: NativeSample[] = [{ input: '1000000000 1000000000', output: '1000000000000000000' }];
    const extra = padTests(
      [
        { grp: 'overflow', input: '50000 50000', expected: '2500000000' },
        { grp: 'overflow', input: '46341 46341', expected: '2147488281' },
        { grp: 'overflow', input: '-46341 46341', expected: '-2147488281' },
        { grp: 'overflow', input: '100000 100000', expected: '10000000000' },
        { grp: 'overflow', input: '1000000000 -1000000000', expected: '-1000000000000000000' },
        { grp: 'edge', input: '0 1000000000', expected: '0' },
      ],
      19,
      (i) => {
        const rng = makeRng(404 + i);
        const a = BigInt(randInt(rng, -1000000000, 1000000000));
        const b = BigInt(randInt(rng, -1000000000, 1000000000));
        return { grp: 'random', input: `${a} ${b}`, expected: `${a * b}` };
      }
    );
    list.push({
      slug: 'nat-product-overflow',
      title: 'Tích tránh tràn số',
      level: 0,
      lessons: ['0.2'],
      tier: 'Luyện tập',
      topics: ['overflow', 'data-types', 'math'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho hai số nguyên $a, b$ ($|a|, |b| \\le 10^9$). Tính tích $a \\times b$. Chú ý dù $a, b$ vừa kiểu `int`, tích của chúng có thể lên tới $10^{18}$.',
      input_spec_md: 'Một dòng chứa hai số nguyên $a$ và $b$.',
      output_spec_md: 'In ra tích $a \\times b$.',
      notes_md: 'Cẩn thận bẫy kinh điển: `long long ans = a * b;` vẫn tràn nếu `a` và `b` được khai báo là `int`!',
      samples,
      hints: hints4(
        'Hai số $10^9$ nhân với nhau ra $10^{18}$.',
        'Nếu khai báo `int a, b;`, phải viết `1LL * a * b`.',
        'Tốt hơn hết là khai báo `long long a, b;` ngay từ đầu.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a * b << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 5. nat-max-min (0.3)
  {
    const samples: NativeSample[] = [{ input: '5\n3 -2 9 0 4', output: '9 -2' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1\n-1000000000', expected: '-1000000000 -1000000000' },
        { grp: 'neg', input: '4\n-5 -1 -9 -3', expected: '-1 -9' },
      ],
      19,
      (i) => {
        const rng = makeRng(505 + i);
        const n = i === 15 ? 100000 : randInt(rng, 2, 200);
        const arr = Array.from({ length: n }, () => randInt(rng, -1000000000, 1000000000));
        let mx = arr[0];
        let mn = arr[0];
        for (const x of arr) {
          if (x > mx) mx = x;
          if (x < mn) mn = x;
        }
        return { grp: 'random', input: `${n}\n${arr.join(' ')}`, expected: `${mx} ${mn}` };
      }
    );
    list.push({
      slug: 'nat-max-min',
      title: 'Giá trị lớn nhất và nhỏ nhất',
      level: 0,
      lessons: ['0.3'],
      tier: 'Khởi động',
      topics: ['arrays', 'loops', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy gồm $n$ số nguyên $a_1, a_2, \\dots, a_n$. Tìm giá trị lớn nhất và giá trị nhỏ nhất của dãy.',
      input_spec_md: 'Dòng đầu chứa số nguyên $n$ ($1 \\le n \\le 10^5$).\\nDòng thứ hai chứa $n$ số nguyên $a_i$ ($|a_i| \\le 10^9$).',
      output_spec_md: 'In ra hai số: giá trị lớn nhất và giá trị nhỏ nhất.',
      notes_md: 'Đừng khởi tạo `mx = 0` vì toàn bộ dãy có thể gồm toàn số âm!',
      samples,
      hints: hints4(
        'Khởi tạo `mx` và `mn` bằng chính phần tử đầu tiên `a[0]`.',
        'Duyệt vòng lặp từ `i = 1` tới `n - 1` và cập nhật `mx = max(mx, a[i])`, `mn = min(mn, a[i])`.',
        'Cẩn thận với dãy toàn số âm hoặc $n = 1$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    long long mx = -4e18, mn = 4e18;\n    for (int i = 0; i < n; i++) {\n        long long x; cin >> x;\n        mx = max(mx, x); mn = min(mn, x);\n    }\n    cout << mx << " " << mn << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 6. nat-reverse-array (0.3)
  {
    const samples: NativeSample[] = [{ input: '4\n10 20 30 40', output: '40 30 20 10' }];
    const extra = padTests(
      [{ grp: 'edge', input: '1\n42', expected: '42' }],
      19,
      (i) => {
        const rng = makeRng(606 + i);
        const n = i === 17 ? 100000 : randInt(rng, 2, 150);
        const arr = Array.from({ length: n }, () => randInt(rng, -10000, 10000));
        return { grp: 'random', input: `${n}\n${arr.join(' ')}`, expected: [...arr].reverse().join(' ') };
      }
    );
    list.push({
      slug: 'nat-reverse-array',
      title: 'Đảo ngược dãy số',
      level: 0,
      lessons: ['0.3'],
      tier: 'Khởi động',
      topics: ['arrays', 'loops'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên. Hãy in ra dãy đó theo thứ tự ngược lại.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$). Dòng 2: $n$ số nguyên.',
      output_spec_md: 'In ra $n$ số theo thứ tự đảo ngược.',
      notes_md: 'Với $n = 10^5$, nhớ dùng `ios::sync_with_stdio(false); cin.tie(nullptr);` và `\\n`.',
      samples,
      hints: hints4(
        'Lưu các phần tử vào `vector<int> a(n)`.',
        'Dùng vòng lặp ngược `for (int i = n - 1; i >= 0; i--)` hoặc `reverse(a.begin(), a.end())`.',
        'Chú ý in khoảng trắng giữa các số.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int i = n - 1; i >= 0; i--) cout << a[i] << (i ? " " : "\\n");\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 7. nat-count-even (0.3)
  {
    const samples: NativeSample[] = [{ input: '6\n1 2 0 -4 7 8', output: '4' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '3\n0 -2 -4', expected: '3' },
        { grp: 'edge', input: '3\n1 -3 5', expected: '0' },
      ],
      19,
      (i) => {
        const rng = makeRng(707 + i);
        const n = randInt(rng, 1, 200);
        const arr = Array.from({ length: n }, () => randInt(rng, -1000, 1000));
        const cnt = arr.filter((x) => x % 2 === 0).length;
        return { grp: 'random', input: `${n}\n${arr.join(' ')}`, expected: `${cnt}` };
      }
    );
    list.push({
      slug: 'nat-count-even',
      title: 'Đếm số chẵn trong dãy',
      level: 0,
      lessons: ['0.3'],
      tier: 'Luyện tập',
      topics: ['arrays', 'loops', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên (có thể chứa số âm và số $0$). Hãy đếm xem có bao nhiêu số chẵn trong dãy.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$). Dòng 2: $n$ số nguyên ($|a_i| \\le 10^9$).',
      output_spec_md: 'In ra một số nguyên duy nhất là số lượng số chẵn.',
      notes_md: 'Số $0$ và các số âm chia hết cho $2$ (như $-4$) đều là số chẵn. Trong C++, `(-4) % 2 == 0` nhưng `(-3) % 2 == -1` chứ không phải `1`!',
      samples,
      hints: hints4(
        'Kiểm tra số chẵn bằng `x % 2 == 0`.',
        'Tránh viết `x % 2 != 1` cho số lẻ âm vì `(-3) % 2` bằng `-1`.',
        'Duyệt một vòng lặp và tăng biến đếm.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n, cnt = 0; cin >> n;\n    for (int i = 0; i < n; i++) { int x; cin >> x; if (x % 2 == 0) cnt++; }\n    cout << cnt << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 8. nat-most-frequent (0.4) - anti O(n^2)
  {
    const samples: NativeSample[] = [{ input: '6\n4 2 4 3 2 5', output: '2' }];
    const solveMostFreq = (arr: number[]) => {
      const m = new Map<number, number>();
      for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
      let bestVal = arr[0];
      let bestCnt = 0;
      for (const [k, v] of m) {
        if (v > bestCnt || (v === bestCnt && k < bestVal)) {
          bestCnt = v;
          bestVal = k;
        }
      }
      return String(bestVal);
    };
    const bigArr = Array.from({ length: 100000 }, (_, i) => i % 997);
    bigArr.push(5, 5);
    const extra = padTests(
      [
        { grp: 'tie', input: '4\n10 5 10 5', expected: '5' },
        { grp: 'anti-n2', input: `${bigArr.length}\n${bigArr.join(' ')}`, expected: solveMostFreq(bigArr) },
      ],
      19,
      (i) => {
        const rng = makeRng(808 + i);
        const n = i > 14 ? 40000 : randInt(rng, 2, 300);
        const arr = Array.from({ length: n }, () => randInt(rng, 0, 500));
        return { grp: 'random', input: `${n}\n${arr.join(' ')}`, expected: solveMostFreq(arr) };
      }
    );
    list.push({
      slug: 'nat-most-frequent',
      title: 'Phần tử xuất hiện nhiều nhất',
      level: 0,
      lessons: ['0.4'],
      tier: 'Luyện tập',
      topics: ['complexity', 'frequency-count'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên không âm ($0 \\le a_i \\le 10^6$). Hãy tìm giá trị xuất hiện nhiều lần nhất trong dãy. Nếu có nhiều giá trị cùng số lần xuất hiện lớn nhất, in ra giá trị **nhỏ nhất**.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$). Dòng 2: $n$ số nguyên $a_i$ ($0 \\le a_i \\le 10^6$).',
      output_spec_md: 'In ra giá trị cần tìm.',
      notes_md: 'Thuật toán $O(n^2)$ sẽ bị TLE trên các bộ test lớn $n = 10^5$. Hãy dùng mảng đếm tần số hoặc sắp xếp $O(n \\log n)$.',
      samples,
      hints: hints4(
        'Giá trị $a_i \\le 10^6$ đủ nhỏ để tạo một mảng đếm `cnt[1000005]`.',
        'Nếu dùng `map<int, int>` hoặc `sort`, độ phức tạp là $O(n \\log n)$ vẫn hoàn toàn vượt qua trong 1 giây.',
        'Duyệt tăng dần để tự động ưu tiên giá trị nhỏ hơn khi hòa tần số.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    map<int, int> cnt;\n    for (int i = 0; i < n; i++) { int x; cin >> x; cnt[x]++; }\n    int best = 0, mx = -1;\n    for (auto [k, v] : cnt) if (v > mx) { mx = v; best = k; }\n    cout << best << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 9. nat-bouncing-ball (0.5)
  {
    const solveBall = (h: bigint) => {
      let cur = h;
      let total = h;
      while (cur > 0n) {
        const b = cur / 2n;
        if (b === 0n) break;
        total += 2n * b;
        cur = b;
      }
      return total.toString();
    };
    const samples: NativeSample[] = [{ input: '5', output: '11', explain: 'Rơi 5, nảy 2 rồi rơi 2, nảy 1 rồi rơi 1 -> $5 + 2 + 2 + 1 + 1 = 11$.' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1', expected: '1' },
        { grp: 'max', input: '1000000000000000000', expected: solveBall(1000000000000000000n) },
      ],
      19,
      (i) => {
        const rng = makeRng(909 + i);
        const h = BigInt(randInt(rng, 2, 1000000000)) * BigInt(randInt(rng, 1, 100000));
        return { grp: 'random', input: `${h}`, expected: solveBall(h) };
      }
    );
    list.push({
      slug: 'nat-bouncing-ball',
      title: 'Quả bóng nảy',
      level: 0,
      lessons: ['0.5'],
      tier: 'Luyện tập',
      topics: ['simulation', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Một quả bóng được thả từ độ cao $H$. Mỗi lần chạm đất, nó nảy lên độ cao bằng $\\lfloor h / 2 \\rfloor$ (chia nguyên cho 2) rồi lại rơi xuống đất. Quá trình dừng lại khi độ cao nảy lên bằng $0$. Tính tổng quãng đường quả bóng đã đi được (cả lúc rơi và lúc nảy).',
      input_spec_md: 'Một số nguyên $H$ ($1 \\le H \\le 10^{18}$).',
      output_spec_md: 'In ra tổng quãng đường di chuyển.',
      notes_md: 'Mỗi lần nảy lên độ cao $b > 0$ sẽ đi thêm $2b$ (lên $b$ và xuống $b$). Vì mỗi bước chia đôi nên vòng lặp chạy tối đa $\\approx 60$ bước.',
      samples,
      hints: hints4(
        'Khởi tạo `total = H` cho lần rơi đầu tiên.',
        'Trong vòng `while (H / 2 > 0)`: đặt `H /= 2`, cộng thêm `2 * H` vào `total`.',
        'Dùng `long long` vì $H \\le 10^{18}$ và tổng quãng đường tới $\\approx 3 \\cdot 10^{18}$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long h; cin >> h;\n    long long ans = h;\n    while (h / 2 > 0) { h /= 2; ans += 2 * h; }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 10. nat-count-vowels (0.6)
  {
    const countVowels = (s: string) =>
      String([...s.toLowerCase()].filter((c) => 'aeiou'.includes(c)).length);
    const samples: NativeSample[] = [{ input: 'DuckOJCompetitive', output: '7' }];
    const extra = padTests(
      [
        { grp: 'edge', input: 'bcdfghjklmnpqrstvwxyz', expected: '0' },
        { grp: 'edge', input: 'AEIOUaeiou', expected: '10' },
      ],
      19,
      (i) => {
        const rng = makeRng(1010 + i);
        const len = randInt(rng, 1, 200);
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let s = '';
        for (let k = 0; k < len; k++) s += chars[randInt(rng, 0, chars.length - 1)];
        return { grp: 'random', input: s, expected: countVowels(s) };
      }
    );
    list.push({
      slug: 'nat-count-vowels',
      title: 'Đếm nguyên âm',
      level: 0,
      lessons: ['0.6'],
      tier: 'Khởi động',
      topics: ['string-basics', 'strings'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho một chuỗi $S$ chỉ gồm các chữ cái Latin hoa và thường (không có khoảng trắng). Đếm số ký tự là nguyên âm (`a, e, i, o, u`, không phân biệt hoa thường).',
      input_spec_md: 'Một chuỗi $S$ ($1 \\le |S| \\le 10^5$).',
      output_spec_md: 'In ra số nguyên âm trong $S$.',
      notes_md: 'Nhớ chuyển về chữ thường bằng `tolower(c)` trước khi kiểm tra.',
      samples,
      hints: hints4(
        'Dùng `for (char c : s)` để duyệt từng ký tự.',
        'Đưa ký tự về chữ thường `c = tolower(c)` rồi so sánh với `a, e, i, o, u`.',
        'Kiểm tra trường hợp chuỗi không có nguyên âm nào.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    int cnt = 0;\n    for (char c : s) {\n        c = tolower(c);\n        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u') cnt++;\n    }\n    cout << cnt << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 11. nat-palindrome (0.6)
  {
    const isPal = (s: string) => (s === [...s].reverse().join('') ? 'YES' : 'NO');
    const samples: NativeSample[] = [
      { input: 'racecar', output: 'YES' },
      { input: 'duckoj', output: 'NO' },
    ];
    const extra = padTests(
      [
        { grp: 'edge', input: 'a', expected: 'YES' },
        { grp: 'even', input: 'abba', expected: 'YES' },
        { grp: 'even-no', input: 'abca', expected: 'NO' },
      ],
      18,
      (i) => {
        const rng = makeRng(1111 + i);
        const halfLen = randInt(rng, 2, 40);
        const abc = 'abcdef';
        let half = '';
        for (let k = 0; k < halfLen; k++) half += abc[randInt(rng, 0, 5)];
        const makeYes = i % 2 === 0;
        let s = half + [...half].reverse().join('');
        if (!makeYes) s = 'x' + s + 'y';
        return { grp: 'random', input: s, expected: isPal(s) };
      }
    );
    list.push({
      slug: 'nat-palindrome',
      title: 'Kiểm tra chuỗi đối xứng',
      level: 0,
      lessons: ['0.6'],
      tier: 'Luyện tập',
      topics: ['string-basics', 'strings'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho chuỗi $S$ gồm các chữ cái thường. Kiểm tra xem $S$ có phải chuỗi đối xứng (Palindrome — đọc xuôi và đọc ngược giống nhau) hay không.',
      input_spec_md: 'Một dòng chứa chuỗi $S$ ($1 \\le |S| \\le 10^5$).',
      output_spec_md: 'In `YES` nếu đối xứng, ngược lại in `NO`.',
      notes_md: 'Chuỗi có độ dài 1 luôn đối xứng.',
      samples,
      hints: hints4(
        'Dùng hai chỉ số `l = 0` và `r = s.size() - 1`.',
        'Trong khi `l < r`, nếu `s[l] != s[r]` thì in `NO` và dừng ngay.',
        'Nếu duyệt hết mà không có cặp nào khác nhau thì in `YES`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    int l = 0, r = (int)s.size() - 1;\n    while (l < r) {\n        if (s[l] != s[r]) { cout << "NO\\n"; return 0; }\n        l++; r--;\n    }\n    cout << "YES\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 12. nat-gcd-lcm (0.7)
  {
    const samples: NativeSample[] = [{ input: '12 18', output: '6 36' }];
    const extra = padTests(
      [
        { grp: 'overflow', input: '50000 50001', expected: '1 2500050000' },
        { grp: 'overflow', input: '1000000000 999999999', expected: '1 999999999000000000' },
        { grp: 'equal', input: '1000000000 1000000000', expected: '1000000000 1000000000' },
      ],
      19,
      (i) => {
        const rng = makeRng(1212 + i);
        const a = BigInt(randInt(rng, 1, 1000000000));
        const b = BigInt(randInt(rng, 1, 1000000000));
        const g = gcdBig(a, b);
        const l = (a / g) * b;
        return { grp: 'random', input: `${a} ${b}`, expected: `${g} ${l}` };
      }
    );
    list.push({
      slug: 'nat-gcd-lcm',
      title: 'ƯCLN và BCNN',
      level: 0,
      lessons: ['0.7'],
      tier: 'Khởi động',
      topics: ['gcd-lcm', 'math', 'number-theory'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho hai số nguyên dương $a$ và $b$ ($1 \\le a, b \\le 10^9$). Tính ước chung lớn nhất $\\gcd(a, b)$ và bội chung nhỏ nhất $\\operatorname{lcm}(a, b)$.',
      input_spec_md: 'Một dòng chứa hai số nguyên $a, b$.',
      output_spec_md: 'In ra $\\gcd(a, b)$ và $\\operatorname{lcm}(a, b)$.',
      notes_md: 'BCNN của hai số $\\le 10^9$ có thể đạt tới $\\approx 10^{18}$. Tính theo công thức `(a / g) * b` với `long long`.',
      samples,
      hints: hints4(
        'Dùng thuật toán Euclid `gcd(a, b) = b == 0 ? a : gcd(b, a % b)`.',
        'Trong C++17 có sẵn hàm `std::gcd(a, b)` trong `<numeric>`.',
        'Chia cho `g` trước rồi mới nhân với `b` để tránh tràn số khi tính LCM.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long a, b; cin >> a >> b;\n    long long g = std::gcd(a, b);\n    cout << g << " " << (a / g) * b << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 13. nat-prime-check (0.7)
  {
    const samples: NativeSample[] = [
      { input: '17', output: 'YES' },
      { input: '1', output: 'NO' },
    ];
    const extra = padTests(
      [
        { grp: 'edge', input: '2', expected: 'YES' },
        { grp: 'square-prime', input: '999966000289', expected: 'NO' },
        { grp: 'large-prime', input: '999999937', expected: 'YES' },
        { grp: 'large-prime2', input: '1000000007', expected: 'YES' },
      ],
      18,
      (i) => {
        const candidates = [4, 9, 25, 49, 121, 97, 997, 1000000009, 999999999, 998244353, 104729, 104730, 7919, 7921, 15, 21, 99999989, 100000000];
        const v = candidates[i % candidates.length];
        return { grp: 'random', input: `${v}`, expected: isPrimeBig(v) ? 'YES' : 'NO' };
      }
    );
    // fix 999983^2 exact value: 999983 * 999983 = 999966000289
    extra[1] = { grp: 'square-prime', input: '999966000289', expected: 'NO' };
    list.push({
      slug: 'nat-prime-check',
      title: 'Kiểm tra số nguyên tố lớn',
      level: 0,
      lessons: ['0.7'],
      tier: 'Luyện tập',
      topics: ['primality-basic', 'number-theory'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho số nguyên dương $n$ ($1 \\le n \\le 10^{12}$). Hãy kiểm tra xem $n$ có phải số nguyên tố hay không.',
      input_spec_md: 'Một số nguyên $n$ ($1 \\le n \\le 10^{12}$).',
      output_spec_md: 'In `YES` nếu $n$ là số nguyên tố, ngược lại in `NO`.',
      notes_md: 'Duyệt tới $n$ sẽ bị TLE vì $n \\le 10^{12}$. Chỉ cần kiểm tra các ước từ $2$ đến $\\lfloor\\sqrt{n}\\rfloor$ (chú ý `1LL * i * i <= n`).',
      samples,
      hints: hints4(
        'Số $n < 2$ không phải số nguyên tố.',
        'Nếu $n$ có ước $> \\sqrt{n}$ thì chắc chắn cũng có một ước tương ứng $< \\sqrt{n}$.',
        'Dùng `for (long long i = 2; i * i <= n; i++)` và kiểm tra `n % i == 0`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long n; cin >> n;\n    if (n < 2) { cout << "NO\\n"; return 0; }\n    for (long long i = 2; i * i <= n; i++)\n        if (n % i == 0) { cout << "NO\\n"; return 0; }\n    cout << "YES\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 14. nat-word-stats (0.8) - checker lines
  {
    const solveWords = (line: string) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      let longest = '';
      for (const w of words) {
        if (w.length > longest.length) longest = w;
      }
      return `${words.length}\n${longest}`;
    };
    const samples: NativeSample[] = [{ input: '  Hoc   lap   trinh   DuckOJ  ', output: '4\nDuckOJ' }];
    const extra = padTests(
      [
        { grp: 'spaces', input: '   alpha    beta   gamma   ', expected: solveWords('   alpha    beta   gamma   ') },
        { grp: 'single', input: 'algorithm', expected: '1\nalgorithm' },
      ],
      19,
      (i) => {
        const bank = ['duck', 'segment', 'tree', 'dijkstra', 'prefix', 'dp', 'cp', 'hello', 'world'];
        const line = Array.from({ length: 5 + (i % 7) }, (_, k) => bank[(i + k * 3) % bank.length]).join('   ');
        return { grp: 'random', input: line, expected: solveWords(line) };
      }
    );
    list.push({
      slug: 'nat-word-stats',
      title: 'Thống kê từ trên một dòng',
      level: 0,
      lessons: ['0.8'],
      tier: 'Luyện tập',
      topics: ['strings', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'lines',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho một dòng văn bản gồm các từ tiếng Anh cách nhau bởi một hoặc nhiều dấu cách. Hãy đếm tổng số từ và tìm từ dài nhất (nếu có nhiều từ dài bằng nhau, chọn từ xuất hiện đầu tiên).',
      input_spec_md: 'Một dòng duy nhất độ dài không quá $10^5$ ký tự (có thể có khoảng trắng đầu/cuối dòng).',
      output_spec_md: 'Dòng 1: số lượng từ.\\nDòng 2: từ dài nhất tìm được.',
      notes_md: 'Dùng `getline(cin, line)` rồi đưa vào `stringstream ss(line)` để tách từng từ tự động bỏ qua khoảng trắng thừa.',
      samples,
      hints: hints4(
        'Không thể dùng `cin >> word` một lần vì cần đọc cả dòng, hãy dùng `getline(cin, s)`.',
        'Khởi tạo `stringstream ss(s);` rồi lặp `while (ss >> w)`.',
        'Chỉ cập nhật `best = w` khi `w.size() > best.size()` để giữ từ đầu tiên khi bằng độ dài.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    stringstream ss(s);\n    string w, best = ""; int cnt = 0;\n    while (ss >> w) { cnt++; if (w.size() > best.size()) best = w; }\n    cout << cnt << "\\n" << best << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 15. nat-subset-sum-small (1.1)
  {
    const solveSubset = (arr: number[], target: number) => {
      const n = arr.length;
      for (let mask = 1; mask < 1 << n; mask++) {
        let sum = 0;
        for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += arr[i];
        if (sum === target) return 'YES';
      }
      return target === 0 ? 'YES' : 'NO';
    };
    const samples: NativeSample[] = [{ input: '4 9\n3 1 5 7', output: 'YES' }];
    const extra = padTests(
      [
        { grp: 'edge-zero', input: '5 0\n1 2 3 4 5', expected: 'YES' },
        { grp: 'no', input: '4 10\n1 2 4 8', expected: 'NO' },
      ],
      19,
      (i) => {
        const rng = makeRng(1515 + i);
        const n = i === 16 ? 18 : randInt(rng, 3, 12);
        const arr = Array.from({ length: n }, () => randInt(rng, 1, 50));
        const s = i % 2 === 0 ? arr[0] + arr[Math.min(2, n - 1)] : 999;
        return { grp: 'random', input: `${n} ${s}\n${arr.join(' ')}`, expected: solveSubset(arr, s) };
      }
    );
    list.push({
      slug: 'nat-subset-sum-small',
      title: 'Tổng tập con (N nhỏ)',
      level: 1,
      lessons: ['1.1'],
      tier: 'Khởi động',
      topics: ['brute-force', 'bitmasks'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho mảng $n$ số nguyên dương ($1 \\le n \\le 20$) và số nguyên $S$ ($0 \\le S \\le 10^9$). Hãy kiểm tra xem có tồn tại một tập con nào của mảng (có thể rỗng với tổng $0$) có tổng đúng bằng $S$ hay không.',
      input_spec_md: 'Dòng 1: $n$ và $S$.\\nDòng 2: $n$ số nguyên dương $a_i \\le 10^8$.',
      output_spec_md: 'In `YES` nếu tồn tại, ngược lại in `NO`.',
      notes_md: 'Với $n \\le 20$, số tập con là $2^{20} \\approx 10^6$, hoàn toàn phù hợp để duyệt bằng bitmask hoặc quay lui.',
      samples,
      hints: hints4(
        'Mỗi tập con ứng với một số `mask` từ `0` đến `(1 << n) - 1`.',
        'Bit thứ `i` bật (`(mask >> i) & 1`) nghĩa là chọn phần tử `a[i]`.',
        'Chú ý dùng `long long` để cộng tổng tập con.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; long long S; cin >> n >> S;\n    vector<long long> a(n);\n    for (auto &x : a) cin >> x;\n    for (int mask = 0; mask < (1 << n); mask++) {\n        long long sum = 0;\n        for (int i = 0; i < n; i++) if (mask & (1 << i)) sum += a[i];\n        if (sum == S) { cout << "YES\\n"; return 0; }\n    }\n    cout << "NO\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 16. nat-sort-two-keys (1.2) - checker lines
  {
    const sortTwoKeys = (items: { name: string; score: number }[]) => {
      return [...items]
        .sort((a, b) => (a.score !== b.score ? b.score - a.score : a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((x) => `${x.name} ${x.score}`)
        .join('\n');
    };
    const samples: NativeSample[] = [
      { input: '3\nAn 90\nBinh 95\nChi 90', output: 'Binh 95\nAn 90\nChi 90' },
    ];
    const extra = padTests(
      [
        {
          grp: 'ties',
          input: '4\nzoe 100\nalex 100\nbob 100\ndan 100',
          expected: 'alex 100\nbob 100\ndan 100\nzoe 100',
        },
      ],
      19,
      (i) => {
        const rng = makeRng(1616 + i);
        const names = ['an', 'binh', 'chi', 'dung', 'hoa', 'khanh', 'linh', 'minh', 'nam', 'quang'];
        const n = 5 + (i % 6);
        const items = Array.from({ length: n }, (_, k) => ({
          name: `${names[(i + k) % names.length]}${k}`,
          score: randInt(rng, 70, 100),
        }));
        return {
          grp: 'random',
          input: `${n}\n${items.map((x) => `${x.name} ${x.score}`).join('\n')}`,
          expected: sortTwoKeys(items),
        };
      }
    );
    list.push({
      slug: 'nat-sort-two-keys',
      title: 'Sắp xếp bảng điểm hai tiêu chí',
      level: 1,
      lessons: ['1.2'],
      tier: 'Khởi động',
      topics: ['sortings', 'comparator'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'lines',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho danh sách $n$ thí sinh gồm tên (chuỗi không dấu cách) và điểm số. Hãy sắp xếp danh sách theo điểm **giảm dần**; nếu hai thí sinh bằng điểm nhau thì xếp theo tên **tăng dần** theo thứ tự từ điển.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$).\\n$n$ dòng tiếp theo, mỗi dòng chứa tên và điểm nguyên.',
      output_spec_md: 'In ra $n$ dòng danh sách sau khi đã sắp xếp.',
      notes_md: 'Dùng `std::sort` cùng hàm so sánh tùy biến.',
      samples,
      hints: hints4(
        'Lưu mỗi thí sinh bằng `pair<int, string>` hoặc `struct`.',
        'Trong comparator: nếu `a.score != b.score` trả về `a.score > b.score`, ngược lại trả về `a.name < b.name`.',
        'Luôn đảm bảo hàm so sánh dùng `<` hoặc `>`, tuyệt đối không dùng `<=`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nstruct P { string name; int score; };\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    vector<P> a(n);\n    for (auto &x : a) cin >> x.name >> x.score;\n    sort(a.begin(), a.end(), [](const P& x, const P& y) {\n        if (x.score != y.score) return x.score > y.score;\n        return x.name < y.name;\n    });\n    for (auto &x : a) cout << x.name << " " << x.score << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 17. nat-caesar (1.3) - checker lines
  {
    const caesar = (k: number, s: string) => {
      const shift = ((k % 26) + 26) % 26;
      return [...s]
        .map((c) => {
          if (c >= 'a' && c <= 'z') return String.fromCharCode(97 + ((c.charCodeAt(0) - 97 + shift) % 26));
          if (c >= 'A' && c <= 'Z') return String.fromCharCode(65 + ((c.charCodeAt(0) - 65 + shift) % 26));
          return c;
        })
        .join('');
    };
    const samples: NativeSample[] = [{ input: '3\nHello, DuckOJ-Z!', output: 'Khoor, GxfnRM-C!' }];
    const extra = padTests(
      [
        { grp: 'wrap', input: '26\nabc XYZ 123!', expected: 'abc XYZ 123!' },
        { grp: 'big-k', input: '1000000000\nxyz ABC!', expected: caesar(1000000000, 'xyz ABC!') },
      ],
      19,
      (i) => {
        const k = (i + 1) * 7;
        const msg = `Test-${i}: Competitive Programming Zz Aa!`;
        return { grp: 'random', input: `${k}\n${msg}`, expected: caesar(k, msg) };
      }
    );
    list.push({
      slug: 'nat-caesar',
      title: 'Mật mã Caesar',
      level: 1,
      lessons: ['1.3'],
      tier: 'Luyện tập',
      topics: ['strings', 'string-search'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'lines',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho khóa dịch chuyển $k$ ($0 \\le k \\le 10^9$) và một dòng văn bản $S$. Hãy mã hóa $S$ bằng cách dịch mỗi chữ cái tiến thêm $k$ vị trí trong bảng chữ cái (quay vòng từ `z` về `a`, giữ nguyên hoa/thường). Các ký tự không phải chữ cái giữ nguyên.',
      input_spec_md: 'Dòng 1: số nguyên $k$.\\nDòng 2: chuỗi $S$ có thể chứa khoảng trắng và dấu câu ($1 \\le |S| \\le 10^5$).',
      output_spec_md: 'In ra chuỗi sau khi mã hóa.',
      notes_md: 'Sau khi đọc `k`, cần bỏ ký tự xuống dòng trước khi gọi `getline(cin, s)`.',
      samples,
      hints: hints4(
        'Giảm $k$ bằng `k %= 26`.',
        'Dùng `cin >> k; cin.ignore(); getline(cin, s);` để đọc trọn dòng thứ hai.',
        'Với chữ thường: `\'a\' + (c - \'a\' + k) % 26`. Tương tự với chữ hoa.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long k; cin >> k; cin.ignore();\n    string s; getline(cin, s);\n    k %= 26;\n    for (char &c : s) {\n        if (c >= 'a' && c <= 'z') c = 'a' + (c - 'a' + k) % 26;\n        else if (c >= 'A' && c <= 'Z') c = 'A' + (c - 'A' + k) % 26;\n    }\n    cout << s << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 18. nat-count-divisors (1.4)
  {
    const countDivs = (n: number) => {
      let c = 0;
      for (let i = 1; i * i <= n; i++) {
        if (n % i === 0) c += i * i === n ? 1 : 2;
      }
      return String(c);
    };
    const samples: NativeSample[] = [{ input: '12', output: '6' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1', expected: '1' },
        { grp: 'prime', input: '999999937', expected: '2' },
        { grp: 'highly-composite', input: '720720', expected: countDivs(720720) },
        { grp: 'large', input: '999966000289', expected: '3' }, // 999983^2 -> 3 divisors!
      ],
      19,
      (i) => {
        const vals = [36, 100, 1024, 999999999, 86400, 123456789, 2520, 5040, 16, 81, 625, 1000000000, 998244353, 999999000];
        const v = vals[i % vals.length];
        return { grp: 'random', input: `${v}`, expected: countDivs(v) };
      }
    );
    list.push({
      slug: 'nat-count-divisors',
      title: 'Đếm số ước của số lớn',
      level: 1,
      lessons: ['1.4'],
      tier: 'Khởi động',
      topics: ['divisors', 'number-theory'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho số nguyên dương $n$ ($1 \\le n \\le 10^{12}$). Hãy đếm số ước nguyên dương của $n$.',
      input_spec_md: 'Một số nguyên $n$.',
      output_spec_md: 'In ra số lượng ước nguyên dương của $n$.',
      notes_md: 'Mỗi ước $d \\le \\sqrt{n}$ cho cặp ước $(d, n/d)$. Đừng cộng đúp khi $d = n/d$.',
      samples,
      hints: hints4(
        'Chỉ duyệt $i$ từ $1$ đến $\\sqrt{n}$.',
        'Nếu $n \\% i == 0$: cộng 1 nếu $i \\times i == n$, ngược lại cộng 2.',
        'Dùng `long long` cho $n$ và biến chạy $i$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long n; cin >> n;\n    long long ans = 0;\n    for (long long i = 1; i * i <= n; i++) {\n        if (n % i == 0) ans += (i * i == n ? 1 : 2);\n    }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 19. nat-robot-walk (1.5)
  {
    const solveRobot = (s: string) => {
      let x = 0;
      let y = 0;
      for (const c of s) {
        if (c === 'L') x--;
        else if (c === 'R') x++;
        else if (c === 'U') y++;
        else if (c === 'D') y--;
      }
      return `${x} ${y}`;
    };
    const samples: NativeSample[] = [{ input: 'URRDL', output: '1 0' }];
    const extra = padTests(
      [
        { grp: 'loop', input: 'URDL'.repeat(25000), expected: '0 0' },
        { grp: 'max', input: 'R'.repeat(100000), expected: '100000 0' },
      ],
      19,
      (i) => {
        const rng = makeRng(1919 + i);
        const dirs = 'LRUD';
        const len = randInt(rng, 10, 500);
        let s = '';
        for (let k = 0; k < len; k++) s += dirs[randInt(rng, 0, 3)];
        return { grp: 'random', input: s, expected: solveRobot(s) };
      }
    );
    list.push({
      slug: 'nat-robot-walk',
      title: 'Hành trình của Robot',
      level: 1,
      lessons: ['1.5'],
      tier: 'Khởi động',
      topics: ['simulation', 'implementation'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Một robot xuất phát tại gốc tọa độ $(0, 0)$ và thực hiện chuỗi lệnh gồm các ký tự `L` (trái, $x-1$), `R` (phải, $x+1$), `U` (lên, $y+1$), `D` (xuống, $y-1$). In ra tọa độ cuối cùng của robot.',
      input_spec_md: 'Một chuỗi lệnh $S$ ($1 \\le |S| \\le 10^6$).',
      output_spec_md: 'In ra hai số nguyên $x$ và $y$.',
      notes_md: 'Độ dài chuỗi tới $10^6$ nên cần thuật toán $O(|S|)$.',
      samples,
      hints: hints4(
        'Khởi tạo `x = 0, y = 0`.',
        'Duyệt từng ký tự trong chuỗi lệnh và cập nhật `x` hoặc `y`.',
        'In `x << " " << y`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    string s; cin >> s;\n    int x = 0, y = 0;\n    for (char c : s) { if (c=='L') x--; else if (c=='R') x++; else if (c=='U') y++; else y--; }\n    cout << x << " " << y << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 20. nat-equal-row-sums (1.6) - custom checker!
  {
    const buildMatrix = (n: number) => {
      // Column j: if j even -> top-to-bottom (j*n + i + 1), if j odd -> bottom-to-top (j*n + (n - i))
      const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          mat[i][j] = j % 2 === 0 ? j * n + i + 1 : j * n + (n - i);
        }
      }
      if (n % 2 === 1 && n > 1) {
        // Check: for odd n, sum of each row in col-snake isn't identical! Wait: can odd n have equal row sums?
        // Sum of 1..n^2 is n^2(n^2+1)/2. Divided by n rows = n(n^2+1)/2, which IS an integer for odd n!
        // Standard construction for odd n: magic square or Latin-based:
        // Use Siamese magic square for odd n!
        const m2: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
        let r = 0;
        let c = Math.floor(n / 2);
        for (let num = 1; num <= n * n; num++) {
          m2[r][c] = num;
          const nr = (r - 1 + n) % n;
          const nc = (c + 1) % n;
          if (m2[nr][nc] !== 0) r = (r + 1) % n;
          else {
            r = nr;
            c = nc;
          }
        }
        return m2.map((rw) => rw.join(' ')).join('\n');
      }
      return mat.map((rw) => rw.join(' ')).join('\n');
    };
    const samples: NativeSample[] = [{ input: '2', output: '1 4\n2 3', explain: 'Cả hai hàng đều có tổng bằng $5$ và ma trận chứa đủ $1, 2, 3, 4$.' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1', expected: '1' },
        { grp: 'odd', input: '3', expected: buildMatrix(3) },
        { grp: 'even', input: '4', expected: buildMatrix(4) },
      ],
      19,
      (i) => {
        const n = 5 + i;
        return { grp: 'n-size', input: `${n}`, expected: buildMatrix(n) };
      }
    );
    list.push({
      slug: 'nat-equal-row-sums',
      title: 'Ma trận tổng hàng bằng nhau',
      level: 1,
      lessons: ['1.6'],
      tier: 'Luyện tập',
      topics: ['ad-hoc', 'constructive'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'custom',
      checker_params: { custom_id: 'equal_row_sums' },
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho số nguyên dương $n$ ($1 \\le n \\le 100$). Hãy xây dựng một ma trận vuông kích thước $n \\times n$ chứa mỗi số nguyên từ $1$ đến $n^2$ **đúng một lần**, sao cho tổng các phần tử trên mọi hàng đều bằng nhau. Nếu có nhiều đáp án hợp lệ, in ra một đáp án bất kỳ.',
      input_spec_md: 'Một số nguyên $n$ ($1 \\le n \\le 100$).',
      output_spec_md: 'In ra $n$ dòng, mỗi dòng gồm $n$ số nguyên dương.',
      notes_md: 'Bài sử dụng trình chấm tùy biến (custom checker): chấp nhận mọi hoán vị ma trận hợp lệ thỏa tổng các hàng bằng nhau.',
      samples,
      hints: hints4(
        'Tổng các số từ $1$ đến $n^2$ là $\\frac{n^2(n^2+1)}{2}$, chia cho $n$ hàng luôn chia hết với mọi $n \\ge 1$!',
        'Khi $n$ chẵn, có thể điền các số theo từng cột ziczac (cột chẵn từ trên xuống, cột lẻ từ dưới lên).',
        'Khi $n$ lẻ, dùng cách dựng Ma phương (Siamese method) hoặc tách cột đầu tiên thành bộ 3 cân bằng.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<vector<int>> a(n, vector<int>(n, 0));\n    if (n % 2 == 0) {\n        for (int j = 0; j < n; j++)\n            for (int i = 0; i < n; i++)\n                a[i][j] = (j % 2 == 0) ? j * n + i + 1 : j * n + (n - i);\n    } else {\n        int r = 0, c = n / 2;\n        for (int k = 1; k <= n * n; k++) {\n            a[r][c] = k;\n            int nr = (r - 1 + n) % n, nc = (c + 1) % n;\n            if (a[nr][nc]) r = (r + 1) % n;\n            else { r = nr; c = nc; }\n        }\n    }\n    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) cout << a[i][j] << (j+1==n?"\\n":" ");\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 21. nat-max-activities (1.7)
  {
    const solveAct = (segs: [number, number][]) => {
      const sorted = [...segs].sort((a, b) => a[1] - b[1]);
      let cnt = 0;
      let last = -1e18;
      for (const [s, e] of sorted) {
        if (s >= last) {
          cnt++;
          last = e;
        }
      }
      return String(cnt);
    };
    const samples: NativeSample[] = [{ input: '3\n1 3\n2 5\n3 6', output: '2', explain: 'Chọn [1, 3) và [3, 6) vì đầu mút 3 trùng nhau vẫn hợp lệ.' }];
    const extra = padTests(
      [{ grp: 'touching', input: '4\n1 2\n2 3\n3 4\n1 4', expected: '3' }],
      19,
      (i) => {
        const rng = makeRng(2121 + i);
        const n = i === 17 ? 50000 : randInt(rng, 3, 200);
        const segs: [number, number][] = Array.from({ length: n }, () => {
          const l = randInt(rng, 0, 10000);
          return [l, l + randInt(rng, 1, 500)];
        });
        return { grp: 'random', input: `${n}\n${segs.map((x) => `${x[0]} ${x[1]}`).join('\n')}`, expected: solveAct(segs) };
      }
    );
    list.push({
      slug: 'nat-max-activities',
      title: 'Chọn nhiều hoạt động nhất',
      level: 1,
      lessons: ['1.7'],
      tier: 'Khởi động',
      topics: ['greedy', 'interval-scheduling'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Có $n$ hoạt động, hoạt động thứ $i$ diễn ra trong nửa khoảng $[l_i, r_i)$. Hai hoạt động không giao nhau nếu một hoạt động kết thúc tại $r_i \\le l_j$ (đầu mút trùng nhau được tính là hợp lệ). Chọn nhiều hoạt động nhất có thể.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$).\\n$n$ dòng tiếp theo chứa $l_i, r_i$ ($0 \\le l_i < r_i \\le 10^9$).',
      output_spec_md: 'In ra số lượng hoạt động tối đa có thể chọn.',
      notes_md: 'Sắp xếp tăng dần theo thời điểm kết thúc $r_i$.',
      samples,
      hints: hints4(
        'Thử sắp xếp các đoạn theo một tiêu chí đơn giản.',
        'Luôn ưu tiên chọn hoạt động kết thúc sớm nhất.',
        'So sánh `l_i >= last_end` để kiểm tra không giao nhau.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    vector<pair<int,int>> a(n);\n    for (auto &x : a) cin >> x.second >> x.first;\n    sort(a.begin(), a.end());\n    int cnt = 0, last = -1;\n    for (auto [r, l] : a) if (l >= last) { cnt++; last = r; }\n    cout << cnt << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 22. nat-pair-sum-sorted (1.8)
  {
    const solvePairSorted = (a: number[], S: number) => {
      let l = 0;
      let r = a.length - 1;
      let ans = 0n;
      while (l < r) {
        const sum = a[l] + a[r];
        if (sum < S) l++;
        else if (sum > S) r--;
        else {
          if (a[l] === a[r]) {
            const len = BigInt(r - l + 1);
            ans += (len * (len - 1n)) / 2n;
            break;
          } else {
            let cl = 1n;
            let cr = 1n;
            while (l + 1 < r && a[l + 1] === a[l]) {
              l++;
              cl++;
            }
            while (r - 1 > l && a[r - 1] === a[r]) {
              r--;
              cr++;
            }
            ans += cl * cr;
            l++;
            r--;
          }
        }
      }
      return ans.toString();
    };
    const samples: NativeSample[] = [{ input: '5 6\n1 3 3 3 5', output: '4' }];
    const allEqual = Array(50000).fill(5);
    const extra = padTests(
      [
        { grp: 'overflow', input: `${allEqual.length} 10\n${allEqual.join(' ')}`, expected: solvePairSorted(allEqual, 10) },
      ],
      19,
      (i) => {
        const rng = makeRng(2222 + i);
        const n = randInt(rng, 5, 200);
        const a = Array.from({ length: n }, () => randInt(rng, -20, 20)).sort((x, y) => x - y);
        const S = a[0] + a[n - 1];
        return { grp: 'random', input: `${n} ${S}\n${a.join(' ')}`, expected: solvePairSorted(a, S) };
      }
    );
    list.push({
      slug: 'nat-pair-sum-sorted',
      title: 'Đếm cặp có tổng S trên dãy đã sắp xếp',
      level: 1,
      lessons: ['1.8'],
      tier: 'Luyện tập',
      topics: ['two-pointers'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $a_1 \\le a_2 \\le \\dots \\le a_n$ đã sắp xếp không giảm và số nguyên $S$. Đếm số cặp chỉ số $(i, j)$ với $1 \\le i < j \\le n$ sao cho $a_i + a_j = S$.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$) và $S$ ($|S| \\le 2 \\cdot 10^9$).\\nDòng 2: $n$ số nguyên không giảm ($|a_i| \\le 10^9$).',
      output_spec_md: 'In ra số cặp thỏa mãn (dùng `long long`, đáp án có thể tới $\\binom{n}{2} \\approx 5 \\cdot 10^9$).',
      notes_md: 'Chú ý xử lý các nhóm phần tử có giá trị bằng nhau.',
      samples,
      hints: hints4(
        'Dùng hai con trỏ $l = 0, r = n - 1$.',
        'Khi $a[l] + a[r] == S$: nếu $a[l] == a[r]$ thì cộng $\\frac{k(k-1)}{2}$ với $k = r - l + 1$ rồi dừng.',
        'Nếu $a[l] \\ne a[r]$, đếm số phần tử bằng $a[l]$ ở bên trái và bằng $a[r]$ ở bên phải rồi nhân lại.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; long long S; cin >> n >> S;\n    vector<long long> a(n);\n    for (auto &x : a) cin >> x;\n    int l = 0, r = n - 1; long long ans = 0;\n    while (l < r) {\n        long long sum = a[l] + a[r];\n        if (sum < S) l++;\n        else if (sum > S) r--;\n        else if (a[l] == a[r]) { long long k = r - l + 1; ans += k * (k - 1) / 2; break; }\n        else {\n            long long cl = 1, cr = 1;\n            while (l + 1 < r && a[l+1] == a[l]) { l++; cl++; }\n            while (r - 1 > l && a[r-1] == a[r]) { r--; cr++; }\n            ans += cl * cr; l++; r--;\n        }\n    }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 23. nat-range-sum-queries (1.9)
  {
    const solveRsq = (a: number[], queries: [number, number][]) => {
      const pre = [0n];
      for (const x of a) pre.push(pre[pre.length - 1] + BigInt(x));
      return queries.map(([l, r]) => (pre[r] - pre[l - 1]).toString()).join('\n');
    };
    const samples: NativeSample[] = [{ input: '5 3\n1 2 3 4 5\n1 3\n2 5\n1 5', output: '6\n14\n15' }];
    const bigA = Array(50000).fill(1000000000);
    const extra = padTests(
      [{ grp: 'overflow', input: `${bigA.length} 2\n${bigA.join(' ')}\n1 50000\n25000 50000`, expected: solveRsq(bigA, [[1, 50000], [25000, 50000]]) }],
      19,
      (i) => {
        const rng = makeRng(2323 + i);
        const n = i === 16 ? 20000 : randInt(rng, 5, 200);
        const q = i === 16 ? 20000 : randInt(rng, 3, 50);
        const a = Array.from({ length: n }, () => randInt(rng, -1000000000, 1000000000));
        const qs: [number, number][] = Array.from({ length: q }, () => {
          const l = randInt(rng, 1, n);
          const r = randInt(rng, l, n);
          return [l, r];
        });
        return { grp: 'random', input: `${n} ${q}\n${a.join(' ')}\n${qs.map((x) => `${x[0]} ${x[1]}`).join('\n')}`, expected: solveRsq(a, qs) };
      }
    );
    list.push({
      slug: 'nat-range-sum-queries',
      title: 'Tổng đoạn',
      level: 1,
      lessons: ['1.9'],
      tier: 'Khởi động',
      topics: ['prefix-sum'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên và $q$ truy vấn. Mỗi truy vấn gồm hai chỉ số $l, r$ ($1 \\le l \\le r \\le n$), yêu cầu tính tổng các phần tử $a_l + a_{l+1} + \\dots + a_r$.',
      input_spec_md: 'Dòng 1: $n, q$ ($1 \\le n, q \\le 2 \\cdot 10^5$).\\nDòng 2: $n$ số nguyên ($|a_i| \\le 10^9$).\\n$q$ dòng tiếp theo mỗi dòng chứa $l, r$.',
      output_spec_md: 'Với mỗi truy vấn, in ra tổng tìm được trên một dòng.',
      notes_md: 'Tổng đoạn có thể vượt $2 \\cdot 10^{14}$, bắt buộc dùng `long long`.',
      samples,
      hints: hints4(
        'Duyệt lại đoạn $[l, r]$ mỗi truy vấn mất $O(n \\cdot q)$ -> TLE.',
        'Dựng mảng cộng dồn `pre[i] = pre[i-1] + a[i]` với `pre[0] = 0`.',
        'Đáp án của mỗi truy vấn là `pre[r] - pre[l-1]` trong $O(1)$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n, q; cin >> n >> q;\n    vector<long long> pre(n + 1, 0);\n    for (int i = 1; i <= n; i++) { long long x; cin >> x; pre[i] = pre[i-1] + x; }\n    while (q--) { int l, r; cin >> l >> r; cout << pre[r] - pre[l-1] << "\\n"; }\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 24. nat-multiset-ops (2.1)
  {
    const solveMultiset = (ops: [string, number?][]) => {
      const counts = new Map<number, number>();
      const out: string[] = [];
      for (const [op, val] of ops) {
        if (op === 'ADD' && val !== undefined) counts.set(val, (counts.get(val) || 0) + 1);
        else if (op === 'DEL' && val !== undefined) {
          const c = counts.get(val) || 0;
          if (c > 1) counts.set(val, c - 1);
          else if (c === 1) counts.delete(val);
        } else if (op === 'MIN') {
          if (counts.size === 0) out.push('EMPTY');
          else out.push(String(Math.min(...counts.keys())));
        } else if (op === 'MAX') {
          if (counts.size === 0) out.push('EMPTY');
          else out.push(String(Math.max(...counts.keys())));
        }
      }
      return out.join('\n');
    };
    const samples: NativeSample[] = [{ input: '6\nADD 5\nADD 2\nADD 5\nDEL 5\nMIN\nMAX', output: '2\n5' }];
    const extra = padTests(
      [{ grp: 'del-missing', input: '5\nDEL 10\nMIN\nADD 3\nDEL 3\nMAX', expected: 'EMPTY\nEMPTY' }],
      19,
      (i) => {
        const rng = makeRng(2424 + i);
        const q = 30 + i * 5;
        const ops: [string, number?][] = [];
        for (let k = 0; k < q; k++) {
          const t = randInt(rng, 0, 3);
          if (t === 0) ops.push(['ADD', randInt(rng, 1, 20)]);
          else if (t === 1) ops.push(['DEL', randInt(rng, 1, 20)]);
          else if (t === 2) ops.push(['MIN']);
          else ops.push(['MAX']);
        }
        ops.push(['MIN']);
        return {
          grp: 'random',
          input: `${ops.length}\n${ops.map((o) => (o[1] !== undefined ? `${o[0]} ${o[1]}` : o[0])).join('\n')}`,
          expected: solveMultiset(ops),
        };
      }
    );
    list.push({
      slug: 'nat-multiset-ops',
      title: 'Thao tác trên Multiset',
      level: 2,
      lessons: ['2.1'],
      tier: 'Khởi động',
      topics: ['stl', 'set-map', 'data-structures'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Thực hiện $q$ truy vấn trên một multiset rỗng ban đầu:\n- `ADD x`: thêm 1 bản sao số nguyên $x$ vào tập.\n- `DEL x`: xóa **đúng 1** bản sao của $x$ nếu có (nếu không có thì bỏ qua).\n- `MIN`: in giá trị nhỏ nhất (hoặc `EMPTY` nếu rỗng).\n- `MAX`: in giá trị lớn nhất (hoặc `EMPTY` nếu rỗng).',
      input_spec_md: 'Dòng 1: $q$ ($1 \\le q \\le 10^5$).\\n$q$ dòng tiếp theo là một trong bốn lệnh trên.',
      output_spec_md: 'In kết quả cho mỗi lệnh `MIN` / `MAX`.',
      notes_md: 'Lưu ý: `ms.erase(x)` sẽ xóa HẾT mọi bản sao của $x$, phải dùng `ms.erase(ms.find(x))`!',
      samples,
      hints: hints4(
        'Sử dụng `std::multiset<int> ms`.',
        'Khi `DEL x`, tìm `auto it = ms.find(x); if (it != ms.end()) ms.erase(it);`.',
        'Phần tử nhỏ nhất là `*ms.begin()`, lớn nhất là `*ms.rbegin()`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int q; cin >> q;\n    multiset<int> ms;\n    while (q--) {\n        string op; cin >> op;\n        if (op == "ADD") { int x; cin >> x; ms.insert(x); }\n        else if (op == "DEL") { int x; cin >> x; auto it = ms.find(x); if (it != ms.end()) ms.erase(it); }\n        else if (op == "MIN") cout << (ms.empty() ? "EMPTY" : to_string(*ms.begin())) << "\\n";\n        else cout << (ms.empty() ? "EMPTY" : to_string(*ms.rbegin())) << "\\n";\n    }\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 25. nat-rect-sum-2d (2.2)
  {
    const solve2d = (g: number[][], qs: [number, number, number, number][]) => {
      const n = g.length;
      const m = g[0].length;
      const pre: bigint[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0n));
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + BigInt(g[i - 1][j - 1]);
        }
      }
      return qs.map(([x1, y1, x2, y2]) => (pre[x2][y2] - pre[x1 - 1][y2] - pre[x2][y1 - 1] + pre[x1 - 1][y1 - 1]).toString()).join('\n');
    };
    const samples: NativeSample[] = [{ input: '2 3 2\n1 2 3\n4 5 6\n1 1 2 2\n1 2 2 3', output: '12\n16' }];
    const extra = padTests(
      [
        { grp: 'overflow', input: '2 2 1\n1000000000 1000000000\n1000000000 1000000000\n1 1 2 2', expected: '4000000000' },
        { grp: 'edge', input: '1 1 1\n-1000000000\n1 1 1 1', expected: '-1000000000' },
      ],
      19,
      (i) => {
        const rng = makeRng(2525 + i);
        const isStress = i >= 17;
        const n = isStress ? 120 : 5 + (i % 20);
        const m = isStress ? 120 : 5 + ((i * 3) % 20);
        const qCount = isStress ? 1500 : 25;
        const g = Array.from({ length: n }, () => Array.from({ length: m }, () => randInt(rng, -1000000, 1000000)));
        const qs: [number, number, number, number][] = Array.from({ length: qCount }, () => {
          const x1 = randInt(rng, 1, n);
          const x2 = randInt(rng, x1, n);
          const y1 = randInt(rng, 1, m);
          const y2 = randInt(rng, y1, m);
          return [x1, y1, x2, y2];
        });
        return {
          grp: isStress ? 'stress' : 'random',
          input: `${n} ${m} ${qs.length}\n${g.map((r) => r.join(' ')).join('\n')}\n${qs.map((q) => q.join(' ')).join('\n')}`,
          expected: solve2d(g, qs),
        };
      }
    );
    list.push({
      slug: 'nat-rect-sum-2d',
      title: 'Tổng hình chữ nhật trên lưới 2D',
      level: 2,
      lessons: ['2.2'],
      tier: 'Khởi động',
      topics: ['prefix-sum-2d', 'prefix-sum'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho bảng kích thước $n \\times m$ và $q$ truy vấn. Mỗi truy vấn cho góc trên trái $(x_1, y_1)$ và góc dưới phải $(x_2, y_2)$, tính tổng các số nằm trong hình chữ nhật đó.',
      input_spec_md: 'Dòng 1: $n, m, q$ ($1 \\le n, m \\le 1000, 1 \\le q \\le 10^5$).\\n$n$ dòng tiếp theo mỗi dòng $m$ số nguyên.\\n$q$ dòng tiếp theo chứa $x_1, y_1, x_2, y_2$.',
      output_spec_md: 'In ra tổng từng truy vấn.',
      notes_md: 'Dùng Prefix Sum 2D để trả lời mỗi truy vấn trong $O(1)$.',
      samples,
      hints: hints4(
        'Xây dựng bảng cộng dồn `pre[i][j]` là tổng hình chữ nhật $(1,1)$ đến $(i,j)$.',
        'Công thức dựng: `pre[i][j] = pre[i-1][j] + pre[i][j-1] - pre[i-1][j-1] + a[i][j]`.',
        'Công thức truy vấn: `pre[x2][y2] - pre[x1-1][y2] - pre[x2][y1-1] + pre[x1-1][y1-1]`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n, m, q; cin >> n >> m >> q;\n    vector<vector<long long>> p(n+1, vector<long long>(m+1, 0));\n    for (int i=1;i<=n;i++) for (int j=1;j<=m;j++) { long long x; cin >> x; p[i][j] = p[i-1][j]+p[i][j-1]-p[i-1][j-1]+x; }\n    while (q--) { int x1,y1,x2,y2; cin>>x1>>y1>>x2>>y2; cout << p[x2][y2]-p[x1-1][y2]-p[x2][y1-1]+p[x1-1][y1-1] << "\\n"; }\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 26. nat-window-k-distinct (2.3)
  {
    const solveKDistinct = (a: number[], k: number) => {
      const cnt = new Map<number, number>();
      let l = 0;
      let best = 0;
      for (let r = 0; r < a.length; r++) {
        cnt.set(a[r], (cnt.get(a[r]) || 0) + 1);
        while (cnt.size > k) {
          const c = cnt.get(a[l])!;
          if (c === 1) cnt.delete(a[l]);
          else cnt.set(a[l], c - 1);
          l++;
        }
        if (r - l + 1 > best) best = r - l + 1;
      }
      return String(best);
    };
    const samples: NativeSample[] = [{ input: '6 2\n1 2 1 3 2 2', output: '3' }];
    const extra = padTests(
      [
        { grp: 'k1', input: '5 1\n4 4 4 2 2', expected: '3' },
        { grp: 'kbig', input: '4 10\n1 2 3 4', expected: '4' },
      ],
      19,
      (i) => {
        const rng = makeRng(2626 + i);
        const n = i === 16 ? 30000 : randInt(rng, 5, 200);
        const k = randInt(rng, 1, 10);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 20));
        return { grp: 'random', input: `${n} ${k}\n${a.join(' ')}`, expected: solveKDistinct(a, k) };
      }
    );
    list.push({
      slug: 'nat-window-k-distinct',
      title: 'Đoạn dài nhất có tối đa K giá trị phân biệt',
      level: 2,
      lessons: ['2.3'],
      tier: 'Luyện tập',
      topics: ['two-pointers', 'sliding-window'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên và số nguyên dương $k$. Tìm độ dài đoạn con liên tiếp dài nhất có chứa **tối đa $k$ giá trị khác nhau**.',
      input_spec_md: 'Dòng 1: $n, k$ ($1 \\le k \\le n \\le 2 \\cdot 10^5$).\\nDòng 2: $n$ số nguyên.',
      output_spec_md: 'In ra độ dài lớn nhất tìm được.',
      notes_md: 'Sử dụng cửa sổ trượt $[l, r]$ kết hợp bảng đếm tần số `map` để đạt $O(n \\log n)$.',
      samples,
      hints: hints4(
        'Mở rộng đầu phải `r` qua từng phần tử.',
        'Khi số giá trị khác nhau trong cửa sổ $> k$, tăng `l` và giảm tần số `a[l]` cho đến khi hợp lệ.',
        'Cập nhật đáp án `max(ans, r - l + 1)`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n, k; cin >> n >> k;\n    vector<int> a(n); for (int &x : a) cin >> x;\n    map<int, int> cnt; int l = 0, ans = 0;\n    for (int r = 0; r < n; r++) {\n        cnt[a[r]]++;\n        while ((int)cnt.size() > k) { if (--cnt[a[l]] == 0) cnt.erase(a[l]); l++; }\n        ans = max(ans, r - l + 1);\n    }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 27. nat-cut-ropes (2.4)
  {
    const solveRopes = (a: number[], k: bigint) => {
      let lo = 0n;
      let hi = BigInt(Math.max(...a));
      while (lo < hi) {
        const mid = lo + (hi - lo + 1n) / 2n;
        let cnt = 0n;
        for (const x of a) cnt += BigInt(x) / mid;
        if (cnt >= k) lo = mid;
        else hi = mid - 1n;
      }
      return lo.toString();
    };
    const samples: NativeSample[] = [{ input: '4 11\n802 743 457 539', output: '200' }];
    const extra = padTests(
      [
        { grp: 'zero', input: '3 100\n1 2 3', expected: '0' },
        { grp: 'big', input: '2 3\n1000000000 1000000000', expected: '500000000' },
      ],
      19,
      (i) => {
        const rng = makeRng(2727 + i);
        const n = randInt(rng, 3, 100);
        const k = BigInt(randInt(rng, 1, 1000));
        const a = Array.from({ length: n }, () => randInt(rng, 10, 100000));
        return { grp: 'random', input: `${n} ${k}\n${a.join(' ')}`, expected: solveRopes(a, k) };
      }
    );
    list.push({
      slug: 'nat-cut-ropes',
      title: 'Cắt dây bằng nhau',
      level: 2,
      lessons: ['2.4'],
      tier: 'Luyện tập',
      topics: ['binary-search', 'binary-search-answer'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Có $n$ sợi dây có độ dài nguyên $a_1, \\dots, a_n$. Bạn muốn cắt chúng thành ít nhất $k$ đoạn có cùng độ dài nguyên dương $L$ lớn nhất có thể. Nếu không thể cắt được (ngay cả với $L = 1$), in ra `0`.',
      input_spec_md: 'Dòng 1: $n, k$ ($1 \\le n \\le 10^5, 1 \\le k \\le 10^{14}$).\\nDòng 2: $n$ số nguyên dương ($a_i \\le 10^9$).',
      output_spec_md: 'In ra độ dài nguyên lớn nhất $L$.',
      notes_md: 'Hàm `check(L)`: tổng $\\sum \\lfloor a_i / L \\rfloor \\ge k$ có tính đơn điệu giảm theo $L$, phù hợp tìm kiếm nhị phân trên đáp án.',
      samples,
      hints: hints4(
        'Nếu cắt được độ dài $L$ thì mọi độ dài $< L$ đều cắt được.',
        'Tìm kiếm nhị phân $L$ trong khoảng $[0, 10^9]$.',
        'Khi cập nhật tìm giá trị lớn nhất: `mid = lo + (hi - lo + 1) / 2`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; long long k; cin >> n >> k;\n    vector<long long> a(n); for (auto &x : a) cin >> x;\n    long long lo = 0, hi = 1e9;\n    while (lo < hi) {\n        long long mid = lo + (hi - lo + 1) / 2, cnt = 0;\n        for (auto x : a) cnt += x / mid;\n        if (cnt >= k) lo = mid; else hi = mid - 1;\n    }\n    cout << lo << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 28. nat-min-rooms (2.5)
  {
    const solveRooms = (segs: [number, number][]) => {
      const ev: [number, number][] = [];
      for (const [l, r] of segs) {
        ev.push([l, 1]);
        ev.push([r, -1]);
      }
      ev.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
      let cur = 0;
      let mx = 0;
      for (const [, d] of ev) {
        cur += d;
        if (cur > mx) mx = cur;
      }
      return String(mx);
    };
    const samples: NativeSample[] = [{ input: '3\n1 3\n2 4\n3 5', output: '2' }];
    const extra = padTests(
      [{ grp: 'sequential', input: '3\n1 2\n2 3\n3 4', expected: '1' }],
      19,
      (i) => {
        const rng = makeRng(2828 + i);
        const n = i === 17 ? 20000 : randInt(rng, 3, 150);
        const segs: [number, number][] = Array.from({ length: n }, () => {
          const l = randInt(rng, 0, 5000);
          return [l, l + randInt(rng, 1, 500)];
        });
        return { grp: 'random', input: `${n}\n${segs.map((x) => `${x[0]} ${x[1]}`).join('\n')}`, expected: solveRooms(segs) };
      }
    );
    list.push({
      slug: 'nat-min-rooms',
      title: 'Số phòng họp tối thiểu',
      level: 2,
      lessons: ['2.5'],
      tier: 'Luyện tập',
      topics: ['greedy', 'scheduling', 'interval-scheduling'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Có $n$ cuộc họp diễn ra trong các nửa khoảng $[l_i, r_i)$. Cuộc họp kết thúc tại $t$ có thể nhường phòng ngay cho cuộc họp bắt đầu tại $t$. Tìm số phòng tối thiểu cần thiết để tổ chức tất cả các cuộc họp.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$).\\n$n$ dòng tiếp theo chứa $l_i, r_i$.',
      output_spec_md: 'In ra số phòng ít nhất cần dùng.',
      notes_md: 'Tại cùng một mốc thời gian, xử lý sự kiện trả phòng (`-1`) trước sự kiện nhận phòng (`+1`).',
      samples,
      hints: hints4(
        'Mỗi cuộc họp tạo 2 sự kiện: `+1` tại `l_i` và `-1` tại `r_i`.',
        'Sắp xếp các sự kiện theo thời gian tăng dần; bằng thời gian thì `-1` đứng trước `+1`.',
        'Đáp án là giá trị lớn nhất của tổng tiền tố các sự kiện.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin >> n;\n    vector<pair<int,int>> ev;\n    for (int i=0;i<n;i++) { int l, r; cin >> l >> r; ev.push_back({l, 1}); ev.push_back({r, -1}); }\n    sort(ev.begin(), ev.end());\n    int cur = 0, ans = 0;\n    for (auto [t, d] : ev) { cur += d; ans = max(ans, cur); }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 29. nat-count-pair-sum (2.6) - anti unordered_map
  {
    const solveCountPairs = (a: number[], S: number) => {
      const m = new Map<number, number>();
      let ans = 0n;
      for (const x of a) {
        ans += BigInt(m.get(S - x) || 0);
        m.set(x, (m.get(x) || 0) + 1);
      }
      return ans.toString();
    };
    const samples: NativeSample[] = [{ input: '5 6\n1 5 3 3 3', output: '4' }];
    // Anti unordered_map collision test (multiples of 107897) + 64-bit answer overflow (> 2^31 - 1)
    const antiHash = Array.from({ length: 20000 }, (_, i) => (i % 100) * 107897);
    const allEqualBig = Array.from({ length: 70000 }, () => 1000000000);
    const extra = padTests(
      [
        { grp: 'anti-hash', input: `${antiHash.length} ${107897 * 50}\n${antiHash.join(' ')}`, expected: solveCountPairs(antiHash, 107897 * 50) },
        { grp: 'overflow', input: `${allEqualBig.length} 2000000000\n${allEqualBig.join(' ')}`, expected: '2449965000' },
      ],
      19,
      (i) => {
        const rng = makeRng(2929 + i);
        const n = randInt(rng, 5, 400);
        const a = Array.from({ length: n }, () => randInt(rng, -1000000000, 1000000000));
        const pick = a[0] + a[n - 1];
        const S = i % 2 === 0 ? pick : randInt(rng, -50, 50);
        return { grp: 'random', input: `${n} ${S}\n${a.join(' ')}`, expected: solveCountPairs(a, S) };
      }
    );
    list.push({
      slug: 'nat-count-pair-sum',
      title: 'Đếm cặp tổng S bằng bảng băm',
      level: 2,
      lessons: ['2.6'],
      tier: 'Khởi động',
      topics: ['counting', 'hash-map', 'data-structures'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên **chưa sắp xếp** và số nguyên $S$. Đếm số cặp chỉ số $i < j$ sao cho $a_i + a_j = S$.',
      input_spec_md: 'Dòng 1: $n, S$ ($1 \\le n \\le 2 \\cdot 10^5$).\\nDòng 2: $n$ số nguyên ($|a_i| \\le 10^9$).',
      output_spec_md: 'In ra số cặp thỏa mãn.',
      notes_md: 'Nếu dùng `unordered_map`, hãy gắn thêm `custom_hash` để không bị TLE trước các test bội số bucket, hoặc dùng `std::map` / sắp xếp.',
      samples,
      hints: hints4(
        'Khi đang ở vị trí `j`, ta cần biết trước đó đã xuất hiện bao nhiêu phần tử bằng `S - a[j]`.',
        'Cộng `cnt[S - x]` vào đáp án rồi mới tăng `cnt[x]++`.',
        'Dùng `long long` cho biến đáp án.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; long long S; cin >> n >> S;\n    map<long long, long long> cnt;\n    long long ans = 0;\n    for (int i = 0; i < n; i++) { long long x; cin >> x; ans += cnt[S - x]; cnt[x]++; }\n    cout << ans << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 30. nat-count-primes (2.7)
  {
    const countPrimesUpTo = (n: number) => {
      if (n < 2) return '0';
      const isP = new Uint8Array(n + 1).fill(1);
      isP[0] = 0;
      isP[1] = 0;
      for (let i = 2; i * i <= n; i++) {
        if (isP[i]) for (let j = i * i; j <= n; j += i) isP[j] = 0;
      }
      let c = 0;
      for (let i = 2; i <= n; i++) if (isP[i]) c++;
      return String(c);
    };
    const samples: NativeSample[] = [{ input: '10', output: '4' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1', expected: '0' },
        { grp: 'edge', input: '2', expected: '1' },
        { grp: 'max', input: '1000000', expected: countPrimesUpTo(1000000) },
      ],
      19,
      (i) => {
        const vals = [3, 5, 17, 100, 1000, 10000, 50000, 123456, 500000, 999983, 250000, 777777, 888888, 150000, 300000, 400000];
        const v = vals[i % vals.length];
        return { grp: 'random', input: `${v}`, expected: countPrimesUpTo(v) };
      }
    );
    list.push({
      slug: 'nat-count-primes',
      title: 'Đếm số nguyên tố bằng Sàng Eratosthenes',
      level: 2,
      lessons: ['2.7'],
      tier: 'Luyện tập',
      topics: ['sieve', 'number-theory'],
      time_limit_ms: 2000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho số nguyên dương $n$ ($1 \\le n \\le 10^6$). Đếm xem có bao nhiêu số nguyên tố không vượt quá $n$.',
      input_spec_md: 'Một số nguyên $n$.',
      output_spec_md: 'In ra số lượng số nguyên tố $\\le n$.',
      notes_md: 'Dùng Sàng Eratosthenes trong $O(n \\log \\log n)$.',
      samples,
      hints: hints4(
        'Đánh dấu mảng `is_prime` kích thước `n + 1` ban đầu toàn `true`.',
        'Gán `is_prime[0] = is_prime[1] = false`.',
        'Duyệt `i` từ 2 tới `sqrt(n)`, nếu `is_prime[i]` thì đánh dấu mọi bội từ `i * i` trở đi.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<bool> p(n + 1, true);\n    p[0] = false; if (n >= 1) p[1] = false;\n    for (long long i = 2; i * i <= n; i++) if (p[i]) for (long long j = i * i; j <= n; j += i) p[j] = false;\n    int cnt = 0; for (int i = 2; i <= n; i++) if (p[i]) cnt++;\n    cout << cnt << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 31. nat-fast-power (2.8)
  {
    const samples: NativeSample[] = [{ input: '2 10 1000', output: '24' }];
    const extra = padTests(
      [
        { grp: 'm1', input: '5 0 1', expected: '0' },
        { grp: 'a0', input: '0 5 1000000007', expected: '0' },
        { grp: 'big', input: '123456789 1000000000000000000 1000000007', expected: modPow(123456789n, 1000000000000000000n, 1000000007n).toString() },
      ],
      19,
      (i) => {
        const rng = makeRng(3131 + i);
        const a = BigInt(randInt(rng, 0, 1000000000));
        const b = BigInt(randInt(rng, 0, 1000000000)) * BigInt(randInt(rng, 1, 1000000000));
        const m = BigInt(randInt(rng, 1, 1000000007));
        return { grp: 'random', input: `${a} ${b} ${m}`, expected: modPow(a, b, m).toString() };
      }
    );
    list.push({
      slug: 'nat-fast-power',
      title: 'Lũy thừa nhanh modulo',
      level: 2,
      lessons: ['2.8'],
      tier: 'Khởi động',
      topics: ['fast-power', 'modpow', 'number-theory'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho ba số nguyên $a, b, m$ ($0 \\le a \\le 10^9, 0 \\le b \\le 10^{18}, 1 \\le m \\le 10^9 + 7$). Tính $a^b \\bmod m$. Quy ước $0^0 = 1$.',
      input_spec_md: 'Một dòng chứa $a, b, m$.',
      output_spec_md: 'In ra $a^b \\bmod m$.',
      notes_md: 'Chú ý trường hợp $m = 1$: kết quả luôn phải là $0$.',
      samples,
      hints: hints4(
        'Phân tích số mũ $b$ theo nhị phân: khi bit cuối của $b$ là 1, nhân kết quả với $a$.',
        'Mỗi bước bình phương $a = (a \\cdot a) \\bmod m$ và dịch $b \\gg= 1$.',
        'Khởi tạo `res = 1 % m` để đúng cả khi $m = 1$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    long long a, b, m; cin >> a >> b >> m;\n    long long r = 1 % m; a %= m;\n    while (b > 0) { if (b & 1) r = r * a % m; a = a * a % m; b >>= 1; }\n    cout << r << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 32. nat-binomial-queries (2.9)
  {
    const MOD = 1000000007n;
    const MAXN = 50000;
    const fact: bigint[] = [1n];
    for (let i = 1; i <= MAXN; i++) fact.push((fact[i - 1] * BigInt(i)) % MOD);
    const inv: bigint[] = Array(MAXN + 1).fill(1n);
    inv[MAXN] = modPow(fact[MAXN], MOD - 2n, MOD);
    for (let i = MAXN; i >= 1; i--) inv[i - 1] = (inv[i] * BigInt(i)) % MOD;
    const nCr = (n: number, k: number) => {
      if (k < 0 || k > n) return '0';
      return (((fact[n] * inv[k]) % MOD) * inv[n - k] % MOD).toString();
    };
    const samples: NativeSample[] = [{ input: '3\n5 2\n4 0\n3 5', output: '10\n1\n0' }];
    const extra = padTests(
      [{ grp: 'edge', input: '3\n50000 25000\n50000 50000\n0 0', expected: `${nCr(50000, 25000)}\n1\n1` }],
      19,
      (i) => {
        const rng = makeRng(3232 + i);
        const qs = Array.from({ length: 20 }, () => {
          const n = randInt(rng, 1, MAXN);
          const k = randInt(rng, 0, n + 5);
          return [n, k];
        });
        return {
          grp: 'random',
          input: `${qs.length}\n${qs.map(([n, k]) => `${n} ${k}`).join('\n')}`,
          expected: qs.map(([n, k]) => nCr(n, k)).join('\n'),
        };
      }
    );
    list.push({
      slug: 'nat-binomial-queries',
      title: 'Truy vấn tổ hợp modulo',
      level: 2,
      lessons: ['2.9'],
      tier: 'Luyện tập',
      topics: ['binomial-mod', 'modular-inverse', 'combinatorics'],
      time_limit_ms: 2000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho $q$ truy vấn, mỗi truy vấn gồm hai số nguyên $n, k$ ($0 \\le n, k \\le 5 \\cdot 10^4$). Tính $\\binom{n}{k} \\bmod (10^9 + 7)$. Nếu $k > n$, quy ước kết quả bằng $0$.',
      input_spec_md: 'Dòng 1: $q$ ($1 \\le q \\le 10^5$).\\n$q$ dòng tiếp theo chứa $n, k$.',
      output_spec_md: 'In kết quả từng truy vấn trên một dòng.',
      notes_md: 'Tiền xử lý mảng giai thừa và nghịch đảo modulo trong $O(N)$ trước khi trả lời truy vấn trong $O(1)$.',
      samples,
      hints: hints4(
        'Dùng định lý nhỏ Fermat: $a^{-1} \\equiv a^{p-2} \\pmod p$ với $p = 10^9 + 7$.',
        'Tính `fact[i]` xuôi từ $0$ tới $50000$, tính `inv[MAX]` bằng lũy thừa nhanh rồi suy ngược `inv[i-1] = inv[i] * i % MOD`.',
        'Kiểm tra `if (k > n || k < 0) return 0;`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nconst long long MOD = 1e9 + 7;\nlong long mp(long long a, long long b){ long long r=1; while(b){if(b&1)r=r*a%MOD;a=a*a%MOD;b>>=1;}return r; }\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int N = 50000; vector<long long> f(N+1,1), inv(N+1,1);\n    for(int i=1;i<=N;i++) f[i]=f[i-1]*i%MOD;\n    inv[N]=mp(f[N],MOD-2); for(int i=N;i>=1;i--) inv[i-1]=inv[i]*i%MOD;\n    int q; cin >> q;\n    while(q--){ int n,k; cin>>n>>k; if(k<0||k>n) cout<<0<<"\\n"; else cout<<f[n]*inv[k]%MOD*inv[n-k]%MOD<<"\\n"; }\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 33. nat-longest-sum-le (2.10)
  {
    const solveLongestLe = (a: number[], S: bigint) => {
      let l = 0;
      let sum = 0n;
      let best = 0;
      for (let r = 0; r < a.length; r++) {
        sum += BigInt(a[r]);
        while (sum > S && l <= r) {
          sum -= BigInt(a[l++]);
        }
        if (r - l + 1 > best) best = r - l + 1;
      }
      return String(best);
    };
    const samples: NativeSample[] = [{ input: '6 8\n2 3 1 5 1 2', output: '3' }];
    const extra = padTests(
      [
        { grp: 'none', input: '4 3\n5 6 7 8', expected: '0' },
        { grp: 'all', input: '4 100\n1 2 3 4', expected: '4' },
        { grp: 'overflow', input: '4 3000000000\n1000000000 1000000000 1000000000 1000000000', expected: '3' },
      ],
      19,
      (i) => {
        const rng = makeRng(3333 + i);
        const n = i >= 16 ? 40000 : randInt(rng, 5, 300);
        const a = Array.from({ length: n }, () => randInt(rng, 1, 1000000000));
        const S = BigInt(randInt(rng, 1, 5)) * BigInt(randInt(rng, 500000000, 1000000000));
        return { grp: 'random', input: `${n} ${S}\n${a.join(' ')}`, expected: solveLongestLe(a, S) };
      }
    );
    list.push({
      slug: 'nat-longest-sum-le',
      title: 'Đoạn con dài nhất có tổng không vượt quá S',
      level: 2,
      lessons: ['2.10'],
      tier: 'Luyện tập',
      topics: ['two-pointers', 'sliding-window'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Đề tự biên soạn bởi đội ngũ DuckOJ.',
      statement_md: 'Cho dãy $n$ số nguyên dương $a_1, \\dots, a_n$ và số nguyên dương $S$. Tìm độ dài đoạn con liên tiếp dài nhất có tổng các phần tử $\\le S$. Nếu mọi phần tử đều $> S$, in `0`.',
      input_spec_md: 'Dòng 1: $n, S$ ($1 \\le n \\le 2 \\cdot 10^5, 1 \\le S \\le 10^{18}$).\\nDòng 2: $n$ số nguyên dương.',
      output_spec_md: 'In ra độ dài lớn nhất tìm được.',
      notes_md: 'Vì mọi phần tử đều dương nên cửa sổ trượt hợp lệ có tính đơn điệu.',
      samples,
      hints: hints4(
        'Duy trì cửa sổ $[l, r]$ và tổng hiện tại `sum`.',
        'Khi thêm `a[r]`, nếu `sum > S` thì trừ `a[l]` và tăng `l`.',
        'Cập nhật `best = max(best, r - l + 1)`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; long long S; cin >> n >> S;\n    vector<long long> a(n); for (auto &x : a) cin >> x;\n    int l = 0, best = 0; long long sum = 0;\n    for (int r = 0; r < n; r++) {\n        sum += a[r];\n        while (sum > S) sum -= a[l++];\n        best = max(best, r - l + 1);\n    }\n    cout << best << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // ===== Cấp 3–6 Native Problems (theo §8.7: tự generate test theo ma trận test, dịch & trích dẫn nguồn mở) =====

  // 34. nat-dice-combinations (3.1 - dịch/tham khảo CSES 1633)
  {
    const MOD = 1000000007;
    const solveDice = (n: number) => {
      const dp = new Int32Array(n + 1);
      dp[0] = 1;
      for (let i = 1; i <= n; i++) {
        let s = 0;
        for (let k = 1; k <= 6 && i - k >= 0; k++) {
          s += dp[i - k];
          if (s >= MOD) s -= MOD;
        }
        dp[i] = s;
      }
      return String(dp[n]);
    };
    const samples: NativeSample[] = [{ input: '3', output: '4', explain: 'Các cách tạo tổng 3: $1+1+1$, $1+2$, $2+1$, $3$.' }];
    const extra = padTests(
      [{ grp: 'edge', input: '1', expected: '1' }, { grp: 'max', input: '100000', expected: solveDice(100000) }],
      29,
      (i) => {
        const n = 2 + i * 3333;
        return { grp: 'random', input: `${n}`, expected: solveDice(n) };
      }
    );
    list.push({
      slug: 'nat-dice-combinations',
      title: 'Đếm số cách tung xúc xắc',
      level: 3,
      lessons: ['3.1'],
      tier: 'Khởi động',
      topics: ['dp', 'knapsack'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài kinh điển từ CSES Problem Set (Dice Combinations — 1633), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Nhiệm vụ của bạn là đếm số cách tạo ra tổng $n$ bằng cách tung một con xúc xắc 6 mặt (giá trị từ $1$ đến $6$) một hoặc nhiều lần. Thứ tự các lần tung có phân biệt.',
      input_spec_md: 'Một số nguyên $n$ ($1 \\le n \\le 10^5$).',
      output_spec_md: 'In ra số cách modulo $10^9 + 7$.',
      notes_md: 'Thử nghiệm bài DP một chiều cơ bản đầu tiên trên máy chấm DuckOJ.',
      samples,
      hints: hints4(
        'Gọi `dp[i]` là số cách tạo ra tổng đúng bằng `i`.',
        'Từ tổng `i`, bước cuối cùng có thể tung ra `1, 2, 3, 4, 5` hoặc `6`.',
        'Công thức: `dp[i] = (dp[i-1] + ... + dp[i-6]) % (10^9 + 7)` với `dp[0] = 1`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int n; cin >> n; const int MOD = 1e9 + 7;\n    vector<int> dp(n + 1, 0); dp[0] = 1;\n    for (int i = 1; i <= n; i++)\n        for (int k = 1; k <= 6 && i - k >= 0; k++) dp[i] = (dp[i] + dp[i-k]) % MOD;\n    cout << dp[n] << "\\n";\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 35. nat-dsu-components (3.4)
  {
    const solveDsu = (n: number, edges: [number, number][]) => {
      const par = Array.from({ length: n + 1 }, (_, i) => i);
      const sz = Array(n + 1).fill(1);
      const find = (x: number): number => (par[x] === x ? x : (par[x] = find(par[x])));
      let comps = n;
      let maxSz = 1;
      const out: string[] = [];
      for (const [u, v] of edges) {
        let a = find(u);
        let b = find(v);
        if (a !== b) {
          if (sz[a] < sz[b]) [a, b] = [b, a];
          par[b] = a;
          sz[a] += sz[b];
          comps--;
          if (sz[a] > maxSz) maxSz = sz[a];
        }
        out.push(`${comps} ${maxSz}`);
      }
      return out.join('\n');
    };
    const samples: NativeSample[] = [{ input: '5 3\n1 2\n1 3\n4 5', output: '4 2\n3 3\n2 3' }];
    const extra = padTests(
      [{ grp: 'edge', input: '3 2\n1 1\n1 2', expected: '3 1\n2 2' }],
      29,
      (i) => {
        const rng = makeRng(3535 + i);
        const n = i === 25 ? 5000 : randInt(rng, 4, 80);
        const m = i === 25 ? 8000 : randInt(rng, 3, 120);
        const edges: [number, number][] = Array.from({ length: m }, () => [randInt(rng, 1, n), randInt(rng, 1, n)]);
        return { grp: 'random', input: `${n} ${m}\n${edges.map((e) => `${e[0]} ${e[1]}`).join('\n')}`, expected: solveDsu(n, edges) };
      }
    );
    list.push({
      slug: 'nat-dsu-components',
      title: 'Quản lý thành phần liên thông (DSU)',
      level: 3,
      lessons: ['3.4'],
      tier: 'Luyện tập',
      topics: ['dsu', 'graphs'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Road Construction (1676), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Ban đầu có $n$ đỉnh rời rạc. Lần lượt thêm $m$ cạnh vô hướng $(u, v)$. Sau mỗi lần thêm cạnh, in ra số thành phần liên thông hiện có và kích thước của thành phần lớn nhất.',
      input_spec_md: 'Dòng 1: $n, m$ ($1 \\le n, m \\le 10^5$).\\n$m$ dòng tiếp theo chứa $u, v$.',
      output_spec_md: 'Gồm $m$ dòng, mỗi dòng in 2 số: số thành phần liên thông và kích thước lớn nhất.',
      notes_md: 'Áp dụng DSU với Path Compression và Union by Size.',
      samples,
      hints: hints4(
        'Khởi tạo `comps = n, max_sz = 1`.',
        'Khi gộp hai tập khác nhau, giảm `comps` đi 1 và cập nhật `max_sz`.',
        'Nhớ kiểm tra `find(u) != find(v)` trước khi gộp.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint p[100005], sz[100005];\nint f(int x){ return p[x]==x?x:p[x]=f(p[x]); }\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,m; cin>>n>>m; for(int i=1;i<=n;i++){p[i]=i;sz[i]=1;}\n    int c=n, mx=1;\n    while(m--){ int u,v; cin>>u>>v; int a=f(u),b=f(v); if(a!=b){if(sz[a]<sz[b])swap(a,b); p[b]=a; sz[a]+=sz[b]; c--; mx=max(mx,sz[a]);} cout<<c<<" "<<mx<<"\\n"; }\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 36. nat-dijkstra-path (4.1)
  {
    const solveDij = (n: number, edges: [number, number, number][]) => {
      const adj: [number, number][][] = Array.from({ length: n + 1 }, () => []);
      for (const [u, v, w] of edges) adj[u].push([v, w]);
      const INF = 4000000000000000000n;
      const dist: bigint[] = Array(n + 1).fill(INF);
      dist[1] = 0n;
      // Binary min-heap [dist, node]
      const heap: [bigint, number][] = [[0n, 1]];
      const push = (item: [bigint, number]) => {
        heap.push(item);
        let idx = heap.length - 1;
        while (idx > 0) {
          const p = (idx - 1) >> 1;
          if (heap[p][0] <= heap[idx][0]) break;
          [heap[p], heap[idx]] = [heap[idx], heap[p]];
          idx = p;
        }
      };
      const pop = () => {
        const top = heap[0];
        const last = heap.pop()!;
        if (heap.length > 0) {
          heap[0] = last;
          let idx = 0;
          while (true) {
            let best = idx;
            const l = 2 * idx + 1;
            const r = l + 1;
            if (l < heap.length && heap[l][0] < heap[best][0]) best = l;
            if (r < heap.length && heap[r][0] < heap[best][0]) best = r;
            if (best === idx) break;
            [heap[idx], heap[best]] = [heap[best], heap[idx]];
            idx = best;
          }
        }
        return top;
      };
      while (heap.length > 0) {
        const [du, u] = pop();
        if (du > dist[u]) continue;
        for (const [v, w] of adj[u]) {
          const nd = du + BigInt(w);
          if (nd < dist[v]) {
            dist[v] = nd;
            push([nd, v]);
          }
        }
      }
      return dist.slice(1).map((d) => (d === INF ? '-1' : d.toString())).join(' ');
    };
    const samples: NativeSample[] = [{ input: '3 4\n1 2 6\n1 3 2\n3 2 3\n1 3 4', output: '0 5 2' }];
    const extra = padTests(
      [
        { grp: 'unreachable', input: '4 2\n1 2 5\n3 4 1', expected: '0 5 -1 -1' },
        { grp: 'overflow', input: '4 3\n1 2 1000000000\n2 3 1000000000\n3 4 1000000000', expected: '0 1000000000 2000000000 3000000000' },
        { grp: 'zero-loop', input: '3 4\n1 1 5\n1 2 0\n2 3 0\n1 3 10', expected: '0 0 0' },
      ],
      29,
      (i) => {
        const rng = makeRng(3636 + i);
        const isStress = i >= 26;
        const n = isStress ? 600 : randInt(rng, 4, 80);
        const m = isStress ? 2000 : randInt(rng, n, n * 3);
        const edges: [number, number, number][] = Array.from({ length: m }, () => [
          randInt(rng, 1, n),
          randInt(rng, 1, n),
          randInt(rng, 0, 1000000000),
        ]);
        return { grp: isStress ? 'stress' : 'random', input: `${n} ${m}\n${edges.map((e) => e.join(' ')).join('\n')}`, expected: solveDij(n, edges) };
      }
    );
    list.push({
      slug: 'nat-dijkstra-path',
      title: 'Đường đi ngắn nhất từ đỉnh 1 (Dijkstra)',
      level: 4,
      lessons: ['4.1'],
      tier: 'Khởi động',
      topics: ['dijkstra', 'shortest-paths', 'graphs'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Shortest Routes I (1671), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho đồ thị có hướng gồm $n$ đỉnh, $m$ cạnh có trọng số không âm. Tìm độ dài đường đi ngắn nhất từ đỉnh $1$ tới mọi đỉnh $1, 2, \\dots, n$ (in `-1` nếu không tới được).',
      input_spec_md: 'Dòng 1: $n, m$ ($1 \\le n \\le 10^5, 0 \\le m \\le 2 \\cdot 10^5$).\\n$m$ dòng tiếp theo chứa $u, v, w$ ($0 \\le w \\le 10^9$).',
      output_spec_md: 'In ra $n$ số nguyên là khoảng cách ngắn nhất từ $1$ tới $1..n$.',
      notes_md: 'Luôn kiểm tra `if (d > dist[u]) continue;` ngay sau khi lấy từ `priority_queue`.',
      samples,
      hints: hints4(
        'Dùng `priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>>`.',
        'Khởi tạo `dist[1] = 0`, các đỉnh khác bằng `INF` (ví dụ `4e18`).',
        'Nếu `dist[i] == INF`, in `-1`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,m; cin>>n>>m; vector<vector<pair<int,int>>> adj(n+1);\n    while(m--){int u,v,w;cin>>u>>v>>w;adj[u].push_back({v,w});}\n    const long long INF=4e18; vector<long long> d(n+1,INF); d[1]=0;\n    priority_queue<pair<long long,int>,vector<pair<long long,int>>,greater<>> pq; pq.push({0,1});\n    while(!pq.empty()){ auto [du,u]=pq.top(); pq.pop(); if(du>d[u]) continue; for(auto [v,w]:adj[u]) if(d[u]+w<d[v]){d[v]=d[u]+w;pq.push({d[v],v});} }\n    for(int i=1;i<=n;i++) cout<<(d[i]==INF?-1:d[i])<<(i==n?"\\n":" ");\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 37. nat-fenwick-sum (4.6)
  {
    const solveBit = (a: number[], ops: [number, number, number][]) => {
      const n = a.length;
      const cur = [0n, ...a.map((x) => BigInt(x))];
      const bit = Array<bigint>(n + 1).fill(0n);
      const add = (idx: number, delta: bigint) => {
        for (; idx <= n; idx += idx & -idx) bit[idx] += delta;
      };
      const qry = (idx: number) => {
        let s = 0n;
        for (; idx > 0; idx -= idx & -idx) s += bit[idx];
        return s;
      };
      for (let i = 1; i <= n; i++) add(i, cur[i]);
      const out: string[] = [];
      for (const [t, x, y] of ops) {
        if (t === 1) {
          const v = BigInt(y);
          add(x, v - cur[x]);
          cur[x] = v;
        } else {
          out.push((qry(y) - qry(x - 1)).toString());
        }
      }
      return out.join('\n');
    };
    const samples: NativeSample[] = [{ input: '5 3\n1 2 3 4 5\n2 1 5\n1 3 10\n2 1 5', output: '15\n22' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1 2\n1000000000\n1 1 1000000000\n2 1 1', expected: '1000000000' },
        { grp: 'overflow', input: '4 3\n1000000000 1000000000 1000000000 -1000000000\n2 1 3\n1 4 1000000000\n2 1 4', expected: '3000000000\n4000000000' },
      ],
      29,
      (i) => {
        const rng = makeRng(3737 + i);
        const isStress = i >= 26;
        const n = isStress ? 2500 : 15 + (i % 40);
        const qCount = isStress ? 2500 : 25;
        const a = Array.from({ length: n }, () => randInt(rng, -1000000000, 1000000000));
        const ops: [number, number, number][] = Array.from({ length: qCount }, () => {
          const t = randInt(rng, 1, 2);
          if (t === 1) return [1, randInt(rng, 1, n), randInt(rng, -1000000000, 1000000000)];
          const l = randInt(rng, 1, n);
          return [2, l, randInt(rng, l, n)];
        });
        ops.push([2, 1, n]);
        return { grp: isStress ? 'stress' : 'random', input: `${n} ${ops.length}\n${a.join(' ')}\n${ops.map((o) => o.join(' ')).join('\n')}`, expected: solveBit(a, ops) };
      }
    );
    list.push({
      slug: 'nat-fenwick-sum',
      title: 'Cập nhật điểm và tổng đoạn (Fenwick)',
      level: 4,
      lessons: ['4.6'],
      tier: 'Khởi động',
      topics: ['fenwick', 'data-structures'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Dynamic Range Sum Queries (1648), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho mảng $n$ số nguyên và $q$ truy vấn thuộc một trong hai dạng:\n- `1 k u`: gán $a_k = u$.\n- `2 l r`: tính tổng $a_l + \\dots + a_r$.',
      input_spec_md: 'Dòng 1: $n, q$ ($1 \\le n, q \\le 2 \\cdot 10^5$).\\nDòng 2: $n$ số nguyên.\\n$q$ dòng tiếp theo chứa truy vấn.',
      output_spec_md: 'In đáp án cho từng truy vấn loại 2.',
      notes_md: 'Khi gán $a_k = u$, truyền hiệu `u - a[k]` vào hàm cộng thêm của Fenwick Tree.',
      samples,
      hints: hints4(
        'Fenwick Tree hỗ trợ tăng điểm lên `delta` trong $O(\\log n)$.',
        'Để gán `a[k] = u`, gọi `add(k, u - a[k])` rồi cập nhật `a[k] = u`.',
        'Đáp án loại 2 là `query(r) - query(l - 1)`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,q; cin>>n>>q; vector<long long> a(n+1), bit(n+1,0);\n    auto add=[&](int i,long long v){for(;i<=n;i+=i&-i)bit[i]+=v;};\n    auto qry=[&](int i){long long s=0;for(;i>0;i-=i&-i)s+=bit[i];return s;};\n    for(int i=1;i<=n;i++){cin>>a[i];add(i,a[i]);}\n    while(q--){int t,x,y;cin>>t>>x>>y;if(t==1){add(x,y-a[x]);a[x]=y;}else cout<<qry(y)-qry(x-1)<<"\\n";}\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 38. nat-segment-min (4.7)
  {
    const solveSegMin = (a: number[], ops: [number, number, number][]) => {
      const n = a.length;
      const seg = Array<number>(2 * n).fill(0);
      for (let i = 0; i < n; i++) seg[n + i] = a[i];
      for (let i = n - 1; i > 0; i--) seg[i] = Math.min(seg[2 * i], seg[2 * i + 1]);
      const upd = (p: number, val: number) => {
        let i = n + p - 1;
        seg[i] = val;
        for (i >>= 1; i > 0; i >>= 1) seg[i] = Math.min(seg[2 * i], seg[2 * i + 1]);
      };
      const qry = (l0: number, r0: number) => {
        let l = n + l0 - 1;
        let r = n + r0;
        let mn = Infinity;
        while (l < r) {
          if (l & 1) mn = Math.min(mn, seg[l++]);
          if (r & 1) mn = Math.min(mn, seg[--r]);
          l >>= 1;
          r >>= 1;
        }
        return mn;
      };
      const out: string[] = [];
      for (const [t, x, y] of ops) {
        if (t === 1) upd(x, y);
        else out.push(String(qry(x, y)));
      }
      return out.join('\n');
    };
    const samples: NativeSample[] = [{ input: '5 3\n5 2 8 1 4\n2 1 3\n1 2 9\n2 1 3', output: '2\n5' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1 1\n42\n2 1 1', expected: '42' },
        { grp: 'all-negative', input: '4 2\n-5 -10 -3 -1000000000\n2 1 3\n2 1 4', expected: '-10\n-1000000000' },
      ],
      29,
      (i) => {
        const rng = makeRng(3838 + i);
        const isStress = i >= 26;
        const n = isStress ? 1500 : 15 + (i % 35);
        const qCount = isStress ? 1500 : 25;
        const a = Array.from({ length: n }, () => randInt(rng, -1000000000, 1000000000));
        const ops: [number, number, number][] = Array.from({ length: qCount }, () => {
          const t = randInt(rng, 1, 2);
          if (t === 1) return [1, randInt(rng, 1, n), randInt(rng, -1000000000, 1000000000)];
          const l = randInt(rng, 1, n);
          return [2, l, randInt(rng, l, n)];
        });
        ops.push([2, 1, n]);
        return { grp: isStress ? 'stress' : 'random', input: `${n} ${ops.length}\n${a.join(' ')}\n${ops.map((o) => o.join(' ')).join('\n')}`, expected: solveSegMin(a, ops) };
      }
    );
    list.push({
      slug: 'nat-segment-min',
      title: 'Giá trị nhỏ nhất trên đoạn động (Segment Tree)',
      level: 4,
      lessons: ['4.7'],
      tier: 'Khởi động',
      topics: ['segment-tree', 'data-structures'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Dynamic Range Minimum Queries (1649), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho mảng $n$ số nguyên và $q$ truy vấn:\n- `1 k u`: cập nhật $a_k = u$.\n- `2 l r`: tìm $\\min(a_l, \\dots, a_r)$.',
      input_spec_md: 'Dòng 1: $n, q$. Dòng 2: $n$ số nguyên. $q$ dòng sau chứa truy vấn.',
      output_spec_md: 'In kết quả từng truy vấn loại 2.',
      notes_md: 'Fenwick Tree không làm được phép toán `min` với cập nhật tùy ý, cần Segment Tree.',
      samples,
      hints: hints4(
        'Dựng mảng cây `seg` kích thước `4 * n`.',
        'Khi nút `[tl, tr]` nằm ngoài `[l, r]`, trả về `INT_MAX` (hoặc `1e18`).',
        'Hợp nhất hai con bằng `min(seg[2*v], seg[2*v+1])`.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,q; cin>>n>>q; vector<long long> seg(4*n+4, 4e18);\n    function<void(int,int,int,int,long long)> upd=[&](int v,int l,int r,int p,long long val){\n        if(l==r){seg[v]=val;return;}\n        int m=(l+r)/2; if(p<=m)upd(2*v,l,m,p,val);else upd(2*v+1,m+1,r,p,val);\n        seg[v]=min(seg[2*v],seg[2*v+1]);\n    };\n    function<long long(int,int,int,int,int)> qry=[&](int v,int l,int r,int ql,int qr){\n        if(ql>r||qr<l) return (long long)4e18;\n        if(ql<=l&&r<=qr) return seg[v];\n        int m=(l+r)/2; return min(qry(2*v,l,m,ql,qr), qry(2*v+1,m+1,r,ql,qr));\n    };\n    for(int i=1;i<=n;i++){long long x;cin>>x;upd(1,1,n,i,x);}\n    while(q--){int t,x,y;cin>>t>>x>>y;if(t==1)upd(1,1,n,x,y);else cout<<qry(1,1,n,x,y)<<"\\n";}\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 39. nat-lca-tree (5.1)
  {
    const solveLcaDist = (n: number, edges: [number, number][], qs: [number, number][]) => {
      const adj: number[][] = Array.from({ length: n + 1 }, () => []);
      for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
      }
      const LOG = 14;
      const up = Array.from({ length: LOG }, () => new Int32Array(n + 1));
      const dep = new Int32Array(n + 1);
      const q = [1];
      for (let idx = 0; idx < q.length; idx++) {
        const u = q[idx];
        for (const v of adj[u]) {
          if (v !== up[0][u]) {
            up[0][v] = u;
            dep[v] = dep[u] + 1;
            q.push(v);
          }
        }
      }
      for (let k = 1; k < LOG; k++) {
        for (let v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
      }
      const lca = (a: number, b: number) => {
        let u = a;
        let v = b;
        if (dep[u] < dep[v]) [u, v] = [v, u];
        const diff = dep[u] - dep[v];
        for (let k = 0; k < LOG; k++) if ((diff >> k) & 1) u = up[k][u];
        if (u === v) return u;
        for (let k = LOG - 1; k >= 0; k--) {
          if (up[k][u] !== up[k][v]) {
            u = up[k][u];
            v = up[k][v];
          }
        }
        return up[0][u];
      };
      return qs.map(([u, v]) => String(dep[u] + dep[v] - 2 * dep[lca(u, v)])).join('\n');
    };
    const samples: NativeSample[] = [{ input: '5 3\n1 2\n1 3\n3 4\n3 5\n1 4\n2 5\n4 5', output: '2\n3\n2' }];
    const extra = padTests(
      [{ grp: 'same', input: '3 1\n1 2\n2 3\n2 2', expected: '0' }],
      29,
      (i) => {
        const rng = makeRng(3939 + i);
        const isChain = i === 27;
        const isStress = i >= 27;
        const n = isStress ? 1000 : 10 + (i % 35);
        const edges: [number, number][] = [];
        for (let v = 2; v <= n; v++) edges.push([isChain ? v - 1 : randInt(rng, 1, v - 1), v]);
        const qCount = isStress ? 1000 : 20;
        const qs: [number, number][] = Array.from({ length: qCount }, () => [randInt(rng, 1, n), randInt(rng, 1, n)]);
        return {
          grp: isStress ? 'stress' : 'random',
          input: `${n} ${qs.length}\n${edges.map((e) => e.join(' ')).join('\n')}\n${qs.map((q) => q.join(' ')).join('\n')}`,
          expected: solveLcaDist(n, edges, qs),
        };
      }
    );
    list.push({
      slug: 'nat-lca-tree',
      title: 'Khoảng cách giữa hai đỉnh trên cây (LCA)',
      level: 5,
      lessons: ['5.1'],
      tier: 'Khởi động',
      topics: ['lca', 'binary-lifting', 'trees'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Distance Queries (1135), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho một cây gồm $n$ đỉnh và $q$ truy vấn. Mỗi truy vấn gồm hai đỉnh $u, v$, hãy tính số cạnh trên đường đi đơn duy nhất giữa $u$ và $v$.',
      input_spec_md: 'Dòng 1: $n, q$ ($1 \\le n, q \\le 2 \\cdot 10^5$).\\n$n-1$ dòng tiếp theo là các cạnh cây.\\n$q$ dòng tiếp theo chứa $u, v$.',
      output_spec_md: 'In ra khoảng cách mỗi truy vấn.',
      notes_md: 'Dùng Binary Lifting tìm $w = \\operatorname{LCA}(u, v)$ trong $O(\\log n)$, khoảng cách là $dep[u] + dep[v] - 2 \\cdot dep[w]$.',
      samples,
      hints: hints4(
        'Chọn đỉnh $1$ làm gốc, tính `depth[u]` và bảng `up[k][u]` bằng DFS.',
        'Nhảy đỉnh sâu hơn lên cùng độ sâu với đỉnh kia.',
        'Nhảy đồng thời cả hai đỉnh cho đến ngay dưới LCA.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,q; cin>>n>>q; vector<vector<int>> adj(n+1);\n    for(int i=1;i<n;i++){int u,v;cin>>u>>v;adj[u].push_back(v);adj[v].push_back(u);}\n    const int LOG=18; vector<vector<int>> up(LOG,vector<int>(n+1,0)); vector<int> dep(n+1,0);\n    function<void(int,int)> dfs=[&](int u,int p){ up[0][u]=p; for(int v:adj[u]) if(v!=p){dep[v]=dep[u]+1;dfs(v,u);} };\n    dfs(1,0); for(int k=1;k<LOG;k++) for(int v=1;v<=n;v++) up[k][v]=up[k-1][up[k-1][v]];\n    auto lca=[&](int u,int v){ if(dep[u]<dep[v])swap(u,v); for(int k=LOG-1;k>=0;k--) if(dep[u]-(1<<k)>=dep[v]) u=up[k][u]; if(u==v) return u; for(int k=LOG-1;k>=0;k--) if(up[k][u]!=up[k][v]){u=up[k][u];v=up[k][v];} return up[0][u]; };\n    while(q--){int u,v;cin>>u>>v; int w=lca(u,v); cout<<dep[u]+dep[v]-2*dep[w]<<"\\n";}\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 40. nat-max-flow (5.6)
  {
    const solveMaxFlow = (n: number, edges: [number, number, number][]) => {
      const cap: bigint[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0n));
      for (const [u, v, c] of edges) cap[u][v] += BigInt(c);
      let flow = 0n;
      while (true) {
        const par = Array(n + 1).fill(-1);
        par[1] = 0;
        const q = [1];
        for (let idx = 0; idx < q.length && par[n] === -1; idx++) {
          const u = q[idx];
          for (let v = 1; v <= n; v++) {
            if (par[v] === -1 && cap[u][v] > 0n) {
              par[v] = u;
              q.push(v);
            }
          }
        }
        if (par[n] === -1) break;
        let aug = 4000000000000000000n;
        for (let v = n; v !== 1; v = par[v]) if (cap[par[v]][v] < aug) aug = cap[par[v]][v];
        for (let v = n; v !== 1; v = par[v]) {
          cap[par[v]][v] -= aug;
          cap[v][par[v]] += aug;
        }
        flow += aug;
      }
      return flow.toString();
    };
    const samples: NativeSample[] = [{ input: '4 5\n1 2 3\n2 4 2\n1 3 4\n3 4 5\n4 2 3', output: '6' }];
    const extra = padTests(
      [
        { grp: 'disconnected', input: '4 2\n1 2 10\n3 4 10', expected: '0' },
        { grp: 'anti-greedy', input: '4 5\n1 2 1000\n1 3 1000\n2 3 1\n2 4 1000\n3 4 1000', expected: '2000' },
        { grp: 'overflow', input: '4 4\n1 2 2000000000\n1 3 2000000000\n2 4 2000000000\n3 4 2000000000', expected: '4000000000' },
      ],
      29,
      (i) => {
        const rng = makeRng(4040 + i);
        const n = i >= 26 ? 35 : 5 + (i % 15);
        const m = n * 3;
        const edges: [number, number, number][] = Array.from({ length: m }, () => [
          randInt(rng, 1, n - 1),
          randInt(rng, 2, n),
          randInt(rng, 1, 1000000000),
        ]);
        return { grp: i >= 26 ? 'stress' : 'random', input: `${n} ${m}\n${edges.map((e) => e.join(' ')).join('\n')}`, expected: solveMaxFlow(n, edges) };
      }
    );
    list.push({
      slug: 'nat-max-flow',
      title: 'Luồng cực đại trên mạng (Max Flow)',
      level: 5,
      lessons: ['5.6'],
      tier: 'Luyện tập',
      topics: ['max-flow', 'flows', 'graphs'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Download Speed (1694), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho mạng có hướng $n$ đỉnh và $m$ kênh truyền có dung lượng $c_i$. Hãy tìm tổng luồng cực đại có thể truyền từ đỉnh nguồn $1$ tới đỉnh đích $n$.',
      input_spec_md: 'Dòng 1: $n, m$ ($2 \\le n \\le 500, 1 \\le m \\le 1000$).\\n$m$ dòng tiếp theo chứa $u, v, c$.',
      output_spec_md: 'In ra giá trị luồng cực đại.',
      notes_md: 'Có thể cài đặt Edmonds-Karp hoặc Dinic. Chú ý cạnh song song cần cộng dồn hoặc giữ dạng danh sách cạnh riêng.',
      samples,
      hints: hints4(
        'Dựng cạnh xuôi dung lượng `c` và cạnh ngược dung lượng `0`.',
        'Dùng BFS tìm đường tăng luồng ngắn nhất từ `1` tới `n`.',
        'Cộng luồng tìm được vào tổng và cập nhật đồ thị thặng dư.',
        `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,m; cin>>n>>m; vector<vector<long long>> cap(n+1,vector<long long>(n+1,0));\n    while(m--){int u,v;long long c;cin>>u>>v>>c;cap[u][v]+=c;}\n    long long flow=0;\n    while(true){\n        vector<int> p(n+1,-1); p[1]=0; queue<int> q; q.push(1);\n        while(!q.empty()){int u=q.front();q.pop();for(int v=1;v<=n;v++)if(p[v]==-1&&cap[u][v]>0){p[v]=u;q.push(v);}}\n        if(p[n]==-1) break;\n        long long aug=4e18; for(int v=n;v!=1;v=p[v]) aug=min(aug,cap[p[v]][v]);\n        for(int v=n;v!=1;v=p[v]){cap[p[v]][v]-=aug;cap[v][p[v]]+=aug;} flow+=aug;\n    }\n    cout<<flow<<"\\n"; return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 41. nat-convex-hull (6.5)
  {
    const solveHullCount = (pts: [number, number][]) => {
      const uniq = Array.from(new Map(pts.map((p) => [`${p[0]},${p[1]}`, p])).values());
      uniq.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
      if (uniq.length <= 2) return String(uniq.length);
      const cross = (a: [number, number], b: [number, number], c: [number, number]) =>
        BigInt(b[0] - a[0]) * BigInt(c[1] - a[1]) - BigInt(b[1] - a[1]) * BigInt(c[0] - a[0]);
      const lower: [number, number][] = [];
      for (const p of uniq) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0n) lower.pop();
        lower.push(p);
      }
      const upper: [number, number][] = [];
      for (let i = uniq.length - 1; i >= 0; i--) {
        const p = uniq[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0n) upper.pop();
        upper.push(p);
      }
      lower.pop();
      upper.pop();
      return String(lower.length + upper.length);
    };
    const samples: NativeSample[] = [{ input: '5\n0 0\n2 0\n2 2\n0 2\n1 1', output: '4' }];
    const extra = padTests(
      [
        { grp: 'collinear', input: '4\n0 0\n1 1\n2 2\n3 3', expected: '2' },
        { grp: 'overflow', input: '7\n-1000000000 -1000000000\n1000000000 -1000000000\n1000000000 1000000000\n-1000000000 1000000000\n0 -1000000000\n0 0\n1000000000 -1000000000', expected: '4' },
      ],
      29,
      (i) => {
        const rng = makeRng(4141 + i);
        const isStress = i >= 26;
        const n = isStress ? 600 : 5 + (i % 40);
        const bound = i >= 20 ? 1000000000 : 1000;
        const pts: [number, number][] = Array.from({ length: n }, () => [randInt(rng, -bound, bound), randInt(rng, -bound, bound)]);
        return { grp: isStress ? 'stress' : 'random', input: `${n}\n${pts.map((p) => p.join(' ')).join('\n')}`, expected: solveHullCount(pts) };
      }
    );
    list.push({
      slug: 'nat-convex-hull',
      title: 'Đếm số đỉnh trên Bao lồi (Convex Hull)',
      level: 6,
      lessons: ['6.5'],
      tier: 'Luyện tập',
      topics: ['geometry', 'convex-hull'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài Library Checker Static Convex Hull / CSES Convex Hull, đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho tập gồm $n$ điểm trên mặt phẳng tọa độ $Oxy$. Hãy dựng bao lồi nhỏ nhất chứa tất cả các điểm (không tính các điểm thẳng hàng nằm giữa cạnh bao lồi) và in ra số đỉnh của bao lồi đó.',
      input_spec_md: 'Dòng 1: $n$ ($1 \\le n \\le 10^5$).\\n$n$ dòng tiếp theo chứa tọa độ nguyên $x_i, y_i$ ($|x_i|, |y_i| \\le 10^9$).',
      output_spec_md: 'In ra số đỉnh của bao lồi.',
      notes_md: 'Dùng tích có hướng 64-bit (`long long` / `__int128` khi tọa độ $10^9$) và thuật toán Andrew Monotone Chain.',
      samples,
      hints: hints4(
        'Loại bỏ các điểm trùng lặp sau khi sắp xếp tăng dần theo `(x, y)`.',
        'Kiểm tra rẽ phải hoặc thẳng hàng bằng `cross(A, B, C) <= 0`.',
        'Gộp chuỗi dưới và chuỗi trên (bỏ hai điểm đầu cuối trùng lặp).',
        `#include <bits/stdc++.h>\nusing namespace std;\nstruct P{ long long x,y; bool operator<(const P&o)const{return tie(x,y)<tie(o.x,o.y);} bool operator==(const P&o)const{return x==o.x&&y==o.y;} };\nlong long cr(P a,P b,P c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n; cin>>n; vector<P> a(n); for(auto&p:a)cin>>p.x>>p.y;\n    sort(a.begin(),a.end()); a.erase(unique(a.begin(),a.end()),a.end());\n    if(a.size()<=2){cout<<a.size()<<"\\n"; return 0;}\n    vector<P> h;\n    for(int ph=0;ph<2;ph++){ size_t st=h.size(); for(auto p:a){ while(h.size()>=st+2&&cr(h[h.size()-2],h.back(),p)<=0) h.pop_back(); h.push_back(p); } h.pop_back(); reverse(a.begin(),a.end()); }\n    cout<<h.size()<<"\\n"; return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 42. nat-fft-multiply (6.1)
  {
    const MOD = 998244353n;
    const solvePoly = (a: number[], b: number[]) => {
      const c = Array(a.length + b.length - 1).fill(0n);
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          c[i + j] = (c[i + j] + BigInt(a[i]) * BigInt(b[j])) % MOD;
        }
      }
      return c.map((x) => x.toString()).join(' ');
    };
    const samples: NativeSample[] = [{ input: '3 2\n1 2 3\n4 5', output: '4 13 22 15' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1 1\n0\n5', expected: '0' },
        { grp: 'overflow', input: '2 2\n998244352 998244352\n998244352 998244352', expected: '1 2 1' },
      ],
      29,
      (i) => {
        const rng = makeRng(4242 + i);
        const isStress = i >= 27;
        const n = isStress ? 400 : 3 + (i % 40);
        const m = isStress ? 400 : 3 + ((i * 2) % 40);
        const a = Array.from({ length: n }, () => randInt(rng, 0, 998244352));
        const b = Array.from({ length: m }, () => randInt(rng, 0, 998244352));
        return { grp: isStress ? 'stress' : 'random', input: `${n} ${m}\n${a.join(' ')}\n${b.join(' ')}`, expected: solvePoly(a, b) };
      }
    );
    list.push({
      slug: 'nat-fft-multiply',
      title: 'Nhân đa thức modulo 998244353 (NTT)',
      level: 6,
      lessons: ['6.1'],
      tier: 'Luyện tập',
      topics: ['fft-ntt', 'math'],
      time_limit_ms: 2000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài Library Checker Convolution (convolution_mod), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho hai đa thức $A(x) = \\sum_{i=0}^{n-1} a_i x^i$ và $B(x) = \\sum_{j=0}^{m-1} b_j x^j$. Hãy tính các hệ số của đa thức tích $C(x) = A(x) \\cdot B(x)$ theo modulo $998244353$.',
      input_spec_md: 'Dòng 1: $n, m$ ($1 \\le n, m \\le 10^5$).\\nDòng 2: $n$ hệ số $a_i$.\\nDòng 3: $m$ hệ số $b_j$.',
      output_spec_md: 'In ra $n + m - 1$ hệ số của $C(x)$ modulo $998244353$.',
      notes_md: 'Sử dụng Number Theoretic Transform (NTT) với căn nguyên thủy $g = 3$ và modulo $998244353$.',
      samples,
      hints: hints4(
        'Mở rộng kích thước lên lũy thừa của 2 nhỏ nhất $\\ge n + m - 1$.',
        'Biến đổi NTT xuôi cả hai dãy, nhân từng điểm modulo $998244353$.',
        'Biến đổi NTT ngược và nhân với nghịch đảo kích thước $N^{-1} \\bmod 998244353$.',
        `#include <bits/stdc++.h>\nusing namespace std;\nconst long long MOD=998244353;\nlong long mpow(long long a, long long e){ long long r=1; a%=MOD; while(e>0){ if(e&1) r=r*a%MOD; a=a*a%MOD; e>>=1; } return r; }\nvoid ntt(vector<long long>& a, int inv){\n    int n=(int)a.size(), j=0;\n    for(int i=1;i<n;i++){ int bit=n>>1; while(j&bit){ j^=bit; bit>>=1; } j^=bit; if(i<j) swap(a[i],a[j]); }\n    for(int len=2;len<=n;len<<=1){\n        long long wlen=mpow(3,(MOD-1)/len);\n        if(inv) wlen=mpow(wlen,MOD-2);\n        for(int i=0;i<n;i+=len){\n            long long w=1;\n            for(int k=0;k<len/2;k++){\n                long long u=a[i+k], v=a[i+k+len/2]*w%MOD;\n                a[i+k]=(u+v)%MOD; a[i+k+len/2]=(u-v+MOD)%MOD;\n                w=w*wlen%MOD;\n            }\n        }\n    }\n    if(inv){ long long inv_n=mpow(n,MOD-2); for(int i=0;i<n;i++) a[i]=a[i]*inv_n%MOD; }\n}\nint main(){\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    int n,m; cin>>n>>m; int sz=1; while(sz<n+m-1) sz<<=1;\n    vector<long long> a(sz,0),b(sz,0);\n    for(int i=0;i<n;i++) cin>>a[i]; for(int j=0;j<m;j++) cin>>b[j];\n    ntt(a,0); ntt(b,0); for(int i=0;i<sz;i++) a[i]=a[i]*b[i]%MOD; ntt(a,1);\n    for(int i=0;i<n+m-1;i++) cout<<a[i]<<(i+1==n+m-1?"\\n":" ");\n    return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  // 43. nat-grid-paths-dp (3.2)
  {
    const MOD = 1000000007;
    const solveGrid = (g: string[]) => {
      const n = g.length;
      const m = g[0].length;
      const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      if (g[0][0] === '.') dp[1][1] = 1;
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          if (i === 1 && j === 1) continue;
          if (g[i - 1][j - 1] === '.') dp[i][j] = (dp[i - 1][j] + dp[i][j - 1]) % MOD;
        }
      }
      return String(dp[n][m]);
    };
    const samples: NativeSample[] = [{ input: '3 3\n...\n.*.\n...', output: '2' }];
    const extra = padTests(
      [
        { grp: 'edge', input: '1 1\n.', expected: '1' },
        { grp: 'blocked-start', input: '1 1\n*', expected: '0' },
        { grp: 'blocked-start', input: '2 2\n*.\n..', expected: '0' },
        { grp: 'blocked-end', input: '2 2\n..\n.*', expected: '0' },
        { grp: 'single-row', input: `1 100\n${'.'.repeat(100)}`, expected: '1' },
      ],
      29,
      (i) => {
        const rng = makeRng(4343 + i);
        const isStress = i >= 26;
        const n = isStress ? 100 : 3 + (i % 15);
        const m = isStress ? 100 : 3 + ((i * 2) % 15);
        const blockProb = isStress ? 0.08 : 0.2;
        const g = Array.from({ length: n }, () =>
          Array.from({ length: m }, () => (rng() < blockProb ? '*' : '.')).join('')
        );
        return { grp: isStress ? 'stress' : 'random', input: `${n} ${m}\n${g.join('\n')}`, expected: solveGrid(g) };
      }
    );
    list.push({
      slug: 'nat-grid-paths-dp',
      title: 'Đếm đường đi trên lưới có vật cản',
      level: 3,
      lessons: ['3.2'],
      tier: 'Khởi động',
      topics: ['grid-dp', 'dp'],
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      output_limit_kb: 65536,
      checker: 'tokens',
      license_note: 'Tham khảo dạng bài CSES Grid Paths I (1638), đề Việt hóa & bộ test tự sinh bởi DuckOJ.',
      statement_md: 'Cho lưới $n \\times m$ gồm các ô trống `.` và vật cản `*`. Xuất phát từ $(1, 1)$ và mỗi bước chỉ được đi sang phải hoặc xuống dưới, đếm số đường đi tới $(n, m)$ modulo $10^9 + 7$.',
      input_spec_md: 'Dòng 1: $n, m$ ($1 \\le n, m \\le 1000$).\\n$n$ dòng tiếp theo mỗi dòng $m$ ký tự `.` hoặc `*`.',
      output_spec_md: 'In ra số đường đi modulo $10^9 + 7$.',
      notes_md: 'Kiểm tra kỹ nếu ô $(1, 1)$ hoặc $(n, m)$ là `*`.',
      samples,
      hints: hints4(
        'Gọi `dp[i][j]` là số đường đi tới ô $(i, j)$.',
        'Nếu ô là `.`, `dp[i][j] = (dp[i-1][j] + dp[i][j-1]) % MOD`.',
        'Khởi tạo `dp[1][1] = 1` nếu ô $(1, 1)$ trống.',
        `#include <bits/stdc++.h>\nusing namespace std;\nconst int MOD=1e9+7;\nint main(){\n    int n,m; cin>>n>>m; vector<string> g(n); for(auto&s:g)cin>>s;\n    vector<vector<int>> dp(n+1,vector<int>(m+1,0));\n    if(g[0][0]=='.') dp[1][1]=1;\n    for(int i=1;i<=n;i++) for(int j=1;j<=m;j++){if(i==1&&j==1)continue;if(g[i-1][j-1]=='.')dp[i][j]=(dp[i-1][j]+dp[i][j-1])%MOD;}\n    cout<<dp[n][m]<<"\\n"; return 0;\n}`
      ),
      tests: buildTests(samples, extra),
    });
  }

  return list;
}
