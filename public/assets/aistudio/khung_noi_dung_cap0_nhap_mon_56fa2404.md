# Khung nội dung — Cấp 0: Nhập môn

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 4-5 bài (khung đầu), có thể mở rộng lên 5-10 bằng cách thêm CF 800 theo tag.

## Nguồn lý thuyết chuẩn cho cấp 0

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 1-2 (C++ basics, I/O, data types, loops, arrays, functions, complexity).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Basic C++", "I/O", "Data Types".
- **cppreference** — https://en.cppreference.com/ — tham chiếu chuẩn cho `int`, `long long`, `cin/cout`, `vector`.
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho người mới.

---

## Bài 0.1 — Cú pháp C++ và I/O

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: cấu trúc chương trình C++, `#include`, `main`, biến, `cin/cout`, `ios_base::sync_with_stdio(false)`.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "C++ basics", "Working with numbers", "I/O")
- **CP-Algorithms — Basic C++**: https://cp-algorithms.com/ (mục "C++ for Competitive Programming")
- **cppreference — Input/Output**: https://en.cppreference.com/w/cpp/io

### Nội dung chính
- Cấu trúc chương trình: `#include <bits/stdc++.h>`, `int main()`, `return 0;`
- Biến và kiểu: `int`, `long long`, `double`, `char`, `bool`
- I/O: `cin >> x`, `cout << x`, `endl`, `ios_base::sync_with_stdio(false)`, `cin.tie(NULL)`
- Toán tử: `+ - * / %`, `== != < > <= >=`, `&& || !`

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    long long a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên `return 0;`
- Nhầm `int` / `long long`
- Quên `endl` hoặc `\n`
- Quên `ios_base::sync_with_stdio(false)` khi n lớn

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Watermelon | Codeforces 4A | https://codeforces.com/problemset/problem/4/A | Điều kiện, chia hết | 800 |
| 2 | Way Too Long Words | Codeforces 71A | https://codeforces.com/problemset/problem/71/A | Chuỗi | 800 |
| 3 | Team | Codeforces 231A | https://codeforces.com/problemset/problem/231/A | Vòng lặp, đếm | 800 |
| 4 | Bit++ | Codeforces 282A | https://codeforces.com/problemset/problem/282/A | Mô phỏng, chuỗi | 800 |
| 5 | Wrong Subtraction | Codeforces 977A | https://codeforces.com/problemset/problem/977/A | Mô phỏng | 800 |

> Mở rộng: thêm 3-5 bài CF 800 tag `implementation` để đủ 8-10 bài.

---

## Bài 0.2 — Kiểu dữ liệu và tràn số

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: giới hạn `int` (~2.1e9), `long long` (~9.2e18), `unsigned`, cách phát hiện tràn.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Working with numbers", "Data types")
- **cppreference — Integer types**: https://en.cppreference.com/w/cpp/language/types
- **CP-Algorithms — Overflow**: https://cp-algorithms.com/ (mục "Integer overflow")

### Nội dung chính
- Giới hạn kiểu: `int` (~2.1e9), `long long` (~9.2e18), `unsigned int`, `unsigned long long`
- Tràn số: khi nào xảy ra, cách phát hiện, cách tránh (cast sang `long long`)
- Phép chia và modulo: `a / b`, `a % b`, chia cho 0
- So sánh số thực: `double`, sai số, `epsilon`

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    long long a = 2e9, b = 2e9;
    // int sẽ tràn, long long không
    long long c = a * b; // OK với long long
    cout << c << endl;
    return 0;
}
```

### Lỗi thường gặp
- Nhân 2 số lớn mà không cast sang `long long`
- Chia cho 0
- So sánh số thực bằng `==` thay vì `abs(a-b) < eps`

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Divisibility Problem | Codeforces 1328A | https://codeforces.com/problemset/problem/1328/A | Toán, modulo | 800 |
| 2 | Theatre Square | Codeforces 1A | https://codeforces.com/problemset/problem/1/A | Toán, chia | 1000 |
| 3 | Domino piling | Codeforces 50A | https://codeforces.com/problemset/problem/50/A | Toán, chia | 800 |
| 4 | Elephant | Codeforces 617A | https://codeforces.com/problemset/problem/617/A | Toán, tham lam | 800 |
| 5 | Hulk | Codeforces 705A | https://codeforces.com/problemset/problem/705/A | Toán, xây dựng | 800 |

> Mở rộng: thêm 3-5 bài CF 800-1000 tag `math` để đủ 8-10 bài.

---

## Bài 0.3 — Vòng lặp, mảng, hàm

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: `for`, `while`, `break/continue`, mảng tĩnh vs `vector`, hàm.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Loops", "Arrays", "Functions")
- **CP-Algorithms — Arrays and Vectors**: https://cp-algorithms.com/ (mục "C++ STL")
- **cppreference — Control structures**: https://en.cppreference.com/w/cpp/language/control

### Nội dung chính
- Vòng lặp: `for`, `while`, `do-while`, `break`, `continue`
- Mảng: mảng tĩnh `int a[100]`, `vector<int>`, mảng 2D
- Hàm: khai báo, tham số, return, đệ quy cơ bản
- Duyệt mảng: `for (int i = 0; i < n; i++)`, `for (auto &x : a)`

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int mx = a[0];
    for (int i = 1; i < n; i++) mx = max(mx, a[i]);
    cout << mx << endl;
    return 0;
}
```

