# Khung nội dung — Cấp 3: Trung cấp 1

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 0-12 bài (khung đầu), tổng 35 bài; cần bổ sung ~30-60 bài CF 1300-1500 + CSES DP/Graph còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 3

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 6-7 (Dynamic Programming, Graph Algorithms, Number theory).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Dynamic Programming", "Graphs", "Number theory", "Combinatorics".
- **USACO Guide** — https://usaco.guide/ — mục Silver/Gold (DP, Graphs, Number theory).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho DP, DFS/BFS, DSU, Sàng nguyên tố, Lũy thừa nhanh, Tổ hợp.
- **AtCoder Educational DP Contest** — https://atcoder.jp/contests/dp/tasks — 26 bài DP (A-Z), xương sống cho DP.

---

## Bài 3.1 — DP cơ bản (knapsack, LIS, LCS, edit distance)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 6**: trạng thái, chuyển, cơ sở; knapsack, LIS, LCS, edit distance.  
  Link: https://cses.fi/book/book.pdf (Chương 6: "Dynamic Programming", "Knapsack", "LIS", "LCS", "Edit distance")
- **CP-Algorithms — Dynamic Programming**: https://cp-algorithms.com/ (mục "Dynamic Programming", "Knapsack", "LIS", "LCS")
- **AtCoder Educational DP Contest**: https://atcoder.jp/contests/dp/tasks (bài A-C, K-M)
- **USACO Guide — DP**: https://usaco.guide/ (mục Silver: "Dynamic Programming")

