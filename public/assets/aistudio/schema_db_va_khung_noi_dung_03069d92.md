# Schema dữ liệu & Khung nội dung — Web học lập trình thi đấu (CP)

> Tài liệu này mô tả **cấu trúc dữ liệu (schema)** và **khung nội dung** cho dự án web học CP.  
> Phạm vi: chỉ tập trung vào **dữ liệu và nội dung**, không bàn về cách triển khai web (frontend/backend/deploy).

---

## 1. Tổng quan thực thể

Dự án có 7 thực thể chính:

| Thực thể | Vai trò |
|---|---|
| User | Người học |
| Track (Level) | Cấp độ học (0-6) |
| Lesson | Bài học lý thuyết |
| Problem | Bài tập |
| Submission | Lần nộp bài của user |
| Progress | Tiến độ học của user theo bài |
| Contest | Kỳ thi/contest ảo |

### 1.1 Sơ đồ quan hệ (ERD rút gọn)

```text
User 1──N Submission
User 1──N Progress
Track 1──N Lesson
Lesson 1──N Problem
Problem 1──N Submission
Problem 1──N Progress
Contest N──N Problem (qua bảng trung gian ContestProblem)
```

---

## 2. Chi tiết từng thực thể

### 2.1 User

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| email | string | Email đăng nhập (unique) |
| password_hash | string | Mật khẩu đã hash |
| name | string | Tên hiển thị |
| role | enum | student / admin / reviewer |
| created_at | datetime | Thời điểm tạo |
| updated_at | datetime | Thời điểm cập nhật |

### 2.2 Track (Level)

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | int | Khóa chính |
| level | int | Số cấp (0-6) |
| name | string | Tên cấp (Nhập môn, Cơ bản, ...) |
| description | text | Mô tả cấp |
| estimated_duration | string | Thời lượng gợi ý (2-3 tuần, ...) |
| cf_rating_range | string | Mốc rating Codeforces (~800-1000, ...) |
| order | int | Thứ tự hiển thị |

### 2.3 Lesson

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| track_id | FK → Track | Thuộc cấp nào |
| order | int | Thứ tự trong cấp |
| title | string | Tên bài học |
| slug | string | Đường dẫn thân thiện |
| objectives | text | Mục tiêu học |
| prerequisites | JSON / FK | Bài học/chủ đề cần học trước |
| theory | text (Markdown + KaTeX) | Nội dung lý thuyết |
| code_sample | text | Code mẫu C++ |
| complexity | string | Độ phức tạp (O(n log n), ...) |
| common_mistakes | text | Lỗi thường gặp |
| hints | JSON | Gợi ý mở khóa dần (gợi ý 1, 2, ý tưởng, code) |
| quiz | JSON | Bài kiểm tra cuối chủ đề |
| created_at | datetime | Thời điểm tạo |
| updated_at | datetime | Thời điểm cập nhật |

### 2.4 Problem

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| lesson_id | FK → Lesson | Thuộc bài học nào |
| title | string | Tên bài |
| source | enum | CSES / Codeforces / AtCoder / USACO / VNOJ / Kattis / LibraryChecker / Other |
| source_url | string | Link đề gốc |
| source_id | string | Mã bài ở nguồn gốc (ví dụ 4A) |
| year | int | Năm xuất hiện (nếu có) |
| level | int | Cấp 0-6 |
| difficulty | enum | Khởi động / Luyện tập / Thử thách |
| cf_rating | int | Rating Codeforces (nếu có) |
| topics | JSON | Danh sách chủ đề |
| prerequisites | JSON / FK | Bài học/chủ đề cần học trước |
| editorial_url | string | Link lời giải chính thức |
| license_note | text | Ghi chú quyền sử dụng |
| reviewed_by | FK → User | Người duyệt |
| reviewed_at | datetime | Thời điểm duyệt |
| created_at | datetime | Thời điểm tạo |
| updated_at | datetime | Thời điểm cập nhật |

### 2.5 Submission

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| user_id | FK → User | Người nộp |
| problem_id | FK → Problem | Bài nộp |
| code | text | Code nộp |
| language | enum | C++ / Python / Java |
| status | enum | AC / WA / TLE / MLE / RE / CE |
| score | int | Điểm (nếu có) |
| runtime | int | Thời gian chạy (ms) |
| memory | int | Bộ nhớ (KB) |
| submitted_at | datetime | Thời điểm nộp |