### Lỗi thường gặp
- Index out of bounds (`a[n]` khi mảng chỉ có `n` phần tử)
- Quên khởi tạo biến
- Nhầm `for` và `while`
- Đệ quy không có điều kiện dừng

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Weird Algorithm | CSES 1068 | https://cses.fi/problemset/task/1068/ | Mô phỏng, vòng lặp | Khởi động |
| 2 | Repetitions | CSES 1069 | https://cses.fi/problemset/task/1069/ | Chuỗi, hai con trỏ | Khởi động |
| 3 | Increasing Array | CSES 1094 | https://cses.fi/problemset/task/1094/ | Mảng, tham lam | Khởi động |
| 4 | Queue at the School | Codeforces 266B | https://codeforces.com/problemset/problem/266/B | Mô phỏng | 800 |
| 5 | Do Not Be Distracted | Codeforces 1520A | https://codeforces.com/problemset/problem/1520/A | Chuỗi, đếm | 800 |

> Mở rộng: thêm 3-5 bài CF 800 tag `implementation` + CSES Introductory để đủ 8-10 bài.

---

## Bài 0.4 — Đọc đề và độ phức tạp

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: đọc ràng buộc, ước lượng thời gian, Big-O.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Time complexity", "Estimating efficiency")
- **CP-Algorithms — Time Complexity**: https://cp-algorithms.com/ (mục "Complexity analysis")
- **VNOI Wiki — Độ phức tạp**: https://wiki.vnoi.info/ (mục "Độ phức tạp")

