// KoMES — 약재 재고 샘플 데이터
// herb: 한글명, 학명, 효능 분류, 재고(g), 안전임계치(g), 월간 소비(g),
//       최근 입고일, 유효기간, 단가(원/g), 원산지, 공급처, 위치

const HERBS = [
  { id: "h-001", name: "황기",   latin: "Astragalus membranaceus",   category: "보기", stock:  2400, threshold: 1500, monthly: 1820, lastIn: "2026-05-04", expiry: "2027-08-12", unitPrice:  85, origin: "국산",   supplier: "동방한약", location: "캐비닛 A-3" },
  { id: "h-002", name: "백출",   latin: "Atractylodes macrocephala", category: "보기", stock:   880, threshold: 1200, monthly: 1340, lastIn: "2026-04-18", expiry: "2027-04-18", unitPrice: 120, origin: "국산",   supplier: "동방한약", location: "캐비닛 A-3" },
  { id: "h-003", name: "인삼",   latin: "Panax ginseng",             category: "보기", stock:   620, threshold:  400, monthly:  380, lastIn: "2026-05-10", expiry: "2027-11-10", unitPrice: 980, origin: "국산",   supplier: "금산인삼조합", location: "냉장 R-1" },
  { id: "h-004", name: "감초",   latin: "Glycyrrhiza uralensis",     category: "조화", stock:  3800, threshold: 1800, monthly: 2120, lastIn: "2026-05-02", expiry: "2027-09-02", unitPrice:  62, origin: "중국산", supplier: "신원약업", location: "캐비닛 A-1" },
  { id: "h-005", name: "당귀",   latin: "Angelica gigas",            category: "보혈", stock:  1640, threshold: 1500, monthly: 1480, lastIn: "2026-04-22", expiry: "2027-06-22", unitPrice: 145, origin: "국산",   supplier: "동방한약", location: "캐비닛 B-1" },
  { id: "h-006", name: "천궁",   latin: "Ligusticum chuanxiong",     category: "활혈", stock:  1280, threshold:  900, monthly:  820, lastIn: "2026-04-15", expiry: "2027-04-15", unitPrice:  98, origin: "중국산", supplier: "신원약업", location: "캐비닛 B-2" },
  { id: "h-007", name: "작약",   latin: "Paeonia lactiflora",        category: "보혈", stock:  1920, threshold: 1200, monthly: 1080, lastIn: "2026-05-08", expiry: "2027-10-08", unitPrice: 115, origin: "국산",   supplier: "동방한약", location: "캐비닛 B-1" },
  { id: "h-008", name: "숙지황", latin: "Rehmannia glutinosa",       category: "보혈", stock:  2150, threshold: 1400, monthly: 1320, lastIn: "2026-04-28", expiry: "2027-07-28", unitPrice: 102, origin: "국산",   supplier: "동방한약", location: "캐비닛 B-1" },
  { id: "h-009", name: "복령",   latin: "Poria cocos",               category: "이수", stock:  1840, threshold: 1200, monthly:  980, lastIn: "2026-04-12", expiry: "2027-04-12", unitPrice:  78, origin: "중국산", supplier: "신원약업", location: "캐비닛 C-1" },
  { id: "h-010", name: "복신",   latin: "Poria cocos (with root)",   category: "안신", stock:   420, threshold:  600, monthly:  540, lastIn: "2026-03-30", expiry: "2026-06-15", unitPrice:  92, origin: "중국산", supplier: "신원약업", location: "캐비닛 C-1" },
  { id: "h-011", name: "산조인", latin: "Ziziphus jujuba (seed)",    category: "안신", stock:   780, threshold:  800, monthly:  720, lastIn: "2026-04-05", expiry: "2027-02-05", unitPrice: 165, origin: "중국산", supplier: "광동무역", location: "냉장 R-2" },
  { id: "h-012", name: "용안육", latin: "Dimocarpus longan",         category: "보혈", stock:  1320, threshold:  700, monthly:  640, lastIn: "2026-05-01", expiry: "2026-12-01", unitPrice: 138, origin: "수입",   supplier: "광동무역", location: "냉장 R-2" },
  { id: "h-013", name: "진피",   latin: "Citrus reticulata (peel)",  category: "이기", stock:  2880, threshold: 1000, monthly:  860, lastIn: "2026-04-20", expiry: "2027-04-20", unitPrice:  54, origin: "국산",   supplier: "제주한방", location: "캐비닛 D-2" },
  { id: "h-014", name: "반하",   latin: "Pinellia ternata",          category: "화담", stock:   940, threshold:  600, monthly:  520, lastIn: "2026-04-25", expiry: "2027-04-25", unitPrice: 175, origin: "중국산", supplier: "신원약업", location: "캐비닛 D-1" },
  { id: "h-015", name: "시호",   latin: "Bupleurum chinense",        category: "해표", stock:  1180, threshold:  900, monthly:  780, lastIn: "2026-05-05", expiry: "2027-09-05", unitPrice: 128, origin: "중국산", supplier: "신원약업", location: "캐비닛 E-1" },
  { id: "h-016", name: "길경",   latin: "Platycodon grandiflorus",   category: "화담", stock:  1540, threshold:  800, monthly:  720, lastIn: "2026-04-18", expiry: "2027-04-18", unitPrice:  72, origin: "국산",   supplier: "동방한약", location: "캐비닛 D-1" },
  { id: "h-017", name: "황금",   latin: "Scutellaria baicalensis",   category: "청열", stock:   320, threshold:  700, monthly:  680, lastIn: "2026-03-20", expiry: "2027-03-20", unitPrice: 108, origin: "국산",   supplier: "동방한약", location: "캐비닛 F-1" },
  { id: "h-018", name: "황련",   latin: "Coptis chinensis",          category: "청열", stock:   240, threshold:  300, monthly:  280, lastIn: "2026-03-15", expiry: "2027-03-15", unitPrice: 420, origin: "중국산", supplier: "광동무역", location: "캐비닛 F-1" },
  { id: "h-019", name: "계지",   latin: "Cinnamomum cassia",         category: "해표", stock:  2240, threshold: 1000, monthly:  920, lastIn: "2026-05-06", expiry: "2027-11-06", unitPrice:  64, origin: "수입",   supplier: "광동무역", location: "캐비닛 E-1" },
  { id: "h-020", name: "두충",   latin: "Eucommia ulmoides",         category: "보양", stock:   860, threshold:  700, monthly:  620, lastIn: "2026-04-10", expiry: "2027-04-10", unitPrice: 132, origin: "국산",   supplier: "동방한약", location: "캐비닛 G-1" },
  { id: "h-021", name: "산수유", latin: "Cornus officinalis",        category: "보음", stock:  1080, threshold:  600, monthly:  540, lastIn: "2026-04-27", expiry: "2027-08-27", unitPrice: 155, origin: "국산",   supplier: "제주한방", location: "냉장 R-2" },
  { id: "h-022", name: "구기자", latin: "Lycium chinense",           category: "보혈", stock:  1460, threshold:  800, monthly:  680, lastIn: "2026-05-09", expiry: "2026-08-09", unitPrice:  88, origin: "중국산", supplier: "광동무역", location: "냉장 R-2" },
  { id: "h-023", name: "대추",   latin: "Ziziphus jujuba (fruit)",   category: "보기", stock:  3240, threshold: 1500, monthly: 1240, lastIn: "2026-05-12", expiry: "2027-05-12", unitPrice:  42, origin: "국산",   supplier: "제주한방", location: "캐비닛 A-2" },
  { id: "h-024", name: "백복령", latin: "Poria cocos (white)",       category: "이수", stock:   180, threshold:  500, monthly:  460, lastIn: "2026-03-08", expiry: "2026-07-08", unitPrice: 110, origin: "중국산", supplier: "신원약업", location: "캐비닛 C-1" },
];

