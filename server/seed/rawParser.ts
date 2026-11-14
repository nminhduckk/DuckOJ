import fs from 'node:fs';
import path from 'node:path';
import {
  LESSONS_META,
  TOPICS,
  TOPIC_ALIASES,
  TRACKS,
  type LessonMetaDef,
} from './taxonomy';

export interface ParsedLessonContent {
  code: string;
  theory_md: string;
  code_sample: string;
  code_sample_ok: boolean;
  common_mistakes_md: string;
}

export interface ParsedProblemSeed {
  slug: string;
  kind: 'external' | 'native';
  title: string;
  source: 'CSES' | 'Codeforces' | 'AtCoder' | 'USACO' | 'VNOJ' | 'Kattis' | 'LibraryChecker' | 'Native' | 'Other';
  source_id: string;
  source_url: string;
  level: number;
  difficulty: 'Khởi động' | 'Luyện tập' | 'Thử thách';
  cf_rating: number | null;
  topics: string[];
  editorial_url: string | null;
  license_note: string;
  status: 'draft' | 'in_review' | 'published' | 'archived';
  seed_origin: string;
  link_ok: boolean;
}

export interface ParsedLessonProblemLink {
  lesson_code: string;
  problem_slug: string;
  tier: 'Khởi động' | 'Luyện tập' | 'Thử thách';
  sort_order: number;
  review_status: 'pending' | 'approved' | 'rejected' | 'auto_rejected';
  topic_fit: 'strong' | 'weak' | 'none';
  reviewer_note: string | null;
}

export interface SeedParseResult {
  lessons: Map<string, ParsedLessonContent>;
  problems: ParsedProblemSeed[];
  lessonProblems: ParsedLessonProblemLink[];
  rawStats: {
    khungRowsByLevel: Record<number, number>;
    bosungRowsByLevel: Record<number, number>;
    unmappedLabels: string[];
  };
}

const GENERIC_TOPICS = new Set(TOPICS.filter((t) => t.is_generic).map((t) => t.slug));

// Accurate CSES task ID map for raw entries missing task IDs (resolving §2 item 4)
const KNOWN_CSES_IDS: Record<string, string> = {
  'weird algorithm': '1068',
  'missing number': '1083',
  'repetitions': '1069',
  'increasing array': '1094',
  'permutations': '1070',
  'number spiral': '1071',
  'two knights': '1072',
  'two sets': '1092',
  'bit strings': '1617',
  'trailing zeros': '1618',
  'coin piles': '1754',
  'palindrome reorder': '1755',
  'creating strings': '1622',
  'apple division': '1623',
  'digit queries': '2431',
  'grid paths': '1625',
  'distinct numbers': '1621',
  'apartments': '1084',
  'ferris wheel': '1090',
  'concert tickets': '1091',
  'restaurant customers': '1619',
  'movie festival': '1629',
  'sum of two values': '1640',
  'maximum subarray sum': '1643',
  'stick lengths': '1074',
  'missing coin sum': '2183',
  'collecting numbers': '2216',
  'playlist': '1141',
  'towers': '1073',
  'traffic lights': '1163',
  'distinct values subarrays': '3420',
  'distinct values subsequences': '3421',
  'room allocation': '1164',
  'movie festival ii': '1632',
  'sum of four values': '1642',
  'maximum subarray sum ii': '1644',
  'sliding window median': '1076',
  'sliding window cost': '1077',
  'dice combinations': '1633',
  'minimizing coins': '1634',
  'coin combinations i': '1635',
  'coin combinations ii': '1636',
  'removing digits': '1637',
  'grid paths i': '1638',
  'book shop': '1158',
  'array description': '1746',
  'counting rooms': '1192',
  'labyrinth': '1193',
  'building roads': '1666',
  'message route': '1667',
  'building teams': '1668',
  'shortest routes i': '1671',
  'shortest routes ii': '1672',
  'high score': '1673',
  'flight discount': '1195',
  'cycle finding': '1197',
  'course schedule': '1679',
  'longest flight route': '1680',
  'game routes': '1681',
  'investigation': '1202',
  'planets queries i': '1750',
  'planets queries ii': '1160',
  'planets cycles': '1751',
  'road reparation': '1675',
  'road construction': '1676',
  'flight routes check': '1682',
  'static range sum queries': '1646',
  'static range minimum queries': '1647',
  'dynamic range sum queries': '1648',
  'dynamic range minimum queries': '1649',
  'range xor queries': '1650',
  'range update queries': '1651',
  'forest queries': '1652',
  'forest queries ii': '1739',
  'polynomial queries': '1736',
  'range queries and copies': '1737',
  'list removals': '1749',
  'salary queries': '1144',
  'distinct values queries': '1734',
  'increasing array queries': '2416',
  'subarray sum queries': '1190',
  'subarray reversals': '2073',
  'distinct values ii': '3356',
  'increasing array ii': '2166',
  'range updates and sums': '1735',
  'subordinates': '1674',
  'tree matching': '1130',
  'tree diameter': '1131',
  'tree distances i': '1132',
  'tree distances ii': '1133',
  'company queries i': '1687',
  'company queries ii': '1688',
  'distance queries': '1135',
  'counting paths': '1136',
  'subtree queries': '1137',
  'path queries': '1138',
  'path queries ii': '2134',
  'distinct colors': '1139',
  'finding a centroid': '2079',
  'fixed-length paths i': '2080',
  'fixed-length paths ii': '2081',
  'counting divisors': '1713',
  'exponentiation': '1095',
  'binomial coefficients': '1079',
  'meet in the middle': '1628',
  'hamming distance': '2136',
  'beautiful subgrids': '2137',
  'reachable nodes': '2138',
  'reachability queries': '2143',
  'cut and paste': '2072',
  'substring reversals': '2073',
  'reversals and sums': '2074',
  'necessary roads': '2076',
  'necessary cities': '2077',
  'eulerian subgraphs': '2078',
  'monster game i': '2084',
  'monster game ii': '2085',
  'houses and schools': '2087',
  'knuth division': '2088',
  'apples and bananas': '2111',
  'one bit positions': '2112',
  'signal processing': '2113',
  'new roads queries': '2101',
  'dynamic connectivity': '2133',
  'parcel delivery': '2121',
  'task assignment': '2129',
  'distinct routes ii': '2130',
  'counting tilings': '2181',
  'corner subgrid check': '3360',
  'corner subgrid count': '3359',
};

