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
    startFromZero: 'Bắt đầu học từ Cấp 0',
    continueLearning: 'Học tiếp',
    themeLight: 'Chế độ sáng',
    themeDark: 'Chế độ tối',
    statusNotStarted: 'Chưa học',
    statusReading: 'Đang học',
    statusDone: 'Đã xong',
    probNotStarted: 'Chưa làm',
    probAttempted: 'Đang làm',
    probSolved: 'Đã làm đúng',
    probMastered: 'Đã vững',
    submitCode: 'Nộp bài',
    submitting: 'Đang chấm...',
    nativeBadge: 'Chấm trên web',
    externalBadge: 'Nguồn ngoài',
    updating: 'Đang cập nhật',
    reportIssue: 'Báo lỗi',
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
    reportIssue: 'Report Issue',
  },
} as const;

const ROLE_LABELS: Record<Locale, Record<string, string>> = {
  vi: { student: 'Học viên', reviewer: 'Người duyệt bài', admin: 'Quản trị viên' },
  en: { student: 'Student', reviewer: 'Reviewer', admin: 'Admin' },
};

const HINT_TYPE_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    nudge: 'Gợi mở',
    approach: 'Cách làm',
    idea: 'Ý tưởng chính',
    code: 'Code mẫu',
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
    handbook: 'Tài liệu tổng hợp',
    docs: 'Tài liệu hướng dẫn',
    wiki: 'Từ điển thuật toán',
    'cp-algorithms': 'Bài viết CP-Algorithms',
    usaco: 'Hướng dẫn USACO',
    codeforces: 'Bài viết Codeforces',
    oj: 'Trang luyện tập',
    editorial: 'Lời giải mẫu',
    book: 'Sách tham khảo',
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
    tokens: 'So khớp giá trị (bỏ qua khoảng trắng thừa)',
    lines: 'So khớp từng dòng',
    float: 'Số thực (có sai số cho phép)',
    float_1e6: 'Số thực (sai số ≤ 10⁻⁶)',
    float_1e9: 'Số thực (sai số ≤ 10⁻⁹)',
    custom: 'Chấp nhận nhiều đáp án đúng',
  },
  en: {
    tokens: 'Token comparison',
    lines: 'Line-by-line comparison',
    float: 'Float (with tolerance)',
    float_1e6: 'Float (tol 10⁻⁶)',
    float_1e9: 'Float (tol 10⁻⁹)',
    custom: 'Custom checker (multi-answer)',
  },
};

const TIER_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    'Khởi động': 'Khởi động',
    'Luyện tập': 'Luyện tập',
    'Thử thách': 'Thử thách',
  },
  en: {
    'Khởi động': 'Warm-up',
    'Luyện tập': 'Practice',
    'Thử thách': 'Challenge',
  },
};

const TRACK_LABELS: Record<Locale, Record<number, { name: string; description: string; range?: string }>> = {
  vi: {
    0: {
      name: 'Nhập môn',
      description: 'Làm quen C++, nhập xuất dữ liệu, kiểu số, vòng lặp, mảng, chuỗi và toán cơ bản.',
    },
    1: {
      name: 'Cơ bản',
      description: 'Duyệt các trường hợp, sắp xếp, xử lý chuỗi, tham lam, hai con trỏ và mảng cộng dồn.',
    },
    2: {
      name: 'Cơ bản+',
      description: 'Dùng thành thạo STL, cửa sổ trượt, tìm kiếm nhị phân, đếm nhanh, sàng số nguyên tố.',
    },
    3: {
      name: 'Trung cấp 1',
      description: 'Quy hoạch động cơ bản và trên lưới, duyệt đồ thị DFS/BFS, DSU và nhân ma trận.',
    },
    4: {
      name: 'Trung cấp 2',
      description: 'Đường đi ngắn nhất, cây khung nhỏ nhất, Fenwick, Segment Tree và khớp chuỗi.',
    },
    5: {
      name: 'Nâng cao',
      description: 'LCA, HLD, Centroid, thành phần liên thông mạnh, luồng cực đại và lý thuyết trò chơi.',
    },
    6: {
      name: 'Chuyên gia',
      description: 'FFT/NTT, Persistent Segment Tree, Li Chao, hình học tính toán và Suffix Automaton.',
    },
  },
  en: {
    0: {
      name: 'Introduction',
      description: 'C++ syntax, fast I/O, integer types & overflow, loops, arrays, strings, and basic number theory.',
      range: 'Core C++ fundamentals',
    },
    1: {
      name: 'Fundamentals',
      description: 'Brute force, sorting, string processing, basic math, simulation, constructive problems, greedy, two pointers, and prefix sums.',
    },
    2: {
      name: 'Fundamentals+',
      description: 'STL containers, sliding window, binary search on answer, hash-map counting, Sieve of Eratosthenes, and binary exponentiation.',
    },
    3: {
      name: 'Intermediate I',
      description: '1D & grid DP, DFS/BFS traversal, Disjoint Set Union, linear sieve, matrix exponentiation, and DAG dynamic programming.',
    },
    4: {
      name: 'Intermediate II',
      description: 'Shortest paths (Dijkstra, Bellman-Ford, Floyd), MST, Fenwick & Segment Trees, Bitmask DP, Tree DP, and KMP/Hashing.',
    },
    5: {
      name: 'Advanced',
      description: 'LCA, HLD, Centroid Decomposition, SCC, bridges & articulation points, Max Flow, matching, CHT, Mo’s algorithm, and Sprague-Grundy.',
    },
    6: {
      name: 'Expert',
      description: 'FFT/NTT, Persistent Segment Tree, Li Chao Tree, Link-Cut Tree, computational geometry, Min-Cost Flow, Matroids, and Suffix Automaton.',
    },
  },
};

