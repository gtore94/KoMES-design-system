// 병원 관리 — 시드 데이터 + 섹션 메타
// 모든 색상/스타일은 tokens(--*) 사용. 하드코딩 금지.

const CLINIC_DATA = {
  name: "솔잎한의원",
  englishName: "Solip Korean Medicine Clinic",
  representative: "김민준",
  bizNumber: "123-45-67890",
  ykiho: "11320012",
  phone: "02-555-7700",
  fax: "02-555-7701",
  email: "admin@solip.kr",
  address: "서울특별시 종로구 인사동길 41, 3층",
  addressDetail: "(인사동, 솔빌딩)",
  postcode: "03145",
  established: "2018-03-12",
  type: "한의원",
  beds: 8,
  staff: 7,
  patientsThisMonth: 1248,
};

const HOURS = [
  { day: "월요일", open: "09:00", close: "19:00", lunch: "13:00–14:00", closed: false },
  { day: "화요일", open: "09:00", close: "19:00", lunch: "13:00–14:00", closed: false },
  { day: "수요일", open: "09:00", close: "19:00", lunch: "13:00–14:00", closed: false },
  { day: "목요일", open: "09:00", close: "21:00", lunch: "13:00–14:00", closed: false, note: "야간진료" },
  { day: "금요일", open: "09:00", close: "19:00", lunch: "13:00–14:00", closed: false },
  { day: "토요일", open: "09:00", close: "14:00", lunch: "—", closed: false },
  { day: "일요일", open: "—", close: "—", lunch: "—", closed: true },
];

const HOLIDAYS = [
  { date: "2026-05-25", name: "부처님오신날", auto: true },
  { date: "2026-06-06", name: "현충일", auto: true },
  { date: "2026-08-15", name: "광복절", auto: true },
  { date: "2026-08-17", name: "임시 휴진 · 학회참석", auto: false },
];

const ROOMS = [
  { code: "P-01", name: "1진료실",     type: "진료", staff: "김민준 원장",   beds: 1, status: "운영" },
  { code: "P-02", name: "2진료실",     type: "진료", staff: "이서연 부원장",  beds: 1, status: "운영" },
  { code: "C-01", name: "체침실 A",    type: "치료", staff: "—",            beds: 3, status: "운영" },
  { code: "C-02", name: "체침실 B",    type: "치료", staff: "—",            beds: 3, status: "운영" },
  { code: "C-03", name: "추나실",      type: "치료", staff: "박지훈 한의사",  beds: 1, status: "운영" },
  { code: "H-01", name: "한약 조제실", type: "조제", staff: "—",            beds: 0, status: "운영" },
  { code: "X-01", name: "리커버리룸",  type: "휴게", staff: "—",            beds: 2, status: "점검 중" },
];

const PRICE_LIST = [
  { code: "AA154", name: "초진진찰료",      cat: "진찰", price: 17310, ins: "급여" },
  { code: "AA254", name: "재진진찰료",      cat: "진찰", price: 12380, ins: "급여" },
  { code: "40011", name: "체침",            cat: "침구", price:  9670, ins: "급여" },
  { code: "40020", name: "투자법",          cat: "침구", price:  6520, ins: "급여" },
  { code: "40300", name: "부항술",          cat: "물리", price:  3210, ins: "급여" },
  { code: "—",     name: "도수치료 30분",   cat: "수기", price: 50000, ins: "비급여" },
  { code: "—",     name: "약침 — 봉약침",   cat: "약침", price: 25000, ins: "비급여" },
  { code: "—",     name: "공진단 1환",      cat: "처방", price: 35000, ins: "비급여" },
];

const LICENSES = [
  { role: "개설자 · 원장", name: "김민준", license: "한의사 면허 제 12345호", issued: "2010-02-21", spec: "한방내과 전문의", status: "유효" },
  { role: "부원장",        name: "이서연", license: "한의사 면허 제 24876호", issued: "2014-08-15", spec: "—",                  status: "유효" },
  { role: "한의사",        name: "박지훈", license: "한의사 면허 제 31204호", issued: "2018-02-22", spec: "추나의학회 정회원",   status: "유효" },
];

