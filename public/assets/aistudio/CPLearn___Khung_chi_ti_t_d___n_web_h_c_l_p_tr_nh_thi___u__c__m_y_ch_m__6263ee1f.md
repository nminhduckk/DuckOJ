# CPLearn — Khung chi tiết dự án web học lập trình thi đấu (có máy chấm)

> **Phiên bản 1.0 · 14/11/2026 · Đây là FILE CHÍNH của dự án.** Kiến trúc, schema, API, máy chấm, bộ test, cấu trúc thư mục và lộ trình đều nằm ở đây. `CPLearn` là tên tạm, chỉ cấu hình ở biến `APP_NAME`.

## Kiến trúc trong 30 giây

```text
Trình duyệt ─ Next.js (web) ─ FastAPI (api) ─┬─ PostgreSQL : dữ liệu + hàng đợi chấm (SKIP LOCKED)
                                             ├─ MinIO      : gói test (tải bằng presigned URL)
                                             └─ Redis      : rate-limit, cache
judge-worker ×N (máy Linux riêng, sandbox isolate) ── HTTPS, tự kéo việc ──▶ /internal/judge/*
        (worker không giữ mật khẩu DB, không giữ khóa MinIO)
```

Ba nguyên tắc chi phối mọi quyết định:

1. Đề của CSES, Codeforces, AtCoder… không được sao chép và không có test công khai, nên máy chấm của mình chỉ chấm được **bài do đội tự viết** (`native`). Bài ngoài (`external`) chỉ có link, người học tự đánh dấu.
2. Dữ liệu nạp vào DB phải qua script kiểm tra tự động (link, ID, tag, rating, biên dịch code mẫu). Không tin các con số viết tay trong file md.
3. Code của người dùng chỉ chạy trên máy judge cách ly, tuyệt đối không chạy trên máy API hay DB.

## 0. File chính và file nền

| Loại | File | Vai trò | Ai được sửa |
| --- | --- | --- | --- |
| **CHÍNH** | Tài liệu này (đặt ở `docs/00-KHUNG-CHINH.md`) | Nguồn sự thật duy nhất: kiến trúc, schema, API, máy chấm, repo, lộ trình. Mâu thuẫn với file nền thì theo file này. | Chỉ qua ADR (`docs/adr/`) |
| Nền (tầm nhìn) | `khung-web-hoc-lap-trinh-thi-dau.md` | Mục tiêu, nguồn bài tập và lý thuyết, luật kiểm duyệt, 3 giai đoạn. Các “việc cần chốt” ở mục 11 của nó đã được chốt ở §1 dưới đây. | Không |
| Nền (schema cũ) | `schema_db_va_khung_noi_dung.md` | Schema v0, enum, template bài học, danh sách 72 bài. Bị thay thế: schema → §4, danh sách bài học → Phụ lục A (74 bài), template → Phụ lục D. | Không |
| Nền (dữ liệu thô) | `khung_noi_dung_cap0` … `cap6` (7 file) | Lý thuyết nguồn, nội dung chính, code mẫu, lỗi thường gặp, bài tập khung đầu. Đầu vào của `tools/seed/`. | Không, chỉ đọc |
| Nền (chất lượng thấp) | `bo_sung_bai_tap_cap4`, `cap5`, `cap6` | 168 dòng bài tập bổ sung. Chỉ nạp ở trạng thái `pending`, không hiển thị công khai (xem §2). | Không |

Quy tắc: 12 file nền được copy nguyên vào `content/_raw/` kèm `SHA256SUMS`; CI từ chối commit nào sửa chúng. Mọi chỉnh sửa nội dung diễn ra ở `content/taxonomy/`, `content/lessons/`, `content/problems/` (§5).

## 1. Quyết định đã chốt (không cần hỏi lại)

| Câu hỏi mở | Quyết định | Lý do |
| --- | --- | --- |
| Đối tượng chính | Học sinh THPT là chính, sinh viên là phụ | Lộ trình bắt đầu từ cấp 0, bám HSG, OLP, IOI |
| Ngôn ngữ giao diện | Tiếng Việt mặc định; sẵn i18n (`next-intl`), tiếng Anh làm sau | Nội dung bài học viết tiếng Việt |
| Bài tập: link ngoài hay lưu đề | **Lai**: `external` (link + tự đánh dấu) và `native` (đề tự viết, lưu trong hệ thống, chấm tự động) | Bản quyền (mục 9 khung-web) và máy chấm cần test |
| Cách chấm | Tự dựng: `isolate` + worker Python. Không dùng Judge0 hay Piston | Cần checker tùy biến, đo CPU time chính xác, kết quả từng test |
| Duyệt nội dung | Vai trò `reviewer`; trạng thái `draft → in_review → published` | Luật 4.3 của khung-web |
| Ngôn ngữ nộp bài | v1: C++17. Python 3 ở Sprint 7. Java: không làm ở v1 | Tập trung C++ |
| Mô hình chấm | ICPC-style (AC hoặc không) + bảng kết quả từng test | Đơn giản, đủ cho việc học |
| Phát hành | Đợt 1: cấp 0–3 (38 bài học). Đợt 2: cấp 4–6 (36 bài học) | Khung-web mục 10, bước 2–3 |
| Múi giờ | Lưu UTC, hiển thị `Asia/Ho_Chi_Minh` |  |

**Không làm ở v1:** diễn đàn/blog/bình luận, thanh toán, app mobile, đăng nhập OAuth, bài tương tác (interactive), chấm subtask kiểu OI (chỉ chừa cột `scoring`), đồng bộ tài khoản Codeforces/AtCoder.

## 2. Mâu thuẫn trong file nền và cách chốt

Đã đối chiếu cả 12 file. Mỗi điểm dưới đây có quyết định; code theo cột cuối.

| # | Phát hiện | Quyết định |
| --- | --- | --- |
| 1 | schema\_db nói 72 bài học (cấp 6 có 10 bài), nhưng khung cấp 6 và bổ sung cấp 6 có 12 bài (6.11 và 6.12 đều là “Tổng hợp”). | Chốt **74 bài học**. 6.11 = “Tổng hợp cấp 6 — phần 1”, 6.12 = “phần 2”. Danh sách chuẩn: Phụ lục A. |
| 2 | Bài bổ sung bị gán sai chủ đề và lặp: Necessary Roads ở 5.4, 5.5, 5.8, 5.11; Chef Monocarp ở 4.9, 5.5, 5.8, 5.11; Meet in the Middle ở 4.12, 5.2, 5.6, 5.9, 5.12; mục Dijkstra chứa Planets Queries (binary lifting); mục KMP chứa Subordinates (cây); mục CHT chứa bài cầu/khớp. Toàn bộ Library Checker ở cấp 6 gán theo vòng, không theo chủ đề (vd Static Range Count Distinct ở Link-Cut). | Một bài thuộc nhiều bài học qua bảng nối `lesson_problems` (n–n). Mọi dòng từ `bo_sung_*` nạp với `review_status = pending`, không hiện công khai. Script `topic_fit` tự loại dòng không có chủ đề **cụ thể** chung với bài học (§6.5). Reviewer duyệt tay phần còn lại. |
| 3 | Số liệu tổng kết trong file sai so với bảng (xem bảng đếm ngay dưới). Bổ sung cấp 6 ghi “19 CF + 19 CSES” nhưng cả 60 dòng đều là Library Checker. | KPI do script tính (`make seed-report`), không đọc từ chữ trong file. |
| 4 | Link CSES dạng `https://cses.fi/problemset/ (Tên nhóm)` không phải URL và thiếu ID. File cấp 1 ghi Maximum Subarray Sum = 1646; theo hiểu biết của tôi 1646 là Static Range Sum Queries, còn Maximum Subarray Sum là 1643. | Importer tra ID theo **tên** từ trang danh sách CSES; chỉ nhận ID khi tên khớp. Lệch thì ghi `mismatch.csv` và dừng. Không hard-code ID từ trí nhớ. |
| 5 | Nhãn độ khó không đồng nhất: số (CF), chữ (Khởi động/Luyện tập/Thử thách), `D` (AtCoder DP), `-` (Library Checker). | Quy đổi về 3 bậc theo Phụ lục C. |
| 6 | Dải rating lệch: khung-web (cấp 1: 800–1000, cấp 2: 1000–1200, cấp 6: 2100+) khác file cấp (800–1200, 1100–1400, 2000–2300). Có bài lệch hẳn: 23 Rises Again (CF 2127H, 3100) ở 5.6; Choosing Two Paths (CF 1073F, 2800) ở 6.9. | `tracks` có 2 cột: `cf_rating_range` (mục tiêu học viên) và `problem_rating_min/max` (dải cho phép của bài, Phụ lục C). Bài ngoài khoảng từ min−200 đến max+400 bị chặn publish. |
| 7 | Code mẫu chưa chạy được: 2.4 gọi `check()` chưa định nghĩa; 3.2 dùng `grid`, `MOD` chưa khai báo; hầu hết cấp 5–6 chỉ ghi “xem CP-Algorithms”. | Code mẫu phải biên dịch và qua test mini trong CI (§13). Bài học thiếu code mẫu chạy được thì không publish. Code mẫu cấp 5–6 viết mới. |
| 8 | Bài trùng giữa các bài học/cấp: Spy Detected! (0.5, 0.8), Monster Game 2193D (2.4, 2.5), Longest Flight Route (4.5, 4.12), Apple Division (0.7, 4.9), Planets Queries II (4.1, 4.3). | Duy nhất theo (`source`, `source_id`). `problems.level` = cấp thấp nhất đang gắn. Cảnh báo nếu một bài gắn vào hai cấp cách nhau từ 2 trở lên. |
| 9 | Bài học có 0 bài (3.5, 3.6, 3.7, 3.8, 6.7) hoặc chỉ 1 bài (2.7–2.9, 5.2–5.12) trong dữ liệu gốc. | Hiển thị “đang cập nhật”; bù bằng bài `native` (§8) và bài ngoài đã duyệt. |
| 10 | Prerequisite khó hiểu trong schema\_db: 6.1 FFT ← 5.8 CHT; 6.5 Hình học ← 6.1 FFT; 6.7 Matroid ← 5.6 Max flow. | Đổi: 6.1 ← 2.8, 3.6; 6.5 ← 1.2; 6.7 ← 4.4, 5.6. Cạnh khác giữ nguyên. Đồ thị prerequisite phải không có chu trình (seed kiểm tra). |
| 11 | schema\_db ghi “7 thực thể” nhưng có 8 bảng; ghi “7 mục” bài học nhưng liệt kê 8. | Bài học có đúng **8 mục** (Phụ lục D). |

**Bảng đếm** (đếm tay khi lập khung; script seed sẽ đếm lại và là nguồn chuẩn):

| Cấp | Dòng bài tập đếm được | Số file ghi | Dòng bổ sung đếm được | Số file bổ sung ghi |
| --- | --- | --- | --- | --- |
| 0 | 38 | 38 | – | – |
| 1 | 29 | 33 | – | – |
| 2 | 37 | 38 | – | – |
| 3 | 35 | 35 | – | – |
| 4 | 26 | 32 | 48 | 42 |
| 5 | 14 | 27 | 60 | 40 |
| 6 | 38 | 38 | 60 | 38 |
| **Tổng** | **217** | 241 | **168** | 120 |

Tổng 385 dòng thô (trước khi khử trùng lặp). Con số này chỉ để biết quy mô, không phải mục tiêu.

## 3. Công nghệ (khi scaffold ghi phiên bản chính xác vào lockfile, không dùng latest)

| Thành phần | Lựa chọn | Ghi chú |
| --- | --- | --- |
| Monorepo | pnpm workspace (web) + uv (Python: api, judge, tools) + Makefile | `make help` liệt kê lệnh |
| Web | Next.js 15 (App Router), React 19, TypeScript strict | SSR/ISR cho trang bài học |
| UI | Tailwind CSS, shadcn/ui, lucide-react | Có chế độ sáng/tối |
| Thư viện web | `@monaco-editor/react`, `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-sanitize` + `shiki`, `@xyflow/react` + `dagre` (roadmap), TanStack Query v5, zod, `next-intl`, recharts |  |
| API | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 (async) + asyncpg, Alembic | OpenAPI tự sinh, client TS bằng `openapi-typescript` |
| Auth | `argon2-cffi` (argon2id), PyJWT (HS256), refresh token xoay vòng |  |
| CSDL | PostgreSQL 16 (+ `citext`, `pg_trgm`) |  |
| Cache, rate-limit | Redis 7 |  |
| Lưu gói test | MinIO (tự host) hoặc S3 | bucket `cplearn-tests` |
| Máy chấm | Ubuntu 24.04, isolate 2.x (cgroup v2), g++ 13, Python 3.12; worker viết bằng Python + httpx | Chạy trực tiếp trên host bằng systemd, không trong Docker |
| Proxy | Caddy 2 (TLS tự động) |  |
| Lint, test | ruff, mypy, pytest, pytest-asyncio, httpx, vitest, Playwright, eslint, prettier, pre-commit |  |
| CI | GitHub Actions |  |

## 4. Cơ sở dữ liệu

### 4.1 DDL đầy đủ (migration `0001_init`)

Thứ tự bảng đúng như dưới đây (đã xử lý khóa ngoại vòng). Enum dùng `text + CHECK` để dễ migrate.

