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

// ──────────────────────────────────────────────────────────────
// 보험 임의처방 (원내 조제 보험 한약 처방 — 약재 조합 + 단가)
// ──────────────────────────────────────────────────────────────
const RX_SUPPLIERS = ["경방신약(주)", "한국신약(주)", "정우신약(주)", "한풍제약(주)"];

const INSURANCE_RX = [
  { code: "C00010000", name: "작약감초탕", price: 1077, note: "", herbs: [
    { supplier: "경방신약(주)", name: "작약", qty: 8 },
    { supplier: "경방신약(주)", name: "감초", qty: 8 },
  ]},
  { code: "C00010001", name: "갈근탕",     price: 1342, note: "감기 초기", herbs: [
    { supplier: "경방신약(주)", name: "갈근", qty: 8 },
    { supplier: "경방신약(주)", name: "마황", qty: 4 },
    { supplier: "경방신약(주)", name: "계지", qty: 4 },
  ]},
  { code: "C00010002", name: "반하사심탕", price: 1518, note: "", herbs: [] },
  { code: "C00010003", name: "보중익기탕", price: 1925, note: "기허·피로", herbs: [] },
  { code: "C00010004", name: "오적산",     price: 1684, note: "", herbs: [] },
  { code: "C00010005", name: "평위산",     price:  982, note: "소화불량", herbs: [] },
  { code: "C00010006", name: "황련해독탕", price: 1233, note: "", herbs: [] },
  { code: "C00010007", name: "십전대보탕", price: 2140, note: "허약·보혈", herbs: [] },
];

// ──────────────────────────────────────────────────────────────
// 기타 비급여 오더 (비급여 시술·투약·검사 등 카탈로그)
// ──────────────────────────────────────────────────────────────
const NONBENEFIT_CATS = ["전체", "투약", "물리요법", "시술 및 처치", "검사", "기타", "제증명수수료", "자동차보험"];

const NONBENEFIT_ORDERS = [
  { code: "sb0617",     name: "(옴니핏+인바디)",                price: 15000,  vat: 0, cat: "검사",        report: "미확인", taxable: true },
  { code: "*",          name: "*일반한약",                      price: 0,      vat: 0, cat: "투약",        report: "미확인", taxable: true },
  { code: "12062",      name: "8자형 밴드(산재)",               price: 10000,  vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "SE21",       name: "GDP",                            price: 15000,  vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "SE61",       name: "GSP",                            price: 15000,  vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "29061",      name: "QSCCII 설문지에 의한 심성검사",   price: 0,      vat: 0, cat: "검사",        report: "Y",      taxable: true },
  { code: "29062",      name: "QSCCII 설문지에 의한 심성검사 및 상담", price: 0, vat: 0, cat: "검사",        report: "Y",      taxable: true },
  { code: "6/25",       name: "가감귀룡탕연조",                 price: 50000,  vat: 0, cat: "투약",        report: "미확인", taxable: true },
  { code: "SE31",       name: "가미오적3포",                    price: 15000,  vat: 0, cat: "투약",        report: "미확인", taxable: true },
  { code: "SE49",       name: "가미오적환",                     price: 2000,   vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "SE45",       name: "가미팔물환",                     price: 3000,   vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "290120000",  name: "가속도맥파검사",                 price: 0,      vat: 0, cat: "검사",        report: "Y",      taxable: true },
  { code: "19100",      name: "가정간호교통비[1회방문당]",      price: 7100,   vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "70714",      name: "간병요구도 평가 소견서-의원(산재)", price: 20000, vat: 0, cat: "제증명수수료", report: "미확인", taxable: true },
  { code: "SE12",       name: "건양단",                         price: 4000,   vat: 0, cat: "투약",        report: "미확인", taxable: true },
  { code: "MI-93027",   name: "경근간섭저주파요법(ICT)",        price: 5510,   vat: 0, cat: "자동차보험",  report: "Y",      taxable: true },
  { code: "tens",       name: "경근저주파요법",                 price: 0,      vat: 0, cat: "물리요법",    report: "미확인", taxable: true },
  { code: "49020",      name: "경근중주파요법(자보)",           price: 3030,   vat: 0, cat: "자동차보험",  report: "Y",      taxable: true },
  { code: "SE57",       name: "경옥고(1.2Kg)",                  price: 300000, vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "SE22",       name: "경옥고(500g)",                   price: 150000, vat: 0, cat: "기타",        report: "미확인", taxable: true },
  { code: "SE71",       name: "NM약침",                         price: 10000,  vat: 0, cat: "시술 및 처치", report: "미확인", taxable: true },
  { code: "SE72",       name: "봉약침",                         price: 15000,  vat: 0, cat: "시술 및 처치", report: "미확인", taxable: true },
];