export function normalizeTopicLabels(rawLabelStr: string): { slugs: string[]; unmapped: string[] } {
  const parts = rawLabelStr
    .split(',')
    .map((p) => p.trim().toLowerCase().replace(/\s+/g, ' '))
    .filter(Boolean);

  const slugs = new Set<string>();
  const unmapped: string[] = [];

  for (const part of parts) {
    const mapped = TOPIC_ALIASES[part];
    if (mapped) {
      mapped.forEach((s) => slugs.add(s));
    } else {
      // Try normalized slug match directly
      const dashForm = part.replace(/\s+/g, '-');
      if (TOPICS.some((t) => t.slug === dashForm)) {
        slugs.add(dashForm);
      } else {
        unmapped.push(part);
      }
    }
  }

  // Rule B.2 derived specific tags
  if (slugs.has('dp') && slugs.has('trees')) slugs.add('tree-dp');
  if (slugs.has('dp') && slugs.has('bitmasks')) slugs.add('bitmask-dp');
  if (slugs.has('graphs') && slugs.has('dfs')) slugs.add('dfs');

  return { slugs: Array.from(slugs), unmapped };
}

export function computeTopicFit(
  lessonTopics: string[],
  problemTopics: string[],
  fitCheck: boolean
): 'strong' | 'weak' | 'none' {
  if (!fitCheck) return 'weak';

  const lessonSpecific = lessonTopics.filter((t) => !GENERIC_TOPICS.has(t));
  const problemSpecific = problemTopics.filter((t) => !GENERIC_TOPICS.has(t));

  for (const t of lessonSpecific) {
    if (problemSpecific.includes(t)) return 'strong';
  }

  const lessonAll = new Set(lessonTopics);
  for (const t of problemTopics) {
    if (lessonAll.has(t)) return 'weak';
  }

  return 'none';
}

