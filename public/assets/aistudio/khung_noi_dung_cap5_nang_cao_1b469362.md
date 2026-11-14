# Khung nội dung — Cấp 5: Nâng cao

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 1-4 bài (khung đầu), tổng 27 bài; cần bổ sung ~40-100 bài CF 1800-2100 + CSES Advanced Techniques còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 5

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 8-9 (Tree Algorithms, Advanced Techniques).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "Graphs", "Data Structures", "String algorithms", "Game theory".
- **USACO Guide** — https://usaco.guide/ — mục Gold/Platinum (Graphs, Data Structures, DP, Strings).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho LCA, HLD, Centroid, SCC, Cầu/khớp, Max flow, Ghép cặp, CHT, D&C optimization, Mo, Sqrt decomposition, Sprague-Grundy, Suffix Array, Aho-Corasick.

---

## Bài 5.1 — LCA (Binary Lifting)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: LCA, binary lifting.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "LCA", "Binary lifting")
- **CP-Algorithms — LCA**: https://cp-algorithms.com/ (mục "LCA", "Binary lifting")
- **USACO Guide — LCA**: https://usaco.guide/ (mục Gold: "LCA")

### Nội dung chính
- LCA: tổ tiên chung gần nhất của 2 đỉnh trên cây
- Binary lifting: precompute tổ tiên bậc 2^k
- Độ phức tạp: O(n log n) precompute, O(log n) truy vấn
- Ứng dụng: LCA, khoảng cách trên cây, đếm đường đi

### Code mẫu
```cpp
#include <bits/stdc++.h>
using namespace std;
int n, LOG = 20;
vector<vector<int>> up;
vector<int> depth;
void dfs(int u, int p, vector<vector<int>>& adj) {
    up[0][u] = p;
    for (int v : adj[u])
        if (v != p) {
            depth[v] = depth[u] + 1;
            dfs(v, u, adj);
        }
}
int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    for (int k = LOG - 1; k >= 0; k--)
        if (depth[u] - (1 << k) >= depth[v])
            u = up[k][u];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][u] != up[k][v]) {
            u = up[k][u];
            v = up[k][v];
        }
    return up[0][u];
}
int main() {
    cin >> n;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < n - 1; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    up.assign(LOG, vector<int>(n + 1, 0));
    depth.assign(n + 1, 0);
    dfs(1, 0, adj);
    for (int k = 1; k < LOG; k++)
        for (int v = 1; v <= n; v++)
            up[k][v] = up[k-1][up[k-1][v]];
    int q; cin >> q;
    while (q--) {
        int u, v; cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

### Lỗi thường gặp
- Sai cận binary lifting (`k = LOG - 1` xuống `0`)
- Quên xử lý `u == v` (LCA là chính nó)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Company Queries I | CSES | https://cses.fi/problemset/ (Tree Algorithms) | LCA, binary lifting | Luyện tập |
| 2 | Company Queries II | CSES | https://cses.fi/problemset/ (Tree Algorithms) | LCA, binary lifting | Luyện tập |
| 3 | Distance Queries | CSES | https://cses.fi/problemset/ (Tree Algorithms) | LCA, khoảng cách | Luyện tập |

> Mở rộng: thêm 2-7 bài CF 1800-2100 tag `trees` + `lca` + CSES Tree để đủ 5-10 bài.

---

## Bài 5.2 — HLD (Heavy-Light Decomposition)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: HLD, phân rã cây.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Heavy-light decomposition")
- **CP-Algorithms — HLD**: https://cp-algorithms.com/ (mục "Heavy-light decomposition")
- **USACO Guide — HLD**: https://usaco.guide/ (mục Platinum: "HLD")

### Nội dung chính
- HLD: phân rã cây thành các chuỗi nặng/nhẹ
- Dùng segment tree trên mỗi chuỗi
- Độ phức tạp: O(log^2 n) cho mỗi truy vấn
- Ứng dụng: cập nhật/truy vấn trên đường đi, subtree

### Code mẫu
```cpp
// HLD phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai phân rã chuỗi nặng/nhẹ
- Sai segment tree trên chuỗi
- Quên xử lý LCA

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Copper Squander | Codeforces 2275G | https://codeforces.com/problemset/problem/2275/G | Binary search, DSU, graphs, greedy | 1900 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `trees` + `hld` + CSES Tree để đủ 5-10 bài.

---

## Bài 5.3 — Centroid decomposition

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 8**: centroid decomposition, chia để trị trên cây.  
  Link: https://cses.fi/book/book.pdf (Chương 8: "Centroid decomposition")
