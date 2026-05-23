// KoMES — 패키지 관리 시드 데이터 (다이어트·산후·통증·디톡스·만성·면역)

const PACKAGE_CATEGORIES = [
  { key: "diet",      label: "다이어트",     icon: "scale",       tone: "pine"   },
  { key: "postnatal", label: "산후관리",     icon: "baby",        tone: "pink"   },
  { key: "pain",      label: "통증·근골격",  icon: "bone",        tone: "slate"  },
  { key: "detox",     label: "디톡스",       icon: "droplets",    tone: "marine" },
  { key: "chronic",   label: "만성질환",     icon: "activity",    tone: "bronze" },
  { key: "immune",    label: "면역·체질",    icon: "shield-plus", tone: "brand"  },
];

const PKG_TONES = {
  pine:   { bg: "var(--accent-pine-bg)",   border: "var(--accent-pine-border)",   fg: "var(--accent-pine)"   },
  slate:  { bg: "var(--accent-slate-bg)",  border: "var(--accent-slate-border)",  fg: "var(--accent-slate)"  },
  bronze: { bg: "var(--amber-500-bg)",     border: "var(--amber-500-border)",     fg: "var(--amber-700)"    },
  marine: { bg: "var(--accent-marine-bg)", border: "var(--accent-marine-border)", fg: "var(--accent-marine)" },
  pink:   { bg: "var(--pink-100)",         border: "var(--pink-200)",             fg: "var(--pink-700)"     },
  brand:  { bg: "var(--brand-muted)",      border: "var(--brand-muted)",          fg: "var(--text-brand)"   },
};

