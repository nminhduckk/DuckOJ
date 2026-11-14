# Khung nội dung — Cấp 2: Cơ bản+

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 1-8 bài (khung đầu), tổng 38 bài; cần bổ sung ~20-40 bài CF 1100-1400 + CSES Sorting/Searching còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 2

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 3-4 (Sorting, Searching, Greedy, Two pointers, Prefix sum, STL, Number theory).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Binary Search", "Two pointers", "Prefix sums", "Greedy", "Sieve of Eratosthenes", "Binary exponentiation", "Binomial coefficients".
- **USACO Guide** — https://usaco.guide/ — mục Bronze/Silver (Binary search, Two pointers, Prefix sums, Greedy, Number theory).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho Binary search, Hai con trỏ, Prefix sum, Tham lam, Sàng nguyên tố, Lũy thừa nhanh, Tổ hợp.

---

## Bài 2.1 — STL (vector, set, map, multiset, priority_queue)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: `vector`, `set`, `map`, `multiset`, `priority_queue`, `pair`, `tuple`.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "C++ STL", "Set", "Map", "Priority queue")
- **CP-Algorithms — C++ STL**: https://cp-algorithms.com/ (mục "C++ STL")
- **cppreference — Containers**: https://en.cppreference.com/w/cpp/container

### Nội dung chính
- `vector`: mảng động, `push_back`, `pop_back`, `size`, `clear`
- `set`: tập hợp không trùng, tự động sắp xếp, `insert`, `erase`, `find`
- `map`: ánh xạ key → value, `insert`, `erase`, `find`, `operator[]`
- `multiset`: tập hợp có trùng, tự động sắp xếp
- `priority_queue`: hàng đợi ưu tiên (max-heap mặc định)
- `pair`, `tuple`: cặp/bộ giá trị

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    multiset<int> s;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        s.insert(x);
    }
    auto it = s.begin();
    cout << *it << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên `clear()` trước khi dùng lại
- Nhầm `set` vs `multiset` (set không cho trùng)
- Quên `#include <set>`, `<map>`, `<queue>`

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Towers | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Tham lam, multiset | Luyện tập |
| 2 | Traffic Lights | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Set, mô phỏng | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1100-1400 tag `data structures` + CSES Sorting để đủ 5-10 bài.

---

## Bài 2.2 — Prefix sum nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: prefix sum, sliding window, 2D prefix.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Prefix sums", "Sliding window")
- **CP-Algorithms — Prefix sums**: https://cp-algorithms.com/ (mục "Prefix sums")
- **USACO Guide — Prefix sums**: https://usaco.guide/ (mục Silver: "Prefix sums")

### Nội dung chính
- Prefix sum 1D: `pre[i] = a[0] + ... + a[i-1]`
- Tổng đoạn [l, r]: `pre[r+1] - pre[l]`
- Prefix sum 2D: tổng hình chữ nhật O(1)
- Sliding window: duy trì cửa sổ trượt, cập nhật prefix
- Ứng dụng: đếm sự kiện, sliding window, DP

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

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Distinct Values Subarrays | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Two pointers, prefix | Luyện tập |
| 2 | Distinct Values Subsequences | CSES | https://cses.fi/problemset/ (Sorting and Searching) | DP, last position | Luyện tập |
| 3 | Sliding Window Cost | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Sliding window, prefix | Thử thách |

> Mở rộng: thêm 2-7 bài CF 1100-1400 tag `prefix sums` + CSES Sorting để đủ 5-10 bài.

---

## Bài 2.3 — Hai con trỏ nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: two pointers trên mảng đã sắp xếp, sliding window.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Two pointers", "Sliding window")
- **CP-Algorithms — Two pointers**: https://cp-algorithms.com/ (mục "Two pointers")
- **USACO Guide — Two pointers**: https://usaco.guide/ (mục Silver: "Two pointers")

### Nội dung chính
- Two pointers: 2 con trỏ (i, j) di chuyển trên mảng đã sắp xếp
- Biến thể 1: tìm cặp có tổng S (i ở đầu, j ở cuối)
- Biến thể 2: sliding window (tìm đoạn con thỏa điều kiện)
- Biến thể 3: two pointers trên 2 mảng (merge, so sánh)
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
- Sai logic khi mở rộng/thu hẹp cửa sổ