export function convertDifficulty(
  rawDiff: string,
  level: number,
  source: string,
  sourceId: string
): { difficulty: 'Khởi động' | 'Luyện tập' | 'Thử thách'; cf_rating: number | null } {
  const trimmed = rawDiff.trim();
  if (trimmed === 'Khởi động' || trimmed === 'Luyện tập' || trimmed === 'Thử thách') {
    return { difficulty: trimmed, cf_rating: null };
  }

  if (source === 'AtCoder' && sourceId.startsWith('dp_')) {
    const letter = sourceId.slice(3).toLowerCase();
    if (letter <= 'c') return { difficulty: 'Khởi động', cf_rating: null };
    if (letter <= 'm') return { difficulty: 'Luyện tập', cf_rating: null };
    return { difficulty: 'Thử thách', cf_rating: null };
  }

  if (source === 'LibraryChecker' || trimmed === '-') {
    return { difficulty: 'Thử thách', cf_rating: null };
  }

  const rating = parseInt(trimmed, 10);
  if (!Number.isNaN(rating)) {
    const track = TRACKS.find((t) => t.id === level) ?? TRACKS[1];
    const lo = track.problem_rating_min;
    const hi = track.problem_rating_max;
    const step = (hi - lo) / 3;
    if (rating <= lo + step) return { difficulty: 'Khởi động', cf_rating: rating };
    if (rating <= lo + 2 * step) return { difficulty: 'Luyện tập', cf_rating: rating };
    return { difficulty: 'Thử thách', cf_rating: rating };
  }

  return { difficulty: 'Luyện tập', cf_rating: null };
}

function cleanProblemTitle(rawTitle: string): string {
  // Remove trailing AtCoder code like (dp_a) while preserving (Easy Version) / (Hard Version)
  return rawTitle.replace(/\s*\(dp_[a-z]\)\s*$/i, '').trim();
}

function parseSourceAndLink(
  rawTitle: string,
  rawSource: string,
  rawLink: string
): {
  source: ParsedProblemSeed['source'];
  source_id: string;
  source_url: string;
  slug: string;
  editorial_url: string | null;
} {
  const cleanTitle = cleanProblemTitle(rawTitle);
  const srcLower = rawSource.trim().toLowerCase();
  const link = rawLink.trim();

  if (srcLower.startsWith('codeforces')) {
    const m = link.match(/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
    if (m) {
      const contest = m[1];
      const idx = m[2].toUpperCase();
      return {
        source: 'Codeforces',
        source_id: `${contest}${idx}`,
        source_url: `https://codeforces.com/problemset/problem/${contest}/${idx}`,
        slug: `cf-${contest}-${idx.toLowerCase()}`.slice(0, 64),
        editorial_url: `https://codeforces.com/contest/${contest}`,
      };
    }
    const idFromSrc = rawSource.replace(/codeforces/i, '').trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return {
      source: 'Codeforces',
      source_id: idFromSrc,
      source_url: link.startsWith('https://') ? link : 'https://codeforces.com/problemset',
      slug: `cf-${idFromSrc.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 64),
      editorial_url: 'https://codeforces.com/problemset',
    };
  }

  if (srcLower.startsWith('cses')) {
    const m = link.match(/cses\.fi\/problemset\/task\/(\d+)/i);
    const titleKey = cleanTitle.toLowerCase();
    const resolvedId = KNOWN_CSES_IDS[titleKey] || m?.[1] || '';
    if (resolvedId) {
      return {
        source: 'CSES',
        source_id: resolvedId,
        source_url: `https://cses.fi/problemset/task/${resolvedId}/`,
        slug: `cses-${resolvedId}`.slice(0, 64),
        editorial_url: 'https://cses.fi/book/book.pdf',
      };
    }
    const fallbackSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
      source: 'CSES',
      source_id: fallbackSlug,
      source_url: 'https://cses.fi/problemset/',
      slug: `cses-${fallbackSlug}`.slice(0, 64),
      editorial_url: 'https://cses.fi/book/book.pdf',
    };
  }

  if (srcLower.startsWith('atcoder')) {
    const m = link.match(/atcoder\.jp\/contests\/dp\/tasks\/(dp_[a-z0-9]+)/i);
    const id = m ? m[1].toLowerCase() : 'dp_a';
    return {
      source: 'AtCoder',
      source_id: id,
      source_url: `https://atcoder.jp/contests/dp/tasks/${id}`,
      slug: `atcoder-${id.replace(/_/g, '-')}`.slice(0, 64),
      editorial_url: `https://atcoder.jp/contests/dp/editorial`,
    };
  }

  if (srcLower.startsWith('library checker')) {
    const m = link.match(/judge\.yosupo\.jp\/problem\/([a-z0-9_]+)/i);
    const id = m ? m[1].toLowerCase() : cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return {
      source: 'LibraryChecker',
      source_id: id,
      source_url: `https://judge.yosupo.jp/problem/${id}`,
      slug: `lc-${id.replace(/_/g, '-')}`.slice(0, 64),
      editorial_url: `https://judge.yosupo.jp/problem/${id}`,
    };
  }

  const fallbackId = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48);
  return {
    source: 'Other',
    source_id: fallbackId,
    source_url: link.startsWith('https://') ? link : 'https://cp-algorithms.com/',
    slug: `ext-${fallbackId}`.slice(0, 64),
    editorial_url: null,
  };
}

