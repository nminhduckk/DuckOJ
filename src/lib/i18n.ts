export type Locale = 'vi' | 'en';

export const MESSAGES = {
  vi: {
    brand: 'DuckOJ',
    navRoadmap: 'Lộ trình',
    navLearn: 'Bài học',
    navProblems: 'Bài tập',
    navContests: 'Kỳ thi',
    navSubmissions: 'Bài nộp',
    navMe: 'Tiến độ',
    navAdmin: 'Quản trị',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    startFromZero: 'Bắt đầu từ Cấp 0',
    continueLearning: 'Học tiếp',
    themeLight: 'Giao diện sáng',
    themeDark: 'Giao diện tối',
    statusNotStarted: 'Chưa học',
    statusReading: 'Đang học',
    statusDone: 'Hoàn thành',
    probNotStarted: 'Chưa làm',
    probAttempted: 'Đang thử',
    probSolved: 'Đã giải',
    probMastered: 'Thành thạo',
    submitCode: 'Nộp bài',
    submitting: 'Đang chấm...',
    nativeBadge: 'Chấm tại DuckOJ',
    externalBadge: 'Nguồn ngoài',
    updating: 'Đang cập nhật',
    reportIssue: 'Báo lỗi / Bản quyền',
  },
  en: {
    brand: 'DuckOJ',
    navRoadmap: 'Roadmap',
    navLearn: 'Lessons',
    navProblems: 'Problems',
    navContests: 'Contests',
    navSubmissions: 'Submissions',
    navMe: 'Progress',
    navAdmin: 'Admin',
    login: 'Sign in',
    register: 'Register',
    logout: 'Sign out',
    startFromZero: 'Start Level 0',
    continueLearning: 'Continue Learning',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    statusNotStarted: 'Not started',
    statusReading: 'In progress',
    statusDone: 'Completed',
    probNotStarted: 'Unsolved',
    probAttempted: 'Attempted',
    probSolved: 'Solved',
    probMastered: 'Mastered',
    submitCode: 'Submit Solution',
    submitting: 'Judging...',
    nativeBadge: 'DuckOJ Judge',
    externalBadge: 'External Link',
    updating: 'Updating',
    reportIssue: 'Report / Copyright',
  },
} as const;

const ROLE_LABELS: Record<Locale, Record<string, string>> = {
  vi: { student: 'Học viên', reviewer: 'Kiểm duyệt viên', admin: 'Quản trị viên' },
  en: { student: 'Student', reviewer: 'Reviewer', admin: 'Admin' },
};

const HINT_TYPE_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    nudge: 'Gợi mở hướng đi',
    approach: 'Hướng tiếp cận',
    idea: 'Ý tưởng lời giải',
    code: 'Code mẫu tham khảo',
  },
  en: {
    nudge: 'Nudge',
    approach: 'Approach',
    idea: 'Solution Idea',
    code: 'Reference Code',
  },
};

const SOURCE_KIND_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    handbook: 'Giáo trình tổng hợp',
    docs: 'Tài liệu chuẩn',
    wiki: 'Từ điển thuật toán',
    'cp-algorithms': 'Chuyên khảo CP-Algorithms',
    usaco: 'Tài liệu USACO Guide',
    codeforces: 'Bài viết Codeforces',
    oj: 'Hệ thống chấm bài',
    editorial: 'Lời giải tham khảo',
    book: 'Sách chuyên khảo',
  },
  en: {
    handbook: 'Handbook',
    docs: 'Reference Docs',
    wiki: 'Algorithm Wiki',
    'cp-algorithms': 'CP-Algorithms',
    usaco: 'USACO Guide',
    codeforces: 'Codeforces Blog',
    oj: 'Online Judge',
    editorial: 'Editorial',
    book: 'Textbook',
  },
};

const CHECKER_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    tokens: 'So khớp từng token (bỏ qua khoảng trắng thừa)',
    lines: 'So khớp từng dòng',
    float_1e6: 'Số thực (sai số ≤ 10⁻⁶)',
    float_1e9: 'Số thực (sai số ≤ 10⁻⁹)',
    custom: 'Trình chấm riêng (đa nghiệm)',
  },
  en: {
    tokens: 'Token comparison',
    lines: 'Line-by-line comparison',
    float_1e6: 'Float (tol 10⁻⁶)',
    float_1e9: 'Float (tol 10⁻⁹)',
    custom: 'Custom checker',
  },
};

export function formatRole(role: string, locale: Locale): string {
  return ROLE_LABELS[locale][role] || role;
}

export function formatHintType(type: string, locale: Locale): string {
  return HINT_TYPE_LABELS[locale][type] || type;
}

export function formatSourceKind(kind: string, locale: Locale): string {
  return SOURCE_KIND_LABELS[locale][kind] || kind;
}

export function formatChecker(checker: string, locale: Locale): string {
  return CHECKER_LABELS[locale][checker] || checker;
}

export function formatVnDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