const PACKAGES = [
  {
    id: "pkg-1", code: "DT-04", name: "다이어트 4주 입문", category: "diet",
    tagline: "체질 평가 + 입문자용 균형 케어",
    sessions: 16, validity: 35, price: 480000, memberPrice: 432000,
    includes: [
      { type: "체침",       count: 8, unit: "회" },
      { type: "건식부항",   count: 4, unit: "회" },
      { type: "한약(첩약)", count: 4, unit: "주" },
      { type: "식이상담",   count: 4, unit: "회" },
    ],
    status: "active", enrolled: 23, active: 18,
    revenue: 9_840_000, monthlyEnroll: 6,
    createdAt: "2025-08-12",
  },
  {
    id: "pkg-2", code: "DT-08", name: "다이어트 8주 집중", category: "diet",
    tagline: "체중·체지방 동시 관리 · 인바디 포함",
    sessions: 36, validity: 70, price: 880000, memberPrice: 792000,
    includes: [
      { type: "체침",       count: 16, unit: "회" },
      { type: "건식부항",   count: 8,  unit: "회" },
      { type: "한약(첩약)", count: 8,  unit: "주" },
      { type: "식이상담",   count: 8,  unit: "회" },
      { type: "인바디 측정",count: 4,  unit: "회" },
    ],
    status: "active", enrolled: 41, active: 28,
    revenue: 32_560_000, monthlyEnroll: 9,
    badge: "BEST",
    createdAt: "2025-08-12",
  },
  {
    id: "pkg-3", code: "DT-12", name: "다이어트 12주 프리미엄", category: "diet",
    tagline: "체질 개선까지 · 1:1 코칭",
    sessions: 56, validity: 100, price: 1_280_000, memberPrice: 1_152_000,
    includes: [
      { type: "체침",       count: 24, unit: "회" },
      { type: "건식부항",   count: 12, unit: "회" },
      { type: "한약(첩약)", count: 12, unit: "주" },
      { type: "식이상담",   count: 12, unit: "회" },
      { type: "인바디 측정",count: 6,  unit: "회" },
      { type: "체형 사진",  count: 4,  unit: "회" },
    ],
    status: "active", enrolled: 12, active: 11,
    revenue: 13_440_000, monthlyEnroll: 2,
    createdAt: "2025-09-02",
  },
  {
    id: "pkg-4", code: "PN-08", name: "산후 회복 8주", category: "postnatal",
    tagline: "산후풍 예방 · 체형 회복 · 모유 케어",
    sessions: 32, validity: 84, price: 920000, memberPrice: 828000,
    includes: [
      { type: "체침",       count: 16, unit: "회" },
      { type: "온뜸",       count: 8,  unit: "회" },
      { type: "한약(첩약)", count: 8,  unit: "주" },
      { type: "골반 추나",  count: 4,  unit: "회" },
      { type: "산후 상담",  count: 4,  unit: "회" },
    ],
    status: "active", enrolled: 17, active: 14,
    revenue: 14_076_000, monthlyEnroll: 3,
    createdAt: "2025-10-04",
  },
  {
    id: "pkg-5", code: "PA-10", name: "자세교정 추나 10회", category: "pain",
    tagline: "거북목·골반 비대칭 · 보험 추나",
    sessions: 10, validity: 56, price: 380000, memberPrice: 342000,
    includes: [
      { type: "복잡추나",   count: 10, unit: "회" },
      { type: "체침",       count: 10, unit: "회" },
      { type: "체형 사진",  count: 2,  unit: "회" },
    ],
    status: "active", enrolled: 28, active: 19,
    revenue: 9_576_000, monthlyEnroll: 5,
    createdAt: "2025-07-21",
  },
  {
    id: "pkg-6", code: "PA-12", name: "퇴행성 무릎 케어", category: "pain",
    tagline: "약침·봉약침 · 만성 슬통",
    sessions: 24, validity: 84, price: 720000, memberPrice: 648000,
    includes: [
      { type: "체침",       count: 12, unit: "회" },
      { type: "약침",       count: 8,  unit: "회" },
      { type: "봉약침",     count: 4,  unit: "회" },
      { type: "이학요법",   count: 12, unit: "회" },
    ],
    status: "active", enrolled: 9, active: 7,
    revenue: 5_832_000, monthlyEnroll: 1,
    createdAt: "2025-11-18",
  },
  {
    id: "pkg-7", code: "DX-04", name: "장 디톡스 4주", category: "detox",
    tagline: "변비·복부팽만·체질 정화",
    sessions: 16, validity: 35, price: 520000, memberPrice: 468000,
    includes: [
      { type: "체침",       count: 8, unit: "회" },
      { type: "한약(첩약)", count: 4, unit: "주" },
      { type: "온뜸",       count: 4, unit: "회" },
      { type: "식이상담",   count: 4, unit: "회" },
    ],
    status: "active", enrolled: 14, active: 9,
    revenue: 6_552_000, monthlyEnroll: 4,
    createdAt: "2025-09-30",
  },
  {
    id: "pkg-8", code: "CH-12", name: "갱년기 케어 12주", category: "chronic",
    tagline: "수족열·불면·자율신경 조절",
    sessions: 36, validity: 100, price: 980000, memberPrice: 882000,
    includes: [
      { type: "체침",       count: 24, unit: "회" },
      { type: "한약(첩약)", count: 12, unit: "주" },
      { type: "이침",       count: 12, unit: "회" },
    ],
    status: "active", enrolled: 8, active: 7,
    revenue: 6_174_000, monthlyEnroll: 1,
    createdAt: "2025-10-22",
  },
  {
    id: "pkg-9", code: "CH-06", name: "만성 두통 관리 6주", category: "chronic",
    tagline: "긴장성·편두통 · 침+한약 병행",
    sessions: 18, validity: 56, price: 560000, memberPrice: 504000,
    includes: [
      { type: "체침",       count: 12, unit: "회" },
      { type: "약침",       count: 6,  unit: "회" },
      { type: "한약(첩약)", count: 6,  unit: "주" },
    ],
    status: "paused", enrolled: 5, active: 2,
    revenue: 2_800_000, monthlyEnroll: 0,
    createdAt: "2025-06-11",
  },
  {
    id: "pkg-10", code: "IM-04", name: "면역력 부스터 4주", category: "immune",
    tagline: "환절기 보양 · 보약 + 침구",
    sessions: 12, validity: 35, price: 420000, memberPrice: 378000,
    includes: [
      { type: "체침",       count: 8, unit: "회" },
      { type: "온뜸",       count: 4, unit: "회" },
      { type: "한약(첩약)", count: 4, unit: "주" },
    ],
    status: "active", enrolled: 19, active: 15,
    revenue: 7_182_000, monthlyEnroll: 4,
    createdAt: "2025-08-05",
  },
  {
    id: "pkg-11", code: "IM-08", name: "체질 개선 8주", category: "immune",
    tagline: "사상체질 진단 후 맞춤 처방",
    sessions: 24, validity: 84, price: 760000, memberPrice: 684000,
    includes: [
      { type: "체질 진단",  count: 1,  unit: "회" },
      { type: "체침",       count: 16, unit: "회" },
      { type: "한약(첩약)", count: 8,  unit: "주" },
    ],
    status: "active", enrolled: 6, active: 5,
    revenue: 4_104_000, monthlyEnroll: 1,
    createdAt: "2025-11-02",
  },
  {
    id: "pkg-12", code: "DX-02", name: "데일리 디톡스 2주", category: "detox",
    tagline: "단기 체험 · 부기 케어",
    sessions: 6, validity: 21, price: 220000, memberPrice: 198000,
    includes: [
      { type: "체침",     count: 4, unit: "회" },
      { type: "건식부항", count: 2, unit: "회" },
      { type: "한약(첩약)", count: 2, unit: "주" },
    ],
    status: "discontinued", enrolled: 32, active: 0,
    revenue: 6_336_000, monthlyEnroll: 0,
    createdAt: "2024-12-01",
  },
];

// Today reference for relative dates (mock = 2026-05-23)
const PKG_TODAY = new Date(2026, 4, 23);
function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

