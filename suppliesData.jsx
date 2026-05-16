// KoMES — 소모품 샘플 데이터 (의료 + 포장재 + 사무/청소)

const SUPPLIES = [
  // 의료
  { id: "s-001", name: "일회용 침 0.20×30mm",   category: "의료",   unit: "박스",   pack: "100개입",  stock:  18, threshold: 12, monthly: 22,   lastIn: "2026-05-04", expiry: "2028-05-04", unitPrice:  12000, supplier: "동방의료기",  location: "창고 A-1", sku: "ND-2030-100" },
  { id: "s-002", name: "일회용 침 0.25×40mm",   category: "의료",   unit: "박스",   pack: "100개입",  stock:  24, threshold: 10, monthly: 14,   lastIn: "2026-05-04", expiry: "2028-05-04", unitPrice:  12500, supplier: "동방의료기",  location: "창고 A-1", sku: "ND-2540-100" },
  { id: "s-003", name: "부항컵 세트",            category: "의료",   unit: "세트",   pack: "12P",      stock:   4, threshold:  5, monthly:  1.0, lastIn: "2026-02-10", expiry: null,         unitPrice:  48000, supplier: "동방의료기",  location: "창고 A-2", sku: "CUP-12P"     },
  { id: "s-004", name: "뜸쑥 (간접뜸)",         category: "의료",   unit: "kg",     pack: "1kg/팩",   stock:   6, threshold:  4, monthly:  3.2, lastIn: "2026-04-22", expiry: "2027-04-22", unitPrice:  28000, supplier: "한방약업사",  location: "창고 B-1", sku: "MX-IDR-1K"   },
  { id: "s-005", name: "뜸 받침대",             category: "의료",   unit: "팩",     pack: "50개입",   stock:  14, threshold:  8, monthly:  6.0, lastIn: "2026-04-28", expiry: null,         unitPrice:   6800, supplier: "한방약업사",  location: "창고 B-1", sku: "MX-PAD-50"   },
  { id: "s-006", name: "소독 알코올 70%",        category: "의료",   unit: "L",      pack: "1L",       stock:  18, threshold: 10, monthly: 14,   lastIn: "2026-05-02", expiry: "2026-08-02", unitPrice:   4200, supplier: "삼성약품",    location: "창고 C-1", sku: "ALC-70-1L"   },
  { id: "s-007", name: "알코올솜",               category: "의료",   unit: "박스",   pack: "200매",    stock:  32, threshold: 15, monthly: 18,   lastIn: "2026-04-30", expiry: "2027-04-30", unitPrice:   5800, supplier: "삼성약품",    location: "창고 C-1", sku: "ALC-SW-200"  },
  { id: "s-008", name: "라텍스 장갑 (M)",       category: "의료",   unit: "박스",   pack: "100매",    stock:   9, threshold:  8, monthly:  6.0, lastIn: "2026-04-10", expiry: "2028-04-10", unitPrice:  11800, supplier: "삼성약품",    location: "창고 A-3", sku: "GLV-LTX-M"   },
  { id: "s-009", name: "라텍스 장갑 (S)",       category: "의료",   unit: "박스",   pack: "100매",    stock:   3, threshold:  6, monthly:  4.5, lastIn: "2026-03-20", expiry: "2028-03-20", unitPrice:  11800, supplier: "삼성약품",    location: "창고 A-3", sku: "GLV-LTX-S"   },
  { id: "s-010", name: "진료 가운 (일회용)",    category: "의료",   unit: "매",     pack: "1매",      stock: 240, threshold: 100, monthly: 80,  lastIn: "2026-05-01", expiry: null,         unitPrice:    920, supplier: "케어웍스",    location: "창고 D-1", sku: "GWN-DSP"     },
  { id: "s-011", name: "일회용 진료시트",       category: "의료",   unit: "롤",     pack: "100매/롤", stock:  12, threshold:  8, monthly:  6.0, lastIn: "2026-05-05", expiry: null,         unitPrice:   8400, supplier: "케어웍스",    location: "창고 D-1", sku: "BED-SHT-R"   },
  { id: "s-012", name: "거즈 (멸균)",           category: "의료",   unit: "팩",     pack: "50매",     stock:  56, threshold: 30, monthly: 22,   lastIn: "2026-04-15", expiry: "2026-07-15", unitPrice:   3600, supplier: "삼성약품",    location: "창고 C-2", sku: "GZ-STR-50"   },

  // 포장재
  { id: "s-013", name: "한약 파우치 60ml",      category: "포장재", unit: "박스",   pack: "1000매",   stock:  14, threshold:  8, monthly: 11,   lastIn: "2026-05-08", expiry: null,         unitPrice:  42000, supplier: "에코파우치",  location: "창고 E-1", sku: "PCH-60-1K"   },
  { id: "s-014", name: "한약 파우치 100ml",     category: "포장재", unit: "박스",   pack: "1000매",   stock:   6, threshold:  6, monthly:  7.0, lastIn: "2026-04-18", expiry: null,         unitPrice:  56000, supplier: "에코파우치",  location: "창고 E-1", sku: "PCH-100-1K"  },
  { id: "s-015", name: "환제 병 50g",           category: "포장재", unit: "개",     pack: "1개",      stock: 480, threshold: 300, monthly: 220, lastIn: "2026-04-25", expiry: null,         unitPrice:    480, supplier: "에코파우치",  location: "창고 E-2", sku: "BTL-PIL-50"  },
  { id: "s-016", name: "라벨 스티커 (처방용)",  category: "포장재", unit: "롤",     pack: "500매/롤", stock:  22, threshold: 10, monthly:  7.5, lastIn: "2026-04-12", expiry: null,         unitPrice:   3200, supplier: "프린텍",      location: "창고 F-1", sku: "LBL-RX-500"  },
  { id: "s-017", name: "약첩 봉투 (한지)",      category: "포장재", unit: "팩",     pack: "100매",    stock:  28, threshold: 15, monthly: 12,   lastIn: "2026-05-03", expiry: null,         unitPrice:   8400, supplier: "한지문화사",  location: "창고 E-3", sku: "ENV-HJ-100"  },
  { id: "s-018", name: "쇼핑백 (대)",           category: "포장재", unit: "묶음",   pack: "100매",    stock:   6, threshold:  4, monthly:  3.0, lastIn: "2026-04-08", expiry: null,         unitPrice:  18000, supplier: "에코파우치",  location: "창고 E-3", sku: "BAG-L-100"   },

  // 사무 / 청소
  { id: "s-019", name: "A4 복사용지",           category: "사무",   unit: "박스",   pack: "5권",      stock:   8, threshold:  4, monthly:  2.5, lastIn: "2026-03-22", expiry: null,         unitPrice:  22000, supplier: "오피스나라",  location: "창고 G-1", sku: "PPR-A4-5"    },
  { id: "s-020", name: "영수증 용지",            category: "사무",   unit: "롤",     pack: "1롤",      stock:  14, threshold:  8, monthly:  6.0, lastIn: "2026-04-26", expiry: null,         unitPrice:   1800, supplier: "오피스나라",  location: "창고 G-1", sku: "PPR-RCT-R"   },
  { id: "s-021", name: "손소독제 500ml",         category: "청소",   unit: "통",     pack: "500ml",    stock:  11, threshold:  8, monthly:  6.4, lastIn: "2026-04-29", expiry: "2026-10-29", unitPrice:   5400, supplier: "삼성약품",    location: "창고 C-1", sku: "SAN-HND-500" },
  { id: "s-022", name: "마스크 KF94",            category: "의료",   unit: "박스",   pack: "50매",     stock:  24, threshold: 12, monthly:  9.0, lastIn: "2026-05-06", expiry: "2027-05-06", unitPrice:  18000, supplier: "케어웍스",    location: "창고 D-2", sku: "MSK-KF94-50" },
  { id: "s-023", name: "청소세제",               category: "청소",   unit: "통",     pack: "4L",       stock:   4, threshold:  3, monthly:  1.6, lastIn: "2026-03-10", expiry: null,         unitPrice:   9800, supplier: "오피스나라",  location: "창고 H-1", sku: "CLN-DET-4L"  },
  { id: "s-024", name: "두루마리 화장지",        category: "청소",   unit: "박스",   pack: "30롤",     stock:  12, threshold:  6, monthly:  4.0, lastIn: "2026-04-18", expiry: null,         unitPrice:  24000, supplier: "오피스나라",  location: "창고 H-1", sku: "TIS-RL-30"   },
];