```sql
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
-- Gắn trigger BEFORE UPDATE EXECUTE set_updated_at() cho: users, lessons, problems, native_problems

CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  email citext NOT NULL UNIQUE,
  handle citext NOT NULL UNIQUE CHECK (handle ~ '^[a-z0-9_]{3,20}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','reviewer','admin')),
  is_active boolean NOT NULL DEFAULT true,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,          -- sha256 của token
  family_id uuid NOT NULL,                  -- phát hiện dùng lại token cũ
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tracks (                        -- 7 dòng, id = cấp
  id smallint PRIMARY KEY CHECK (id BETWEEN 0 AND 6),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  estimated_duration text NOT NULL,
  cf_rating_range text NOT NULL,            -- mục tiêu học viên (theo khung-web)
  problem_rating_min int NOT NULL,          -- dải cho phép của bài CF (Phụ lục C)
  problem_rating_max int NOT NULL,
  release_wave smallint NOT NULL DEFAULT 1, -- 1 = cấp 0-3, 2 = cấp 4-6
  sort_order smallint NOT NULL
);

CREATE TABLE topics (
  slug text PRIMARY KEY,
  name_vi text NOT NULL,
  cf_tag text,
  is_generic boolean NOT NULL DEFAULT false -- tag chung: graphs, dp, math...
);
CREATE TABLE topic_aliases (
  alias text PRIMARY KEY,                   -- chữ thường, gộp khoảng trắng
  topic_slug text NOT NULL REFERENCES topics(slug)
);

CREATE TABLE lessons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^[0-6][.][0-9]{1,2}$'),   -- 4.7
  slug text NOT NULL UNIQUE,
  track_id smallint NOT NULL REFERENCES tracks(id),
  sort_order smallint NOT NULL,
  title text NOT NULL,
  objectives_md text NOT NULL DEFAULT '',
  theory_md text NOT NULL DEFAULT '',
  code_sample text NOT NULL DEFAULT '',
  code_sample_ok boolean NOT NULL DEFAULT false,   -- CI đặt true khi biên dịch + qua test mini
  complexity text NOT NULL DEFAULT '',
  common_mistakes_md text NOT NULL DEFAULT '',
  sources jsonb NOT NULL DEFAULT '[]',             -- [{kind,title,url}]
  hints jsonb NOT NULL DEFAULT '[]',               -- gợi ý cho ví dụ minh họa chính của bài học
  quiz jsonb NOT NULL DEFAULT '[]',                -- [{q,options,answer_index,explain}]
  fit_check boolean NOT NULL DEFAULT true,         -- false với bài Tổng hợp
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
  reviewed_by bigint REFERENCES users(id),
  reviewed_at timestamptz,
  content_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE lesson_prereqs (
  lesson_id bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prereq_id bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, prereq_id),
  CHECK (lesson_id <> prereq_id)
);
CREATE TABLE lesson_topics (
  lesson_id bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  topic_slug text NOT NULL REFERENCES topics(slug),
  PRIMARY KEY (lesson_id, topic_slug)
);

CREATE TABLE problems (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,63}$'),  -- cf-4-a, cses-1068, nat-big-sum
  kind text NOT NULL CHECK (kind IN ('external','native')),
  title text NOT NULL,
  source text NOT NULL CHECK (source IN ('CSES','Codeforces','AtCoder','USACO','VNOJ','Kattis','LibraryChecker','Native','Other')),
  source_id text NOT NULL,                  -- 4A, 1068, dp_a, convolution; native = slug
  source_url text,
  year smallint,
  level smallint NOT NULL REFERENCES tracks(id),
  difficulty text NOT NULL CHECK (difficulty IN ('Khởi động','Luyện tập','Thử thách')),
  cf_rating int,
  editorial_url text,
  license_note text NOT NULL DEFAULT '',
  hints jsonb NOT NULL DEFAULT '[]',        -- [{level 1..4, type nudge/approach/idea/code, text_md}]
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
  seed_origin text,                         -- vd khung_noi_dung_cap4_trung_cap_2.md#4.1
  link_ok boolean,
  link_checked_at timestamptz,
  reviewed_by bigint REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, source_id),
  CHECK (kind = 'native' OR source_url ~ '^https://')
);
CREATE INDEX problems_level_diff_idx ON problems (level, difficulty);
CREATE INDEX problems_title_trgm_idx ON problems USING gin (title gin_trgm_ops);

CREATE TABLE problem_topics (
  problem_id bigint NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  topic_slug text NOT NULL REFERENCES topics(slug),
  PRIMARY KEY (problem_id, topic_slug)
);

CREATE TABLE lesson_problems (              -- n-n: một bài thuộc nhiều bài học
  lesson_id bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  problem_id bigint NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('Khởi động','Luyện tập','Thử thách')),
  sort_order smallint NOT NULL DEFAULT 0,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','auto_rejected')),
  topic_fit text,                           -- strong / weak / none (do script tính)
  reviewer_note text,
  reviewed_by bigint REFERENCES users(id),
  reviewed_at timestamptz,
  PRIMARY KEY (lesson_id, problem_id)
);
CREATE INDEX lesson_problems_problem_idx ON lesson_problems (problem_id);
CREATE INDEX lesson_problems_lesson_idx ON lesson_problems (lesson_id, review_status, sort_order);

CREATE TABLE native_problems (              -- 1-1 với problems có kind = native
  problem_id bigint PRIMARY KEY REFERENCES problems(id) ON DELETE CASCADE,
  statement_md text NOT NULL,
  input_spec_md text NOT NULL DEFAULT '',
  output_spec_md text NOT NULL DEFAULT '',
  notes_md text NOT NULL DEFAULT '',
  samples jsonb NOT NULL DEFAULT '[]',      -- [{input,output,explain}]
  time_limit_ms int NOT NULL DEFAULT 1000 CHECK (time_limit_ms BETWEEN 100 AND 10000),
  memory_limit_mb int NOT NULL DEFAULT 256 CHECK (memory_limit_mb BETWEEN 16 AND 1024),
  output_limit_kb int NOT NULL DEFAULT 65536,
  checker text NOT NULL DEFAULT 'tokens' CHECK (checker IN ('tokens','lines','float','custom')),
  checker_params jsonb NOT NULL DEFAULT '{}',   -- vd eps cho float
  scoring text NOT NULL DEFAULT 'all_or_nothing' CHECK (scoring IN ('all_or_nothing','per_test','subtasks')),
  allowed_languages text[] NOT NULL DEFAULT '{cpp17}',
  active_test_set_id bigint
);

CREATE TABLE test_sets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  problem_id bigint NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  version int NOT NULL,
  storage_key text NOT NULL,                -- problems/<slug>/v3/tests.zip
  sha256 text NOT NULL,
  size_bytes bigint NOT NULL,
  manifest jsonb NOT NULL,                  -- [{name,group,is_sample,sha256_in,sha256_out}]
  checker_storage_key text,                 -- biên dịch sẵn nếu checker = custom
  created_by bigint REFERENCES users(id),
  verified_at timestamptz,                  -- chỉ đặt khi verify.py qua hết (§8.4)
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (problem_id, version)
);
ALTER TABLE native_problems
  ADD CONSTRAINT native_active_ts_fk FOREIGN KEY (active_test_set_id) REFERENCES test_sets(id);

CREATE TABLE contests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description_md text NOT NULL DEFAULT '',
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL CHECK (end_at > start_at),
  scoring text NOT NULL DEFAULT 'icpc' CHECK (scoring IN ('icpc','oi')),
  penalty_minutes smallint NOT NULL DEFAULT 20,
  is_public boolean NOT NULL DEFAULT true,
  created_by bigint REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE contest_problems (
  contest_id bigint NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  problem_id bigint NOT NULL REFERENCES problems(id),
  label text NOT NULL,                      -- A, B, C...
  sort_order smallint NOT NULL,
  points int NOT NULL DEFAULT 100,
  PRIMARY KEY (contest_id, problem_id),
  UNIQUE (contest_id, label)
);
CREATE TABLE contest_participants (
  contest_id bigint NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contest_id, user_id)
);

CREATE TABLE submissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id bigint NOT NULL REFERENCES problems(id),
  contest_id bigint REFERENCES contests(id),
  test_set_id bigint REFERENCES test_sets(id),     -- chốt lúc nhận bài
  language text NOT NULL CHECK (language IN ('cpp17','python3','java21')),
  source_code text NOT NULL CHECK (octet_length(source_code) <= 65536),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','judging','done','system_error')),
  verdict text CHECK (verdict IN ('AC','WA','TLE','MLE','RE','CE','OLE','SE')),
  score int NOT NULL DEFAULT 0,
  max_time_ms int,
  max_memory_kb int,
  tests_passed int,
  tests_total int,
  failed_test text,
  compile_log text,                         -- tối đa 4000 ký tự
  judge_worker text,
  attempts int NOT NULL DEFAULT 0,          -- số lần worker nhận việc
  claimed_at timestamptz,
  heartbeat_at timestamptz,
  finished_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX submissions_user_idx ON submissions (user_id, id DESC);
CREATE INDEX submissions_problem_user_idx ON submissions (problem_id, user_id);
CREATE INDEX submissions_queue_idx ON submissions (id) WHERE status = 'queued';

CREATE TABLE submission_tests (
  submission_id bigint NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  grp text,
  ord int NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('AC','WA','TLE','MLE','RE','OLE','SE')),
  time_ms int,
  memory_kb int,
  is_sample boolean NOT NULL DEFAULT false,
  checker_msg text,                         -- tối đa 500 ký tự
  stdin_preview text,                       -- CHỈ test mẫu, tối đa 1000 ký tự
  stdout_preview text,
  expected_preview text,
  PRIMARY KEY (submission_id, test_name)
);

CREATE TABLE progress (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id bigint NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','attempted','solved','mastered')),
  attempts int NOT NULL DEFAULT 0,
  solved_via text CHECK (solved_via IN ('judge','self_report')),
  first_solved_at timestamptz,
  last_attempt_at timestamptz,
  hint_level smallint NOT NULL DEFAULT 0,
  hint_unlocked_at timestamptz,
  notes text NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, problem_id)
);
CREATE TABLE lesson_progress (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','reading','done')),
  quiz_best_score smallint,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE reports (                      -- báo lỗi / báo vi phạm bản quyền
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint REFERENCES users(id) ON DELETE SET NULL,
  target_type text NOT NULL CHECK (target_type IN ('lesson','problem','test','copyright','other')),
  target_id text NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id bigint REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL, entity text NOT NULL, entity_id text NOT NULL,
  diff jsonb, at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE seed_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  git_sha text, stats jsonb NOT NULL, started_at timestamptz NOT NULL DEFAULT now()
);

CREATE VIEW v_lesson_stats AS                -- KPI: bài đã duyệt / chờ duyệt mỗi bài học
SELECT l.id AS lesson_id, l.code,
  count(*) FILTER (WHERE lp.review_status = 'approved' AND p.status = 'published') AS approved,
  count(*) FILTER (WHERE lp.review_status = 'pending') AS pending
FROM lessons l
LEFT JOIN lesson_problems lp ON lp.lesson_id = l.id
LEFT JOIN problems p ON p.id = lp.problem_id
GROUP BY l.id, l.code;
```

### 4.2 Quy tắc nghiệp vụ (phần DDL không diễn tả được)

1. **Publish bài `external`:** `link_ok = true`; host của `source_url` thuộc allowlist (`codeforces.com`, `cses.fi`, `atcoder.jp`, `judge.yosupo.jp`, `usaco.org`, `oj.vnoi.info`, `open.kattis.com`); có ≥ 1 dòng `lesson_problems` ở trạng thái `approved`; `reviewed_by` khác null.
2. **Publish bài `native`:** `active_test_set_id` trỏ tới test set có `verified_at` khác null; đủ số test (≥ 20; từ cấp 3 trở lên ≥ 30); có đề và ≥ 1 mẫu; `reviewed_by` khác null.
3. **Publish bài học:** `code_sample_ok = true`; quiz ≥ 3 câu; ≥ 3 bài `approved` (mục tiêu 5–10; bài Tổng hợp ≥ 5); mọi prerequisite tồn tại; `reviewed_by` khác null.
4. **Người học thấy gì:** chỉ bài học `published` và các dòng `lesson_problems` `approved` của bài `published`. Reviewer và admin thấy tất cả, có nhãn trạng thái.
5. **Tiến độ (`progress`):** mỗi bài nộp chấm xong (trừ CE) tăng `attempts` và cập nhật `last_attempt_at`; verdict khác AC khi đang `not_started` thì thành `attempted`; AC thì thành `solved`, `solved_via = judge`, đặt `first_solved_at` nếu còn trống. `mastered` khi AC lại (bài native) hoặc người học bấm “Đã nắm vững” (bài external) sau ≥ 7 ngày kể từ `first_solved_at`. Bài `external`: người học tự chuyển `attempted` và `solved` (`solved_via = self_report`), nút “Tôi đã thử” tăng `attempts`. Không bao giờ hạ trạng thái `solved` có `solved_via = judge`.
6. **Gợi ý mở khóa dần** (`progress.hint_level` từ 0 đến 4). Server kiểm tra điều kiện, không tin client; API chỉ trả hint có level ≤ `hint_level`. Giữa hai lần mở phải cách ≥ 3 phút.

| Mức | Loại | Điều kiện mở |
| --- | --- | --- |
| 1 | Gợi ý nhẹ | ≥ 1 lần nộp, hoặc ≥ 5 phút kể từ lần đầu mở bài |
| 2 | Hướng tiếp cận | ≥ 2 lần nộp |
| 3 | Ý tưởng chính | ≥ 3 lần nộp |
| 4 | Code mẫu | ≥ 5 lần nộp, hoặc đã `solved` |

7. **Contest:** chỉ chứa bài `native` đã `published`; trước `start_at` ẩn đề; nộp ngoài khung giờ trả lỗi; đang diễn ra thì không đổi test set. Xếp hạng ICPC: nhiều bài AC hơn xếp trước; hòa thì ít phạt hơn. Phạt = số phút từ lúc bắt đầu đến lần AC đầu + `penalty_minutes` × số lần nộp sai trước đó (CE không bị phạt).
8. **Xóa tài khoản:** `DELETE /me` xóa user, cascade xóa submissions và progress; `audit_log.actor_id` về null.

## 5. Cấu trúc thư mục repo

Chú giải: **★** = file lõi, phải viết đúng theo khung này. **○** = file nền hoặc phụ trợ (boilerplate, cấu hình, sinh tự động, hoặc chỉ đọc).

```text
cplearn/
├─ README.md                                 ○ chạy dev trong 5 lệnh
├─ Makefile                                  ★ dev, test, seed, seed-report, judge-selftest, build-problem P=slug
├─ docker-compose.yml                        ★ db, redis, minio, api, web, caddy (§12)
├─ .env.example                              ★ mọi biến môi trường (§12.2)
├─ docs/
│  ├─ 00-KHUNG-CHINH.md                      ★ FILE CHÍNH (tài liệu này)
│  └─ adr/                                   ○ mỗi lần đổi khung = 1 file NNNN-tieu-de.md
├─ content/
│  ├─ _raw/                                  ○ 12 file nền, chỉ đọc, kèm SHA256SUMS
│  ├─ taxonomy/
│  │  ├─ tracks.yaml                         ★ 7 cấp (Phụ lục C)
│  │  ├─ lessons.yaml                        ★ 74 bài học, prereq, topics (Phụ lục A)
│  │  └─ topics.yaml                         ★ tag chung và alias (Phụ lục B)
│  ├─ lessons/L0 ... L6/<code>-<slug>.md     ★ 74 file, mỗi file 8 mục (Phụ lục D)
│  ├─ quizzes/<code>.yaml                    ★ ≥ 3 câu mỗi bài học
│  ├─ problems/
│  │  ├─ external/<source>.jsonl             ★ bài ngoài sau seed và duyệt (1 dòng = 1 bài)
│  │  └─ native/<slug>/                      ★ gói bài chấm (§8)
│  └─ _build/                                ○ git-ignore: file trung gian của seed
├─ apps/
│  ├─ api/                                   ★ FastAPI
│  │  ├─ pyproject.toml, alembic.ini         ○
│  │  ├─ alembic/versions/0001_init.py       ★ DDL §4.1
│  │  └─ app/
│  │     ├─ main.py                          ★ tạo app, gắn router, CORS, request-id, lỗi chuẩn
│  │     ├─ core/ config, db, security, redis, storage, errors, ratelimit, logging   ○
│  │     ├─ models/*.py                      ★ 1 file mỗi bảng, khớp §4.1
│  │     ├─ schemas/*.py                     ★ Pydantic request/response (§9)
│  │     ├─ routers/ auth, catalog, problems, progress, submissions, contests,
│  │     │           admin, reports, internal_judge, health                         ★
│  │     ├─ services/ progress, submission, roadmap, scoreboard, hints, review       ★
│  │     ├─ jobs/reaper.py                   ★ trả việc chấm bị treo về hàng đợi (30 s/lần)
│  │     └─ tests/                           ★ pytest
│  ├─ judge/                                 ★ máy chấm (§7)
│  │  ├─ pyproject.toml                      ○
│  │  ├─ judge/ main, config, api_client, pipeline, compile, runner, checker,
│  │  │         testdata, verdict, languages                                        ★
│  │  ├─ judge/sandbox/ base, isolate, devrun                                      ★
│  │  ├─ checkers/ testlib.h, tokens.cpp, lines.cpp, float.cpp                     ★
│  │  ├─ selftest/ programs/*.cpp, expected.yaml, run_selftest.py                  ★
│  │  └─ deploy/ install-isolate.sh, judge-worker.service, judge.env.example       ○
│  └─ web/                                   ★ Next.js
│     ├─ src/app/ ...                        (route ở §10)
│     ├─ src/components/ roadmap, lesson, problem, editor, submission, admin, ui   
│     ├─ src/lib/ api.ts, auth.ts, markdown.tsx, format.ts
│     └─ src/messages/ vi.json, en.json
├─ tools/
│  ├─ seed/ parse_raw, normalize, resolve_cses, resolve_cf, check_links,
│  │        topic_fit, build_catalog, load_db, report                               ★ (§6)
│  ├─ problemkit/ build, verify, publish, lint                                      ★ (§8)
│  ├─ lessonkit/ lint_lessons, run_code_samples                                     ★ (§13)
│  └─ vendor/testlib.h                       ○ dùng cho generator, validator, checker
├─ deploy/ Caddyfile, backup.sh, restore.sh  ○
└─ .github/workflows/ ci.yml, seed-validate.yml, judge-selftest.yml                 ★
```

