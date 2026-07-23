// KoMES — 실비보험 (Private Indemnity Insurance) Data
// 사용처: RealCostScreen.jsx
// 전역 이름 충돌 방지 위해 RC_ 접두사 사용

// ── 실비보험 세대별 정보 ─────────────────────────────────────────
// 출처: 금감원 실손의료보험 표준약관 (2024 개정 기준 — 데모용 가상 데이터)
const RC_GENERATIONS = [
  {
    id: "1G", name: "1세대 (구실손)", period: "2009.10 이전",
    outpatient: "공제 5,000원 / 한도 5천만원",
    coverageRate: 100, // 한방 비급여 보장률 (의료비 대비)
    badge: "neutral",
    notes: "한방 진료비(비급여 포함) 보장. 자기부담금 적음.",
  },
  {
    id: "2G", name: "2세대 (표준화실손)", period: "2009.10 ~ 2017.03",
    outpatient: "공제 1~2만원 / 자기부담 10~20%",
    coverageRate: 80,
    badge: "neutral",
    notes: "한방 급여만 보장 (비급여 한약·첩약 제외).",
  },
  {
    id: "3G", name: "3세대 (新실손)", period: "2017.04 ~ 2021.06",
    outpatient: "공제 1~3만원 / 자기부담 20~30%",
    coverageRate: 70,
    badge: "neutral",
    notes: "도수치료·MRI 특약 분리. 한방 비급여 제외.",
  },
  {
    id: "4G", name: "4세대", period: "2021.07 이후",
    outpatient: "급여/비급여 분리 / 자기부담 20·30%",
    coverageRate: 65,
    badge: "brand",
    notes: "비급여 이용량에 따라 보험료 차등. 한방 급여만 보장.",
  },
  {
    id: "5G", name: "5세대 (예고)", period: "2026 이후 도입 예정",
    outpatient: "비급여 자기부담 강화 예정",
    coverageRate: 50,
    badge: "warning",
    notes: "도입 일정 확정 후 안내 예정.",
  },
];

// ── 주요 보험사 (가상 시드 데이터 — 실제 상품·연락처 아님) ──────────
const RC_INSURERS = [
  { id: "samsung", name: "삼성생명",  type: "life",  color: "#1B4DA0", short: "삼성", call: "1588-3114", web: "samsunglife.com",  app: "삼성생명 다이렉트",  efax: "02-751-8000" },
  { id: "samfire", name: "삼성화재",  type: "p&c",   color: "#1B4DA0", short: "삼화", call: "1588-5114", web: "samsungfire.com",  app: "삼성화재 다이렉트",  efax: "02-3458-5500" },
  { id: "hdfire",  name: "현대해상",  type: "p&c",   color: "#00688D", short: "현대", call: "1588-5656", web: "hi.co.kr",         app: "현대해상 굿앤굿",   efax: "02-3701-7000" },
  { id: "kbins",   name: "KB손해보험", type: "p&c",   color: "#564392", short: "KB",  call: "1544-0114", web: "kbinsure.co.kr",   app: "KB손해보험",        efax: "02-2118-0000" },
  { id: "dbins",   name: "DB손해보험", type: "p&c",   color: "#005BAC", short: "DB",  call: "1588-0100", web: "idbins.com",       app: "DB손해 프로미",      efax: "02-330-0114" },
  { id: "mritz",   name: "메리츠화재", type: "p&c",   color: "#D6001C", short: "메리츠", call: "1566-7711", web: "meritzfire.com",  app: "메리츠 패밀리",      efax: "02-3786-2114" },
  { id: "hwhana",  name: "한화생명",  type: "life",  color: "#FF7900", short: "한화", call: "1588-6363", web: "hanwhalife.com",   app: "한화생명 모바일",    efax: "02-3702-2000" },
  { id: "kyobo",   name: "교보생명",  type: "life",  color: "#016A4B", short: "교보", call: "1588-1001", web: "kyobo.co.kr",      app: "교보생명",          efax: "02-721-3114" },
  { id: "lina",    name: "라이나생명", type: "life",  color: "#D11947", short: "라이나", call: "1588-0058", web: "lina.co.kr",      app: "라이나 다이렉트",    efax: "02-3279-0114" },
  { id: "nh",      name: "농협손해보험", type: "p&c", color: "#0A6D34", short: "농협", call: "1644-9000", web: "nhfire.co.kr",     app: "NH손해보험",         efax: "02-3786-7000" },
];

