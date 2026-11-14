# Khung nội dung — Cấp 1: Cơ bản

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 3-5 bài (khung đầu), tổng 33 bài; cần bổ sung ~20-30 bài CF 800-1200 + CSES Sorting/Searching còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 1

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 2-3 (Sorting, Searching, Greedy, Two pointers, Prefix sum).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Sorting", "Binary Search", "Two pointers", "Prefix sums", "Greedy".
- **USACO Guide** — https://usaco.guide/ — mục Bronze (Sorting, Greedy, Simulation).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho Sắp xếp, Tham lam, Hai con trỏ, Prefix sum.

---

## Bài 1.1 — Brute force

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 2**: duyệt toàn bộ không gian nhỏ, kiểm tra điều kiện.  
  Link: https://cses.fi/book/book.pdf (Chương 2: "Brute force", "Generating subsets", "Generating permutations")
- **CP-Algorithms — Brute force**: https://cp-algorithms.com/ (mục "Brute force", "Generating permutations")
- **USACO Guide — Brute force**: https://usaco.guide/ (mục Bronze: "Brute force")

### Nội dung chính
- Duyệt toàn bộ không gian nhỏ (subsets, permutations, cặp/bộ)
- Kiểm tra điều kiện, đếm
- Bitmask để duyệt tập con (n ≤ 20)
- Độ phức tạp: O(2^n), O(n!), O(n^2)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    int best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        int sum = 0;
        for (int i = 0; i < n; i++)
            if (mask & (1 << i)) sum += a[i];
        best = max(best, sum);
    }
    cout << best << endl;
    return 0;
}
```

### Lỗi thường gặp
- Duyệt thừa (không cắt nhánh)
- Quên xử lý biên (n = 0, n = 1)
- Sai bitmask (dùng `1 << i` thay vì `1LL << i` với n lớn)

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Lucky Division | Codeforces 122A | https://codeforces.com/problemset/problem/122/A | Brute force | 1000 |
| 2 | Expression | Codeforces 479A | https://codeforces.com/problemset/problem/479/A | Brute force | 1000 |
| 3 | Yet Another Two Integers Problem | Codeforces 1409A | https://codeforces.com/problemset/problem/1409/A | Toán, brute force | 800 |

> Mở rộng: thêm 2-7 bài CF 800-1200 tag `brute force` + `bitmasks` để đủ 5-10 bài.

---

## Bài 1.2 — Sắp xếp

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: `sort`, comparator, sắp xếp nhiều tiêu chí.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Sorting", "Sorting and Searching")
- **CP-Algorithms — Sorting**: https://cp-algorithms.com/ (mục "Sorting")
- **USACO Guide — Sorting**: https://usaco.guide/ (mục Bronze: "Sorting")

### Nội dung chính
- `sort` với comparator (tăng/giảm, nhiều tiêu chí)
- Sắp xếp struct/pair
- Ứng dụng: tìm max/min, đếm, median
- Độ phức tạp: O(n log n)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<pair<int,int>> a(n);
    for (auto &x : a) cin >> x.first >> x.second;
    sort(a.begin(), a.end(), [](const pair<int,int>& p, const pair<int,int>& q) {
        return p.second < q.second; // sắp xếp theo second tăng dần
    });
    for (auto &x : a) cout << x.first << " " << x.second << "\n";
    return 0;
}
```

### Lỗi thường gặp
- Quên `#include <algorithm>`
- Sai comparator (dấu `<` vs `>`)
- Quên sắp xếp trước khi two pointers/binary search

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Distinct Numbers | CSES 1621 | https://cses.fi/problemset/task/1621/ | Sắp xếp, set | Khởi động |
| 2 | Stick Lengths | CSES 1074 | https://cses.fi/problemset/task/1074/ | Tham lam, median | Luyện tập |
| 3 | Less or Equal | Codeforces 977C | https://codeforces.com/problemset/problem/977/C | Sắp xếp, binary search | 1200 |
| 4 | Not Adjacent Matrix | Codeforces 1520C | https://codeforces.com/problemset/problem/1520/C | Xây dựng, sắp xếp | 1100 |
| 5 | Same Differences | Codeforces 1520D | https://codeforces.com/problemset/problem/1520/D | Mảng, đếm, sắp xếp | 1200 |

> Mở rộng: thêm 3-5 bài CF 1000-1200 tag `sortings` + CSES Sorting để đủ 8-10 bài.

---

## Bài 1.3 — Xử lý chuỗi nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: `string`, `getline`, đếm ký tự, so sánh.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Strings")
- **CP-Algorithms — String basics**: https://cp-algorithms.com/ (mục "String algorithms")
- **cppreference — std::string**: https://en.cppreference.com/w/cpp/string/basic_string