const SUP_HISTORY = {
  "s-003": [
    { date: "2026-05-12", type: "사용", qty: -1, note: "부항 치료 세트 교체" },
    { date: "2026-02-10", type: "입고", qty:  4, note: "동방의료기 분기 발주" },
  ],
  "s-006": [
    { date: "2026-05-14", type: "사용", qty: -2, note: "치료실 보충" },
    { date: "2026-05-12", type: "사용", qty: -1, note: "주간 소비" },
    { date: "2026-05-02", type: "입고", qty: 12, note: "삼성약품 정기 발주" },
  ],
  "s-009": [
    { date: "2026-05-13", type: "사용", qty: -1, note: "치료실 보충" },
    { date: "2026-04-30", type: "사용", qty: -1, note: "주간 소비" },
    { date: "2026-03-20", type: "입고", qty:  4, note: "삼성약품" },
  ],
  "s-014": [
    { date: "2026-05-14", type: "사용", qty: -1, note: "한약 조제 (대용량 처방)" },
    { date: "2026-05-09", type: "사용", qty: -1, note: "한약 조제" },
    { date: "2026-04-18", type: "입고", qty:  6, note: "에코파우치 정기 발주" },
  ],
  "s-012": [
    { date: "2026-05-11", type: "사용", qty: -6, note: "주간 소비" },
    { date: "2026-04-15", type: "입고", qty: 40, note: "삼성약품 정기 발주" },
  ],
};