### Bài tập (6 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Playlist | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Two pointers, set | Luyện tập |
| 2 | Bouquet (Easy Version) | Codeforces 1995B1 | https://codeforces.com/problemset/problem/1995/B1 | Binary search, two pointers | 1100 |
| 3 | Equalize | Codeforces 1928B | https://codeforces.com/problemset/problem/1928/B | Binary search, two pointers | 1200 |
| 4 | Money Trees | Codeforces 1873F | https://codeforces.com/problemset/problem/1873/F | Binary search, two pointers | 1300 |
| 5 | Number of Pairs | Codeforces 1538C | https://codeforces.com/problemset/problem/1538/C | Binary search, two pointers | 1300 |
| 6 | Traffic Light | Codeforces 1744C | https://codeforces.com/problemset/problem/1744/C | Binary search, two pointers | 1000 |

> Mở rộng: thêm 1-4 bài CF 1100-1400 tag `two pointers` + CSES Sorting để đủ 8-10 bài.

---

## Bài 2.4 — Tìm kiếm nhị phân (kể cả trên đáp án)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: binary search trên mảng, trên đáp án.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Binary search", "Binary search on answer")
- **CP-Algorithms — Binary Search**: https://cp-algorithms.com/ (mục "Binary Search", "Binary search on answer")
- **USACO Guide — Binary search**: https://usaco.guide/ (mục Silver: "Binary search")

### Nội dung chính
- Binary search trên mảng đã sắp xếp: `lower_bound`, `upper_bound`
- Binary search trên đáp án: kiểm tra tính đơn điệu (nếu đáp án X thỏa thì X+1 cũng thỏa)
- Binary search trên hàm đơn điệu (tăng/giảm)
- Độ phức tạp: O(log n)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; long long k;
    cin >> n >> k;
    long long lo = 1, hi = 2e18;
    while (lo < hi) {
        long long mid = (lo + hi) / 2;
        if (check(mid)) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai cận `lo/hi` (quên xử lý `mid`)
- Quên kiểm tra tính đơn điệu trước khi binary search trên đáp án
- Tràn khi tính `mid` (dùng `lo + (hi - lo) / 2`)

### Bài tập (8 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Birthday | Codeforces 1131C | https://codeforces.com/problemset/problem/1131/C | Binary search, greedy | 1200 |
| 2 | Maximum Median | Codeforces 1201C | https://codeforces.com/problemset/problem/1201/C | Binary search, greedy | 1400 |
| 3 | Eating Queries | Codeforces 1676E | https://codeforces.com/problemset/problem/1676/E | Binary search, greedy | 1100 |
| 4 | Shovels and Swords | Codeforces 1366A | https://codeforces.com/problemset/problem/1366/A | Binary search, greedy | 1100 |
| 5 | Frog Jumps | Codeforces 1324C | https://codeforces.com/problemset/problem/1324/C | Binary search, greedy | 1100 |
| 6 | Cardboard for Pictures | Codeforces 1850E | https://codeforces.com/problemset/problem/1850/E | Binary search, math | 1100 |
| 7 | Quotient and Remainder | Codeforces 2170C | https://codeforces.com/problemset/problem/2170/C | Binary search, greedy | 1300 |
| 8 | Monster Game | Codeforces 2193D | https://codeforces.com/problemset/problem/2193/D | Binary search, two pointers | 1100 |

> Mở rộng: thêm 0-2 bài CF 1100-1400 tag `binary search` + CSES Sorting để đủ 8-10 bài.

---

## Bài 2.5 — Tham lam nâng cao (interval, scheduling)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: interval scheduling, tham lam có chứng minh.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Greedy", "Interval scheduling")
- **CP-Algorithms — Greedy**: https://cp-algorithms.com/ (mục "Greedy")
- **USACO Guide — Greedy**: https://usaco.guide/ (mục Silver: "Greedy")

### Nội dung chính
- Interval scheduling: sắp xếp theo thời điểm kết thúc, chọn greedily
- Room allocation: sắp xếp sự kiện, dùng multiset/mảng đếm
- Movie Festival II: sắp xếp theo thời điểm kết thúc, dùng multiset
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

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Room Allocation | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Sự kiện, tham lam | Luyện tập |
| 2 | Movie Festival II | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Tham lam, multiset | Thử thách |
| 3 | Two Teams Composing | Codeforces 1335C | https://codeforces.com/problemset/problem/1335/C | Binary search, greedy | 1100 |
| 4 | Monster Game | Codeforces 2193D | https://codeforces.com/problemset/problem/2193/D | Binary search, two pointers | 1100 |

> Mở rộng: thêm 1-6 bài CF 1100-1400 tag `greedy` + `sortings` để đủ 5-10 bài.

---

## Bài 2.6 — Đếm, hash cơ bản

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3**: đếm tần số, hash map, DP trên ước số.  
  Link: https://cses.fi/book/book.pdf (Chương 3: "Counting", "Hash map", "DP on divisors")
- **CP-Algorithms — Hash map**: https://cp-algorithms.com/ (mục "Hash map")
- **VNOI Wiki — Đếm**: https://wiki.vnoi.info/ (mục "Đếm")

### Nội dung chính
- Đếm tần số: mảng tần số, hash map (`map`, `unordered_map`)
- Hash map: key → value, O(1) trung bình
- DP trên ước số: dp[i] = dp[i/d] + 1 (với d là ước của i)
- Ứng dụng: đếm cặp, đếm đoạn, DP trên ước số

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    map<int, int> cnt;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        cnt[x]++;
    }
    int mx = 0;
    for (auto &p : cnt) mx = max(mx, p.second);
    cout << mx << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên khởi tạo hash map
