import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { useApp } from '../context/AppContext';

export function ReportModal({
  open,
  onClose,
  defaultType = 'problem',
  defaultTargetId = '',
}: {
  open: boolean;
  onClose: () => void;
  defaultType?: 'lesson' | 'problem' | 'test' | 'copyright' | 'other';
  defaultTargetId?: string;
}) {
  const { locale } = useApp();
  const [targetType, setTargetType] = useState<'lesson' | 'problem' | 'test' | 'copyright' | 'other'>(defaultType);
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ id: number }>('/reports', {
        method: 'POST',
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId.trim() || 'general',
          message: message.trim(),
        }),
      });
      setSuccessId(res.id);
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === 'vi' ? 'Không thể gửi báo cáo.' : 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 id="report-modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {locale === 'vi' ? 'Báo lỗi / Khiếu nại bản quyền' : 'Report Issue / Copyright'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'vi' ? 'Đóng hộp thoại' : 'Close dialog'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successId !== null ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {locale === 'vi'
                ? `Đã ghi nhận báo cáo #${successId}. Đội ngũ quản trị DuckOJ sẽ kiểm tra và xử lý sớm.`
                : `Report #${successId} recorded. The DuckOJ team will review it shortly.`}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSuccessId(null);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium"
              >
                {locale === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'vi' ? 'Phân loại' : 'Category'}
              </label>
              <select
                id="report-type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="problem">{locale === 'vi' ? 'Lỗi đề bài / link bài tập' : 'Problem / link error'}</option>
                <option value="test">{locale === 'vi' ? 'Lỗi bộ test / trình chấm' : 'Test case / judge issue'}</option>
                <option value="lesson">{locale === 'vi' ? 'Lỗi nội dung bài học' : 'Lesson content issue'}</option>
                <option value="copyright">{locale === 'vi' ? 'Báo cáo bản quyền' : 'Copyright concern'}</option>
                <option value="other">{locale === 'vi' ? 'Góp ý khác' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label htmlFor="report-target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'vi' ? 'Mã bài học / slug bài tập' : 'Lesson code / problem slug'}
              </label>
              <input
                id="report-target"
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={locale === 'vi' ? 'Ví dụ: nat-sum-diff hoặc 0.1' : 'e.g. nat-sum-diff or 0.1'}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="report-msg" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'vi' ? 'Mô tả chi tiết' : 'Details'}
              </label>
              <textarea
                id="report-msg"
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  locale === 'vi'
                    ? 'Mô tả lỗi bạn gặp hoặc đường dẫn cần gỡ...'
                    : 'Describe the issue or takedown request...'
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {locale === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting
                  ? locale === 'vi'
                    ? 'Đang gửi...'
                    : 'Sending...'
                  : locale === 'vi'
                    ? 'Gửi báo cáo'
                    : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