// ──────────────────────────────────────────────────────────────
// 보험 수가 (건강보험 수가 + 준용수가 — 적용기간별 단가)
//   단가 색: 적용종료일이 지난 항목은 만료(빨강), 유효 항목은 파랑
// ──────────────────────────────────────────────────────────────
const FEE_CATS = ["전체", "진찰료", "관리료", "진료지원금", "방문진료", "침구", "약침", "검사", "기타"];

const INSURANCE_FEES = [
  { code: "JJJJJ",     name: "산소10L(1시간30분)(699900020(10원)*1)",                          price:    270, maker: "", note: "", cat: "기타",        start: "2017-06-01", end: "2017-07-31" },
  { code: "94100",     name: "(비상)추석 연휴 운영 진료지원금",                                 price:   3000, maker: "", note: "", cat: "진료지원금", start: "2024-09-14", end: "2024-09-18" },
  { code: "94020",     name: "(비상)설 연휴 운영 진료지원금_설당일",                            price:   6000, maker: "", note: "", cat: "진료지원금", start: "2025-01-29", end: "2025-01-29" },
  { code: "94010",     name: "(비상)설 연휴 운영 진료지원금",                                   price:   3000, maker: "", note: "", cat: "진료지원금", start: "2025-01-25", end: "2025-02-02" },
  { code: "91004",     name: "비대면진료 관리료-공휴",                                          price:   3000, maker: "", note: "", cat: "관리료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "91004",     name: "비대면진료 관리료-공휴",                                          price:   2950, maker: "", note: "", cat: "관리료",     start: "2025-01-01", end: "2025-12-31" },
  { code: "91004",     name: "비대면진료 관리료-공휴",                                          price:   2840, maker: "", note: "", cat: "관리료",     start: "2024-01-01", end: "2024-12-31" },
  { code: "91003",     name: "비대면진료 관리료-심야",                                          price:   3000, maker: "", note: "", cat: "관리료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "91003",     name: "비대면진료 관리료-심야",                                          price:   2950, maker: "", note: "", cat: "관리료",     start: "2025-01-01", end: "2025-12-31" },
  { code: "91002",     name: "비대면진료 관리료-야간",                                          price:   3000, maker: "", note: "", cat: "관리료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "91001",     name: "비대면진료 관리료-주간",                                          price:   2840, maker: "", note: "", cat: "관리료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "91000R04",  name: "한의방문진료료-의료접근성 취약지기관, 동일 세대 환자 연속 방문, 두번째 방문부터", price: 64960, maker: "", note: "", cat: "방문진료", start: "2026-01-01", end: "2026-12-31" },
  { code: "91000R03",  name: "한의방문진료료-의료접근성 취약지기관, 동일 건물 환자 연속 방문",  price:  97430, maker: "", note: "", cat: "방문진료",   start: "2026-01-01", end: "2026-12-31" },
  { code: "91000R00",  name: "한의방문진료료-의료접근성 취약지기관 방문",                       price: 129910, maker: "", note: "", cat: "방문진료",   start: "2026-01-01", end: "2026-12-31" },
  { code: "AA154",     name: "초진진찰료",                                                     price:  17310, maker: "", note: "", cat: "진찰료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "AA254",     name: "재진진찰료",                                                     price:  12380, maker: "", note: "", cat: "진찰료",     start: "2026-01-01", end: "2026-12-31" },
  { code: "40011",     name: "체침",                                                           price:   9670, maker: "", note: "", cat: "침구",       start: "2026-01-01", end: "2026-12-31" },
  { code: "40300",     name: "부항술(건식)",                                                   price:   3210, maker: "", note: "", cat: "침구",       start: "2026-01-01", end: "2026-12-31" },
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
  { id: "rx",        icon: "pill",         label: "보험 임의처방",      roles: ["원장", "데스크"],        group: "운영" },
  { id: "nonbenefit",icon: "tag",          label: "기타 비급여",        roles: ["원장", "데스크"],        group: "운영" },
  { id: "fees",      icon: "calculator",   label: "보험 수가",          roles: ["원장", "데스크"],        group: "운영" },
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
  INSURANCE, BILLING, BRANCHES, EQUIPMENT, MATERIALS, INSURANCE_RX, RX_SUPPLIERS,
  NONBENEFIT_ORDERS, NONBENEFIT_CATS, INSURANCE_FEES, FEE_CATS, BACKUPS, ALERTS,
  SECTIONS, permFor,
});
