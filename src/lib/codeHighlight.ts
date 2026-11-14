export type CodeTokenType =
  | 'plain'
  | 'keyword'
  | 'function'
  | 'number'
  | 'string'
  | 'comment'
  | 'preprocessor';

export interface CodeToken {
  text: string;
  type: CodeTokenType;
}

export type NormalizedCodeLang = 'cpp' | 'python' | 'plain';

const CPP_KEYWORDS = new Set([
  'alignas',
  'alignof',
  'and',
  'and_eq',
  'asm',
  'auto',
  'bitand',
  'bitor',
  'bool',
  'break',
  'case',
  'catch',
  'char',
  'char8_t',
  'char16_t',
  'char32_t',
  'class',
  'compl',
  'concept',
  'const',
  'consteval',
  'constexpr',
  'constinit',
  'const_cast',
  'continue',
  'co_await',
  'co_return',
  'co_yield',
  'decltype',
  'default',
  'delete',
  'do',
  'double',
  'dynamic_cast',
  'else',
  'enum',
  'explicit',
  'export',
  'extern',
  'false',
  'float',
  'for',
  'friend',
  'goto',
  'if',
  'inline',
  'int',
  'int8_t',
  'int16_t',
  'int32_t',
  'int64_t',
  'long',
  'mutable',
  'namespace',
  'new',
  'noexcept',
  'not',
  'not_eq',
  'nullptr',
  'operator',
  'or',
  'or_eq',
  'private',
  'protected',
  'public',
  'register',
  'reinterpret_cast',
  'requires',
  'return',
  'short',
  'signed',
  'size_t',
  'sizeof',
  'static',
  'static_assert',
  'static_cast',
  'struct',
  'switch',
  'template',
  'this',
  'thread_local',
  'throw',
  'true',
  'try',
  'typedef',
  'typeid',
  'typename',
  'uint8_t',
  'uint16_t',
  'uint32_t',
  'uint64_t',
  'union',
  'unsigned',
  'using',
  'virtual',
  'void',
  'volatile',
  'wchar_t',
  'while',
  'xor',
  'xor_eq',
]);

const PYTHON_KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

const PYTHON_BUILTINS = new Set([
  'int',
  'float',
  'str',
  'bool',
  'list',
  'dict',
  'set',
  'tuple',
  'len',
  'range',
  'print',
  'input',
  'min',
  'max',
  'sum',
  'abs',
  'sorted',
  'enumerate',
  'zip',
  'map',
  'filter',
  'any',
  'all',
]);

export function normalizeCodeLanguage(language?: string): NormalizedCodeLang {
  const raw = (language || '').trim().toLowerCase().replace(/^language-/, '');
  if (!raw || raw === 'text' || raw === 'plaintext' || raw === 'txt' || raw === 'input' || raw === 'output') {
    return 'plain';
  }
  if (raw === 'cpp' || raw === 'c++' || raw === 'cpp17' || raw === 'cpp14' || raw === 'cpp20' || raw === 'c' || raw === 'cc' || raw === 'cxx') {
    return 'cpp';
  }
  if (raw === 'python' || raw === 'python3' || raw === 'py' || raw === 'py3') {
    return 'python';
  }
  return 'plain';
}

export function formatCodeBlockLanguage(language?: string, locale: 'vi' | 'en' = 'vi'): string {
  const raw = (language || '').trim().toLowerCase().replace(/^language-/, '');
  if (raw === 'cpp' || raw === 'c++' || raw === 'cpp17' || raw === 'cpp14' || raw === 'cpp20' || raw === 'cc' || raw === 'cxx') {
    return 'C++';
  }
  if (raw === 'c') return 'C';
  if (raw === 'python' || raw === 'python3' || raw === 'py' || raw === 'py3') return 'Python 3';
  if (!raw || raw === 'text' || raw === 'plaintext' || raw === 'txt') {
    return locale === 'vi' ? 'văn bản' : 'text';
  }
  return raw;
}

function isIdentStart(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
}

function isIdentPart(ch: string): boolean {
  return isIdentStart(ch) || (ch >= '0' && ch <= '9');
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function pushToken(tokens: CodeToken[], text: string, type: CodeTokenType) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) {
    last.text += text;
  } else {
    tokens.push({ text, type });
  }
}

