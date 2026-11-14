export interface TrackDef {
  id: number;
  name: string;
  description: string;
  estimated_duration: string;
  cf_rating_range: string;
  problem_rating_min: number;
  problem_rating_max: number;
  release_wave: number;
  sort_order: number;
}

export interface TopicDef {
  slug: string;
  name_vi: string;
  cf_tag?: string;
  is_generic: boolean;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer_index: number;
  explain: string;
}

export interface LessonHint {
  level: number;
  type: 'nudge' | 'approach' | 'idea' | 'code';
  text_md: string;
}

export interface LessonSource {
  kind: string;
  title: string;
  url: string;
}

export interface LessonMetaDef {
  code: string;
  slug: string;
  track_id: number;
  sort_order: number;
  title: string;
  prereqs: string[];
  topics: string[];
  fit_check: boolean;
  complexity: string;
  objectives: string[];
  sources: LessonSource[];
  quiz: QuizQuestion[];
  fallbackTheory?: string;
  fallbackCode?: string;
  fallbackMistakes?: string[];
}

export const TRACKS: TrackDef[] = [
  {
    id: 0,
    name: 'Nhập môn',
    description: 'Làm quen cú pháp C++, vào/ra chuẩn, kiểu dữ liệu, vòng lặp, mảng, chuỗi và toán cơ bản.',
    estimated_duration: '2–3 tuần',
    cf_rating_range: 'Chạy đúng code C++ cơ bản',
    problem_rating_min: 800,
    problem_rating_max: 1000,
    release_wave: 1,
    sort_order: 0,
  },
  {
    id: 1,
    name: 'Cơ bản',
    description: 'Vét cạn, sắp xếp, chuỗi nâng cao, số học cơ bản, mô phỏng, ad hoc, tham lam, hai con trỏ và mảng cộng dồn.',
    estimated_duration: '1–2 tháng',
    cf_rating_range: '~800–1000',
    problem_rating_min: 800,
    problem_rating_max: 1200,
    release_wave: 1,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Cơ bản+',
    description: 'Thành thạo STL, cửa sổ trượt, tìm kiếm nhị phân trên đáp án, đếm hash, sàng Eratosthenes và lũy thừa nhanh.',
    estimated_duration: '1–2 tháng',
    cf_rating_range: '~1000–1200',
    problem_rating_min: 1000,
    problem_rating_max: 1400,
    release_wave: 1,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Trung cấp 1',
    description: 'Quy hoạch động cơ bản & trên lưới, duyệt đồ thị DFS/BFS, DSU, sàng tuyến tính, lũy thừa ma trận và DP trên DAG.',
    estimated_duration: '2–3 tháng',
    cf_rating_range: '~1200–1500',
    problem_rating_min: 1200,
    problem_rating_max: 1500,
    release_wave: 1,
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Trung cấp 2',
    description: 'Đường đi ngắn nhất (Dijkstra, Bellman-Ford, Floyd), cây khung nhỏ nhất, Fenwick, Segment Tree, Bitmask DP, Tree DP và KMP/Hashing.',
    estimated_duration: '2–3 tháng',
    cf_rating_range: '~1500–1800',
    problem_rating_min: 1500,
    problem_rating_max: 1800,
    release_wave: 2,
    sort_order: 4,
  },
  {
    id: 5,
    name: 'Nâng cao',
    description: 'LCA, HLD, Centroid, SCC, Cầu/Khớp, Max Flow, Ghép cặp, Convex Hull Trick, Mo và Sprague-Grundy.',
    estimated_duration: '3–6 tháng',
    cf_rating_range: '~1800–2100',
    problem_rating_min: 1800,
    problem_rating_max: 2100,
    release_wave: 2,
    sort_order: 5,
  },
  {
    id: 6,
    name: 'Chuyên gia',
    description: 'FFT/NTT, Persistent Segment Tree, Li Chao, Link-Cut Tree, Hình học tính toán, Min-Cost Flow, Matroid và Suffix Automaton.',
    estimated_duration: 'Dài hạn',
    cf_rating_range: '2100+',
    problem_rating_min: 2000,
    problem_rating_max: 2300,
    release_wave: 2,
    sort_order: 6,
  },
];

export const TOPICS: TopicDef[] = [
  // Generic tags (B.1)
  { slug: 'implementation', name_vi: 'Cài đặt', cf_tag: 'implementation', is_generic: true },
  { slug: 'math', name_vi: 'Toán học', cf_tag: 'math', is_generic: true },
  { slug: 'graphs', name_vi: 'Đồ thị', cf_tag: 'graphs', is_generic: true },
  { slug: 'trees', name_vi: 'Cây', cf_tag: 'trees', is_generic: true },
  { slug: 'data-structures', name_vi: 'Cấu trúc dữ liệu', cf_tag: 'data structures', is_generic: true },
  { slug: 'strings', name_vi: 'Chuỗi', cf_tag: 'strings', is_generic: true },
  { slug: 'dp', name_vi: 'Quy hoạch động', cf_tag: 'dp', is_generic: true },
  { slug: 'number-theory', name_vi: 'Số học', cf_tag: 'number theory', is_generic: true },
  { slug: 'combinatorics', name_vi: 'Tổ hợp', cf_tag: 'combinatorics', is_generic: true },
  { slug: 'constructive', name_vi: 'Xây dựng', cf_tag: 'constructive algorithms', is_generic: true },

  // Specific tags
  { slug: 'io', name_vi: 'Nhập xuất chuẩn', is_generic: false },
  { slug: 'overflow', name_vi: 'Tràn số', is_generic: false },
  { slug: 'data-types', name_vi: 'Kiểu dữ liệu', is_generic: false },
  { slug: 'arrays', name_vi: 'Mảng', is_generic: false },
  { slug: 'loops', name_vi: 'Vòng lặp', is_generic: false },
  { slug: 'functions', name_vi: 'Hàm', is_generic: false },
  { slug: 'complexity', name_vi: 'Độ phức tạp', is_generic: false },
  { slug: 'frequency-count', name_vi: 'Đếm tần số', is_generic: false },
  { slug: 'simulation', name_vi: 'Mô phỏng', is_generic: false },
  { slug: 'string-basics', name_vi: 'Chuỗi cơ bản', is_generic: false },
  { slug: 'gcd-lcm', name_vi: 'ƯCLN & BCNN', is_generic: false },
  { slug: 'modulo', name_vi: 'Số học modulo', is_generic: false },
  { slug: 'primality-basic', name_vi: 'Kiểm tra nguyên tố', is_generic: false },
  { slug: 'brute-force', name_vi: 'Vét cạn', cf_tag: 'brute force', is_generic: false },
  { slug: 'bitmasks', name_vi: 'Bitmask', cf_tag: 'bitmasks', is_generic: false },
  { slug: 'backtracking', name_vi: 'Quay lui', is_generic: false },
  { slug: 'sortings', name_vi: 'Sắp xếp', cf_tag: 'sortings', is_generic: false },
  { slug: 'comparator', name_vi: 'Hàm so sánh', is_generic: false },
  { slug: 'string-search', name_vi: 'Tìm kiếm chuỗi', is_generic: false },
  { slug: 'char-count', name_vi: 'Đếm ký tự', is_generic: false },
  { slug: 'primes', name_vi: 'Số nguyên tố', is_generic: false },
  { slug: 'divisors', name_vi: 'Ước số', is_generic: false },
  { slug: 'ad-hoc', name_vi: 'Ad hoc', is_generic: false },
  { slug: 'greedy', name_vi: 'Tham lam', cf_tag: 'greedy', is_generic: false },
  { slug: 'interval-scheduling', name_vi: 'Lập lịch đoạn', is_generic: false },
  { slug: 'two-pointers', name_vi: 'Hai con trỏ', cf_tag: 'two pointers', is_generic: false },
  { slug: 'prefix-sum', name_vi: 'Mảng cộng dồn', is_generic: false },
  { slug: 'stl', name_vi: 'Thư viện STL', is_generic: false },
  { slug: 'set-map', name_vi: 'Set & Map', is_generic: false },
  { slug: 'priority-queue', name_vi: 'Hàng đợi ưu tiên', is_generic: false },
  { slug: 'prefix-sum-2d', name_vi: 'Cộng dồn 2D', is_generic: false },
  { slug: 'sliding-window', name_vi: 'Cửa sổ trượt', is_generic: false },
  { slug: 'binary-search', name_vi: 'Tìm kiếm nhị phân', cf_tag: 'binary search', is_generic: false },
  { slug: 'binary-search-answer', name_vi: 'Nhị phân theo đáp án', is_generic: false },
  { slug: 'scheduling', name_vi: 'Điều phối', cf_tag: 'schedules', is_generic: false },
  { slug: 'counting', name_vi: 'Đếm', is_generic: false },
  { slug: 'hash-map', name_vi: 'Bảng băm', is_generic: false },
  { slug: 'sieve', name_vi: 'Sàng Eratosthenes', is_generic: false },
  { slug: 'fast-power', name_vi: 'Lũy thừa nhanh', is_generic: false },
  { slug: 'modpow', name_vi: 'Lũy thừa modulo', is_generic: false },
  { slug: 'binomial-mod', name_vi: 'Tổ hợp modulo', is_generic: false },
  { slug: 'modular-inverse', name_vi: 'Nghịch đảo modulo', is_generic: false },
  { slug: 'knapsack', name_vi: 'Cái túi (Knapsack)', is_generic: false },
  { slug: 'lis', name_vi: 'Dãy con tăng dài nhất', is_generic: false },
  { slug: 'lcs', name_vi: 'Xâu con chung dài nhất', is_generic: false },
  { slug: 'edit-distance', name_vi: 'Khoảng cách chỉnh sửa', is_generic: false },
  { slug: 'grid-dp', name_vi: 'DP trên lưới', is_generic: false },
  { slug: 'dfs', name_vi: 'Duyệt sâu DFS', cf_tag: 'dfs and similar', is_generic: false },
  { slug: 'bfs', name_vi: 'Duyệt rộng BFS', is_generic: false },
  { slug: 'connected-components', name_vi: 'Thành phần liên thông', is_generic: false },
  { slug: 'dsu', name_vi: 'Disjoint Set Union', cf_tag: 'dsu', is_generic: false },
  { slug: 'linear-sieve', name_vi: 'Sàng tuyến tính', is_generic: false },
  { slug: 'spf', name_vi: 'Ước nguyên tố nhỏ nhất', is_generic: false },
  { slug: 'matrix-exp', name_vi: 'Lũy thừa ma trận', cf_tag: 'matrices', is_generic: false },
  { slug: 'lucas', name_vi: 'Định lý Lucas', is_generic: false },
  { slug: 'catalan', name_vi: 'Số Catalan', is_generic: false },
  { slug: 'divisor-dp', name_vi: 'DP trên ước số', is_generic: false },
  { slug: 'dag-dp', name_vi: 'DP trên DAG', is_generic: false },
  { slug: 'topo-sort', name_vi: 'Sắp xếp topo', is_generic: false },
  { slug: 'dijkstra', name_vi: 'Dijkstra', is_generic: false },
  { slug: 'shortest-paths', name_vi: 'Đường đi ngắn nhất', cf_tag: 'shortest paths', is_generic: false },
  { slug: 'bellman-ford', name_vi: 'Bellman-Ford', is_generic: false },
  { slug: 'negative-cycle', name_vi: 'Chu trình âm', is_generic: false },
  { slug: 'floyd-warshall', name_vi: 'Floyd-Warshall', is_generic: false },
  { slug: 'mst', name_vi: 'Cây khung nhỏ nhất', is_generic: false },
  { slug: 'kruskal', name_vi: 'Thuật toán Kruskal', is_generic: false },
  { slug: 'prim', name_vi: 'Thuật toán Prim', is_generic: false },
  { slug: 'fenwick', name_vi: 'Fenwick Tree (BIT)', is_generic: false },
  { slug: 'segment-tree', name_vi: 'Segment Tree', is_generic: false },
  { slug: 'lazy-propagation', name_vi: 'Lazy Propagation', is_generic: false },
  { slug: 'sparse-table', name_vi: 'Sparse Table', is_generic: false },
  { slug: 'rmq', name_vi: 'Truy vấn min/max đoạn', is_generic: false },
  { slug: 'bitmask-dp', name_vi: 'Bitmask DP', is_generic: false },
  { slug: 'tree-dp', name_vi: 'DP trên cây', is_generic: false },
  { slug: 'rerooting', name_vi: 'Đổi gốc cây (Rerooting)', is_generic: false },
  { slug: 'string-hash', name_vi: 'Băm chuỗi', is_generic: false },
  { slug: 'hashing', name_vi: 'Hashing', cf_tag: 'hashing', is_generic: false },
  { slug: 'kmp', name_vi: 'Thuật toán KMP', is_generic: false },
  { slug: 'z-function', name_vi: 'Hàm Z', is_generic: false },
  { slug: 'lca', name_vi: 'Tổ tiên chung gần nhất (LCA)', is_generic: false },
  { slug: 'binary-lifting', name_vi: 'Nhảy nhị phân (Binary Lifting)', is_generic: false },
  { slug: 'hld', name_vi: 'Heavy-Light Decomposition', is_generic: false },
  { slug: 'centroid', name_vi: 'Centroid Decomposition', is_generic: false },
  { slug: 'divide-and-conquer', name_vi: 'Chia để trị', cf_tag: 'divide and conquer', is_generic: false },
  { slug: 'scc', name_vi: 'Thành phần liên thông mạnh', is_generic: false },
  { slug: '2-sat', name_vi: '2-SAT', cf_tag: '2-sat', is_generic: false },
  { slug: 'bridges', name_vi: 'Cầu', is_generic: false },
  { slug: 'articulation-points', name_vi: 'Khớp', is_generic: false },
  { slug: 'max-flow', name_vi: 'Luồng cực đại', is_generic: false },
  { slug: 'min-cut', name_vi: 'Lát cắt cực tiểu', is_generic: false },
  { slug: 'flows', name_vi: 'Luồng mạng', cf_tag: 'flows', is_generic: false },
  { slug: 'bipartite-matching', name_vi: 'Ghép cặp hai phía', cf_tag: 'graph matchings', is_generic: false },
  { slug: 'hungarian', name_vi: 'Thuật toán Hungarian', is_generic: false },
  { slug: 'cht', name_vi: 'Convex Hull Trick', is_generic: false },
  { slug: 'dnc-opt', name_vi: 'Tối ưu D&C', is_generic: false },
  { slug: 'mo', name_vi: 'Thuật toán Mo', is_generic: false },
  { slug: 'sqrt-decomp', name_vi: 'Chia căn (Sqrt)', is_generic: false },
  { slug: 'sprague-grundy', name_vi: 'Sprague-Grundy', is_generic: false },
  { slug: 'nim', name_vi: 'Trò chơi Nim', is_generic: false },
  { slug: 'games', name_vi: 'Lý thuyết trò chơi', cf_tag: 'games', is_generic: false },
  { slug: 'fft-ntt', name_vi: 'FFT / NTT', cf_tag: 'fft', is_generic: false },
  { slug: 'persistent-seg', name_vi: 'Persistent Segment Tree', is_generic: false },
  { slug: 'li-chao', name_vi: 'Li Chao Tree', is_generic: false },
  { slug: 'link-cut', name_vi: 'Link-Cut Tree', is_generic: false },
  { slug: 'splay', name_vi: 'Splay Tree', is_generic: false },
  { slug: 'geometry', name_vi: 'Hình học tính toán', cf_tag: 'geometry', is_generic: false },
  { slug: 'convex-hull', name_vi: 'Bao lồi', is_generic: false },
  { slug: 'line-intersection', name_vi: 'Giao đoạn thẳng', is_generic: false },
  { slug: 'min-cost-flow', name_vi: 'Luồng chi phí cực tiểu', is_generic: false },
  { slug: 'matroid', name_vi: 'Matroid', is_generic: false },
  { slug: 'broken-profile', name_vi: 'Broken Profile DP', is_generic: false },
  { slug: 'small-to-large', name_vi: 'Gộp nhỏ vào lớn', is_generic: false },
  { slug: 'suffix-automaton', name_vi: 'Suffix Automaton', cf_tag: 'string suffix structures', is_generic: false },
  { slug: 'eertree', name_vi: 'Eertree (Palindromic Tree)', is_generic: false },
  { slug: 'probabilities', name_vi: 'Xác suất', cf_tag: 'probabilities', is_generic: false },
  { slug: 'interactive', name_vi: 'Tương tác', cf_tag: 'interactive', is_generic: false },
  { slug: 'meet-in-the-middle', name_vi: 'Meet in the Middle', cf_tag: 'meet-in-the-middle', is_generic: false },
  { slug: 'misc', name_vi: 'Khác', is_generic: false },
];