const SUP_CATEGORIES = [
  { key: "all",     label: "전체" },
  { key: "의료",    label: "의료" },
  { key: "포장재",  label: "포장재" },
  { key: "사무",    label: "사무" },
  { key: "청소",    label: "청소" },
];

const SUP_OPEN_POS = [
  { id: "PO-2605-016", supplier: "에코파우치",  itemCount: 4, total:  340000, status: "발주 완료", expectedDate: "2026-05-20" },
  { id: "PO-2605-017", supplier: "삼성약품",    itemCount: 5, total:  186000, status: "승인 대기", expectedDate: "2026-05-21" },
  { id: "PO-2605-018", supplier: "케어웍스",    itemCount: 2, total:   92000, status: "발주 완료", expectedDate: "2026-05-23" },
];

// 카테고리 → 컬러 (배지/그리드 인디케이터)
const SUP_CAT_COLOR = {
  "의료":   { bg: "var(--brand-subtle)",     fg: "var(--text-brand)",     border: "var(--brand-muted)" },
  "포장재": { bg: "var(--status-warning-bg)",   fg: "var(--status-warning-text)",    border: "var(--status-warning-border)" },
  "사무":   { bg: "var(--bg-raised)",   fg: "var(--text-secondary)",      border: "var(--border-subtle)" },
  "청소":   { bg: "rgba(96, 130, 175, 0.12)", fg: "#6082AF",      border: "rgba(96, 130, 175, 0.30)" },
};

// 상태 판정
function supStatus(s) {
  const dExpiry = s.expiry ? daysUntil(s.expiry) : null;
  if (s.stock <= s.threshold * 0.5)                  return { key: "critical", label: "소진 임박",      tone: "danger"  };
  if (s.stock <  s.threshold)                        return { key: "low",      label: "재고 부족",      tone: "warning" };
  if (dExpiry !== null && dExpiry <= 90)             return { key: "expiring", label: "유효기간 임박", tone: "warning" };
  return                                                    { key: "ok",      label: "정상",          tone: "success" };
}

function supRunOut(s) {
  if (!s.monthly) return 999;
  return Math.round(s.stock / (s.monthly / 30));
}

function supFmt(qty, unit) {
  const num = Number.isInteger(qty) ? qty.toLocaleString("ko-KR") : qty.toFixed(1);
  return `${num} ${unit}`;
}

Object.assign(window, {
  SUPPLIES, SUP_HISTORY, SUP_CATEGORIES, SUP_OPEN_POS, SUP_CAT_COLOR,
  supStatus, supRunOut, supFmt,
});