Quy ước: Python dùng snake\_case, file TypeScript dùng kebab-case, nhánh `feat/...` và `fix/...`, commit theo Conventional Commits. Mỗi thay đổi schema = 1 migration Alembic mới, không sửa migration cũ.

## 6. Pipeline nội dung (seed, kiểm tra, duyệt)

### 6.1 Luồng tổng

```text
content/_raw/*.md
  -> parse_raw      -> _build/raw_lessons.jsonl, raw_problems.jsonl
  -> normalize      -> chuẩn hóa nguồn, ID, tag, bậc khó, slug
  -> resolve_cses   -> điền ID CSES (tra theo tên)
  -> resolve_cf     -> điền rating, tag, năm từ API Codeforces
  -> check_links    -> link_ok
  -> topic_fit      -> strong, weak, none
  -> build_catalog  -> content/problems/external/*.jsonl + khung file bài học
  -> (người duyệt sửa tay các file trong content/)
  -> load_db        -> upsert vào Postgres, chạy lại nhiều lần không hỏng
  -> report         -> KPI mỗi bài học
```

`make seed` chạy cả chuỗi. Mỗi bước đọc và ghi file nên chạy riêng được. Bước cần mạng (`resolve_*`, `check_links`) có cache `_build/cache/` TTL 7 ngày và cờ `--offline`. CI chạy với `--strict`: mọi cảnh báo loại “không map được” đều thành lỗi.

### 6.2 Luật parse (`parse_raw.py`)

