import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCodeBlockLanguage,
  TOKEN_COLOR_CLASS,
  tokenizeCodeLines,
} from '../lib/codeHighlight';

export function HighlightedCodeBlock({
  code,
  language,
  showHeader = true,
  showLineNumbers = true,
  className = '',
}: {
  code: string;
  language?: string;
  showHeader?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}) {
  const { locale } = useApp();
  const [copied, setCopied] = useState(false);

  const normalizedCode = useMemo(() => code.replace(/\n$/, ''), [code]);
  const tokenLines = useMemo(
    () => tokenizeCodeLines(normalizedCode, language),
    [normalizedCode, language]
  );
  const langLabel = useMemo(
    () => formatCodeBlockLanguage(language, locale),
    [language, locale]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className={`rounded-xl border border-[#21262d] bg-[#0d1117] text-[#e2e8f0] overflow-hidden ${className}`}
    >
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117] text-xs text-slate-400">
          <span className="font-mono font-medium text-slate-300">{langLabel}</span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={locale === 'vi' ? 'Sao chép mã nguồn' : 'Copy code'}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#30363d] bg-[#161b22] text-xs font-semibold text-slate-100 hover:bg-[#1f242c] transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span>
              {copied
                ? locale === 'vi'
                  ? 'Đã sao chép'
                  : 'Copied'
                : locale === 'vi'
                  ? 'Sao chép'
                  : 'Copy'}
            </span>
          </button>
        </div>
      )}

      <div className="flex items-start overflow-x-auto text-[13.5px] sm:text-sm leading-6 font-mono">
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="sticky left-0 z-10 select-none py-3.5 px-3 min-w-[2.75rem] text-right text-[#525b68] bg-[#0d1117] border-r border-[#21262d] tabular-nums shrink-0"
          >
            {tokenLines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
        )}

        <pre className="m-0 py-3.5 px-4 font-mono whitespace-pre flex-1 min-w-0">
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
      </div>
    </div>
  );
}