### Nội dung chính
- Đọc input/output format, ràng buộc (`n ≤ 1e5`, `t ≤ 1e4`, ...)
- Big-O: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n)
- Quy tắc: `n ≤ 1e5` → cần O(n log n) hoặc O(n); `n ≤ 1e3` → O(n^2) OK; `n ≤ 20` → O(2^n) OK
- Đếm tần số bằng mảng tần số / hash map

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> cnt(26, 0);
    string s; cin >> s;
    for (char c : s) cnt[c - 'a']++;
    int mx = *max_element(cnt.begin(), cnt.end());
    cout << mx << endl;
    return 0;
}
```

### Lỗi thường gặp
- Giải O(n^2) cho n lớn (TLE)
- Đọc sai input format
- Quên xử lý nhiều test case

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Missing Number | CSES 1083 | https://cses.fi/problemset/task/1083/ | Toán, mảng | Khởi động |
| 2 | Permutations | CSES 1070 | https://cses.fi/problemset/task/1070/ | Toán, xây dựng | Khởi động |
| 3 | Stones on the Table | Codeforces 266A | https://codeforces.com/problemset/problem/266/A | Chuỗi, đếm | 800 |
| 4 | Helpful Maths | Codeforces 339A | https://codeforces.com/problemset/problem/339/A | Chuỗi, sắp xếp | 800 |
| 5 | I Wanna Be the Guy | Codeforces 469A | https://codeforces.com/problemset/problem/469/A | Mảng, đếm | 800 |

> Mở rộng: thêm 3-5 bài CF 800 tag `implementation` + `math` để đủ 8-10 bài.

---

## Bài 0.5 — Mô phỏng đơn giản

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: mô phỏng quá trình theo đề.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Simulation")
- **CP-Algorithms — Simulation**: https://cp-algorithms.com/ (mục "Simulation")
- **VNOI Wiki — Mô phỏng**: https://wiki.vnoi.info/ (mục "Mô phỏng")

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
    long long n; cin >> n;
    while (n != 1) {
        cout << n << " ";
        if (n % 2 == 0) n /= 2;
        else n = 3 * n + 1;
    }
    cout << 1 << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai quy tắc chuyển (đọc nhầm đề)
- Quên xử lý biên (n = 1)
- Vòng lặp vô hạn (quên điều kiện dừng)

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Number Spiral | CSES | https://cses.fi/problemset/ (Introductory) | Toán, mô phỏng | Luyện tập |
| 2 | Two Knights | CSES | https://cses.fi/problemset/ (Introductory) | Toán, đếm | Luyện tập |
| 3 | Ordinary Numbers | Codeforces 1520B | https://codeforces.com/problemset/problem/1520/B | Toán, mô phỏng | 800 |
| 4 | Spy Detected! | Codeforces 1512A | https://codeforces.com/problemset/problem/1512/A | Mảng, mô phỏng | 800 |

> Mở rộng: thêm 3-5 bài CF 800 tag `implementation` + `simulation` để đủ 8-10 bài.

---

## Bài 0.6 — Chuỗi cơ bản

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: `string`, `getline`, đếm ký tự.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Strings")
- **CP-Algorithms — String basics**: https://cp-algorithms.com/ (mục "String algorithms")
- **cppreference — std::string**: https://en.cppreference.com/w/cpp/string/basic_string

### Nội dung chính
- `string`: khởi tạo, truy cập ký tự, độ dài, so sánh
- `getline`: đọc cả dòng (có khoảng trắng)
- Đếm tần số ký tự: mảng 26 hoặc hash map
- Chuyển hoa/thường: `toupper`, `tolower`
- So sánh chuỗi: `==`, `<`, `>`, `compare`

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

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Bit Strings | CSES | https://cses.fi/problemset/ (Introductory) | Toán, lũy thừa | Khởi động |
| 2 | Palindrome Reorder | CSES | https://cses.fi/problemset/ (Introductory) | Chuỗi, đếm | Luyện tập |
| 3 | Petya and Strings | Codeforces 112A | https://codeforces.com/problemset/problem/112/A | Chuỗi, so sánh | 800 |
| 4 | Anton and Danik | Codeforces 734A | https://codeforces.com/problemset/problem/734/A | Chuỗi, đếm | 800 |
| 5 | Nearly Lucky Number | Codeforces 110A | https://codeforces.com/problemset/problem/110/A | Chuỗi, đếm | 800 |

> Mở rộng: thêm 3-5 bài CF 800 tag `strings` để đủ 8-10 bài.

---

## Bài 0.7 — Toán cơ bản

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: ƯCLN, BCNN, modulo, lũy thừa.  
  Link: https://cses.fi/book/book.pdf (Chương 1: "Number theory")
- **CP-Algorithms — Number theory**: https://cp-algorithms.com/ (mục "Number theory")
- **VNOI Wiki — Số học**: https://wiki.vnoi.info/ (mục "Số học")

### Nội dung chính
- ƯCLN (Euclid), BCNN = a*b/UCLN
- Modulo: `(a + b) % m`, `(a * b) % m`, `(a - b + m) % m`
- Số nguyên tố: kiểm tra O(sqrt(n))
- Lũy thừa: `pow(a, b)` (cẩn thận overflow)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}
int main() {
    long long a, b; cin >> a >> b;
    cout << gcd(a, b) << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên xử lý `b = 0` trong Euclid
- Tràn khi tính BCNN (phải chia trước rồi nhân)
- Quên mod khi nhân lớn

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Trailing Zeros | CSES | https://cses.fi/problemset/ (Introductory) | Toán, số học | Luyện tập |
| 2 | Two Sets | CSES | https://cses.fi/problemset/ (Introductory) | Toán, xây dựng | Luyện tập |
| 3 | Coin Piles | CSES | https://cses.fi/problemset/ (Introductory) | Toán, tham lam | Luyện tập |
| 4 | Creating Strings | CSES | https://cses.fi/problemset/ (Introductory) | Sinh tổ hợp, chuỗi | Luyện tập |
| 5 | Apple Division | CSES | https://cses.fi/problemset/ (Introductory) | Bitmask, brute force | Luyện tập |

> Mở rộng: thêm 3-5 bài CF 800-1000 tag `math` + `number theory` để đủ 8-10 bài.

---

## Bài 0.8 — Tổng hợp cấp 0

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 1**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 1 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")

### Nội dung chính
- Kết hợp: I/O + vòng lặp + mảng + chuỗi + toán
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
| 1 | Digit Queries | CSES | https://cses.fi/problemset/ (Introductory) | Toán, mô phỏng | Thử thách |
| 2 | Grid Paths | CSES | https://cses.fi/problemset/ (Introductory) | Backtracking | Thử thách |
| 3 | Sum of Round Numbers | Codeforces 1352A | https://codeforces.com/problemset/problem/1352/A | Toán, xây dựng | 800 |
| 4 | Spy Detected! | Codeforces 1512A | https://codeforces.com/problemset/problem/1512/A | Mảng, mô phỏng | 800 |

> Mở rộng: thêm 3-5 bài CF 800-1000 tổng hợp (tag `implementation` + `math` + `strings`) để đủ 8-10 bài.

---

## Tổng kết cấp 0

- **8 bài học**, mỗi bài 4-5 bài tập (khung đầu), tổng ~38 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~20-30 bài CF 800 (tag `implementation`, `math`, `strings`, `simulation`) + CSES Introductory còn lại (Gray Code, Tower of Hanoi, Chessboard and Queens — chuyển lên cấp 1-2 nếu khó).
- **Lý thuyết**: bám CSES Handbook chương 1 + CP-Algorithms + cppreference + VNOI Wiki.
- **Bài tập**: ưu tiên CF 800 (dễ tiếp cận, có rating) + CSES Introductory (xương sống).

## Checklist hoàn thiện cấp 0

- [ ] Bổ sung 3-5 bài CF 800 cho mỗi bài học (đạt 8-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Number Spiral, Two Knights, Bit Strings, ...)
- [ ] Đối chiếu độ khó CSES với rating CF