- Tên file cho cấp: `khung_noi_dung_cap<N>_...` và `bo_sung_bai_tap_cap<N>`.
- Tiêu đề bài học: dòng bắt đầu bằng `## Bài <cấp>.<số> — <tên>`, bỏ phần ngoặc cuối dạng `(cộng N bài)`.
- Trong file khung, nhận các mục `### Lý thuyết (nguồn uy tín)`, `### Nội dung chính`, `### Code mẫu` (khối ```` ```cpp ````), `### Lỗi thường gặp`, `### Bài tập (N bài)`.
- Bảng bài tập: dòng bắt đầu bằng ký tự thanh đứng, đúng 6 cột (`#`, Tên bài, Nguồn, Link, Chủ đề, Độ khó); bỏ dòng tiêu đề và dòng gạch ngang.
- Cột Nguồn bắt đầu bằng `Codeforces`, `CSES`, `AtCoder`, `Library Checker` thì gán `source` tương ứng (`LibraryChecker` cho cái cuối).
- Cột Link cho ra `source_id` và `slug` theo bảng sau; mọi slug chữ thường, dài tối đa 64 ký tự.

```text
Codeforces : codeforces.com/problemset/problem/<contest>/<index>  -> source_id = <contest><index>   slug = cf-<contest>-<index thường>
CSES       : cses.fi/problemset/task/<id>                         -> source_id = <id>               slug = cses-<id>
CSES (thiếu ID): cses.fi/problemset/ (<Nhóm>)                     -> source_id rỗng, chờ resolve_cses
AtCoder DP : atcoder.jp/contests/dp/tasks/dp_<x>                  -> source_id = dp_<x>             slug = atcoder-dp-<x>
Library Checker: judge.yosupo.jp/problem/<slug>                   -> source_id = <slug>             slug = lc-<slug, dấu gạch dưới thành gạch ngang>
```

- Bỏ qua dòng `> Tổng ...`, `> Mở rộng ...` và cả mục `## Ghi chú`. Câu “đã xác nhận tồn tại” trong ghi chú **không** được coi là bằng chứng; chỉ `resolve_*` và `check_links` mới có giá trị.
- File `bo_sung_*`: cùng luật parse; `seed_origin = <tên file>#<mã bài học>`; mọi dòng sinh ra `review_status = pending` và áp luật chặt hơn ở §6.5.

### 6.3 Chuẩn hóa (`normalize.py`)

1. Chủ đề: tách cột Chủ đề theo dấu phẩy, mỗi mảnh đưa về chữ thường, tra `topic_aliases` (Phụ lục B). Mảnh không tra được thì ghi `_build/unmapped_labels.txt` và (ở `--strict`) dừng.
2. Bài Codeforces: sau `resolve_cf`, tag từ API được hợp với tag từ md (hợp, không thay thế).
3. `difficulty` và `tier`: nhãn chữ thì giữ; số thì là `cf_rating` rồi quy đổi; `D` và `-` theo Phụ lục C.
4. Tiêu đề: giữ nguyên, chỉ bỏ ngoặc cuối khi nó là mã AtCoder (vd `(dp_a)`). Giữ `(Easy Version)`, `(Hard Version)`.
5. `problems.level` = cấp thấp nhất trong các bài học đang gắn.
6. Khử trùng theo (`source`, `source_id`): một dòng `problems`, nhiều dòng `lesson_problems`.
7. `license_note` mặc định: `Đề thuộc <nguồn>. Chỉ lưu metadata và link.`

### 6.4 Tra cứu và kiểm tra link

- **`resolve_cses.py`**: tải `https://cses.fi/problemset/list/`, lấy mọi cặp (ID, tên) từ các liên kết dạng `/problemset/task/<id>`. So khớp theo tên đã chuẩn hóa (chữ thường, bỏ dấu câu và khoảng trắng thừa; `Subarray Sum Queries` khác `Subarray Sum Queries II`). Bài đã có ID trong md cũng phải khớp tên. Không khớp hoặc mơ hồ thì ghi `_build/cses_mismatch.csv` và dừng ở `--strict`.
- **`resolve_cf.py`**: gọi `https://codeforces.com/api/problemset.problems` (tên, rating, tags theo cặp contestId và index) và `https://codeforces.com/api/contest.list` (năm từ startTimeSeconds). Tên lệch thì ghi mismatch. Bài chưa có rating thì để trống và bậc khó lấy theo cấp.
- **`check_links.py`**: GET (không dùng HEAD vì nhiều site từ chối), User-Agent `cplearn-linkcheck/1.0`, tối đa 1 yêu cầu mỗi giây mỗi host, timeout 15 s, theo redirect tối đa 3 lần. 200 thì `link_ok = true`; 404 thì `false`; 403, 429, 5xx thử lại 3 lần rồi để `null` (chờ người kiểm tra tay, không tự kết luận hỏng).

### 6.5 Độ khớp chủ đề (`topic_fit.py`)

Với mỗi cặp (bài học L, bài P): `S_L` = tag cụ thể (không phải `is_generic`) của L, `S_P` = tag cụ thể của P.

- `strong`: `S_L` giao `S_P` khác rỗng.
- `weak`: không giao ở tag cụ thể nhưng giao ở tag chung.
- `none`: không giao gì.

| Nguồn dòng | strong | weak | none |
| --- | --- | --- | --- |
| `khung_noi_dung_*` | `pending` | `pending`, cờ vàng cho reviewer | `pending`, cờ đỏ cho reviewer |
| `bo_sung_*` | `pending` | `auto_rejected` | `auto_rejected` |

Bài học có `fit_check = false` (Tổng hợp) thì mọi dòng đều coi là `weak` và không bị `auto_rejected`.

Unit test bắt buộc: bài Planets Queries I (tag `binary-lifting`, `graphs`) đưa vào bài 4.1 Dijkstra từ file `bo_sung_*` phải ra `auto_rejected`; bài Shortest Routes I (tag `dijkstra`) vào 4.1 phải ra `strong`; bài Necessary Roads (tag `bridges`) vào 5.8 CHT phải ra `auto_rejected`.

### 6.6 Nạp DB (`load_db.py`)

Upsert theo khóa tự nhiên: `lessons.code`, `problems(source, source_id)`, `topics.slug`, `lesson_problems(lesson_id, problem_id)`. Chạy trong 1 transaction, có `--dry-run` in ra diff. **Không ghi đè** `status`, `reviewed_*`, `reviewer_note`, `review_status` của dòng đã tồn tại (tránh phá việc duyệt tay); chỉ ghi khi là dòng mới. Dùng `content_hash` để bỏ qua dòng không đổi. Cuối cùng ghi 1 dòng `seed_runs` kèm thống kê.

### 6.7 Kiểm tra cứng (CI đỏ nếu sai)

1. Đúng 74 bài học; prerequisite tồn tại và đồ thị không có chu trình (DFS tô màu).
2. Mỗi file bài học có đủ 8 mục đúng thứ tự (Phụ lục D) và frontmatter hợp lệ.
3. Slug bài tập duy nhất và đúng regex của bảng `problems`.
4. Mọi nhãn chủ đề đã map; mọi tag cụ thể của bài học có trong `topics.yaml`.
5. Bài `external` có `source_url` bắt đầu `https://` và host nằm trong allowlist (§4.2).
6. `cf_rating` ngoài \[min−200, max+400\] của cấp thì lỗi; ngoài \[min, max\] thì cảnh báo.
7. Không có `lesson_problems` trỏ tới bài hoặc bài học không tồn tại.
8. `content/_raw/SHA256SUMS` khớp.

### 6.8 Biên tập và duyệt

```text
draft --(tác giả bấm Gửi duyệt)--> in_review --(reviewer đối chiếu Phụ lục E)--> published
  ^------------------------(reviewer trả lại, bắt buộc có ghi chú)----------------+
```

Mỗi chuyển trạng thái ghi 1 dòng `audit_log`. Reviewer duyệt riêng từng dòng `lesson_problems` (đúng chủ đề chưa, bậc khó đúng chưa) và từng bài học.

### 6.9 KPI

`make seed-report` in cho từng bài học: số dòng thô, `strong`, `weak`, `auto_rejected`, `approved`, `pending`; cuối bảng là số bài học đạt ≥ 5 bài `approved`. Sau khi seed, số này sẽ thấp hơn nhiều so với con số “trung bình \~6 bài mỗi bài học” trong các file bổ sung. Đó là kỳ vọng đúng, vì phần lớn dòng bổ sung sai chủ đề (§2, mục 2). Khoảng trống được lấp bằng bài `native` (§8) và bài ngoài do người duyệt chọn thêm.

## 7. Máy chấm (Judge)

### 7.1 Luồng và hàng đợi

```text
Người học bấm Nộp -> POST /problems/{slug}/submissions -> INSERT submissions(status = queued) -> 202

Worker: POST /internal/judge/claim. API chạy trong 1 transaction:
  UPDATE submissions
     SET status = 'judging', judge_worker = $1, claimed_at = now(), heartbeat_at = now(), attempts = attempts + 1
   WHERE id = (SELECT id FROM submissions WHERE status = 'queued' ORDER BY id
               FOR UPDATE SKIP LOCKED LIMIT 1)
  RETURNING id;
  -> trả {submission, limits, checker, test_pack{url, sha256, version}} hoặc 204 nếu hàng đợi rỗng

Worker: tải gói test (cache) -> biên dịch -> chạy từng test -> POST /internal/judge/{id}/tests (từng lô)
        -> POST /internal/judge/{id}/finish. Cứ 20 s gọi POST /internal/judge/{id}/heartbeat.

Reaper (API, 30 s/lần):
  UPDATE submissions
     SET status = CASE WHEN attempts < 3 THEN 'queued' ELSE 'system_error' END,
         verdict = CASE WHEN attempts < 3 THEN NULL ELSE 'SE' END, judge_worker = NULL
   WHERE status = 'judging' AND heartbeat_at < now() - interval '90 seconds';
```

Vòng lặp worker: claim; nếu 204 thì ngủ 1 s (tăng dần tới 3 s); có việc thì xử lý ngay và claim tiếp. Mỗi worker một `box_id` cố định (0 đến N−1, N ≤ số lõi CPU − 1) và một lõi CPU riêng.

### 7.2 Ngôn ngữ (`languages.py`)

| Mã | File nguồn | Biên dịch | Chạy | Hệ số TL | Khi nào |
| --- | --- | --- | --- | --- | --- |
| `cpp17` | `main.cpp` | `g++ -std=c++17 -O2 -pipe -static -s -DONLINE_JUDGE -o main main.cpp` | `./main` | 1× | v1 |
| `python3` | `main.py` | không | `/usr/bin/python3 main.py` | 3× (tối đa 10 s) | Sprint 7 |
| `java21` | `Main.java` | không làm ở v1 |  |  | sau v1 |

Biên dịch cũng chạy trong isolate: CPU 10 s, thời gian thực 20 s, RAM 512 MB, tối đa 64 tiến trình, file xuất ≤ 64 MB. Log lỗi cắt 4000 ký tự và thay đường dẫn tạm bằng `main.cpp`.

### 7.3 Chạy một test với isolate (`sandbox/isolate.py`)

```text
isolate --cg -b 3 --init                      # in ra /var/local/lib/isolate/3 ; thư mục làm việc là .../3/box
cp main  /var/local/lib/isolate/3/box/main
cp 01-samples.in  /var/local/lib/isolate/3/box/input.txt
taskset -c 3 isolate --cg -b 3 --run -M meta.txt -t 1.000 -x 0.5 -w 3.000 --cg-mem=262144 -f 65536 -p1 -i input.txt -o output.txt -r stderr.txt -E PATH=/usr/bin:/bin -- ./main
# đọc output.txt từ thư mục box, đọc meta.txt, rồi:
isolate --cg -b 3 --cleanup

# Biên dịch (trong cùng sandbox, giới hạn rộng hơn):
isolate --cg -b 3 --run -M meta.txt -t 10 -w 20 --cg-mem=524288 -f 65536 -p64 --dir=/etc/alternatives -E PATH=/usr/bin:/bin -o compile.out -r compile.err -- /usr/bin/g++ -std=c++17 -O2 -pipe -static -s -DONLINE_JUDGE -o main main.cpp
```

Ý nghĩa tham số: `-t` thời gian CPU (s), `-x` thời gian cho phép trước khi bị kill, `-w` thời gian thực (chặn sleep), `--cg-mem` RAM theo cgroup (KB), `-f` cỡ file ghi ra (KB), `-p1` chỉ 1 tiến trình (chặn fork), `-i/-o/-r` stdin, stdout, stderr theo đường dẫn trong box. Mạng bị cô lập mặc định. `meta.txt` có dạng `khóa:giá trị` với các khóa: `time`, `time-wall`, `max-rss`, `cg-mem`, `exitcode`, `exitsig`, `status`, `message`, `killed`, `cg-oom-killed`.

### 7.4 Phân loại verdict (`verdict.py`), ưu tiên từ trên xuống

| Điều kiện (từ meta) | Verdict | Ghi chú |
| --- | --- | --- |
| `status` = XX | SE | Lỗi nội bộ isolate; thử lại 1 lần |
| `cg-oom-killed` = 1, hoặc `cg-mem` ≥ ML × 1024 | MLE |  |
| `exitsig` = 25 (SIGXFSZ) | OLE | Ghi quá giới hạn file |
| `status` = TO, hoặc `time` > TL | TLE |  |
| `status` = SG hoặc RE | RE | Segfault, chia 0, exit khác 0, tràn stack |
| `exitcode` = 0 | chạy checker | AC, WA hoặc SE |

Thời gian = làm tròn `time × 1000` (ms); bộ nhớ = giá trị lớn hơn giữa `max-rss` và `cg-mem`. **Ổn định thời gian:** nếu thời gian rơi vào \[0,9 × TL; 1,15 × TL\] thì chạy lại tối đa 2 lần và lấy giá trị nhỏ nhất rồi mới kết luận.

### 7.5 Checker

Giao thức testlib: `checker input.txt contestant_output.txt jury_answer.txt`; mã thoát 0 = AC, 1 = WA, 2 = WA (sai định dạng), 3 = SE (checker lỗi), mã khác = SE. Thông điệp ở stderr, cắt 500 ký tự. Checker cũng chạy trong isolate (10 s, 512 MB), ba file được copy vào box.

- `tokens`: so từng token tách theo khoảng trắng, bỏ qua khác biệt khoảng trắng và xuống dòng; thừa hoặc thiếu token là WA.
- `lines`: so từng dòng sau khi cắt khoảng trắng cuối dòng; bỏ các dòng trống ở cuối file.
- `float`: token là số thì đạt khi hiệu tuyệt đối ≤ `eps` × max(1, giá trị đáp án), `eps` lấy từ `checker_params.eps` (mặc định 1e-6); token không phải số thì so chính xác.
- `custom`: `checker.cpp` của bài (viết bằng testlib), biên dịch lúc build gói, lưu cùng gói test (`checker_storage_key`).

Vendor `testlib.h` vào `tools/vendor/` và kiểm tra giấy phép trong repo gốc trước khi commit.

### 7.6 Pipeline chấm một bài nộp (`pipeline.py`)

```python
def judge(job):
    pack = testdata.ensure(job.test_pack)       # tải, kiểm sha256, giải nén vào cache/<slug>/v<N>/
    work = new_workdir()
    comp = compile_source(job.language, job.source_code, work)
    if comp.failed:
        return finish(job, 'CE', compile_log=comp.log[:4000])
    final = 'AC'
    for t in pack.tests_in_order():              # test mẫu trước, rồi theo nhóm
        r = run_one(comp.exe, t, job.limits)     # §7.3 và §7.4
        if r.verdict == 'OK':
            r = run_checker(job, t, r)
        post_batch(job, [r])                     # để giao diện cập nhật theo thời gian thực
        if r.verdict != 'AC' and final == 'AC':
            final = r.verdict
        if r.verdict != 'AC' and job.scoring == 'all_or_nothing':
            break
    finish(job, final, max_time, max_mem, passed, total, failed_test)
```

Ngoại lệ nào lọt ra khỏi vòng chính cũng phải bị bắt: báo `SE`, API tự đẩy lại hàng đợi (`attempts` < 3). Chi tiết từng test (verdict, thời gian, bộ nhớ) trả cho người nộp; stdin, stdout và đáp án chỉ lưu và trả cho test có `is_sample = true`.

### 7.6b Giao diện sandbox (để thay thế được)

`Sandbox.run(cmd, limits, stdin_path, stdout_path, stderr_path) -> RunResult` với `RunResult = {time_ms, memory_kb, exit_code, signal, status, message}`. Hai bản cài đặt: `IsolateSandbox` (production) và `DevSandbox` (dev). Pipeline chỉ biết giao diện này.

### 7.7 Bảo mật máy chấm

- Worker chạy bằng user riêng `judge`, không sudo. Máy judge chỉ mở kết nối ra API (443) và URL presigned của MinIO, không nhận kết nối vào, không giữ mật khẩu DB.
- Mỗi worker một `JUDGE_API_TOKEN` riêng, thu hồi được; API kiểm tra header `X-Judge-Token`.
- Sandbox: mạng bị cô lập, `-p1` chặn fork, RAM giới hạn bằng cgroup, cỡ file xuất bị chặn. Biên dịch cũng nằm trong sandbox để chặn các kiểu tấn công khi biên dịch (`#include` file thiết bị, template bùng nổ) bằng giới hạn CPU 10 s.
- Giới hạn nộp: source ≤ 64 KB; ≤ 1 bài mỗi 10 s mỗi người; tối đa 3 bài đang chờ mỗi người (Redis).
- Máy judge: tắt swap; đặt CPU governor `performance` nếu được; cron xóa `/tmp/judge-*` quá 1 giờ; luôn `isolate --cleanup` sau mỗi lần chấm.

### 7.8 Chế độ dev (không cần Linux hay isolate)

`JUDGE_SANDBOX=dev` dùng `subprocess` cùng `resource.setrlimit` (CPU, AS, FSIZE, NPROC) trong thư mục tạm. **Không an toàn.** Worker từ chối khởi động nếu `APP_ENV=production`. Mặc định `JUDGE_SANDBOX=isolate`.

### 7.9 Selftest máy chấm (`apps/judge/selftest/`)

Chạy bằng `make judge-selftest` ở CI và sau mỗi lần cài hay nâng cấp worker. Mỗi chương trình có verdict mong đợi trong `expected.yaml`; mặc định TL = 1 s, ML = 64 MB.

| File | Nội dung | Mong đợi |
| --- | --- | --- |
| `ac_sum.cpp` | Đọc 2 số, in tổng | AC |
| `wa_zero.cpp` | Luôn in 0 | WA |
| `tle_loop.cpp` | Vòng lặp vô hạn | TLE |
| `tle_sleep.cpp` | Ngủ 5 s (bị chặn bởi thời gian thực) | TLE |
| `mle_alloc.cpp` | Cấp phát 512 MB và ghi vào | MLE |
| `re_segv.cpp` | Truy cập con trỏ null | RE |
| `re_div0.cpp` | Chia cho 0 | RE |
| `re_exit1.cpp` | `return 1` | RE |
| `re_stack.cpp` | Đệ quy sâu 10^7 | RE |
| `ole_print.cpp` | In vô hạn | OLE |
| `ce_syntax.cpp` | Thiếu dấu chấm phẩy | CE |
| `sec_fork.cpp` | Gọi fork liên tục | RE hoặc AC, nhưng load máy không tăng bất thường |
| `sec_read.cpp` | Mở `/etc/passwd` và `/home` | In `blocked` |
| `sec_net.cpp` | Kết nối socket tới 1.1.1.1:80 | In `blocked` |
| `sec_write.cpp` | Ghi file ngoài thư mục box | In `blocked` |
| `time_050.cpp` | Vòng lặp khoảng 0,5 s CPU | AC, `time_ms` trong \[350; 750\] |
| `run_selftest.py` (kiểm tra độ ổn định) | Chạy `time_050` 5 lần | Độ lệch chuẩn thời gian < 10% |

## 8. Bộ test và gói bài `native`

### 8.1 Hai loại bài và chuyện test

|  | `external` | `native` |
| --- | --- | --- |
| Đề | Ở nguồn gốc, hệ thống chỉ giữ metadata và link | Đội tự viết hoàn toàn (không dịch, không chép đề hay ví dụ từ CSES, Codeforces, AtCoder…), lưu trong DB |
| Test | **Không có** trong hệ thống (test thuộc nguồn gốc) | Đội tự tạo, lưu ở MinIO |
| Chấm | Người học nộp ở nguồn rồi quay lại đánh dấu | Tự động bằng máy chấm của mình |
| Có thể vào contest | Không | Có |

### 8.2 Gói bài `content/problems/native/<slug>/`

```text
<slug>/
├─ problem.yaml          ★ metadata, giới hạn, kế hoạch test, danh sách lời giải kèm verdict mong đợi
├─ statement.vi.md       ★ đề (Markdown + KaTeX), các mục cố định bên dưới
├─ hints.vi.yaml         ★ 4 mức gợi ý (§4.2, mục 6)
├─ validator.cpp         ★ testlib validator: kiểm mọi file .in đúng ràng buộc, đúng cả khoảng trắng
├─ checker.cpp           chỉ khi checker.type = custom
├─ gen/                  ★ gen_random.cpp, gen_special.cpp ... (testlib, nhận seed ở tham số)
├─ sol/                  ★ ac.cpp, brute.cpp, và các lời giải sai có chủ ý (wa_*, tle_*, mle_*)
└─ tests/manual/         ★ test viết tay, gồm sample-1.in/.out ... (nguồn duy nhất của ví dụ trong đề)
```

Các mục bắt buộc của `statement.vi.md`: `## Đề bài`, `## Dữ liệu vào`, `## Kết quả ra`, `## Giới hạn`, `## Ví dụ`, `## Giải thích` (tùy chọn). Importer tách chúng vào `statement_md`, `input_spec_md`, `output_spec_md`, `notes_md`; ví dụ lấy từ `tests/manual/sample-*.in/.out` rồi ghi vào `samples`.

Ví dụ `problem.yaml` đầy đủ:

```yaml
slug: nat-range-sum-queries
title: Tổng đoạn
level: 1
lessons: ['1.9']
tier: Khởi động
topics: [prefix-sum]
limits: {time_ms: 1000, memory_mb: 256, output_kb: 65536}
checker: {type: tokens}
scoring: all_or_nothing
languages: [cpp17]
tests:
  - {group: samples}
  - {group: handmade, files: 'manual/*.in'}
  - {group: small-random, gen: 'gen_random 8 10 {seed}', seeds: [1,2,3,4,5,6,7,8], brute: true}
  - {group: mid-random, gen: 'gen_random 2000 1000000000 {seed}', seeds: [1,2,3]}
  - {group: max-random, gen: 'gen_random 200000 1000000000 {seed}', seeds: [1,2,3,4]}
  - {group: max-same, gen: 'gen_special same 200000 1000000000'}
  - {group: overflow, gen: 'gen_special overflow 200000'}
solutions:
  - {file: sol/ac.cpp, expect: AC}
  - {file: sol/brute.cpp, expect: TLE, pass_groups: [samples, handmade, small-random]}
  - {file: sol/wa_int_overflow.cpp, expect: WA}
  - {file: sol/tle_recompute.cpp, expect: TLE}
```

Quy ước: token đầu của `gen` là tên file trong `gen/` (build từ `gen/<tên>.cpp`); `{seed}` được thay lần lượt bằng từng giá trị trong `seeds`; `brute: true` nghĩa là nhóm đó phải được đối chiếu với `sol/brute.cpp`. Hint theo mẫu `- {level: 1, type: nudge, text: '...'}` với `type` thuộc `nudge`, `approach`, `idea`, `code`.

### 8.3 Dựng gói test (`make build-problem P=<slug>`, chạy `tools/problemkit/build.py`)

1. Biên dịch `validator`, mọi `gen`, `sol/ac`, `sol/brute` (và `checker` nếu có) bằng `g++ -std=c++17 -O2`.
2. Sinh input theo `tests:`; **mọi file `.in` phải qua `validator` (mã thoát 0)**, trượt là dừng.
3. Chạy `sol/ac` trên từng input (TL × 3) để sinh `.out`; `ac` trượt ở bất kỳ test nào là dừng.
4. Với nhóm `brute: true`: chạy `sol/brute` và so với `.out` bằng đúng checker của bài; lệch là dừng (chứng tỏ `ac` hoặc `brute` sai).
5. Đặt tên `NN-<nhóm>.in/.out` theo thứ tự: samples, handmade, các nhóm còn lại theo thứ tự khai báo.
6. Ghi `manifest.json` (tên, nhóm, `is_sample`, sha256 của từng file in/out); nén `tests.zip` (manifest + thư mục `tests/`); tính sha256 của zip.
7. Chạy `verify` (§8.4).
8. `publish.py`: gọi `POST /admin/problems/{slug}/test-sets` (multipart) để API lưu vào MinIO và tạo dòng `test_sets`; chỉ đặt `verified_at` khi bước 7 đã qua.
9. In báo cáo: số test, tổng dung lượng, thời gian lớn nhất của `ac`.

### 8.4 Kiểm chứng bộ test bằng chính máy chấm (`verify.py`)

Với từng lời giải trong `solutions:` chạy cả bộ test qua pipeline thật (§7.6, chạy cục bộ, không cần API):

- Verdict cuối phải bằng `expect`. Lời giải `expect: TLE` mà lại AC nghĩa là bộ test chưa đủ mạnh, và là lỗi.
- Với `pass_groups`, mọi test thuộc các nhóm đó phải AC.
- `sol/ac` phải chạy ≤ 50% TL trên mọi test (chừa dư địa cho máy chậm hơn).
- Tổng dung lượng gói ≤ 50 MB; số test: cấp 0 đến 2 ≥ 20, cấp 3 trở lên ≥ 30; ít nhất 30% test ở kích thước tối đa.
- Phải có ít nhất 1 lời giải `wa_*` và 1 lời giải `tle_*` để chứng minh test phân biệt được lời giải sai.

### 8.5 Ma trận test bắt buộc theo dạng bài

| Dạng | Phải có |
| --- | --- |
| Mọi bài | Test mẫu; giá trị nhỏ nhất theo ràng buộc; giá trị lớn nhất; ≥ 5 test ngẫu nhiên nhỏ để đối chiếu brute; ≥ 3 test ngẫu nhiên lớn; giá trị ở đúng biên của từng tham số |
| Mảng, số | Tất cả bằng nhau; tăng dần; giảm dần; toàn giá trị lớn nhất (tràn int); có 0; có số âm nếu đề cho phép |
| Chuỗi | Độ dài 1; độ dài tối đa; toàn một ký tự; xen kẽ hai ký tự; ký tự biên (a, z, chữ hoa nếu đề cho) |
| Đồ thị | 1 đỉnh; không cạnh; đường thẳng; hình sao; đồ thị gần đầy đủ; không liên thông; cạnh lặp và khuyên nếu đề cho; trọng số lớn nhất |
| Cây | Dây chuyền (độ sâu n); hình sao; caterpillar; cây nhị phân đầy; cây ngẫu nhiên |
| Quy hoạch động | Giá trị làm tràn int; đáp án bằng 0; trường hợp vô nghiệm nếu có |
| Số học | 1; số nguyên tố lớn nhất trong khoảng; bình phương của số nguyên tố; số có rất nhiều ước; lũy thừa của 2 |
| Truy vấn | Mọi truy vấn giống nhau; truy vấn toàn đoạn; truy vấn một phần tử; đoạn sát hai biên |
| Hình học (cấp 6) | Điểm trùng; thẳng hàng; tọa độ cực đại; ngược và cùng chiều kim đồng hồ |
| Chống giải sai | Mỗi bài có test làm O(n²) phải TLE; bài khuyến khích hash thì có test chống `unordered_map` mặc định |

### 8.6 Danh sách 33 bài `native` đợt đầu (cấp 0 đến 2)

Tất cả đề viết mới hoàn toàn bằng tiếng Việt, theo các dạng bài kinh điển. Mặc định TL = 1 s, ML = 256 MB, checker `tokens`; ngoại lệ ghi ở cột 4.

| Slug | Bài | Ý chính của đề | Checker / ngoại lệ | Test đặc thù |
| --- | --- | --- | --- | --- |
| nat-sum-diff | 0.1 | In tổng và hiệu hai số nguyên |  | Số âm, số 0 |
| nat-reverse-three | 0.1 | Đọc 3 số, in theo thứ tự ngược |  | Ba số trùng nhau |
| nat-big-sum | 0.2 | Tổng hai số có giá trị tuyệt đối ≤ 2·10^18 |  | Đúng cận, một âm một dương |
| nat-product-overflow | 0.2 | Tích hai số ≤ 10^9 |  | 10^9 × 10^9 (vượt int) |
| nat-max-min | 0.3 | Giá trị lớn nhất và nhỏ nhất của dãy |  | n = 1, toàn số âm |
| nat-reverse-array | 0.3 | In dãy theo thứ tự ngược |  | n = 1, n = 10^5 |
| nat-count-even | 0.3 | Đếm số chẵn trong dãy |  | Số âm, số 0 |
| nat-most-frequent | 0.4 | Giá trị xuất hiện nhiều nhất (nhỏ nhất nếu hòa), n ≤ 10^6 |  | Lời giải O(n²) phải TLE |
| nat-bouncing-ball | 0.5 | Thả bóng từ độ cao H, mỗi lần nảy còn một nửa (làm tròn xuống), tính tổng quãng đường |  | H = 1, H cực đại |
| nat-count-vowels | 0.6 | Đếm nguyên âm trong chuỗi |  | Toàn phụ âm, chữ hoa lẫn thường |
| nat-palindrome | 0.6 | Chuỗi có đối xứng không (YES hoặc NO) |  | Độ dài 1, chẵn và lẻ |
| nat-gcd-lcm | 0.7 | UCLN và BCNN của hai số ≤ 10^9 |  | BCNN gần 10^18 |
| nat-prime-check | 0.7 | Kiểm tra n ≤ 10^12 có phải số nguyên tố |  | n = 1; số nguyên tố lớn; bình phương số nguyên tố; duyệt tới n phải TLE |
| nat-word-stats | 0.8 | Đọc nguyên dòng: đếm từ, in từ dài nhất | `lines` | Nhiều khoảng trắng liên tiếp |
| nat-subset-sum-small | 1.1 | Có tập con nào có tổng đúng bằng S, n ≤ 20 |  | n = 20, S = 0 |
| nat-sort-two-keys | 1.2 | Sắp theo điểm giảm dần, hòa thì theo tên tăng dần | `lines` | Điểm trùng hàng loạt |
| nat-caesar | 1.3 | Mã hóa Caesar với khóa k | `lines` | Quay vòng z sang a, ký tự không phải chữ |
| nat-count-divisors | 1.4 | Đếm ước của n ≤ 10^12 |  | Số nguyên tố lớn; số có rất nhiều ước |
| nat-robot-walk | 1.5 | Robot đi theo chuỗi lệnh LRUD, in vị trí cuối |  | 10^6 lệnh; đi vòng về gốc |
| nat-equal-row-sums | 1.6 | Dựng ma trận n×n chứa 1..n², mọi hàng có tổng bằng nhau | `custom` | n = 1, n chẵn, n lẻ |
| nat-max-activities | 1.7 | Chọn nhiều hoạt động không giao nhau nhất |  | Đầu mút trùng nhau (quy ước nửa khoảng) |
| nat-pair-sum-sorted | 1.8 | Đếm cặp i < j có tổng bằng S trong dãy đã sắp xếp |  | Nhiều phần tử trùng, đáp án vượt int |
| nat-range-sum-queries | 1.9 | q truy vấn tổng đoạn |  | Tổng vượt int |
| nat-multiset-ops | 2.1 | Thêm, xóa, hỏi nhỏ nhất và lớn nhất trên multiset |  | Xóa phần tử không tồn tại |
| nat-rect-sum-2d | 2.2 | Tổng hình chữ nhật trên lưới n×m |  | Truy vấn toàn lưới; tổng lớn |
| nat-window-k-distinct | 2.3 | Đoạn liên tiếp dài nhất có tối đa k giá trị khác nhau |  | k = 1; k lớn hơn số giá trị |
| nat-cut-ropes | 2.4 | Cắt dây thành ít nhất k đoạn bằng nhau, độ dài nguyên lớn nhất |  | Đáp án 0; tổng độ dài \~10^14 |
| nat-min-rooms | 2.5 | Số phòng ít nhất cho n cuộc họp |  | Cuộc họp nối tiếp (nửa khoảng) |
| nat-count-pair-sum | 2.6 | Đếm cặp i < j có tổng bằng S, dùng bảng băm |  | Test chống `unordered_map` |
| nat-count-primes | 2.7 | Đếm số nguyên tố ≤ n, n ≤ 10^7 | TL 2 s | n = 1; n = 10^7 |
| nat-fast-power | 2.8 | a^b mod m với b ≤ 10^18 |  | m = 1; a = 0 |
| nat-binomial-queries | 2.9 | q truy vấn C(n, k) mod 10^9+7, n ≤ 10^6 | TL 2 s | k = 0; k = n; k > n |
| nat-longest-sum-le | 2.10 | Đoạn dài nhất có tổng ≤ S (số dương) |  | Mọi phần tử > S; cả dãy thỏa |

### 8.7 Kế hoạch và chi phí

- Sau đợt đầu: thêm native cho cấp 3 (DP, BFS, DSU: 10 đến 15 bài), cấp 4 (Dijkstra, Fenwick, segment tree: 15 bài), rồi theo nhu cầu. Mục tiêu dài hạn: ≥ 4 bài native mỗi bài học.
- Chú ý quan trọng: Đọc 3 ý dưới
- Được phép chuyển bài external thành native, với điều kiện là nguồn bài tập mở (như trên Codeforces, CSES, ...). Bộ test thì tự generate ra theo ma trận test, ko cần quá nhiều.
- Các bài native trên phần 8.6 kia thì tự viết đề, còn các bài có sẵn thì nên dịch sang tiếng Việt và trích dẫn nguồn bài.
- Với các phần 3-6 chưa có bài native thì hãy lấy các bài khác, miễn là tự generate test ra là được

## 9. API (REST, tiền tố `/api/v1`)

### 9.1 Quy ước chung

- JSON UTF-8; thời gian ISO-8601 UTC. Định danh công khai dùng `slug` hoặc `code`; chỉ `submissions.id` lộ ra dạng số.
- Xác thực: header `Authorization: Bearer <access JWT, 15 phút>`. Refresh token nằm trong cookie `cp_refresh` (httpOnly, Secure, SameSite=Lax, Path=/api/v1/auth, 30 ngày), **xoay vòng** mỗi lần refresh; dùng lại token cũ thì thu hồi cả `family_id`.
- Lỗi: HTTP status kèm thân `{ error: { code, message, details } }`. Các `code`: `validation_error` (422), `unauthorized` (401), `forbidden` (403), `not_found` (404), `conflict` (409), `payload_too_large` (413), `rate_limited` (429, có `Retry-After`), `internal` (500).
- Phân trang: `page` (từ 1), `page_size` (mặc định 20, tối đa 100); trả `{ items, page, page_size, total }`.
- Giới hạn tốc độ: GET 120 yêu cầu/phút/IP; `/auth/*` 10/phút/IP; nộp bài theo §7.7.
- OpenAPI tự sinh tại `/api/v1/openapi.json`; client TypeScript sinh bằng `pnpm gen:api`. Schema Pydantic trong `apps/api/app/schemas/` là nguồn chuẩn cho tên trường.

### 9.2 Danh sách endpoint

**Công khai (khách xem được; có token thì kèm dữ liệu của tôi)**

| Method | Path | Mô tả và phản hồi chính |
| --- | --- | --- |
| GET | `/tracks` | 7 cấp kèm số bài học và số bài tập đã publish |
| GET | `/roadmap` | `nodes` (code, slug, title, track, counts, trạng thái của tôi) và `edges` (prereq → bài học) |
| GET | `/lessons/{slug}` | Bài học đầy đủ (không có `answer_index` của quiz) kèm bài tập `approved` nhóm theo tier và trạng thái của tôi |
| GET | `/problems` | Bộ lọc: `level`, `lesson` (code), `topic` (lặp được), `source`, `tier`, `kind`, `status` (của tôi), `q` (tìm tiêu đề, trigram), `sort`, `page`, `page_size`; kèm facet đếm |
| GET | `/problems/{slug}` | Chi tiết. Native: đề, mẫu, giới hạn, ngôn ngữ cho phép. External: `source_url`, `editorial_url`. Kèm hint đã mở của tôi |
| GET | `/topics` | Danh sách tag |
| POST | `/reports` | Báo lỗi hoặc báo vi phạm (khách cũng được; 5 lần/giờ/IP) |

**Tài khoản**

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/auth/register` | Thân: `email`, `password` (≥ 8 ký tự), `name`, `handle`. Trả 201 kèm access token và đặt cookie |
| POST | `/auth/login` | Trả access token, đặt cookie refresh |
| POST | `/auth/refresh` | Cần header `X-Requested-With: cplearn`; xoay vòng refresh token |
| POST | `/auth/logout` | Thu hồi token hiện tại |
| GET, PATCH | `/me` | Xem và sửa `name` |
| POST | `/me/password` | Đổi mật khẩu (thu hồi mọi refresh token) |
| DELETE | `/me` | Xóa tài khoản (§4.2, mục 8) |

**Học tập và tiến độ (cần đăng nhập)**

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/me/progress` | Lọc theo `lesson`, `level`; trả trạng thái từng bài |
| GET | `/me/stats` | Tỉ lệ giải theo nhóm chủ đề và theo cấp, 30 ngày gần nhất, 10 bài nộp gần nhất, gợi ý bài nên làm tiếp |
| PUT | `/problems/{slug}/mark` | Chỉ bài `external`. Thân: `status` (`not_started`, `attempted`, `solved`), `notes` tùy chọn |
| POST | `/problems/{slug}/tried` | Chỉ bài `external`: tăng `attempts` |
| POST | `/problems/{slug}/hints/unlock` | Mở hint kế tiếp theo luật §4.2 mục 6. Thành công trả `{ hint_level, hint }`; chưa đủ điều kiện trả 409 `hint_locked` kèm `details.unlock_at` hoặc `details.needs_attempts` |
| PUT | `/lessons/{slug}/progress` | Thân: `status` (`reading`, `done`) |
| POST | `/lessons/{slug}/quiz/submit` | Thân: `answers` (mảng chỉ số đáp án). Server chấm, trả `score`, `total`, và từng câu `correct`, `explain` |

**Nộp bài và chấm (cần đăng nhập)**

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/problems/{slug}/submissions` | Thân: `language`, `source_code`, `contest_slug` tùy chọn. Chỉ bài `native`. Trả 202 `{ id, status: queued }`. Lỗi: 413 nếu > 64 KB, 429 nếu vượt giới hạn §7.7 |
| GET | `/submissions/{id}` | Chủ bài nộp, reviewer, admin. Trả verdict, tổng hợp và từng test (preview chỉ có với test mẫu) |
| GET | `/submissions/{id}/events` | SSE: sự kiện `status`, `test`, `done`, ping mỗi 15 s |
| GET | `/me/submissions` | Lọc theo `problem`, `verdict`, `page` |

**Contest**

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/contests`, `/contests/{slug}` | Danh sách và chi tiết; đề ẩn trước `start_at` |
| POST | `/contests/{slug}/join` | Tham gia |
| GET | `/contests/{slug}/standings` | Bảng xếp hạng ICPC (§4.2 mục 7), cache 5 s |

**Quản trị (vai trò ghi trong ngoặc)**

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/admin/review/queue` | (reviewer) Lọc `type` (`lesson`, `problem`, `lesson_problem`), `flag` (`yellow`, `red`) |
| POST | `/admin/review/{type}/{id}` | (reviewer) Thân: `decision` (`approve`, `reject`, `request_changes`), `note` bắt buộc khi không phải approve |
| PUT | `/admin/lessons/{code}`, `/admin/problems/{slug}` | (admin) Sửa nội dung và metadata; ghi `audit_log` |
| POST | `/admin/problems/{slug}/test-sets` | (admin) multipart: `file` (zip), `sha256`. Trả 201. Kiểm tra zip theo §11 |
| POST | `/admin/test-sets/{id}/activate` | (admin) Chỉ khi `verified_at` khác null |
| POST | `/admin/submissions/{id}/rejudge` | (admin) Đưa về `queued` |
| POST | `/admin/problems/{slug}/rejudge-all` | (admin) Chấm lại bài nộp gần nhất của mỗi người, tối đa 5000 |
| GET, PATCH | `/admin/reports`, `/admin/reports/{id}` | (reviewer) Xem và đổi trạng thái |
| GET | `/admin/seed/stats` | (reviewer) Dữ liệu từ `v_lesson_stats` |

**Nội bộ cho máy chấm** (header `X-Judge-Token`; Caddy chỉ cho phép IP của máy judge)

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/internal/judge/claim` | Thân: `worker_id`, `languages`. Trả 200 (việc) hoặc 204 |
| POST | `/internal/judge/{id}/heartbeat` | Gia hạn `heartbeat_at` |
| POST | `/internal/judge/{id}/tests` | Thân: `results` (mảng kết quả test, cùng trường với `submission_tests`) |
| POST | `/internal/judge/{id}/finish` | Thân: `verdict`, `score`, `max_time_ms`, `max_memory_kb`, `tests_passed`, `tests_total`, `failed_test`, `compile_log` |

Hạ tầng: `GET /healthz` (tiến trình sống), `GET /readyz` (DB, Redis, MinIO đều ổn).

### 9.3 Hợp đồng chi tiết của luồng chấm

Phản hồi 200 của `POST /internal/judge/claim` (ký hiệu YAML cho gọn, thực tế là JSON):

```yaml
submission: {id: 12345, language: cpp17, source_code: '...'}
limits: {time_ms: 1000, memory_mb: 256, output_kb: 65536}
checker: {type: tokens, params: {}, binary_url: null}   # custom: URL presigned tới checker đã biên dịch
scoring: all_or_nothing
test_pack: {version: 3, url: 'https://<minio>/cplearn-tests/problems/nat-big-sum/v3/tests.zip?X-Amz-...', sha256: '...', size_bytes: 1234567}
```

Khi `finish` được gọi, API làm trong một transaction: ghi kết quả vào `submissions`; cập nhật `progress` theo §4.2 mục 5; nếu có `contest_id` thì làm mất cache bảng xếp hạng; cuối cùng publish sự kiện `done` lên kênh Redis `sub:<id>` để SSE đẩy tới trình duyệt (mỗi lô `tests` cũng publish sự kiện `test`). `finish` gọi hai lần cho cùng một bài nộp thì lần sau trả 409 và bị bỏ qua.

## 10. Frontend (Next.js)

### 10.1 Route

| Route | Nội dung | Dữ liệu | Render |
| --- | --- | --- | --- |
| `/` | Giới thiệu, nút Bắt đầu từ cấp 0, số liệu | `/tracks` | SSG + ISR 300 s |
| `/roadmap` | Cây kỹ năng 74 bài học | `/roadmap` | SSR khung, vẽ ở client |
| `/learn` | 7 cấp và bài học của từng cấp | `/tracks`, `/roadmap` | ISR 300 s |
| `/learn/[lessonSlug]` | Bài học: 8 mục, quiz, bài tập theo bậc | `/lessons/{slug}` | ISR 60 s, phần của tôi lấy ở client |
| `/problems` | Danh sách và bộ lọc | `/problems` | Client, đồng bộ query string |
| `/problems/[slug]` | Native: đề và trình soạn thảo. External: thẻ liên kết và ghi chú | `/problems/{slug}` | SSR |
| `/submissions`, `/submissions/[id]` | Lịch sử và chi tiết bài nộp | `/me/submissions`, `/submissions/{id}` | Client |
| `/contests`, `/contests/[slug]`, `/contests/[slug]/standings` | Contest | `/contests/*` | Client |
| `/me` | Bảng tiến độ | `/me/stats`, `/me/progress` | Client |
| `/login`, `/register` | Đăng nhập và đăng ký | `/auth/*` | Client |
| `/admin/review`, `/admin/problems`, `/admin/reports` | Quản trị (noindex) | `/admin/*` | Client |
| `/privacy`, `/terms` | Trang tĩnh |  | SSG |

### 10.2 Thành phần chính

- **RoadmapGraph** (`@xyflow/react` + `dagre`): nút là bài học, cạnh là prerequisite, nhóm theo cấp. Màu: xám = chưa học, xanh dương = đang học (`reading` hoặc có bài `attempted`), xanh lá = `done`; luôn kèm biểu tượng hoặc chữ. Không khóa cứng bài nào. Nút “Học tiếp” chọn bài học đầu tiên (theo cấp rồi thứ tự) chưa `done` mà mọi prerequisite đã `done`.
- **LessonView**: Markdown đã sanitize (§10.5), mục lục 8 mục dính bên trái, khối code có nút Copy, KaTeX, quiz, danh sách bài tập chia 3 tab (Khởi động, Luyện tập, Thử thách). Mỗi dòng bài tập: tiêu đề, badge nguồn, rating CF hoặc nhãn, tag, trạng thái của tôi, biểu tượng “chấm tại đây” (native) hoặc “mở ở nguồn” (external). Bài chưa có bài tập `approved` hiện “Đang cập nhật”.
- **ProblemFilters**: lọc theo cấp, bài học, chủ đề, nguồn, bậc, loại, trạng thái; số đếm facet; đồng bộ URL.
- **ProblemPage (native)**: màn hình ≥ lg chia 2 cột; trái là tab Đề, Bài nộp của tôi, Gợi ý; phải là Monaco (theme theo giao diện), chọn ngôn ngữ, nút Nộp (khóa khi đang chờ chấm). Bản nháp lưu `localStorage` với khóa `draft:<slug>:<lang>`. Mẫu code mặc định cho C++: include `bits/stdc++.h`, `using namespace std;`, `main` có `ios::sync_with_stdio(false); cin.tie(nullptr);`.
- **SubmissionPanel**: nhận SSE từ `/submissions/{id}/events`; nếu lỗi kết nối thì polling 1 s, tối đa 90 s. Hiển thị badge verdict (kèm chữ), bảng test (tên, nhóm, verdict, ms, KB), test mẫu hiện input, output của bạn, đáp án; CE hiện log biên dịch dạng monospace.
- **ExternalProblemCard**: nút “Mở ở \<nguồn>” (`target=_blank`, `rel=noopener noreferrer`), “Tôi đã thử”, “Đã giải”, ô ghi chú, dòng nhắc “Bài này không chấm tại đây”.
- **HintsPanel**: 4 mức; nút “Mở gợi ý tiếp theo” gọi API; lỗi 409 hiển thị thời gian chờ hoặc số lần nộp còn thiếu.
- **Dashboard** (`/me`): biểu đồ radar theo nhóm chủ đề (recharts), thanh tiến độ theo cấp, lịch 30 ngày, bài gần đây, “Bài nên làm tiếp” (bài chưa `solved` thuộc bài học đang học, bậc thấp trước).
- **Admin**: ReviewQueue (lọc cờ vàng, đỏ; xem cạnh nhau bài tập và bài học; duyệt, từ chối, yêu cầu sửa kèm ghi chú), ProblemEditor, TestSetUploader (kéo thả zip, hiện manifest, nút kích hoạt).

### 10.3 Quy ước giao diện

Tiếng Việt qua `next-intl` (mọi chuỗi trong `messages/vi.json`, không hard-code); ngày giờ theo `vi-VN`, múi giờ `Asia/Ho_Chi_Minh`. Sáng/tối theo `prefers-color-scheme` kèm nút chuyển. Responsive từ 360 px. Tiếp cận: tương phản AA, thao tác bằng bàn phím, `aria-label` cho badge verdict, không dùng màu làm kênh thông tin duy nhất. SEO: metadata cho trang bài học và danh sách, `sitemap.xml`, `robots.txt`; `/admin` đặt noindex.

### 10.4 Xác thực ở client

Access token chỉ giữ trong bộ nhớ (không `localStorage`). Khi gặp 401: gọi `/auth/refresh` một lần rồi thử lại; thất bại thì chuyển tới `/login?next=<đường dẫn>`. Dữ liệu gọi bằng TanStack Query; client API sinh từ OpenAPI.

### 10.5 Hiển thị Markdown an toàn

Chuỗi xử lý: `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-sanitize` (schema mặc định, thêm class của KaTeX), tô sáng code bằng `shiki`. Cấm HTML thô trong nội dung. Liên kết ra ngoài tự thêm `target=_blank` và `rel=noopener noreferrer`.

## 11. Bảo mật và vận hành

- **Mật khẩu:** argon2id (time\_cost 3, memory\_cost 64 MiB, parallelism 4); tối thiểu 8 ký tự, không được trùng email; thông báo đăng nhập sai luôn chung chung.
- **JWT:** HS256 với `JWT_SECRET` ≥ 32 byte ngẫu nhiên; claim `sub` (= `users.public_id`), `role`, `exp`. Endpoint admin đọc lại `role` từ DB, không tin claim.
- **CSRF và CORS:** chỉ `/auth/refresh` và `/auth/logout` dùng cookie; yêu cầu header `X-Requested-With: cplearn` và SameSite=Lax. CORS theo allowlist `WEB_ORIGIN`.
- **Header bảo mật** (đặt ở Caddy hoặc Next): CSP chặt (`default-src 'self'`, `frame-ancestors 'none'`, `img-src 'self' data:`, `connect-src 'self'` cùng origin API, `worker-src blob:` cho Monaco), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. Monaco tự host: copy `node_modules/monaco-editor/min/vs` vào `public/monaco/vs` lúc build và cấu hình `loader.config` trỏ về `/monaco/vs` (mặc định Monaco tải từ CDN sẽ bị CSP chặn).
- **Tiêm nhiễm:** chỉ dùng ORM hoặc truy vấn tham số hóa; Markdown phải qua sanitize; API không bao giờ tải URL do người dùng cung cấp (chống SSRF).
- **Upload test set** (chỉ admin): ≤ 100 MB; zip không được chứa đường dẫn tuyệt đối hay `..`, tổng dung lượng giải nén ≤ 500 MB, ≤ 2000 file; sha256 phải khớp manifest.
- **Dữ liệu cá nhân:** chỉ lưu email, tên, handle, hash mật khẩu và bài nộp. Không ghi source code hay mật khẩu vào log; log dạng JSON có `request_id`.
- **Bản quyền:** mọi bài có nút Báo cáo; `reports.target_type = copyright` thì admin ẩn bài (chuyển `archived`) trong ≤ 24 giờ; đề `native` ghi rõ tác giả.
- **Sao lưu:** `pg_dump` hằng đêm lúc 02:00 (giờ Việt Nam), giữ 14 bản ngày và 8 bản tuần; bucket MinIO sao lưu bằng `mc mirror`; mỗi tháng chạy `restore.sh` vào DB tạm để chắc chắn khôi phục được.
- **Giám sát:** log JSON; chỉ số hàng đợi chấm (số bài `queued`, tuổi bài chờ cũ nhất, tỉ lệ verdict `SE`). Cảnh báo khi có > 50 bài chờ liên tục 5 phút, hoặc có bài chờ > 2 phút.

## 12. Triển khai

### 12.1 `docker-compose.yml` và Caddy

Dev dùng thêm `docker-compose.override.yml` để mở cổng db (5432), redis (6379), minio (9000, 9001). API tự tạo bucket `S3_BUCKET` lúc khởi động nếu chưa có (`ensure_bucket()`). Web build với `output: standalone`.

```yaml
services:
  db:
    image: postgres:16
    environment: {POSTGRES_USER: cplearn, POSTGRES_PASSWORD: ${DB_PASSWORD}, POSTGRES_DB: cplearn}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: {test: ['CMD-SHELL', 'pg_isready -U cplearn'], interval: 5s, retries: 10}
  redis:
    image: redis:7
    command: ['redis-server', '--requirepass', '${REDIS_PASSWORD}']
    volumes: [redisdata:/data]
  minio:
    image: minio/minio
    command: ['server', '/data', '--console-address', ':9001']
    environment: {MINIO_ROOT_USER: ${MINIO_USER}, MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}}
    volumes: [miniodata:/data]
  api:
    build: ./apps/api
    env_file: .env
    depends_on: {db: {condition: service_healthy}, redis: {condition: service_started}, minio: {condition: service_started}}
    command: sh -c 'alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers'
  web:
    build: ./apps/web
    env_file: .env
    depends_on: [api]
  caddy:
    image: caddy:2
    ports: ['80:80', '443:443']
    environment: {DOMAIN: ${DOMAIN}, JUDGE_IPS: ${JUDGE_IPS}}
    volumes: ['./deploy/Caddyfile:/etc/caddy/Caddyfile', caddydata:/data]
    depends_on: [web, api, minio]
volumes: {pgdata: {}, redisdata: {}, miniodata: {}, caddydata: {}}
```

`deploy/Caddyfile`:

```text
{$DOMAIN} {
  encode zstd gzip
  header {
    Strict-Transport-Security max-age=31536000
    X-Content-Type-Options nosniff
    Referrer-Policy strict-origin-when-cross-origin
  }
  @internal_blocked {
    path /api/v1/internal/*
    not remote_ip {$JUDGE_IPS}
  }
  handle @internal_blocked {
    respond 403
  }
  @api path /api/* /healthz /readyz
  handle @api {
    reverse_proxy api:8000 {
      flush_interval -1
    }
  }
  handle {
    reverse_proxy web:3000
  }
}

files.{$DOMAIN} {
  @not_judge not remote_ip {$JUDGE_IPS}
  handle @not_judge {
    respond 403
  }
  handle {
    reverse_proxy minio:9000
  }
}
```

`flush_interval -1` bắt buộc để SSE chạy mượt. Chữ ký presigned URL gồm cả host, nên `S3_PUBLIC_ENDPOINT` phải đúng bằng `https://files.<DOMAIN>` (địa chỉ worker dùng), còn API tự ký bằng `S3_ENDPOINT` nội bộ nhưng dùng host công khai khi tạo URL (cấu hình client boto3 thứ hai chỉ để ký).

### 12.2 Biến môi trường (`.env.example` phải có đủ các biến này)

| Biến | Dùng bởi | Mặc định dev | Ghi chú |
| --- | --- | --- | --- |
| `APP_NAME` | web, api | CPLearn | Tên hiển thị |
| `APP_ENV` | tất cả | development | `production` cấm `JUDGE_SANDBOX=dev` |
| `DOMAIN` | caddy | localhost |  |
| `WEB_ORIGIN` | api | http://localhost:3000 | Allowlist CORS |
| `NEXT_PUBLIC_API_BASE` | web | http://localhost:8000/api/v1 | Production: `/api/v1` |
| `DB_PASSWORD`, `DATABASE_URL` | db, api |  | `postgresql+asyncpg://cplearn:<pw>@db:5432/cplearn` |
| `REDIS_PASSWORD`, `REDIS_URL` | redis, api |  | `redis://:<pw>@redis:6379/0` |
| `MINIO_USER`, `MINIO_PASSWORD` | minio |  | Tài khoản gốc MinIO |
| `S3_ENDPOINT` | api | http://minio:9000 | Nội bộ |
| `S3_PUBLIC_ENDPOINT` | api | http://localhost:9000 | Host nằm trong presigned URL |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` | api |  | Bucket `cplearn-tests` |
| `JWT_SECRET` | api |  | ≥ 32 byte ngẫu nhiên (`openssl rand -hex 32`) |
| `ACCESS_TOKEN_MINUTES`, `REFRESH_TOKEN_DAYS` | api | 15, 30 |  |
| `JUDGE_TOKENS` | api |  | Dạng `w0:<token>,w1:<token>`; so sánh hằng thời gian |
| `JUDGE_IPS` | caddy | 127.0.0.1 | IP máy judge, cách nhau bằng dấu cách |
| `RATE_LIMIT_ENABLED` | api | true | Tắt khi chạy test |
| `API_BASE_URL` | judge | http://localhost:8000/api/v1 | Trong `judge.env` |
| `JUDGE_API_TOKEN`, `WORKER_ID` | judge |  | Khớp một mục trong `JUDGE_TOKENS` |
| `JUDGE_SANDBOX` | judge | dev | `isolate` trên máy judge thật |
| `JUDGE_CACHE_DIR`, `JUDGE_CHECKERS_DIR` | judge | /var/lib/judge/cache, /opt/judge/checkers |  |

### 12.3 Cài máy judge (Ubuntu 24.04 LTS, VM riêng, cgroup v2)

Các bước theo README của isolate 2.x; nếu khác thì README của isolate là chuẩn, và ghi tag đã dùng vào một ADR. Kiểm tra cgroup v2: `stat -fc %T /sys/fs/cgroup` phải in `cgroup2fs`.

```bash
#!/usr/bin/env bash
# apps/judge/deploy/install-isolate.sh
set -euo pipefail
sudo apt-get update
sudo apt-get install -y build-essential git pkg-config libcap-dev libsystemd-dev python3 python3-venv g++ asciidoc-base
git clone https://github.com/ioi/isolate.git /tmp/isolate
cd /tmp/isolate
# chọn tag v2.x mới nhất: git tag | sort -V | tail
make isolate isolate-check-environment
sudo make install
sudo systemctl enable --now isolate.service
isolate-check-environment
sudo useradd --system --create-home --shell /usr/sbin/nologin judge || true
sudo mkdir -p /var/lib/judge/cache /opt/judge/checkers /etc/cplearn
sudo chown -R judge:judge /var/lib/judge
# biên dịch checker dựng sẵn
cd /opt/cplearn/apps/judge/checkers
for c in tokens lines float; do g++ -std=c++17 -O2 -o /opt/judge/checkers/$c $c.cpp; done
```

Cấu hình worker: copy `judge.env.example` thành `/etc/cplearn/judge.env` (quyền 600, chủ `judge`), tạo venv và cài `apps/judge`. File `judge-worker@.service` (unit mẫu, `%i` là `box_id`; box i chạy trên lõi CPU i+1, lõi 0 dành cho hệ điều hành):

```ini
[Unit]
Description=CPLearn judge worker box %i
After=network-online.target isolate.service
Wants=network-online.target

[Service]
User=judge
EnvironmentFile=/etc/cplearn/judge.env
WorkingDirectory=/opt/cplearn/apps/judge
ExecStart=/opt/cplearn/apps/judge/.venv/bin/python -m judge.main --box %i
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Bật: `sudo systemctl enable --now judge-worker@0 judge-worker@1 judge-worker@2`. Sau đó chạy `make judge-selftest`; **mọi dòng phải khớp `expected.yaml` thì mới nhận lưu lượng thật.** Thêm vào cây thư mục: `apps/api/app/cli.py` (★: `create-admin`, `create-reviewer`, `reset-password`, `rejudge`) và `content/_snapshots/` (○: bản chụp danh sách CSES và Codeforces cho chế độ `--offline`).

### 12.4 `Makefile`

| Lệnh | Việc làm |
| --- | --- |
| `make dev` | Bật db, redis, minio bằng compose; chạy api (`uvicorn --reload`), web (`pnpm dev`) và worker với `JUDGE_SANDBOX=dev` |
| `make migrate` | `alembic upgrade head` |
| `make seed`, `make seed-offline`, `make seed-report` | Pipeline §6; chạy bằng snapshot; in KPI |
| `make test`, `make e2e`, `make lint`, `make gen-api` | pytest + vitest; Playwright; ruff, mypy, eslint, tsc; sinh client từ OpenAPI |
| `make judge-selftest` | Chạy §7.9 |
| `make build-problem P=<slug>`, `make build-all-problems` | Dựng, kiểm chứng và publish gói bài (§8.3) |
| `make backup` | `deploy/backup.sh` |

### 12.5 Chạy lần đầu (runbook)

1. Clone repo; `cp .env.example .env`; sinh mọi secret bằng `openssl rand -hex 32`.
2. `docker compose up -d db redis minio`, rồi `make migrate`.
3. `make seed` (cần mạng, hoặc `make seed-offline`). Mở PR để reviewer xem `content/`.
4. Tạo admin: `python -m app.cli create-admin --email <email> --handle <handle>`.
5. `docker compose up -d api web caddy`.
6. Cài máy judge (§12.3); `make judge-selftest` phải xanh.
7. `make build-problem P=nat-sum-diff`; nộp thử AC và WA từ giao diện; xem verdict.

## 13. Kiểm thử và CI

### 13.1 Những gì bắt buộc phải có test

| Lớp | Công cụ | Nội dung bắt buộc |
| --- | --- | --- |
| Unit (api, tools) | pytest | Luật tiến độ (§4.2 mục 5); mở hint (§4.2 mục 6); xếp hạng ICPC; `topic_fit` đủ 3 ca ở §6.5; `parse_raw` trên 12 file nền (so số dòng với bảng đếm §2); `verdict.py` với mỗi dòng của bảng §7.4 một file `meta.txt` mẫu; các checker `tokens`, `lines`, `float` |
| Integration (api) | pytest + Postgres và Redis thật | Đăng ký, đăng nhập, refresh xoay vòng (dùng lại token cũ thì thu hồi cả family); 2 worker `claim` đồng thời không nhận trùng; reaper; `finish` gọi hai lần trả 409; xem bài nộp của người khác trả 403; giới hạn tốc độ nộp bài |
| Máy chấm | selftest + pytest | 17 dòng §7.9 khớp `expected.yaml`; `testdata.py` từ chối gói sai sha256; pipeline với API giả (httpx mock) |
| Nội dung | `tools/lessonkit` | Đủ 8 mục; khối ```` ```cpp ```` đầu tiên của mỗi bài học được biên dịch bằng `g++ -std=c++17 -Wall -Wextra` rồi chạy với `sample_io` trong frontmatter, so bằng checker `tokens`; qua thì đặt `code_sample_ok` |
| Seed | pytest | Mọi kiểm tra cứng §6.7 trên dữ liệu thật, cộng fixture nhỏ cho từng nhánh lỗi |
| Web | vitest, Playwright, axe | (1) khách xem roadmap và bài học; (2) đăng ký rồi đánh dấu bài external; (3) nộp AC và WA cho 1 bài native (dùng `JUDGE_SANDBOX=dev`) và thấy verdict; (4) reviewer duyệt 1 dòng `lesson_problems`; (5) kiểm tra tiếp cận bằng axe ở 4 trang chính |
| Tải | k6 hoặc script Python | 50 bài nộp đồng thời với 3 worker: mọi bài có verdict trong ≤ 60 s, không bài nào bị chấm 2 lần |

### 13.2 GitHub Actions

- `ci.yml` (mọi PR): lint (ruff, mypy, eslint, tsc), `api-test` (service container postgres:16 và redis:7), `web-test`, `content-lint`, build web.
- `seed-validate.yml` (PR đụng `content/**`): chạy `make seed-offline` với `content/_snapshots/` rồi các kiểm tra §6.7. Một workflow theo lịch hằng tuần (`seed-refresh.yml`) tải snapshot mới, chạy `check_links`, và mở PR báo link hỏng.
- `judge-selftest.yml`: cài isolate bằng script ở §12.3 rồi chạy `make judge-selftest`. Nếu runner của GitHub không hỗ trợ cgroup thì chạy trên runner tự host gắn nhãn `judge`. Kèm job ma trận: với mỗi `content/problems/native/*` bị sửa, chạy `build` và `verify`.
- Bảo vệ nhánh `main`: bắt buộc CI xanh và ≥ 1 review.

### 13.3 Định nghĩa “xong” cho một PR code

Lint xanh; có test cho logic mới; nếu đổi API thì đã `make gen-api`; nếu đổi schema thì có migration mới; nếu đổi khung thì có ADR.

## 14. Lộ trình triển khai

Ước lượng cho 2 đến 3 lập trình viên. Có hai luồng chạy song song: **luồng dev** (bảng dưới) và **luồng nội dung** (cuối mục).

### 14.1 Luồng dev

| Sprint | Mục tiêu | Nghiệm thu (kiểm tra được) |
| --- | --- | --- |
| S0 (3–4 ngày) | Nền móng: repo, CI, compose, migration `0001_init`, `tracks.yaml`, `/healthz` | `make dev` chạy; `alembic upgrade head` tạo đúng 23 bảng và 1 view; CI xanh |
| S1 (2 tuần) | Pipeline nội dung: `tools/seed` đủ 9 bước, nạp 74 bài học và toàn bộ dòng bài tập thô, báo cáo KPI | `make seed` chạy hai lần liên tiếp, lần hai không có diff; 3 ca `topic_fit` xanh; `cses_mismatch.csv` rỗng hoặc đã xử lý; mọi kiểm tra §6.7 xanh |
| S2 (2 tuần) | API đọc và web đọc: `/tracks`, `/roadmap`, `/lessons`, `/problems`, `/topics`; landing, roadmap, learn, problems; i18n, chế độ tối | Roadmap hiện đủ 74 nút và đúng cạnh; lọc theo cấp và chủ đề đúng; điểm tiếp cận Lighthouse ≥ 90 ở 4 trang chính |
| S3 (2 tuần) | Tài khoản và tiến độ: auth đầy đủ, progress, mark external, hints, quiz, dashboard `/me` | Test tích hợp auth xanh; e2e (1) và (2) xanh |
| S4 (2–3 tuần) | Máy chấm lõi: sandbox isolate và dev, pipeline, 3 checker dựng sẵn, API claim/finish, reaper, SSE | 17/17 selftest khớp; claim đồng thời không trùng; tắt worker giữa chừng thì bài được chấm lại trong ≤ 2 phút |
| S5 (2–3 tuần) | Problemkit và bộ test: `build`, `verify`, `publish`; viết 14 bài native cấp 0; TestSetUploader; ProblemPage và SubmissionPanel | Mỗi bài qua `verify`; e2e (3) xanh trên staging với isolate thật |
| S6 (2 tuần) | Duyệt và phát hành đợt 1: ReviewQueue, 19 bài native cấp 1–2, duyệt bài ngoài | Checklist Phụ lục E đạt cho 38 bài học cấp 0–3; mỗi bài học ≥ 3 bài `approved`; `code_sample_ok` đều true. **Phát hành đợt 1** |
| S7 (2 tuần) | Contest và bảng xếp hạng, Python 3 (hệ số 3×), siết rate limit, sao lưu và khôi phục, giám sát, test tải | Test tải đạt; khôi phục thử thành công; kiểm tra bảo mật §11 xong |

Đợt 2 (cấp 4–6): theo luồng nội dung, thêm bài native cho cấp 3–4, hỗ trợ chấm subtask nếu cần.

### 14.2 Luồng nội dung (song song từ S1)

Trình tự mỗi bài học: seed ra khung → viết 8 mục theo Phụ lục D → viết code mẫu chạy được và `sample_io` → viết quiz ≥ 3 câu → chọn và duyệt 5 đến 10 bài tập → gửi duyệt. Năng suất dự kiến 3 đến 4 bài học mỗi tuần cho hai người; 38 bài học đợt 1 mất khoảng 10 tuần, vì vậy luồng nội dung, không phải luồng dev, quyết định ngày phát hành đợt 1. Ưu tiên theo thứ tự cấp 0, 1, 2, 3.

### 14.3 Rủi ro chính

| Rủi ro | Cách giảm |
| --- | --- |
| Viết nội dung chậm | Luồng riêng, ưu tiên cấp 0–3, template và lint tự động, mỗi bài học chỉ 8 mục cố định |
| isolate hoặc cgroup khó cài | Máy judge là VM Ubuntu 24.04 riêng; selftest bắt buộc; có sandbox `dev` để phát triển |
| Bản quyền | Chỉ lưu link; bài native tự viết; nút Báo cáo; `license_note`; ẩn trong 24 giờ khi có khiếu nại |
| Dữ liệu seed bẩn | Importer `--strict`, dòng bổ sung vào `pending`, `topic_fit`, reviewer duyệt từng dòng |
| Thời gian chạy không ổn định | Khóa lõi CPU, chạy lại khi sát giới hạn, TL của bài native ≥ 2 lần thời gian chạy của lời giải chuẩn |
| Link nguồn ngoài đổi hoặc chết | `seed-refresh.yml` hằng tuần; `link_ok = false` thì tự ẩn khỏi người học |

## 15. Thứ tự viết code (10 việc đầu tiên)

1. `apps/api/alembic/versions/0001_init.py` từ DDL §4.1, kèm `content/taxonomy/tracks.yaml` (Phụ lục C).
2. `content/taxonomy/lessons.yaml` (Phụ lục A) và `topics.yaml` (Phụ lục B).
3. `tools/seed/parse_raw.py` cùng test chạy trên 12 file nền (so số dòng với bảng đếm ở §2).
4. Phần còn lại của `tools/seed/` (§6.3 đến §6.6), rồi `make seed-report`.
5. `models/`, `schemas/`, `routers/catalog.py`, `routers/problems.py` (API đọc), cùng web đọc (§10).
6. `routers/auth.py`, `services/progress.py`, `services/hints.py` (§4.2, §9).
7. `apps/judge/judge/sandbox/isolate.py`, `verdict.py`, `compile.py`, `runner.py`, `checker.py`, kèm selftest (§7).
8. `routers/internal_judge.py`, `jobs/reaper.py`, SSE (§7.1, §9.3), rồi `pipeline.py` và `main.py` của worker.
9. `tools/problemkit/` (§8.3 và §8.4); dựng bài đầu tiên `nat-sum-diff` làm mẫu cho cả đội.
10. `ProblemPage` và `SubmissionPanel` (§10.2), rồi e2e (3) ở §13.1.

## Phụ lục A. Danh sách 74 bài học (nguồn chuẩn cho `lessons.yaml`)

Cột Tag liệt kê **tất cả** tag của bài học (slug dạng gạch ngang). Tag thuộc nhóm “chung” ở Phụ lục B.1 không tính khi so khớp cụ thể (§6.5). Ký hiệu `a..b` nghĩa là mọi bài học từ a đến b trong cùng cấp. Dấu `*` nghĩa là bài Tổng hợp (`fit_check = false`). Các prerequisite đã sửa so với schema\_db: 6.1, 6.5, 6.7 (xem §2, mục 10).

| Mã | Slug | Tên | Prereq | Tag |
| --- | --- | --- | --- | --- |
| 0.1 | `cpp-syntax-io` | Cú pháp C++ và I/O | – | io, implementation |
| 0.2 | `data-types-overflow` | Kiểu dữ liệu và tràn số | 0.1 | overflow, data-types, math |
| 0.3 | `loops-arrays-functions` | Vòng lặp, mảng, hàm | 0.1, 0.2 | arrays, loops, functions, implementation |
| 0.4 | `constraints-complexity` | Đọc đề và độ phức tạp | 0.3 | complexity, frequency-count, implementation |
| 0.5 | `simulation-basic` | Mô phỏng đơn giản | 0.3 | simulation, implementation |
| 0.6 | `strings-basic` | Chuỗi cơ bản | 0.3 | string-basics, strings |
| 0.7 | `math-basic` | Toán cơ bản | 0.2 | gcd-lcm, modulo, primality-basic, math, number-theory |
| 0.8 | `level0-review` | Tổng hợp cấp 0 | 0.1..0.7 | \* |
| 1.1 | `brute-force` | Brute force | 0.3 | brute-force, bitmasks, backtracking |
| 1.2 | `sorting` | Sắp xếp | 0.3 | sortings, comparator |
| 1.3 | `strings-advanced` | Xử lý chuỗi nâng cao | 0.6 | string-search, char-count, strings |
| 1.4 | `math-intermediate` | Toán cơ bản nâng cao | 0.7 | primes, divisors, math, number-theory |
| 1.5 | `simulation-advanced` | Mô phỏng nâng cao | 0.5 | simulation, implementation |
| 1.6 | `ad-hoc` | Ad hoc | 1.1 | ad-hoc, constructive |
| 1.7 | `greedy-basic` | Tham lam cơ bản | 1.2 | greedy, interval-scheduling |
| 1.8 | `two-pointers-intro` | Hai con trỏ (giới thiệu) | 1.2 | two-pointers |
| 1.9 | `prefix-sum-intro` | Prefix sum (giới thiệu) | 0.3 | prefix-sum |
| 1.10 | `level1-review` | Tổng hợp cấp 1 | 1.1..1.9 | \* |
| 2.1 | `stl-containers` | STL | 0.3 | stl, set-map, priority-queue, data-structures |
| 2.2 | `prefix-sum-advanced` | Prefix sum nâng cao | 1.9 | prefix-sum, prefix-sum-2d, sliding-window |
| 2.3 | `two-pointers-advanced` | Hai con trỏ nâng cao | 1.8 | two-pointers, sliding-window |
| 2.4 | `binary-search` | Tìm kiếm nhị phân | 1.2 | binary-search, binary-search-answer |
| 2.5 | `greedy-advanced` | Tham lam nâng cao | 1.7 | greedy, interval-scheduling, scheduling |
| 2.6 | `counting-hash-basic` | Đếm, hash cơ bản | 2.1 | counting, hash-map, data-structures |
| 2.7 | `sieve` | Sàng nguyên tố | 1.4 | sieve, number-theory |
| 2.8 | `fast-power` | Lũy thừa nhanh | 1.4 | fast-power, modpow, number-theory |
| 2.9 | `binomial-mod` | Tổ hợp mod p | 2.8 | binomial-mod, modular-inverse, combinatorics |
| 2.10 | `level2-review` | Tổng hợp cấp 2 | 2.1..2.9 | \* |
| 3.1 | `dp-basic` | DP cơ bản | 2.4 | knapsack, lis, lcs, edit-distance, dp |
| 3.2 | `dp-grid` | DP trên grid | 3.1 | grid-dp, dp |
| 3.3 | `dfs-bfs` | DFS và BFS | 2.1 | dfs, bfs, connected-components, graphs |
| 3.4 | `dsu` | DSU | 3.3 | dsu, graphs |
| 3.5 | `sieve-advanced` | Sàng nguyên tố nâng cao | 2.7 | linear-sieve, spf, number-theory |
| 3.6 | `matrix-exponentiation` | Lũy thừa ma trận | 2.8 | matrix-exp, math |
| 3.7 | `binomial-advanced` | Tổ hợp mod p nâng cao | 2.9 | lucas, catalan, binomial-mod, combinatorics |
| 3.8 | `dp-divisors` | DP kết hợp sàng ước | 3.1, 3.5 | divisor-dp, dp, number-theory |
| 3.9 | `dp-dag` | DP trên DAG | 3.1, 3.3 | dag-dp, topo-sort, dp, graphs |
| 3.10 | `level3-review` | Tổng hợp cấp 3 | 3.1..3.9 | \* |
| 4.1 | `dijkstra` | Dijkstra | 3.3 | dijkstra, shortest-paths, graphs |
| 4.2 | `bellman-ford` | Bellman-Ford | 4.1 | bellman-ford, negative-cycle, shortest-paths, graphs |
| 4.3 | `floyd-warshall` | Floyd-Warshall | 4.1 | floyd-warshall, shortest-paths, graphs |
| 4.4 | `mst` | MST (Kruskal, Prim) | 3.4 | mst, kruskal, prim, dsu, graphs |
| 4.5 | `topological-sort` | Sắp xếp topo | 3.3 | topo-sort, graphs |
| 4.6 | `fenwick` | Fenwick (BIT) | 2.2 | fenwick, data-structures |
| 4.7 | `segment-tree` | Segment tree | 4.6 | segment-tree, lazy-propagation, data-structures |
| 4.8 | `sparse-table` | Sparse table | 4.7 | sparse-table, rmq, data-structures |
| 4.9 | `bitmask-dp` | Bitmask DP | 3.1 | bitmask-dp, bitmasks, dp |
| 4.10 | `tree-dp` | DP trên cây | 3.1, 3.3 | tree-dp, rerooting, dp, trees |
| 4.11 | `hashing` | Hashing | 2.6 | string-hash, hashing, strings |
| 4.12 | `kmp-z-function` | KMP, Z-function | 4.11 | kmp, z-function, strings |
| 5.1 | `lca` | LCA (binary lifting) | 4.10 | lca, binary-lifting, trees |
| 5.2 | `hld` | HLD | 4.7, 5.1 | hld, trees, data-structures |
| 5.3 | `centroid-decomposition` | Centroid decomposition | 5.1 | centroid, divide-and-conquer, trees |
| 5.4 | `scc` | SCC (Tarjan, Kosaraju) | 3.3 | scc, 2-sat, graphs |
| 5.5 | `bridges-articulation` | Cầu và khớp | 5.4 | bridges, articulation-points, graphs |
| 5.6 | `max-flow` | Max flow | 3.3 | max-flow, min-cut, flows, graphs |
| 5.7 | `matching` | Ghép cặp | 5.6 | bipartite-matching, hungarian, graphs |
| 5.8 | `convex-hull-trick` | CHT | 3.1 | cht, dp |
| 5.9 | `dnc-optimization` | D&C optimization | 3.1 | dnc-opt, divide-and-conquer, dp |
| 5.10 | `mo-algorithm` | Mo's algorithm | 4.7 | mo, data-structures |
| 5.11 | `sqrt-decomposition` | Sqrt decomposition | 4.7 | sqrt-decomp, data-structures |
| 5.12 | `sprague-grundy` | Sprague-Grundy | 3.1 | sprague-grundy, nim, games |
| 6.1 | `fft-ntt` | FFT/NTT | 2.8, 3.6 | fft-ntt, math |
| 6.2 | `persistent-segment-tree` | Persistent segment tree | 4.7 | persistent-seg, data-structures |
| 6.3 | `li-chao-tree` | Li Chao tree | 5.8 | li-chao, cht, data-structures, dp |
| 6.4 | `link-cut-tree` | Link-Cut tree | 5.2 | link-cut, splay, trees, data-structures |
| 6.5 | `computational-geometry` | Hình học tính toán | 1.2 | geometry, convex-hull, line-intersection |
| 6.6 | `min-cost-flow` | Min-cost flow | 5.6 | min-cost-flow, flows, graphs |
| 6.7 | `matroid` | Matroid | 4.4, 5.6 | matroid, greedy, math |
| 6.8 | `broken-profile-dp` | Broken profile DP | 4.9 | broken-profile, bitmasks, dp |
| 6.9 | `tree-dp-advanced` | DP trên cây nâng cao | 4.10 | rerooting, small-to-large, dp, trees |
| 6.10 | `suffix-automaton-eertree` | Suffix Automaton, Eertree | 4.12 | suffix-automaton, eertree, strings |
| 6.11 | `level6-review-1` | Tổng hợp cấp 6, phần 1 | 6.1..6.10 | \* |
| 6.12 | `level6-review-2` | Tổng hợp cấp 6, phần 2 | 6.11 | \* |

Kiểm tra: 8 + 10 + 10 + 10 + 12 + 12 + 12 = **74** dòng.

## Phụ lục B. Từ vựng chủ đề (`topics.yaml`)

### B.1 Tag chung (`is_generic = true`)

`implementation`, `math`, `graphs`, `trees`, `data-structures`, `strings`, `dp`, `number-theory`, `combinatorics`, `constructive`. Mọi tag khác (kể cả `greedy`, `sortings`, `brute-force`, `binary-search`, `two-pointers`, `bitmasks`, `hashing`, `geometry`, `games`, `flows`, `dsu`, `shortest-paths`…) là tag **cụ thể**. Tag cụ thể xuất hiện ở Phụ lục A mà chưa có trong `topics.yaml` thì seed tự tạo, kèm `name_vi`.

### B.2 Tag Codeforces sang slug

`implementation`, `math`, `greedy`, `dp`, `graphs`, `trees`, `strings`, `brute force` (thành `brute-force`), `sortings`, `number theory` (`number-theory`), `combinatorics`, `constructive algorithms` (`constructive`), `data structures` (`data-structures`), `dfs and similar` (`dfs`), `binary search` (`binary-search`), `two pointers` (`two-pointers`), `bitmasks`, `hashing`, `geometry`, `games`, `flows`, `graph matchings` (`bipartite-matching`), `dsu`, `shortest paths` (`shortest-paths`), `divide and conquer` (`divide-and-conquer`), `fft` (`fft-ntt`), `matrices` (`matrix-exp`), `string suffix structures` (`suffix-automaton`), `probabilities`, `interactive`, `schedules` (`scheduling`), `2-sat`, `meet-in-the-middle`.

Quy tắc suy ra tag cụ thể khi tag CF đi cùng nhau: `dp` + `trees` thêm `tree-dp`; `dp` + `bitmasks` thêm `bitmask-dp`; `graphs` + `dfs and similar` thêm `dfs`. Dòng `auto_rejected` vẫn nằm trong DB; reviewer có thể chuyển thủ công sang `pending` kèm ghi chú.

### B.3 Nhãn tiếng Việt và nhãn riêng trong file nền sang slug (danh sách khởi đầu)

Chữ thường, so sau khi gộp khoảng trắng. Phần còn thiếu sẽ hiện ra ở `unmapped_labels.txt` ngay lần chạy đầu và được bổ sung vào `topics.yaml`; nhãn nào reviewer xác nhận là không thuộc chủ đề nào thì ánh xạ rõ ràng sang `misc`.

- Chung: `toán`, `chia hết`, `chia` → `math`; `số học` → `number-theory`; `chuỗi` → `strings`; `đồ thị` → `graphs`; `cây` → `trees`; `dp`, `dp cơ bản`, `dp, tối ưu`, `kadane` → `dp`; `xây dựng` → `constructive`; `tổ hợp`, `sinh tổ hợp`, `permutation` → `combinatorics`; `mô phỏng` → `simulation`; `điều kiện`, `mảng`, `vòng lặp`, `đếm` → `implementation` (riêng `đếm` còn thêm `counting`).
- Kỹ thuật: `tham lam` → `greedy`; `sắp xếp` → `sortings`; `brute force` → `brute-force`; `backtracking` → `backtracking`; `bitmask`, `hamming`, `subgrids` → `bitmasks`; `hai con trỏ`, `two pointers` → `two-pointers`; `binary search` → `binary-search`; `sliding window` → `sliding-window`; `prefix`, `prefix sum` → `prefix-sum`; `2d prefix` → `prefix-sum-2d`; `interval`, `sự kiện` → `interval-scheduling`; `median` → `greedy`; `chia để trị` → `divide-and-conquer`; `xác suất` → `probabilities`; `game` → `games`.
- Cấu trúc dữ liệu: `set`, `multiset` → `set-map`; `hash` → `hash-map`; `hash, offline` → `hashing`; `deque` → `data-structures`; `fenwick tree` → `fenwick`; `segment tree` → `segment-tree`; `lazy` → `lazy-propagation`; `sparse table` → `sparse-table`; `persistent segment tree` → `persistent-seg`.
- Đồ thị và cây: `bfs` → `bfs`; `dfs` → `dfs`; `dsu` → `dsu`; `mst` → `mst`; `dijkstra`, `layered graph` → `dijkstra`; `bellman-ford` → `bellman-ford`; `negative cycle` → `negative-cycle`; `floyd-warshall` → `floyd-warshall`; `topological sort` → `topo-sort`; `dp trên dag` → `dag-dp`; `dp trên cây`, `dp trên cây/graph` → `tree-dp`; `rerooting` → `rerooting`; `lca` → `lca`; `binary lifting` → `binary-lifting`; `centroid` → `centroid`; `hld` → `hld`; `bridges` → `bridges`; `articulation points` → `articulation-points`; `scc` → `scc`; `max flow min cost` → `min-cost-flow`; `link-cut tree` → `link-cut`.
- Khác: `knapsack` → `knapsack`; `lis` → `lis`; `dp chuỗi` → `lcs`; `dp grid`, `grid` → `grid-dp`; `lũy thừa nhanh`, `lũy thừa` → `fast-power`; `sàng`, `sàng, ước số` → `sieve`; `ước số` → `divisors`; `tổ hợp mod p` → `binomial-mod`; `matrix` → `matrix-exp`; `fft`, `ntt`, `convolution` → `fft-ntt`; `hình học`, `geometry` → `geometry`; `convex hull` → `convex-hull`; `cht` → `cht`; `li chao tree` → `li-chao`; `broken profile dp` → `broken-profile`; `meet in the middle` → `meet-in-the-middle`.

## Phụ lục C. Bảng cấp (`tracks.yaml`) và quy đổi độ khó

### C.1 Cấp

| Cấp | Tên | Thời lượng | Mục tiêu học viên (`cf_rating_range`) | Dải rating bài (`problem_rating_min` đến `max`) | Đợt phát hành |
| --- | --- | --- | --- | --- | --- |
| 0 | Nhập môn | 2–3 tuần | Chạy đúng code C++ cơ bản | 800–1000 | 1 |
| 1 | Cơ bản | 1–2 tháng | \~800–1000 | 800–1200 | 1 |
| 2 | Cơ bản+ | 1–2 tháng | \~1000–1200 | 1000–1400 | 1 |
| 3 | Trung cấp 1 | 2–3 tháng | \~1200–1500 | 1200–1500 | 1 |
| 4 | Trung cấp 2 | 2–3 tháng | \~1500–1800 | 1500–1800 | 2 |
| 5 | Nâng cao | 3–6 tháng | \~1800–2100 | 1800–2100 | 2 |
| 6 | Chuyên gia | Dài hạn | 2100+ | 2000–2300 | 2 |

Quy tắc kiểm tra: rating ngoài \[min, max\] thì cảnh báo; ngoài \[min − 200, max + 400\] thì chặn publish.

### C.2 Quy đổi sang 3 bậc (`tier` và `difficulty`)

- Nhãn chữ Khởi động, Luyện tập, Thử thách: giữ nguyên.
- Codeforces có rating r, cấp có dải \[lo, hi\]: r ≤ lo + (hi − lo) / 3 thì Khởi động; r ≤ lo + 2 × (hi − lo) / 3 thì Luyện tập; còn lại Thử thách. Thiếu rating thì Luyện tập.
- AtCoder DP: `dp_a` đến `dp_c` Khởi động; `dp_d` đến `dp_m` Luyện tập; `dp_n` đến `dp_z` Thử thách. Nhãn `D` trong file nền bị bỏ qua.
- Library Checker (nhãn `-`): Thử thách.

## Phụ lục D. Mẫu file bài học và quiz

File `content/lessons/L4/4.1-dijkstra.md` gồm frontmatter YAML rồi đúng 8 mục:

```yaml
---
code: '4.1'
slug: dijkstra
title: Dijkstra
track: 4
prereqs: ['3.3']
topics: [dijkstra, shortest-paths, graphs]
complexity: O((V + E) log V)
fit_check: true
sources:
  - {kind: handbook, title: 'CSES Handbook, chương 7: Dijkstra', url: 'https://cses.fi/book/book.pdf'}
  - {kind: cp-algorithms, title: 'CP-Algorithms: Dijkstra', url: 'https://cp-algorithms.com/'}
sample_io:
  - {input: '3 3\n1 2 5\n2 3 4\n1 3 20\n', output: '0 5 9'}
status: draft
---
```

| # | Tiêu đề mục (đúng chữ) | Nội dung |
| --- | --- | --- |
| 1 | `## Mục tiêu học` | 3 gạch đầu dòng bắt đầu bằng động từ (nhận diện, cài đặt, phân tích…) |
| 2 | `## Điều kiện tiên quyết` | Liên kết tới các bài học trong `prereqs` |
| 3 | `## Lý thuyết` | Khái niệm, công thức (KaTeX), ví dụ tay từng bước; tự viết lại, ghi nguồn trong `sources` |
| 4 | `## Code mẫu C++` | Khối ```` ```cpp ```` đầu tiên là code mẫu chạy được (CI biên dịch và chạy với `sample_io`), tiếp theo là dòng `Độ phức tạp: ...` |
| 5 | `## Lỗi thường gặp` | ≥ 3 gạch đầu dòng, mỗi dòng nêu lỗi và dấu hiệu nhận biết |
| 6 | `## Bài tập theo bậc` | Chỉ để chú thích biên tập; danh sách thật sinh từ DB (`lesson_problems`) |
| 7 | `## Gợi ý mở khóa dần` | Danh sách 4 mục: gợi ý nhẹ, hướng tiếp cận, ý tưởng chính, link tới code mẫu; nạp vào `lessons.hints` |
| 8 | `## Bài kiểm tra cuối chủ đề` | Chỉ ghi tham chiếu; nội dung đọc từ `content/quizzes/<code>.yaml` |

`content/quizzes/4.1.yaml` (≥ 3 câu, đúng 1 đáp án, không dùng dấu nháy đơn trong chuỗi):

```yaml
- q: Dijkstra không dùng được khi đồ thị có đặc điểm nào?
  options: [Có cạnh trọng số âm, Đồ thị có hướng, Đồ thị thưa, Có nhiều cạnh song song]
  answer_index: 0
  explain: Dijkstra giả định mọi trọng số không âm; khi có cạnh âm phải dùng Bellman-Ford.
```

## Phụ lục E. Danh sách kiểm tra khi duyệt

### E.1 Bài học

- [ ] Đủ 8 mục, đúng thứ tự và đúng tiêu đề; tiếng Việt rõ ràng.
- [ ] ≥ 2 nguồn trong `sources`; nội dung tự viết lại, không chép nguyên văn dài.
- [ ] Có ít nhất 1 ví dụ chạy tay từng bước.
- [ ] Code mẫu biên dịch sạch với `-Wall -Wextra`, qua `sample_io`, có độ phức tạp, đúng ở ràng buộc điển hình.
- [ ] ≥ 3 lỗi thường gặp cụ thể.
- [ ] Đủ 4 mức gợi ý.
- [ ] Quiz ≥ 3 câu, mỗi câu có giải thích và chỉ 1 đáp án đúng.
- [ ] ≥ 3 bài tập `approved` (mục tiêu 5–10), đủ cả 3 bậc nếu có thể.
- [ ] Prerequisite đúng, không tạo vòng.

### E.2 Bài tập `external`

- [ ] Link mở được, đúng đề, không phải trang đăng nhập (`link_ok = true`).
- [ ] `source_id` khớp tên bài ở nguồn (kết quả `resolve_*`).
- [ ] Chủ đề khớp bài học (xem cờ `topic_fit`), rating trong dải, bậc hợp lý.
- [ ] Có `editorial_url` nếu nguồn có; `license_note` đã điền.

### E.3 Bài tập `native`

- [ ] Đề tự viết, có tác giả, không trùng đề công khai; ví dụ trong đề khớp `tests/manual/sample-*`.
- [ ] `verify` xanh; đủ số test tối thiểu và đủ mục trong ma trận §8.5.
- [ ] Reviewer đã tự chạy lại `make build-problem` và đọc đề thấy không mơ hồ.
- [ ] TL ≥ 2 lần thời gian lớn nhất của `sol/ac`; ML hợp lý.
- [ ] Có đủ 4 mức gợi ý.

### E.4 Phát hành đợt 1 (toàn hệ thống)

- [ ] CI xanh; `make seed` chạy lại không đổi gì.
- [ ] 38 bài học cấp 0–3 ở trạng thái `published`, 100% `code_sample_ok`.
- [ ] Mỗi bài học ≥ 3 bài `approved`; ≥ 33 bài `native` đã `published`.
- [ ] Selftest 17/17; đã thử sao lưu và khôi phục.
- [ ] Đã rà soát danh sách bảo mật ở §11; có trang `/privacy` và `/terms`.
- [ ] Kênh báo lỗi và báo bản quyền hoạt động, người nhận báo cáo đã được chỉ định.
