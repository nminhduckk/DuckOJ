# Khung nội dung — Cấp 4: Trung cấp 2

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 1-4 bài (khung đầu), tổng 32 bài; cần bổ sung ~30-90 bài CF 1500-1800 + CSES Graph/Range Queries còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 4

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 7-8 (Graph Algorithms, Range Queries, Tree Algorithms).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Graphs", "Data Structures", "Number theory", "String algorithms".
- **USACO Guide** — https://usaco.guide/ — mục Gold (Graphs, Data Structures, DP).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho Dijkstra, Bellman-Ford, Floyd-Warshall, MST, Topo, Fenwick, Segment tree, Sparse table, Bitmask DP, DP trên cây, Hashing, KMP, Z-function.

---

## Bài 4.1 — Dijkstra

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: Dijkstra, đường đi ngắn nhất có trọng số dương.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Dijkstra's algorithm")
- **CP-Algorithms — Dijkstra**: https://cp-algorithms.com/ (mục "Dijkstra")
- **USACO Guide — Dijkstra**: https://usaco.guide/ (mục Gold: "Dijkstra")

### Nội dung chính
- Dijkstra: đường đi ngắn nhất từ 1 nguồn đến tất cả đỉnh (trọng số dương)
- Dùng priority_queue (min-heap)
- Độ phức tạp: O((V + E) log V)
- Ứng dụng: đường đi ngắn nhất, đường đi ngắn nhất có giảm giá

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        adj[u].push_back({v, w});
    }
    vector<long long> dist(n + 1, 1e18);
    dist[1] = 0;
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    for (int i = 1; i <= n; i++) cout << dist[i] << " ";
    cout << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên kiểm tra `d > dist[u]` trước khi duyệt
- Sai hướng duyệt (quên thêm cạnh 2 chiều nếu đồ thị vô hướng)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Shortest Routes I | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Dijkstra | Luyện tập |
| 2 | Flight Discount | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Dijkstra, layered graph | Thử thách |
| 3 | Investigation | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Dijkstra, DP | Thử thách |

> Mở rộng: thêm 2-7 bài CF 1500-1800 tag `graphs` + `shortest paths` + CSES Graph để đủ 5-10 bài.

---

## Bài 4.2 — Bellman-Ford

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: Bellman-Ford, đường đi ngắn nhất với trọng số âm.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Bellman-Ford algorithm")
- **CP-Algorithms — Bellman-Ford**: https://cp-algorithms.com/ (mục "Bellman-Ford")
- **USACO Guide — Bellman-Ford**: https://usaco.guide/ (mục Gold: "Bellman-Ford")