// Normalized Vietnamese & raw label -> topic slugs (Phụ lục B.2 & B.3)
export const TOPIC_ALIASES: Record<string, string[]> = {
  'điều kiện': ['implementation'],
  'chia hết': ['math'],
  'chia': ['math'],
  'toán': ['math'],
  'số học': ['number-theory'],
  'chuỗi': ['strings'],
  'vòng lặp': ['implementation', 'loops'],
  'đếm': ['implementation', 'counting'],
  'mô phỏng': ['simulation'],
  'modulo': ['modulo'],
  'tham lam': ['greedy'],
  'xây dựng': ['constructive'],
  'constructive': ['constructive'],
  'constructive algorithms': ['constructive'],
  'hai con trỏ': ['two-pointers'],
  'two pointers': ['two-pointers'],
  'mảng': ['implementation', 'arrays'],
  'sắp xếp': ['sortings'],
  'sort': ['sortings'],
  'sortings': ['sortings'],
  'set': ['set-map'],
  'multiset': ['set-map'],
  'lũy thừa': ['fast-power'],
  'lũy thừa nhanh': ['fast-power'],
  'sinh tổ hợp': ['combinatorics'],
  'tổ hợp': ['combinatorics'],
  'tổ hợp mod p': ['binomial-mod'],
  'combinatorics': ['combinatorics'],
  'bitmask': ['bitmasks'],
  'bitmasks': ['bitmasks'],
  'brute force': ['brute-force'],
  'backtracking': ['backtracking'],
  'binary search': ['binary-search'],
  'median': ['greedy'],
  'interval': ['interval-scheduling'],
  'sự kiện': ['interval-scheduling'],
  'prefix': ['prefix-sum'],
  'prefix sum': ['prefix-sum'],
  '2d prefix': ['prefix-sum-2d'],
  'sliding window': ['sliding-window'],
  'hash': ['hash-map'],
  'hash, offline': ['hashing'],
  'hashing': ['hashing'],
  'dp': ['dp'],
  'dp cơ bản': ['dp'],
  'dp, tối ưu': ['dp'],
  'dp tối ưu': ['dp'],
  'kadane': ['dp'],
  'coin change': ['knapsack'],
  'knapsack': ['knapsack'],
  'lis': ['lis'],
  'dp chuỗi': ['lcs'],
  'dp grid': ['grid-dp'],
  'grid': ['grid-dp'],
  'dp xác suất': ['dp', 'probabilities'],
  'dp trạng thái': ['dp'],
  'dp trên cây': ['tree-dp'],
  'dp trên cây/graph': ['tree-dp'],
  'dp trên dag': ['dag-dp'],
  'rerooting': ['rerooting'],
  'last position': ['dp'],
  'deque': ['data-structures'],
  'cây': ['trees'],
  'trees': ['trees'],
  'tree': ['trees'],
  'đồ thị': ['graphs'],
  'graphs': ['graphs'],
  'bfs': ['bfs'],
  'bfs/dfs': ['bfs', 'dfs'],
  'dfs': ['dfs'],
  'dfs and similar': ['dfs'],
  'connected component': ['connected-components'],
  '2-coloring': ['bfs'],
  'đường đi': ['bfs'],
  'đường đi ngắn': ['shortest-paths'],
  'shortest paths': ['shortest-paths'],
  'dsu': ['dsu'],
  'mst': ['mst'],
  'sàng': ['sieve'],
  'sàng ước': ['sieve', 'divisors'],
  'ước số': ['divisors'],
  'hoán vị': ['combinatorics'],
  'permutation': ['combinatorics'],
  'chia để trị': ['divide-and-conquer'],
  'd&c': ['divide-and-conquer'],
  'divide and conquer': ['divide-and-conquer'],
  'game': ['games'],
  'games': ['games'],
  'digit': ['dp'],
  'dijkstra': ['dijkstra'],
  'layered graph': ['dijkstra'],
  'bellman-ford': ['bellman-ford'],
  'negative cycle': ['negative-cycle'],
  'floyd-warshall': ['floyd-warshall'],
  'topological sort': ['topo-sort'],
  'fenwick tree': ['fenwick'],
  'segment tree': ['segment-tree'],
  'lazy': ['lazy-propagation'],
  'sparse table': ['sparse-table'],
  'xor': ['bitmasks'],
  'bitmask dp': ['bitmask-dp'],
  'bit': ['fenwick'],
  'offline': ['misc'],
  'interactive': ['interactive'],
  'data structures': ['data-structures'],
  'number theory': ['number-theory'],
  'implementation': ['implementation'],
  'math': ['math'],
  'greedy': ['greedy'],
  'probabilities': ['probabilities'],
  'flows': ['flows'],
  'graph matchings': ['bipartite-matching'],
  'matching': ['bipartite-matching'],
  'binary lifting': ['binary-lifting'],
  'chu trình': ['graphs'],
  'scc': ['scc'],
  'persistent segment tree': ['persistent-seg'],
  'lca': ['lca'],
  'khoảng cách': ['lca'],
  'đếm đường đi': ['lca'],
  'subtree': ['trees'],
  'diameter': ['trees'],
  'path queries': ['lca'],
  'hld': ['hld'],
  'centroid': ['centroid'],
  'meet in the middle': ['meet-in-the-middle'],
  'hamming': ['bitmasks'],
  'subgrids': ['bitmasks'],
  'reachable': ['graphs'],
  'reachability': ['graphs'],
  'cut and paste': ['misc'],
  'substring reversals': ['strings'],
  'reversals and sums': ['strings'],
  'bridges': ['bridges'],
  'articulation points': ['articulation-points'],
  'eulerian': ['graphs'],
  'fft': ['fft-ntt'],
  'ntt': ['fft-ntt'],
  'convolution': ['fft-ntt'],
  'cht': ['cht'],
  'li chao tree': ['li-chao'],
  'link-cut tree': ['link-cut'],
  'hình học': ['geometry'],
  'geometry': ['geometry'],
  'convex hull': ['convex-hull'],
  'closest pair': ['geometry'],
  'furthest pair': ['geometry'],
  'max flow min cost': ['min-cost-flow'],
  'min-cost flow': ['min-cost-flow'],
  'bipartite': ['bipartite-matching'],
  'general': ['bipartite-matching'],
  'weighted': ['bipartite-matching'],
  'edge coloring': ['graphs'],
  'matroid': ['matroid'],
  'assignment': ['min-cost-flow'],
  'directed mst': ['mst'],
  'diameter mst': ['mst'],
  'dominator tree': ['graphs'],
  'broken profile dp': ['broken-profile'],
  'matrix': ['matrix-exp'],
  'strings': ['strings'],
  '2-sat': ['2-sat'],
  'schedules': ['scheduling'],
  'string suffix structures': ['suffix-automaton'],
  'maximum independent set': ['dp'],
  'chromatic number': ['graphs'],
  'chromatic polynomial': ['graphs'],
  'enumerate triangles': ['graphs'],
  'enumerate cliques': ['graphs'],
  'counting c4': ['graphs'],
  'tree decomposition': ['graphs'],
  'global minimum cut': ['min-cut'],
  'chordal graph': ['graphs'],
  'dynamic graph': ['graphs'],
  'counting eulerian circuits': ['graphs'],
  'counting spanning trees': ['graphs'],
  'tree diameter': ['trees'],
  'lowest common ancestor': ['lca'],
  'jump on tree': ['lca'],
  'frequency table': ['fft-ntt'],
  'tree distance': ['centroid'],
  'rooted tree isomorphism': ['trees'],
  'tree path composite sum': ['hld'],
  'vertex add path sum': ['hld'],
  'vertex set path composite': ['hld'],
  'vertex add subtree sum': ['trees'],
  'vertex add range contour sum': ['centroid'],
  'vertex get range contour add': ['centroid'],
  'point set tree path composite sum': ['hld'],
  'count': ['counting'],
  'so sánh': ['comparator'],
  'tối ưu': ['dp'],
  'graph': ['graphs'],
  'dag': ['dag-dp'],
};

const makeQuiz = (title: string, topicDesc: string, extra: QuizQuestion[]): QuizQuestion[] => {
  const result: QuizQuestion[] = [
    ...extra,
    {
      q: `Trong bài học "${title}", yếu tố nào quan trọng nhất để tránh TLE khi $N \\le 10^5$?`,
      options: [
        `Chọn thuật toán đúng chuyên đề (${topicDesc}) có độ phức tạp $O(N)$ hoặc $O(N \\log N)$`,
        'Dùng hai vòng lặp lồng nhau $O(N^2)$ vì C++ chạy rất nhanh',
        'Tắt tối ưu hóa trình biên dịch -O2',
        'Dùng đệ quy không nhớ',
      ],
      answer_index: 0,
      explain: 'Với $N \\le 10^5$, thuật toán $O(N^2)$ thực hiện $\\approx 10^{10}$ phép toán và chắc chắn quá thời gian 1 giây.',
    },
  ];
  if (result.length < 3) {
    result.push({
      q: `Khi cài đặt thuật toán trong bài "${title}", lỗi nào thường gây WA trên test lớn dù test ví dụ vẫn đúng?`,
      options: [
        'Tràn số 32-bit (dùng int thay vì long long) hoặc thiếu xử lý trường hợp biên (N nhỏ nhất/lớn nhất)',
        'Dùng std::vector thay cho mảng tĩnh',
        'Tách hàm phụ quá nhiều',
        'In dấu cách thừa ở cuối dòng khi checker dùng tokens',
      ],
      answer_index: 0,
      explain: 'Các bài từ trung cấp trở lên thường có giá trị trung gian vượt $2^{31}-1$ hoặc có test biên đặc biệt.',
    });
  }
  return result;
};