// 입고/사용 이력 (선택된 약재 패널용)
const HERB_HISTORY = {
  "h-002": [
    { date: "2026-05-13", type: "사용", qty: -120, note: "귀비탕 처방 8건" },
    { date: "2026-05-10", type: "사용", qty:  -80, note: "사물탕 처방 5건" },
    { date: "2026-04-18", type: "입고", qty: 1200, note: "동방한약 정기 발주" },
    { date: "2026-04-08", type: "사용", qty: -240, note: "주간 처방 합산" },
  ],
  "h-010": [
    { date: "2026-05-14", type: "사용", qty:  -60, note: "안신 처방군" },
    { date: "2026-05-07", type: "조정", qty:  -20, note: "실사 보정" },
    { date: "2026-03-30", type: "입고", qty:  600, note: "신원약업 발주" },
  ],
  "h-017": [
    { date: "2026-05-11", type: "사용", qty: -160, note: "황금탕 처방 4건" },
    { date: "2026-05-02", type: "사용", qty: -120, note: "주간 합산" },
    { date: "2026-03-20", type: "입고", qty:  900, note: "동방한약 정기 발주" },
  ],
  "h-018": [
    { date: "2026-05-09", type: "사용", qty:  -40, note: "황련해독탕" },
    { date: "2026-03-15", type: "입고", qty:  300, note: "광동무역" },
  ],
  "h-024": [
    { date: "2026-05-12", type: "사용", qty:  -80, note: "오령산 처방" },
    { date: "2026-03-08", type: "입고", qty:  600, note: "신원약업" },
  ],
};