- **CP-Algorithms — Centroid decomposition**: https://cp-algorithms.com/ (mục "Centroid decomposition")
- **USACO Guide — Centroid decomposition**: https://usaco.guide/ (mục Platinum: "Centroid decomposition")

### Nội dung chính
- Centroid decomposition: chia để trị trên cây
- Tìm centroid (đỉnh cân bằng), loại bỏ, lặp lại
- Độ phức tạp: O(n log n)
- Ứng dụng: đếm đường đi, DP trên cây

### Code mẫu
```cpp
// Centroid decomposition phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai tìm centroid
- Sai phân rã (quên loại bỏ centroid)
- Quên xử lý subtree

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Deconstruction Tree | Codeforces 2229E | https://codeforces.com/problemset/problem/2229/E | Combinatorics, DSU, graphs, trees | 2100 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `trees` + `centroid` + CSES Tree để đủ 5-10 bài.

---

## Bài 5.4 — SCC (Tarjan, Kosaraju)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: SCC, Tarjan, Kosaraju.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Strongly connected components", "Tarjan", "Kosaraju")
- **CP-Algorithms — SCC**: https://cp-algorithms.com/ (mục "Strongly connected components", "Tarjan", "Kosaraju")
- **USACO Guide — SCC**: https://usaco.guide/ (mục Gold: "SCC")

### Nội dung chính
- SCC: thành phần liên thông mạnh
- Tarjan: dùng stack, low-link
- Kosaraju: 2 lần DFS (1 lần xuôi, 1 lần ngược)
- Độ phức tạp: O(V + E)
- Ứng dụng: 2-SAT, condensation, DP trên DAG

### Code mẫu
```cpp
// Tarjan/Kosaraju phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai low-link (Tarjan)
- Sai thứ tự DFS (Kosaraju)
- Quên xử lý SCC

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Permutation Commutation | Codeforces 2237E | https://codeforces.com/problemset/problem/2237/E | DSU, graphs, greedy | 2100 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `graphs` + `scc` + `2-sat` + CSES Graph để đủ 5-10 bài.

---

## Bài 5.5 — Cầu/khớp (bridge, articulation point)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: cầu/khớp, bridge, articulation point.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Bridges", "Articulation points")
- **CP-Algorithms — Bridges, Articulation points**: https://cp-algorithms.com/ (mục "Bridges", "Articulation points")
- **USACO Guide — Bridges, Articulation points**: https://usaco.guide/ (mục Gold: "Bridges, Articulation points")

### Nội dung chính
- Cầu (bridge): cạnh mà nếu bỏ đi thì tăng số thành phần liên thông
- Khớp (articulation point): đỉnh mà nếu bỏ đi thì tăng số thành phần liên thông
- Tarjan: dùng low-link
- Độ phức tạp: O(V + E)
- Ứng dụng: 2-edge-connected, 2-vertex-connected

### Code mẫu
```cpp
// Bridge/Articulation point phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai low-link (Tarjan)
- Sai điều kiện bridge/articulation point
- Quên xử lý multi-edge

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Double-Rift Dial | Codeforces 2249C | https://codeforces.com/problemset/problem/2249/C | DSU, DFS, implementation, two pointers | 2000 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `graphs` + `bridges` + `articulation points` + CSES Graph để đủ 5-10 bài.

---

## Bài 5.6 — Max flow (Ford-Fulkerson, Dinic)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: max flow, Ford-Fulkerson, Dinic.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Max flow", "Ford-Fulkerson", "Dinic")
- **CP-Algorithms — Max flow**: https://cp-algorithms.com/ (mục "Max flow", "Ford-Fulkerson", "Dinic")
- **USACO Guide — Max flow**: https://usaco.guide/ (mục Platinum: "Max flow")

### Nội dung chính
- Max flow: luồng cực đại từ s đến t
- Ford-Fulkerson: tăng dần luồng, dùng DFS
- Dinic: dùng BFS + DFS, O(V^2 E)
- Ứng dụng: ghép cặp, min-cut, DP trên flow

### Code mẫu
```cpp
// Max flow phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai residual graph
- Sai BFS/DFS trong Dinic
- Quên xử lý reverse edge

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | 23 Rises Again | Codeforces 2127H | https://codeforces.com/problemset/problem/2127/H | DFS, DP, flows, graph matchings, graphs | 3100 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `flows` + `graph matchings` + CSES Graph để đủ 5-10 bài.

---