### 2.6 Progress

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| user_id | FK → User | Người học |
| problem_id | FK → Problem | Bài tập |
| status | enum | not_started / attempted / solved / mastered |
| attempts | int | Số lần nộp |
| last_attempt_at | datetime | Lần nộp gần nhất |
| notes | text | Ghi chú cá nhân |

### 2.7 Contest

| Trường | Kiểu | Mô tả |
|---|---|---|
| id | UUID / int | Khóa chính |
| title | string | Tên contest |
| description | text | Mô tả |
| start_at | datetime | Thời gian bắt đầu |
| end_at | datetime | Thời gian kết thúc |
| created_by | FK → User | Người tạo |
| created_at | datetime | Thời điểm tạo |

### 2.8 ContestProblem (bảng trung gian)

| Trường | Kiểu | Mô tả |
|---|---|---|
| contest_id | FK → Contest | Contest nào |
| problem_id | FK → Problem | Bài nào |
| order | int | Thứ tự trong contest |
| points | int | Điểm |

---

## 3. Enum (giá trị cố định)

### 3.1 UserRole
- `student`
- `admin`
- `reviewer`

### 3.2 ProblemSource
- `CSES`
- `Codeforces`
- `AtCoder`
- `USACO`
- `VNOJ`
- `Kattis`
- `LibraryChecker`
- `Other`

### 3.3 Difficulty
- `Khởi động`
- `Luyện tập`
- `Thử thách`

### 3.4 SubmissionStatus
- `AC` (Accepted)
- `WA` (Wrong Answer)
- `TLE` (Time Limit Exceeded)
- `MLE` (Memory Limit Exceeded)
- `RE` (Runtime Error)
- `CE` (Compilation Error)

### 3.5 ProgressStatus
- `not_started`
- `attempted`
- `solved`
- `mastered`

### 3.6 Language
- `C++`
- `Python`
- `Java`

---

## 4. Khung nội dung (Content Framework)

### 4.1 Cấu trúc một bài học (Lesson) — 7 mục bắt buộc

1. **Mục tiêu học** — người học sẽ làm được gì sau bài này.
2. **Điều kiện tiên quyết** — liên kết đến bài trước.
3. **Lý thuyết** — kèm nguồn tham khảo.
4. **Code mẫu C++** — kèm độ phức tạp.
5. **Lỗi thường gặp** — tổng hợp từ kinh nghiệm + editorial + comment.
6. **Bài tập theo bậc** — Khởi động → Luyện tập → Thử thách.
7. **Gợi ý mở khóa dần** — gợi ý 1 → gợi ý 2 → ý tưởng → code.
8. **Bài kiểm tra cuối chủ đề** — 3-5 bài tổng hợp.

### 4.2 Cấu trúc một bài tập (Problem) — 13 trường bắt buộc

| Trường | Ý nghĩa |
|---|---|
| id | Mã nội bộ |
| title | Tên bài |
| source | Tên nguồn |
| source_url | Link đề gốc |
| source_id | Mã bài ở nguồn gốc |
| year | Năm xuất hiện |
| level | Cấp 0-6 |
| difficulty | Rating gốc hoặc nhãn |
| topics | Danh sách chủ đề |
| prerequisites | Bài học/chủ đề cần học trước |
| editorial_url | Link lời giải chính thức |
| license_note | Ghi chú quyền sử dụng |
| reviewed_by, reviewed_at | Người và thời điểm duyệt |

### 4.3 Bộ tag chủ đề (topics) thống nhất

Để lọc/tìm kiếm thống nhất, dùng bộ tag sau:

- `implementation`
- `math`
- `greedy`
- `dp`
- `graphs`
- `binary search`
- `two pointers`
- `data structures`
- `strings`
- `number theory`
- `combinatorics`
- `sorting`
- `brute force`
- `hashing`
- `trees`
- `geometry`
- `game theory`
- `constructive`
- `interactive`
- `bitmasks`

### 4.4 Cách gán độ khó

- Bài Codeforces: dùng `cf_rating` công khai.
- Bài CSES/AtCoder/USACO/VNOJ: gán `difficulty` theo 3 nhãn (Khởi động / Luyện tập / Thử thách) dựa trên chủ đề + đối chiếu bài tương đương có rating.
- Mỗi bài có 1 `level` (0-6) và 1 `difficulty` (3 nhãn).

---

## 5. Khung nội dung lý thuyết (Content Framework cho Lesson)

### 5.1 Mẫu bài học hoàn chỉnh (template)

