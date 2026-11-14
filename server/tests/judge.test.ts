import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyVerdict, parseMetaText } from '../judge/verdict';
import { runChecker } from '../judge/checker';
import { prepareProgram, runInSandbox } from '../judge/sandbox';
import { runJudgeSelftest } from '../judge/selftest';
import { generateNativeProblems } from '../seed/nativeProblems';

describe('Judge Classification, Checkers, C++17 Transpiler & 17-Case Selftest', () => {
  it('classifies every row of §7.4 verdict priority table accurately', () => {
    // 1. status = XX -> SE
    assert.equal(
      classifyVerdict(parseMetaText('status:XX\ntime:0.1\ncg-oom-killed:1\nexitsig:25'), 1000, 256).verdict,
      'SE'
    );
    // 2. cg-oom-killed = 1 or mem >= ML*1024 -> MLE
    assert.equal(
      classifyVerdict(parseMetaText('status:SG\ncg-oom-killed:1\ncg-mem:1024\ntime:2.0'), 1000, 256).verdict,
      'MLE'
    );
    assert.equal(
      classifyVerdict(parseMetaText('status:OK\ncg-mem:262144\ntime:0.1'), 1000, 256).verdict,
      'MLE'
    );
    // 3. exitsig = 25 -> OLE
    assert.equal(
      classifyVerdict(parseMetaText('status:SG\nexitsig:25\ntime:0.5'), 1000, 256).verdict,
      'OLE'
    );
    // 4. status = TO or time > TL -> TLE
    assert.equal(
      classifyVerdict(parseMetaText('status:TO\ntime:1.05\nexitcode:0'), 1000, 256).verdict,
      'TLE'
    );
    assert.equal(
      classifyVerdict(parseMetaText('status:OK\ntime:1.2\nexitcode:0'), 1000, 256).verdict,
      'TLE'
    );
    // 5. status = SG or RE or exitcode != 0 -> RE
    assert.equal(
      classifyVerdict(parseMetaText('status:RE\nexitcode:1\ntime:0.05'), 1000, 256).verdict,
      'RE'
    );
    // 6. exitcode = 0 -> OK
    assert.equal(
      classifyVerdict(parseMetaText('status:OK\nexitcode:0\ntime:0.042\nmax-rss:12000'), 1000, 256).verdict,
      'OK'
    );
  });

  it('validates tokens, lines, float, and custom checkers', () => {
    assert.equal(runChecker({ type: 'tokens' }, '', '1   2\n3\n', '1 2 3').verdict, 'AC');
    assert.equal(runChecker({ type: 'tokens' }, '', '1 2', '1 2 3').verdict, 'WA');

    assert.equal(runChecker({ type: 'lines' }, '', 'alpha  \nbeta\n\n', 'alpha\nbeta').verdict, 'AC');
    assert.equal(runChecker({ type: 'lines' }, '', 'alpha\n beta', 'alpha\nbeta').verdict, 'WA');

    assert.equal(runChecker({ type: 'float', params: { eps: 1e-6 } }, '', '3.1415927', '3.1415926').verdict, 'AC');
    assert.equal(runChecker({ type: 'float', params: { eps: 1e-6 } }, '', '3.15', '3.14').verdict, 'WA');

    // Custom equal_row_sums checker accepts any valid equal-row-sum permutation of 1..n^2
    assert.equal(
      runChecker({ type: 'custom', params: { custom_id: 'equal_row_sums' } }, '2\n', '1 4\n2 3\n', '').verdict,
      'AC'
    );
    assert.equal(
      runChecker({ type: 'custom', params: { custom_id: 'equal_row_sums' } }, '2\n', '1 2\n3 4\n', '').verdict,
      'WA'
    );
  });

  it('executes ALL 43 native C++17 reference solutions cleanly on samples and overflow/stress tests', async () => {
    const natives = generateNativeProblems();
    assert.equal(natives.length, 43);

    for (const prob of natives) {
      const cppHint = prob.hints.find((h) => h.level === 4)!;
      const code = cppHint.text_md.replace(/^```cpp\n/, '').replace(/\n```$/, '');
      const prep = prepareProgram('cpp17', code);
      assert.equal(prep.ok, true, `${prob.slug} compile failed: ${prep.compileLog}`);

      // Test sample, overflow, edge, anti-greedy, and final stress test
      const indices = new Set<number>([0, prob.tests.length - 1]);
      prob.tests.forEach((t, idx) => {
        if (t.grp === 'overflow' || t.grp === 'anti-greedy' || t.grp === 'all-negative' || t.grp === 'boundary') {
          indices.add(idx);
        }
      });

      for (const idx of indices) {
        const tc = prob.tests[idx];
        const run = await runInSandbox(prep, tc.input, {
          time_ms: prob.time_limit_ms,
          memory_mb: prob.memory_limit_mb,
          output_kb: prob.output_limit_kb,
        });
        assert.equal(run.meta.exitcode, 0, `${prob.slug} test[${idx}](${tc.grp}) runtime error: ${run.stderr}`);
        const chk = runChecker(
          { type: prob.checker, params: prob.checker_params as any },
          tc.input,
          run.stdout,
          tc.expected
        );
        assert.equal(chk.verdict, 'AC', `${prob.slug} test[${idx}](${tc.grp}) checker failed: ${chk.message}`);
      }
    }
  });

  it('rejects 32-bit int overflow on 64-bit problems (nat-big-sum & nat-product-overflow)', async () => {
    const natives = generateNativeProblems();

    const bigSum = natives.find((p) => p.slug === 'nat-big-sum')!;
    const badIntSum = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << "\\n";
    return 0;
}`
    );
    assert.equal(badIntSum.ok, true);
    for (const tc of bigSum.tests.slice(0, 4)) {
      const run = await runInSandbox(badIntSum, tc.input, {
        time_ms: bigSum.time_limit_ms,
        memory_mb: bigSum.memory_limit_mb,
        output_kb: bigSum.output_limit_kb,
      });
      const chk = runChecker({ type: bigSum.checker }, tc.input, run.stdout, tc.expected);
      assert.equal(chk.verdict, 'WA', `Expected int to fail ${tc.grp} (${tc.input}), got stdout=${run.stdout}`);
    }

    const goodLlSum = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << "\\n";
    return 0;
}`
    );
    for (const tc of bigSum.tests.slice(0, 4)) {
      const run = await runInSandbox(goodLlSum, tc.input, {
        time_ms: bigSum.time_limit_ms,
        memory_mb: bigSum.memory_limit_mb,
        output_kb: bigSum.output_limit_kb,
      });
      const chk = runChecker({ type: bigSum.checker }, tc.input, run.stdout, tc.expected);
      assert.equal(chk.verdict, 'AC', `Expected long long to pass ${tc.grp}`);
    }

    const prodProb = natives.find((p) => p.slug === 'nat-product-overflow')!;
    const badIntMul = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    long long ans = a * b;
    cout << ans << "\\n";
    return 0;
}`
    );
    const runBadMul = await runInSandbox(badIntMul, '50000 50000', {
      time_ms: prodProb.time_limit_ms,
      memory_mb: prodProb.memory_limit_mb,
      output_kb: prodProb.output_limit_kb,
    });
    assert.equal(runChecker({ type: 'tokens' }, '50000 50000', runBadMul.stdout, '2500000000').verdict, 'WA');

    const good1llMul = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    long long ans = 1LL * a * b;
    cout << ans << "\\n";
    return 0;
}`
    );
    const runGood1ll = await runInSandbox(good1llMul, '50000 50000', {
      time_ms: prodProb.time_limit_ms,
      memory_mb: prodProb.memory_limit_mb,
      output_kb: prodProb.output_limit_kb,
    });
    assert.equal(runChecker({ type: 'tokens' }, '50000 50000', runGood1ll.stdout, '2500000000').verdict, 'AC');
  });

  it('supports std::gcd, custom recursive gcd, and int32_t overflow semantics', async () => {
    const stdGcdProg = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long a, b;
    cin >> a >> b;
    long long g = std::gcd(a, b);
    cout << g << " " << (a / g) * b << "\\n";
    return 0;
}`
    );
    assert.equal(stdGcdProg.ok, true);
    const runStdGcd = await runInSandbox(stdGcdProg, '1000000000 999999999', {
      time_ms: 1000,
      memory_mb: 256,
      output_kb: 65536,
    });
    assert.equal(runStdGcd.meta.exitcode, 0, runStdGcd.stderr);
    assert.equal(runChecker({ type: 'tokens' }, '1000000000 999999999', runStdGcd.stdout, '1 999999999000000000').verdict, 'AC');

    const customGcdProg = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}
int main() {
    long long a, b;
    cin >> a >> b;
    cout << gcd(a, b) << "\\n";
    return 0;
}`
    );
    assert.equal(customGcdProg.ok, true);
    const runCustomGcd = await runInSandbox(customGcdProg, '36 48', {
      time_ms: 1000,
      memory_mb: 256,
      output_kb: 65536,
    });
    assert.equal(runCustomGcd.meta.exitcode, 0, runCustomGcd.stderr);
    assert.equal(runChecker({ type: 'tokens' }, '36 48', runCustomGcd.stdout, '12').verdict, 'AC');

    const int32Overflow = prepareProgram(
      'cpp17',
      `#include <bits/stdc++.h>
using namespace std;
int32_t a, b;
int main() {
    cin >> a >> b;
    cout << a + b << "\\n";
    return 0;
}`
    );
    assert.equal(int32Overflow.ok, true);
    const runInt32 = await runInSandbox(int32Overflow, '2000000000 2000000000', {
      time_ms: 1000,
      memory_mb: 256,
      output_kb: 65536,
    });
    assert.equal(runChecker({ type: 'tokens' }, '2000000000 2000000000', runInt32.stdout, '4000000000').verdict, 'WA');
  });

  it('passes all 17 judge selftest cases (§7.9)', async () => {
    const report = await runJudgeSelftest();
    const failures = report.results.filter((r) => !r.passed);
    assert.equal(
      report.allPassed,
      true,
      `Selftest failed (${report.passedCount}/${report.totalCount}): ${JSON.stringify(failures)}`
    );
  });
});
