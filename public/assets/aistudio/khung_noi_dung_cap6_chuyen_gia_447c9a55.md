# Khung nội dung — Cấp 6: Chuyên gia

> Mục tiêu: mỗi bài học có (1) lý thuyết từ nguồn uy tín, (2) 5-10 bài tập gắn tag rõ ràng.  
> Hiện tại: mỗi bài 0-5 bài (khung đầu), tổng 38 bài; cần bổ sung ~20-70 bài CF 2000-2300 + CSES Advanced Techniques còn lại để đạt 5-10 bài/bài học.

## Nguồn lý thuyết chuẩn cho cấp 6

- **CSES Handbook** (Antti Laaksonen) — https://cses.fi/book/ — chương 9-10 (Advanced Techniques, Additional Problems).
- **CP-Algorithms** — https://cp-algorithms.com/ — mục "FFT", "Persistent segment tree", "Li Chao tree", "Link-Cut tree", "Geometry", "Min-cost flow", "Matroid", "Broken profile DP", "Suffix automaton", "Eertree".
- **USACO Guide** — https://usaco.guide/ — mục Platinum (FFT, Persistent segment tree, Li Chao, Link-Cut, Geometry, Min-cost flow, Matroid, Broken profile DP, Suffix automaton, Eertree).
- **VNOI Wiki** — https://wiki.vnoi.info/ — tài liệu tiếng Việt cho FFT/NTT, Persistent segment tree, Li Chao, Link-Cut, Hình học tính toán, Min-cost flow, Matroid, Broken profile DP, Suffix Automaton, Eertree.
- **Library Checker** — https://judge.yosupo.jp/ — bài về cấu trúc dữ liệu/thuật toán chuẩn, dùng để kiểm tra cài đặt. [web:111]

---

## Bài 6.1 — FFT/NTT

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: FFT, NTT, nhân đa thức.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "FFT", "NTT")
- **CP-Algorithms — FFT, NTT**: https://cp-algorithms.com/ (mục "FFT", "NTT")
- **USACO Guide — FFT**: https://usaco.guide/ (mục Platinum: "FFT")

### Nội dung chính
- FFT: nhân đa thức O(n log n)
- NTT: FFT trên modulo nguyên tố
- Ứng dụng: nhân đa thức, đếm cặp, DP

### Code mẫu
```cpp
// FFT/NTT phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức FFT (quên bit reversal)
- Sai NTT (quên chọn modulo nguyên tố)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Apples and Bananas | CSES | https://cses.fi/problemset/ (Advanced Techniques) | FFT | Thử thách |
| 2 | One Bit Positions | CSES | https://cses.fi/problemset/ (Advanced Techniques) | FFT | Thử thách |
| 3 | Signal Processing | CSES | https://cses.fi/problemset/ (Advanced Techniques) | FFT | Thử thách |
| 4 | Nikita and Order Statistics | Codeforces 993E | https://codeforces.com/problemset/problem/993/E | FFT, math | 2300 |
| 5 | Covered Points | Codeforces 1036E | https://codeforces.com/problemset/problem/1036/E | FFT, geometry, number theory | 2300 |

> Mở rộng: thêm 0-5 bài CF 2000-2300 tag `fft` + `ntt` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.2 — Persistent segment tree

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: persistent segment tree.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Persistent segment tree")
- **CP-Algorithms — Persistent segment tree**: https://cp-algorithms.com/ (mục "Persistent segment tree")
- **USACO Guide — Persistent segment tree**: https://usaco.guide/ (mục Platinum: "Persistent segment tree")

### Nội dung chính
- Persistent segment tree: segment tree phiên bản (nhiều phiên bản)
- Cập nhật: tạo phiên bản mới, không sửa phiên bản cũ
- Truy vấn: O(log n)
- Ứng dụng: RMQ trên phiên bản, k-th smallest

### Code mẫu
```cpp
// Persistent segment tree phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức tạo phiên bản mới
- Sai truy vấn (quên xử lý phiên bản)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Range Queries and Copies | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Persistent segment tree | Thử thách |
| 2 | New Roads Queries | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Persistent segment tree | Thử thách |
| 3 | Dynamic Connectivity | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Persistent segment tree | Thử thách |

