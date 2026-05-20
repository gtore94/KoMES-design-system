// KoMES — 수금 관리 데이터 (환자 미수금 + 보험사 입금 대기)
// 시점: 2026-05-20 기준

const COLLECTIONS = {
  asOf: "2026-05-20 14:32",

  // ─── 환자 미수금 (본인부담금 미납) ───────────────
  // status: pending / promised / overdue
  // contacts: 최근 연락 시도 (역순)
  patient: [
    {
      id: "P-2026-0341", patientId: 1, name: "홍길동",  gender: "남", age: 40, phone: "010-1234-5678",
      visitDate: "2026-05-12", overdueDays: 8,  amount: 78000,  origin: "교통사고 후 본인부담",
      status: "promised", promisedDate: "2026-05-22",
      lastContact: { date: "2026-05-18", channel: "전화", result: "다음 주 월요일 입금 약속" },
      contacts: 2,
    },
    {
      id: "P-2026-0298", patientId: 8, name: "윤지영",  gender: "여", age: 26, phone: "010-2200-8833",
      visitDate: "2026-04-22", overdueDays: 28, amount: 145000, origin: "한약 비급여 잔금",
      status: "overdue",
      lastContact: { date: "2026-05-15", channel: "문자", result: "응답 없음" },
      contacts: 3,
    },
    {
      id: "P-2026-0387", patientId: 11, name: "한지민", gender: "여", age: 34, phone: "010-4455-1100",
      visitDate: "2026-05-15", overdueDays: 5,  amount: 32000,  origin: "체침 본인부담",
      status: "pending",
      lastContact: null,
      contacts: 0,
    },
    {
      id: "P-2026-0245", patientId: 4, name: "박지현",  gender: "여", age: 57, phone: "010-3344-7788",
      visitDate: "2026-03-10", overdueDays: 71, amount: 280000, origin: "한약 + 도수치료",
      status: "overdue",
      lastContact: { date: "2026-04-28", channel: "방문 안내", result: "이번 주 방문 약속 — 미방문" },
      contacts: 5,
    },
    {
      id: "P-2026-0410", patientId: 14, name: "안세영", gender: "여", age: 30, phone: "010-6677-2244",
      visitDate: "2026-05-18", overdueDays: 2,  amount: 18500,  origin: "자보 후 잔액",
      status: "pending",
      lastContact: null,
      contacts: 0,
    },
    {
      id: "P-2026-0205", patientId: 7, name: "오세훈",  gender: "남", age: 46, phone: "010-8800-4411",
      visitDate: "2026-02-18", overdueDays: 91, amount: 95000,  origin: "추나 비급여",
      status: "overdue",
      lastContact: { date: "2026-04-05", channel: "전화", result: "연락 불가 (결번 의심)" },
      contacts: 4,
    },
    {
      id: "P-2026-0376", patientId: 6, name: "정유미",  gender: "여", age: 30, phone: "010-6611-2233",
      visitDate: "2026-05-14", overdueDays: 6,  amount: 24000,  origin: "한약 1제",
      status: "promised", promisedDate: "2026-05-21",
      lastContact: { date: "2026-05-19", channel: "카톡", result: "내일 입금 예정" },
      contacts: 1,
    },
  ],

  // ─── 보험사 입금 대기 (청구 완료, 입금 미수령) ────
  // status: submitted / approved / partial / hold
  insurer: [
    {
      id: "C-2026-1042", claimNo: "NHIS-26050412",
      patient: "송재호", patientId: 13,
      insurer: "건강보험심사평가원", type: "건강보험",
      submittedDate: "2026-04-22", expectedDate: "2026-05-25",
      daysOut: 28, amount: 1850000, status: "approved",
      lastUpdate: "2026-05-18 · 심사 완료",
    },
    {
      id: "C-2026-1048", claimNo: "SS-FIRE-26041209",
      patient: "장우성", patientId: 12,
      insurer: "삼성화재", type: "자동차보험",
      submittedDate: "2026-04-12", expectedDate: "2026-05-25",
      daysOut: 38, amount: 3200000, status: "approved",
      lastUpdate: "2026-05-10 · 본사 결재 대기",
    },
    {
      id: "C-2026-1051", claimNo: "DB-INS-26050805",
      patient: "이민호", patientId: 3,
      insurer: "DB손해보험", type: "자동차보험",
      submittedDate: "2026-05-08", expectedDate: "2026-06-08",
      daysOut: 12, amount: 1450000, status: "submitted",
      lastUpdate: "2026-05-08 · 접수 확인",
    },
    {
      id: "C-2026-1037", claimNo: "NHIS-26040918",
      patient: "한지민", patientId: 11,
      insurer: "건강보험심사평가원", type: "건강보험",
      submittedDate: "2026-04-09", expectedDate: "2026-05-12",
      daysOut: 41, amount: 920000, status: "hold",
      lastUpdate: "2026-05-15 · 보완 요청 (진단명 코드)",
    },
    {
      id: "C-2026-1029", claimNo: "NHIS-HERB-26032801",
      patient: "박지현", patientId: 4,
      insurer: "건강보험심사평가원", type: "한약 첩약",
      submittedDate: "2026-03-28", expectedDate: "2026-04-30",
      daysOut: 53, amount: 720000, status: "partial",
      lastUpdate: "2026-05-08 · 일부 지급 ₩540,000 (75%)",
    },
    {
      id: "C-2026-1055", claimNo: "MERITZ-26051304",
      patient: "강민재", patientId: 9,
      insurer: "메리츠화재", type: "자동차보험",
      submittedDate: "2026-05-13", expectedDate: "2026-06-15",
      daysOut: 7, amount: 2100000, status: "submitted",
      lastUpdate: "2026-05-13 · 접수 확인",
    },
    {
      id: "C-2026-1023", claimNo: "HD-DAMAGE-26022014",
      patient: "오세훈", patientId: 7,
      insurer: "현대해상", type: "자동차보험",
      submittedDate: "2026-02-20", expectedDate: "2026-03-25",
      daysOut: 89, amount: 1680000, status: "hold",
      lastUpdate: "2026-04-30 · 의무기록 보완 요청 — 회신 대기",
    },
    {
      id: "C-2026-1058", claimNo: "KCOMWEL-26050601",
      patient: "강민재", patientId: 9,
      insurer: "근로복지공단", type: "산재보험",
      submittedDate: "2026-05-06", expectedDate: "2026-06-10",
      daysOut: 14, amount: 980000, status: "approved",
      lastUpdate: "2026-05-19 · 승인 · 지급 처리 중",
    },
    {
      id: "C-2026-1031", claimNo: "KCOMWEL-26040104",
      patient: "오세훈", patientId: 7,
      insurer: "근로복지공단", type: "산재보험",
      submittedDate: "2026-04-01", expectedDate: "2026-05-08",
      daysOut: 49, amount: 1240000, status: "hold",
      lastUpdate: "2026-05-02 · 재해경위서 보완 요청",
    },
    {
      id: "C-2026-1044", claimNo: "NHIS-HERB-26041502",
      patient: "정유미", patientId: 6,
      insurer: "건강보험심사평가원", type: "한약 첩약",
      submittedDate: "2026-04-15", expectedDate: "2026-05-18",
      daysOut: 35, amount: 480000, status: "approved",
      lastUpdate: "2026-05-15 · 심사 완료 · 지급 예정",
    },
  ],

  // ─── 활동 로그 (최근 연락/조치) ─────────────────
  activity: [
    { time: "오늘 11:42", who: "김간호", action: "전화 시도", target: "오세훈", result: "결번 — 보호자 연락처 등록 필요" },
    { time: "오늘 10:08", who: "박실장", action: "카톡 발송", target: "윤지영", result: "확인 응답 없음" },
    { time: "어제 16:30", who: "박실장", action: "보완 회신", target: "C-2026-1037 한지민", result: "진단코드 수정 후 재제출" },
    { time: "어제 14:15", who: "김간호", action: "방문 정산", target: "정유미", result: "약속일 5/21로 변경" },
    { time: "5/18 09:20", who: "박실장", action: "독촉장 발송", target: "박지현", result: "내용증명 1차" },
  ],
};

