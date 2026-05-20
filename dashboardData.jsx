// KoMES — 경영 대시보드 mock data
// 시점: 2026-05-20 (수). 다인 한의원, 원장 3명 + 한의사 2명.

const fmtKRW = (v) => "₩" + v.toLocaleString("ko-KR");
const fmtKRWshort = (v) => {
  if (v >= 1e8) return `${(v / 1e8).toFixed(1)}억`;
  if (v >= 1e4) return `${(v / 1e4).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}만`;
  return v.toLocaleString("ko-KR");
};
const fmtPct = (v, digits = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
const signColor = (v) => v >= 0 ? "var(--jade-600)" : "var(--cinnabar-600)";

const DASH = {
  asOf: "2026년 5월 20일 (수) · 14:32",

  // ── 오늘 ─────────────────────────────────────────────
  today: {
    revenue:   1847000,
    revenueYesterday: 1648000, // +12.1%
    patients:  38,
    newPatients: 8,
    returning: 30,
    awaitingPayment: 5,
    awaitingClaim: 3,
    schedule:  { booked: 44, shown: 38, walkIn: 4, noShow: 2 },
  },

  // ── 기간 별 핵심 지표 ────────────────────────────────
  // 기간이 바뀌면 KPI/차트가 이 값으로 스왑됨
  byPeriod: {
    today:   { label: "오늘",      revenue:  1847000,  patients:  38, claims:   8, ar:  423000,  mom:  12.1, yoy:  9.4 },
    week:    { label: "이번 주",   revenue: 12450000,  patients: 248, claims:  64, ar: 1280000,  mom:   8.3, yoy: 11.7 },
    month:   { label: "이번 달",   revenue: 42180000,  patients: 642, claims: 234, ar: 4230000,  mom:   6.8, yoy: 13.4 },
    quarter: { label: "이번 분기", revenue:122480000,  patients:1860, claims: 712, ar: 4230000,  mom:   5.4, yoy: 14.2 },
    year:    { label: "올해 누적", revenue:198750000,  patients:3015, claims:1248, ar: 4230000,  mom:   4.9, yoy: 12.8 },
  },

  // ── 월별 매출 추이 (12개월, 단위: 만원) ──────────────
  monthlyTrend: {
    months: ["6월","7월","8월","9월","10월","11월","12월","1월","2월","3월","4월","5월"],
    year:   ["'25","'25","'25","'25","'25","'25","'25","'26","'26","'26","'26","'26"],
    revenue:[3120, 3250, 3380, 3490, 3570, 3680, 3810, 3750, 3890, 3950, 4080, 4218], // current
    prev:   [2750, 2840, 2920, 3020, 3140, 3210, 3340, 3320, 3450, 3510, 3620, 3720], // YoY shadow
    patients:[510, 520, 545, 560, 575, 590, 605, 595, 612, 598, 620, 642],
    // 5월은 진행 중 (20/31일) — 점선으로 표시
    inProgressIdx: 11,
  },

  // ── 환자 구성 (이번 달) ───────────────────────────────
  patientMix: {
    visitType: [
      { key: "new",    label: "신환",   value: 142, color: "var(--cinnabar-500)" },
      { key: "return", label: "재진",   value: 500, color: "var(--jade-500)" },
    ],
    insurance: [
      { key: "nhi",    label: "건강보험",     value: 416, share: 65, color: "var(--jade-500)" },
      { key: "auto",   label: "자동차보험",   value: 116, share: 18, color: "var(--cinnabar-500)" },
      { key: "herbal", label: "한약(비급여)", value:  77, share: 12, color: "var(--amber-500)" },
      { key: "manual", label: "추나/도수",    value:  33, share:  5, color: "var(--accent-slate)" },
    ],
    age: [
      { label: "10대", value: 4  },
      { label: "20대", value: 12 },
      { label: "30대", value: 22 },
      { label: "40대", value: 26 },
      { label: "50대", value: 18 },
      { label: "60대+",value: 18 },
    ],
    momNew: 23.5,  // 신환 비율 전월 18.5% → 23.2%
    momReturn: -2.1,
  },

  // ── 보험 청구 현황 (이번 달) ──────────────────────────
  insurance: {
    rows: [
      { key: "nhi",    label: "건강보험",   total: 312, amount: 28400000, ok: 285, hold: 18, reject: 9, color: "var(--jade-500)" },
      { key: "herbal", label: "한약 첩약",  total:  28, amount:  8200000, ok:  22, hold:  5, reject: 1, color: "var(--amber-500)" },
      { key: "auto",   label: "자동차보험", total:  45, amount: 12600000, ok:  32, hold:  8, reject: 5, color: "var(--cinnabar-500)" },
    ],
    aging: [   // 보류 14일+ aging
      { range: "0–7일",   count: 18 },
      { range: "8–14일",  count: 13 },
      { range: "15–30일", count:  6 },
      { range: "30일+",   count:  2 },
    ],
  },

  // ── 직원/원장별 진료 실적 (이번 달) ───────────────────
  staff: [
    { name: "김민준", role: "원장",   patients: 245, revenue: 18500000, claims: 92, sat: 4.8, trend: "+8.2",  color: "var(--jade-600)" },
    { name: "박서연", role: "원장",   patients: 198, revenue: 14200000, claims: 78, sat: 4.7, trend: "+5.4",  color: "var(--accent-pine)" },
    { name: "이지원", role: "한의사", patients: 132, revenue:  7800000, claims: 41, sat: 4.6, trend: "+12.1", color: "var(--accent-slate)" },
    { name: "최도현", role: "한의사", patients:  87, revenue:  4500000, claims: 23, sat: 4.4, trend: "-3.4",  color: "var(--amber-600)" },
  ],

  // ── Top 처방·시술 (이번 달) ──────────────────────────
  top: {
    treatments: [
      { label: "체침 + 추나",      count: 412, share: 36, trend:  +4 },
      { label: "단순 추나",        count: 178, share: 16, trend:  -2 },
      { label: "부항",             count: 156, share: 14, trend:  +1 },
      { label: "도수치료",         count:  67, share:  6, trend:  +9 },
      { label: "복잡추나",         count:  54, share:  5, trend: +18 },
    ],
    herbs: [
      { label: "보중익기탕",    count: 38, revenue: 12300000, trend: +85 },
      { label: "자음강화탕",    count: 21, revenue:  6800000, trend: +12 },
      { label: "쌍화탕",        count: 18, revenue:  4500000, trend:  +4 },
      { label: "삼소음",        count: 14, revenue:  3500000, trend:  -8 },
    ],
  },

  // ── 예약 점유율 (이번 주 / 다음 주) ──────────────────
  occupancy: {
    weekDays: ["월", "화", "수", "목", "금", "토"],
    thisWeek: [82, 88, 76, 79, 91, 52],     // % per day
    nextWeek: [71, 68, 64, 70, 76, 38],
    weekTotal: 78,
    nextWeekTotal: 64,
  },

  // ── 지역별 (이번 달, 환자 수 기준) ───────────────────
  // gu: 시군구 상위 레벨 / dong: 구 클릭 시 보이는 동별 분포(구 내 비중)
  regions: {
    gu: [
      { label: "강남구", value: 187, share: 29 },
      { label: "서초구", value: 142, share: 22 },
      { label: "송파구", value:  98, share: 15 },
      { label: "강동구", value:  67, share: 10 },
      { label: "성동구", value:  53, share:  8 },
      { label: "광진구", value:  38, share:  6 },
      { label: "기타",   value:  57, share: 10 },
    ],
    dong: {
      "강남구": [
        { label: "역삼동", value: 56, share: 30 },
        { label: "논현동", value: 38, share: 20 },
        { label: "삼성동", value: 30, share: 16 },
        { label: "대치동", value: 24, share: 13 },
        { label: "청담동", value: 20, share: 11 },
        { label: "신사동", value: 14, share:  7 },
        { label: "기타",   value:  5, share:  3 },
      ],
      "서초구": [
        { label: "서초동", value: 48, share: 34 },
        { label: "반포동", value: 34, share: 24 },
        { label: "방배동", value: 26, share: 18 },
        { label: "잠원동", value: 18, share: 13 },
        { label: "양재동", value: 12, share:  8 },
        { label: "기타",   value:  4, share:  3 },
      ],
      "송파구": [
        { label: "잠실동", value: 32, share: 33 },
        { label: "가락동", value: 22, share: 22 },
        { label: "문정동", value: 18, share: 18 },
        { label: "방이동", value: 14, share: 14 },
        { label: "석촌동", value:  9, share:  9 },
        { label: "기타",   value:  3, share:  3 },
      ],
    },
  },

  // ── 내원 경로 ────────────────────────────────────────
  referral: [
    { label: "지인 소개",     value: 38, color: "var(--jade-500)" },
    { label: "네이버/검색",   value: 24, color: "var(--accent-slate)" },
    { label: "SNS 광고",      value: 14, color: "var(--cinnabar-500)" },
    { label: "재방문 환자",   value: 12, color: "var(--accent-pine)" },
    { label: "간판/도보",     value:  8, color: "var(--amber-500)" },
    { label: "기타",          value:  4, color: "var(--ink-300)" },
  ],

  // ── AI 인사이트 ──────────────────────────────────────
  insights: [
    {
      tone: "warn",
      icon: "trending-up",
      title: "자동차보험 환자 급증",
      body: "지난 주 대비 자보 환자 +18% (5→26건). 인근 사고 다발지점 영향 가능. 자보 슬롯 추가 검토.",
      tag: "이상치",
    },
    {
      tone: "good",
      icon: "users",
      title: "신환 비율 23.2%",
      body: "전월 18.5% 대비 +4.7p. SNS 광고 전환율 개선 추정. 광고 채널별 ROI 분석 권장.",
      tag: "성장",
    },
    {
      tone: "alert",
      icon: "file-warning",
      title: "보험 청구 보류 누적 31건",
      body: "14일 이상 지연 6건. 보완 요청 응답 평균 9.2일 — 데스크에 위임 검토.",
      tag: "조치 필요",
      cta: "보류 건 보기",
    },
    {
      tone: "warn",
      icon: "user-cog",
      title: "최도현 한의사 환자수 -22%",
      body: "입사 3개월차 평균 대비 낮음. 멘토링 또는 진료 케이스 배정 점검 필요.",
      tag: "인력",
    },
    {
      tone: "good",
      icon: "flask-conical",
      title: "보중익기탕 처방 +85%",
      body: "환절기 면역 캠페인 효과 추정. 약재 재고 안전치 +30% 일시 상향 권장.",
      tag: "처방",
    },
  ],

  // ── 상단 알림 배너 ───────────────────────────────────
  alerts: [
    { tone: "danger", icon: "alert-circle", text: "보험 청구 보류 6건이 14일 이상 경과", cta: "검토", jump: "claim" },
    { tone: "warn",   icon: "wallet",       text: "미수금 ₩4,230,000 · 15건 (전월 대비 +12%)", cta: "수금 관리", jump: "collect" },
  ],
};

Object.assign(window, { DASH, fmtKRW, fmtKRWshort, fmtPct, signColor });