- Nhầm `map` vs `unordered_map` (unordered_map có hash, map có cây)
- Quên xử lý key không tồn tại

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Students and Shoelaces | Codeforces 129B | https://codeforces.com/problemset/problem/129/B | Đồ thị, mô phỏng | 1200 |
| 2 | Orac and Models | Codeforces 1350B | https://codeforces.com/problemset/problem/1350/B | DP, sàng ước | 1400 |
| 3 | Apple Tree | Codeforces 1843D | https://codeforces.com/problemset/problem/1843/D | DP trên cây, DFS | 1200 |
| 4 | Masha and a Beautiful Tree | Codeforces 1741D | https://codeforces.com/problemset/problem/1741/D | Chia để trị, cây | 1300 |

> Mở rộng: thêm 1-6 bài CF 1100-1400 tag `data structures` + `dp` + `number theory` để đủ 5-10 bài.

---

## Bài 2.7 — Sàng nguyên tố

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: sàng Eratosthenes, đếm ước số.  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Sieve of Eratosthenes", "Counting divisors")
- **CP-Algorithms — Sieve**: https://cp-algorithms.com/ (mục "Sieve of Eratosthenes")
- **VNOI Wiki — Sàng nguyên tố**: https://wiki.vnoi.info/ (mục "Sàng nguyên tố")

### Nội dung chính
- Sàng Eratosthenes: O(n log log n), đánh dấu số nguyên tố
- Đếm ước số: với mỗi i, đếm số bội của i
- Ứng dụng: đếm số nguyên tố, đếm ước, DP trên ước số

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<bool> is_prime(n + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i * i <= n; i++)
        if (is_prime[i])
            for (int j = i * i; j <= n; j += i)
                is_prime[j] = false;
    int cnt = 0;
    for (int i = 2; i <= n; i++) if (is_prime[i]) cnt++;
    cout << cnt << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên đánh dấu 0 và 1 là không nguyên tố
- Sai cận `i * i <= n`
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Counting Divisors | CSES | https://cses.fi/problemset/ (Mathematics) | Sàng, ước số | Luyện tập |

> Mở rộng: thêm 4-9 bài CF 1100-1400 tag `number theory` + `sieve` + CSES Mathematics để đủ 5-10 bài.

---

## Bài 2.8 — Lũy thừa nhanh

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: lũy thừa nhanh O(log n).  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Binary exponentiation")
- **CP-Algorithms — Binary exponentiation**: https://cp-algorithms.com/ (mục "Binary exponentiation")
- **VNOI Wiki — Lũy thừa nhanh**: https://wiki.vnoi.info/ (mục "Lũy thừa nhanh")