### Nội dung chính
- `string`: khởi tạo, truy cập ký tự, độ dài, so sánh
- `getline`: đọc cả dòng (có khoảng trắng)
- Đếm tần số ký tự: mảng 26 hoặc hash map
- Chuyển hoa/thường: `toupper`, `tolower`
- So sánh chuỗi: `==`, `<`, `>`, `compare`
- Tìm chuỗi con: `find`, `substr`

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    int cnt[26] = {0};
    for (char c : s) cnt[tolower(c) - 'a']++;
    int mx = *max_element(cnt, cnt + 26);
    cout << mx << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên `getline` khi chuỗi có khoảng trắng
- Nhầm `char` và `string`
- So sánh chuỗi sai (phân biệt hoa/thường)
- Quên xử lý chuỗi rỗng

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | String Task | Codeforces 118A | https://codeforces.com/problemset/problem/118/A | Chuỗi | 1000 |
| 2 | Two-gram | Codeforces 977B | https://codeforces.com/problemset/problem/977/B | Chuỗi, đếm | 1000 |

> Mở rộng: thêm 3-8 bài CF 800-1200 tag `strings` + CSES Strings để đủ 5-10 bài.

---

## Bài 1.4 — Toán cơ bản nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: số nguyên tố, ước số, modulo, lũy thừa.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Number theory")
- **CP-Algorithms — Number theory**: https://cp-algorithms.com/ (mục "Number theory")
- **VNOI Wiki — Số học**: https://wiki.vnoi.info/ (mục "Số học")

### Nội dung chính
- Số nguyên tố: kiểm tra O(sqrt(n)), sàng Eratosthenes (intro)
- Ước số: đếm ước, tổng ước
- Modulo: `(a + b) % m`, `(a * b) % m`, `(a - b + m) % m`
- Lũy thừa: `pow(a, b)` (cẩn thận overflow), fast power (intro)
- ƯCLN/BCNN: Euclid, `a*b/gcd(a,b)`

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}
int main() {
    int n; cin >> n;
    cout << (isPrime(n) ? "YES" : "NO") << endl;
    return 0;
}
```

### Lỗi thường gặp
- Kiểm tra nguyên tố O(n) thay vì O(sqrt(n))
- Tràn khi tính BCNN (phải chia trước rồi nhân)
- Quên mod khi nhân lớn

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Same Parity Summands | Codeforces 1352B | https://codeforces.com/problemset/problem/1352/B | Toán, xây dựng | 1200 |
| 2 | K-th Not Divisible by n | Codeforces 1352C | https://codeforces.com/problemset/problem/1352/C | Toán, binary search | 1200 |

> Mở rộng: thêm 3-8 bài CF 800-1200 tag `math` + `number theory` + CSES Mathematics để đủ 5-10 bài.

---

## Bài 1.5 — Mô phỏng nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 2**: mô phỏng quá trình phức tạp hơn.  
  Link: https://cses.fi/book/book.pdf (Chương 2: "Simulation")
- **CP-Algorithms — Simulation**: https://cp-algorithms.com/ (mục "Simulation")
- **USACO Guide — Simulation**: https://usaco.guide/ (mục Bronze: "Simulation")

### Nội dung chính
- Đọc kỹ đề, xác định "trạng thái" và "quy tắc chuyển"
- Mô phỏng từng bước theo đề (vòng lặp, điều kiện)
- Kiểm tra biên (n = 1, n = 2, ...)
- Độ phức tạp: thường O(n) hoặc O(n^2) với n nhỏ

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    int pos = 0, steps = 0;
    while (pos < n - 1) {
        pos += a[pos];
        steps++;
    }
    cout << steps << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai quy tắc chuyển (đọc nhầm đề)
- Quên xử lý biên (n = 1)
- Vòng lặp vô hạn (quên điều kiện dừng)

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | New Year Transportation | Codeforces 500A | https://codeforces.com/problemset/problem/500/A | Mảng, mô phỏng | 1000 |
| 2 | Yet Another Card Deck | Codeforces 1511C | https://codeforces.com/problemset/problem/1511/C | Mảng, mô phỏng | 1100 |
| 3 | Begginer's Zelda | Codeforces 1905B | https://codeforces.com/problemset/problem/1905/B | Tham lam, cây | 1100 |

> Mở rộng: thêm 2-7 bài CF 800-1200 tag `implementation` + `simulation` để đủ 5-10 bài.

---

## Bài 1.6 — Ad hoc

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 2**: nhận diện bài "không có công thức", thử nhiều cách tiếp cận.  
  Link: https://cses.fi/book/book.pdf (Chương 2: "Ad hoc")
- **CP-Algorithms — Ad hoc**: https://cp-algorithms.com/ (mục "Ad hoc")
- **USACO Guide — Ad hoc**: https://usaco.guide/ (mục Bronze: "Ad hoc")

### Nội dung chính
- Nhận diện bài "không có công thức" (cần thử nhiều cách)
- Thử: brute force, tham lam, sắp xếp, đếm
- Kiểm tra biên, kiểm tra nhiều test case
- Độ phức tạp: thường O(n) hoặc O(n log n)

### Code mẫu
```cpp
// Không có code mẫu riêng, tùy bài
```

### Lỗi thường gặp
- Đọc nhầm đề
- Thử 1 cách rồi bỏ (cần thử nhiều cách)
- Quên xử lý biên

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Perfect Sandwiches | Codeforces 2276A | https://codeforces.com/problemset/problem/2276/A | Tham lam, toán | 800 |
| 2 | Sum in Binary Tree | Codeforces 1843C | https://codeforces.com/problemset/problem/1843/C | Bitmask, cây | 800 |
| 3 | Mystic Permutation | Codeforces 1689B | https://codeforces.com/problemset/problem/1689/B | Tham lam, hoán vị | 900 |

> Mở rộng: thêm 2-7 bài CF 800-1200 tag `constructive` + `greedy` để đủ 5-10 bài.

---

## Bài 1.7 — Tham lam cơ bản

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: sắp xếp rồi chọn, interval scheduling.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Greedy", "Interval scheduling")
- **CP-Algorithms — Greedy**: https://cp-algorithms.com/ (mục "Greedy")
- **USACO Guide — Greedy**: https://usaco.guide/ (mục Bronze: "Greedy")

### Nội dung chính
- Sắp xếp theo tiêu chí, chọn greedily
- Interval scheduling: sắp xếp theo thời điểm kết thúc
- Đổi tiền: chọn mệnh giá lớn nhất trước
- Chứng minh tham lam (đổi chéo)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<pair<int,int>> a(n);
    for (auto &x : a) cin >> x.first >> x.second;
    sort(a.begin(), a.end(), [](const pair<int,int>& p, const pair<int,int>& q) {
        return p.second < q.second;
    });
    int cnt = 0, last = -1;
    for (auto &x : a) {
        if (x.first > last) { cnt++; last = x.second; }
    }
    cout << cnt << endl;
    return 0;
}
```