// 우선순위 점수 (긴급도 = log10(금액) × 연체일)
function urgency(amount, days) {
  return Math.log10(Math.max(amount, 1)) * Math.max(days, 1);
}

// 상태 라벨/색상
const COLLECTION_STATUS = {
  pending:   { label: "대기",       color: "var(--ink-400)",      bg: "var(--ink-400-bg)",      border: "var(--ink-400-border)" },
  promised:  { label: "입금 약속",  color: "var(--brand)",        bg: "var(--brand-subtle)",    border: "var(--brand-muted)" },
  overdue:   { label: "연체",       color: "var(--cinnabar-700)", bg: "var(--cinnabar-100)",    border: "var(--cinnabar-200)" },
  submitted: { label: "접수 완료",  color: "var(--accent-slate)", bg: "var(--accent-slate-bg)", border: "var(--accent-slate-border)" },
  approved:  { label: "승인 · 입금 예정", color: "var(--jade-700)",    bg: "var(--jade-50)",         border: "var(--jade-200)" },
  partial:   { label: "부분 지급",  color: "var(--amber-700)",    bg: "var(--amber-100)",       border: "var(--amber-200)" },
  hold:      { label: "보완 요청",  color: "var(--cinnabar-700)", bg: "var(--cinnabar-100)",    border: "var(--cinnabar-200)" },
};

// aging 버킷
function ageBucket(days) {
  if (days <= 7)  return "0–7일";
  if (days <= 14) return "8–14일";
  if (days <= 30) return "15–30일";
  return "30일+";
}
const AGE_BUCKETS = ["0–7일", "8–14일", "15–30일", "30일+"];

// 보험 유형 필터 메타
const INSURER_TYPES = [
  { key: "건강보험",     icon: "shield-check",  color: "var(--jade-600)" },
  { key: "자동차보험",   icon: "car",           color: "var(--cinnabar-600)" },
  { key: "산재보험",     icon: "hard-hat",      color: "var(--amber-600)" },
  { key: "한약 첩약",    icon: "flask-conical", color: "var(--accent-pine)" },
];

Object.assign(window, { COLLECTIONS, COLLECTION_STATUS, urgency, ageBucket, AGE_BUCKETS, INSURER_TYPES });