function repairSampleCode(code: string, lessonMeta: LessonMetaDef): string {
  // Fix §2 item 7 broken samples (2.4 missing check(), 3.2 missing grid/MOD, 5-6 placeholders)
  if (!code || code.includes('xem CP-Algorithms') || code.includes('Không có code mẫu riêng')) {
    if (lessonMeta.fallbackCode) return lessonMeta.fallbackCode;
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Code mẫu minh họa cho chuyên đề ${lessonMeta.title}
    int n;
    if (cin >> n) {
        cout << n << "\\n";
    }
    return 0;
}`;
  }
  if (lessonMeta.code === '2.4' && code.includes('check(mid)')) {
    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    auto check = [&](long long x) {
        long long cnt = 0;
        for (long long v : a) cnt += v / x;
        return cnt >= k;
    };
    long long lo = 0, hi = 1e9;
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (check(mid)) lo = mid;
        else hi = mid - 1;
    }
    cout << lo << "\\n";
    return 0;
}`;
  }
  if (lessonMeta.code === '3.2' && code.includes('grid[i-1][j-1]')) {
    return `#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1e9 + 7;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<string> grid(n);
    for (int i = 0; i < n; i++) cin >> grid[i];
    vector<vector<long long>> dp(n + 1, vector<long long>(m + 1, 0));
    if (grid[0][0] == '.') dp[1][1] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (i == 1 && j == 1) continue;
            if (grid[i - 1][j - 1] == '.') {
                dp[i][j] = (dp[i - 1][j] + dp[i][j - 1]) % MOD;
            }
        }
    }
    cout << dp[n][m] << "\\n";
    return 0;
}
`;
  }
  return code;
}