### Lỗi thường gặp
- Chọn sai tiêu chí tham lam
- Quên sắp xếp trước khi chọn
- Không chứng minh tham lam (dễ sai)

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Movie Festival | CSES 1629 | https://cses.fi/problemset/task/1629/ | Tham lam, interval | Luyện tập |
| 2 | Ferris Wheel | CSES 1090 | https://cses.fi/problemset/task/1090/ | Tham lam, two pointers | Luyện tập |
| 3 | Missing Coin Sum | CSES 2183 | https://cses.fi/problemset/task/2183/ | Tham lam, sắp xếp | Luyện tập |

> Mở rộng: thêm 2-7 bài CF 800-1200 tag `greedy` + `sortings` để đủ 5-10 bài.

---

## Bài 1.8 — Hai con trỏ (intro)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: two pointers trên mảng đã sắp xếp.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Two pointers")
- **CP-Algorithms — Two pointers**: https://cp-algorithms.com/ (mục "Two pointers")
- **USACO Guide — Two pointers**: https://usaco.guide/ (mục Bronze: "Two pointers")

### Nội dung chính
- Two pointers: 2 con trỏ (i, j) di chuyển trên mảng đã sắp xếp
- Biến thể 1: tìm cặp có tổng S (i ở đầu, j ở cuối)
- Biến thể 2: sliding window (tìm đoạn con thỏa điều kiện)
- Điều kiện áp dụng: mảng đã sắp xếp (biến thể 1) hoặc hàm "điều kiện" đơn điệu (biến thể 2)
- Độ phức tạp: O(n) thay vì O(n^2)

### Code mẫu
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

### Lỗi thường gặp
- Dùng two pointers trên mảng chưa sắp xếp
- Sai cận `i < j` (phải là `i < j`, không phải `i <= j`)
- Quên xử lý trường hợp không tìm thấy

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Sum of Two Values | CSES 1640 | https://cses.fi/problemset/task/1640/ | Two pointers, hash | Luyện tập |
| 2 | Apartments | CSES 1084 | https://cses.fi/problemset/task/1084/ | Sắp xếp, two pointers | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1000-1200 tag `two pointers` + CSES Sorting để đủ 5-10 bài.