const INSURANCE = [
  { name: "국민건강보험공단",     short: "공단",    connected: true,  lastSync: "2026-05-17 08:12", certExpires: "2026-12-30" },
  { name: "건강보험심사평가원",   short: "EDI",     connected: true,  lastSync: "2026-05-17 08:12", certExpires: "2026-12-30" },
  { name: "근로복지공단 · 산재",  short: "근복",    connected: true,  lastSync: "2026-05-16 18:04", certExpires: "2027-03-11" },
  { name: "DB손해보험 · 자보",    short: "DB자보",  connected: true,  lastSync: "2026-05-17 08:10", certExpires: "—" },
  { name: "삼성화재 · 자보",      short: "SS자보",  connected: true,  lastSync: "2026-05-17 08:10", certExpires: "—" },
  { name: "보훈복지공단",          short: "보훈",    connected: false, lastSync: "—",                certExpires: "—" },
];

const BILLING = {
  vatRate: "10%",
  vatIncluded: true,
  cardProcessor: "KIS정보통신",
  cardFee: "1.4% (의료기관 특별요율)",
  bankAccount: "신한 110-321-456789  (예금주 솔잎한의원)",
  cashReceiptAuto: true,
  taxInvoiceAuto: true,
};

const BRANCHES = [
  { name: "솔잎한의원 본원",   loc: "인사동",   role: "본점", address: "서울 종로구 인사동길 41",        staff: 7, status: "운영",      patients: 1248, since: "2018" },
  { name: "솔잎한의원 광교점", loc: "광교",     role: "분원", address: "수원 영통구 광교중앙로 145",      staff: 5, status: "운영",      patients:  812, since: "2022" },
  { name: "솔잎한의원 해운대점", loc: "해운대",  role: "분원", address: "부산 해운대구 우동 1394",         staff: 4, status: "개원 준비", patients:    0, since: "2026" },
];

// ──────────────────────────────────────────────────────────────
// 장비 관리 (의료/조제/IT 장비 + 점검 일정 + 보증)
// ──────────────────────────────────────────────────────────────
const EQUIPMENT = [
  { code: "EQ-001", name: "디지털 침구 자극기 (DA-300)",   cat: "침구",   maker: "동방메디컬",   room: "C-01", purchased: "2023-04-12", warranty: "2026-04-11", nextCheck: "2026-06-15", status: "운영"  },
  { code: "EQ-002", name: "적외선 조사기 (IR-1500)",        cat: "물리",   maker: "OG Giken",     room: "C-01", purchased: "2022-09-03", warranty: "2025-09-02", nextCheck: "2026-05-30", status: "운영"  },
  { code: "EQ-003", name: "전동 추나 베드",                  cat: "수기",   maker: "비스타에이스", room: "C-03", purchased: "2024-02-20", warranty: "2027-02-19", nextCheck: "2026-08-20", status: "운영"  },
  { code: "EQ-004", name: "체성분 분석기 (InBody 770)",      cat: "진단",   maker: "InBody",       room: "P-01", purchased: "2023-11-08", warranty: "2026-11-07", nextCheck: "2026-05-20", status: "점검 예정" },
  { code: "EQ-005", name: "맥진기 (Pulse Pro-300)",           cat: "진단",   maker: "다온",         room: "P-02", purchased: "2024-07-15", warranty: "2027-07-14", nextCheck: "2026-07-15", status: "운영"  },
  { code: "EQ-006", name: "전탕기 (DJ-Master)",              cat: "조제",   maker: "대건",         room: "H-01", purchased: "2021-05-04", warranty: "2024-05-03", nextCheck: "2026-06-04", status: "운영"  },
  { code: "EQ-007", name: "한약 자동 포장기",                cat: "조제",   maker: "대건",         room: "H-01", purchased: "2021-05-04", warranty: "2024-05-03", nextCheck: "2026-06-04", status: "수리 중" },
  { code: "EQ-008", name: "흡각 부항기 (Auto-Cup)",         cat: "물리",   maker: "동방메디컬",   room: "C-02", purchased: "2024-01-22", warranty: "2027-01-21", nextCheck: "2026-09-22", status: "운영"  },
  { code: "EQ-009", name: "POS 키오스크 (Front Desk)",       cat: "IT",     maker: "솔라셋",       room: "—",    purchased: "2023-03-01", warranty: "2026-02-28", nextCheck: "—",          status: "운영"  },
  { code: "EQ-010", name: "차트 워크스테이션 × 4대",         cat: "IT",     maker: "—",            room: "전실", purchased: "2023-03-01", warranty: "2026-02-28", nextCheck: "—",          status: "운영"  },
];