const ENROLL_SEED = [
  { p:"김지수", g:"여", age:34, ph:"010-1234-5678", pkg:"pkg-2",  start:-22, used:11, last:-1,  status:"active",   sales:"김민준", paid:792000 },
  { p:"박서연", g:"여", age:28, ph:"010-2233-4421", pkg:"pkg-1",  start:-10, used:5,  last:-2,  status:"active",   sales:"김민준", paid:432000 },
  { p:"정유진", g:"여", age:46, ph:"010-9012-3344", pkg:"pkg-3",  start:-58, used:38, last:0,   status:"active",   sales:"이지영", paid:1152000 },
  { p:"이서연", g:"여", age:33, ph:"010-3344-5566", pkg:"pkg-4",  start:-30, used:14, last:-3,  status:"active",   sales:"박서윤", paid:828000 },
  { p:"최민호", g:"남", age:42, ph:"010-7788-9900", pkg:"pkg-5",  start:-46, used:9,  last:-2,  status:"active",   sales:"김민준", paid:342000 },
  { p:"한가람", g:"여", age:31, ph:"010-1100-2233", pkg:"pkg-2",  start:-65, used:36, last:-1,  status:"completed",sales:"이지영", paid:792000 },
  { p:"오한결", g:"남", age:38, ph:"010-5566-7788", pkg:"pkg-6",  start:-72, used:18, last:-12, status:"active",   sales:"박서윤", paid:648000 },
  { p:"강하늘", g:"남", age:55, ph:"010-2222-3344", pkg:"pkg-9",  start:-40, used:9,  last:-15, status:"paused",   sales:"김민준", paid:504000 },
  { p:"윤도현", g:"남", age:45, ph:"010-3344-5588", pkg:"pkg-8",  start:-85, used:25, last:-4,  status:"active",   sales:"이지영", paid:882000 },
  { p:"신유나", g:"여", age:29, ph:"010-9911-2233", pkg:"pkg-7",  start:-31, used:14, last:-1,  status:"active",   sales:"박서윤", paid:468000 },
  { p:"장우성", g:"남", age:41, ph:"010-4455-6677", pkg:"pkg-10", start:-32, used:11, last:-2,  status:"completed",sales:"김민준", paid:378000 },
  { p:"송다은", g:"여", age:27, ph:"010-1212-3434", pkg:"pkg-1",  start:-32, used:7,  last:-5,  status:"expired",  sales:"이지영", paid:432000 },
  { p:"류지원", g:"여", age:36, ph:"010-2424-5656", pkg:"pkg-2",  start:-62, used:15, last:-20, status:"paused",   sales:"박서윤", paid:792000 },
  { p:"문해성", g:"남", age:52, ph:"010-3636-4848", pkg:"pkg-11", start:-44, used:17, last:0,   status:"active",   sales:"김민준", paid:684000 },
  { p:"황민지", g:"여", age:30, ph:"010-7777-8888", pkg:"pkg-2",  start:-5,  used:2,  last:-1,  status:"active",   sales:"이지영", paid:792000 },
  { p:"백수진", g:"여", age:26, ph:"010-8888-9999", pkg:"pkg-1",  start:-33, used:14, last:-1,  status:"active",   sales:"박서윤", paid:432000 },
  { p:"권태우", g:"남", age:48, ph:"010-6543-2109", pkg:"pkg-5",  start:-50, used:8,  last:-7,  status:"active",   sales:"김민준", paid:342000 },
  { p:"임소연", g:"여", age:39, ph:"010-7654-3210", pkg:"pkg-4",  start:-55, used:21, last:-2,  status:"active",   sales:"이지영", paid:828000 },
  { p:"고은영", g:"여", age:52, ph:"010-1357-2468", pkg:"pkg-8",  start:-92, used:31, last:-6,  status:"active",   sales:"박서윤", paid:882000 },
  { p:"노태현", g:"남", age:33, ph:"010-2468-1357", pkg:"pkg-10", start:-28, used:9,  last:-3,  status:"active",   sales:"김민준", paid:378000 },
  { p:"전아람", g:"여", age:42, ph:"010-3691-2580", pkg:"pkg-2",  start:-69, used:34, last:-1,  status:"active",   sales:"이지영", paid:792000 },
  { p:"민지호", g:"남", age:24, ph:"010-7913-1300", pkg:"pkg-1",  start:-9,  used:4,  last:-1,  status:"active",   sales:"박서윤", paid:432000 },
];

const ENROLLMENTS = ENROLL_SEED.map((e, idx) => {
  const pkg = PACKAGES.find(p => p.id === e.pkg);
  const start  = addDays(PKG_TODAY, e.start);
  const expiry = addDays(start, pkg.validity);
  const last   = addDays(PKG_TODAY, e.last);
  const daysLeft = daysBetween(PKG_TODAY, expiry);
  return {
    id: `en-${idx+1}`,
    patient: { id: `p-${idx+1}`, name: e.p, gender: e.g, age: e.age, phone: e.ph },
    packageId: e.pkg, packageName: pkg.name, packageCode: pkg.code, category: pkg.category,
    startDate: fmtDate(start), expiryDate: fmtDate(expiry),
    lastVisit: fmtDate(last), daysSinceLastVisit: Math.abs(e.last),
    sessionsUsed: e.used, sessionsTotal: pkg.sessions,
    daysLeft, status: e.status,
    sales: e.sales, paid: e.paid,
  };
});

Object.assign(window, { PACKAGE_CATEGORIES, PKG_TONES, PACKAGES, ENROLLMENTS, PKG_TODAY });