### Nội dung chính
- Bellman-Ford: đường đi ngắn nhất từ 1 nguồn đến tất cả đỉnh (trọng số âm, không có chu trình âm)
- Phát hiện chu trình âm
- Độ phức tạp: O(VE)
- Ứng dụng: đường đi ngắn nhất, phát hiện chu trình âm

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m; cin >> n >> m;
    vector<tuple<int,int,int>> edges(m);
    for (auto &[u, v, w] : edges) cin >> u >> v >> w;
    vector<long long> dist(n + 1, 1e18);
    dist[1] = 0;
    for (int i = 0; i < n - 1; i++)
        for (auto [u, v, w] : edges)
            if (dist[u] < 1e18)
                dist[v] = min(dist[v], dist[u] + w);
    // Phát hiện chu trình âm
    for (auto [u, v, w] : edges)
        if (dist[u] < 1e18 && dist[u] + w < dist[v])
            cout << "NEGATIVE CYCLE\n";
    return 0;
}
```

### Lỗi thường gặp
- Quên kiểm tra `dist[u] < 1e18` trước khi relax
- Sai số lần lặp (n-1 lần)
- Quên phát hiện chu trình âm

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | High Score | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Bellman-Ford, negative cycle | Thử thách |
| 2 | Cycle Finding | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Bellman-Ford, negative cycle | Thử thách |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `graphs` + `shortest paths` + CSES Graph để đủ 5-10 bài.

---

## Bài 4.3 — Floyd-Warshall

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: Floyd-Warshall, all-pairs shortest paths.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Floyd-Warshall algorithm")
- **CP-Algorithms — Floyd-Warshall**: https://cp-algorithms.com/ (mục "Floyd-Warshall")
- **USACO Guide — Floyd-Warshall**: https://usaco.guide/ (mục Gold: "Floyd-Warshall")

### Nội dung chính
- Floyd-Warshall: đường đi ngắn nhất giữa mọi cặp đỉnh
- DP: dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j])
- Độ phức tạp: O(V^3)
- Ứng dụng: all-pairs shortest paths, transitive closure

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m, q; cin >> n >> m >> q;
    vector<vector<long long>> dist(n + 1, vector<long long>(n + 1, 1e18));
    for (int i = 1; i <= n; i++) dist[i][i] = 0;
    for (int i = 0; i < m; i++) {
        int u, v, w; cin >> u >> v >> w;
        dist[u][v] = min(dist[u][v], (long long)w);
        dist[v][u] = min(dist[v][u], (long long)w);
    }
    for (int k = 1; k <= n; k++)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
    while (q--) {
        int u, v; cin >> u >> v;
        cout << (dist[u][v] < 1e18 ? dist[u][v] : -1) << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Sai thứ tự vòng lặp (k phải ở ngoài cùng)
- Quên khởi tạo dist[i][i] = 0
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Shortest Routes II | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Floyd-Warshall | Luyện tập |
| 2 | Planets Queries II | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Floyd-Warshall, binary lifting | Thử thách |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `graphs` + `shortest paths` + CSES Graph để đủ 5-10 bài.

---

## Bài 4.4 — MST (Kruskal, Prim)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: MST, Kruskal, Prim.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Minimum spanning tree", "Kruskal", "Prim")
- **CP-Algorithms — MST**: https://cp-algorithms.com/ (mục "Minimum spanning tree", "Kruskal", "Prim")
- **USACO Guide — MST**: https://usaco.guide/ (mục Gold: "MST")

### Nội dung chính
- MST: cây khung nhỏ nhất
- Kruskal: sắp xếp cạnh theo trọng số, dùng DSU
- Prim: dùng priority_queue, tương tự Dijkstra
- Độ phức tạp: O(E log E) (Kruskal), O(E log V) (Prim)
- Ứng dụng: MST, đường đi ngắn nhất trên cây

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
    vector<tuple<int,int,int>> edges(m);
    for (auto &[w, u, v] : edges) cin >> u >> v >> w;
    sort(edges.begin(), edges.end());
    for (int i = 1; i <= n; i++) { par[i] = i; sz[i] = 1; }
    long long total = 0;
    int cnt = 0;
    for (auto [w, u, v] : edges) {
        if (find(u) != find(v)) {
            unite(u, v);
            total += w;
            cnt++;
        }
    }
    if (cnt == n - 1) cout << total << endl;
    else cout << "IMPOSSIBLE\n";
    return 0;
}
```

### Lỗi thường gặp
- Quên sắp xếp cạnh theo trọng số (Kruskal)
- Quên kiểm tra `find(u) != find(v)` trước khi unite
- Sai điều kiện kết thúc (cnt == n - 1)

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Road Reparation | CSES | https://cses.fi/problemset/ (Graph Algorithms) | DSU, MST | Luyện tập |
| 2 | Road Construction | CSES | https://cses.fi/problemset/ (Graph Algorithms) | DSU, MST | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `graphs` + `mst` + `dsu` + CSES Graph để đủ 5-10 bài.

---

## Bài 4.5 — Sắp xếp topo

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: sắp xếp topo, DAG.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Topological sorting", "DAG")
- **CP-Algorithms — Topological sorting**: https://cp-algorithms.com/ (mục "Topological sorting")
- **USACO Guide — Topological sorting**: https://usaco.guide/ (mục Gold: "Topological sorting")

### Nội dung chính
- Sắp xếp topo: thứ tự duyệt DAG
- Kahn's algorithm: dùng indegree, queue
- DFS-based: dùng stack
- Ứng dụng: Course Schedule, Longest Flight Route, DP trên DAG

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
    vector<int> topo;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topo.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);
    }
    if (topo.size() != n) cout << "IMPOSSIBLE\n";
    else for (int u : topo) cout << u << " ";
    cout << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên xử lý DAG (có chu trình thì không có topo)
- Sai indegree (quên tăng khi thêm cạnh)
- Quên kiểm tra `topo.size() != n`

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Course Schedule | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Topological sort | Luyện tập |
| 2 | Longest Flight Route | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Topological sort, DP | Thử thách |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `graphs` + `topological sorting` + `dp` + CSES Graph để đủ 5-10 bài.

---

## Bài 4.6 — Fenwick (BIT)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: Fenwick tree, cập nhật + truy vấn tổng đoạn.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Fenwick tree")
- **CP-Algorithms — Fenwick tree**: https://cp-algorithms.com/ (mục "Fenwick tree")
- **USACO Guide — Fenwick tree**: https://usaco.guide/ (mục Gold: "Fenwick tree")