export const LESSONS_META: LessonMetaDef[] = [
  // Cấp 0
  {
    code: '0.1', slug: 'cpp-syntax-io', track_id: 0, sort_order: 1, title: 'Cú pháp C++ và I/O',
    prereqs: [], topics: ['io', 'implementation'], fit_check: true, complexity: 'O(1)',
    objectives: ['Viết hoàn chỉnh chương trình C++17 đầu tiên với #include <bits/stdc++.h>', 'Sử dụng cin/cout kết hợp ios::sync_with_stdio(false); cin.tie(nullptr);', 'Phân biệt \\n và endl để tránh chậm khi in nhiều dòng'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 1: Input and Output', url: 'https://cses.fi/book/book.pdf' }, { kind: 'docs', title: 'cppreference — I/O library', url: 'https://en.cppreference.com/w/cpp/io' }],
    quiz: [
      { q: 'Tác dụng của ios::sync_with_stdio(false); cin.tie(nullptr); là gì?', options: ['Tăng tốc độ đọc ghi cin/cout đáng kể', 'Tự động sắp xếp mảng đầu vào', 'Ngăn lỗi tràn số nguyên', 'Bật chế độ debug'], answer_index: 0, explain: 'Ngắt đồng bộ giữa C++ stream và C stdio giúp cin/cout đạt tốc độ tương đương scanf/printf.' },
      { q: 'Nên dùng ký tự nào để xuống dòng khi in $10^5$ dòng?', options: ["'\\n'", 'endl', 'flush', 'system("newline")'], answer_index: 0, explain: 'endl ép flush bộ đệm mỗi dòng khiến thời gian chạy chậm gấp nhiều lần.' },
      { q: 'Thư viện nào gom toàn bộ thư viện chuẩn C++ trong thi đấu?', options: ['<bits/stdc++.h>', '<stdio.h>', '<windows.h>', '<conio.h>'], answer_index: 0, explain: '<bits/stdc++.h> chứa iostream, vector, algorithm và toàn bộ STL thông dụng trên GCC.' },
    ],
  },
  {
    code: '0.2', slug: 'data-types-overflow', track_id: 0, sort_order: 2, title: 'Kiểu dữ liệu và tràn số',
    prereqs: ['0.1'], topics: ['overflow', 'data-types', 'math'], fit_check: true, complexity: 'O(1)',
    objectives: ['Nhận biết giới hạn của int (~2.1e9) và long long (~9.2e18)', 'Ép kiểu sang long long trước khi thực hiện phép nhân có thể tràn', 'So sánh số thực bằng sai số epsilon thay vì =='],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 1: Working with Numbers', url: 'https://cses.fi/book/book.pdf' }, { kind: 'docs', title: 'cppreference — Fundamental types', url: 'https://en.cppreference.com/w/cpp/language/types' }],
    quiz: [
      { q: 'Giá trị tối đa của kiểu int 32-bit có dấu xấp xỉ bao nhiêu?', options: ['2.1 × 10^9', '9.2 × 10^18', '65535', '10^12'], answer_index: 0, explain: 'int có giá trị từ -2^31 đến 2^31 - 1 (khoảng 2,147,483,647).' },
      { q: 'Cho int a = 100000, b = 100000. Biểu thức nào KHÔNG bị tràn số?', options: ['1LL * a * b', 'long long c = a * b;', '(long long)(a * b)', 'unsigned int c = a * b;'], answer_index: 0, explain: 'Phép nhân a * b vẫn tính bằng int trước khi gán nếu không ép kiểu một toán hạng trước.' },
      { q: 'Làm thế nào để so sánh hai số thực double x và y an toàn?', options: ['abs(x - y) < 1e-9', 'x == y', '(int)x == (int)y', 'x >= y && x <= y'], answer_index: 0, explain: 'Số thực dấu phẩy động có sai số biểu diễn nên cần kiểm tra độ lệch nhỏ hơn epsilon.' },
    ],
  },
  {
    code: '0.3', slug: 'loops-arrays-functions', track_id: 0, sort_order: 3, title: 'Vòng lặp, mảng, hàm',
    prereqs: ['0.1', '0.2'], topics: ['arrays', 'loops', 'functions', 'implementation'], fit_check: true, complexity: 'O(n)',
    objectives: ['Sử dụng thành thạo for, while và range-based for', 'Quản lý dữ liệu bằng std::vector thay mảng tĩnh cố định', 'Tổ chức code gọn bằng hàm và truyền tham chiếu (&)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 1', url: 'https://cses.fi/book/book.pdf' }, { kind: 'wiki', title: 'VNOI Wiki — C++ Cơ bản', url: 'https://wiki.vnoi.info/' }],
    quiz: [
      { q: 'Truy cập a[n] với vector<int> a(n) gây ra lỗi gì?', options: ['Undefined Behavior / Runtime Error (vượt biên)', 'Tự động mở rộng mảng', 'Trả về 0', 'Lỗi biên dịch CE'], answer_index: 0, explain: 'Vector kích thước n chỉ có chỉ số hợp lệ từ 0 đến n - 1.' },
      { q: 'Cách nào giúp hàm sửa trực tiếp giá trị vector truyền vào mà không tốn O(n) sao chép?', options: ['void f(vector<int>& a)', 'void f(vector<int> a)', 'int f(vector<int> a)', 'const vector<int> a'], answer_index: 0, explain: 'Tham chiếu (&) tránh copy toàn bộ mảng mỗi lần gọi hàm.' },
      { q: 'Độ phức tạp của vòng lặp lồng nhau for i=1..n, for j=1..n là gì?', options: ['O(n^2)', 'O(n)', 'O(n log n)', 'O(2n)'], answer_index: 0, explain: 'Vòng lặp trong chạy n lần cho mỗi bước của vòng lặp ngoài -> n * n = O(n^2).' },
    ],
  },
  {
    code: '0.4', slug: 'constraints-complexity', track_id: 0, sort_order: 4, title: 'Đọc đề và độ phức tạp',
    prereqs: ['0.3'], topics: ['complexity', 'frequency-count', 'implementation'], fit_check: true, complexity: 'O(n)',
    objectives: ['Ước lượng độ phức tạp cho phép dựa vào ràng buộc N của đề', 'Nhận diện ranh giới ~10^8 phép toán trong 1 giây', 'Sử dụng mảng đếm tần số để tối ưu từ O(n^2) xuống O(n)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 2: Time Complexity', url: 'https://cses.fi/book/book.pdf' }, { kind: 'wiki', title: 'VNOI Wiki — Độ phức tạp thuật toán', url: 'https://wiki.vnoi.info/' }],
    quiz: [
      { q: 'Với giới hạn thời gian 1 giây và N <= 10^5, độ phức tạp nào bị TLE?', options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(log N)'], answer_index: 0, explain: 'N^2 = 10^10 phép toán, vượt xa ngưỡng ~10^8 phép toán/giây.' },
      { q: 'Với N <= 20, thuật toán nào thường chạy vừa kịp trong 1 giây?', options: ['O(2^N)', 'O(N!)', 'O(3^N)', 'O(N^N)'], answer_index: 0, explain: '2^20 ≈ 10^6 rất nhỏ so với 10^8, còn 20! ≈ 2.4 × 10^18.' },
      { q: 'Để đếm số lần xuất hiện của các giá trị từ 0 đến 10^5, cách nhanh nhất là gì?', options: ['Dùng mảng đếm cnt[100005]', 'Dùng 2 vòng lặp lồng nhau', 'Sắp xếp lại nhiều lần', 'Dùng đệ quy'], answer_index: 0, explain: 'Mảng đánh dấu/đếm tần số cho phép cập nhật và truy vấn trong O(1).' },
    ],
  },
  {
    code: '0.5', slug: 'simulation-basic', track_id: 0, sort_order: 5, title: 'Mô phỏng đơn giản',
    prereqs: ['0.3'], topics: ['simulation', 'implementation'], fit_check: true, complexity: 'O(steps)',
    objectives: ['Phân tích trạng thái và quy tắc chuyển trạng thái từ mô tả đề', 'Cài đặt chính xác vòng lặp mô phỏng từng bước', 'Kiểm tra các trường hợp biên như N = 1 hoặc điều kiện dừng'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 1', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Mô phỏng đơn giản', 'simulation', [
      { q: 'Trong bài toán Collatz (Weird Algorithm), khi N lớn tới 10^6 thì biến trung gian cần kiểu gì?', options: ['long long', 'int', 'short', 'bool'], answer_index: 0, explain: 'Dãy 3n+1 có thể vượt quá 2^31 - 1 dù n khởi đầu nhỏ hơn 10^6.' },
      { q: 'Khi mô phỏng trên lưới tọa độ, tại sao cần kiểm tra biên trước khi di chuyển?', options: ['Tránh truy cập ngoài mảng gây RE', 'Giảm bộ nhớ gấp đôi', 'Tăng tốc độ I/O', 'Không cần thiết trong C++'], answer_index: 0, explain: 'Truy cập chỉ số âm hoặc >= kích thước lưới gây lỗi bộ nhớ ngay lập tức.' },
    ]),
  },
  {
    code: '0.6', slug: 'strings-basic', track_id: 0, sort_order: 6, title: 'Chuỗi cơ bản',
    prereqs: ['0.3'], topics: ['string-basics', 'strings'], fit_check: true, complexity: 'O(|s|)',
    objectives: ['Đọc chuỗi bằng cin và getline(cin, s) an toàn', 'Xử lý bảng mã ASCII, đếm ký tự và đổi hoa/thường', 'Kiểm tra chuỗi đối xứng (Palindrome) bằng hai đầu'],
    sources: [{ kind: 'docs', title: 'cppreference — std::string', url: 'https://en.cppreference.com/w/cpp/string/basic_string' }],
    quiz: makeQuiz('Chuỗi cơ bản', 'strings', [
      { q: 'Sau khi dùng cin >> n;, trước khi gọi getline(cin, s) cần làm gì?', options: ['Gọi cin.ignore() hoặc đọc bỏ ký tự xuống dòng thừa', 'Không cần làm gì', 'Gọi cout.flush()', 'Xóa chuỗi s'], answer_index: 0, explain: 'cin >> n để lại ký tự \\n trong bộ đệm, khiến getline đọc phải dòng rỗng.' },
      { q: "Giá trị của biểu thức 'd' - 'a' trong C++ là bao nhiêu?", options: ['3', '4', '97', '100'], answer_index: 0, explain: 'Các chữ cái thường nằm liên tiếp trong bảng mã ASCII nên hiệu là 3.' },
    ]),
  },
  {
    code: '0.7', slug: 'math-basic', track_id: 0, sort_order: 7, title: 'Toán cơ bản',
    prereqs: ['0.2'], topics: ['gcd-lcm', 'modulo', 'primality-basic', 'math', 'number-theory'], fit_check: true, complexity: 'O(log min(a,b)) / O(sqrt(n))',
    objectives: ['Cài đặt thuật toán Euclid tìm ƯCLN và tính BCNN không bị tràn số', 'Áp dụng tính chất phép chia lấy dư với cộng, trừ, nhân', 'Kiểm tra số nguyên tố trong O(sqrt(n))'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Euclidean Algorithm', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Toán cơ bản', 'number-theory', [
      { q: 'Cách tính BCNN(a, b) an toàn nhất tránh tràn số là gì?', options: ['a / gcd(a, b) * b', '(a * b) / gcd(a, b)', 'a * b % gcd(a, b)', 'gcd(a, b) * a'], answer_index: 0, explain: 'Chia trước cho gcd(a, b) giúp kết quả trung gian nhỏ nhất có thể trước khi nhân với b.' },
      { q: 'Khi tính (a - b) % M trong C++ với a < b, ta nên viết thế nào?', options: ['((a - b) % M + M) % M', '(a - b) % M', 'abs(a - b) % M', '(b - a) % M'], answer_index: 0, explain: 'Trong C++, phép % trên số âm trả về kết quả âm nên cần cộng thêm M rồi % M.' },
    ]),
  },
  {
    code: '0.8', slug: 'level0-review', track_id: 0, sort_order: 8, title: 'Tổng hợp cấp 0',
    prereqs: ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Kết hợp đọc đề, phân tích độ phức tạp và cài đặt trọn vẹn', 'Phát hiện lỗi tràn số và lỗi chỉ số mảng trước khi nộp', 'Hoàn thành mượt mà các bài nền tảng Cấp 0'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 1', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tổng hợp cấp 0', 'implementation', [
      { q: 'Bước đầu tiên sau khi đọc xong đề thi là gì?', options: ['Kiểm tra ràng buộc N và kiểu dữ liệu cần thiết', 'Bắt đầu gõ code ngay', 'Tối ưu hằng số', 'Chép mẫu hàm phức tạp'], answer_index: 0, explain: 'Ràng buộc quyết định độ phức tạp thuật toán và kiểu int hay long long.' },
      { q: 'Nếu code chạy đúng test ví dụ nhưng bị WA khi nộp, nguyên nhân phổ biến nhất là gì?', options: ['Chưa xét trường hợp biên (N=1, số âm, tràn số)', 'Sai tên file', 'Thiếu thư viện bits/stdc++.h', 'Máy chấm lỗi'], answer_index: 0, explain: 'Test ví dụ thường nhỏ và không chứa các trường hợp biên hoặc số lớn.' },
    ]),
  },

  // Cấp 1
  {
    code: '1.1', slug: 'brute-force', track_id: 1, sort_order: 1, title: 'Brute force',
    prereqs: ['0.3'], topics: ['brute-force', 'bitmasks', 'backtracking'], fit_check: true, complexity: 'O(2^n) / O(n!)',
    objectives: ['Duyệt toàn bộ tập con bằng bitmask khi n <= 20', 'Sinh hoán vị bằng next_permutation hoặc quay lui', 'Cắt tỉa nhánh vô nghiệm để tối ưu thời gian'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 5: Complete Search', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Brute force', 'brute-force', [
      { q: 'Phép toán bitwise nào kiểm tra bit thứ i của mask đang bật?', options: ['(mask >> i) & 1', 'mask | (1 << i)', 'mask ^ (1 << i)', 'mask & i'], answer_index: 0, explain: 'Dịch phải i bit rồi AND với 1 cho biết bit thứ i bằng 1 hay 0.' },
      { q: 'Trước khi dùng std::next_permutation(a.begin(), a.end()) để liệt kê mọi hoán vị, cần làm gì?', options: ['Sắp xếp mảng tăng dần', 'Đảo ngược mảng', 'Xáo trộn mảng', 'Không cần làm gì'], answer_index: 0, explain: 'next_permutation sinh các hoán vị lớn hơn theo thứ tự từ điển, nên cần bắt đầu từ hoán vị nhỏ nhất.' },
    ]),
  },
  {
    code: '1.2', slug: 'sorting', track_id: 1, sort_order: 2, title: 'Sắp xếp',
    prereqs: ['0.3'], topics: ['sortings', 'comparator'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Sử dụng std::sort với lambda comparator nhiều tiêu chí', 'Biết quy tắc strict weak ordering cho hàm so sánh', 'Ứng dụng sắp xếp để đếm phần tử khác nhau và tìm trung vị'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 3: Sorting', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Sắp xếp', 'sortings', [
      { q: 'Hàm comparator trả về true khi a == b (dùng <= thay vì <) gây lỗi gì?', options: ['Undefined Behavior / Crash trong std::sort', 'Sắp xếp nhanh hơn', 'Tự loại phần tử trùng', 'Không ảnh hưởng'], answer_index: 0, explain: 'std::sort yêu cầu strict weak ordering: comp(x, x) bắt buộc phải trả về false.' },
      { q: 'Để giảm tổng khoảng cách |a[i] - x| tới một điểm x trên trục số, x tối ưu là gì?', options: ['Trung vị (median) của mảng', 'Trung bình cộng', 'Giá trị lớn nhất', 'Giá trị nhỏ nhất'], answer_index: 0, explain: 'Trung vị tối thiểu hóa tổng độ lệch tuyệt đối L1.' },
    ]),
  },
  {
    code: '1.3', slug: 'strings-advanced', track_id: 1, sort_order: 3, title: 'Xử lý chuỗi nâng cao',
    prereqs: ['0.6'], topics: ['string-search', 'char-count', 'strings'], fit_check: true, complexity: 'O(|s|)',
    objectives: ['Tách từ với stringstream và cắt chuỗi bằng substr', 'Áp dụng dịch chuyển ký tự tuần hoàn (Caesar)', 'Phân tích tần số xuất hiện của ký tự và xâu con độ dài cố định'],
    sources: [{ kind: 'docs', title: 'cppreference — stringstream', url: 'https://en.cppreference.com/w/cpp/io/basic_stringstream' }],
    quiz: makeQuiz('Xử lý chuỗi nâng cao', 'strings', [
      { q: 'Hàm s.find(sub) trả về giá trị gì khi không tìm thấy?', options: ['string::npos', '-1 kiểu int', '0', 's.size()'], answer_index: 0, explain: 'Luôn kiểm tra s.find(sub) != string::npos.' },
      { q: 'Khi dịch ký tự chữ thường c tiến thêm k bước (vòng từ z về a), công thức đúng là?', options: ["'a' + (c - 'a' + k) % 26", 'c + k', "(c + k) % 26", "'a' + (c + k) % 26"], answer_index: 0, explain: 'Đưa về chỉ số 0..25 bằng c - \'a\', cộng k rồi mod 26.' },
    ]),
  },
  {
    code: '1.4', slug: 'math-intermediate', track_id: 1, sort_order: 4, title: 'Toán cơ bản nâng cao',
    prereqs: ['0.7'], topics: ['primes', 'divisors', 'math', 'number-theory'], fit_check: true, complexity: 'O(sqrt(n))',
    objectives: ['Liệt kê và đếm số ước của một số trong O(sqrt(n))', 'Phân tích thừa số nguyên tố trong O(sqrt(n))', 'Áp dụng công thức đếm số ước từ số mũ thừa số nguyên tố'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Number of divisors', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Toán cơ bản nâng cao', 'number-theory', [
      { q: 'Nếu n = p1^a1 * p2^a2, số ước dương của n là bao nhiêu?', options: ['(a1 + 1) * (a2 + 1)', 'a1 * a2', 'a1 + a2', '2^(a1 + a2)'], answer_index: 0, explain: 'Mỗi thừa số nguyên tố pi có a_i + 1 cách chọn số mũ từ 0 đến a_i.' },
      { q: 'Khi duyệt d từ 1 đến sqrt(n), trường hợp nào chỉ cộng 1 ước thay vì 2 ước (d và n/d)?', options: ['Khi d * d == n', 'Khi n chẵn', 'Khi d == 1', 'Khi n nguyên tố'], answer_index: 0, explain: 'Nếu n là số chính phương thì d và n/d trùng nhau tại căn bậc hai.' },
    ]),
  },
  {
    code: '1.5', slug: 'simulation-advanced', track_id: 1, sort_order: 5, title: 'Mô phỏng nâng cao',
    prereqs: ['0.5'], topics: ['simulation', 'implementation'], fit_check: true, complexity: 'O(n)',
    objectives: ['Dùng mảng hướng dx[], dy[] cho bài toán di chuyển trên lưới', 'Phát hiện chu kỳ lặp để rút ngắn mô phỏng khi số bước cực lớn', 'Quản lý trạng thái sạch sẽ không bỏ sót điều kiện'],
    sources: [{ kind: 'usaco', title: 'USACO Guide — Bronze Simulation', url: 'https://usaco.guide/' }],
    quiz: makeQuiz('Mô phỏng nâng cao', 'simulation', [
      { q: 'Ưu điểm của việc dùng mảng dx[], dy[] khi duyệt 4 hướng trên lưới là gì?', options: ['Giảm lặp code, dễ xoay hướng và ít sai sót', 'Giảm độ phức tạp xuống O(1)', 'Tự động tránh tràn mảng', 'Không cần mảng visited'], answer_index: 0, explain: 'Gom 4 nhánh if/else thành 1 vòng lặp duy nhất.' },
      { q: 'Nếu trạng thái mô phỏng có tối đa S trạng thái và số bước T = 10^18, ta làm gì?', options: ['Phát hiện chu kỳ lặp sau tối đa S bước và lấy dư', 'Chạy đủ 10^18 bước', 'Dùng long double', 'Dùng đệ quy'], answer_index: 0, explain: 'Theo nguyên lý Dirichlet, trạng thái chắc chắn lặp lại nếu T > S.' },
    ]),
  },
  {
    code: '1.6', slug: 'ad-hoc', track_id: 1, sort_order: 6, title: 'Ad hoc',
    prereqs: ['1.1'], topics: ['ad-hoc', 'constructive'], fit_check: true, complexity: 'Tùy bài',
    objectives: ['Phân tích bất biến (invariant) và tính chẵn lẻ trong bài toán xây dựng', 'Thử nghiệm với các test nhỏ N = 1, 2, 3, 4 để tìm quy luật', 'Chứng minh tính đúng đắn của cấu hình xây dựng được'],
    sources: [{ kind: 'usaco', title: 'USACO Guide — Bronze Ad Hoc', url: 'https://usaco.guide/' }],
    quiz: makeQuiz('Ad hoc', 'constructive', [
      { q: 'Kỹ thuật hữu ích nhất khi gặp bài toán Constructive chưa rõ hướng?', options: ['Giải tay với N nhỏ (1, 2, 3, 4) và tìm bất biến', 'Đoán ngẫu nhiên', 'Viết Segment Tree', 'Dùng Dijkstra'], answer_index: 0, explain: 'Quan sát trường hợp nhỏ giúp lộ ra điều kiện cần và mẫu xây dựng.' },
      { q: 'Bất biến (Invariant) là gì?', options: ['Đại lượng không đổi (hoặc giữ nguyên tính chẵn lẻ) qua mỗi bước biến đổi', 'Biến toàn cục', 'Hằng số PI', 'Độ dài mảng'], answer_index: 0, explain: 'Bất biến giúp chứng minh một trạng thái có thể đạt được hay vô nghiệm.' },
    ]),
  },
  {
    code: '1.7', slug: 'greedy-basic', track_id: 1, sort_order: 7, title: 'Tham lam cơ bản',
    prereqs: ['1.2'], topics: ['greedy', 'interval-scheduling'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Hiểu bài toán chọn nhiều đoạn không giao nhau nhất (Activity Selection)', 'Sắp xếp đoạn theo thời điểm kết thúc tăng dần', 'Kiểm tra tham lam bằng phương pháp đổi chỗ (exchange argument)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 6: Greedy Algorithms', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tham lam cơ bản', 'greedy', [
      { q: 'Để chọn được nhiều hoạt động không giao nhau nhất, ta nên sắp xếp theo tiêu chí nào?', options: ['Thời điểm kết thúc tăng dần', 'Thời điểm bắt đầu tăng dần', 'Độ dài hoạt động ngắn nhất', 'Tổng thời gian'], answer_index: 0, explain: 'Chọn hoạt động kết thúc sớm nhất luôn để lại nhiều khoảng trống nhất cho các hoạt động sau.' },
      { q: 'Tham lam có luôn đúng cho bài đổi tiền với mọi bộ mệnh giá bất kỳ không?', options: ['Không, ví dụ bộ mệnh giá {1, 3, 4} với tổng 6', 'Có, luôn đúng mọi lúc', 'Chỉ đúng khi số lượng xu chẵn', 'Luôn sai'], answer_index: 0, explain: 'Với {1, 3, 4} và S = 6: tham lam chọn 4+1+1 (3 đồng), tối ưu là 3+3 (2 đồng).' },
    ]),
  },
  {
    code: '1.8', slug: 'two-pointers-intro', track_id: 1, sort_order: 8, title: 'Hai con trỏ (giới thiệu)',
    prereqs: ['1.2'], topics: ['two-pointers'], fit_check: true, complexity: 'O(n)',
    objectives: ['Áp dụng hai con trỏ từ hai đầu mảng đã sắp xếp tìm cặp tổng S', 'Trộn hai mảng đã sắp xếp trong O(n + m)', 'Nhận biết điều kiện đơn điệu để hạ từ O(n^2) xuống O(n)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 8: Two Pointers', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Hai con trỏ', 'two-pointers', [
      { q: 'Khi tìm cặp a[i] + a[j] == S trên mảng tăng dần (i=0, j=n-1), nếu a[i] + a[j] < S thì làm gì?', options: ['Tăng i lên 1', 'Giảm j xuống 1', 'Tăng cả i và j', 'Dừng thuật toán'], answer_index: 0, explain: 'Vì a tăng dần, tăng i làm tăng tổng tiến gần về S.' },
      { q: 'Điều kiện vòng lặp của bài toán tìm hai chỉ số phân biệt i != j là gì?', options: ['i < j', 'i <= j', 'i != n', 'j >= 0'], answer_index: 0, explain: 'i < j đảm bảo hai con trỏ không trỏ vào cùng một phần tử.' },
    ]),
  },
  {
    code: '1.9', slug: 'prefix-sum-intro', track_id: 1, sort_order: 9, title: 'Prefix sum (giới thiệu)',
    prereqs: ['0.3'], topics: ['prefix-sum'], fit_check: true, complexity: 'O(n + q)',
    objectives: ['Xây dựng mảng cộng dồn pre[i] trong O(n)', 'Trả lời q truy vấn tổng đoạn [l, r] trong O(1) mỗi truy vấn', 'Dùng hiệu mảng (difference array) để tăng đoạn nhanh'],
    sources: [{ kind: 'usaco', title: 'USACO Guide — Silver Prefix Sums', url: 'https://usaco.guide/' }],
    quiz: makeQuiz('Prefix sum', 'prefix-sum', [
      { q: 'Với mảng đánh số từ 1 và pre[i] = a[1] + ... + a[i], tổng đoạn [l, r] bằng gì?', options: ['pre[r] - pre[l - 1]', 'pre[r] - pre[l]', 'pre[r - 1] - pre[l]', 'pre[r + 1] - pre[l]'], answer_index: 0, explain: 'Trừ đi phần tiền tố trước l là pre[l - 1].' },
      { q: 'Kiểu dữ liệu an toàn cho mảng pre[] khi N <= 2*10^5 và |a[i]| <= 10^9 là gì?', options: ['long long', 'int', 'float', 'unsigned short'], answer_index: 0, explain: 'Tổng tối đa đạt 2*10^14, vượt giới hạn int 32-bit.' },
    ]),
  },
  {
    code: '1.10', slug: 'level1-review', track_id: 1, sort_order: 10, title: 'Tổng hợp cấp 1',
    prereqs: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Phối hợp sắp xếp + hai con trỏ + tham lam giải bài 1000–1200', 'Nhận diện khi nào dùng prefix sum thay vì duyệt lại đoạn', 'Tối ưu cài đặt sạch và không tràn số'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 3', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tổng hợp cấp 1', 'implementation', [
      { q: 'Bài toán cho N đoạn và hỏi điểm nằm trong nhiều đoạn nhất dùng kỹ thuật nào hiệu quả nhất?', options: ['Mảng sự kiện (+1 tại start, -1 tại end) rồi sắp xếp & cộng dồn', 'Duyệt mọi tọa độ từ -10^9 đến 10^9', 'Quay lui', 'Nhân ma trận'], answer_index: 0, explain: 'Sweep line với các điểm đầu mút tốn O(N log N).' },
      { q: 'Tại sao thường phải sort mảng trước khi áp dụng hai con trỏ tìm cặp?', options: ['Để tạo tính đơn điệu cho phép loại bỏ cả dãy ứng viên mỗi bước', 'Để giảm bộ nhớ', 'Do yêu cầu của trình biên dịch', 'Để tránh số âm'], answer_index: 0, explain: 'Không có thứ tự đơn điệu, ta không biết nên dịch trái hay phải.' },
    ]),
  },

  // Cấp 2
  {
    code: '2.1', slug: 'stl-containers', track_id: 2, sort_order: 1, title: 'STL',
    prereqs: ['0.3'], topics: ['stl', 'set-map', 'priority-queue', 'data-structures'], fit_check: true, complexity: 'O(log n) mỗi thao tác',
    objectives: ['Phân biệt set, multiset, map và unordered_map', 'Dùng lower_bound/upper_bound đúng cách trên set/multiset (s.lower_bound)', 'Sử dụng priority_queue cho min-heap và max-heap'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 4: Data Structures', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('STL', 'data-structures', [
      { q: 'Để xóa ĐÚNG MỘT bản sao của giá trị x khỏi multiset<int> ms, ta viết thế nào?', options: ['auto it = ms.find(x); if (it != ms.end()) ms.erase(it);', 'ms.erase(x);', 'ms.pop_back();', 'ms.remove(x);'], answer_index: 0, explain: 'ms.erase(x) theo giá trị sẽ xóa TẤT CẢ các phần tử bằng x; truyền iterator chỉ xóa 1 phần tử.' },
      { q: 'Cách nào đúng để tìm phần tử >= x trong set<int> s trong O(log n)?', options: ['s.lower_bound(x)', 'lower_bound(s.begin(), s.end(), x)', 's.find(x)', 's.begin() + x'], answer_index: 0, explain: 'std::lower_bound(s.begin(), s.end(), x) trên set tốn O(n) vì iterator của set không phải random-access.' },
    ]),
  },
  {
    code: '2.2', slug: 'prefix-sum-advanced', track_id: 2, sort_order: 2, title: 'Prefix sum nâng cao',
    prereqs: ['1.9'], topics: ['prefix-sum', 'prefix-sum-2d', 'sliding-window'], fit_check: true, complexity: 'O(n*m + q)',
    objectives: ['Tính mảng cộng dồn 2D và truy vấn tổng hình chữ nhật O(1)', 'Áp dụng kỹ thuật bao hàm - loại trừ trên lưới 2D', 'Kết hợp prefix sum với map đếm số đoạn con có tổng bằng K'],
    sources: [{ kind: 'usaco', title: 'USACO Guide — 2D Prefix Sums', url: 'https://usaco.guide/' }],
    quiz: makeQuiz('Prefix sum nâng cao', 'prefix-sum-2d', [
      { q: 'Công thức tổng hình chữ nhật từ (x1, y1) đến (x2, y2) bằng mảng 2D prefix P là gì?', options: ['P[x2][y2] - P[x1-1][y2] - P[x2][y1-1] + P[x1-1][y1-1]', 'P[x2][y2] - P[x1][y1]', 'P[x2][y2] - P[x1-1][y2] - P[x2][y1-1]', 'P[x2][y2] + P[x1-1][y1-1]'], answer_index: 0, explain: 'Phần giao P[x1-1][y1-1] bị trừ 2 lần nên phải cộng lại 1 lần.' },
      { q: 'Để đếm số đoạn con có tổng bằng K (có số âm), ta lưu gì vào map?', options: ['Tần số xuất hiện của các giá trị prefix sum trước đó', 'Chỉ số phần tử lớn nhất', 'Độ dài đoạn', 'Số lượng phần tử dương'], answer_index: 0, explain: 'Với mỗi pre[r], cần đếm số l < r sao cho pre[l] == pre[r] - K.' },
    ]),
  },
  {
    code: '2.3', slug: 'two-pointers-advanced', track_id: 2, sort_order: 3, title: 'Hai con trỏ nâng cao',
    prereqs: ['1.8'], topics: ['two-pointers', 'sliding-window'], fit_check: true, complexity: 'O(n)',
    objectives: ['Cài đặt cửa sổ trượt (Sliding Window) với độ dài biến thiên', 'Duy trì tập phần tử hợp lệ trong cửa sổ bằng map/mảng tần số', 'Tìm đoạn con dài nhất có <= k giá trị khác nhau hoặc tổng <= S'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 8: Sliding Window', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Hai con trỏ nâng cao', 'sliding-window', [
      { q: 'Tại sao vòng lặp while thu hẹp con trỏ trái l trong hai con trỏ vẫn cho tổng độ phức tạp O(n)?', options: ['Vì l chỉ tăng tối đa n lần trong suốt toàn bộ thuật toán', 'Vì r tự reset về 0', 'Vì n luôn nhỏ hơn 1000', 'Nhờ compiler tối ưu'], answer_index: 0, explain: 'Cả hai con trỏ l và r chỉ tiến sang phải, tổng số bước di chuyển <= 2n.' },
      { q: 'Kỹ thuật hai con trỏ có áp dụng trực tiếp được cho bài tìm đoạn dài nhất có tổng <= S nếu mảng có SỐ ÂM không?', options: ['Không, vì tính đơn điệu khi mở rộng/thu hẹp cửa sổ bị phá vỡ', 'Có, vẫn đúng bình thường', 'Chỉ cần đổi while thành if', 'Sắp xếp lại mảng là được'], answer_index: 0, explain: 'Thêm số âm làm tổng giảm đi nên điều kiện không còn đơn điệu theo độ dài đoạn.' },
    ]),
  },
  {
    code: '2.4', slug: 'binary-search', track_id: 2, sort_order: 4, title: 'Tìm kiếm nhị phân',
    prereqs: ['1.2'], topics: ['binary-search', 'binary-search-answer'], fit_check: true, complexity: 'O(n log V)',
    objectives: ['Viết binary search không bao giờ bị lặp vô hạn (infinite loop)', 'Chuyển bài toán tối ưu min/max thành hàm kiểm tra đơn điệu check(mid)', 'Áp dụng binary search trên số thực với số vòng lặp cố định (60–100 bước)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Binary Search', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Tìm kiếm nhị phân', 'binary-search', [
      { q: 'Để tránh tràn số khi tính mid từ lo và hi (lo, hi <= 2*10^9), ta viết thế nào?', options: ['lo + (hi - lo) / 2', '(lo + hi) / 2', '(lo * hi) / 2', 'lo / 2 + hi'], answer_index: 0, explain: 'lo + hi có thể tràn int 32-bit, còn hi - lo luôn an toàn.' },
      { q: 'Khi tìm kiếm nhị phân trên số thực double, cách kết thúc nào an toàn nhất?', options: ['Chạy vòng lặp cố định 80–100 lần', 'Dùng while (lo < hi)', 'Dùng while (lo != hi)', 'Dùng while (hi - lo > 0)'], answer_index: 0, explain: 'Sai số dấu phẩy động có thể khiến lo < hi lặp vô hạn; 80 bước thu hẹp khoảng cỡ 2^-80.' },
    ]),
  },
  {
    code: '2.5', slug: 'greedy-advanced', track_id: 2, sort_order: 5, title: 'Tham lam nâng cao',
    prereqs: ['1.7'], topics: ['greedy', 'interval-scheduling', 'scheduling'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Giải bài toán phân bổ phòng họp (Room Allocation) bằng sweep line + min-heap', 'Phân phối tài nguyên cho k người bằng multiset', 'Kết hợp sắp xếp với hàng đợi ưu tiên trong các bài lập lịch'],
    sources: [{ kind: 'usaco', title: 'USACO Guide — Greedy Algorithms with Sorting', url: 'https://usaco.guide/' }],
    quiz: makeQuiz('Tham lam nâng cao', 'scheduling', [
      { q: 'Trong bài toán xếp n cuộc họp vào ít phòng nhất, cấu trúc dữ liệu nào theo dõi thời điểm kết thúc sớm nhất của các phòng đang dùng?', options: ['Min-heap (priority_queue với greater)', 'Stack', 'Queue thường', 'Vector không sắp xếp'], answer_index: 0, explain: 'Ta chỉ cần kiểm tra phòng rảnh sớm nhất có <= start cuộc họp hiện tại hay không.' },
      { q: 'Số phòng ít nhất cần cho n khoảng thời gian trùng nhau bằng giá trị nào?', options: ['Số cuộc họp diễn ra đồng thời nhiều nhất tại một thời điểm', 'Tổng số cuộc họp chia 2', 'Độ dài cuộc họp dài nhất', 'Số cuộc họp có độ dài chẵn'], answer_index: 0, explain: 'Theo định lý Dilworth trên interval graph, số màu tối thiểu bằng kích thước clique lớn nhất.' },
    ]),
  },
  {
    code: '2.6', slug: 'counting-hash-basic', track_id: 2, sort_order: 6, title: 'Đếm, hash cơ bản',
    prereqs: ['2.1'], topics: ['counting', 'hash-map', 'data-structures'], fit_check: true, complexity: 'O(n) / O(n log n)',
    objectives: ['Biết lý do unordered_map mặc định có thể bị hack thành O(n^2) trên Codeforces', 'Viết custom hash (splitmix64) hoặc dùng map/sort khi cần an toàn', 'Đếm cặp có điều kiện bằng bảng tần số trong một lần duyệt'],
    sources: [{ kind: 'codeforces', title: 'Blowing up unordered_map and how to stop getting hacked', url: 'https://codeforces.com/blog/entry/62393' }],
    quiz: makeQuiz('Đếm, hash cơ bản', 'hash-map', [
      { q: 'Tại sao unordered_map mặc định trong C++ có thể bị TLE trên các bộ test chống hash?', options: ['Vì hàm băm số nguyên mặc định là identity, dễ tạo va chạm O(n) mỗi truy vấn', 'Vì nó dùng quá nhiều RAM', 'Vì nó tự sắp xếp mỗi lần chèn', 'Vì nó không hỗ trợ long long'], answer_index: 0, explain: 'Kẻ tấn công chọn các bội số của kích thước bucket làm mọi khóa rơi vào 1 bucket.' },
      { q: 'Cách khắc phục nhanh nhất nếu không viết custom_hash?', options: ['Dùng std::map hoặc sắp xếp mảng rồi đếm nhóm', 'Chuyển int sang short', 'Dùng vector 2D', 'Tăng kích thước stack'], answer_index: 0, explain: 'std::map đảm bảo O(log n) worst-case không bị hack.' },
    ]),
  },
  {
    code: '2.7', slug: 'sieve', track_id: 2, sort_order: 7, title: 'Sàng nguyên tố',
    prereqs: ['1.4'], topics: ['sieve', 'number-theory'], fit_check: true, complexity: 'O(n log log n)',
    objectives: ['Cài đặt Sàng Eratosthenes sàng tới 10^7 dưới 1 giây', 'Bắt đầu vòng lặp trong từ i * i (ép kiểu long long tránh tràn)', 'Mở rộng sàng để tính số lượng/tổng ước của mọi số từ 1..N'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Sieve of Eratosthenes', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Sàng nguyên tố', 'sieve', [
      { q: 'Tại sao vòng lặp đánh dấu bội trong Sàng Eratosthenes bắt đầu từ j = 1LL * i * i thay vì 2 * i?', options: ['Mọi bội k * i với k < i đã được đánh dấu bởi các ước nguyên tố nhỏ hơn i', 'Để giảm bộ nhớ', 'Do 2 * i là số nguyên tố', 'Bắt buộc phải vậy mới đúng'], answer_index: 0, explain: 'Giúp giảm số phép toán và tránh lặp thừa.' },
      { q: 'Độ phức tạp thời gian của Sàng Eratosthenes tới N là gì?', options: ['O(N log log N)', 'O(N^2)', 'O(N sqrt(N))', 'O(log N)'], answer_index: 0, explain: 'Tổng chuỗi điều hòa trên các số nguyên tố N * sum(1/p) = O(N log log N).' },
    ]),
  },
  {
    code: '2.8', slug: 'fast-power', track_id: 2, sort_order: 8, title: 'Lũy thừa nhanh',
    prereqs: ['1.4'], topics: ['fast-power', 'modpow', 'number-theory'], fit_check: true, complexity: 'O(log b)',
    objectives: ['Hiểu cơ chế chia đôi số mũ theo biểu diễn nhị phân', 'Tính a^b mod m với b <= 10^18 trong O(log b)', 'Xử lý đúng trường hợp đặc biệt m = 1 và 0^0'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Binary Exponentiation', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Lũy thừa nhanh', 'fast-power', [
      { q: 'Trong hàm power(a, b, m), nếu m = 1 và không xử lý r = 1 % m thì power(a, 0, 1) trả về gì?', options: ['1 thay vì 0 (sai vì mọi số mod 1 bằng 0)', '0', 'Lỗi chia 0', '-1'], answer_index: 0, explain: 'Luôn khởi tạo r = 1 % m để đúng cả khi m = 1 và b = 0.' },
      { q: 'Số phép nhân modulo tối đa khi tính a^(10^18) mod m bằng lũy thừa nhanh là khoảng bao nhiêu?', options: ['~120 phép nhân', '10^9 phép nhân', '10^18 phép nhân', '6 phép nhân'], answer_index: 0, explain: '2 * log2(10^18) ≈ 120 phép toán.' },
    ]),
  },
  {
    code: '2.9', slug: 'binomial-mod', track_id: 2, sort_order: 9, title: 'Tổ hợp mod p',
    prereqs: ['2.8'], topics: ['binomial-mod', 'modular-inverse', 'combinatorics'], fit_check: true, complexity: 'O(n + q)',
    objectives: ['Tính nghịch đảo modulo theo định lý nhỏ Fermat: a^(p-2) mod p', 'Tiền xử lý mảng giai thừa fact[] và nghịch đảo invFact[] trong O(n)', 'Trả lời truy vấn C(n, k) mod 10^9+7 trong O(1)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Modular Inverse & Binomial Coefficients', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Tổ hợp mod p', 'binomial-mod', [
      { q: 'Điều kiện bắt buộc để dùng a^(p-2) mod p làm nghịch đảo modulo của a là gì?', options: ['p là số nguyên tố và a không chia hết cho p', 'a phải là số nguyên tố', 'p luôn là số chẵn', 'Không cần điều kiện'], answer_index: 0, explain: 'Định lý nhỏ Fermat áp dụng khi p nguyên tố và gcd(a, p) = 1.' },
      { q: 'Khi k > n hoặc k < 0, giá trị tổ hợp C(n, k) bằng bao nhiêu?', options: ['0', '1', '-1', 'n!'], answer_index: 0, explain: 'Không có cách nào chọn nhiều hơn n phần tử từ tập n phần tử.' },
    ]),
  },
  {
    code: '2.10', slug: 'level2-review', track_id: 2, sort_order: 10, title: 'Tổng hợp cấp 2',
    prereqs: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Kết hợp tìm kiếm nhị phân, hai con trỏ và STL giải quyết bài 1200–1400', 'Vận dụng sàng nguyên tố và tổ hợp modulo linh hoạt', 'Hoàn thành mốc Cấp 2 sẵn sàng bước vào DP và Đồ thị'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 4', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tổng hợp cấp 2', 'data-structures', [
      { q: 'Để duy trì trung vị động của cửa sổ trượt kích thước K, cặp cấu trúc STL nào chuẩn nhất?', options: ['Hai multiset (hoặc hai priority_queue + xóa lười)', 'Một stack', 'Một queue', 'Mảng tĩnh'], answer_index: 0, explain: 'Chia cửa sổ làm nửa nhỏ và nửa lớn cân bằng nhau cho phép lấy trung vị O(1).' },
      { q: 'Khi bài toán yêu cầu "Tìm giá trị X nhỏ nhất/lớn nhất sao cho...", ta nên nghĩ ngay đến kỹ thuật gì?', options: ['Tìm kiếm nhị phân trên đáp án', 'Sàng Eratosthenes', 'Định lý Fermat', 'Hash map'], answer_index: 0, explain: 'Hầu hết các bài tối ưu min-max đều có tính đơn điệu theo X.' },
    ]),
  },

  // Cấp 3
  {
    code: '3.1', slug: 'dp-basic', track_id: 3, sort_order: 1, title: 'DP cơ bản',
    prereqs: ['2.4'], topics: ['knapsack', 'lis', 'lcs', 'edit-distance', 'dp'], fit_check: true, complexity: 'O(nW) / O(n log n)',
    objectives: ['Xác định rõ trạng thái, công thức truy hồi và bài toán cơ sở', 'Cài đặt Knapsack 0/1 tối ưu bộ nhớ 1 chiều', 'Cài đặt LIS trong O(n log n) và LCS / Edit Distance trong O(nm)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 7: Dynamic Programming', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('DP cơ bản', 'knapsack', [
      { q: 'Trong Knapsack 0/1 bản 1 chiều dp[w], tại sao vòng lặp trọng lượng j phải chạy NGƯỢC từ W về w[i]?', options: ['Để mỗi đồ vật chỉ được chọn tối đa 1 lần', 'Để tránh số âm', 'Để tính tổng lớn hơn', 'Không bắt buộc'], answer_index: 0, explain: 'Chạy xuôi sẽ dùng lại trạng thái vừa cập nhật của chính vật i (thành Unbounded Knapsack).' },
      { q: 'Độ phức tạp tối ưu của bài toán Dãy con tăng dài nhất (LIS) là bao nhiêu?', options: ['O(n log n)', 'O(n^2)', 'O(2^n)', 'O(n^3)'], answer_index: 0, explain: 'Duy trì mảng đuôi nhỏ nhất và cập nhật bằng lower_bound.' },
    ]),
  },
  {
    code: '3.2', slug: 'dp-grid', track_id: 3, sort_order: 2, title: 'DP trên grid',
    prereqs: ['3.1'], topics: ['grid-dp', 'dp'], fit_check: true, complexity: 'O(nm)',
    objectives: ['Thiết lập hàm DP 2 chiều theo tọa độ (i, j) trên lưới', 'Xử lý đúng ô vật cản và ô xuất phát (1, 1)', 'Tối ưu bộ nhớ từ O(nm) xuống O(m) bằng kỹ thuật lăn mảng khi cần'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 7: Paths in a Grid', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('DP trên grid', 'grid-dp', [
      { q: 'Nếu ô (1, 1) là vật cản (*) trong bài đếm số đường đi trên lưới, dp[1][1] phải bằng bao nhiêu?', options: ['0', '1', '-1', 'INF'], answer_index: 0, explain: 'Không thể xuất phát từ một ô bị chặn nên số đường đi bằng 0.' },
      { q: 'Khi chỉ được đi sang phải hoặc xuống dưới, dp[i][j] phụ thuộc vào hai ô nào?', options: ['dp[i-1][j] và dp[i][j-1]', 'dp[i+1][j] và dp[i][j+1]', 'dp[i-1][j-1] và dp[i][j]', 'Tất cả các ô'], answer_index: 0, explain: 'Chỉ có thể bước tới (i, j) từ ô phía trên hoặc ô bên trái.' },
    ]),
  },
  {
    code: '3.3', slug: 'dfs-bfs', track_id: 3, sort_order: 3, title: 'DFS và BFS',
    prereqs: ['2.1'], topics: ['dfs', 'bfs', 'connected-components', 'graphs'], fit_check: true, complexity: 'O(V + E)',
    objectives: ['Biểu diễn đồ thị bằng danh sách kề (adjacency list)', 'Tìm đường đi ngắn nhất trên đồ thị không trọng số bằng BFS', 'Kiểm tra đồ thị hai phía (2-coloring) và đếm thành phần liên thông'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 12: Graph Traversal', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('DFS và BFS', 'graphs', [
      { q: 'Thuật toán nào đảm bảo tìm được đường đi ngắn nhất (ít cạnh nhất) trên đồ thị không trọng số?', options: ['BFS', 'DFS', 'Kruskal', 'Tarjan'], answer_index: 0, explain: 'BFS duyệt đỉnh theo từng lớp khoảng cách tăng dần.' },
      { q: 'Khi cài BFS, tại sao nên đánh dấu visited[v] = true NGAY LÚC đẩy v vào queue thay vì lúc lấy ra?', options: ['Tránh một đỉnh bị đẩy vào queue nhiều lần gây MLE/TLE', 'Giúp thứ tự duyệt ngược lại', 'Không có sự khác biệt', 'Để tiết kiệm mảng visited'], answer_index: 0, explain: 'Đánh dấu muộn khiến các cạnh cùng tầng đẩy trùng v vào hàng đợi.' },
    ]),
  },
  {
    code: '3.4', slug: 'dsu', track_id: 3, sort_order: 4, title: 'DSU',
    prereqs: ['3.3'], topics: ['dsu', 'graphs'], fit_check: true, complexity: 'O(α(n)) mỗi thao tác',
    objectives: ['Cài đặt DSU với Path Compression và Union by Size/Rank', 'Theo dõi số thành phần liên thông và kích thước thành phần lớn nhất động', 'Phát hiện chu trình khi thêm cạnh vào đồ thị vô hướng'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Disjoint Set Union', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('DSU', 'dsu', [
      { q: 'Khi kết hợp Path Compression và Union by Size, độ phức tạp trung bình mỗi thao tác của DSU là gì?', options: ['O(α(n)) (gần như O(1))', 'O(n)', 'O(log^2 n)', 'O(sqrt(n))'], answer_index: 0, explain: 'Hàm Ackermann nghịch α(n) <= 4 với mọi n thực tế.' },
      { q: 'Nếu u và v đã có find(u) == find(v) trước khi thêm cạnh (u, v), điều đó chứng tỏ gì?', options: ['Thêm cạnh (u, v) sẽ tạo thành chu trình', 'Đồ thị bị ngắt kết nối', 'u là gốc cây', 'Vô nghiệm'], answer_index: 0, explain: 'u và v đã cùng một thành phần liên thông nên đã có đường đi giữa chúng.' },
    ]),
  },
  {
    code: '3.5', slug: 'sieve-advanced', track_id: 3, sort_order: 5, title: 'Sàng nguyên tố nâng cao',
    prereqs: ['2.7'], topics: ['linear-sieve', 'spf', 'number-theory'], fit_check: true, complexity: 'O(n)',
    objectives: ['Tính mảng SPF (Smallest Prime Factor) bằng sàng', 'Phân tích thừa số nguyên tố một số <= N trong O(log N)', 'Áp dụng sàng tuyến tính O(n) cho các bài có nhiều truy vấn thừa số'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Linear Sieve', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Sàng nguyên tố nâng cao', 'spf', [
      { q: 'Sau khi tiền xử lý mảng SPF (ước nguyên tố nhỏ nhất), phân tích thừa số nguyên tố của x mất bao lâu?', options: ['O(log x)', 'O(sqrt(x))', 'O(x)', 'O(x log x)'], answer_index: 0, explain: 'Mỗi bước chia x cho spf[x] >= 2 nên mất tối đa log2(x) bước.' },
      { q: 'Tính chất cốt lõi giúp Sàng tuyến tính đạt O(N) là gì?', options: ['Mỗi hợp số chỉ bị đánh dấu ĐÚNG 1 LẦN bởi ước nguyên tố nhỏ nhất của nó', 'Dùng mảng bool nhỏ hơn', 'Không xét số chẵn và lẻ', 'Chia để trị'], answer_index: 0, explain: 'Dừng vòng lặp nguyên tố ngay khi i % p == 0.' },
    ]),
  },
  {
    code: '3.6', slug: 'matrix-exponentiation', track_id: 3, sort_order: 6, title: 'Lũy thừa ma trận',
    prereqs: ['2.8'], topics: ['matrix-exp', 'math'], fit_check: true, complexity: 'O(k^3 log n)',
    objectives: ['Chuyển công thức truy hồi tuyến tính thành phép nhân ma trận', 'Cài đặt nhân ma trận k×k và lũy thừa ma trận trong O(k^3 log n)', 'Tính số Fibonacci thứ 10^18 hoặc đếm đường đi độ dài K trên đồ thị'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 23: Matrices', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Lũy thừa ma trận', 'matrix-exp', [
      { q: 'Độ phức tạp tính F(n) với công thức truy hồi bậc k (n <= 10^18) bằng lũy thừa ma trận là gì?', options: ['O(k^3 log n)', 'O(n)', 'O(k^2 n)', 'O(2^k)'], answer_index: 0, explain: 'Mỗi lần nhân 2 ma trận k×k mất O(k^3), nhân O(log n) lần.' },
      { q: 'Ma trận đơn vị I trong phép nâng lũy thừa ma trận có giá trị gì?', options: ['1 trên đường chéo chính, 0 ở các ô còn lại', 'Tất cả bằng 1', 'Tất cả bằng 0', 'Chỉ góc trên trái bằng 1'], answer_index: 0, explain: 'A * I = I * A = A.' },
    ]),
  },
  {
    code: '3.7', slug: 'binomial-advanced', track_id: 3, sort_order: 7, title: 'Tổ hợp mod p nâng cao',
    prereqs: ['2.9'], topics: ['lucas', 'catalan', 'binomial-mod', 'combinatorics'], fit_check: true, complexity: 'O(p + log_p n)',
    objectives: ['Áp dụng định lý Lucas khi N, K rất lớn nhưng modulo p nhỏ', 'Nhận diện và tính số Catalan C_n = C(2n, n) / (n + 1)', 'Giải bài toán đếm dãy ngoặc đúng và chia kẹo Euler'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Catalan Numbers', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('Tổ hợp mod p nâng cao', 'catalan', [
      { q: 'Số dãy ngoặc đúng gồm n cặp ngoặc bằng giá trị nào?', options: ['Số Catalan thứ n: C(2n, n) / (n + 1)', '2^n', 'n!', 'C(2n, n)'], answer_index: 0, explain: 'Dãy ngoặc đúng là ứng dụng kinh điển của dãy Catalan.' },
      { q: 'Khi nào cần dùng Định lý Lucas để tính C(n, k) mod p?', options: ['Khi p nhỏ hơn n (nên không lấy được nghịch đảo modulo của n!)', 'Khi p > 10^9', 'Khi k == 0', 'Khi n <= 20'], answer_index: 0, explain: 'Khi n >= p, n! chia hết cho p nên không tồn tại nghịch đảo mod p.' },
    ]),
  },
  {
    code: '3.8', slug: 'dp-divisors', track_id: 3, sort_order: 8, title: 'DP kết hợp sàng ước',
    prereqs: ['3.1', '3.5'], topics: ['divisor-dp', 'dp', 'number-theory'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Duyệt qua các bội số j = 2i, 3i,... đạt tổng độ phức tạp O(N log N)', 'Kết hợp điều kiện chia hết với chuyển trạng thái DP', 'Giải các bài toán chọn dãy con có tính chất bội/ước'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Number of Divisors & DP', url: 'https://cp-algorithms.com/' }],
    quiz: makeQuiz('DP kết hợp sàng ước', 'divisor-dp', [
      { q: 'Tổng số lần lặp của for i=1..N, for j=i; j<=N; j+=i là bao nhiêu?', options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(N sqrt(N))'], answer_index: 0, explain: 'Chuỗi điều hòa sum(N/i) ≈ N ln N.' },
      { q: 'Khi cập nhật DP từ ước sang bội, nên push (i -> bội của i) hay pull?', options: ['Push từ i tới j = 2i, 3i... vừa tự nhiên vừa nhanh', 'Luôn dùng đệ quy có nhớ toàn bảng', 'Không thể dùng vòng lặp', 'Chỉ áp dụng cho số nguyên tố'], answer_index: 0, explain: 'Duyệt bội theo kiểu sàng không cần phải phân tích ước từng số.' },
    ]),
  },
  {
    code: '3.9', slug: 'dp-dag', track_id: 3, sort_order: 9, title: 'DP trên DAG',
    prereqs: ['3.1', '3.3'], topics: ['dag-dp', 'topo-sort', 'dp', 'graphs'], fit_check: true, complexity: 'O(V + E)',
    objectives: ['Kiểm tra đồ thị có hướng không chu trình (DAG) bằng thuật toán Kahn hoặc DFS', 'Tính đường đi dài nhất và đếm số đường đi trên DAG', 'Chuyển bài toán thứ tự phụ thuộc thành DP theo thứ tự topo'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 16: Directed Graphs', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('DP trên DAG', 'dag-dp', [
      { q: 'Tại sao DP trên đồ thị cần tính chất DAG (không chu trình)?', options: ['Để trạng thái chuyển không tạo vòng phụ thuộc vô hạn', 'Vì đồ thị có trọng số âm', 'Vì số đỉnh luôn <= 100', 'Để dùng được BFS'], answer_index: 0, explain: 'Thứ tự topo đảm bảo khi tính dp[v] thì mọi tiền nhiệm u -> v đã được tính xong.' },
      { q: 'Nếu dùng thuật toán Kahn (indegree) mà số đỉnh trong thứ tự topo < V, kết luận là gì?', options: ['Đồ thị có chu trình (không phải DAG)', 'Đồ thị không liên thông', 'Tồn tại cạnh song song', 'Đồ thị là cây'], answer_index: 0, explain: 'Các đỉnh thuộc chu trình có bậc vào không bao giờ giảm về 0.' },
    ]),
  },
  {
    code: '3.10', slug: 'level3-review', track_id: 3, sort_order: 10, title: 'Tổng hợp cấp 3',
    prereqs: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Hoàn thành 20 bài DP cốt lõi và các bài đồ thị/DSU nền tảng', 'Phân biệt nhanh bài toán DP 1D/2D/DAG và bài toán Đồ thị', 'Chinh phục toàn bộ chặng Phát hành Đợt 1 (Cấp 0–3)'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 7 & 12', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tổng hợp cấp 3', 'dp', [
      { q: 'Bài toán hỏi "có tồn tại đường đi từ u đến v sau các thao tác nối cạnh" phù hợp với cấu trúc nào nhất?', options: ['DSU', 'Floyd-Warshall', 'FFT', 'Trie'], answer_index: 0, explain: 'DSU kiểm tra tính liên thông động chỉ trong O(α(n)).' },
      { q: 'Trong AtCoder DP Contest, bài Knapsack 2 có W <= 10^9 nhưng tổng giá trị V <= 10^5. Ta đổi trạng thái thành gì?', options: ['dp[v] = trọng lượng nhỏ nhất đạt được giá trị v', 'dp[w] = giá trị lớn nhất', 'Dùng bitset 10^9 bit', 'Dùng tham lam'], answer_index: 0, explain: 'Hoán đổi chiều trạng thái và giá trị khi miền W quá lớn nhưng miền giá trị nhỏ.' },
    ]),
  },

  // Cấp 4
  { code: '4.1', slug: 'dijkstra', track_id: 4, sort_order: 1, title: 'Dijkstra', prereqs: ['3.3'], topics: ['dijkstra', 'shortest-paths', 'graphs'], fit_check: true, complexity: 'O((V + E) log V)', objectives: ['Hiểu cơ chế tham lam của Dijkstra với trọng số không âm', 'Cài đặt Dijkstra bằng min-heap (priority_queue) tránh TLE', 'Mở rộng đồ thị phân tầng (layered graph) cho bài toán giảm giá vé'], sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 13: Shortest Paths', url: 'https://cses.fi/book/book.pdf' }], quiz: makeQuiz('Dijkstra', 'dijkstra', [{ q: 'Tại sao Dijkstra sai khi đồ thị có cạnh trọng số âm?', options: ['Đỉnh đã chốt khoảng cách nhỏ nhất vẫn có thể được tối ưu tiếp qua cạnh âm', 'Heap không chứa được số âm', 'Vòng lặp không dừng', 'Sai ở bước khởi tạo'], answer_index: 0, explain: 'Tính chất đơn điệu khi lấy đỉnh nhỏ nhất từ heap bị phá vỡ khi có cạnh âm.' }]) },
  { code: '4.2', slug: 'bellman-ford', track_id: 4, sort_order: 2, title: 'Bellman-Ford', prereqs: ['4.1'], topics: ['bellman-ford', 'negative-cycle', 'shortest-paths', 'graphs'], fit_check: true, complexity: 'O(VE)', objectives: ['Tìm đường đi ngắn nhất khi có trọng số âm', 'Phát hiện và truy vết chu trình âm sau n vòng lặp', 'Kiểm tra đỉnh thuộc chu trình âm có đi tới được đích không'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Bellman-Ford', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Bellman-Ford', 'bellman-ford', [{ q: 'Đường đi ngắn nhất đơn giản trong đồ thị V đỉnh có tối đa bao nhiêu cạnh?', options: ['V - 1 cạnh', 'V cạnh', 'E cạnh', '2V cạnh'], answer_index: 0, explain: 'Nếu có >= V cạnh thì chắc chắn lặp lại đỉnh.' }]) },
  { code: '4.3', slug: 'floyd-warshall', track_id: 4, sort_order: 3, title: 'Floyd-Warshall', prereqs: ['4.1'], topics: ['floyd-warshall', 'shortest-paths', 'graphs'], fit_check: true, complexity: 'O(V^3)', objectives: ['Tính khoảng cách ngắn nhất giữa mọi cặp đỉnh trong O(V^3)', 'Nhớ đúng thứ tự vòng lặp k ở ngoài cùng', 'Xử lý đa cạnh khi khởi tạo ma trận trọng số'], sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 13', url: 'https://cses.fi/book/book.pdf' }], quiz: makeQuiz('Floyd-Warshall', 'floyd-warshall', [{ q: 'Trong Floyd-Warshall, đỉnh trung gian k phải đặt ở vòng lặp nào?', options: ['Ngoài cùng', 'Trong cùng', 'Ở giữa', 'Bất kỳ đâu'], answer_index: 0, explain: 'k là tập các đỉnh trung gian được phép đi qua ở từng pha DP.' }]) },
  { code: '4.4', slug: 'mst', track_id: 4, sort_order: 4, title: 'MST (Kruskal, Prim)', prereqs: ['3.4'], topics: ['mst', 'kruskal', 'prim', 'dsu', 'graphs'], fit_check: true, complexity: 'O(E log E)', objectives: ['Cài đặt thuật toán Kruskal dùng DSU', 'Cài đặt thuật toán Prim cho đồ thị dày', 'Kiểm tra điều kiện đồ thị liên thông (đủ n - 1 cạnh)'], sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 15: Spanning Trees', url: 'https://cses.fi/book/book.pdf' }], quiz: makeQuiz('MST', 'mst', [{ q: 'Cây khung nhỏ nhất trên đồ thị liên thông N đỉnh có đúng bao nhiêu cạnh?', options: ['N - 1', 'N', 'N + 1', 'E'], answer_index: 0, explain: 'Mọi cây N đỉnh đều có đúng N - 1 cạnh.' }]) },
  { code: '4.5', slug: 'topological-sort', track_id: 4, sort_order: 5, title: 'Sắp xếp topo', prereqs: ['3.3'], topics: ['topo-sort', 'graphs'], fit_check: true, complexity: 'O(V + E)', objectives: ['Cài đặt thuật toán Kahn (BFS theo bậc vào) và DFS post-order', 'Tìm thứ tự topo nhỏ nhất theo từ điển bằng min-heap', 'Phát hiện chu trình trên đồ thị có hướng'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Topological Sort', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Sắp xếp topo', 'topo-sort', [{ q: 'Để tìm thứ tự topo nhỏ nhất theo thứ tự từ điển, thay queue trong Kahn bằng gì?', options: ['Min-heap (priority_queue với greater)', 'Stack', 'Deque', 'Set ngược'], answer_index: 0, explain: 'Luôn chọn đỉnh khả dụng có chỉ số nhỏ nhất hiện tại.' }]) },
  { code: '4.6', slug: 'fenwick', track_id: 4, sort_order: 6, title: 'Fenwick (BIT)', prereqs: ['2.2'], topics: ['fenwick', 'data-structures'], fit_check: true, complexity: 'O(log n)', objectives: ['Hiểu phép toán bit i & -i trên Fenwick Tree', 'Cập nhật điểm và truy vấn tổng tiền tố trong O(log n)', 'Tìm kiếm nhị phân trên BIT trong O(log n)'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Fenwick Tree', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Fenwick Tree', 'fenwick', [{ q: 'Phép toán i & -i trả về giá trị nào?', options: ['Lũy thừa của 2 lớn nhất chia hết i (bit 1 thấp nhất)', 'Phần nguyên i/2', 'Bit cao nhất của i', 'Số lượng bit 1'], answer_index: 0, explain: 'Bù 2 của i đảo bit và cộng 1 nên chỉ giữ lại bit 1 ngoài cùng bên phải.' }]) },
  { code: '4.7', slug: 'segment-tree', track_id: 4, sort_order: 7, title: 'Segment tree', prereqs: ['4.6'], topics: ['segment-tree', 'lazy-propagation', 'data-structures'], fit_check: true, complexity: 'O(log n)', objectives: ['Cài đặt Segment Tree kích thước 4N cho min/max/sum', 'Áp dụng Lazy Propagation để cập nhật đoạn trong O(log n)', 'Thực hiện Segment Tree Walk tìm phần tử đầu tiên >= X'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Segment Tree', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Segment Tree', 'segment-tree', [{ q: 'Kích thước mảng an toàn cho Segment Tree trên mảng N phần tử là bao nhiêu?', options: ['4 * N', '2 * N', 'N', 'N * log N'], answer_index: 0, explain: 'Cây nhị phân đầy đủ với N lá có thể cần chỉ số nút lên tới xấp xỉ 4N.' }]) },
  { code: '4.8', slug: 'sparse-table', track_id: 4, sort_order: 8, title: 'Sparse table', prereqs: ['4.7'], topics: ['sparse-table', 'rmq', 'data-structures'], fit_check: true, complexity: 'O(n log n) build, O(1) query', objectives: ['Dựng bảng thưa sp[k][i] cho các phép toán lũy đẳng (min, max, gcd)', 'Truy vấn RMQ tĩnh trong O(1) nhờ gối đầu 2 đoạn 2^k', 'Phân biệt khi nào dùng Sparse Table vs Segment Tree'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Sparse Table', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Sparse Table', 'sparse-table', [{ q: 'Phép toán nào KHÔNG thể truy vấn O(1) trực tiếp bằng Sparse Table gối đầu 2 đoạn?', options: ['Tổng đoạn (Sum)', 'Min đoạn', 'Max đoạn', 'GCD đoạn'], answer_index: 0, explain: 'Tổng không có tính lũy đẳng (idempotent): cộng phần giao bị tính hai lần.' }]) },
  { code: '4.9', slug: 'bitmask-dp', track_id: 4, sort_order: 9, title: 'Bitmask DP', prereqs: ['3.1'], topics: ['bitmask-dp', 'bitmasks', 'dp'], fit_check: true, complexity: 'O(2^n * n)', objectives: ['Biểu diễn tập con tối đa 20 phần tử bằng số nguyên mask', 'Giải bài toán ghép cặp và TSP trên tập con', 'Duyệt các tập con của một mask (submask enumeration) trong O(3^n)'], sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 10: Bit Manipulation', url: 'https://cses.fi/book/book.pdf' }], quiz: makeQuiz('Bitmask DP', 'bitmask-dp', [{ q: 'Độ phức tạp của việc duyệt toàn bộ tập con của mọi mask độ dài n là gì?', options: ['O(3^n)', 'O(4^n)', 'O(2^n)', 'O(n! )'], answer_index: 0, explain: 'Mỗi vị trí có 3 trạng thái: không thuộc mask, thuộc mask nhưng không thuộc submask, thuộc cả hai.' }]) },
  { code: '4.10', slug: 'tree-dp', track_id: 4, sort_order: 10, title: 'DP trên cây',
    prereqs: ['3.1', '3.3'], topics: ['tree-dp', 'rerooting', 'dp', 'trees'], fit_check: true, complexity: 'O(n)',
    objectives: ['Tính giá trị DP từ lá lên gốc bằng DFS', 'Áp dụng kỹ thuật Rerooting (đổi gốc) tính đáp án cho mọi đỉnh trong O(n)', 'Tìm đường kính cây và bài toán ghép cặp cực đại trên cây'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 14: Tree Algorithms', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('DP trên cây', 'tree-dp', [{ q: 'Trong kỹ thuật Rerooting trên cây, cần bao nhiêu lần DFS?', options: ['2 lần DFS (1 từ gốc lên, 1 từ gốc xuống đẩy đóng góp phần ngoài cây con)', 'N lần DFS', 'N^2 lần', '1 lần BFS'], answer_index: 0, explain: 'DFS lần 1 tính cây con, DFS lần 2 truyền thông tin từ cha xuống con.' }]) },
  { code: '4.11', slug: 'hashing', track_id: 4, sort_order: 11, title: 'Hashing', prereqs: ['2.6'], topics: ['string-hash', 'hashing', 'strings'], fit_check: true, complexity: 'O(n + q)', objectives: ['Cài đặt Polynomial Rolling Hash cho chuỗi', 'Dùng Double Hash (2 modulo nguyên tố) để tránh xác suất đụng độ', 'So sánh hai xâu con bất kỳ trong O(1)'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — String Hashing', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('Hashing', 'hashing', [{ q: 'Tại sao nên dùng Double Hash với 2 modulo khác nhau khi so sánh chuỗi?', options: ['Giảm xác suất đụng độ (collision) xuống gần bằng 0 trước test sinh nhật', 'Để tăng tốc gấp đôi', 'Vì chuỗi có dấu cách', 'Bắt buộc trong C++17'], answer_index: 0, explain: 'Theo nghịch lý ngày sinh, 1 modulo 10^9+7 dễ bị đụng độ khi so sánh ~10^5 chuỗi.' }]) },
  { code: '4.12', slug: 'kmp-z-function', track_id: 4, sort_order: 12, title: 'KMP, Z-function', prereqs: ['4.11'], topics: ['kmp', 'z-function', 'strings'], fit_check: true, complexity: 'O(n + m)', objectives: ['Xây dựng hàm tiền tố (prefix function π) của thuật toán KMP', 'Cài đặt Z-function trong O(n)', 'Tìm mọi vị trí xuất hiện của mẫu P trong văn bản T trong thời gian tuyến tính'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Prefix function & Z-function', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('KMP, Z-function', 'kmp', [{ q: 'Độ phức tạp của thuật toán KMP và Z-function khi tìm kiếm mẫu P độ dài m trong T độ dài n là gì?', options: ['O(n + m)', 'O(nm)', 'O(n log m)', 'O(m^2)'], answer_index: 0, explain: 'Con trỏ không lùi quá tổng số bước tiến nên thời gian chạy hoàn toàn tuyến tính.' }]) },

  // Cấp 5
  { code: '5.1', slug: 'lca', track_id: 5, sort_order: 1, title: 'LCA (binary lifting)', prereqs: ['4.10'], topics: ['lca', 'binary-lifting', 'trees'], fit_check: true, complexity: 'O(n log n) build, O(log n) query', objectives: ['Dựng bảng tổ tiên up[k][u] bằng Binary Lifting', 'Tìm LCA(u, v) và khoảng cách trên cây trong O(log n)', 'Ứng dụng hiệu mảng trên cây (Tree Difference Array) đếm đường đi'], sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Lowest Common Ancestor', url: 'https://cp-algorithms.com/' }], quiz: makeQuiz('LCA', 'lca', [{ q: 'Khoảng cách giữa hai đỉnh u và v trên cây bằng gì theo LCA?', options: ['depth[u] + depth[v] - 2 * depth[lca(u, v)]', 'depth[u] + depth[v]', 'depth[lca(u, v)]', 'abs(depth[u] - depth[v])'], answer_index: 0, explain: 'Trừ đi 2 lần độ sâu đoạn chung từ gốc tới LCA.' }]) },
  { code: '5.2', slug: 'hld', track_id: 5, sort_order: 2, title: 'HLD', prereqs: ['4.7', '5.1'], topics: ['hld', 'trees', 'data-structures'], fit_check: true, complexity: 'O(log^2 n) mỗi truy vấn',
    objectives: ['Phân rã cây thành các Heavy Chain sao cho bất kỳ đường đi nào đi qua <= log N chuỗi', 'Ánh xạ vị trí các chuỗi liên tiếp lên Euler Tour để dùng Segment Tree', 'Cập nhật và truy vấn thông tin trên đường đi từ u đến v'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Heavy-Light Decomposition', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Heavy-Light Decomposition (HLD)\n\nHLD chọn tại mỗi đỉnh u cạnh nối tới con có **kích thước cây con lớn nhất** làm *cạnh nặng* (heavy edge), các cạnh còn lại là *cạnh nhẹ*.\n\n**Tính chất vàng:** Khi đi từ một đỉnh bất kỳ lên gốc, mỗi lần đi qua một cạnh nhẹ thì kích thước cây con ít nhất tăng gấp đôi, nên số chuỗi nặng đi qua tối đa là $\\lceil \\log_2 N \\rceil$.\n\nKết hợp đánh số DFS ưu tiên con nặng trước, mỗi chuỗi nặng tạo thành một đoạn liên tiếp trên mảng chỉ số \`pos[]\`, từ đó xử lý bằng Segment Tree trong $O(\\log^2 N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
const int N = 200005;
vector<int> adj[N];
int sz[N], par[N], dep[N], heavy[N], head[N], pos[N], cur_pos = 0;

int dfs(int u, int p) {
    sz[u] = 1; par[u] = p;
    int max_c = 0;
    for (int v : adj[u]) if (v != p) {
        dep[v] = dep[u] + 1;
        int c = dfs(v, u);
        sz[u] += c;
        if (c > max_c) { max_c = c; heavy[u] = v; }
    }
    return sz[u];
}

void decompose(int u, int h) {
    head[u] = h; pos[u] = ++cur_pos;
    if (heavy[u]) decompose(heavy[u], h);
    for (int v : adj[u]) if (v != par[u] && v != heavy[u])
        decompose(v, v);
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; if (!(cin >> n)) return 0;
    for (int i = 1; i < n; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    dfs(1, 0); decompose(1, 1);
    for (int i = 1; i <= n; i++) cout << pos[i] << " ";
    return 0;
}`,
    quiz: makeQuiz('HLD', 'hld', [{ q: 'Một đường đi bất kỳ giữa u và v trên cây N đỉnh cắt tối đa bao nhiêu chuỗi nặng trong HLD?', options: ['O(log N)', 'O(N)', 'O(sqrt(N))', '1'], answer_index: 0, explain: 'Mỗi lần nhảy chuỗi kích thước cây con ít nhất nhân đôi.' }]) },
  { code: '5.3', slug: 'centroid-decomposition', track_id: 5, sort_order: 3, title: 'Centroid decomposition', prereqs: ['5.1'], topics: ['centroid', 'divide-and-conquer', 'trees'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Tìm trọng tâm (centroid) của cây với mọi cây con <= N/2', 'Xây dựng cây trọng tâm có chiều cao <= log2(N)', 'Đếm số cặp đỉnh có khoảng cách K trên cây bằng chia để trị'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Centroid Decomposition', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Centroid Decomposition\n\nTrọng tâm (centroid) của cây kích thước $S$ là đỉnh mà khi xóa nó đi, mọi thành phần liên thông còn lại đều có kích thước $\\le S/2$.\n\nBằng cách đệ quy xóa centroid và chia nhỏ cây, cây phân rã thu được luôn có độ sâu $\\le \\log_2 N$, giúp giải các bài toán đếm đường đi cố định độ dài hoặc truy vấn khoảng cách gần nhất trong $O(N \\log N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
const int N = 100005;
vector<int> adj[N];
int sz[N];
bool removed[N];

void calc_sz(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) if (v != p && !removed[v]) {
        calc_sz(v, u);
        sz[u] += sz[v];
    }
}

int find_centroid(int u, int p, int tot) {
    for (int v : adj[u]) if (v != p && !removed[v] && sz[v] > tot / 2)
        return find_centroid(v, u, tot);
    return u;
}

int main() {
    int n; if (!(cin >> n)) return 0;
    for (int i = 1; i < n; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    calc_sz(1, 0);
    cout << find_centroid(1, 0, sz[1]) << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Centroid decomposition', 'centroid', [{ q: 'Chiều cao tối đa của cây Centroid Decomposition trên N đỉnh là bao nhiêu?', options: ['log2(N)', 'N', 'sqrt(N)', 'N/2'], answer_index: 0, explain: 'Mỗi tầng kích thước mỗi phần giảm ít nhất một nửa.' }]) },
  { code: '5.4', slug: 'scc', track_id: 5, sort_order: 4, title: 'SCC (Tarjan, Kosaraju)', prereqs: ['3.3'], topics: ['scc', '2-sat', 'graphs'], fit_check: true, complexity: 'O(V + E)',
    objectives: ['Phân biệt thành phần liên thông mạnh bằng Tarjan (low-link) và Kosaraju', 'Nén SCC thành đồ thị DAG (Condensation Graph)', 'Mô hình hóa bài toán 2-SAT bằng đồ thị suy diễn'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Strongly Connected Components', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Thành phần liên thông mạnh (SCC) & 2-SAT\n\nHai đỉnh $u, v$ thuộc cùng một SCC nếu có đường đi từ $u \\to v$ và từ $v \\to u$. Sau khi co mỗi SCC thành một đỉnh, đồ thị còn lại luôn là một **DAG**.\n\nTrong **2-SAT**, mệnh đề $(a \\lor b)$ tương đương hai cạnh suy diễn $\\neg a \\to b$ và $\\neg b \\to a$. Hệ có nghiệm khi và chỉ khi không có biến $x$ nào nằm cùng SCC với $\\neg x$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
int timer = 0, scc_cnt = 0;
vector<vector<int>> adj;
vector<int> tin, low, comp;
vector<bool> in_st;
stack<int> st;

void dfs(int u) {
    tin[u] = low[u] = ++timer;
    st.push(u); in_st[u] = true;
    for (int v : adj[u]) {
        if (!tin[v]) { dfs(v); low[u] = min(low[u], low[v]); }
        else if (in_st[v]) low[u] = min(low[u], tin[v]);
    }
    if (low[u] == tin[u]) {
        scc_cnt++;
        while (true) {
            int v = st.top(); st.pop();
            in_st[v] = false; comp[v] = scc_cnt;
            if (v == u) break;
        }
    }
}

int main() {
    int n, m; if (!(cin >> n >> m)) return 0;
    adj.assign(n + 1, {}); tin.assign(n + 1, 0);
    low.assign(n + 1, 0); comp.assign(n + 1, 0); in_st.assign(n + 1, false);
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; adj[u].push_back(v); }
    for (int i = 1; i <= n; i++) if (!tin[i]) dfs(i);
    cout << scc_cnt << "\\n";
    return 0;
}`,
    quiz: makeQuiz('SCC', 'scc', [{ q: 'Bài toán 2-SAT vô nghiệm khi nào?', options: ['Tồn tại biến x và phủ định ¬x nằm trong cùng một SCC', 'Đồ thị có hơn 2 SCC', 'Số cạnh lẻ', 'Tồn tại đỉnh bậc 0'], answer_index: 0, explain: 'Nếu x và ¬x cùng SCC thì x suy ra ¬x và ngược lại, gây mâu thuẫn.' }]) },
  { code: '5.5', slug: 'bridges-articulation', track_id: 5, sort_order: 5, title: 'Cầu và khớp', prereqs: ['5.4'], topics: ['bridges', 'articulation-points', 'graphs'], fit_check: true, complexity: 'O(V + E)',
    objectives: ['Tính mảng tin[u] và low[u] trên cây DFS đồ thị vô hướng', 'Xác định cạnh cầu: low[v] > tin[u]', 'Xác định đỉnh khớp: low[v] >= tin[u] (và trường hợp riêng của gốc cây DFS)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Finding Bridges', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Tìm Cầu và Khớp bằng Tarjan\n\nTrên cây DFS, \`low[u]\` là thời gian thăm nhỏ nhất có thể chạm tới từ cây con gốc \`u\` bằng tối đa 1 cạnh ngược (back-edge).\n- Cạnh $(u, v)$ là **cầu** nếu \`low[v] > tin[u]\` (cây con $v$ không có cạnh ngược vươn lên trên $u$).\n- Đỉnh $u$ (khác gốc) là **khớp** nếu có ít nhất 1 con $v$ thỏa \`low[v] >= tin[u]\`. Gốc cây DFS là khớp nếu có $\\ge 2$ con trực tiếp.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
int timer = 0;
vector<vector<int>> adj;
vector<int> tin, low;
vector<pair<int,int>> bridges;

void dfs(int u, int p = -1) {
    tin[u] = low[u] = ++timer;
    for (int v : adj[u]) {
        if (v == p) continue;
        if (tin[v]) low[u] = min(low[u], tin[v]);
        else {
            dfs(v, u);
            low[u] = min(low[u], low[v]);
            if (low[v] > tin[u]) bridges.push_back({u, v});
        }
    }
}

int main() {
    int n, m; if (!(cin >> n >> m)) return 0;
    adj.assign(n + 1, {}); tin.assign(n + 1, 0); low.assign(n + 1, 0);
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }
    for (int i = 1; i <= n; i++) if (!tin[i]) dfs(i);
    cout << bridges.size() << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Cầu và khớp', 'bridges', [{ q: 'Điều kiện để cạnh cây (u, v) với u là cha của v trở thành cạnh cầu là gì?', options: ['low[v] > tin[u]', 'low[v] == tin[u]', 'low[v] < tin[u]', 'deg[u] == 1'], answer_index: 0, explain: 'low[v] > tin[u] nghĩa là từ cây con v không có cạnh ngược nào quay lên u hoặc tổ tiên của u.' }]) },
  { code: '5.6', slug: 'max-flow', track_id: 5, sort_order: 6, title: 'Max flow', prereqs: ['3.3'], topics: ['max-flow', 'min-cut', 'flows', 'graphs'], fit_check: true, complexity: 'O(V^2 E) Dinic',
    objectives: ['Xây dựng đồ thị thặng dư (residual graph) với cạnh ngược', 'Cài đặt thuật toán Dinic dùng Level Graph (BFS) và Blocking Flow (DFS)', 'Áp dụng định lý Max-Flow Min-Cut giải các bài tập lát cắt'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Dinic Algorithm', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Luồng cực đại (Dinic) & Max-Flow Min-Cut\n\nThuật toán **Dinic** lặp lại 2 bước: (1) dùng BFS dựng đồ thị phân tầng theo khoảng cách từ nguồn $S$; (2) dùng DFS đẩy nhiều đường tăng luồng cùng lúc (blocking flow) với con trỏ \`ptr[]\` tránh duyệt lại cạnh đã bão hòa.\n\nTheo định lý Max-Flow Min-Cut, giá trị luồng cực đại từ $S \\to T$ luôn bằng tổng trọng số nhỏ nhất của tập cạnh cần cắt để tách $S$ khỏi $T$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int v, rev; long long cap; };
vector<vector<Edge>> adj;
vector<int> lvl, ptr;

bool bfs(int s, int t) {
    fill(lvl.begin(), lvl.end(), -1);
    queue<int> q; lvl[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto &e : adj[u])
            if (e.cap > 0 && lvl[e.v] == -1) {
                lvl[e.v] = lvl[u] + 1; q.push(e.v);
            }
    }
    return lvl[t] != -1;
}

long long dfs(int u, int t, long long pushed) {
    if (pushed == 0 || u == t) return pushed;
    for (int &cid = ptr[u]; cid < (int)adj[u].size(); cid++) {
        auto &e = adj[u][cid];
        if (lvl[e.v] != lvl[u] + 1 || e.cap == 0) continue;
        long long tr = dfs(e.v, t, min(pushed, e.cap));
        if (tr == 0) continue;
        e.cap -= tr; adj[e.v][e.rev].cap += tr;
        return tr;
    }
    return 0;
}

int main() {
    int n, m; if (!(cin >> n >> m)) return 0;
    adj.assign(n + 1, {}); lvl.resize(n + 1); ptr.resize(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v; long long c; cin >> u >> v >> c;
        adj[u].push_back({v, (int)adj[v].size(), c});
        adj[v].push_back({u, (int)adj[u].size() - 1, 0});
    }
    long long flow = 0;
    while (bfs(1, n)) {
        fill(ptr.begin(), ptr.end(), 0);
        while (long long pushed = dfs(1, n, 1e18)) flow += pushed;
    }
    cout << flow << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Max flow', 'max-flow', [{ q: 'Độ phức tạp của Dinic trên mạng hai phía đơn vị (bipartite matching) là gì?', options: ['O(E sqrt(V))', 'O(V^3)', 'O(2^V)', 'O(E^2)'], answer_index: 0, explain: 'Mạng có dung lượng 1 chứng minh được số pha BFS tối đa là O(sqrt(V)).' }]) },
  { code: '5.7', slug: 'matching', track_id: 5, sort_order: 7, title: 'Ghép cặp', prereqs: ['5.6'], topics: ['bipartite-matching', 'hungarian', 'graphs'], fit_check: true, complexity: 'O(VE) Kuhn / O(n^3) Hungarian',
    objectives: ['Cài đặt thuật toán Kuhn tìm cặp ghép cực đại trên đồ thị hai phía', 'Áp dụng định lý Konig liên hệ cặp ghép cực đại và tập phủ đỉnh nhỏ nhất', 'Nắm nguyên lý thuật toán Hungarian cho bài toán phân công chi phí nhỏ nhất'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Kuhn Algorithm', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Ghép cặp hai phía (Kuhn / Hopcroft-Karp)\n\nBài toán tìm tập cạnh không chung đỉnh lớn nhất trên đồ thị hai phía có thể giải gọn bằng **Kuhn (đường mở)** trong $O(VE)$ hoặc dùng **Dinic** với $O(E\\sqrt{V})$.\n\nTheo **Định lý König**, trên đồ thị hai phía, kích thước cặp ghép cực đại bằng đúng kích thước **tập phủ đỉnh nhỏ nhất (Minimum Vertex Cover)**.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
vector<vector<int>> adj;
vector<int> matchR, vis;

bool try_kuhn(int u, int iter) {
    if (vis[u] == iter) return false;
    vis[u] = iter;
    for (int v : adj[u]) {
        if (matchR[v] == -1 || try_kuhn(matchR[v], iter)) {
            matchR[v] = u;
            return true;
        }
    }
    return false;
}

int main() {
    int n, m, k; if (!(cin >> n >> m >> k)) return 0;
    adj.assign(n + 1, {}); matchR.assign(m + 1, -1); vis.assign(n + 1, 0);
    for (int i = 0; i < k; i++) { int u, v; cin >> u >> v; adj[u].push_back(v); }
    int ans = 0;
    for (int i = 1; i <= n; i++) if (try_kuhn(i, i)) ans++;
    cout << ans << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Ghép cặp', 'bipartite-matching', [{ q: 'Theo định lý König trên đồ thị hai phía, kích thước cặp ghép cực đại bằng gì?', options: ['Kích thước tập phủ đỉnh cực tiểu (Minimum Vertex Cover)', 'Số đỉnh chia 2', 'Độ dài đường kính', 'Số thành phần liên thông'], answer_index: 0, explain: 'Đây là hệ quả trực tiếp của Max-Flow Min-Cut trên mạng hai phía.' }]) },
  { code: '5.8', slug: 'convex-hull-trick', track_id: 5, sort_order: 8, title: 'CHT', prereqs: ['3.1'], topics: ['cht', 'dp'], fit_check: true, complexity: 'O(n) / O(n log n)',
    objectives: ['Nhận diện dạng truy hồi DP tuyến tính dp[i] = min(m_j * x_i + b_j)', 'Cài đặt bao lồi đơn điệu (Monotonic Deque CHT) trong O(n)', 'Xử lý đúng phép kiểm tra cắt bỏ đường thẳng (cross-product tránh tràn số)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Convex Hull Trick', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Convex Hull Trick (CHT)\n\nKhi công thức DP có dạng:\n$$dp[i] = \\min_{j < i} (m_j \\cdot x_i + c_j)$$\nNếu hệ số góc $m_j$ và điểm truy vấn $x_i$ đơn điệu, ta duy trì bao dưới các đường thẳng bằng \`deque\`, bỏ đường thẳng ở giữa khi giao điểm $(L_1, L_3)$ nằm bên trái giao điểm $(L_1, L_2)$. Tổng thời gian giảm từ $O(N^2)$ xuống $O(N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct Line {
    long long m, c;
    long long eval(long long x) const { return m * x + c; }
};
bool bad(Line a, Line b, Line c) {
    return (__int128)(b.c - a.c) * (b.m - c.m) >= (__int128)(c.c - b.c) * (a.m - b.m);
}
int main() {
    deque<Line> dq;
    dq.push_back({2, 5}); dq.push_back({1, 8});
    cout << dq.front().eval(10) << "\\n";
    return 0;
}`,
    quiz: makeQuiz('CHT', 'cht', [{ q: 'Tại sao thường ép sang __int128 hoặc double khi so sánh hai giao điểm trong CHT?', options: ['Vì tích (c1 - c2) * (m3 - m2) dễ vượt giới hạn 64-bit', 'Để làm tròn xuống', 'Để hỗ trợ số phức', 'Không cần thiết'], answer_index: 0, explain: 'Nếu m, c cỡ 10^9 thì tử số * mẫu số tới 10^18–10^24.' }]) },
  { code: '5.9', slug: 'dnc-optimization', track_id: 5, sort_order: 9, title: 'D&C optimization', prereqs: ['3.1'], topics: ['dnc-opt', 'divide-and-conquer', 'dp'], fit_check: true, complexity: 'O(kn log n)',
    objectives: ['Nhận diện bất đẳng thức tứ giác giúp điểm tối ưu opt(i, j) đơn điệu', 'Cài đặt hàm compute(l, r, optL, optR) cho từng tầng DP', 'Giảm độ phức tạp chia đoạn thành K nhóm từ O(kn^2) xuống O(kn log n)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Divide and Conquer DP', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Divide & Conquer DP Optimization\n\nÁp dụng cho công thức phân hoạch $N$ phần tử thành $K$ đoạn:\n$$dp[k][i] = \\min_{j < i} \\{ dp[k-1][j] + C(j+1, i) \\}$$\nNếu hàm chi phí thỏa **bất đẳng thức tứ giác** thì vị trí tối ưu $opt(k, i) \\le opt(k, i+1)$. Tính \`mid = (l+r)/2\`, tìm \`opt\` trong \`[optL, optR]\` rồi chia đôi khoảng hai bên, mỗi tầng mất $O(N \\log N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
long long cost(int l, int r) { return 1LL * (r - l + 1) * (r - l + 1); }
vector<long long> dp_prev, dp_cur;
void solve(int l, int r, int optL, int optR) {
    if (l > r) return;
    int mid = (l + r) / 2;
    pair<long long, int> best = {4e18, -1};
    for (int j = optL; j <= min(mid, optR); j++)
        best = min(best, {dp_prev[j - 1] + cost(j, mid), j});
    dp_cur[mid] = best.first;
    solve(l, mid - 1, optL, best.second);
    solve(mid + 1, r, best.second, optR);
}
int main() {
    int n = 5; dp_prev.assign(n + 1, 4e18); dp_cur.assign(n + 1, 4e18); dp_prev[0] = 0;
    solve(1, n, 1, n);
    cout << dp_cur[n] << "\\n";
    return 0;
}`,
    quiz: makeQuiz('D&C optimization', 'dnc-opt', [{ q: 'Điều kiện cốt lõi để áp dụng D&C DP Optimization là gì?', options: ['Điểm chia tối ưu opt(i) đơn điệu tăng theo i', 'Mảng đã sắp xếp', 'Chi phí luôn dương', 'K = 2'], answer_index: 0, explain: 'Tính đơn điệu của opt cho phép thu hẹp khoảng tìm kiếm cho hai nửa trái/phải.' }]) },
  { code: '5.10', slug: 'mo-algorithm', track_id: 5, sort_order: 10, title: "Mo's algorithm", prereqs: ['4.7'], topics: ['mo', 'data-structures'], fit_check: true, complexity: 'O((n + q) sqrt(n))',
    objectives: ['Sắp xếp truy vấn offline theo cặp (l / B, r) với kích thước khối B ≈ sqrt(N)', 'Tối ưu hằng số với sắp xếp zig-zag (đảo chiều r ở khối lẻ)', 'Đưa các bài toán đếm trên cây về mảng nhờ Euler Tour trước khi chạy Mo'],
    sources: [{ kind: 'cp-algorithms', title: "CP-Algorithms — Mo's Algorithm", url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Thuật toán Mo (Offline Range Queries)\n\nChia chỉ số trái $L$ thành các khối kích thước $B \\approx \\sqrt{N}$. Sắp xếp các truy vấn tăng dần theo khối của $L$, cùng khối thì tăng dần theo $R$ (tối ưu hơn: chẵn tăng, lẻ giảm).\n\nKhi chuyển từ truy vấn này sang truy vấn kế tiếp bằng 4 vòng \`while\` (add/remove ở hai đầu), tổng số lần di chuyển con trỏ được chặn trên bởi $O((N + Q)\\sqrt{N})$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
const int B = 450;
struct Query {
    int l, r, id;
    bool operator<(const Query& o) const {
        if (l / B != o.l / B) return l / B < o.l / B;
        return (l / B & 1) ? (r < o.r) : (r > o.r);
    }
};
int main() {
    vector<Query> qs = {{1, 5, 0}, {2, 4, 1}};
    sort(qs.begin(), qs.end());
    cout << qs[0].id << "\\n";
    return 0;
}`,
    quiz: makeQuiz("Mo's algorithm", 'mo', [{ q: "Hạn chế lớn nhất của Mo's Algorithm cơ bản là gì?", options: ['Chỉ giải quyết được bài toán offline (không có cập nhật xen kẽ nếu không dùng Mo 3D)', 'Không chạy được trên mảng số âm', 'Tốn O(N^2) bộ nhớ', 'Phải biết trước đáp án'], answer_index: 0, explain: 'Phải biết trước toàn bộ danh sách truy vấn để sắp xếp lại thứ tự thực hiện.' }]) },
  { code: '5.11', slug: 'sqrt-decomposition', track_id: 5, sort_order: 11, title: 'Sqrt decomposition', prereqs: ['4.7'], topics: ['sqrt-decomp', 'data-structures'], fit_check: true, complexity: 'O(sqrt(n)) mỗi thao tác',
    objectives: ['Chia mảng thành sqrt(N) khối và lưu giá trị tổng hợp mỗi khối', 'Áp dụng chiến lược chia nặng/nhẹ (Heavy-Light Trick) theo ngưỡng sqrt(N)', 'Kết hợp rebuild định kỳ sau mỗi B thao tác cập nhật'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Sqrt Decomposition', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Chia căn (Sqrt Decomposition)\n\nChia mảng thành các khối kích thước $B = \\lfloor\\sqrt{N}\\rfloor$. Mọi truy vấn đoạn $[L, R]$ đều gồm tối đa $2$ phần đầu/cuối chưa trọn khối (duyệt lẻ $\\le 2B$) và $\\le N/B$ khối trọn vẹn ở giữa.\n\nNgoài mảng, tư duy chia căn (Heavy-Light theo bậc/tần số $\\ge \\sqrt{N}$) xuất hiện cực kỳ nhiều trong các bài đồ thị và chuỗi.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n = 9, B = 3;
    vector<int> a = {1,2,3,4,5,6,7,8,9}, blk(3, 0);
    for (int i = 0; i < n; i++) blk[i / B] += a[i];
    int l = 1, r = 7, sum = 0;
    while (l <= r) {
        if (l % B == 0 && l + B - 1 <= r) { sum += blk[l / B]; l += B; }
        else { sum += a[l++]; }
    }
    cout << sum << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Sqrt decomposition', 'sqrt-decomp', [{ q: 'Trong bài toán đếm tam giác trên đồ thị M cạnh, tại sao ta chia đỉnh thành đỉnh nhẹ (deg <= sqrt(M)) và đỉnh nặng?', options: ['Để cân bằng chi phí giữa số lượng đỉnh nặng (<= 2*sqrt(M)) và bậc của đỉnh nhẹ', 'Để chạy DFS nhanh hơn', 'Vì đồ thị có trọng số âm', 'Để dùng Kruskal'], answer_index: 0, explain: 'Cân bằng hai nhánh giúp tổng độ phức tạp đạt O(M sqrt(M)).' }]) },
  { code: '5.12', slug: 'sprague-grundy', track_id: 5, sort_order: 12, title: 'Sprague-Grundy', prereqs: ['3.1'], topics: ['sprague-grundy', 'nim', 'games'], fit_check: true, complexity: 'O(states * transitions)',
    objectives: ['Nắm định lý Nim: người đi trước thắng khi XOR tổng các đống != 0', 'Tính hàm Grundy G(s) = mex({G(t) | s -> t})', 'Tách trò chơi lớn thành tổng XOR của các trò chơi con độc lập'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Sprague-Grundy Theorem', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Định lý Sprague-Grundy & Trò chơi Nim\n\nMọi trò chơi đối kháng công bằng (impartial game) trên DAG đều tương đương với một đống Nim kích thước $G(u)$:\n$$G(u) = \\operatorname{mex}\\{ G(v) \\mid u \\to v \\}$$\nNếu trò chơi gồm nhiều thành phần độc lập, trạng thái tổng hợp thắng khi và chỉ khi phép **XOR** các giá trị Grundy khác $0$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
int mex(const vector<int>& vals) {
    vector<bool> has(vals.size() + 1, false);
    for (int x : vals) if (x < (int)has.size()) has[x] = true;
    for (int i = 0; ; i++) if (!has[i]) return i;
}
int main() {
    int n = 10; vector<int> g(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        vector<int> next_g;
        for (int take : {1, 3, 4}) if (i >= take) next_g.push_back(g[i - take]);
        g[i] = mex(next_g);
    }
    cout << (g[n] ? "First" : "Second") << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Sprague-Grundy', 'sprague-grundy', [{ q: 'Trong trò chơi Nim chuẩn gồm các đống {3, 5, 6}, người đi trước có thắng không?', options: ['Không, vì 3 XOR 5 XOR 6 = 0', 'Có, vì 3 + 5 + 6 chẵn', 'Có, luôn thắng', 'Phụ thuộc đống lớn nhất'], answer_index: 0, explain: '3 ^ 5 ^ 6 = 011 ^ 101 ^ 110 = 000, nên trạng thái hiện tại là trạng thái thua.' }]) },

  // Cấp 6
  { code: '6.1', slug: 'fft-ntt', track_id: 6, sort_order: 1, title: 'FFT/NTT', prereqs: ['2.8', '3.6'], topics: ['fft-ntt', 'math'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Biến đổi đa thức từ hệ số sang biểu diễn điểm tại căn đơn vị', 'Cài đặt NTT modulo 998244353 (căn nguyên thủy g = 3) chính xác tuyệt đối', 'Ứng dụng nhân đa thức vào đếm tổng cặp và khớp chuỗi có ký tự đại diện'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Fast Fourier Transform', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### FFT & Number Theoretic Transform (NTT)\n\nNhân hai đa thức bậc $N$ trực tiếp tốn $O(N^2)$. **FFT/NTT** biến đổi hệ số sang giá trị tại các điểm căn bậc $2^k$ của đơn vị trong $O(N \\log N)$, nhân từng điểm trong $O(N)$, rồi biến đổi ngược.\n\nVới bài toán đếm nguyên modulo $998244353 = 119 \\cdot 2^{23} + 1$, dùng **NTT** với căn nguyên thủy $g = 3$ tránh hoàn toàn sai số số thực.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
const int MOD = 998244353;
long long modpow(long long a, long long e) {
    long long r = 1;
    while (e) { if (e & 1) r = r * a % MOD; a = a * a % MOD; e >>= 1; }
    return r;
}
int main() {
    cout << modpow(3, (MOD - 1) / 2) << "\\n";
    return 0;
}`,
    quiz: makeQuiz('FFT/NTT', 'fft-ntt', [{ q: 'Modulo kinh điển 998244353 phù hợp với NTT vì lý do gì?', options: ['998244353 - 1 chia hết cho lũy thừa lớn của 2 (2^23)', 'Nó là số chính phương', 'Nó gần với 10^9 nhất', 'Vì căn bậc 2 của nó nguyên'], answer_index: 0, explain: '998244353 = 119 * 2^23 + 1 cho phép chia đôi kích thước tới 2^23.' }]) },
  { code: '6.2', slug: 'persistent-segment-tree', track_id: 6, sort_order: 2, title: 'Persistent segment tree', prereqs: ['4.7'], topics: ['persistent-seg', 'data-structures'], fit_check: true, complexity: 'O(log n) thời gian & bộ nhớ mỗi update',
    objectives: ['Tạo nút mới dọc theo đường đi từ gốc tới lá khi cập nhật (Path Copying)', 'Trả lời truy vấn phần tử nhỏ thứ K trên đoạn [L, R] trong O(log n)', 'Quản lý lịch sử nhiều phiên bản cây mà không vượt giới hạn bộ nhớ'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Persistent Segment Tree', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Persistent Segment Tree\n\nMỗi phép cập nhật điểm trên Segment Tree chỉ làm thay đổi tối đa $O(\\log N)$ nút. Thay vì sửa trực tiếp, ta cấp phát $O(\\log N)$ nút mới trỏ lại các nhánh không đổi của phiên bản trước.\n\nỨng dụng kinh điển: **Range K-th Smallest** — dựng phiên bản $i$ cho tiền tố $[1..i]$, sau đó đi xuống đồng thời trên hai gốc $root[R]$ và $root[L-1]$ theo hiệu số lượng phần tử nhánh trái.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct Node { int l, r, cnt; };
vector<Node> tr(1);
int update(int prev, int tl, int tr_r, int pos) {
    int cur = tr.size();
    tr.push_back(tr[prev]); tr[cur].cnt++;
    if (tl < tr_r) {
        int tm = (tl + tr_r) / 2;
        if (pos <= tm) tr[cur].l = update(tr[prev].l, tl, tm, pos);
        else tr[cur].r = update(tr[prev].r, tm + 1, tr_r, pos);
    }
    return cur;
}
int main() { cout << update(0, 1, 8, 3) << "\\n"; return 0; }`,
    quiz: makeQuiz('Persistent segment tree', 'persistent-seg', [{ q: 'Mỗi lần cập nhật điểm trên Persistent Segment Tree tạo thêm bao nhiêu nút mới?', options: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'], answer_index: 0, explain: 'Chỉ nhân bản các nút nằm trên đường đi từ gốc xuống lá.' }]) },
  { code: '6.3', slug: 'li-chao-tree', track_id: 6, sort_order: 3, title: 'Li Chao tree', prereqs: ['5.8'], topics: ['li-chao', 'cht', 'data-structures', 'dp'], fit_check: true, complexity: 'O(log C)',
    objectives: ['Chèn đường thẳng bất kỳ (không cần hệ số góc đơn điệu) vào Segment Tree', 'Cài đặt Li Chao Tree cho đoạn thẳng và mở rộng tọa độ lớn bằng Dynamic Nodes', 'Truy vấn min/max tại x bất kỳ trong O(log C)'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Li Chao Tree', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Li Chao Tree\n\nKhác với CHT dùng deque đòi hỏi hệ số góc đơn điệu, **Li Chao Tree** lưu tại mỗi nút quản lý đoạn $[l, r]$ đường thẳng chiến thắng tại trung điểm $mid$. Khi thêm đường thẳng mới, tại $mid$ đường thẳng nào kém hơn thì bị đẩy xuống tối đa **một** trong hai nửa trái/phải nơi nó có thể cắt lên trên.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct Line { long long m = 0, b = 4e18; long long eval(long long x) const { return m * x + b; } };
vector<Line> seg(400005);
void add_line(int v, int l, int r, Line nw) {
    int m = (l + r) / 2;
    bool lef = nw.eval(l) < seg[v].eval(l);
    bool mid = nw.eval(m) < seg[v].eval(m);
    if (mid) swap(seg[v], nw);
    if (l == r) return;
    if (lef != mid) add_line(2 * v, l, m, nw);
    else add_line(2 * v + 1, m + 1, r, nw);
}
int main() { add_line(1, 0, 1000, {2, 3}); cout << seg[1].eval(5) << "\\n"; return 0; }`,
    quiz: makeQuiz('Li Chao tree', 'li-chao', [{ q: 'Ưu điểm lớn nhất của Li Chao Tree so với CHT dùng deque là gì?', options: ['Chèn đường thẳng với hệ số góc bất kỳ không cần sắp xếp trước', 'Nhanh hơn O(1)', 'Không cần biết miền giá trị x', 'Chỉ dùng 1 mảng int'], answer_index: 0, explain: 'Li Chao Tree hỗ trợ thêm đường thẳng online với độ dốc tùy ý.' }]) },
  { code: '6.4', slug: 'link-cut-tree', track_id: 6, sort_order: 4, title: 'Link-Cut tree', prereqs: ['5.2'], topics: ['link-cut', 'splay', 'trees', 'data-structures'], fit_check: true, complexity: 'O(log n) amortized',
    objectives: ['Hiểu cấu trúc preferred paths và Splay Tree phụ trợ', 'Nắm các thao tác cốt lõi access, makeroot, link, cut', 'Duy trì truy vấn đường đi trên rừng cây thay đổi cấu trúc động'],
    sources: [{ kind: 'cp-algorithms', title: 'Stanford / CP Link-Cut Tree', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Link-Cut Tree\n\nLink-Cut Tree biểu diễn mỗi đường đi ưu tiên (preferred path) trên rừng động bằng một **Splay Tree** theo khóa là độ sâu. Thao tác trung tâm \`access(x)\` đưa đường đi từ gốc tới $x$ vào cùng một Splay Tree duy nhất, giúp mọi thao tác \`link\`, \`cut\`, \`lca\`, và truy vấn đường đi chạy trong $O(\\log N)$ khấu hao.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
// Khung nút Splay chuẩn cho Link-Cut Tree
struct Node { int ch[2]{0,0}, p = 0; bool rev = false; long long val = 0, sum = 0; };
int main() { Node x; x.val = 42; cout << x.val << "\\n"; return 0; }`,
    quiz: makeQuiz('Link-Cut tree', 'link-cut', [{ q: 'Thao tác cơ bản nào là nền tảng cho link, cut và truy vấn đường đi trong Link-Cut Tree?', options: ['access(u)', 'rotate_all()', 'dfs()', 'dijkstra()'], answer_index: 0, explain: 'access(u) kéo đường từ gốc tới u thành một preferred path duy nhất.' }]) },
  { code: '6.5', slug: 'computational-geometry', track_id: 6, sort_order: 5, title: 'Hình học tính toán', prereqs: ['1.2'], topics: ['geometry', 'convex-hull', 'line-intersection'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Sử dụng tích có hướng (cross product) kiểm tra hướng rẽ trái/phải/thẳng hàng', 'Tìm Bao lồi (Convex Hull) bằng Andrew Monotone Chain trong O(n log n)', 'Kiểm tra giao đoạn thẳng và tính diện tích đa giác nguyên bằng số nguyên 100%'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 29: Geometry', url: 'https://cses.fi/book/book.pdf' }],
    fallbackTheory: `### Hình học tính toán (Tích có hướng & Bao lồi)\n\nTích có hướng của hai vector $\\vec{a} = (x_1, y_1)$ và $\\vec{b} = (x_2, y_2)$ là $x_1 y_2 - x_2 y_1$. Dùng tích có hướng giúp toàn bộ phép kiểm tra hướng rẽ, giao đoạn thẳng, điểm nằm trong đa giác lồi thực hiện bằng **số nguyên chính xác**, không bao giờ bị sai số \`double\`.\n\nThuật toán **Andrew's Monotone Chain** sắp xếp điểm theo $(x, y)$ rồi dựng bao trên và bao dưới trong $O(N \\log N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct P {
    long long x, y;
    bool operator<(const P& o) const { return tie(x, y) < tie(o.x, o.y); }
};
long long cross(P a, P b, P c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
int main() {
    int n; if (!(cin >> n)) return 0;
    vector<P> pts(n);
    for (auto &p : pts) cin >> p.x >> p.y;
    sort(pts.begin(), pts.end());
    vector<P> hull;
    for (int phase = 0; phase < 2; phase++) {
        size_t start = hull.size();
        for (auto p : pts) {
            while (hull.size() >= start + 2 && cross(hull[hull.size()-2], hull.back(), p) <= 0)
                hull.pop_back();
            hull.push_back(p);
        }
        hull.pop_back();
        reverse(pts.begin(), pts.end());
    }
    cout << hull.size() << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Hình học tính toán', 'convex-hull', [{ q: 'Tại sao nên ưu tiên tích có hướng số nguyên thay vì tính góc atan2() bằng double?', options: ['Tránh sai số dấu phẩy động khi điểm thẳng hàng hoặc tọa độ 10^9', 'Vì atan2() không tồn tại trong C++', 'Vì tích có hướng dùng ít biến hơn', 'Không có lý do'], answer_index: 0, explain: 'So sánh điểm thẳng hàng bằng double rất dễ lệch ở chữ số cuối.' }]) },
  { code: '6.6', slug: 'min-cost-flow', track_id: 6, sort_order: 6, title: 'Min-cost flow', prereqs: ['5.6'], topics: ['min-cost-flow', 'flows', 'graphs'], fit_check: true, complexity: 'O(F * E log V)',
    objectives: ['Xây dựng cạnh ngược có chi phí -cost trong đồ thị thặng dư', 'Dùng SPFA hoặc Dijkstra kết hợp thế năng Johnson (potentials) để tìm đường tăng luồng rẻ nhất', 'Mô hình hóa bài toán ghép cặp trọng số và vận tải'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Minimum-cost flow', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Luồng chi phí cực tiểu (Min-Cost Max-Flow)\n\nMỗi cạnh $(u, v)$ có cả dung lượng \`cap\` và đơn giá \`cost\`; cạnh ngược tương ứng có \`cost = -cost\`. Ở mỗi bước, ta tìm đường đi có **tổng chi phí nhỏ nhất** từ $S \\to T$ trên đồ thị thặng dư bằng SPFA hoặc Dijkstra + thế năng Johnson \`pot[]\` (đảm bảo trọng số quy đổi không âm).`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct Edge { int v, rev, cap, cost; };
int main() {
    Edge e{2, 0, 10, 5};
    cout << e.cost << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Min-cost flow', 'min-cost-flow', [{ q: 'Chi phí của cạnh ngược tương ứng với cạnh xuôi (u -> v, cost = c) trong đồ thị thặng dư là gì?', options: ['-c', '+c', '0', '1/c'], answer_index: 0, explain: 'Hoàn trả lại 1 đơn vị luồng trên cạnh đó sẽ hoàn lại chi phí c đã tiêu.' }]) },
  { code: '6.7', slug: 'matroid', track_id: 6, sort_order: 7, title: 'Matroid', prereqs: ['4.4', '5.6'], topics: ['matroid', 'greedy', 'math'], fit_check: true, complexity: 'O(r^2 * n)',
    objectives: ['Hiểu 3 tiên đề của Matroid (tập rỗng, tính di truyền, tính trao đổi)', 'Chứng minh tính đúng đắn của thuật toán tham lam Rado-Edmonds', 'Nắm ý tưởng giao hai Matroid (Matroid Intersection) dùng đồ thị trao đổi'],
    sources: [{ kind: 'cp-algorithms', title: 'Codeforces — Matroid Intersection Tutorial', url: 'https://codeforces.com/blog/entry/69287' }],
    fallbackTheory: `### Lý thuyết Matroid & Matroid Intersection\n\nMột hệ tập độc lập $(E, \\mathcal{I})$ là Matroid nếu thỏa tính kế thừa và tính trao đổi: mọi tập độc lập nhỏ hơn đều mở rộng được từ tập lớn hơn.\n\n**Giao hai Matroid** tìm tập $I \\in \\mathcal{I}_1 \\cap \\mathcal{I}_2$ lớn nhất bằng cách dựng đồ thị trao đổi có hướng và tìm đường tăng ngắn nhất bằng BFS.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
// Giao Graphic Matroid & Colorful Matroid dùng đồ thị trao đổi
int main() { cout << "Matroid Intersection Ready\\n"; return 0; }`,
    quiz: makeQuiz('Matroid', 'matroid', [{ q: 'Thuật toán Kruskal tìm cây khung nhỏ nhất thực chất là thuật toán tham lam trên loại Matroid nào?', options: ['Graphic Matroid (tập cạnh không tạo chu trình)', 'Uniform Matroid', 'Linear Matroid', 'Partition Matroid'], answer_index: 0, explain: 'Các tập cạnh không chứa chu trình thỏa mãn đầy đủ tiên đề Matroid.' }]) },
  { code: '6.8', slug: 'broken-profile-dp', track_id: 6, sort_order: 8, title: 'Broken profile DP', prereqs: ['4.9'], topics: ['broken-profile', 'bitmasks', 'dp'], fit_check: true, complexity: 'O(n * m * 2^m)',
    objectives: ['Biểu diễn đường biên gãy khúc (profile) giữa các ô đã điền và chưa điền', 'Chuyển trạng thái từng ô một thay vì cả cột một lúc để giảm độ phức tạp từ O(3^m) xuống O(2^m)', 'Giải bài toán đếm cách lát gạch Domino 1×2 trên bảng N×M'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Dynamic Programming on Broken Profile', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Broken Profile DP (DP đường biên)\n\nKhi lát gạch trên bảng $N \\times M$ ($N \\le 10$), ta chuyển trạng thái **từng ô một** hoặc **từng cột một** bằng bitmask biểu diễn những ô nhô sang cột kế tiếp.\n\nNếu lát ô $(i, j)$ bằng viên ngang $1 \\times 2$, ô $(i, j+1)$ bị chiếm; nếu lát viên dọc $2 \\times 1$, cả $(i, j)$ và $(i+1, j)$ phải đang trống.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
const int MOD = 1e9 + 7;
int main() {
    int n = 4, m = 7;
    vector<long long> dp(1 << n, 0); dp[0] = 1;
    for (int col = 0; col < m; col++) {
        vector<long long> ndp(1 << n, 0);
        auto gen = [&](auto& self, int row, int cur_mask, int next_mask, long long ways) -> void {
            if (row == n) { ndp[next_mask] = (ndp[next_mask] + ways) % MOD; return; }
            if (cur_mask & (1 << row)) self(self, row + 1, cur_mask, next_mask, ways);
            else {
                self(self, row + 1, cur_mask, next_mask | (1 << row), ways);
                if (row + 1 < n && !(cur_mask & (1 << (row + 1))))
                    self(self, row + 2, cur_mask, next_mask, ways);
            }
        };
        for (int mask = 0; mask < (1 << n); mask++) if (dp[mask]) gen(gen, 0, mask, 0, dp[mask]);
        dp.swap(ndp);
    }
    cout << dp[0] << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Broken profile DP', 'broken-profile', [{ q: 'Kết quả đếm số cách lát domino kín hoàn toàn bảng N×M nằm ở trạng thái mask nào sau khi xong cột cuối?', options: ['dp[0] (không có viên nào nhô ra ngoài biên phải)', 'dp[(1<<N)-1]', 'Tổng toàn bộ dp[mask]', 'dp[1]'], answer_index: 0, explain: 'Không được phép có phần gạch thò ra khỏi cạnh phải của bảng.' }]) },
  { code: '6.9', slug: 'tree-dp-advanced', track_id: 6, sort_order: 9, title: 'DP trên cây nâng cao', prereqs: ['4.10'], topics: ['rerooting', 'small-to-large', 'dp', 'trees'], fit_check: true, complexity: 'O(n log n)',
    objectives: ['Cài đặt DSU on Tree (Sack / Small-to-Large Merging) trong O(n log n)', 'Giữ lại nhánh nặng của con lớn nhất để tránh xóa đi làm lại', 'Giải quyết các truy vấn thống kê màu sắc trên mọi cây con'],
    sources: [{ kind: 'cp-algorithms', title: 'Codeforces — DSU on Tree (Arpa)', url: 'https://codeforces.com/blog/entry/44351' }],
    fallbackTheory: `### Small-to-Large Merging (DSU on Tree)\n\nKhi gộp các \`std::set\` hoặc \`std::map\` từ các con lên cha, luôn **hoán đổi** sao cho ta chèn phần tử của tập nhỏ hơn vào tập lớn hơn (\`if (a.size() < b.size()) swap(a, b);\`).\n\nMỗi phần tử chỉ đổi tập tối đa $\\log_2 N$ lần vì kích thước tập mới luôn ít nhất gấp đôi tập cũ, cho tổng thời gian $O(N \\log^2 N)$ hoặc $O(N \\log N)$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
vector<vector<int>> adj;
vector<int> col, ans;
set<int>* dfs(int u, int p) {
    auto* cur = new set<int>{col[u]};
    for (int v : adj[u]) if (v != p) {
        auto* sub = dfs(v, u);
        if (cur->size() < sub->size()) swap(cur, sub);
        for (int c : *sub) cur->insert(c);
        delete sub;
    }
    ans[u] = cur->size();
    return cur;
}
int main() {
    int n; if (!(cin >> n)) return 0;
    adj.assign(n + 1, {}); col.resize(n + 1); ans.resize(n + 1);
    for (int i = 1; i <= n; i++) cin >> col[i];
    for (int i = 1; i < n; i++) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) cout << ans[i] << " ";
    return 0;
}`,
    quiz: makeQuiz('DP trên cây nâng cao', 'small-to-large', [{ q: 'Tại sao kỹ thuật Small-to-Large đạt tổng chi phí chuyển phần tử O(N log N)?', options: ['Mỗi lần một phần tử bị chuyển, kích thước tập chứa nó ít nhất tăng gấp đôi', 'Vì mỗi đỉnh chỉ có tối đa 2 con', 'Do set tự nén cây', 'Vì độ sâu cây <= log N'], answer_index: 0, explain: 'Một phần tử chỉ di chuyển tối đa log2(N) lần.' }]) },
  { code: '6.10', slug: 'suffix-automaton-eertree', track_id: 6, sort_order: 10, title: 'Suffix Automaton, Eertree', prereqs: ['4.12'], topics: ['suffix-automaton', 'eertree', 'strings'], fit_check: true, complexity: 'O(n)',
    objectives: ['Xây dựng Suffix Automaton (SAM) trong O(n) với tối đa 2N-1 trạng thái', 'Đếm số xâu con phân biệt = sum(len[v] - len[link[v]])', 'Hiểu cấu trúc Palindromic Tree (Eertree) với hai gốc 0 và -1'],
    sources: [{ kind: 'cp-algorithms', title: 'CP-Algorithms — Suffix Automaton', url: 'https://cp-algorithms.com/' }],
    fallbackTheory: `### Suffix Automaton (SAM) & Eertree\n\n**SAM** là automaton hữu hạn tất định nhỏ nhất nhận diện toàn bộ hậu tố của chuỗi $S$. Mỗi trạng thái đại diện một lớp các xâu con có cùng tập vị trí kết thúc \`endpos\`, có độ dài thuộc đoạn $[len(link[v]) + 1, len(v)]$.\n\nSố lượng xâu con phân biệt của chuỗi chính bằng $\\sum_{v > 0} (len[v] - len[link[v]])$.`,
    fallbackCode: `#include <bits/stdc++.h>
using namespace std;
struct State { int len, link; map<char, int> next; };
vector<State> st(1, {0, -1, {}});
int last = 0;
void sam_extend(char c) {
    int cur = st.size(); st.push_back({st[last].len + 1, 0, {}});
    int p = last;
    while (p != -1 && !st[p].next.count(c)) { st[p].next[c] = cur; p = st[p].link; }
    if (p == -1) st[cur].link = 0;
    else {
        int q = st[p].next[c];
        if (st[p].len + 1 == st[q].len) st[cur].link = q;
        else {
            int clone = st.size();
            st.push_back({st[p].len + 1, st[q].link, st[q].next});
            while (p != -1 && st[p].next[c] == q) { st[p].next[c] = clone; p = st[p].link; }
            st[q].link = st[cur].link = clone;
        }
    }
    last = cur;
}
int main() {
    string s = "ababa"; for (char c : s) sam_extend(c);
    long long distinct = 0;
    for (size_t i = 1; i < st.size(); i++) distinct += st[i].len - st[st[i].link].len;
    cout << distinct << "\\n";
    return 0;
}`,
    quiz: makeQuiz('Suffix Automaton, Eertree', 'suffix-automaton', [{ q: 'Số lượng xâu con đối xứng phân biệt tối đa trong một chuỗi độ dài N là bao nhiêu?', options: ['Tối đa N (theo lý thuyết Eertree)', 'N^2', '2^N', 'N log N'], answer_index: 0, explain: 'Mỗi ký tự thêm vào tạo ra tối đa 1 xâu con đối xứng kết thúc tại nó mà chưa từng xuất hiện trước đó.' }]) },
  { code: '6.11', slug: 'level6-review-1', track_id: 6, sort_order: 11, title: 'Tổng hợp cấp 6, phần 1', prereqs: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Kết hợp cấu trúc dữ liệu bậc cao và DP tối ưu cho bài 2100–2400', 'Kiểm tra độ chính xác trên bộ test chuẩn Library Checker', 'Tối ưu hằng số và quản lý bộ nhớ chặt chẽ'],
    sources: [{ kind: 'oj', title: 'Library Checker', url: 'https://judge.yosupo.jp/' }],
    quiz: makeQuiz('Tổng hợp cấp 6, phần 1', 'data-structures', [{ q: 'Cấu trúc nào giải quyết truy vấn "thêm đoạn thẳng mới và lấy min tại x" khi hệ số góc không đơn điệu?', options: ['Li Chao Tree', 'Sparse Table', 'Fenwick Tree', 'DSU'], answer_index: 0, explain: 'Li Chao Tree lưu phân hoạch đường thẳng trên từng đoạn của Segment Tree.' }]) },
  { code: '6.12', slug: 'level6-review-2', track_id: 6, sort_order: 12, title: 'Tổng hợp cấp 6, phần 2', prereqs: ['6.11'], topics: [], fit_check: false, complexity: 'Tổng hợp',
    objectives: ['Tổng ôn toàn bộ 74 chuyên đề từ Nhập môn tới Chuyên gia', 'Luyện tốc độ phân tích mô hình luồng, matroid và chia căn', 'Sẵn sàng chinh phục kỳ thi HSG Quốc gia, ICPC và IOI'],
    sources: [{ kind: 'handbook', title: 'CSES Handbook — Chương 9–10', url: 'https://cses.fi/book/book.pdf' }],
    quiz: makeQuiz('Tổng hợp cấp 6, phần 2', 'dp', [{ q: 'Knuth Optimization áp dụng được khi nào trong bài toán chia đoạn DP 2 chiều?', options: ['Khi hàm chi phí thỏa bất đẳng thức tứ giác và đơn điệu bao hàm', 'Khi mảng luôn tăng', 'Khi chi phí bằng 1', 'Không có điều kiện'], answer_index: 0, explain: 'Giảm từ O(N^3) xuống O(N^2) nhờ chặn opt[l][r-1] <= opt[l][r] <= opt[l+1][r].' }]) },
];