// 카테고리 메타 (필터용)
const HERB_CATEGORIES = [
  { key: "all",   label: "전체" },
  { key: "보기",  label: "보기" },
  { key: "보혈",  label: "보혈" },
  { key: "보음",  label: "보음" },
  { key: "보양",  label: "보양" },
  { key: "활혈",  label: "활혈" },
  { key: "안신",  label: "안신" },
  { key: "이수",  label: "이수" },
  { key: "이기",  label: "이기" },
  { key: "화담",  label: "화담" },
  { key: "해표",  label: "해표" },
  { key: "청열",  label: "청열" },
  { key: "조화",  label: "조화" },
];

// 진행 중 발주
const OPEN_PURCHASE_ORDERS = [
  { id: "PO-2605-014", supplier: "동방한약",   itemCount: 6, total: 1240000, status: "발주 완료", expectedDate: "2026-05-19" },
  { id: "PO-2605-015", supplier: "광동무역",   itemCount: 3, total:  680000, status: "승인 대기", expectedDate: "2026-05-22" },
];

// 유틸 — 오늘 기준 만료 D-일수
const TODAY = new Date("2026-05-16");
function daysUntil(dateStr) {
  const d = new Date(dateStr);
  return Math.round((d - TODAY) / (1000 * 60 * 60 * 24));
}

// 유틸 — 약재 상태 판정
function herbStatus(h) {
  const stockRatio = h.stock / h.threshold;
  const dExpiry = daysUntil(h.expiry);
  if (h.stock <= h.threshold * 0.5)         return { key: "critical", label: "소진 임박", tone: "danger"  };
  if (h.stock <  h.threshold)               return { key: "low",      label: "재고 부족", tone: "warning" };
  if (dExpiry <= 90)                        return { key: "expiring", label: "유효기간 임박", tone: "warning" };
  return                                            { key: "ok",      label: "정상",     tone: "success" };
}

// 유틸 — 추정 소진일
function projectedRunOutDays(h) {
  const daily = h.monthly / 30;
  if (daily <= 0) return 999;
  return Math.round(h.stock / daily);
}

// 유틸 — 표시용 통화 포맷
function won(n) {
  return "₩" + n.toLocaleString("ko-KR");
}

// 유틸 — g/kg 자동 표시
function fmtMass(g) {
  if (g >= 1000) return (g / 1000).toFixed(g % 1000 === 0 ? 0 : 2) + " kg";
  return g.toLocaleString("ko-KR") + " g";
}

Object.assign(window, {
  HERBS, HERB_HISTORY, HERB_CATEGORIES, OPEN_PURCHASE_ORDERS,
  daysUntil, herbStatus, projectedRunOutDays, won, fmtMass,
});