// ──────────────────────────────────────────────────────────────
// 치료재 관리 (보험 치료재 카탈로그 — 상한금액·판매자·적용기간·선별급여)
// ──────────────────────────────────────────────────────────────
const MATERIALS = [
  { code: "P0001001", name: "일회용 부항컵", limit: 114, vendor: "성호통상",                   start: "2012-01-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001002", name: "일회용 부항컵", limit: 124, vendor: "동방침구제작소",             start: "2012-01-01", end: "—", benefit: "본인부담 기본", inUse: true  },
  { code: "P0001003", name: "일회용 부항컵", limit: 114, vendor: "리더스메디텍",               start: "2012-01-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001004", name: "일회용 부항컵", limit: 114, vendor: "디아메디칼상사",             start: "2012-01-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001005", name: "일회용 부항컵", limit: 114, vendor: "행림서원의료기",             start: "2018-04-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001006", name: "일회용 부항컵", limit: 114, vendor: "하이헬스",                   start: "2018-04-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001007", name: "일회용 부항컵", limit: 114, vendor: "굿플",                       start: "2018-04-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001008", name: "일회용 부항컵", limit: 114, vendor: "HANSUNG GREENPACK CO. LTD",  start: "2018-04-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001009", name: "일회용 부항컵", limit: 114, vendor: "DANA MEDICAL",               start: "2018-05-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0001010", name: "일회용 부항컵", limit: 114, vendor: "SINATECH",                   start: "2018-12-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0002001", name: "일회용 호침",   limit: 117, vendor: "성호통상",                   start: "2019-04-01", end: "—", benefit: "본인부담 기본", inUse: true  },
  { code: "P0002002", name: "일회용 호침",   limit: 117, vendor: "동방침구제작소",             start: "2019-04-01", end: "—", benefit: "본인부담 기본", inUse: false },
  { code: "P0003001", name: "피내침(이침)",  limit: 132, vendor: "우진메디칼",                 start: "2020-01-01", end: "—", benefit: "선별급여 50%", inUse: true  },
  { code: "P0004001", name: "약침용 주사기", limit:  98, vendor: "대화메디칼",                 start: "2021-07-01", end: "—", benefit: "본인부담 기본", inUse: false },
];

const BACKUPS = [
  { ts: "2026-05-17 04:00", scope: "전체",       size: "1.42 GB", status: "성공" },
  { ts: "2026-05-16 04:00", scope: "전체",       size: "1.41 GB", status: "성공" },
  { ts: "2026-05-15 04:00", scope: "전체",       size: "1.40 GB", status: "성공" },
  { ts: "2026-05-14 04:00", scope: "차트만",     size: "0.92 GB", status: "성공" },
  { ts: "2026-05-13 04:00", scope: "전체",       size: "1.40 GB", status: "경고" },
];