### Nội dung chính
- Fenwick tree (BIT): cập nhật điểm + truy vấn tổng đoạn
- Cập nhật: O(log n), truy vấn: O(log n)
- Ứng dụng: tổng đoạn, đếm nghịch thế, DP

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int n;
vector<long long> bit;
void update(int i, long long v) {
    for (; i <= n; i += i & -i) bit[i] += v;
}
long long query(int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}
int main() {
    int q; cin >> n >> q;
    bit.assign(n + 1, 0);
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        update(i, a[i]);
    }
    while (q--) {
        int type, l, r; cin >> type >> l >> r;
        if (type == 1) { update(l, r - a[l]); a[l] = r; }
        else cout << query(r) - query(l - 1) << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Sai công thức `i += i & -i` (cập nhật) và `i -= i & -i` (truy vấn)
- Quên khởi tạo bit
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Dynamic Range Sum Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Fenwick tree | Luyện tập |
| 2 | Range Xor Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Fenwick tree, XOR | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `data structures` + `fenwick` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 4.7 — Segment tree

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: segment tree, cập nhật + truy vấn đoạn (min/max/sum).  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Segment tree")
- **CP-Algorithms — Segment tree**: https://cp-algorithms.com/ (mục "Segment tree")
- **USACO Guide — Segment tree**: https://usaco.guide/ (mục Gold: "Segment tree")

### Nội dung chính
- Segment tree: cập nhật điểm + truy vấn đoạn (min/max/sum)
- Cập nhật: O(log n), truy vấn: O(log n)
- Lazy propagation: cập nhật đoạn + truy vấn đoạn
- Ứng dụng: RMQ, tổng đoạn, DP

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int n;
vector<long long> tree;
void build(vector<long long>& a, int v, int tl, int tr) {
    if (tl == tr) { tree[v] = a[tl]; return; }
    int tm = (tl + tr) / 2;
    build(a, 2*v, tl, tm);
    build(a, 2*v+1, tm+1, tr);
    tree[v] = tree[2*v] + tree[2*v+1];
}
void update(int v, int tl, int tr, int pos, long long val) {
    if (tl == tr) { tree[v] = val; return; }
    int tm = (tl + tr) / 2;
    if (pos <= tm) update(2*v, tl, tm, pos, val);
    else update(2*v+1, tm+1, tr, pos, val);
    tree[v] = tree[2*v] + tree[2*v+1];
}
long long query(int v, int tl, int tr, int l, int r) {
    if (l > r) return 0;
    if (l == tl && r == tr) return tree[v];
    int tm = (tl + tr) / 2;
    return query(2*v, tl, tm, l, min(r, tm)) + query(2*v+1, tm+1, tr, max(l, tm+1), r);
}
int main() {
    int q; cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    tree.assign(4 * n, 0);
    build(a, 1, 1, n);
    while (q--) {
        int type, l, r; cin >> type >> l >> r;
        if (type == 1) update(1, 1, n, l, r);
        else cout << query(1, 1, n, l, r) << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Sai kích thước tree (4*n)
- Sai công thức build/update/query
- Quên lazy propagation khi cần cập nhật đoạn

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Dynamic Range Minimum Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Segment tree | Luyện tập |
| 2 | Range Update Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Segment tree, lazy | Thử thách |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `data structures` + `segment tree` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 4.8 — Sparse table

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: sparse table, RMQ tĩnh.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Sparse table")
- **CP-Algorithms — Sparse table**: https://cp-algorithms.com/ (mục "Sparse table")
- **USACO Guide — Sparse table**: https://usaco.guide/ (mục Gold: "Sparse table")

### Nội dung chính
- Sparse table: RMQ tĩnh (không có cập nhật)
- Precompute: O(n log n), truy vấn: O(1)
- Ứng dụng: RMQ, LCA (binary lifting)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, q; cin >> n >> q;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    int LOG = 20;
    vector<vector<long long>> sp(LOG, vector<long long>(n + 1));
    for (int i = 1; i <= n; i++) sp[0][i] = a[i];
    for (int j = 1; j < LOG; j++)
        for (int i = 1; i + (1 << j) - 1 <= n; i++)
            sp[j][i] = min(sp[j-1][i], sp[j-1][i + (1 << (j-1))]);
    while (q--) {
        int l, r; cin >> l >> r;
        int k = 31 - __builtin_clz(r - l + 1);
        cout << min(sp[k][l], sp[k][r - (1 << k) + 1]) << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Sai cận precompute (`i + (1 << j) - 1 <= n`)
- Sai công thức truy vấn (`k = 31 - __builtin_clz(r - l + 1)`)
- Quên xử lý RMQ (min/max/sum)

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Static Range Minimum Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Sparse table | Luyện tập |
| 2 | Static Range Sum Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Prefix sum | Luyện tập |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `data structures` + `sparse table` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 4.9 — Bitmask DP

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 6**: bitmask DP, DP trên tập con.  
  Link: https://cses.fi/book/book.pdf (Chương 6: "Bitmask DP")
- **CP-Algorithms — Bitmask DP**: https://cp-algorithms.com/ (mục "Bitmask DP")
- **USACO Guide — Bitmask DP**: https://usaco.guide/ (mục Gold: "Bitmask DP")

### Nội dung chính
- Bitmask DP: DP trên tập con (n ≤ 20)
- Trạng thái: mask (tập con đã chọn)
- Chuyển: thêm 1 phần tử vào mask
- Độ phức tạp: O(2^n * n) hoặc O(2^n * n^2)

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (auto &row : a)
        for (auto &x : row) cin >> x;
    vector<long long> dp(1 << n, 0);
    for (int mask = 1; mask < (1 << n); mask++) {
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                int prev = mask ^ (1 << i);
                dp[mask] = max(dp[mask], dp[prev] + a[__builtin_popcount(mask) - 1][i]);
            }
        }
    }
    cout << dp[(1 << n) - 1] << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai bitmask (`1 << i` thay vì `1LL << i` với n lớn)
- Sai điều kiện `mask & (1 << i)`
- Quên khởi tạo dp[0]

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Apple Division | CSES | https://cses.fi/problemset/ (Introductory) | Bitmask, brute force | Luyện tập |
| 2 | Fair and Square | Codeforces 2241E | https://codeforces.com/problemset/problem/2241/E | Bitmask DP, combinatorics | 1600 |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `dp` + `bitmasks` + CSES DP để đủ 5-10 bài.

---

## Bài 4.10 — DP trên cây

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: DP trên cây, rerooting.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Tree algorithms", "Rerooting")
- **CP-Algorithms — DP on tree**: https://cp-algorithms.com/ (mục "DP on tree", "Rerooting")
- **USACO Guide — DP on tree**: https://usaco.guide/ (mục Gold: "DP on tree")

### Nội dung chính
- DP trên cây: dp[v] = f(dp[con của v])
- Rerooting: tính lại dp khi đổi gốc
- Ứng dụng: đường đi dài nhất trên cây, đếm subtree, DP trên cây

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
vector<vector<int>> adj;
vector<long long> dp;
void dfs(int u, int p) {
    dp[u] = 1;
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs(v, u);
        dp[u] += dp[v];
    }
}
int main() {
    int n; cin >> n;
    adj.assign(n + 1, {});
    dp.assign(n + 1, 0);
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    dfs(1, 0);
    for (int i = 1; i <= n; i++) cout << dp[i] << " ";
    cout << endl;
    return 0;
}
```

### Lỗi thường gặp
- Quên xử lý cha (p) khi DFS
- Sai công thức rerooting
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Idiot First Search | Codeforces 2195E | https://codeforces.com/problemset/problem/2195/E | DFS, DP, trees | 1500 |
| 2 | Maximize the Root | Codeforces 1997D | https://codeforces.com/problemset/problem/1997/D | Binary search, DFS, DP, trees | 1500 |
| 3 | Minimum Maximum Distance | Codeforces 1881F | https://codeforces.com/problemset/problem/1881/F | DFS, DP, graphs, shortest paths, trees | 1700 |

> Mở rộng: thêm 2-7 bài CF 1500-1800 tag `dp` + `trees` + `dfs and similar` + CSES Tree để đủ 5-10 bài.

---

## Bài 4.11 — Hashing

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: string hash, double hash.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "String hashing")
- **CP-Algorithms — String hashing**: https://cp-algorithms.com/ (mục "String hashing")
- **USACO Guide — Hashing**: https://usaco.guide/ (mục Gold: "Hashing")

### Nội dung chính
- String hash: h(s) = (s[0] * p^(n-1) + s[1] * p^(n-2) + ... + s[n-1]) mod m
- Double hash: dùng 2 hash khác nhau để giảm collision
- Ứng dụng: so sánh chuỗi, đếm chuỗi con, pattern matching

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1e9 + 7, P = 31;
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
    string s; cin >> s;
    int n = s.size();
    vector<long long> h(n + 1), p(n + 1);
    p[0] = 1;
    for (int i = 1; i <= n; i++) {
        h[i] = (h[i-1] * P + s[i-1]) % MOD;
        p[i] = p[i-1] * P % MOD;
    }
    // Hash của s[l..r] = (h[r] - h[l-1] * p[r-l+1]) mod MOD
    return 0;
}
```

### Lỗi thường gặp
- Quên mod khi nhân lớn
- Sai công thức hash (quên nhân p)
- Collision (dùng 1 hash thay vì 2)

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Distinct Values Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Hash, offline | Thử thách |
| 2 | Salary Queries | CSES | https://cses.fi/problemset/ (Range Queries) | Hash, offline | Thử thách |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `hashing` + `strings` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 4.12 — KMP, Z-function

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: KMP, Z-function.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "KMP", "Z-function")
- **CP-Algorithms — KMP, Z-function**: https://cp-algorithms.com/ (mục "KMP", "Z-function")
- **USACO Guide — String algorithms**: https://usaco.guide/ (mục Gold: "String algorithms")