```markdown
# [Tên bài học]

## Mục tiêu học
- Sau bài này, người học có thể: [mục tiêu 1], [mục tiêu 2], [mục tiêu 3].

## Điều kiện tiên quyết
- [Bài học/chủ đề 1]
- [Bài học/chủ đề 2]

## Lý thuyết
### [Khái niệm 1]
[Giải thích + công thức + ví dụ]

### [Khái niệm 2]
[Giải thích + công thức + ví dụ]

## Code mẫu C++
```cpp
[Code mẫu]
```
Độ phức tạp: [O(...)]

## Lỗi thường gặp
- [Lỗi 1]
- [Lỗi 2]
- [Lỗi 3]

## Bài tập theo bậc
- Khởi động: [Bài 1], [Bài 2]
- Luyện tập: [Bài 3], [Bài 4]
- Thử thách: [Bài 5]

## Gợi ý mở khóa dần
- Gợi ý 1: [Gợi ý nhẹ]
- Gợi ý 2: [Gợi ý rõ hơn]
- Ý tưởng: [Ý tưởng chính]
- Code: [Link code mẫu]

## Bài kiểm tra cuối chủ đề
- [Bài 1], [Bài 2], [Bài 3]
```

### 5.2 Ví dụ bài học hoàn chỉnh: "Hai con trỏ (Two Pointers)"

**Mục tiêu học**: Sau bài này, người học có thể:
- Nhận diện bài toán có thể giải bằng two pointers.
- Viết code two pointers đúng (trên mảng đã sắp xếp hoặc sliding window).
- Phân tích độ phức tạp O(n) thay vì O(n^2).

**Điều kiện tiên quyết**: Sắp xếp, mảng, vòng lặp.

**Lý thuyết**:
- Two pointers là kỹ thuật dùng 2 con trỏ (i, j) di chuyển trên mảng để tìm cặp/đoạn thỏa điều kiện.
- Hai biến thể: (1) two pointers trên mảng đã sắp xếp (tìm cặp có tổng S), (2) sliding window (tìm đoạn con dài nhất/ngắn nhất thỏa điều kiện).
- Điều kiện để áp dụng: mảng đã sắp xếp (cho biến thể 1) hoặc hàm "điều kiện" có tính đơn điệu (cho biến thể 2).
- Độ phức tạp: O(n) thay vì O(n^2).