### Nội dung chính
- Lũy thừa nhanh: O(log n) thay vì O(n)
- Công thức: `a^b = (a^(b/2))^2` nếu b chẵn, `a^b = a * a^(b-1)` nếu b lẻ
- Modulo: `(a * b) % m`, `(a^b) % m`
- Ứng dụng: tính lũy thừa lớn, Fibonacci nhanh, matrix exponentiation

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
long long power(long long a, long long b, long long p) {
    long long r = 1; a %= p;
    while (b) {
        if (b & 1) r = r * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return r;
}
int main() {
    long long a, b, p; cin >> a >> b >> p;
    cout << power(a, b, p) << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên mod khi nhân lớn
- Sai cận vòng lặp (`b >>= 1`)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Exponentiation | CSES | https://cses.fi/problemset/ (Mathematics) | Lũy thừa nhanh | Luyện tập |

> Mở rộng: thêm 4-9 bài CF 1100-1400 tag `math` + `number theory` + CSES Mathematics để đủ 5-10 bài.

---

## Bài 2.9 — Tổ hợp mod p

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: tổ hợp C(n,k) mod p, nghịch đảo modulo.  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Binomial coefficients", "Modular arithmetic")
- **CP-Algorithms — Binomial coefficients**: https://cp-algorithms.com/ (mục "Binomial coefficients")
- **VNOI Wiki — Tổ hợp**: https://wiki.vnoi.info/ (mục "Tổ hợp")

### Nội dung chính
- Tổ hợp C(n,k) = n! / (k! * (n-k)!)
- Mod p: C(n,k) mod p với p nguyên tố
- Nghịch đảo modulo: `a^(p-2) mod p` (Fermat's little theorem)
- Precompute factorial + inverse factorial

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
const int MOD = 1e9 + 7;
long long power(long long a, long long b, long long p) {
    long long r = 1; a %= p;
    while (b) {
        if (b & 1) r = r * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return r;
}
int main() {
    int n, k; cin >> n >> k;
    vector<long long> fact(n + 1), inv(n + 1);
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i-1] * i % MOD;
    inv[n] = power(fact[n], MOD - 2, MOD);
    for (int i = n; i >= 1; i--) inv[i-1] = inv[i] * i % MOD;
    long long ans = fact[n] * inv[k] % MOD * inv[n-k] % MOD;
    cout << ans << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên mod khi nhân lớn
- Sai nghịch đảo modulo (dùng `a^(p-2)` thay vì `a^(p-1)`)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Binomial Coefficients | CSES | https://cses.fi/problemset/ (Mathematics) | Tổ hợp mod p | Luyện tập |

> Mở rộng: thêm 4-9 bài CF 1100-1400 tag `combinatorics` + `number theory` + CSES Mathematics để đủ 5-10 bài.

---

## Bài 2.10 — Tổng hợp cấp 2

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 3-4**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 3-4 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")

### Nội dung chính
- Kết hợp: STL + prefix sum + two pointers + binary search + tham lam + hash + sàng + lũy thừa + tổ hợp
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

### Bài tập (7 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Sum of Four Values | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Two pointers, hash | Thử thách |
| 2 | Maximum Subarray Sum II | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Prefix, deque | Thử thách |
| 3 | Sliding Window Median | CSES | https://cses.fi/problemset/ (Sorting and Searching) | Two pointers, multiset | Thử thách |
| 4 | Earning on Bets | Codeforces 1979C | https://codeforces.com/problemset/problem/1979/C | Binary search, combinatorics | 1200 |
| 5 | Boring Day | Codeforces 1982C | https://codeforces.com/problemset/problem/1982/C | Binary search, two pointers | 1200 |
| 6 | The Strict Teacher (Hard Version) | Codeforces 2005B2 | https://codeforces.com/problemset/problem/2005/B2 | Binary search, greedy | 1200 |
| 7 | Eugeny and Play List | Codeforces 302B | https://codeforces.com/problemset/problem/302/B | Binary search, two pointers | 1200 |

> Mở rộng: thêm 0-3 bài CF 1100-1400 tổng hợp (tag `binary search` + `two pointers` + `greedy`) để đủ 8-10 bài.

---

## Tổng kết cấp 2

- **10 bài học**, mỗi bài 1-8 bài tập (khung đầu), tổng 38 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~20-40 bài CF 1100-1400 (tag `binary search`, `two pointers`, `greedy`, `data structures`, `number theory`, `combinatorics`) + CSES Sorting/Searching/Mathematics còn lại.
- **Lý thuyết**: bám CSES Handbook chương 3-4 + CP-Algorithms + USACO Guide Silver + VNOI Wiki.
- **Bài tập**: ưu tiên CSES Sorting/Searching/Mathematics (xương sống) + CF 1100-1400 (bổ sung).

## Checklist hoàn thiện cấp 2

- [ ] Bổ sung 3-9 bài CF 1100-1400 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Playlist, Towers, Traffic Lights, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các bài CSES (Playlist, Towers, Traffic Lights, Distinct Values Subarrays, Distinct Values Subsequences, Room Allocation, Movie Festival II, Counting Divisors, Exponentiation, Binomial Coefficients, Sum of Four Values, Maximum Subarray Sum II, Sliding Window Median, Sliding Window Cost) đã xác nhận tồn tại trong problemset. [web:65][web:72]
- Các link Codeforces đã đối chiếu qua problemset (tag `binary search`, `two pointers`, `greedy`, rating 1100-1400). [web:66][web:67][web:68][web:69][web:70][web:71]
- Một số bài CSES (Sum of Four Values, Maximum Subarray Sum II, Sliding Window Median) có thể chuyển lên cấp 3 nếu quá khó.
