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

// ──────────────────────────────────────────────────────────────
// 처방 사전 (한약 처방 — 출전·태그·처방내용 약재 구성)
// ──────────────────────────────────────────────────────────────
const RX_DICT = [
  { name: "보중보익탕", source: "회산43", tags: ["보기", "피로"],
    memo: "",
    content: "백출초 8, 일당귀 6, 백작약초 6, 토사자초 4, 복분자 4, 차전자 4, 산사 4, 봉출 4, 목향 4, 목단피 4, 맥문동거심 4, 산약 4, 황기밀구 4, 백복령 4, 용안육 4, 구기자 4, 인삼 4, 녹각 4, 공사인 3, 천궁 3, 육계 3, 자감초 3, 강3조 2" },
  { name: "십전대보탕", source: "화제국방", tags: ["보혈", "허약"],
    memo: "산후·병후 회복",
    content: "숙지황 4, 백작약 4, 천궁 4, 당귀 4, 인삼 4, 백출 4, 백복령 4, 감초 4, 황기 4, 육계 4" },
  { name: "보중익기탕", source: "동원", tags: ["보기", "피로"],
    memo: "",
    content: "황기 6, 인삼 4, 백출 4, 감초 4, 당귀 2, 진피 2, 승마 1, 시호 1" },
  { name: "쌍화탕", source: "화제국방", tags: ["보혈", "감기"],
    memo: "피로·몸살",
    content: "백작약 10, 숙지황 4, 황기 4, 당귀 4, 천궁 4, 계피 3, 감초 3, 강3조 2" },
  { name: "갈근탕", source: "상한론", tags: ["감기", "발산"],
    memo: "감기 초기·항강",
    content: "갈근 8, 마황 4, 계지 4, 작약 4, 감초 4, 생강 3, 대조 2" },
  { name: "오적산", source: "화제국방", tags: ["소화", "한증"],
    memo: "",
    content: "창출 8, 마황 4, 진피 4, 후박 3, 길경 3, 지각 3, 당귀 3, 건강 3, 백작약 3, 백복령 3" },
  { name: "평위산", source: "화제국방", tags: ["소화"],
    memo: "식체·복부창만",
    content: "창출 8, 후박 4, 진피 4, 감초 2, 강3조 2" },
  { name: "반하사심탕", source: "상한론", tags: ["소화", "심하비"],
    memo: "",
    content: "반하 8, 황금 4, 인삼 4, 감초 4, 황련 2, 건강 4, 대조 3" },
];

// ──────────────────────────────────────────────────────────────
// 보험약 사용설정 (제약사별 보험 한약제제 카탈로그 + 사용 목록)
// ──────────────────────────────────────────────────────────────
const INS_MEDS = [
  { maker: "경방신약(주)", name: "갈근탕 엑스산",     dose: "3g", price: 1342 },
  { maker: "경방신약(주)", name: "소청룡탕 엑스산",   dose: "3g", price: 1287 },
  { maker: "경방신약(주)", name: "반하사심탕 엑스산", dose: "3g", price: 1518 },
  { maker: "경방신약(주)", name: "보중익기탕 엑스산", dose: "3g", price: 1925 },
  { maker: "경방신약(주)", name: "오적산 엑스산",     dose: "3g", price: 1684 },
  { maker: "경방신약(주)", name: "평위산 엑스산",     dose: "3g", price:  982 },
  { maker: "한국신약(주)", name: "쌍화탕 엑스산",     dose: "3g", price: 1120 },
  { maker: "한국신약(주)", name: "갈근탕 엑스산",     dose: "3g", price: 1310 },
  { maker: "한국신약(주)", name: "황련해독탕 엑스산", dose: "3g", price: 1233 },
  { maker: "정우신약(주)", name: "십전대보탕 엑스산", dose: "3g", price: 2140 },
  { maker: "정우신약(주)", name: "보중익기탕 엑스산", dose: "3g", price: 1890 },
  { maker: "한풍제약(주)", name: "소시호탕 엑스산",   dose: "3g", price: 1450 },
  { maker: "한풍제약(주)", name: "작약감초탕 엑스산", dose: "3g", price: 1077 },
];