const TOPIC_EN_LABELS: Record<string, string> = {
  implementation: 'Implementation',
  math: 'Math',
  graphs: 'Graphs',
  trees: 'Trees',
  'data-structures': 'Data Structures',
  strings: 'Strings',
  dp: 'Dynamic Programming',
  'number-theory': 'Number Theory',
  combinatorics: 'Combinatorics',
  constructive: 'Constructive',
  io: 'Standard I/O',
  overflow: 'Integer Overflow',
  'data-types': 'Data Types',
  arrays: 'Arrays',
  loops: 'Loops',
  functions: 'Functions',
  complexity: 'Time Complexity',
  'frequency-count': 'Frequency Counting',
  simulation: 'Simulation',
  'string-basics': 'Basic Strings',
  'gcd-lcm': 'GCD & LCM',
  modulo: 'Modular Arithmetic',
  'primality-basic': 'Primality Test',
  'brute-force': 'Brute Force',
  bitmasks: 'Bitmasks',
  backtracking: 'Backtracking',
  sortings: 'Sorting',
  comparator: 'Custom Comparators',
  'string-search': 'String Matching',
  'char-count': 'Character Counting',
  primes: 'Prime Numbers',
  divisors: 'Divisors',
  'ad-hoc': 'Ad Hoc',
  greedy: 'Greedy',
  'interval-scheduling': 'Interval Scheduling',
  'two-pointers': 'Two Pointers',
  'prefix-sum': 'Prefix Sums',
  stl: 'C++ STL',
  'set-map': 'Set & Map',
  'priority-queue': 'Priority Queue',
  'prefix-sum-2d': '2D Prefix Sums',
  'sliding-window': 'Sliding Window',
  'binary-search': 'Binary Search',
  'binary-search-answer': 'Binary Search on Answer',
  scheduling: 'Scheduling',
  counting: 'Counting',
  'hash-map': 'Hash Map',
  sieve: 'Sieve of Eratosthenes',
  'fast-power': 'Fast Exponentiation',
  modpow: 'Modular Exponentiation',
  'binomial-mod': 'Binomial Modulo',
  'modular-inverse': 'Modular Inverse',
  knapsack: 'Knapsack DP',
  lis: 'Longest Increasing Subsequence',
  lcs: 'Longest Common Subsequence',
  'edit-distance': 'Edit Distance',
  'grid-dp': 'Grid DP',
  dfs: 'Depth-First Search',
  bfs: 'Breadth-First Search',
  'connected-components': 'Connected Components',
  dsu: 'Disjoint Set Union',
  'linear-sieve': 'Linear Sieve',
  spf: 'Smallest Prime Factor',
  'matrix-exp': 'Matrix Exponentiation',
  lucas: 'Lucas Theorem',
  catalan: 'Catalan Numbers',
  'divisor-dp': 'Divisor DP',
  'dag-dp': 'DAG DP',
  'topo-sort': 'Topological Sort',
  dijkstra: 'Dijkstra',
  'shortest-paths': 'Shortest Paths',
  'bellman-ford': 'Bellman-Ford',
  'negative-cycle': 'Negative Cycles',
  'floyd-warshall': 'Floyd-Warshall',
  mst: 'Minimum Spanning Tree',
  kruskal: 'Kruskal’s Algorithm',
  prim: 'Prim’s Algorithm',
  fenwick: 'Fenwick Tree (BIT)',
  'segment-tree': 'Segment Tree',
  'lazy-propagation': 'Lazy Propagation',
  'sparse-table': 'Sparse Table',
  rmq: 'Range Min/Max Query',
  'bitmask-dp': 'Bitmask DP',
  'tree-dp': 'Tree DP',
  rerooting: 'Tree Rerooting',
  'string-hash': 'String Hashing',
  hashing: 'Hashing',
  kmp: 'KMP Algorithm',
  'z-function': 'Z-Function',
  lca: 'Lowest Common Ancestor',
  'binary-lifting': 'Binary Lifting',
  hld: 'Heavy-Light Decomposition',
  centroid: 'Centroid Decomposition',
  'divide-and-conquer': 'Divide and Conquer',
  scc: 'Strongly Connected Components',
  '2-sat': '2-SAT',
  bridges: 'Bridges',
  'articulation-points': 'Articulation Points',
  'max-flow': 'Max Flow',
  'min-cut': 'Min Cut',
  flows: 'Network Flow',
  'bipartite-matching': 'Bipartite Matching',
  hungarian: 'Hungarian Algorithm',
  cht: 'Convex Hull Trick',
  'dnc-opt': 'D&C DP Optimization',
  mo: 'Mo’s Algorithm',
  'sqrt-decomp': 'Square-Root Decomposition',
  'sprague-grundy': 'Sprague-Grundy',
  nim: 'Nim Game',
  games: 'Game Theory',
  'fft-ntt': 'FFT / NTT',
  'persistent-seg': 'Persistent Segment Tree',
  'li-chao': 'Li Chao Tree',
  'link-cut': 'Link-Cut Tree',
  splay: 'Splay Tree',
  geometry: 'Computational Geometry',
  'convex-hull': 'Convex Hull',
  'line-intersection': 'Line Intersection',
  'min-cost-flow': 'Min-Cost Flow',
  matroid: 'Matroid',
  'broken-profile': 'Broken Profile DP',
  'small-to-large': 'Small-to-Large Merging',
  'suffix-automaton': 'Suffix Automaton',
  eertree: 'Eertree (Palindromic Tree)',
  probabilities: 'Probabilities',
};