**Code mẫu C++** (two pointers tìm cặp có tổng S):
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; long long S;
    cin >> n >> S;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    int i = 0, j = n - 1;
    while (i < j) {
        long long sum = a[i] + a[j];
        if (sum == S) { cout << "YES\n"; return 0; }
        else if (sum < S) i++;
        else j--;
    }
    cout << "NO\n";
    return 0;
}
```
Độ phức tạp: O(n log n) (do sort) + O(n) (two pointers) = O(n log n).

**Lỗi thường gặp**:
- Dùng two pointers trên mảng chưa sắp xếp.
- Sai cận `i < j` (phải là `i < j`, không phải `i <= j`).
- Quên xử lý trường hợp không tìm thấy.

**Bài tập theo bậc**:
- Khởi động: CSES Sum of Two Values.
- Luyện tập: CSES Distinct Values Subarrays, CF 977B.
- Thử thách: CSES Sum of Four Values.

**Gợi ý mở khóa dần**:
- Gợi ý 1: "Thử sắp xếp mảng trước."
- Gợi ý 2: "Dùng 2 con trỏ, một ở đầu, một ở cuối."
- Ý tưởng: "Nếu tổng < S, tăng i; nếu tổng > S, giảm j."
- Code: xem code mẫu ở trên.

**Bài kiểm tra cuối chủ đề**: 3 bài (1 dễ, 1 trung, 1 khó) gắn tag `two pointers`.

---

## 6. Danh sách bài học theo cấp (0-6) — 72 bài học

> Đây là "xương sống" nội dung: mỗi dòng là 1 bài học (lesson) cần viết.

### Cấp 0 — Nhập môn (8 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 0.1 | Cú pháp C++ và I/O | Viết chương trình C++ đầu tiên, đọc/ghi dữ liệu | - |
| 0.2 | Kiểu dữ liệu và tràn số | Chọn đúng kiểu, tránh overflow | 0.1 |
| 0.3 | Vòng lặp, mảng, hàm | Thành thạo for/while, mảng, hàm | 0.1-0.2 |
| 0.4 | Đọc đề và độ phức tạp | Hiểu ràng buộc, ước lượng thời gian | 0.3 |
| 0.5 | Mô phỏng đơn giản | Mô phỏng quá trình theo đề | 0.3 |
| 0.6 | Chuỗi cơ bản | Xử lý string, đếm ký tự | 0.3 |
| 0.7 | Toán cơ bản | ƯCLN, BCNN, modulo | 0.2 |
| 0.8 | Tổng hợp cấp 0 | Làm bài tổng hợp | 0.1-0.7 |

### Cấp 1 — Cơ bản (10 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 1.1 | Brute force | Duyệt toàn bộ không gian nhỏ | 0.3 |
| 1.2 | Sắp xếp | Dùng sort, comparator | 0.3 |
| 1.3 | Xử lý chuỗi nâng cao | string, getline, đếm | 0.6 |
| 1.4 | Toán cơ bản nâng cao | Số nguyên tố, ước số | 0.7 |
| 1.5 | Mô phỏng nâng cao | Mô phỏng phức tạp hơn | 0.5 |
| 1.6 | Ad hoc | Nhận diện bài "không có công thức" | 1.1 |
| 1.7 | Tham lam cơ bản | Sắp xếp rồi chọn | 1.2 |
| 1.8 | Hai con trỏ (intro) | Two pointers cơ bản | 1.2 |
| 1.9 | Prefix sum (intro) | Tổng đoạn O(1) | 0.3 |
| 1.10 | Tổng hợp cấp 1 | Làm bài tổng hợp | 1.1-1.9 |

### Cấp 2 — Cơ bản+ (10 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 2.1 | STL | vector, set, map, multiset, priority_queue | 0.3 |
| 2.2 | Prefix sum nâng cao | Sliding window, 2D prefix | 1.9 |
| 2.3 | Hai con trỏ nâng cao | Sliding window, two pointers trên mảng sắp xếp | 1.8 |
| 2.4 | Tìm kiếm nhị phân | Binary search trên mảng, trên đáp án | 1.2 |
| 2.5 | Tham lam nâng cao | Interval, scheduling | 1.7 |
| 2.6 | Đếm, hash cơ bản | Đếm tần số, hash map | 2.1 |
| 2.7 | Sàng nguyên tố | Eratosthenes | 1.4 |
| 2.8 | Lũy thừa nhanh | Fast power O(log n) | 1.4 |
| 2.9 | Tổ hợp mod p | C(n,k) mod p, nghịch đảo modulo | 2.8 |
| 2.10 | Tổng hợp cấp 2 | Làm bài tổng hợp | 2.1-2.9 |

### Cấp 3 — Trung cấp 1 (10 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 3.1 | DP cơ bản | Trạng thái, chuyển, cơ sở; knapsack, LIS, LCS | 2.4 |
| 3.2 | DP trên grid | Grid Paths, Array Description | 3.1 |
| 3.3 | DFS/BFS | Duyệt đồ thị, thành phần liên thông | 2.1 |
| 3.4 | DSU | Disjoint Set Union, path compression | 3.3 |
| 3.5 | Sàng nguyên tố nâng cao | Linear sieve, smallest prime factor | 2.7 |
| 3.6 | Lũy thừa nhanh nâng cao | Matrix exponentiation | 2.8 |
| 3.7 | Tổ hợp mod p nâng cao | Lucas, Catalan | 2.9 |
| 3.8 | DP kết hợp sàng ước | DP trên ước số | 3.1, 3.5 |
| 3.9 | DP trên DAG | Longest path, topological order | 3.1, 3.3 |
| 3.10 | Tổng hợp cấp 3 | Làm bài tổng hợp | 3.1-3.9 |

### Cấp 4 — Trung cấp 2 (12 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 4.1 | Dijkstra | Đường đi ngắn nhất có trọng số dương | 3.3 |
| 4.2 | Bellman-Ford | Đường đi ngắn nhất, xử lý trọng số âm | 4.1 |
| 4.3 | Floyd-Warshall | All-pairs shortest path | 4.1 |
| 4.4 | MST | Kruskal, Prim | 3.4 |
| 4.5 | Sắp xếp topo | Topological sort | 3.3 |
| 4.6 | Fenwick (BIT) | Cập nhật + truy vấn tổng đoạn | 2.2 |
| 4.7 | Segment tree | Cập nhật + truy vấn đoạn (min/max/sum) | 4.6 |
| 4.8 | Sparse table | RMQ tĩnh | 4.7 |
| 4.9 | Bitmask DP | DP trên tập con | 3.1 |
| 4.10 | DP trên cây | DP trên tree (rerooting) | 3.3, 3.1 |
| 4.11 | Hashing | String hash, double hash | 2.6 |
| 4.12 | KMP, Z-function | Pattern matching | 4.11 |

### Cấp 5 — Nâng cao (12 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 5.1 | LCA | Binary lifting | 4.10 |
| 5.2 | HLD | Heavy-Light Decomposition | 5.1, 4.7 |
| 5.3 | Centroid decomposition | Chia để trị trên cây | 5.1 |
| 5.4 | SCC | Tarjan, Kosaraju | 3.3 |
| 5.5 | Cầu/khớp | Bridge, articulation point | 5.4 |
| 5.6 | Max flow | Ford-Fulkerson, Dinic | 3.3 |
| 5.7 | Ghép cặp | Hungarian, Hopcroft-Karp | 5.6 |
| 5.8 | CHT | Convex Hull Trick | 3.1 |
| 5.9 | D&C optimization | Divide and Conquer optimization | 3.1 |
| 5.10 | Mo's algorithm | Truy vấn offline | 4.7 |
| 5.11 | Sqrt decomposition | Chia khối | 4.7 |
| 5.12 | Sprague-Grundy | Game theory | 3.1 |

### Cấp 6 — Chuyên gia (10 bài học)
| # | Tên bài học | Mục tiêu | Prerequisites |
|---|---|---|---|
| 6.1 | FFT/NTT | Nhân đa thức nhanh | 5.8 |
| 6.2 | Persistent segment tree | Segment tree phiên bản | 4.7 |
| 6.3 | Li Chao tree | CHT trên segment tree | 5.8 |
| 6.4 | Link-Cut tree | Cây động | 5.2 |
| 6.5 | Hình học tính toán | Convex hull, line intersection | 6.1 |
| 6.6 | Min-cost flow | Min-cost max-flow | 5.6 |
| 6.7 | Matroid | Lý thuyết matroid | 5.6 |
| 6.8 | Broken profile DP | DP trên profile | 4.9 |
| 6.9 | DP trên cây nâng cao | Rerooting, small-to-large | 4.10 |
| 6.10 | Suffix Automaton, Eertree | Cấu trúc chuỗi nâng cao | 4.12 |

**Tổng: 8 + 10 + 10 + 10 + 12 + 12 + 10 = 72 bài học** cho 7 cấp.

---

## 7. Quy tắc nội dung (Content Guidelines)

- Mọi bài học phải có: mục tiêu, prerequisites, lý thuyết, code mẫu, lỗi thường gặp, bài tập theo bậc, gợi ý mở khóa, bài kiểm tra.
- Mọi bài tập phải có: nguồn gốc, link đề gốc, editorial, level, difficulty, topics, prerequisites.
- Lý thuyết phải đối chiếu được với tài liệu uy tín (CSES Handbook, CP-Algorithms, USACO Guide, VNOI Wiki).
- Code mẫu phải đúng chuẩn thi đấu, có độ phức tạp.
- Lỗi thường gặp tổng hợp từ kinh nghiệm + editorial + comment.
- Bài kiểm tra cuối chủ đề: 3-5 bài tổng hợp (1 dễ, 1 trung, 1 khó).

---

## 8. Ghi chú triển khai nội dung

- Mỗi bài học cần bổ sung `editorial_url` (CSES có lời giải trong sách/mạng, Codeforces có editorial, AtCoder có editorial chính thức).
- Với CSES, link trực tiếp theo mẫu `cses.fi/problemset/task/<ID>/`.
- Với Codeforces, link trực tiếp theo mẫu `codeforces.com/problemset/problem/<contest>/<letter>/`.
- Với AtCoder DP, link trực tiếp theo mẫu `atcoder.jp/contests/dp/tasks/dp_<letter>`.
- Nội dung lý thuyết nên viết theo cấu trúc 7 mục (mục tiêu, prerequisites, lý thuyết, code mẫu, lỗi thường gặp, bài tập theo bậc, bài kiểm tra).
- Nội dung nên viết bằng Markdown + KaTeX (công thức) để dễ render sau này.

---

## 9. Nguồn tham khảo

- CSES Problem Set: https://cses.fi/problemset/
- Codeforces Problemset: https://codeforces.com/problemset
- Codeforces API: https://codeforces.com/apiHelp/methods
- AtCoder Educational DP Contest: https://atcoder.jp/contests/dp/tasks
- Competitive Programmer's Handbook: https://cses.fi/book/
- CP-Algorithms: https://cp-algorithms.com/
- USACO Guide: https://usaco.guide/
- VNOI Wiki: https://wiki.vnoi.info/