// 섹션 정의 — roles: 권한 차등
//   "원장"        — 편집 권한
//   "데스크"      — 편집 권한 (기본 정보 등)
//   "데스크-읽기"  — 읽기 전용
//   미포함        — 데스크 계정에서는 잠금 표시
const SECTIONS = [
  { id: "identity",  icon: "building-2",   label: "한의원 기본 정보",   roles: ["원장", "데스크"],        group: "기본" },
  { id: "hours",     icon: "clock",        label: "진료 시간 · 휴진일", roles: ["원장", "데스크"],        group: "기본" },
  { id: "rooms",     icon: "door-open",    label: "진료실 · 베드",      roles: ["원장", "데스크-읽기"], group: "운영" },
  { id: "equipment", icon: "cpu",          label: "장비 관리",          roles: ["원장", "데스크-읽기"], group: "운영" },
  { id: "materials", icon: "syringe",      label: "치료재 관리",        roles: ["원장", "데스크"],        group: "운영" },
  { id: "menu",      icon: "list-checks",  label: "진료 과목 · 수가표", roles: ["원장"],                  group: "운영" },
  { id: "license",   icon: "shield-check", label: "면허 · 자격",        roles: ["원장"],                  group: "법적 정보" },
  { id: "insurance", icon: "file-badge",   label: "보험 연동",          roles: ["원장"],                  group: "법적 정보" },
  { id: "billing",   icon: "receipt",      label: "결제 · 세금",        roles: ["원장"],                  group: "재무" },
  { id: "branch",    icon: "git-branch",   label: "분원 관리",          roles: ["원장", "데스크-읽기"], group: "조직" },
  { id: "staff",     icon: "user-cog",     label: "직원 관리",          roles: ["원장", "데스크"],       group: "조직" },
  { id: "brand",     icon: "image",        label: "로고 · 서식 브랜딩", roles: ["원장"],                  group: "브랜딩" },
  { id: "backup",    icon: "database",     label: "백업 · 데이터",      roles: ["원장"],                  group: "시스템" },
];

// ──────────────────────────────────────────────────────────────
// 알림 — 만료, 미연동, 백업 실패, 점검 중 등
// severity: "critical" | "warning" | "info"
// jump: 클릭 시 이동할 섹션 id
// ──────────────────────────────────────────────────────────────
const ALERTS = [
  {
    id: "a-vet",
    severity: "critical",
    icon: "shield-alert",
    title: "보훈복지공단 EDI 미연동",
    body: "최근 6개월간 보훈환자 3건이 수기 청구로 처리됨. 인증서 등록을 권장합니다.",
    jump: "insurance",
    cta: "보험 연동으로 이동",
  },
  {
    id: "a-cert",
    severity: "warning",
    icon: "key-round",
    title: "공인인증서 만료 D-227",
    body: "공단·심평원 인증서가 2026-12-30 에 만료됩니다. 갱신 일정을 확인하세요.",
    jump: "insurance",
    cta: "인증서 확인",
  },
  {
    id: "a-backup",
    severity: "warning",
    icon: "database",
    title: "백업 1회 경고",
    body: "2026-05-13 백업이 1회 경고 상태로 종료됨. 다음 백업은 정상 완료되었습니다.",
    jump: "backup",
    cta: "백업 로그 보기",
  },
  {
    id: "a-equip",
    severity: "warning",
    icon: "wrench",
    title: "한약 자동 포장기 수리 중",
    body: "EQ-007 한약 자동 포장기가 수리 중입니다. 수기 포장으로 임시 대응 중.",
    jump: "equipment",
    cta: "장비 보기",
  },
  {
    id: "a-room",
    severity: "info",
    icon: "wrench",
    title: "리커버리룸 점검 중",
    body: "X-01 리커버리룸이 점검 일정으로 비활성화되어 있습니다. 예약 캘린더에서 제외됨.",
    jump: "rooms",
    cta: "진료실 보기",
  },
  {
    id: "a-holiday",
    severity: "info",
    icon: "calendar-check",
    title: "법정공휴일 자동 등록",
    body: "부처님오신날(05-25), 현충일(06-06), 광복절(08-15)이 휴진일로 자동 추가됨.",
    jump: "hours",
    cta: "휴진일 확인",
  },
];

function permFor(role, sectionId) {
  const s = SECTIONS.find(x => x.id === sectionId);
  if (!s) return "edit";
  if (s.roles.includes(role)) return "edit";
  if (s.roles.includes(role + "-읽기")) return "read";
  if (role === "원장") return "edit";
  return "locked";
}

Object.assign(window, {
  CLINIC_DATA, HOURS, HOLIDAYS, ROOMS, PRICE_LIST, LICENSES,
  INSURANCE, BILLING, BRANCHES, EQUIPMENT, MATERIALS, BACKUPS, ALERTS,
  SECTIONS, permFor,
});