### Nội dung chính
- Trạng thái (state), chuyển (transition), cơ sở (base case)
- Knapsack 0/1: dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi] + vi)
- Knapsack 1D: dp[w] = max(dp[w], dp[w-wi] + vi)
- LIS: dp[i] = max(dp[j] + 1) với j < i và a[j] < a[i]; tối ưu O(n log n) với `lower_bound`
- LCS: dp[i][j] = dp[i-1][j-1] + 1 nếu a[i] == b[j], else max(dp[i-1][j], dp[i][j-1])
- Edit distance: dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + cost

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, W; cin >> n >> W;
    vector<int> w(n), v(n);
    for (int i = 0; i < n; i++) cin >> w[i] >> v[i];
    vector<long long> dp(W + 1, 0);
    for (int i = 0; i < n; i++)
        for (int j = W; j >= w[i]; j--)
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    cout << dp[W] << endl;
    return 0;
}
```
Độ phức tạp: O(nW) (knapsack 1D).

### Lỗi thường gặp
- Sai chiều duyệt (knapsack 1D phải duyệt W giảm dần)
- Quên khởi tạo `dp[0]`
- Sai điều kiện chuyển (quên kiểm tra `j >= w[i]`)
- Nhầm LIS O(n^2) và O(n log n)

### Bài tập (12 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Dice Combinations | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP cơ bản | Khởi động |
| 2 | Minimizing Coins | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP, coin change | Khởi động |
| 3 | Coin Combinations I | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP, đếm | Khởi động |
| 4 | Coin Combinations II | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP, đếm | Khởi động |
| 5 | Removing Digits | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP | Khởi động |
| 6 | Frog 1 (dp_a) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_a | DP cơ bản | D |
| 7 | Frog 2 (dp_b) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_b | DP cơ bản | D |
| 8 | Vacation (dp_c) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_c | DP, tối ưu | D |
| 9 | Stones (dp_k) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_k | DP, game | D |
| 10 | Deque (dp_l) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_l | DP, deque | D |
| 11 | Candies (dp_m) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_m | DP, đếm | D |
| 12 | Cut Ribbon | Codeforces 189A | https://codeforces.com/problemset/problem/189/A | DP, coin change | 1300 |

> Mở rộng: thêm 0-3 bài CF 1300-1500 tag `dp` + CSES DP để đủ 12-15 bài.

---

## Bài 3.2 — DP trên grid

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 6**: DP trên lưới, Grid Paths, Array Description.  
  Link: https://cses.fi/book/book.pdf (Chương 6: "Grid paths", "Array description")
- **CP-Algorithms — DP on grid**: https://cp-algorithms.com/ (mục "DP on grid")
- **AtCoder Educational DP Contest**: https://atcoder.jp/contests/dp/tasks (bài H)

### Nội dung chính
- DP trên lưới: dp[i][j] từ dp[i-1][j] + dp[i][j-1]
- Grid Paths: đếm số đường đi từ (1,1) đến (n,m)
- Array Description: dp[i][j] = số cách điền đến vị trí i với giá trị j
- Độ phức tạp: O(nm) hoặc O(nm^2)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<vector<long long>> dp(n + 1, vector<long long>(m + 1, 0));
    dp[1][1] = 1;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (i == 1 && j == 1) continue;
            if (grid[i-1][j-1] == '.') {
                dp[i][j] = (dp[i-1][j] + dp[i][j-1]) % MOD;
            }
        }
    cout << dp[n][m] << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai điều kiện biên (i = 1, j = 1)
- Quên mod khi nhân lớn
- Nhầm dp[i-1][j] và dp[i][j-1]

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Grid Paths I | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP, grid | Luyện tập |
| 2 | Array Description | CSES | https://cses.fi/problemset/ (Dynamic Programming) | DP, mảng | Luyện tập |
| 3 | Grid 1 (dp_h) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_h | DP grid | D |

> Mở rộng: thêm 2-7 bài CF 1300-1500 tag `dp` + `grid` + CSES DP để đủ 5-10 bài.

---

## Bài 3.3 — DFS/BFS

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: DFS, BFS, thành phần liên thông, đường đi ngắn.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Graph algorithms", "DFS", "BFS", "Connected components", "Shortest paths")
- **CP-Algorithms — Graphs**: https://cp-algorithms.com/ (mục "Graphs", "DFS", "BFS")
- **USACO Guide — Graphs**: https://usaco.guide/ (mục Silver: "Graphs")

### Nội dung chính
- DFS: duyệt sâu, đệ quy hoặc stack
- BFS: duyệt rộng, queue, tìm đường đi ngắn (không trọng số)
- Thành phần liên thông: đếm số thành phần
- Đường đi ngắn: BFS (không trọng số), Dijkstra (có trọng số dương)
- Ứng dụng: đếm phòng, tìm đường, tô màu

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> vis(n + 1, false);
    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (!vis[i]) {
            cnt++;
            queue<int> q;
            q.push(i); vis[i] = true;
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : adj[u])
                    if (!vis[v]) { vis[v] = true; q.push(v); }
            }
        }
    }
    cout << cnt << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên `visited` (dẫn đến vòng lặp vô hạn)
- Stack overflow với DFS sâu (dùng BFS hoặc DFS không đệ quy)
- Sai hướng duyệt (quên thêm cạnh 2 chiều)

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Counting Rooms | CSES 1192 | https://cses.fi/problemset/task/1192/ | BFS/DFS, connected component | Luyện tập |
| 2 | Labyrinth | CSES 1193 | https://cses.fi/problemset/task/1193/ | BFS, đường đi | Luyện tập |
| 3 | Building Teams | CSES 1668 | https://cses.fi/problemset/task/1668/ | BFS, 2-coloring | Luyện tập |
| 4 | Message Route | CSES 1667 | https://cses.fi/problemset/task/1667/ | BFS, đường đi ngắn | Luyện tập |

> Mở rộng: thêm 1-6 bài CF 1300-1500 tag `graphs` + `dfs and similar` + `bfs` + CSES Graph để đủ 5-10 bài.

---

## Bài 3.4 — DSU (Disjoint Set Union)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: DSU, path compression, union by rank.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Disjoint Set Union")
- **CP-Algorithms — DSU**: https://cp-algorithms.com/ (mục "Disjoint Set Union")
- **USACO Guide — DSU**: https://usaco.guide/ (mục Silver: "Disjoint Set Union")

### Nội dung chính
- DSU: quản lý tập hợp rời rạc, `find` (tìm đại diện), `unite` (hợp nhất)
- Path compression: nén đường đi khi `find`
- Union by rank/size: hợp nhất theo rank/size
- Độ phức tạp: O(alpha(n)) gần như O(1)
- Ứng dụng: thành phần liên thông, MST (Kruskal), connected components

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int par[100005], sz[100005];
int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a != b) {
        if (sz[a] < sz[b]) swap(a, b);
        par[b] = a;
        sz[a] += sz[b];
    }
}
int main() {
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        unite(u, v);
    }
    int cnt = 0;
    for (int i = 1; i <= n; i++) if (find(i) == i) cnt++;
    cout << cnt << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên path compression (dẫn đến O(n) mỗi lần find)
- Quên union by rank/size (dẫn đến cây lệch)
- Sai điều kiện `a != b` trước khi unite

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Building Roads | CSES 1666 | https://cses.fi/problemset/task/1666/ | DSU, connected component | Luyện tập |
| 2 | Road Reparation | CSES 1675 | https://cses.fi/problemset/task/1675/ | DSU, MST | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1300-1500 tag `dsu` + `graphs` + CSES Graph để đủ 5-10 bài.

---

## Bài 3.5 — Sàng nguyên tố nâng cao

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: sàng Eratosthenes, linear sieve, smallest prime factor.  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Sieve of Eratosthenes", "Linear sieve")
- **CP-Algorithms — Sieve**: https://cp-algorithms.com/ (mục "Sieve of Eratosthenes", "Linear sieve")
- **VNOI Wiki — Sàng nguyên tố**: https://wiki.vnoi.info/ (mục "Sàng nguyên tố")

### Nội dung chính
- Sàng Eratosthenes: O(n log log n), đánh dấu số nguyên tố
- Linear sieve: O(n), mỗi số chỉ bị đánh dấu 1 lần
- Smallest prime factor (SPF): ước nguyên tố nhỏ nhất
- Ứng dụng: đếm số nguyên tố, đếm ước, phân tích thừa số

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> spf(n + 1);
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) {
            for (int j = i; j <= n; j += i)
                if (spf[j] == 0) spf[j] = i;
        }
    }
    int cnt = 0;
    for (int i = 2; i <= n; i++) if (spf[i] == i) cnt++;
    cout << cnt << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên đánh dấu 0 và 1 là không nguyên tố
- Sai cận `i * i <= n`
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (0 bài — cần bổ sung)
> Mở rộng: thêm 5-10 bài CF 1300-1500 tag `number theory` + `sieve` + CSES Mathematics.

---

## Bài 3.6 — Lũy thừa nhanh nâng cao (matrix exponentiation)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: lũy thừa nhanh, matrix exponentiation.  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Binary exponentiation", "Matrix exponentiation")
- **CP-Algorithms — Binary exponentiation**: https://cp-algorithms.com/ (mục "Binary exponentiation", "Matrix exponentiation")
- **VNOI Wiki — Lũy thừa nhanh**: https://wiki.vnoi.info/ (mục "Lũy thừa nhanh")

### Nội dung chính
- Lũy thừa nhanh: O(log n) thay vì O(n)
- Matrix exponentiation: tính Fibonacci, đếm đường đi trên đồ thị
- Công thức: `a^b = (a^(b/2))^2` nếu b chẵn, `a^b = a * a^(b-1)` nếu b lẻ
- Ứng dụng: Fibonacci nhanh, đếm đường đi, DP trên ma trận

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
const int MOD = 1e9 + 7;
typedef vector<vector<long long>> Matrix;
Matrix mul(Matrix a, Matrix b) {
    int n = a.size();
    Matrix c(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            for (int k = 0; k < n; k++)
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
    return c;
}
Matrix power(Matrix a, long long b) {
    int n = a.size();
    Matrix r(n, vector<long long>(n, 0));
    for (int i = 0; i < n; i++) r[i][i] = 1;
    while (b) {
        if (b & 1) r = mul(r, a);
        a = mul(a, a);
        b >>= 1;
    }
    return r;
}
int main() {
    long long n; cin >> n;
    Matrix f = {{1, 1}, {1, 0}};
    Matrix r = power(f, n);
    cout << r[0][1] << endl; // Fibonacci(n)
    return 0;
}
```