const INS_MEDS_USED = [
  { code: "M00001", maker: "경방신약(주)", name: "갈근탕 엑스산",     price: 1342 },
  { code: "M00002", maker: "한풍제약(주)", name: "작약감초탕 엑스산", price: 1077 },
  { code: "M00003", maker: "정우신약(주)", name: "십전대보탕 엑스산", price: 2140 },
];

// ──────────────────────────────────────────────────────────────
// 첩약 건강보험 시범사업
// ──────────────────────────────────────────────────────────────
// 탕전실 기본 설정 (자체탕전)
const TANGJEON = { mode: "원내", seq: "01", preparer: "대표자명" };

// 한약재 목록 (업체별 공급 카탈로그)
const HERB_CATALOG = [
  { company: "(유)대제제약",        item: "가자", mainCode: "3001H1AHM", repCode: "8800628000305", productCode: "062800030" },
  { company: "(주)광명생약",        item: "가자", mainCode: "3001H1AHM", repCode: "8800646013905", productCode: "064601390" },
  { company: "(주)농림생약",        item: "가자", mainCode: "3001H1AHM", repCode: "8800616016608", productCode: "061601660" },
  { company: "(주)동양한방제약",    item: "가자", mainCode: "3001H1AHM", repCode: "8800684000509", productCode: "068400050" },
  { company: "(주)동양허브",        item: "가자", mainCode: "3001H1AHM", repCode: "8800672012101", productCode: "067201210" },
  { company: "(주)보양제약",        item: "갈근", mainCode: "3002H1AHM", repCode: "8800614029105", productCode: "061402910" },
  { company: "(주)세화당",          item: "감국", mainCode: "3004H1AHM", repCode: "8800608016401", productCode: "060801640" },
  { company: "(주)신흥제약",        item: "감초", mainCode: "3007H1AHM", repCode: "8800606008200", productCode: "060600820" },
  { company: "(주)옥천당",          item: "강활", mainCode: "3012H1AHM", repCode: "8800613000105", productCode: "061300010" },
  { company: "(주)자연세상",        item: "강황", mainCode: "3013H1AHM", repCode: "8800675018308", productCode: "067501830" },
  { company: "(주)푸른무약",        item: "개자", mainCode: "3014H1AHM", repCode: "8800687000100", productCode: "068700010" },
  { company: "고강제약",            item: "건강", mainCode: "3017H1AHM", repCode: "8800673000107", productCode: "067300010" },
  { company: "녹원제약(주)",        item: "계지", mainCode: "3033H1AHM", repCode: "8800676010707", productCode: "067601070" },
  { company: "농업회사법인다온허브주식회사", item: "곽향", mainCode: "3051H1AHM", repCode: "8800663003001", productCode: "063300300" },
];

