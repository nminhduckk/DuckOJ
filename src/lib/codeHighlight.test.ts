import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyClosingBraceDedent,
  applyEnterIndentation,
  applyTabIndentation,
  tokenizeCodeLines,
} from './codeHighlight';

test('tokenizes C++ comments, keywords, functions, numbers, and strings cleanly', () => {
  const code = `// Tính số cách sắp xếp n cái ghế
int solve(int n) {
    if (n == 1)
        return 3;
    return 2 * solve(n - 1) + 2 * solve(n - 2);
}`;
  const lines = tokenizeCodeLines(code, 'cpp');
  assert.equal(lines.length, 6);
  assert.deepEqual(lines[0], [{ text: '// Tính số cách sắp xếp n cái ghế', type: 'comment' }]);
  assert.deepEqual(
    lines[1].filter((t) => t.text.trim().length > 0),
    [
      { text: 'int', type: 'keyword' },
      { text: 'solve', type: 'function' },
      { text: '(', type: 'plain' },
      { text: 'int', type: 'keyword' },
      { text: ' n) {', type: 'plain' },
    ]
  );
  assert.equal(lines[3].some((t) => t.text === 'return' && t.type === 'keyword'), true);
  assert.equal(lines[3].some((t) => t.text === '3' && t.type === 'number'), true);
  assert.equal(lines[4].filter((t) => t.type === 'function' && t.text === 'solve').length, 2);
});

test('tokenizes Python keywords, builtins, comments, and multi-line strings', () => {
  const code = `# solve problem
def solve(n):
    msg = "hello"
    return max(1, n)`;
  const lines = tokenizeCodeLines(code, 'python3');
  assert.equal(lines[0][0].type, 'comment');
  assert.equal(lines[1].some((t) => t.text === 'def' && t.type === 'keyword'), true);
  assert.equal(lines[1].some((t) => t.text === 'solve' && t.type === 'function'), true);
  assert.equal(lines[2].some((t) => t.text === '"hello"' && t.type === 'string'), true);
  assert.equal(lines[3].some((t) => t.text === 'max' && t.type === 'function'), true);
  assert.equal(lines[3].some((t) => t.text === '1' && t.type === 'number'), true);
});

test('auto-indents on Enter after { and splits {} pairs cleanly', () => {
  const src1 = 'int main() {';
  const r1 = applyEnterIndentation(src1, src1.length, src1.length, 'cpp17');
  assert.equal(r1.value, 'int main() {\n    ');
  assert.equal(r1.selectionStart, 'int main() {\n    '.length);

  const src2 = 'int main() {}';
  const cursor = src2.indexOf('}');
  const r2 = applyEnterIndentation(src2, cursor, cursor, 'cpp17');
  assert.equal(r2.value, 'int main() {\n    \n}');
  assert.equal(r2.selectionStart, 'int main() {\n    '.length);

  const pySrc = 'if x > 0:';
  const r3 = applyEnterIndentation(pySrc, pySrc.length, pySrc.length, 'python3');
  assert.equal(r3.value, 'if x > 0:\n    ');
});

test('dedents closing brace on indented empty line and handles Shift+Tab', () => {
  const src = 'int main() {\n    ';
  const r1 = applyClosingBraceDedent(src, src.length, src.length);
  assert.ok(r1);
  assert.equal(r1.value, 'int main() {\n}');

  const r2 = applyTabIndentation('    return 0;', 4, 4, true);
  assert.equal(r2.value, 'return 0;');
  assert.equal(r2.selectionStart, 0);
});