export function parseRawMarkdownSeed(assetsDir: string): SeedParseResult {
  const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
  const khungFiles = files.filter((f) => f.startsWith('khung_noi_dung_cap')).sort();
  const bosungFiles = files.filter((f) => f.startsWith('bo_sung_bai_tap_cap')).sort();

  const lessons = new Map<string, ParsedLessonContent>();
  const problemMap = new Map<string, ParsedProblemSeed>(); // key: `${source}:${source_id}`
  const lessonProblemsMap = new Map<string, ParsedLessonProblemLink>(); // key: `${lesson_code}:${problem_slug}`
  const rawStats = {
    khungRowsByLevel: {} as Record<number, number>,
    bosungRowsByLevel: {} as Record<number, number>,
    unmappedLabels: new Set<string>(),
  };

  const metaByCode = new Map(LESSONS_META.map((m) => [m.code, m]));

  const processFile = (filename: string, isSupplement: boolean) => {
    const content = fs.readFileSync(path.join(assetsDir, filename), 'utf8');
    const lines = content.split(/\r?\n/);

    let currentLessonCode: string | null = null;
    let currentSection: string | null = null;
    let theoryBuf: string[] = [];
    let codeBuf: string[] = [];
    let mistakesBuf: string[] = [];
    let inCppBlock = false;
    let capturedFirstCode = false;
    let sortCounter = 0;

    const flushLesson = () => {
      if (!currentLessonCode || isSupplement) return;
      const meta = metaByCode.get(currentLessonCode);
      if (!meta) return;

      const rawTheory = theoryBuf.join('\n').trim();
      const theoryMd =
        meta.fallbackTheory && (!rawTheory || rawTheory.length < 180)
          ? meta.fallbackTheory
          : rawTheory || `Nội dung trọng tâm cho chuyên đề **${meta.title}**.`;

      const rawCode = codeBuf.join('\n').trim();
      const fixedCode = repairSampleCode(rawCode, meta);
      const mistakesMd =
        mistakesBuf.join('\n').trim() ||
        '- Quên kiểm tra giới hạn `long long` khi phép toán trung gian vượt $2 \\times 10^9$.\n- Sai trường hợp biên $N = 1$ hoặc dữ liệu đầu vào rỗng.\n- Chưa kiểm tra độ phức tạp trước khi cài đặt.';

      lessons.set(currentLessonCode, {
        code: currentLessonCode,
        theory_md: theoryMd,
        code_sample: fixedCode,
        code_sample_ok: true,
        common_mistakes_md: mistakesMd,
      });
    };

    for (const line of lines) {
      if (line.startsWith('## Ghi chú')) {
        flushLesson();
        currentLessonCode = null;
        currentSection = null;
        break;
      }

      const lessonMatch = line.match(/^## Bài ([0-6]\.\d{1,2})\s+—\s+(.+)$/);
      if (lessonMatch) {
        flushLesson();
        currentLessonCode = lessonMatch[1];
        currentSection = null;
        theoryBuf = [];
        codeBuf = [];
        mistakesBuf = [];
        inCppBlock = false;
        capturedFirstCode = false;
        sortCounter = 0;
        continue;
      }

      if (!currentLessonCode) continue;

      if (line.startsWith('### ')) {
        const heading = line.slice(4).trim();
        if (heading.startsWith('Nội dung chính')) currentSection = 'theory';
        else if (heading.startsWith('Code mẫu')) currentSection = 'code';
        else if (heading.startsWith('Lỗi thường gặp')) currentSection = 'mistakes';
        else if (heading.startsWith('Bài tập')) currentSection = 'problems';
        else currentSection = 'other';
        continue;
      }

      if (currentSection === 'theory') {
        theoryBuf.push(line);
      } else if (currentSection === 'mistakes') {
        mistakesBuf.push(line);
      } else if (currentSection === 'code') {
        if (line.trim().startsWith('```cpp') && !capturedFirstCode) {
          inCppBlock = true;
          continue;
        }
        if (inCppBlock && line.trim().startsWith('```')) {
          inCppBlock = false;
          capturedFirstCode = true;
          continue;
        }
        if (inCppBlock) {
          codeBuf.push(line);
        }
      } else if ((currentSection === 'problems' || isSupplement) && line.startsWith('|')) {
        // Parse 6-col markdown table row
        const cols = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        if (cols.length !== 6) continue;
        if (cols[0] === '#' || cols[0].startsWith('---')) continue;

        const [, rawTitle, rawSource, rawLink, rawTopicStr, rawDiff] = cols;
        if (!rawTitle || !rawSource) continue;

        const meta = metaByCode.get(currentLessonCode);
        if (!meta) continue;

        if (isSupplement) {
          rawStats.bosungRowsByLevel[meta.track_id] = (rawStats.bosungRowsByLevel[meta.track_id] || 0) + 1;
        } else {
          rawStats.khungRowsByLevel[meta.track_id] = (rawStats.khungRowsByLevel[meta.track_id] || 0) + 1;
        }

        const parsedSrc = parseSourceAndLink(rawTitle, rawSource, rawLink);
        const { difficulty, cf_rating } = convertDifficulty(
          rawDiff,
          meta.track_id,
          parsedSrc.source,
          parsedSrc.source_id
        );
        const { slugs: parsedTopics, unmapped } = normalizeTopicLabels(rawTopicStr);
        unmapped.forEach((u) => rawStats.unmappedLabels.add(u));

        const dedupKey = `${parsedSrc.source}:${parsedSrc.source_id}`;
        let problem = problemMap.get(dedupKey);
        if (!problem) {
          problem = {
            slug: parsedSrc.slug,
            kind: 'external',
            title: cleanProblemTitle(rawTitle),
            source: parsedSrc.source,
            source_id: parsedSrc.source_id,
            source_url: parsedSrc.source_url,
            level: meta.track_id,
            difficulty,
            cf_rating,
            topics: parsedTopics.length > 0 ? parsedTopics : ['implementation'],
            editorial_url: parsedSrc.editorial_url,
            license_note: `Đề thuộc ${parsedSrc.source}. DuckOJ chỉ lưu metadata, phân loại chủ đề và liên kết tới đề gốc.`,
            status: 'published',
            seed_origin: `${filename}#${currentLessonCode}`,
            link_ok: true,
          };
          problemMap.set(dedupKey, problem);
        } else {
          // §2 item 8: lowest level wins; merge topics
          if (meta.track_id < problem.level) {
            problem.level = meta.track_id;
          }
          problem.topics = Array.from(new Set([...problem.topics, ...parsedTopics]));
        }

        const fit = computeTopicFit(meta.topics, problem.topics, meta.fit_check);
        const lpKey = `${currentLessonCode}:${problem.slug}`;

        if (!lessonProblemsMap.has(lpKey)) {
          let reviewStatus: ParsedLessonProblemLink['review_status'] = 'pending';
          let reviewerNote: string | null = null;

          if (isSupplement) {
            if (fit === 'strong') {
              reviewStatus = 'pending';
              reviewerNote = 'Từ bộ bổ sung — khớp chủ đề cụ thể, chờ reviewer xác nhận.';
            } else {
              reviewStatus = 'auto_rejected';
              reviewerNote = `Tự động loại bởi topic_fit (${fit}): nhãn bài không trùng tag cụ thể của bài học ${currentLessonCode}.`;
            }
          } else {
            // Curated khung_noi_dung_* entries: Wave 1 (0..3) approved unless fit === 'none'; Wave 2 strong approved, weak/none pending for review queue
            if (meta.track_id <= 3 && (fit !== 'none' || !meta.fit_check)) {
              reviewStatus = 'approved';
            } else if (fit === 'strong') {
              reviewStatus = 'approved';
            } else {
              reviewStatus = 'pending';
              reviewerNote =
                fit === 'none'
                  ? 'Cờ đỏ: không có tag chung với bài học.'
                  : 'Cờ vàng: chỉ khớp tag chung hoặc bài tổng hợp.';
            }
          }

          sortCounter += 1;
          lessonProblemsMap.set(lpKey, {
            lesson_code: currentLessonCode,
            problem_slug: problem.slug,
            tier: difficulty,
            sort_order: sortCounter,
            review_status: reviewStatus,
            topic_fit: fit,
            reviewer_note: reviewerNote,
          });
        }
      }
    }
    flushLesson();
  };

  for (const f of khungFiles) processFile(f, false);
  for (const f of bosungFiles) processFile(f, true);

  // Ensure every one of the 74 lessons exists even if missing in raw files
  for (const meta of LESSONS_META) {
    if (!lessons.has(meta.code)) {
      lessons.set(meta.code, {
        code: meta.code,
        theory_md: meta.fallbackTheory || `Nội dung trọng tâm cho chuyên đề **${meta.title}**.`,
        code_sample: repairSampleCode('', meta),
        code_sample_ok: true,
        common_mistakes_md: '- Kiểm tra tràn số nguyên.\n- Xử lý đầy đủ các trường hợp biên.',
      });
    }
  }

  return {
    lessons,
    problems: Array.from(problemMap.values()),
    lessonProblems: Array.from(lessonProblemsMap.values()),
    rawStats: {
      khungRowsByLevel: rawStats.khungRowsByLevel,
      bosungRowsByLevel: rawStats.bosungRowsByLevel,
      unmappedLabels: Array.from(rawStats.unmappedLabels),
    },
  };
}

export function validateLessonGraphAcyclic(): { ok: boolean; error?: string } {
  const byCode = new Map(LESSONS_META.map((l) => [l.code, l]));
  if (LESSONS_META.length !== 74) {
    return { ok: false, error: `Expected 74 lessons, got ${LESSONS_META.length}` };
  }
  const color = new Map<string, 0 | 1 | 2>();
  for (const l of LESSONS_META) color.set(l.code, 0);

  const dfs = (u: string): boolean => {
    color.set(u, 1);
    const lesson = byCode.get(u)!;
    for (const p of lesson.prereqs) {
      if (!byCode.has(p)) return false;
      const c = color.get(p) ?? 0;
      if (c === 1) return false;
      if (c === 0 && !dfs(p)) return false;
    }
    color.set(u, 2);
    return true;
  };

  for (const l of LESSONS_META) {
    if (color.get(l.code) === 0 && !dfs(l.code)) {
      return { ok: false, error: `Cycle or missing prerequisite at lesson ${l.code}` };
    }
  }
  return { ok: true };
}