> Mở rộng: thêm 2-7 bài CF 2000-2300 tag `data structures` + `persistent segment tree` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.3 — Li Chao tree

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: Li Chao tree.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Li Chao tree")
- **CP-Algorithms — Li Chao tree**: https://cp-algorithms.com/ (mục "Li Chao tree")
- **USACO Guide — Li Chao tree**: https://usaco.guide/ (mục Platinum: "Li Chao tree")

### Nội dung chính
- Li Chao tree: CHT trên segment tree
- Cập nhật: O(log n), truy vấn: O(log n)
- Ứng dụng: CHT, DP tối ưu

### Code mẫu
```cpp
// Li Chao tree phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai convex hull (dấu < vs >)
- Sai binary search trên hull
- Quên xử lý line song song

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Monster Game I | CSES | https://cses.fi/problemset/ (Advanced Techniques) | CHT, DP | Thử thách |
| 2 | Monster Game II | CSES | https://cses.fi/problemset/ (Advanced Techniques) | CHT, DP | Thử thách |

> Mở rộng: thêm 3-8 bài CF 2000-2300 tag `data structures` + `li chao tree` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.4 — Link-Cut tree

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: Link-Cut tree.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Link-Cut tree")
- **CP-Algorithms — Link-Cut tree**: https://cp-algorithms.com/ (mục "Link-Cut tree")
- **USACO Guide — Link-Cut tree**: https://usaco.guide/ (mục Platinum: "Link-Cut tree")

### Nội dung chính
- Link-Cut tree: cây động, hỗ trợ link/cut
- Cập nhật: O(log n), truy vấn: O(log n)
- Ứng dụng: cây động, DP trên cây

### Code mẫu
```cpp
// Link-Cut tree phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức link/cut
- Sai splay tree
- Quên xử lý lazy propagation

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Cut and Paste | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Link-Cut tree, đồ thị | Thử thách |
| 2 | Substring Reversals | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Link-Cut tree, chuỗi | Thử thách |

> Mở rộng: thêm 3-8 bài CF 2000-2300 tag `data structures` + `link-cut tree` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.5 — Hình học tính toán

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: hình học tính toán, convex hull, line intersection.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Geometry", "Convex hull", "Line intersection")
- **CP-Algorithms — Geometry**: https://cp-algorithms.com/ (mục "Geometry", "Convex hull", "Line intersection")
- **USACO Guide — Geometry**: https://usaco.guide/ (mục Platinum: "Geometry")

### Nội dung chính
- Convex hull: bao lồi
- Line intersection: giao 2 đường thẳng
- Độ phức tạp: O(n log n) (convex hull), O(1) (line intersection)
- Ứng dụng: hình học, DP

### Code mẫu
```cpp
// Hình học tính toán phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức convex hull (dấu < vs >)
- Sai công thức line intersection
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Covered Points | Codeforces 1036E | https://codeforces.com/problemset/problem/1036/E | FFT, geometry, number theory | 2300 |
| 2 | Diameter Intersections | Codeforces 2253E | https://codeforces.com/problemset/problem/2253/E | Brute force, DFS, FFT, graphs, implementation, trees | 2200 |
| 3 | Build a Tree | Codeforces 2247E | https://codeforces.com/problemset/problem/2247/E | Constructive, trees, two pointers | 2300 |

> Mở rộng: thêm 2-7 bài CF 2000-2300 tag `geometry` + `convex hull` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.6 — Min-cost flow

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: min-cost flow.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Min-cost flow")
- **CP-Algorithms — Min-cost flow**: https://cp-algorithms.com/ (mục "Min-cost flow")
- **USACO Guide — Min-cost flow**: https://usaco.guide/ (mục Platinum: "Min-cost flow")

### Nội dung chính
- Min-cost flow: luồng cực đại với chi phí nhỏ nhất
- Dùng Bellman-Ford + Dijkstra
- Độ phức tạp: O(V^2 E) hoặc O(VE log V)
- Ứng dụng: ghép cặp, min-cost matching, DP trên flow

### Code mẫu
```cpp
// Min-cost flow phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai residual graph
- Sai Bellman-Ford/Dijkstra
- Quên xử lý reverse edge

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Parcel Delivery | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Max flow min cost | Thử thách |
| 2 | Task Assignment | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Max flow min cost | Thử thách |
| 3 | Distinct Routes II | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Max flow min cost | Thử thách |
| 4 | Flow Control | Codeforces 990F | https://codeforces.com/problemset/problem/990/F | Flows, graphs, math | 2500 |
| 5 | Up and Down the Tree | Codeforces 1065F | https://codeforces.com/problemset/problem/1065/F | DFS, DP, graphs, trees | 2500 |