// 보험사별 청구 절차·접수채널·심사기간
const RC_PROCEDURES = {
  default: {
    channels: ["모바일 앱", "팩스 / 이메일", "콜센터 우편 접수", "방문 접수"],
    docs: [
      { id: "receipt",  label: "진료비 영수증",            mandatory: true,  note: "수납 직후 자동 발급" },
      { id: "detail",   label: "진료비 세부산정내역서",      mandatory: true,  note: "20만원 이상 청구 시 필수" },
      { id: "certify",  label: "진단서 또는 진료확인서",     mandatory: false, note: "총 청구액 100만원 이상 시 권장" },
      { id: "chart",    label: "진료기록 사본 / 차트",       mandatory: false, note: "보험사 요청 시 — 동의 후 발급" },
      { id: "rx",       label: "처방전 / 약제 영수증",       mandatory: false, note: "한약·과립제 별도 청구 시" },
      { id: "bankbook", label: "수령 계좌 사본",            mandatory: true,  note: "최초 1회 / 계좌 변경 시" },
      { id: "id",       label: "신분증 사본",              mandatory: true,  note: "최초 1회" },
    ],
    reviewDays: "영업일 3~5일",
    minThreshold: 0,
  },
};

// ── 환자별 실비보험 가입 정보 (가상 시드) ─────────────────────────
// patientId 는 PP_PATIENTS.id 와 매칭
const RC_PATIENT_POLICIES = {
  1: { // 박지영
    enrolled: true,
    insurerId: "samfire",
    generation: "4G",
    productName: "삼성화재 다이렉트 굿앤굿실손 무배당",
    policyNo: "P-2024-1183927",
    enrollDate: "2022-08-14",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: "2026-02-12",
    lastClaimAmount: 184000,
    monthlyPremium: 31800,
    note: "자보 청구 진행 중 → 자보 종결 후 잔여 본인부담분 실비 청구 가능",
  },
  2: { // 홍길동
    enrolled: true,
    insurerId: "hdfire",
    generation: "3G",
    productName: "현대해상 굿앤굿실손의료비보장 (3세대)",
    policyNo: "P-2019-0028471",
    enrollDate: "2019-03-22",
    deductible: 20000,
    coRate: 20,
    accidentCovered: true,
    lastClaim: "2025-11-04",
    lastClaimAmount: 76500,
    monthlyPremium: 27400,
  },
  3: { // 김수진
    enrolled: true,
    insurerId: "kbins",
    generation: "2G",
    productName: "KB손해보험 표준화실손의료비",
    policyNo: "P-2016-9912834",
    enrollDate: "2016-07-01",
    deductible: 10000,
    coRate: 20,
    accidentCovered: false,
    lastClaim: null, lastClaimAmount: 0,
    monthlyPremium: 19200,
    note: "갱년기·한약 처방은 비급여 → 2세대는 한방 비급여 보장 안됨",
  },
  4: { // 송재호
    enrolled: true,
    insurerId: "dbins",
    generation: "4G",
    productName: "DB손해보험 프로미라이프 실손4세대",
    policyNo: "P-2023-4071226",
    enrollDate: "2023-01-09",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: "2026-05-10",
    lastClaimAmount: 218000,
    monthlyPremium: 22700,
    note: "자보 처리 중 — 본인부담분 한해 청구",
  },
  5: { // 이민호
    enrolled: false,
    note: "환자 본인 미가입 — 청구 불가. 가입 안내 권유 가능.",
  },
  6: { // 박지현
    enrolled: true,
    insurerId: "mritz",
    generation: "1G",
    productName: "메리츠화재 알파플러스 (구실손)",
    policyNo: "P-2008-1183927",
    enrollDate: "2008-04-19",
    deductible: 5000,
    coRate: 0,
    accidentCovered: true,
    lastClaim: "2026-04-22",
    lastClaimAmount: 312400,
    monthlyPremium: 58200,
    note: "1세대 — 한방 비급여 (한약·약침 포함) 보장 가능. 추가 비급여 청구 권유 가능.",
  },
  7: { // 정유미
    enrolled: true,
    insurerId: "lina",
    generation: "4G",
    productName: "라이나생명 마이실손 4세대",
    policyNo: "P-2024-7782010",
    enrollDate: "2024-05-30",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: null, lastClaimAmount: 0,
    monthlyPremium: 18900,
  },
  8: { // 오세훈
    enrolled: true,
    insurerId: "samsung",
    generation: "3G",
    productName: "삼성생명 The건강한 통합실손",
    policyNo: "P-2020-3318274",
    enrollDate: "2020-11-12",
    deductible: 20000,
    coRate: 20,
    accidentCovered: true,
    lastClaim: "2026-01-30",
    lastClaimAmount: 91200,
    monthlyPremium: 41200,
  },
  9: { // 한지민
    enrolled: true,
    insurerId: "kyobo",
    generation: "4G",
    productName: "교보생명 라이프플래닛 실손4세대",
    policyNo: "P-2023-9982017",
    enrollDate: "2023-06-21",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: null, lastClaimAmount: 0,
    monthlyPremium: 23100,
  },
  10: { // 장우성
    enrolled: true,
    insurerId: "hwhana",
    generation: "4G",
    productName: "한화생명 LIFEPLUS 실손의료비4세대",
    policyNo: "P-2024-1108273",
    enrollDate: "2024-02-08",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: null, lastClaimAmount: 0,
    monthlyPremium: 21400,
    note: "교통사고 진료 — 자보 청구 우선, 종결 후 본인부담분만 실비 청구",
  },
  11: { // 안세영
    enrolled: true,
    insurerId: "nh",
    generation: "4G",
    productName: "NH농협손해보험 한아름실손4세대",
    policyNo: "P-2024-3327103",
    enrollDate: "2024-08-14",
    deductible: 30000,
    coRate: 30,
    accidentCovered: true,
    lastClaim: "2026-05-12",
    lastClaimAmount: 64200,
    monthlyPremium: 17800,
  },
  12: { // 강민재
    enrolled: false,
    note: "본인 가입 여부 미확인 — 다음 내원 시 확인 권유",
  },
};