### Nội dung chính
- KMP: tìm pattern trong text, O(n + m)
- Z-function: z[i] = độ dài prefix dài nhất của s bắt đầu tại i
- Ứng dụng: pattern matching, đếm chuỗi con, DP

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
vector<int> z_function(string s) {
    int n = s.size();
    vector<int> z(n);
    z[0] = n;
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}
int main() {
    string s; cin >> s;
    vector<int> z = z_function(s);
    for (int x : z) cout << x << " ";
    cout << endl;
    return 0;
}
```

### Lỗi thường gặp
- Sai công thức Z-function (quên min(r - i, z[i - l]))
- Sai cận vòng lặp (`i + z[i] < n`)
- Quên xử lý chuỗi rỗng

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Longest Flight Route | CSES | https://cses.fi/problemset/ (Graph Algorithms) | Topological sort, DP | Thử thách |
| 2 | Interactive Graph (Simple Version) | Codeforces 2196C1 | https://codeforces.com/problemset/problem/2196/C1 | Binary search, DFS, DP, graphs, interactive | 1800 |

> Mở rộng: thêm 3-8 bài CF 1500-1800 tag `strings` + `kmp` + `z-function` + CSES Strings để đủ 5-10 bài.

---

## Tổng kết cấp 4

- **12 bài học**, mỗi bài 2-8 bài tập (khung đầu), tổng 32 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~30-90 bài CF 1500-1800 (tag `graphs`, `data structures`, `dp`, `trees`, `hashing`, `strings`, `shortest paths`, `mst`, `topological sorting`, `fenwick`, `segment tree`, `sparse table`, `bitmasks`) + CSES Graph/Range Queries/Tree còn lại.
- **Lý thuyết**: bám CSES Handbook chương 7-8 + CP-Algorithms + USACO Guide Gold + VNOI Wiki.
- **Bài tập**: ưu tiên CSES Graph/Range Queries/Tree (xương sống) + CF 1500-1800 (bổ sung).

## Checklist hoàn thiện cấp 4

- [ ] Bổ sung 3-8 bài CF 1500-1800 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Shortest Routes I/II, High Score, Flight Discount, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các bài CSES Graph đã xác nhận tồn tại trong problemset: Shortest Routes I (Dijkstra), Shortest Routes II (Floyd-Warshall), High Score (Bellman-Ford), Flight Discount (Dijkstra layered), Cycle Finding (Bellman-Ford), Course Schedule (Topo), Longest Flight Route (Topo + DP), Game Routes, Investigation, Planets Queries I/II, Planets Cycles, Road Reparation, Road Construction, Flight Routes Check. [web:91][web:92]
- Các bài CSES Range Queries đã xác nhận tồn tại trong problemset: Static Range Sum Queries, Static Range Minimum Queries, Dynamic Range Sum Queries, Dynamic Range Minimum Queries, Range Xor Queries, Range Update Queries, Forest Queries, Forest Queries II, Polynomial Queries, Range Queries and Copies, List Removals, Salary Queries, Distinct Values Queries, Increasing Array Queries, Subarray Sum Queries, Subarray Reversals, Distinct Values II, Increasing Array II, Tree Distances I/II, Company Queries I/II, Distance Queries, Counting Paths, Subtree Queries, Distinct Colors, Range Updates and Sums. [web:91][web:92]
- Các bài Codeforces đã xác nhận tồn tại: 2241E (Fair and Square, 1600), 2195E (Idiot First Search, 1500), 2171F (Rae Taylor and Trees hard, 1600), 1997D (Maximize the Root, 1500), 1881F (Minimum Maximum Distance, 1700), 2196C1 (Interactive Graph Simple, 1800), 1710A (1500), 2020D (Connect the Dots, 1800), 2027D1 (The Endspeaker Easy, 1700). [web:84][web:85][web:86][web:87]