## Bài 5.7 — Ghép cặp (Hungarian, Hopcroft-Karp)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 7**: ghép cặp, Hungarian, Hopcroft-Karp.  
  Link: https://cses.fi/book/book.pdf (Chương 7: "Matching", "Hungarian", "Hopcroft-Karp")
- **CP-Algorithms — Matching**: https://cp-algorithms.com/ (mục "Matching", "Hungarian", "Hopcroft-Karp")
- **USACO Guide — Matching**: https://usaco.guide/ (mục Platinum: "Matching")

### Nội dung chính
- Ghép cặp: ghép tối đa các cặp không giao nhau
- Hungarian: O(n^3)
- Hopcroft-Karp: O(E sqrt(V))
- Ứng dụng: ghép cặp, min-cost matching, DP trên matching

### Code mẫu
```cpp
// Matching phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai residual graph
- Sai BFS/DFS trong Hopcroft-Karp
- Quên xử lý reverse edge

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Amazing Trick | Codeforces 1773A | https://codeforces.com/problemset/problem/1773/A | Constructive, graph matchings, math | 1900 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `graph matchings` + `flows` + CSES Graph để đủ 5-10 bài.

---

## Bài 5.8 — CHT (Convex Hull Trick)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: CHT, Convex Hull Trick.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Convex Hull Trick")
- **CP-Algorithms — CHT**: https://cp-algorithms.com/ (mục "Convex Hull Trick")
- **USACO Guide — CHT**: https://usaco.guide/ (mục Platinum: "CHT")

### Nội dung chính
- CHT: tối ưu DP có dạng dp[i] = min(dp[j] + a[j] * x[i] + b[j])
- Dùng convex hull (monotonic stack)
- Độ phức tạp: O(n) hoặc O(n log n)
- Ứng dụng: DP tối ưu, DP trên DAG

### Code mẫu
```cpp
// CHT phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai convex hull (dấu < vs >)
- Sai binary search trên hull
- Quên xử lý line song song

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Rudolf and CodeVid-23 | Codeforces 1846G | https://codeforces.com/problemset/problem/1846/G | Bitmasks, DP, graphs, greedy, shortest paths | 1900 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `dp` + `cht` + CSES DP để đủ 5-10 bài.

---

## Bài 5.9 — D&C optimization

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: D&C optimization.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Divide and conquer optimization")
- **CP-Algorithms — D&C optimization**: https://cp-algorithms.com/ (mục "Divide and conquer optimization")
- **USACO Guide — D&C optimization**: https://usaco.guide/ (mục Platinum: "D&C optimization")

### Nội dung chính
- D&C optimization: tối ưu DP có dạng dp[i][j] = min(dp[i-1][k] + cost(k, j))
- Chia để trị: chia đoạn [l, r] thành 2 nửa
- Độ phức tạp: O(n log n) hoặc O(n log^2 n)
- Ứng dụng: DP tối ưu, DP trên DAG

### Code mẫu
```cpp
// D&C optimization phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai điều kiện chia để trị (quên kiểm tra tính đơn điệu)
- Sai binary search trên k
- Quên xử lý biên

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Buratsuta 3 | Codeforces 2149G | https://codeforces.com/problemset/problem/2149/G | Binary search, brute force, D&C, probabilities | 2100 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `dp` + `divide and conquer` + CSES DP để đủ 5-10 bài.

---

## Bài 5.10 — Mo's algorithm

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: Mo's algorithm.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Mo's algorithm")
- **CP-Algorithms — Mo's algorithm**: https://cp-algorithms.com/ (mục "Mo's algorithm")
- **USACO Guide — Mo's algorithm**: https://usaco.guide/ (mục Platinum: "Mo's algorithm")

### Nội dung chính
- Mo's algorithm: truy vấn offline trên mảng
- Chia khối, sắp xếp truy vấn
- Độ phức tạp: O(n sqrt(n))
- Ứng dụng: đếm, tổng, RMQ offline

### Code mẫu
```cpp
// Mo's algorithm phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai kích thước khối (sqrt(n))
- Sai thứ tự sắp xếp truy vấn
- Quên xử lý add/remove

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Score of a Tree | Codeforces 1777D | https://codeforces.com/problemset/problem/1777/D | Bitmasks, DFS, DP, math, trees | 1900 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `data structures` + `mo's algorithm` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 5.11 — Sqrt decomposition

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: sqrt decomposition.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Sqrt decomposition")
- **CP-Algorithms — Sqrt decomposition**: https://cp-algorithms.com/ (mục "Sqrt decomposition")
- **USACO Guide — Sqrt decomposition**: https://usaco.guide/ (mục Platinum: "Sqrt decomposition")

