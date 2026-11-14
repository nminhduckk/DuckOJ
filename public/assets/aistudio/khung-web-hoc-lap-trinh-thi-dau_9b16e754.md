# Khung dự án: Web học lập trình thi đấu (CP) từ cơ bản đến nâng cao

> Phiên bản: 0.1 (khung cơ bản, chưa có code)
> Mục đích: thống nhất phạm vi, lộ trình, nguồn nội dung và chức năng trước khi bắt tay xây dựng.

---

## 1. Mục tiêu và đối tượng

**Mục tiêu:** giúp người học đi từ chưa biết gì đến giải được bài mức Codeforces Div.1 / IOI, theo một lộ trình có thứ tự, có bài tập chuẩn và có theo dõi tiến độ.

**Đối tượng:**
- Học sinh THCS/THPT chuẩn bị thi HSG Tin học, OLP, IOI.
- Sinh viên chuẩn bị ICPC, tuyển dụng.
- Người tự học muốn luyện tư duy thuật toán.

**Ngôn ngữ chính:** C++ (chuẩn trong thi đấu). Python/Java là tùy chọn.

**Nguyên tắc nội dung:**
1. Mọi bài tập phải có nguồn gốc rõ ràng, link về đề gốc.
2. Mọi kiến thức lý thuyết phải đối chiếu được với tài liệu uy tín.
3. Mọi bài tập gắn với một chủ đề, một mức độ khó và điều kiện tiên quyết.

---

## 2. Tổng quan lộ trình

| Cấp | Tên | Thời lượng gợi ý | Mốc tham khảo (Codeforces) |
|---|---|---|---|
| 0 | Nhập môn | 2-3 tuần | Chạy đúng code C++ cơ bản |
| 1 | Cơ bản | 1-2 tháng | ~800-1000 |
| 2 | Cơ bản+ | 1-2 tháng | ~1000-1200 |
| 3 | Trung cấp 1 | 2-3 tháng | ~1200-1500 |
| 4 | Trung cấp 2 | 2-3 tháng | ~1500-1800 |
| 5 | Nâng cao | 3-6 tháng | ~1800-2100 |
| 6 | Chuyên gia | Dài hạn | 2100+ |

*Thời lượng và mốc rating chỉ là ước lượng để định hướng, không phải cam kết.*

---

## 3. Chủ đề theo từng cấp

| Cấp | Chủ đề chính |
|---|---|
| 0 | Cú pháp C++, vào/ra, kiểu dữ liệu và tràn số, vòng lặp, mảng, hàm, đọc đề, độ phức tạp |
| 1 | Brute force, sắp xếp, xử lý chuỗi cơ bản, toán cơ bản (ƯCLN, BCNN, modulo), mô phỏng, ad hoc |
| 2 | STL, prefix sum, hai con trỏ, tìm kiếm nhị phân (kể cả trên đáp án), tham lam cơ bản |
| 3 | DP cơ bản (knapsack, LIS, LCS, edit distance), DFS/BFS, DSU, sàng nguyên tố, lũy thừa nhanh, tổ hợp mod p |
| 4 | Dijkstra, Bellman-Ford, Floyd-Warshall, MST, sắp xếp topo, Fenwick, Segment tree, Sparse table, bitmask DP, DP trên cây, hashing, KMP, Z-function |
| 5 | LCA, HLD, centroid decomposition, SCC, cầu/khớp, max flow, ghép cặp, CHT, D&C optimization, Mo, sqrt decomposition, Sprague-Grundy, Suffix Array, Aho-Corasick |
| 6 | FFT/NTT, persistent segment tree, Li Chao, Link-Cut, hình học tính toán, min-cost flow, matroid, broken profile DP |

---

## 4. Nguồn thông tin và bài tập uy tín

> Nguyên tắc: **chỉ dùng nguồn có tổ chức rõ ràng, có hệ thống chấm hoặc đề thi chính thức.** Mỗi bài trong web phải ghi tên nguồn và link về đề gốc.

### 4.1. Nguồn bài tập

