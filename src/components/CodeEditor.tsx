import React, { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
  const lineCount = useMemo(() => Math.max(12, value.split('\n').length), [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmitShortcut) {
      e.preventDefault();
      onSubmitShortcut();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + '    ' + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-200">
            {language === 'cpp17' ? 'main.cpp · C++17' : 'main.py · Python 3'}
          </span>
          <span className="hidden sm:inline text-slate-500">
            {locale === 'vi' ? 'Tab = 4 khoảng trắng · Ctrl+Enter để nộp' : 'Tab = 4 spaces · Ctrl+Enter to submit'}
          </span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === 'vi' ? 'Đặt lại mẫu' : 'Reset template'}</span>
          </button>
        )}
      </div>

      <div className="relative flex font-mono text-sm leading-6 overflow-auto" style={{ minHeight }}>
        <div
          aria-hidden="true"
          className="select-none py-3 px-3 text-right text-slate-600 bg-slate-900/50 border-r border-slate-800 tabular-nums shrink-0"
        >
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          aria-label={locale === 'vi' ? 'Trình soạn thảo mã nguồn' : 'Source code editor'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 w-full bg-transparent text-slate-100 p-3 resize-none focus:outline-none leading-6 font-mono"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