// ── 오늘 진료 항목 (환자별 청구 가능 항목 자동 추출) ───────────────
// claimable: 세대별 보장 여부에 따라 백엔드(목업)에서 자동 판정
const RC_TODAY_ITEMS = {
  1: { // 박지영 — 4세대, 자보 진행 중
    visitDate: "2026-05-16", chartNo: "00012483", doctor: "김민준",
    items: [
      { code: "10100", name: "초진진찰료",            amount: 15570,  type: "급여", claimable: true,  reason: "급여 항목 — 본인부담분 청구 가능" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true,  reason: "급여 항목" },
      { code: "40091", name: "침전기자극술",           amount: 4100, type: "급여", claimable: true,  reason: "급여 항목" },
      { code: "40321", name: "부항술(건식부항)-유관법", amount: 5490,  type: "급여", claimable: true,  reason: "급여 항목" },
      { code: "40306", name: "구술(간접구)-간접애주구", amount: 5000,  type: "급여", claimable: true,  reason: "급여 항목" },
      { code: "NB-08", name: "약침술 (자하거)",          amount: 22000, type: "비급여", claimable: false, reason: "4세대 — 한방 비급여 보장 제외" },
      { code: "40710", name: "추나요법-단순추나",       amount: 25850, type: "급여", claimable: true,  reason: "급여 — 본인부담 50% 환급 대상" },
    ],
    totalAmount: 80200,
    copayAmount: 24000,  // 환자 본인부담금
    relatedAccident: { kind: "자보", caseNo: "AC2026-0512-7891", insurer: "현대해상", status: "심사 중", note: "자보 종결 후 본인부담분만 실비 청구" },
  },
  2: { // 홍길동 — 3세대
    visitDate: "2026-05-16", chartNo: "00010012", doctor: "이서연",
    items: [
      { code: "10200", name: "재진진찰료",            amount: 9830,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40312", name: "부항술(자락관법)",        amount: 9650,  type: "급여", claimable: true, reason: "급여 항목" },
    ],
    totalAmount: 23000, copayAmount: 7200,
  },
  4: { // 송재호 — 4세대, 자보
    visitDate: "2026-05-15", chartNo: "00012501", doctor: "김민준",
    items: [
      { code: "10100", name: "초진진찰료",            amount: 15570,  type: "급여", claimable: true, reason: "본인부담분 청구 가능" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40321", name: "부항술(건식부항)-유관법", amount: 5490,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40720", name: "추나요법-복잡추나",       amount: 43640, type: "급여", claimable: true, reason: "도수·추나 — 4세대 특약 보장 (한도 50회/년)" },
      { code: "NB-08", name: "약침술 (봉약침)",          amount: 28000, type: "비급여", claimable: false, reason: "4세대 — 한방 비급여 보장 제외" },
    ],
    totalAmount: 86600, copayAmount: 30100,
    relatedAccident: { kind: "자보", caseNo: "AC2026-0510-3327", insurer: "DB손해보험", status: "심사 중" },
  },
  6: { // 박지현 — 1세대 (구실손, 비급여 포함 보장)
    visitDate: "2026-05-13", chartNo: "00009881", doctor: "이서연",
    items: [
      { code: "10200", name: "재진진찰료",            amount: 9830,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "NB-08", name: "약침술 (봉약침)",          amount: 28000, type: "비급여", claimable: true, reason: "1세대 — 한방 비급여 포함 보장 ✓" },
      { code: "NB-15", name: "한약 (보중익기탕 7일)",   amount: 84000, type: "비급여", claimable: true, reason: "1세대 — 한방 비급여 포함 보장 ✓" },
    ],
    totalAmount: 127800, copayAmount: 22800,
    aiHint: "1세대 구실손은 한방 비급여(약침·한약)까지 보장됩니다. 한약 영수증을 함께 제출하면 환급액이 늘어납니다.",
  },
  8: { // 오세훈
    visitDate: "2026-05-12", chartNo: "00010998", doctor: "김민준",
    items: [
      { code: "10100", name: "초진진찰료",            amount: 15570,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40321", name: "부항술(건식부항)-유관법", amount: 5490,  type: "급여", claimable: true, reason: "급여 항목" },
    ],
    totalAmount: 23600, copayAmount: 7100,
  },
  10: { // 장우성 — 자보 사고
    visitDate: "2026-05-11", chartNo: "00012612", doctor: "이서연",
    items: [
      { code: "10100", name: "초진진찰료",            amount: 15570,  type: "급여", claimable: true, reason: "본인부담분 청구 가능" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40321", name: "부항술(건식부항)-유관법", amount: 5490,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40720", name: "추나요법-복잡추나",       amount: 43640, type: "급여", claimable: true, reason: "도수·추나 특약 보장" },
    ],
    totalAmount: 55600, copayAmount: 18700,
    relatedAccident: { kind: "자보", caseNo: "AC2026-0509-1182", insurer: "삼성화재", status: "심사 중" },
  },
  11: { // 안세영
    visitDate: "2026-05-08", chartNo: "00012345", doctor: "김민준",
    items: [
      { code: "10100", name: "초진진찰료",            amount: 15570,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40011", name: "경혈침술(1부위)",        amount: 4000, type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40321", name: "부항술(건식부항)-유관법", amount: 5490,  type: "급여", claimable: true, reason: "급여 항목" },
      { code: "40710", name: "추나요법-단순추나",       amount: 25850, type: "급여", claimable: true, reason: "추나 특약 보장" },
    ],
    totalAmount: 41600, copayAmount: 14400,
  },
};

// AI 환급액 추정 — 청구 가능 항목 합 × (1 - 자기부담률) - 공제금액
function rcEstimateRefund(policy, claimableTotal) {
  if (!policy || !policy.enrolled) return 0;
  const co = (policy.coRate || 0) / 100;
  const ded = policy.deductible || 0;
  const refund = Math.max(0, Math.round((claimableTotal * (1 - co) - ded) / 100) * 100);
  return refund;
}

// 가입자 보유 환자 ID 목록 (오늘 안내 가능 대상)
const RC_TODAY_ELIGIBLE_IDS = [1, 2, 4, 6, 8, 10, 11];

window.RC_GENERATIONS = RC_GENERATIONS;
window.RC_INSURERS = RC_INSURERS;
window.RC_PROCEDURES = RC_PROCEDURES;
window.RC_PATIENT_POLICIES = RC_PATIENT_POLICIES;
window.RC_TODAY_ITEMS = RC_TODAY_ITEMS;
window.RC_TODAY_ELIGIBLE_IDS = RC_TODAY_ELIGIBLE_IDS;
window.rcEstimateRefund = rcEstimateRefund;