// 등록된 한약재 (구매처·원산지·구매가 — excluded는 취급제외)
const HERB_REGISTERED = [
  { company: "취급제외",                  item: "갈근",     mainCode: "3002H1AHM", productCode: "699917070", origin: "",            buyDate: "2024-09-04", buyPrice: 0,      excluded: true },
  { company: "농업회사법인다온허브주식회사", item: "갈근",   mainCode: "3002H1AHM", productCode: "063301370", origin: "중국",        buyDate: "2024-06-24", buyPrice: 5.166 },
  { company: "씨케이주식회사",            item: "감국",     mainCode: "3004H1AHM", productCode: "061902300", origin: "중국",        buyDate: "2024-04-30", buyPrice: 18.333 },
  { company: "취급제외",                  item: "감초",     mainCode: "3007H1AHM", productCode: "699917070", origin: "",            buyDate: "2025-10-10", buyPrice: 0,      excluded: true },
  { company: "농업회사법인다온허브주식회사", item: "감초",   mainCode: "3007H1AHM", productCode: "063301410", origin: "중국",        buyDate: "2024-04-30", buyPrice: 20.333 },
  { company: "취급제외",                  item: "감초밀자", mainCode: "3009H1AHM", productCode: "699917070", origin: "",            buyDate: "2025-06-09", buyPrice: 0,      excluded: true },
  { company: "(주)농림생약",              item: "감초초",   mainCode: "3010H1AHM", productCode: "061601740", origin: "중국",        buyDate: "2024-04-08", buyPrice: 21.833 },
  { company: "취급제외",                  item: "강활",     mainCode: "3012H1AHM", productCode: "699917070", origin: "",            buyDate: "2025-03-18", buyPrice: 0,      excluded: true },
  { company: "농업회사법인 주식회사 월드허브", item: "강활", mainCode: "3012H1AHM", productCode: "066800040", origin: "한국(경북 봉화)", buyDate: "2024-04-30", buyPrice: 37 },
  { company: "농업회사법인다온허브주식회사", item: "강황",   mainCode: "3013H1AHM", productCode: "063300090", origin: "인도",        buyDate: "2024-07-08", buyPrice: 8.5 },
  { company: "(주)현진제약",              item: "개자",     mainCode: "3014H1AHM", productCode: "064800400", origin: "중국",        buyDate: "2025-05-07", buyPrice: 7.166 },
  { company: "취급제외",                  item: "갱미",     mainCode: "3016H1AHM", productCode: "699917070", origin: "",            buyDate: "2025-08-30", buyPrice: 0,      excluded: true },
  { company: "취급제외",                  item: "건강",     mainCode: "3017H1AHM", productCode: "699917070", origin: "",            buyDate: "2025-05-07", buyPrice: 0,      excluded: true },
  { company: "농업회사법인다온허브주식회사", item: "건강",   mainCode: "3017H1AHM", productCode: "063301010", origin: "페루",        buyDate: "2024-04-30", buyPrice: 11.166 },
  { company: "취급제외",                  item: "계심",     mainCode: "3032H1AHM", productCode: "699917070", origin: "",            buyDate: "2024-09-28", buyPrice: 0,      excluded: true },
  { company: "농업회사법인다온허브주식회사", item: "계지",   mainCode: "3033H1AHM", productCode: "063300760", origin: "중국",        buyDate: "2024-04-30", buyPrice: 5.333 },
  { company: "씨케이주식회사",            item: "고량강",   mainCode: "3035H1AHM", productCode: "061902210", origin: "중국",        buyDate: "—",          buyPrice: 0 },
  { company: "씨케이주식회사",            item: "고본",     mainCode: "3039H1AHM", productCode: "061900240", origin: "중국",        buyDate: "—",          buyPrice: 0 },
  { company: "농업회사법인다온허브주식회사", item: "골쇄보", mainCode: "3049H1AHM", productCode: "063300400", origin: "미얀마",      buyDate: "—",          buyPrice: 0 },
];

const CHEOP_DISEASES = ["전체", "기능성소화불량", "알레르기성비염", "월경통", "요추추간판탈출증"];

const CHEOP_CATALOG = [
  { disease: "기능성소화불량", name: "가미소요산_변증",   code: "H00610013" },
  { disease: "기능성소화불량", name: "가미청심탕",        code: "H00620016" },
  { disease: "기능성소화불량", name: "갈근탕_변증",       code: "H00610018" },
  { disease: "기능성소화불량", name: "갈근해기탕",        code: "H00620019" },
  { disease: "기능성소화불량", name: "거풍탕",            code: "H00620025" },
  { disease: "기능성소화불량", name: "곽향정기산",        code: "H00620031" },
  { disease: "기능성소화불량", name: "관계부자이중탕",    code: "H00620184" },
  { disease: "기능성소화불량", name: "궁귀총소이중탕",    code: "H00620033" },
  { disease: "기능성소화불량", name: "귀비탕",            code: "H00610037" },
  { disease: "기능성소화불량", name: "내소산",            code: "H00600187" },
  { disease: "기능성소화불량", name: "내소화중탕",        code: "H00600188" },
  { disease: "기능성소화불량", name: "반하사심탕",        code: "H00610057" },
  { disease: "기능성소화불량", name: "방풍통성산",        code: "H00610060" },
  { disease: "기능성소화불량", name: "향사육군자탕",      code: "H00610163" },
  { disease: "알레르기성비염", name: "가미통규탕",        code: "H00400181" },
  { disease: "알레르기성비염", name: "형개연교탕",        code: "H00400253" },
  { disease: "알레르기성비염", name: "방풍통성산",        code: "H00410060" },
  { disease: "월경통",         name: "현부이경탕",        code: "H00100165" },
  { disease: "월경통",         name: "가감오적산",        code: "H00100001" },
  { disease: "월경통",         name: "교애사물탕",        code: "H00100032" },
  { disease: "요추추간판탈출증", name: "활락탕",          code: "H00500254" },
];