export function tokenizeCodeLines(code: string, language?: string): CodeToken[][] {
  const norm = normalizeCodeLanguage(language);
  const lines = code.replace(/\r\n/g, '\n').split('\n');

  if (norm === 'plain') {
    return lines.map((line) => (line ? [{ text: line, type: 'plain' }] : []));
  }

  let inBlockComment = false;
  let pyTripleQuote: '"""' | "'''" | null = null;

  return lines.map((line) => {
    const tokens: CodeToken[] = [];
    let i = 0;
    const n = line.length;

    while (i < n) {
      if (norm === 'cpp') {
        if (inBlockComment) {
          const endIdx = line.indexOf('*/', i);
          if (endIdx === -1) {
            pushToken(tokens, line.slice(i), 'comment');
            i = n;
          } else {
            pushToken(tokens, line.slice(i, endIdx + 2), 'comment');
            i = endIdx + 2;
            inBlockComment = false;
          }
          continue;
        }

        // Line comment
        if (line[i] === '/' && line[i + 1] === '/') {
          pushToken(tokens, line.slice(i), 'comment');
          break;
        }

        // Block comment start
        if (line[i] === '/' && line[i + 1] === '*') {
          const endIdx = line.indexOf('*/', i + 2);
          if (endIdx === -1) {
            pushToken(tokens, line.slice(i), 'comment');
            inBlockComment = true;
            break;
          } else {
            pushToken(tokens, line.slice(i, endIdx + 2), 'comment');
            i = endIdx + 2;
          }
          continue;
        }

        // Preprocessor directive at line start (ignoring whitespace)
        if (line[i] === '#' && line.slice(0, i).trim() === '') {
          let j = i + 1;
          while (j < n && (line[j] === ' ' || line[j] === '\t')) j++;
          while (j < n && isIdentPart(line[j])) j++;
          const directive = line.slice(i, j);
          pushToken(tokens, directive, 'preprocessor');
          i = j;
          // Highlight <header> in #include <...>
          if (/^#\s*include$/.test(directive)) {
            while (i < n && (line[i] === ' ' || line[i] === '\t')) {
              pushToken(tokens, line[i], 'plain');
              i++;
            }
            if (line[i] === '<') {
              const closeIdx = line.indexOf('>', i + 1);
              if (closeIdx !== -1) {
                pushToken(tokens, line.slice(i, closeIdx + 1), 'string');
                i = closeIdx + 1;
              }
            }
          }
          continue;
        }

        // String / char literal
        if (line[i] === '"' || line[i] === "'") {
          const quote = line[i];
          let j = i + 1;
          while (j < n) {
            if (line[j] === '\\' && j + 1 < n) {
              j += 2;
              continue;
            }
            if (line[j] === quote) {
              j++;
              break;
            }
            j++;
          }
          pushToken(tokens, line.slice(i, j), 'string');
          i = j;
          continue;
        }

        // Number literal
        if (isDigit(line[i]) && (i === 0 || !isIdentPart(line[i - 1]))) {
          let j = i;
          if (line[j] === '0' && (line[j + 1] === 'x' || line[j + 1] === 'X' || line[j + 1] === 'b' || line[j + 1] === 'B')) {
            j += 2;
            while (j < n && /[0-9a-fA-F']/.test(line[j])) j++;
          } else {
            while (j < n && (isDigit(line[j]) || line[j] === "'")) j++;
            if (line[j] === '.' && j + 1 < n && isDigit(line[j + 1])) {
              j++;
              while (j < n && (isDigit(line[j]) || line[j] === "'")) j++;
            }
            if ((line[j] === 'e' || line[j] === 'E') && j + 1 < n) {
              let k = j + 1;
              if (line[k] === '+' || line[k] === '-') k++;
              if (k < n && isDigit(line[k])) {
                j = k;
                while (j < n && isDigit(line[j])) j++;
              }
            }
          }
          while (j < n && /[uUlLfF]/.test(line[j])) j++;
          pushToken(tokens, line.slice(i, j), 'number');
          i = j;
          continue;
        }

        // Identifier / keyword / function call
        if (isIdentStart(line[i])) {
          let j = i + 1;
          while (j < n && isIdentPart(line[j])) j++;
          const word = line.slice(i, j);
          if (CPP_KEYWORDS.has(word)) {
            pushToken(tokens, word, 'keyword');
          } else {
            let k = j;
            while (k < n && (line[k] === ' ' || line[k] === '\t')) k++;
            if (line[k] === '(') {
              pushToken(tokens, word, 'function');
            } else {
              pushToken(tokens, word, 'plain');
            }
          }
          i = j;
          continue;
        }

        pushToken(tokens, line[i], 'plain');
        i++;
      } else {
        // Python tokenizer
        if (pyTripleQuote) {
          const endIdx = line.indexOf(pyTripleQuote, i);
          if (endIdx === -1) {
            pushToken(tokens, line.slice(i), 'string');
            i = n;
          } else {
            pushToken(tokens, line.slice(i, endIdx + 3), 'string');
            i = endIdx + 3;
            pyTripleQuote = null;
          }
          continue;
        }

        if (line[i] === '#') {
          pushToken(tokens, line.slice(i), 'comment');
          break;
        }

        if (line.startsWith('"""', i) || line.startsWith("'''", i)) {
          const q = line.slice(i, i + 3) as '"""' | "'''";
          const endIdx = line.indexOf(q, i + 3);
          if (endIdx === -1) {
            pushToken(tokens, line.slice(i), 'string');
            pyTripleQuote = q;
            break;
          } else {
            pushToken(tokens, line.slice(i, endIdx + 3), 'string');
            i = endIdx + 3;
          }
          continue;
        }

        // Prefixed strings like f"...", r'...'
        if (
          (line[i] === 'f' || line[i] === 'F' || line[i] === 'r' || line[i] === 'R' || line[i] === 'b' || line[i] === 'B') &&
          (line[i + 1] === '"' || line[i + 1] === "'")
        ) {
          const quote = line[i + 1];
          let j = i + 2;
          while (j < n) {
            if (line[j] === '\\' && j + 1 < n) {
              j += 2;
              continue;
            }
            if (line[j] === quote) {
              j++;
              break;
            }
            j++;
          }
          pushToken(tokens, line.slice(i, j), 'string');
          i = j;
          continue;
        }

        if (line[i] === '"' || line[i] === "'") {
          const quote = line[i];
          let j = i + 1;
          while (j < n) {
            if (line[j] === '\\' && j + 1 < n) {
              j += 2;
              continue;
            }
            if (line[j] === quote) {
              j++;
              break;
            }
            j++;
          }
          pushToken(tokens, line.slice(i, j), 'string');
          i = j;
          continue;
        }

        if (isDigit(line[i]) && (i === 0 || !isIdentPart(line[i - 1]))) {
          let j = i;
          if (line[j] === '0' && (line[j + 1] === 'x' || line[j + 1] === 'X' || line[j + 1] === 'b' || line[j + 1] === 'B' || line[j + 1] === 'o' || line[j + 1] === 'O')) {
            j += 2;
            while (j < n && /[0-9a-fA-F_]/.test(line[j])) j++;
          } else {
            while (j < n && (isDigit(line[j]) || line[j] === '_')) j++;
            if (line[j] === '.' && j + 1 < n && isDigit(line[j + 1])) {
              j++;
              while (j < n && (isDigit(line[j]) || line[j] === '_')) j++;
            }
            if ((line[j] === 'e' || line[j] === 'E') && j + 1 < n) {
              let k = j + 1;
              if (line[k] === '+' || line[k] === '-') k++;
              if (k < n && isDigit(line[k])) {
                j = k;
                while (j < n && isDigit(line[j])) j++;
              }
            }
          }
          pushToken(tokens, line.slice(i, j), 'number');
          i = j;
          continue;
        }

        if (isIdentStart(line[i])) {
          let j = i + 1;
          while (j < n && isIdentPart(line[j])) j++;
          const word = line.slice(i, j);
          if (PYTHON_KEYWORDS.has(word)) {
            pushToken(tokens, word, 'keyword');
          } else {
            let k = j;
            while (k < n && (line[k] === ' ' || line[k] === '\t')) k++;
            if (line[k] === '(' || PYTHON_BUILTINS.has(word)) {
              pushToken(tokens, word, 'function');
            } else {
              pushToken(tokens, word, 'plain');
            }
          }
          i = j;
          continue;
        }

        pushToken(tokens, line[i], 'plain');
        i++;
      }
    }

    return tokens;
  });
}

export const TOKEN_COLOR_CLASS: Record<CodeTokenType, string> = {
  plain: 'text-[#e2e8f0]',
  keyword: 'text-[#d29bff]',
  function: 'text-[#79c0ff]',
  number: 'text-[#f5a97f]',
  string: 'text-[#7ee787]',
  comment: 'text-[#7d8590] italic',
  preprocessor: 'text-[#c792ea]',
};

export interface EditorEditResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function applyEnterIndentation(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  language: 'cpp17' | 'python3'
): EditorEditResult {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  const lineStart = before.lastIndexOf('\n') + 1;
  const lineBefore = before.slice(lineStart);
  const indentMatch = lineBefore.match(/^[ \t]*/);
  const baseIndent = indentMatch ? indentMatch[0] : '';
  const trimmedBefore = lineBefore.trimEnd();

  const nextNewline = after.indexOf('\n');
  const lineAfter = nextNewline === -1 ? after : after.slice(0, nextNewline);
  const trimmedAfterStart = lineAfter.replace(/^[ \t]+/, '');

  // Case 1: Enter right between `{` and `}` in C++ -> split across 3 lines with indented inner line
  if (language === 'cpp17' && trimmedBefore.endsWith('{') && trimmedAfterStart.startsWith('}')) {
    const innerIndent = `${baseIndent}    `;
    const restAfter = lineAfter.slice(lineAfter.length - trimmedAfterStart.length) + (nextNewline === -1 ? '' : after.slice(nextNewline));
    const inserted = `\n${innerIndent}\n${baseIndent}`;
    const nextValue = before + inserted + restAfter;
    const caret = before.length + 1 + innerIndent.length;
    return { value: nextValue, selectionStart: caret, selectionEnd: caret };
  }

  // Case 2: Line ends with block opener (`{` or C++ label `:`, or Python `:`)
  let shouldIndent = false;
  if (language === 'cpp17') {
    if (
      trimmedBefore.endsWith('{') ||
      /^(case\b.*|default|public|private|protected)\s*:$/.test(trimmedBefore.trim())
    ) {
      shouldIndent = true;
    }
  } else {
    // Python: colon not inside trailing comment
    const withoutComment = trimmedBefore.replace(/#.*$/, '').trimEnd();
    if (withoutComment.endsWith(':')) {
      shouldIndent = true;
    }
  }

  const nextIndent = shouldIndent ? `${baseIndent}    ` : baseIndent;
  // Strip any leading spaces immediately right of caret so cursor doesn't push existing indent further right
  const cleanAfter = after.replace(/^[ \t]+/, (ws) => {
    // Only strip horizontal whitespace on the remainder of the current line
    return nextNewline === 0 ? ws : '';
  });
  const nextValue = `${before}\n${nextIndent}${cleanAfter}`;
  const caret = before.length + 1 + nextIndent.length;
  return { value: nextValue, selectionStart: caret, selectionEnd: caret };
}

export function applyClosingBraceDedent(
  value: string,
  selectionStart: number,
  selectionEnd: number
): EditorEditResult | null {
  if (selectionStart !== selectionEnd) return null;
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineBefore = before.slice(lineStart);

  // Only auto-dedent when typing `}` on a line containing only indentation whitespace
  if (!/^[ \t]+$/.test(lineBefore)) return null;

  let dedented = lineBefore;
  if (lineBefore.endsWith('    ')) {
    dedented = lineBefore.slice(0, -4);
  } else if (lineBefore.endsWith('\t')) {
    dedented = lineBefore.slice(0, -1);
  } else {
    dedented = '';
  }

  const nextBefore = before.slice(0, lineStart) + dedented + '}';
  const nextValue = nextBefore + after;
  const caret = nextBefore.length;
  return { value: nextValue, selectionStart: caret, selectionEnd: caret };
}

export function applyTabIndentation(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  shiftKey: boolean
): EditorEditResult {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);

  // Single cursor or inline selection without newlines
  if (!selected.includes('\n')) {
    if (!shiftKey) {
      const nextValue = value.slice(0, selectionStart) + '    ' + value.slice(selectionEnd);
      const caret = selectionStart + 4;
      return { value: nextValue, selectionStart: caret, selectionEnd: caret };
    }
    const lineStart = before.lastIndexOf('\n') + 1;
    const linePrefix = before.slice(lineStart);
    let removed = 0;
    if (linePrefix.startsWith('    ')) removed = 4;
    else if (linePrefix.startsWith('\t')) removed = 1;
    else {
      const m = linePrefix.match(/^ +/);
      if (m) removed = Math.min(4, m[0].length);
    }
    if (removed === 0) {
      return { value, selectionStart, selectionEnd };
    }
    const nextValue = value.slice(0, lineStart) + value.slice(lineStart + removed);
    const nextStart = Math.max(lineStart, selectionStart - removed);
    const nextEnd = Math.max(lineStart, selectionEnd - removed);
    return { value: nextValue, selectionStart: nextStart, selectionEnd: nextEnd };
  }

  // Multi-line selection
  const blockStart = before.lastIndexOf('\n') + 1;
  const lineEndIdx = value.indexOf('\n', selectionEnd);
  const blockEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
  const lines = value.slice(blockStart, blockEnd).split('\n');

  let firstDelta = 0;
  let totalDelta = 0;
  const updatedLines = lines.map((ln, idx) => {
    if (!shiftKey) {
      if (idx === 0) firstDelta = 4;
      totalDelta += 4;
      return '    ' + ln;
    }
    let removed = 0;
    if (ln.startsWith('    ')) removed = 4;
    else if (ln.startsWith('\t')) removed = 1;
    else {
      const m = ln.match(/^ +/);
      if (m) removed = Math.min(4, m[0].length);
    }
    if (idx === 0) firstDelta = -removed;
    totalDelta -= removed;
    return ln.slice(removed);
  });

  const nextValue = value.slice(0, blockStart) + updatedLines.join('\n') + value.slice(blockEnd);
  return {
    value: nextValue,
    selectionStart: Math.max(blockStart, selectionStart + firstDelta),
    selectionEnd: Math.max(blockStart, selectionEnd + totalDelta),
  };
}
