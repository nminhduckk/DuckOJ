import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'style', 'aria-hidden'],
    span: ['className', 'style', 'aria-hidden'],
    div: ['className', 'style'],
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'math',
    'semantics',
    'mrow',
    'mi',
    'mo',
    'mn',
    'msup',
    'msub',
    'msubsup',
    'mfrac',
    'msqrt',
    'mroot',
    'mtable',
    'mtr',
    'mtd',
    'mtext',
    'mspace',
    'mover',
    'munder',
    'annotation',
  ],
};

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const { locale } = useApp();
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <span className="font-mono">{className ? className.replace('language-', '') : 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={locale === 'vi' ? 'Sao chép mã nguồn' : 'Copy code'}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? (locale === 'vi' ? 'Đã chép' : 'Copied') : locale === 'vi' ? 'Sao chép' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;

  return (
    <div
      className={`prose-duck text-slate-700 dark:text-slate-200 leading-relaxed space-y-3 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeSanitize, SANITIZE_SCHEMA], rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-6 mb-3 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mt-5 mb-2.5 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="text-[15px] leading-7 text-slate-700 dark:text-slate-300">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-slate-700 dark:text-slate-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 text-[15px] text-slate-700 dark:text-slate-300">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm text-left border-collapse tabular-nums">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium border-b border-slate-200 dark:border-slate-800">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="px-3.5 py-2.5 font-semibold">{children}</th>,
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = Boolean(codeClass?.startsWith('language-')) || String(children).includes('\n');
            if (isBlock) {
              return <CodeBlock className={codeClass}>{children}</CodeBlock>;
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[13px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
