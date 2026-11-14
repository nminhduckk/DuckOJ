import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Cpu,
  FileWarning,
  Loader2,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';
import type { LessonStatus, ProblemStatus, Verdict } from '../types/duckoj';
import { useApp } from '../context/AppContext';

export function VerdictBadge({
  verdict,
  status,
  compact = false,
}: {
  verdict?: Verdict | null;
  status?: 'queued' | 'judging' | 'done' | 'system_error' | string;
  compact?: boolean;
}) {
  const { locale } = useApp();

  if (!verdict && (status === 'queued' || status === 'judging')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 tabular-nums whitespace-nowrap">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span>{status === 'queued' ? (locale === 'vi' ? 'Đang chờ' : 'Queued') : locale === 'vi' ? 'Đang chấm' : 'Judging'}</span>
      </span>
    );
  }

  const v = verdict || 'SE';
  const cfg: Record<
    Verdict,
    { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    AC: {
      label: compact ? 'AC' : 'AC · Chính xác',
      color: 'text-emerald-700 dark:text-emerald-400',
      Icon: CheckCircle2,
    },
    WA: {
      label: compact ? 'WA' : 'WA · Sai kết quả',
      color: 'text-rose-700 dark:text-rose-400',
      Icon: XCircle,
    },
    TLE: {
      label: compact ? 'TLE' : 'TLE · Quá thời gian',
      color: 'text-amber-700 dark:text-amber-400',
      Icon: Clock,
    },
    MLE: {
      label: compact ? 'MLE' : 'MLE · Quá bộ nhớ',
      color: 'text-amber-700 dark:text-amber-400',
      Icon: Cpu,
    },
    RE: {
      label: compact ? 'RE' : 'RE · Lỗi thực thi',
      color: 'text-orange-700 dark:text-orange-400',
      Icon: AlertTriangle,
    },
    CE: {
      label: compact ? 'CE' : 'CE · Lỗi biên dịch',
      color: 'text-slate-700 dark:text-slate-300',
      Icon: Terminal,
    },
    OLE: {
      label: compact ? 'OLE' : 'OLE · Quá đầu ra',
      color: 'text-amber-700 dark:text-amber-400',
      Icon: FileWarning,
    },
    SE: {
      label: compact ? 'SE' : 'SE · Lỗi hệ thống',
      color: 'text-rose-700 dark:text-rose-400',
      Icon: AlertTriangle,
    },
  };

  const { label, color, Icon } = cfg[v] || cfg.SE;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold whitespace-nowrap ${color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function ProblemStatusLabel({ status }: { status: ProblemStatus }) {
  const { t } = useApp();
  if (status === 'mastered') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{t.probMastered}</span>
      </span>
    );
  }
  if (status === 'solved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{t.probSolved}</span>
      </span>
    );
  }
  if (status === 'attempted') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{t.probAttempted}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
      <Circle className="w-3.5 h-3.5 shrink-0" />
      <span>{t.probNotStarted}</span>
    </span>
  );
}

export function LessonStatusLabel({ status }: { status: LessonStatus }) {
  const { t } = useApp();
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{t.statusDone}</span>
      </span>
    );
  }
  if (status === 'reading') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>{t.statusReading}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
      <Circle className="w-3.5 h-3.5 shrink-0" />
      <span>{t.statusNotStarted}</span>
    </span>
  );
}