const CHEOP_USED = [
  { disease: "기능성소화불량", name: "곽향정기산",        code: "H00620031" },
  { disease: "알레르기성비염", name: "가미통규탕",        code: "H00400181" },
  { disease: "월경통",         name: "현부이경탕",        code: "H00100165" },
  { disease: "기능성소화불량", name: "육울탕",            code: "H00610116" },
  { disease: "월경통",         name: "가감오적산",        code: "H00100001" },
  { disease: "요추추간판탈출증", name: "활락탕",          code: "H00500254" },
  { disease: "알레르기성비염", name: "형개연교탕",        code: "H00400253" },
  { disease: "알레르기성비염", name: "방풍통성산",        code: "H00410060" },
  { disease: "기능성소화불량", name: "내소중탕",          code: "H00600188" },
  { disease: "월경통",         name: "교애사물탕",        code: "H00100032" },
  { disease: "기능성소화불량", name: "향사육군자탕",      code: "H00610163" },
];

// 처방 코드별 약재 구성 (없는 코드는 빈 구성)
const CHEOP_HERBS = {
  "H00620031": [ // 곽향정기산
    { ic: "d00251", herb: "곽향",   origin: "중국", dose: 6, adj: 0, orig: 6 },
    { ic: "d00863", herb: "자소엽", origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00115", herb: "백지",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00342", herb: "대복피", origin: "중국", dose: 4, adj: 0, orig: 4 },
    { ic: "d00078", herb: "백복령", origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00701", herb: "후박",   origin: "중국", dose: 4, adj: 0, orig: 4 },
    { ic: "d00065", herb: "백출",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00455", herb: "진피",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00390", herb: "반하",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00012", herb: "감초",   origin: "국산", dose: 3, adj: 0, orig: 3 },
  ],
  "H00400181": [ // 가미통규탕
    { ic: "d00115", herb: "백지",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00210", herb: "길경",   origin: "국산", dose: 4, adj: 0, orig: 4 },
    { ic: "d00500", herb: "신이",   origin: "중국", dose: 4, adj: 0, orig: 4 },
    { ic: "d00521", herb: "세신",   origin: "중국", dose: 2, adj: 0, orig: 2 },
    { ic: "d00012", herb: "감초",   origin: "국산", dose: 2, adj: 0, orig: 2 },
  ],
};

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
  { id: "rxdict",    icon: "book-text",    label: "처방 사전",          roles: ["원장", "데스크"],        group: "운영" },
  { id: "nonbenefit",icon: "tag",          label: "기타 비급여",        roles: ["원장", "데스크"],        group: "운영" },
  { id: "fees",      icon: "calculator",   label: "보험 수가",          roles: ["원장", "데스크"],        group: "운영" },
  { id: "insmeds",   icon: "package-2",    label: "보험약 사용설정",    roles: ["원장", "데스크"],        group: "운영" },
  { id: "cheopset",  icon: "settings-2",   label: "첩약 시범사업 설정", roles: ["원장"],                  group: "운영" },
  { id: "cheopuse",  icon: "layers",       label: "첩약 시범사업 사용설정", roles: ["원장", "데스크"],     group: "운영" },
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
  NONBENEFIT_ORDERS, NONBENEFIT_CATS, INSURANCE_FEES, FEE_CATS, RX_DICT,
  INS_MEDS, INS_MEDS_USED,
  TANGJEON, HERB_CATALOG, HERB_REGISTERED, CHEOP_DISEASES, CHEOP_CATALOG, CHEOP_USED, CHEOP_HERBS,
  BACKUPS, ALERTS,
  SECTIONS, permFor,
});