| Nguồn | Link | Đặc điểm | Dùng cho cấp |
|---|---|---|---|
| **CSES Problem Set** | cses.fi/problemset | Bộ bài chuẩn, phân nhóm theo chủ đề, tác giả Antti Laaksonen. Rất phù hợp làm xương sống lộ trình | 0-5 |
| **Codeforces** (Problemset, Educational Rounds) | codeforces.com | Kho bài lớn nhất, có rating độ khó, tag chủ đề, editorial | 1-6 |
| **Codeforces EDU** | codeforces.com/edu/courses | Khóa học có bài giảng và bài tập từ Codeforces | 2-5 |
| **AtCoder** (ABC / ARC / AGC) | atcoder.jp | Đề chất lượng cao, testcase chặt, có editorial. Có sẵn *Educational DP Contest* và *Typical 90 Problems* | 2-6 |
| **USACO** và **USACO Guide** | usaco.org, usaco.guide | Đề thi chính thức cho học sinh, USACO Guide có lộ trình bài tập theo chủ đề | 1-5 |
| **VNOJ** | oj.vnoi.info | Hệ thống chấm tiếng Việt, đề HSG, OLP, VNOI | 0-6 |
| **Đề thi chính thức** (IOI, ICPC, OLP Tin học, HSG quốc gia) | trang của ban tổ chức | Đề thật, độ tin cậy cao nhất | 4-6 |
| **Library Checker** | judge.yosupo.jp | Bài về cấu trúc dữ liệu/thuật toán chuẩn, dùng để kiểm tra cài đặt | 4-6 |
| **Kattis** | open.kattis.com | Đề từ các cuộc thi ICPC khu vực | 2-5 |

### 4.2. Nguồn lý thuyết

| Tài liệu | Link / Tác giả | Ghi chú |
|---|---|---|
| **Competitive Programmer's Handbook** | Antti Laaksonen (cses.fi/book) | Miễn phí, ngắn gọn, bám sát CSES. Nên dùng làm giáo trình lõi |
| **CP-Algorithms** | cp-algorithms.com | Giải thích thuật toán chi tiết, có code và bài tập đi kèm |
| **USACO Guide** | usaco.guide | Giải thích theo cấp Bronze đến Platinum |
| **VNOI Wiki** | wiki.vnoi.info | Tài liệu tiếng Việt về thuật toán |
| **Competitive Programming 4** | Steven Halim, Felix Halim | Sách tham khảo, bao quát |
| **Introduction to Algorithms (CLRS)** | Cormen và cộng sự | Nền tảng lý thuyết, dùng khi cần chứng minh chặt |

### 4.3. Quy tắc chọn và kiểm duyệt bài tập

Một bài chỉ được đưa vào web khi thỏa **tất cả**:

- [ ] Có nguồn gốc xác định (tên cuộc thi/bộ bài, năm, link đề gốc).
- [ ] Có lời giải chính thức hoặc editorial đáng tin để tham chiếu.
- [ ] Được gán đúng chủ đề và mức khó (xem 4.4).
- [ ] Đã được người duyệt (reviewer) kiểm tra thủ công một lần.
- [ ] Rõ ràng về quyền sử dụng (xem mục 9).

### 4.4. Cách gán độ khó

- Bài từ Codeforces: dùng rating công khai của bài.
- Bài từ CSES, USACO, AtCoder, VNOJ: không có thang chung, nên **tự gán theo cấp (0-6)** dựa trên chủ đề và đối chiếu với các bài tương đương có rating.
- Mỗi bài có **một cấp** và **một nhãn khó trong cấp** (Khởi động / Luyện tập / Thử thách).
- Độ khó là ước lượng, cần được hiệu chỉnh dần theo tỉ lệ giải đúng của người học trên web.

---

## 5. Cấu trúc một bài học (Lesson)

1. Mục tiêu học
2. Điều kiện tiên quyết (liên kết đến bài trước)
3. Lý thuyết (kèm nguồn tham khảo)
4. Code mẫu C++ và độ phức tạp
5. Lỗi thường gặp
6. Bài tập theo bậc: Khởi động → Luyện tập → Thử thách
7. Gợi ý mở khóa dần: gợi ý 1 → gợi ý 2 → ý tưởng → code
8. Bài kiểm tra cuối chủ đề

## 6. Cấu trúc một bài tập (Problem) — các trường bắt buộc

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã nội bộ |
| `title` | Tên bài |
| `source` | Tên nguồn (CSES, Codeforces, ...) |
| `source_url` | Link đề gốc |
| `source_id` | Mã bài ở nguồn gốc (ví dụ 4A) |
| `year` | Năm xuất hiện (nếu có) |
| `level` | Cấp 0-6 |
| `difficulty` | Rating gốc hoặc nhãn Khởi động / Luyện tập / Thử thách |
| `topics` | Danh sách chủ đề |
| `prerequisites` | Bài học/chủ đề cần học trước |
| `editorial_url` | Link lời giải chính thức |
| `license_note` | Ghi chú quyền sử dụng |
| `reviewed_by`, `reviewed_at` | Người và thời điểm duyệt |