### Lỗi thường gặp
- Quên mod khi nhân ma trận
- Sai cận vòng lặp (`b >>= 1`)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (0 bài — cần bổ sung)
> Mở rộng: thêm 5-10 bài CF 1300-1500 tag `math` + `matrix` + CSES Mathematics.

---

## Bài 3.7 — Tổ hợp mod p nâng cao (Lucas, Catalan)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 4**: tổ hợp C(n,k) mod p, nghịch đảo modulo, Lucas, Catalan.  
  Link: https://cses.fi/book/book.pdf (Chương 4: "Binomial coefficients", "Modular arithmetic", "Lucas", "Catalan")
- **CP-Algorithms — Binomial coefficients**: https://cp-algorithms.com/ (mục "Binomial coefficients", "Lucas", "Catalan")
- **VNOI Wiki — Tổ hợp**: https://wiki.vnoi.info/ (mục "Tổ hợp")

### Nội dung chính
- Tổ hợp C(n,k) = n! / (k! * (n-k)!)
- Mod p: C(n,k) mod p với p nguyên tố
- Nghịch đảo modulo: `a^(p-2) mod p` (Fermat's little theorem)
- Lucas: C(n,k) mod p với n, k lớn (p nhỏ)
- Catalan: C(2n,n)/(n+1)

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

### Bài tập (0 bài — cần bổ sung)
> Mở rộng: thêm 5-10 bài CF 1300-1500 tag `combinatorics` + `number theory` + CSES Mathematics.

---

## Bài 3.8 — DP kết hợp sàng ước

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 6**: DP kết hợp sàng ước, DP trên ước số.  
  Link: https://cses.fi/book/book.pdf (Chương 6: "DP on divisors")
- **CP-Algorithms — DP on divisors**: https://cp-algorithms.com/ (mục "DP on divisors")
- **VNOI Wiki — DP trên ước số**: https://wiki.vnoi.info/ (mục "DP trên ước số")

### Nội dung chính
- DP trên ước số: dp[i] = dp[i/d] + 1 (với d là ước của i)
- Kết hợp sàng ước: precompute ước số, rồi DP
- Ứng dụng: đếm số cách chia, DP trên ước số

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> dp(n + 1, 0);
    for (int i = 1; i <= n; i++)
        for (int j = i; j <= n; j += i)
            dp[j] = max(dp[j], dp[j / i] + 1);
    cout << dp[n] << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai cận vòng lặp (`j += i`)
- Quên xử lý i = 1 (dp[1] = 1)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (0 bài — cần bổ sung)
> Mở rộng: thêm 5-10 bài CF 1300-1500 tag `dp` + `number theory` + `sieve` + CSES DP/Mathematics.

---

## Bài 3.9 — DP trên DAG (Longest path, topological order)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: DP trên DAG, longest path, topological order.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "DAG", "Longest path", "Topological sorting")
- **CP-Algorithms — DAG**: https://cp-algorithms.com/ (mục "DAG", "Topological sorting")
- **AtCoder Educational DP Contest**: https://atcoder.jp/contests/dp/tasks (bài G, P)

### Nội dung chính
- DAG: đồ thị có hướng không có chu trình
- Topological order: thứ tự duyệt DAG
- Longest path: dp[v] = max(dp[u] + 1) với u → v
- Ứng dụng: tìm đường đi dài nhất, DP trên DAG

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        indeg[v]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);
    vector<int> dp(n + 1, 0);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            dp[v] = max(dp[v], dp[u] + 1);
            if (--indeg[v] == 0) q.push(v);
        }
    }
    int mx = 0;
    for (int i = 1; i <= n; i++) mx = max(mx, dp[i]);
    cout << mx << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên xử lý DAG (có chu trình thì sai)
