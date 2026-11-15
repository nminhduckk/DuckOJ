import React from 'react';
import { useApp } from '../context/AppContext';

export function PrivacyPage() {
  const { locale, navigate } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
        {locale === 'vi' ? 'Chính sách quyền riêng tư' : 'Privacy Policy'}
      </h1>
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          {locale === 'vi'
            ? 'DuckOJ chỉ lưu thông tin cần thiết cho việc học: email, tên hiển thị, tên đăng nhập và code bạn nộp.'
            : 'DuckOJ collects only minimal account data required for learning progress and judge submissions: email, display name, handle, and submitted source code.'}
        </p>
        <p>
          {locale === 'vi'
            ? 'Tài khoản được bảo vệ bằng cookie an toàn và không chia sẻ thông tin cá nhân cho bên thứ ba.'
            : 'Authentication uses rotating HttpOnly refresh token cookies and never shares personal information with third parties.'}
        </p>
        <p>
          {locale === 'vi'
            ? 'Bạn có thể xóa vĩnh viễn tài khoản và toàn bộ dữ liệu bất kỳ lúc nào tại trang Tiến độ.'
            : 'You can permanently delete your account and all submission history at any time from your Progress dashboard.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
      >
        ← {locale === 'vi' ? 'Về trang chủ' : 'Back to Home'}
      </button>
    </div>
  );
}

export function TermsPage() {
  const { locale, navigate } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
        {locale === 'vi' ? 'Điều khoản & Bản quyền' : 'Terms of Use & Attribution'}
      </h1>
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          {locale === 'vi'
            ? 'Các bài tập nguồn ngoài (Codeforces, CSES, AtCoder, Library Checker) chỉ gắn tên, chủ đề và liên kết tới trang gốc.'
            : 'External problems (Codeforces, CSES, AtCoder, Library Checker) are indexed via metadata and direct outbound links only; statements remain hosted on their original platforms.'}
        </p>
        <p>
          {locale === 'vi'
            ? '43 bài tập chấm trên web có đề tiếng Việt biên soạn riêng cùng bộ test độc lập.'
            : 'The 43 native DuckOJ problems feature original Vietnamese statements and independently generated test suites.'}
        </p>
        <p>
          {locale === 'vi'
            ? 'Không gửi code tìm cách vượt vùng an toàn của máy chấm. Nếu thấy sai sót hoặc cần góp ý bản quyền, hãy dùng nút Báo lỗi ở cuối trang.'
            : 'Attempting to bypass judge sandbox isolation or abuse system resources is strictly prohibited. Copyright or content issues can be reported via the footer Report modal.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
      >
        ← {locale === 'vi' ? 'Quay lại trang chủ' : 'Back to Home'}
      </button>
    </div>
  );
}