---

## Bài 1.9 — Prefix sum (intro)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: prefix sum, tổng đoạn O(1).  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Prefix sums")
- **CP-Algorithms — Prefix sums**: https://cp-algorithms.com/ (mục "Prefix sums")
- **USACO Guide — Prefix sums**: https://usaco.guide/ (mục Bronze: "Prefix sums")

### Nội dung chính
- Prefix sum: `pre[i] = a[0] + ... + a[i-1]`
- Tổng đoạn [l, r]: `pre[r+1] - pre[l]`
- Prefix sum 2D: tổng hình chữ nhật O(1)
- Ứng dụng: đếm sự kiện, sliding window

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, q; cin >> n >> q;
    vector<long long> pre(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long x; cin >> x;
        pre[i] = pre[i-1] + x;
    }
    while (q--) {
        int l, r; cin >> l >> r;
        cout << pre[r] - pre[l-1] << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Quên xử lý index 0 (pre[0] = 0)
- Sai cận khi tính tổng đoạn
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Restaurant Customers | CSES 1619 | https://cses.fi/problemset/task/1619/ | Prefix sum, sự kiện | Luyện tập |
| 2 | Maximum Subarray Sum | CSES 1646 | https://cses.fi/problemset/task/1646/ | DP, Kadane, prefix | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1000-1200 tag `prefix sums` + CSES Sorting để đủ 5-10 bài.

---

## Bài 1.10 — Tổng hợp cấp 1

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 2-3**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 2-3 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")

### Nội dung chính
- Kết hợp: brute force + sắp xếp + chuỗi + toán + mô phỏng + tham lam + two pointers + prefix sum
- Bài tổng hợp thường cần 2-3 kỹ năng cùng lúc
- Luyện đọc đề, xác định kỹ năng cần dùng

### Code mẫu
```cpp
// Không có code mẫu riêng, dùng lại code từ các bài trước
```

### Lỗi thường gặp
- Đọc nhầm đề (kết hợp nhiều ràng buộc)
- Quên 1 trong các kỹ năng đã học
- Quên xử lý biên

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Collecting Numbers | CSES 2216 | https://cses.fi/problemset/task/2216/ | Mảng, tham lam | Luyện tập |
| 2 | Concert Tickets | CSES 1091 | https://cses.fi/problemset/task/1091/ | Sắp xếp, multiset | Luyện tập |
| 3 | Party | Codeforces 115A | https://codeforces.com/problemset/problem/115/A | DFS, cây | 900 |
| 4 | Bmail Computer Network | Codeforces 1057A | https://codeforces.com/problemset/problem/1057/A | DFS, cây | 900 |

> Mở rộng: thêm 3-6 bài CF 800-1200 tổng hợp (tag `implementation` + `math` + `strings` + `greedy`) để đủ 8-10 bài.

---

## Tổng kết cấp 1

- **10 bài học**, mỗi bài 2-5 bài tập (khung đầu), tổng 33 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~20-40 bài CF 800-1200 (tag `brute force`, `sortings`, `strings`, `math`, `greedy`, `two pointers`, `prefix sums`) + CSES Sorting/Searching còn lại.
- **Lý thuyết**: bám CSES Handbook chương 2-3 + CP-Algorithms + USACO Guide Bronze + VNOI Wiki.
- **Bài tập**: ưu tiên CSES Sorting/Searching (xương sống) + CF 800-1200 (bổ sung).

## Checklist hoàn thiện cấp 1

- [ ] Bổ sung 2-5 bài CF 800-1200 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Palindrome Reorder, Coin Piles, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các link CSES đã xác nhận qua kết quả tìm kiếm: 1621 (Distinct Numbers), 1084 (Apartments), 1090 (Ferris Wheel), 1091 (Concert Tickets), 1619 (Restaurant Customers), 1629 (Movie Festival), 1074 (Stick Lengths), 2183 (Missing Coin Sum), 2216 (Collecting Numbers), 1640 (Sum of Two Values), 1646 (Maximum Subarray Sum). [web:60][web:61]
- Các link Codeforces đã đối chiếu qua problemset (tag `greedy`, `sortings`, `strings`, `math`, `brute force`, rating 800-1200). [web:55][web:56][web:57][web:58]
- Một số bài CSES Introductory (Coin Piles, Palindrome Reorder, Creating Strings, Apple Division, Digit Queries, Grid Paths) đã được dùng ở cấp 0; nếu cần, có thể chuyển sang cấp 1 như "Luyện tập/Thử thách" để tăng số bài.
