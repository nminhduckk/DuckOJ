import React, { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  applyClosingBraceDedent,
  applyEnterIndentation,
  applyTabIndentation,
  TOKEN_COLOR_CLASS,
  tokenizeCodeLines,
} from '../lib/codeHighlight';

export const DEFAULT_TEMPLATES: Record<'cpp17' | 'python3', string> = {
  cpp17: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`,
  python3: `import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return

if __name__ == '__main__':
    solve()
`,
};

export function CodeEditor({
  value,
  onChange,
  language,
  onReset,
  onSubmitShortcut,
  minHeight = '380px',
}: {
  value: string;
  onChange: (next: string) => void;
  language: 'cpp17' | 'python3';
  onReset?: () => void;
  onSubmitShortcut?: () => void;
  minHeight?: string;
}) {
  const { locale } = useApp();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const tokenLines = useMemo(() => tokenizeCodeLines(value, language), [value, language]);
  const lineCount = Math.max(12, tokenLines.length);

  const applyEdit = (nextValue: string, selStart: number, selEnd: number) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(selStart, selEnd);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmitShortcut) {
      e.preventDefault();
      onSubmitShortcut();
      return;
    }

    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const res = applyEnterIndentation(value, start, end, language);
      applyEdit(res.value, res.selectionStart, res.selectionEnd);
      return;
    }

    if (e.key === '}' && language === 'cpp17' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const res = applyClosingBraceDedent(value, start, end);
      if (res) {
        e.preventDefault();
        applyEdit(res.value, res.selectionStart, res.selectionEnd);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const res = applyTabIndentation(value, start, end, e.shiftKey);
      applyEdit(res.value, res.selectionStart, res.selectionEnd);
    }
  };

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] text-[#e2e8f0] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117] text-xs text-slate-400">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono font-medium text-slate-200 whitespace-nowrap">
            {language === 'cpp17' ? 'main.cpp · C++17' : 'main.py · Python 3'}
          </span>
          <span className="hidden sm:inline text-slate-500 truncate">
            {locale === 'vi'
              ? 'Tự động căn lề · Ctrl+Enter để nộp'
              : 'Auto-indent · Ctrl+Enter to submit'}
          </span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#30363d] bg-[#161b22] text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1f242c] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === 'vi' ? 'Khôi phục mẫu' : 'Reset template'}</span>
          </button>
        )}
      </div>

      <div
        className="relative flex items-start font-mono text-sm leading-6 max-h-[560px] overflow-auto bg-[#0d1117]"
        style={{ minHeight }}
      >
        <div
          aria-hidden="true"
          className="sticky left-0 z-10 select-none py-3 px-3 min-w-[2.75rem] text-right text-[#525b68] bg-[#0d1117] border-r border-[#21262d] tabular-nums shrink-0 min-h-full"
        >
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        <div className="relative flex-1 min-w-max min-h-full" style={{ minHeight }}>
          <pre
            aria-hidden="true"
            className="m-0 p-3 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none min-w-full"
            style={{ tabSize: 4 }}
          >
            <code>
              {tokenLines.map((lineTokens, lineIdx) => (
                <span key={lineIdx} className="block">
                  {lineTokens.length === 0 ? (
                    '\u200b'
                  ) : (
                    lineTokens.map((tok, tokIdx) => (
                      <span key={tokIdx} className={TOKEN_COLOR_CLASS[tok.type]}>
                        {tok.text}
                      </span>
                    ))
                  )}
                </span>
              ))}
            </code>
          </pre>

          <textarea
            ref={textareaRef}
            aria-label={locale === 'vi' ? 'Trình soạn thảo mã nguồn' : 'Source code editor'}
            value={value}
            wrap="off"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full m-0 p-3 bg-transparent text-transparent caret-[#e6edf3] selection:bg-[#388bfd]/30 resize-none focus:outline-none leading-6 font-mono text-sm whitespace-pre overflow-hidden"
            style={{ tabSize: 4 }}
          />
        </div>
      </div>
    </div>
  );
}