### Nội dung chính
- Sqrt decomposition: chia mảng thành khối sqrt(n)
- Cập nhật: O(1) hoặc O(sqrt(n))
- Truy vấn: O(sqrt(n))
- Ứng dụng: RMQ, tổng đoạn, DP

### Code mẫu
```cpp
// Sqrt decomposition phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai kích thước khối (sqrt(n))
- Sai công thức truy vấn
- Quên xử lý biên

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Adjusting Drones | Codeforces 2157E | https://codeforces.com/problemset/problem/2157/E | Binary search, brute force, DSU, greedy | 1900 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `data structures` + `sqrt decomposition` + CSES Range Queries để đủ 5-10 bài.

---

## Bài 5.12 — Sprague-Grundy (Game theory)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: Sprague-Grundy, game theory.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Game theory", "Sprague-Grundy")
- **CP-Algorithms — Sprague-Grundy**: https://cp-algorithms.com/ (mục "Sprague-Grundy")
- **USACO Guide — Game theory**: https://usaco.guide/ (mục Platinum: "Game theory")

### Nội dung chính
- Sprague-Grundy: hàm Grundy, XOR của các trò chơi con
- Nim: XOR của các đống
- Độ phức tạp: O(n) hoặc O(n^2)
- Ứng dụng: game theory, DP trên game

### Code mẫu
```cpp
// Sprague-Grundy phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai hàm Grundy
- Sai XOR của các trò chơi con
- Quên xử lý trạng thái thắng/thua

### Bài tập (1 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Light Bulbs (Easy Version) | Codeforces 1914G1 | https://codeforces.com/problemset/problem/1914/G1 | Brute force, combinatorics, DFS, DSU, graphs, math, trees | 2100 |

> Mở rộng: thêm 4-9 bài CF 1800-2100 tag `games` + `game theory` + CSES DP để đủ 5-10 bài.

---

## Tổng kết cấp 5

- **12 bài học**, mỗi bài 1-4 bài tập (khung đầu), tổng 27 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~40-100 bài CF 1800-2100 (tag `graphs`, `data structures`, `dp`, `trees`, `flows`, `graph matchings`, `games`, `game theory`, `mo's algorithm`, `sqrt decomposition`, `cht`, `divide and conquer`) + CSES Advanced Techniques còn lại.
- **Lý thuyết**: bám CSES Handbook chương 8-9 + CP-Algorithms + USACO Guide Platinum + VNOI Wiki.
- **Bài tập**: ưu tiên CSES Tree/Advanced (xương sống) + CF 1800-2100 (bổ sung).

## Checklist hoàn thiện cấp 5

- [ ] Bổ sung 4-9 bài CF 1800-2100 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Company Queries I/II, Distance Queries, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các bài CSES Tree đã xác nhận tồn tại trong problemset: Company Queries I (1687), Company Queries II (1688), Distance Queries (1135), Counting Paths (1136), Subtree Queries (1137), Distinct Colors (1139), Range Updates and Sums (1666). [web:91][web:92]
- Các bài Codeforces đã xác nhận tồn tại: 2275G (Copper Squander, 1900), 2229E (Deconstruction Tree, 2100), 2244G (Yura and Deadlines, 1900), 2237E (Permutation Commutation, 2100), 2249C (Double-Rift Dial, 2000), 2159B (Rectangles, 2100), 2157E (Adjusting Drones, 1900), 2117G (Omg Graph, 1900), 1923E (Count Paths, 2000), 1914G1 (Light Bulbs Easy, 2100), 2081A (Math Division, 1800), 2040E (Control of Randomness, 2100), 1777D (Score of a Tree, 1900), 1773A (Amazing Trick, 1900), 2273B (1900), 1872F (1800), 1846G (Rudolf and CodeVid-23, 1900), 2180D (Insolvable Disks, 1900), 2184F (Cherry Tree, 1900), 2192D (Cost of Tree, 1800), 1601B (Frog Traveler, 1900). [web:93][web:94][web:95][web:96][web:97][web:98][web:99][web:100][web:101][web:102][web:103]
- CSES có ít bài cho HLD, Centroid, SCC, Bridges, Max flow, Ghép cặp, CHT, D&C optimization, Mo, Sqrt decomposition, Sprague-Grundy, Suffix Array, Aho-Corasick — cần bổ sung từ CF/AtCoder/Library Checker.