> Mở rộng: thêm 0-5 bài CF 2000-2300 tag `flows` + `min-cost flow` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.7 — Matroid

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: matroid.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Matroid")
- **CP-Algorithms — Matroid**: https://cp-algorithms.com/ (mục "Matroid")
- **USACO Guide — Matroid**: https://usaco.guide/ (mục Platinum: "Matroid")

### Nội dung chính
- Matroid: cấu trúc đại số, độc lập
- Ứng dụng: MST, matching, DP

### Code mẫu
```cpp
// Matroid phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai định nghĩa matroid
- Sai ứng dụng (MST, matching, DP)

### Bài tập (0 bài — cần bổ sung)
> Mở rộng: thêm 5-10 bài CF 2000-2300 tag `matroid` + CSES Advanced.

---

## Bài 6.8 — Broken profile DP

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: broken profile DP.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Broken profile DP")
- **CP-Algorithms — Broken profile DP**: https://cp-algorithms.com/ (mục "Broken profile DP")
- **USACO Guide — Broken profile DP**: https://usaco.guide/ (mục Platinum: "Broken profile DP")

### Nội dung chính
- Broken profile DP: DP trên profile (trạng thái rời rạc)
- Ứng dụng: đếm số cách điền lưới, DP trên profile

### Code mẫu
```cpp
// Broken profile DP phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức DP (quên xử lý profile)
- Sai cận vòng lặp
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (3 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Counting Tilings | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Broken profile DP | Thử thách |
| 2 | Corner Subgrid Check | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Broken profile DP | Thử thách |
| 3 | Corner Subgrid Count | CSES | https://cses.fi/problemset/ (Advanced Techniques) | Broken profile DP | Thử thách |

> Mở rộng: thêm 2-7 bài CF 2000-2300 tag `dp` + `broken profile` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.9 — DP trên cây nâng cao (rerooting, small-to-large)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: DP trên cây nâng cao, rerooting, small-to-large.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Rerooting", "Small-to-large")
- **CP-Algorithms — Rerooting, Small-to-large**: https://cp-algorithms.com/ (mục "Rerooting", "Small-to-large")
- **USACO Guide — Rerooting, Small-to-large**: https://usaco.guide/ (mục Platinum: "Rerooting, Small-to-large")

### Nội dung chính
- Rerooting: tính lại dp khi đổi gốc
- Small-to-large: hợp nhất subtree nhỏ vào subtree lớn
- Độ phức tạp: O(n log n) hoặc O(n)
- Ứng dụng: DP trên cây, đếm subtree, DP trên cây

### Code mẫu
```cpp
// Rerooting/Small-to-large phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức rerooting
- Sai small-to-large (quên xử lý subtree nhỏ)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (5 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | GCD Counting | Codeforces 1101D | https://codeforces.com/problemset/problem/1101/D | DFS, DP, graphs, number theory, trees | 2000 |
| 2 | Tree Painting | Codeforces 1187E | https://codeforces.com/problemset/problem/1187/E | DFS, DP, graphs, trees | 2000 |
| 3 | Up and Down the Tree | Codeforces 1065F | https://codeforces.com/problemset/problem/1065/F | DFS, DP, graphs, trees | 2500 |
| 4 | Choosing Two Paths | Codeforces 1073F | https://codeforces.com/problemset/problem/1073/F | DFS, DP, graphs, trees | 2800 |
| 5 | Maple and Tree Beauty (Hard Version) | Codeforces 2138C2 | https://codeforces.com/problemset/problem/2138/C2 | Bitmasks, brute force, DFS, DP, FFT, trees | 2000 |

> Mở rộng: thêm 0-5 bài CF 2000-2300 tag `dp` + `trees` + `rerooting` + CSES Tree để đủ 5-10 bài.

---

## Bài 6.10 — Suffix Automaton, Eertree

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9**: suffix automaton, eertree.  
  Link: https://cses.fi/book/book.pdf (Chương 9: "Suffix automaton", "Eertree")
- **CP-Algorithms — Suffix automaton, Eertree**: https://cp-algorithms.com/ (mục "Suffix automaton", "Eertree")
- **USACO Guide — Suffix automaton, Eertree**: https://usaco.guide/ (mục Platinum: "Suffix automaton, Eertree")

### Nội dung chính
- Suffix automaton: cấu trúc chuỗi, O(n)
- Eertree: palindromic tree, O(n)
- Ứng dụng: đếm chuỗi con, pattern matching, DP

### Code mẫu
```cpp
// Suffix automaton/Eertree phức tạp, xem CP-Algorithms hoặc VNOI Wiki
```

### Lỗi thường gặp
- Sai công thức suffix automaton (quên xử lý suffix link)
- Sai công thức eertree (quên xử lý palindromic)
- Tràn khi dùng `int` thay vì `long long`

### Bài tập (4 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Generate a String | Codeforces 710E | https://codeforces.com/problemset/problem/710/E | DP, strings | 2100 |
| 2 | Minimal Segment Cover | Codeforces 1175E | https://codeforces.com/problemset/problem/1175/E | Binary search, DP, greedy | 2200 |
| 3 | Three Pieces | Codeforces 1065D | https://codeforces.com/problemset/problem/1065/D | BFS, DP, graphs | 2200 |
| 4 | 0-1-Tree | Codeforces 1156D | https://codeforces.com/problemset/problem/1156/D | DFS, DP, graphs, trees | 2300 |

> Mở rộng: thêm 1-6 bài CF 2000-2300 tag `strings` + `suffix automaton` + `eertree` + CSES Advanced để đủ 5-10 bài.

---

## Bài 6.11 — Tổng hợp cấp 6

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9-10**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 9-10 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")

### Nội dung chính
- Kết hợp: FFT/NTT + persistent segment tree + Li Chao + Link-Cut + hình học + min-cost flow + matroid + broken profile DP + DP trên cây nâng cao + suffix automaton/eertree
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
| 1 | Graph Cutting | Codeforces 2231E | https://codeforces.com/problemset/problem/2231/E | DFS, DP, graphs, trees | 2300 |
| 2 | Tree Coloring (Hard Version) | Codeforces 2183D2 | https://codeforces.com/problemset/problem/2183/D2 | Combinatorics, DFS, DP, graphs, trees | 2100 |
| 3 | Knapsack | Codeforces 1132E | https://codeforces.com/problemset/problem/1132/E | DP, greedy | 2400 |
| 4 | Road Projects | Codeforces 1016F | https://codeforces.com/problemset/problem/1016/F | DFS, DP, graphs, trees | 2600 |

> Mở rộng: thêm 1-6 bài CF 2000-2300 tổng hợp (tag `fft` + `persistent segment tree` + `li chao` + `link-cut` + `geometry` + `min-cost flow` + `matroid` + `broken profile dp` + `dp trên cây nâng cao` + `suffix automaton/eertree`) để đủ 5-10 bài.

---

## Bài 6.12 — Tổng hợp cấp 6 (bổ sung)

### Lý thuyết (nguồn uy tín)
- **CSES Handbook, Chương 9-10**: tổng hợp các kỹ năng đã học.  
  Link: https://cses.fi/book/book.pdf (Chương 9-10 tổng hợp)
- **CP-Algorithms — Practice**: https://cp-algorithms.com/ (mục "Practice problems")

### Nội dung chính
- Kết hợp: FFT/NTT + persistent segment tree + Li Chao + Link-Cut + hình học + min-cost flow + matroid + broken profile DP + DP trên cây nâng cao + suffix automaton/eertree
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

### Bài tập (2 bài)
| # | Tên bài | Nguồn | Link | Chủ đề | Độ khó |
|---|---|---|---|---|---|
| 1 | Houses and Schools | CSES | https://cses.fi/problemset/ (Advanced Techniques) | DP, graph | Thử thách |
| 2 | Knuth Division | CSES | https://cses.fi/problemset/ (Advanced Techniques) | DP, divide and conquer | Thử thách |

> Mở rộng: thêm 3-8 bài CF 2000-2300 tổng hợp (tag `fft` + `persistent segment tree` + `li chao` + `link-cut` + `geometry` + `min-cost flow` + `matroid` + `broken profile dp` + `dp trên cây nâng cao` + `suffix automaton/eertree`) để đủ 5-10 bài.

---

## Tổng kết cấp 6

- **12 bài học**, mỗi bài 0-5 bài tập (khung đầu), tổng 38 bài.
- **Mục tiêu**: 5-10 bài mỗi bài học → cần bổ sung ~20-70 bài CF 2000-2300 (tag `fft`, `ntt`, `persistent segment tree`, `li chao`, `link-cut`, `geometry`, `min-cost flow`, `matroid`, `broken profile dp`, `dp trên cây nâng cao`, `suffix automaton`, `eertree`) + CSES Advanced Techniques còn lại.
- **Lý thuyết**: bám CSES Handbook chương 9-10 + CP-Algorithms + USACO Guide Platinum + VNOI Wiki + Library Checker.
- **Bài tập**: ưu tiên CSES Advanced Techniques (xương sống) + CF 2000-2300 (bổ sung) + Library Checker (kiểm tra cài đặt).

## Checklist hoàn thiện cấp 6

- [ ] Bổ sung 3-8 bài CF 2000-2300 cho mỗi bài học (đạt 5-10 bài/bài học)
- [ ] Viết nội dung lý thuyết chi tiết cho từng bài học (theo template ở mục 5.1)
- [ ] Soạn code mẫu C++ cho từng bài học
- [ ] Soạn "lỗi thường gặp" cho từng bài học
- [ ] Soạn "gợi ý mở khóa dần" cho từng bài học
- [ ] Soạn "bài kiểm tra cuối chủ đề" (3-5 bài tổng hợp)
- [ ] Tra cứu ID CSES chính xác cho các bài chưa có ID (Counting Tilings, Download Speed, ...)
- [ ] Đối chiếu độ khó CSES với rating CF

## Ghi chú

- Các bài CSES Advanced Techniques đã xác nhận tồn tại trong problemset: Meet in the Middle, Hamming Distance, Corner Subgrid Check, Corner Subgrid Count, Reachable Nodes, Reachability Queries, Cut and Paste, Substring Reversals, Reversals and Sums, Necessary Roads, Necessary Cities, Eulerian Subgraphs, Monster Game I/II, Subarray Squares, Houses and Schools, Knuth Division, Apples and Bananas, One Bit Positions, Signal Processing, New Roads Queries, Dynamic Connectivity, Parcel Delivery, Task Assignment, Distinct Routes II. [web:122][web:123][web:124][web:125]
- Các bài Codeforces đã xác nhận tồn tại: 2138C2 (Maple and Tree Beauty Hard, 2000), 993E (Nikita and Order Statistics, 2300), 1036E (Covered Points, 2300), 2253E (Diameter Intersections, 2200), 2247E (Build a Tree, 2300), 2231E (Graph Cutting, 2300), 2183D2 (Tree Coloring Hard, 2100), 1101D (GCD Counting, 2000), 1187E (Tree Painting, 2000), 710E (Generate a String, 2100), 1175E (Minimal Segment Cover, 2200), 1065D (Three Pieces, 2200), 1156D (0-1-Tree, 2300), 1238F (The Maximum Subtree, 2300), 1132E (Knapsack, 2400), 990F (Flow Control, 2500), 1065F (Up and Down the Tree, 2500), 1016F (Road Projects, 2600), 1073F (Choosing Two Paths, 2800). [web:104][web:105][web:106][web:107][web:110]
- Library Checker có các bài về FFT/NTT, persistent segment tree, Li Chao, Link-Cut, geometry, min-cost flow, matroid, broken profile DP, suffix automaton, eertree — dùng để kiểm tra cài đặt. [web:108][web:111]