*Giai đoạn đầu khuyến nghị lưu **metadata và link ra nguồn gốc**, không sao chép toàn bộ đề, trừ khi có quyền (xem mục 9).*

---

## 7. Chức năng web

### Giai đoạn 1: MVP
- Trang lộ trình (cây kỹ năng 7 cấp)
- Trang bài học (lý thuyết + danh sách bài tập)
- Danh sách bài tập, lọc theo cấp, chủ đề, nguồn
- Đăng ký, đăng nhập
- Đánh dấu bài đã làm, theo dõi tiến độ theo chủ đề
- Liên kết ra hệ thống chấm của nguồn gốc để nộp bài

### Giai đoạn 2: Chấm bài tích hợp
- Trình soạn code trên web
- Chấm tự động trong sandbox
- Lịch sử nộp bài, kết quả theo từng test
- Gợi ý mở khóa dần

### Giai đoạn 3: Nâng cao
- Kiểm tra đầu vào để xếp cấp
- Ôn tập lặp lại ngắt quãng cho bài từng sai
- Contest ảo, bảng xếp hạng
- Biểu đồ điểm mạnh/yếu theo chủ đề
- Bình luận, diễn đàn, blog lời giải

---

## 8. Kiến trúc kỹ thuật (mức tổng quan)

| Thành phần | Gợi ý |
|---|---|
| Frontend | Next.js / React, Monaco Editor |
| Backend | Node.js hoặc FastAPI |
| Cơ sở dữ liệu | PostgreSQL |
| Nội dung bài viết | Markdown + KaTeX (công thức) |
| Chấm bài (giai đoạn 2) | Judge0 hoặc Piston, chạy trong sandbox cô lập |
| Lưu trữ file testcase | Object storage (S3 hoặc tương đương) |

Các thực thể chính: `User`, `Track/Level`, `Lesson`, `Problem`, `Submission`, `Progress`, `Contest`.

---

## 9. Bản quyền và đạo đức nội dung

- Đề bài thuộc quyền của đơn vị tổ chức/tác giả. **Không tự ý sao chép hàng loạt**; ưu tiên link về đề gốc.
- Trước khi đăng lại đề hay lời giải của bất kỳ nguồn nào, **kiểm tra điều khoản sử dụng** của nguồn đó hoặc xin phép bằng văn bản.
- Lời giải, giải thích và code mẫu trên web nên do đội ngũ tự viết; nếu tham khảo, phải ghi nguồn.
- Luôn ghi rõ nguồn ở mỗi bài và mỗi đoạn lý thuyết có tham khảo.
- Có kênh báo lỗi/báo vi phạm nội dung và quy trình gỡ bỏ nhanh.

---

## 10. Lộ trình triển khai dự án

| Bước | Công việc | Kết quả |
|---|---|---|
| 1 | Chốt khung (tài liệu này), đối chiếu nguồn | Danh sách nguồn đã duyệt |
| 2 | Lập danh mục bài tập cho cấp 0-3 (metadata + link) | ~100-150 bài có gán nhãn |
| 3 | Viết nội dung lý thuyết cấp 0-3 | Bài học hoàn chỉnh |
| 4 | Dựng MVP web | Bản chạy được, chưa chấm bài |
| 5 | Thử nghiệm với nhóm người học nhỏ, lấy phản hồi | Hiệu chỉnh độ khó và lộ trình |
| 6 | Mở rộng cấp 4-6, thêm chấm bài | Bản đầy đủ giai đoạn 2 |

---

## 11. Việc cần chốt tiếp

- [ ] Đối tượng chính: học sinh phổ thông hay sinh viên?
- [ ] Ngôn ngữ giao diện: chỉ tiếng Việt hay thêm tiếng Anh?
- [ ] Bài tập: link ra ngoài hay tự lưu đề (cần xin phép)?
- [ ] Chấm bài: dùng hệ thống ngoài hay tự dựng?
- [ ] Ai chịu trách nhiệm duyệt nội dung?