- Sai topological order
- Quên khởi tạo dp

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Longest Path (dp_g) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_g | DP trên DAG | D |
| 2 | Independent Set (dp_p) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_p | DP trên cây/graph | D |

> Mở rộng: thêm 3-8 bài CF 1300-1500 tag `dp` + `graphs` + `dag` + CSES Graph để đủ 5-10 bài.

---

## Bài 3.10 — Tổng hợp cấp 3

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 6-7**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 6-7 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")
- **AtCoder Educational DP Contest**: https://atcoder.jp/contests/dp/tasks (bài D-F, I-J, N-T)

### Nội dung chính
- Kết hợp: DP + DFS/BFS + DSU + sàng + lũy thừa + tổ hợp + DP trên DAG
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

### Bài tập (12 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Book Shop | CSES | https://cses.fi/problemset/ (Dynamic Programming) | Knapsack | Luyện tập |
| 2 | Knapsack 1 (dp_d) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_d | Knapsack | D |
| 3 | Knapsack 2 (dp_e) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_e | Knapsack | D |
| 4 | LCS (dp_f) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_f | DP chuỗi | D |
| 5 | Coins (dp_i) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_i | DP xác suất | D |
| 6 | Sushi (dp_j) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_j | DP trạng thái | D |
| 7 | Slimes (dp_n) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_n | DP, interval | D |
| 8 | Matching (dp_o) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_o | DP, bitmask | D |
| 9 | Flowers (dp_q) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_q | DP, LIS | D |
| 10 | Walk (dp_r) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_r | DP, matrix | D |
| 11 | Digit Sum (dp_s) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_s | DP, digit | D |
| 12 | Permutation (dp_t) | AtCoder DP | https://atcoder.jp/contests/dp/tasks/dp_t | DP, permutation | D |