const REVIEW_STATUS_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối',
    auto_rejected: 'Từ chối tự động',
  },
  en: {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    auto_rejected: 'Auto-rejected',
  },
};

const TOPIC_FIT_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    strong: 'Khớp tốt',
    weak: 'Khớp yếu',
    none: 'Không khớp',
  },
  en: {
    strong: 'Strong',
    weak: 'Weak',
    none: 'None',
  },
};

const REPORT_STATUS_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    open: 'Đang mở',
    resolved: 'Đã xử lý',
    dismissed: 'Đã bỏ qua',
  },
  en: {
    open: 'Open',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  },
};

const REPORT_TARGET_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    lesson: 'Bài học',
    problem: 'Bài tập',
    test: 'Bộ test',
    copyright: 'Bản quyền',
    other: 'Góp ý khác',
  },
  en: {
    lesson: 'Lesson',
    problem: 'Problem',
    test: 'Test case',
    copyright: 'Copyright',
    other: 'Other',
  },
};

const REVIEW_ACTION_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    approve: 'đã duyệt',
    reject: 'đã từ chối',
    request_changes: 'yêu cầu chỉnh sửa',
    restore_pending: 'đã đưa về chờ duyệt',
  },
  en: {
    approve: 'approved',
    reject: 'rejected',
    request_changes: 'requested changes for',
    restore_pending: 'restored to pending for',
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

export function formatTier(tier: string, locale: Locale): string {
  return TIER_LABELS[locale][tier] || tier;
}

export function formatLanguage(lang: string): string {
  if (lang === 'cpp17') return 'C++17';
  if (lang === 'python3') return 'Python 3';
  return lang;
}

export function formatTrack(trackId: number, fallbackName: string, locale: Locale): string {
  return TRACK_LABELS[locale][trackId]?.name || fallbackName;
}

export function formatTrackDescription(trackId: number, fallbackDesc: string, locale: Locale): string {
  return TRACK_LABELS[locale][trackId]?.description || fallbackDesc;
}

export function formatTrackRange(trackId: number, fallbackRange: string, locale: Locale): string {
  return TRACK_LABELS[locale][trackId]?.range || fallbackRange;
}

export function formatTrackDuration(duration: string, locale: Locale): string {
  if (locale === 'vi') return duration;
  const map: Record<string, string> = {
    '2–3 tuần': '2–3 weeks',
    '1–2 tháng': '1–2 months',
    '2–3 tháng': '2–3 months',
    '3–6 tháng': '3–6 months',
    'Dài hạn': 'Long-term',
  };
  return map[duration] || duration;
}

export function formatTopic(slug: string, fallbackNameVi: string, locale: Locale): string {
  if (locale === 'en') return TOPIC_EN_LABELS[slug] || fallbackNameVi;
  return fallbackNameVi;
}

export function formatReviewStatus(status: string, locale: Locale): string {
  return REVIEW_STATUS_LABELS[locale][status] || status;
}

export function formatTopicFit(fit: string, locale: Locale): string {
  return TOPIC_FIT_LABELS[locale][fit] || fit;
}

export function formatReportStatus(status: string, locale: Locale): string {
  return REPORT_STATUS_LABELS[locale][status] || status;
}

export function formatReportTargetType(targetType: string, locale: Locale): string {
  return REPORT_TARGET_LABELS[locale][targetType] || targetType;
}

export function formatReviewAction(action: string, locale: Locale): string {
  return REVIEW_ACTION_LABELS[locale][action] || action;
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