> Mở rộng: thêm 0-3 bài CF 1300-1500 tổng hợp (tag `dp` + `graphs` + `number theory`) để đủ 12-15 bài.

---

## Tổng kết cấp 3

- **10 bài học**, mỗi bài 0-12 bài tập (khung đầu), tổng 35 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~30-60 bài CF 1300-1500 (tag `dp`, `graphs`, `dsu`, `number theory`, `combinatorics`, `sieve`) + CSES DP/Graph/Mathematics còn lại.
- **Lý thuyết**: bám CSES Handbook chương 6-7 + CP-Algorithms + USACO Guide Silver/Gold + VNOI Wiki + AtCoder DP Contest.
- **Bài tập**: ưu tiên CSES DP/Graph (xương sống) + AtCoder DP Contest A-J (xương sống) + CF 1300-1500 (bổ sung).

## Checklist hoàn thiện cấp 3

- [ ] Bổ sung 3-8 bài CF 1300-1500 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Dice Combinations, Minimizing Coins, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các bài CSES DP đã xác nhận tồn tại trong problemset: Dice Combinations, Minimizing Coins, Coin Combinations I/II, Removing Digits, Grid Paths I, Book Shop. [web:74][web:78][web:80]
- Các bài CSES Graph đã xác nhận tồn tại trong problemset: Counting Rooms (1192), Labyrinth (1193), Building Roads (1666), Message Route (1667), Building Teams (1668), Road Reparation (1675). [web:75][web:81]
- Các bài AtCoder DP đã xác nhận tồn tại: dp_a (Frog 1), dp_b (Frog 2), dp_c (Vacation), dp_d (Knapsack 1), dp_e (Knapsack 2), dp_f (LCS), dp_g (Longest Path), dp_h (Grid 1), dp_i (Coins), dp_j (Sushi), dp_k (Stones), dp_l (Deque), dp_m (Candies), dp_n (Slimes), dp_o (Matching), dp_p (Independent Set), dp_q (Flowers), dp_r (Walk), dp_s (Digit Sum), dp_t (Permutation). [web:76][web:79]
- CF 189A (Cut Ribbon) đã xác nhận tồn tại, rating 1300.
- Một số bài CSES (Counting Divisors, Exponentiation, Binomial Coefficients) đã được dùng ở cấp 2; nếu cần, có thể chuyển sang cấp 3 như "Luyện tập/Thử thách" để tăng số bài.
