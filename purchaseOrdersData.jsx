// KoMES — 발주 이력 샘플 데이터 (약재 + 소모품 통합)
// 상태 라이프사이클: 승인 대기 → 발주 완료 → 부분 입고 → 입고 완료
//                              ↘ 취소        ↘ 반품

const PO_STATUS = {
  draft:    { key: "draft",    label: "임시 저장", tone: "neutral", color: "var(--ink-400)" },
  pending:  { key: "pending",  label: "승인 대기", tone: "warning", color: "var(--amber-600)" },
  sent:     { key: "sent",     label: "발주 완료", tone: "brand",   color: "var(--jade-600)" },
  partial:  { key: "partial",  label: "부분 입고", tone: "brand",   color: "var(--jade-500)" },
  received: { key: "received", label: "입고 완료", tone: "success", color: "var(--text-brand)" },
  cancelled:{ key: "cancelled",label: "취소",     tone: "neutral", color: "var(--ink-400)" },
  returned: { key: "returned", label: "반품",     tone: "danger",  color: "var(--cinnabar-600)" },
};

// 라인 아이템 빌더
const L = (name, qty, unit, unitPrice, kind = "herb") => ({
  name, qty, unit, unitPrice, kind, subtotal: qty * unitPrice,
});

const PURCHASE_ORDERS = [
  // ── 진행 중 ─────────────────────────────────────────────────────
  {
    id: "PO-2605-018", type: "supply",  supplier: "케어웍스",
    date: "2026-05-15", expected: "2026-05-23", received: null,
    status: "sent",     placedBy: "김민준",
    items: [
      L("진료 가운 (일회용)", 200, "매", 920, "supply"),
      L("일회용 진료시트",     6, "롤", 8400, "supply"),
    ],
    note: "월간 정기 발주 — 부족분 보충",
    timeline: [
      { date: "2026-05-15 09:32", who: "김민준", text: "발주서 작성" },
      { date: "2026-05-15 10:14", who: "이수민", text: "원장 승인" },
      { date: "2026-05-15 10:18", who: "시스템", text: "공급처 전송" },
    ],
  },
  {
    id: "PO-2605-017", type: "supply",  supplier: "삼성약품",
    date: "2026-05-14", expected: "2026-05-21", received: null,
    status: "pending",  placedBy: "이수민",
    items: [
      L("소독 알코올 70%",  20, "L",    4200, "supply"),
      L("알코올솜",          15, "박스", 5800, "supply"),
      L("거즈 (멸균)",       20, "팩",   3600, "supply"),
      L("라텍스 장갑 (S)",   10, "박스", 11800, "supply"),
      L("손소독제 500ml",    8, "통",   5400, "supply"),
    ],
    note: "라텍스 장갑(S) 재고 부족 우선 처리 필요",
    timeline: [
      { date: "2026-05-14 16:08", who: "이수민", text: "발주서 작성 — 승인 대기" },
    ],
  },
  {
    id: "PO-2605-016", type: "supply",  supplier: "에코파우치",
    date: "2026-05-13", expected: "2026-05-20", received: null,
    status: "sent",     placedBy: "김민준",
    items: [
      L("한약 파우치 60ml",  4, "박스", 42000, "supply"),
      L("한약 파우치 100ml", 4, "박스", 56000, "supply"),
      L("환제 병 50g",     400, "개",     480, "supply"),
      L("쇼핑백 (대)",       4, "묶음", 18000, "supply"),
    ],
    note: "파우치 100ml 재고 임박",
    timeline: [
      { date: "2026-05-13 11:20", who: "김민준", text: "발주서 작성" },
      { date: "2026-05-13 14:02", who: "김민준", text: "공급처 전송" },
    ],
  },
  {
    id: "PO-2605-015", type: "herb",    supplier: "광동무역",
    date: "2026-05-12", expected: "2026-05-22", received: null,
    status: "pending",  placedBy: "박지원",
    items: [
      L("황련", 300, "g",  420),
      L("산조인", 800, "g", 165),
      L("용안육", 600, "g", 138),
    ],
    note: "AI 추천 — 황련 잔여 26일, 우선 발주",
    timeline: [
      { date: "2026-05-12 17:42", who: "박지원", text: "AI 추천에서 발주서 초안 생성" },
    ],
  },
  {
    id: "PO-2605-014", type: "herb",    supplier: "동방한약",
    date: "2026-05-11", expected: "2026-05-19", received: null,
    status: "sent",     placedBy: "김민준",
    items: [
      L("백출",    1200, "g", 120),
      L("황금",     900, "g", 108),
      L("당귀",    1500, "g", 145),
      L("작약",    1200, "g", 115),
      L("숙지황",  1400, "g", 102),
      L("길경",     800, "g",  72),
    ],
    note: "월간 정기 발주",
    timeline: [
      { date: "2026-05-11 10:18", who: "김민준", text: "발주서 작성" },
      { date: "2026-05-11 11:25", who: "이수민", text: "원장 승인" },
      { date: "2026-05-11 11:30", who: "시스템", text: "공급처 전송" },
    ],
  },

  // ── 입고 완료 (최근) ─────────────────────────────────────────────
  {
    id: "PO-2605-012", type: "herb",    supplier: "동방한약",
    date: "2026-05-04", expected: "2026-05-10", received: "2026-05-10",
    status: "received", placedBy: "김민준",
    items: [
      L("황기", 1500, "g",  85),
      L("대추", 2000, "g",  42),
      L("계지", 1500, "g",  64),
      L("진피", 1500, "g",  54),
    ],
    timeline: [
      { date: "2026-05-04 09:10", who: "김민준", text: "발주" },
      { date: "2026-05-10 13:42", who: "박지원", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2605-009", type: "herb",    supplier: "금산인삼조합",
    date: "2026-05-02", expected: "2026-05-10", received: "2026-05-10",
    status: "received", placedBy: "김민준",
    items: [
      L("인삼", 400, "g", 980),
    ],
    note: "냉장 보관 — 검수 시 향, 색 양호",
    timeline: [
      { date: "2026-05-02 14:05", who: "김민준", text: "발주" },
      { date: "2026-05-10 11:12", who: "이수민", text: "입고 — 냉장 R-1 보관" },
    ],
  },
  {
    id: "PO-2605-007", type: "supply",  supplier: "동방의료기",
    date: "2026-04-30", expected: "2026-05-04", received: "2026-05-04",
    status: "received", placedBy: "이수민",
    items: [
      L("일회용 침 0.20×30mm", 12, "박스", 12000, "supply"),
      L("일회용 침 0.25×40mm", 12, "박스", 12500, "supply"),
    ],
    timeline: [
      { date: "2026-04-30 09:42", who: "이수민", text: "발주" },
      { date: "2026-05-04 10:05", who: "이수민", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2604-022", type: "herb",    supplier: "신원약업",
    date: "2026-04-26", expected: "2026-05-02", received: "2026-05-02",
    status: "received", placedBy: "김민준",
    items: [
      L("감초",  2000, "g",  62),
      L("복령",  1500, "g",  78),
      L("천궁",  1200, "g",  98),
      L("반하",   800, "g", 175),
      L("시호",  1000, "g", 128),
    ],
    timeline: [
      { date: "2026-04-26 10:00", who: "김민준", text: "발주" },
      { date: "2026-05-02 14:30", who: "박지원", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2604-018", type: "supply",  supplier: "삼성약품",
    date: "2026-04-22", expected: "2026-04-28", received: "2026-04-30",
    status: "received", placedBy: "이수민",
    items: [
      L("알코올솜", 30, "박스", 5800, "supply"),
      L("거즈 (멸균)", 40, "팩", 3600, "supply"),
      L("라텍스 장갑 (M)", 8, "박스", 11800, "supply"),
    ],
    note: "예정일 대비 2일 지연 — 공급처 사과 회신",
    timeline: [
      { date: "2026-04-22 11:08", who: "이수민", text: "발주" },
      { date: "2026-04-28 10:00", who: "시스템", text: "공급처 지연 통보" },
      { date: "2026-04-30 14:18", who: "이수민", text: "입고 완료" },
    ],
  },
  {
    id: "PO-2604-015", type: "herb",    supplier: "제주한방",
    date: "2026-04-18", expected: "2026-04-25", received: "2026-04-27",
    status: "received", placedBy: "김민준",
    items: [
      L("산수유", 600,  "g", 155),
      L("구기자", 1000, "g",  88),
      L("진피",   1500, "g",  54),
    ],
    timeline: [
      { date: "2026-04-18 10:30", who: "김민준", text: "발주" },
      { date: "2026-04-27 09:42", who: "박지원", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2604-008", type: "supply",  supplier: "에코파우치",
    date: "2026-04-12", expected: "2026-04-18", received: "2026-04-18",
    status: "received", placedBy: "이수민",
    items: [
      L("한약 파우치 60ml", 6, "박스", 42000, "supply"),
      L("환제 병 50g",    200, "개",     480, "supply"),
    ],
    timeline: [
      { date: "2026-04-12 13:00", who: "이수민", text: "발주" },
      { date: "2026-04-18 11:00", who: "이수민", text: "입고 검수 완료" },
    ],
  },

  // ── 부분 입고 ────────────────────────────────────────────────────
  {
    id: "PO-2604-005", type: "herb",    supplier: "광동무역",
    date: "2026-04-05", expected: "2026-04-12", received: "2026-04-14",
    status: "partial",  placedBy: "김민준",
    items: [
      L("산조인", 800,  "g", 165),
      L("황련",   200,  "g", 420),
      L("용안육", 800,  "g", 138),  // 200g 미입고
    ],
    note: "용안육 200g 결품 — 차회 분할 입고 예정",
    timeline: [
      { date: "2026-04-05 09:40", who: "김민준", text: "발주" },
      { date: "2026-04-14 10:50", who: "박지원", text: "산조인·황련 입고 / 용안육 200g 결품" },
    ],
  },

  // ── 취소 / 반품 ──────────────────────────────────────────────────
  {
    id: "PO-2603-031", type: "herb",    supplier: "신원약업",
    date: "2026-03-22", expected: "2026-03-29", received: null,
    status: "cancelled", placedBy: "이수민",
    items: [
      L("복신", 600, "g", 92),
    ],
    note: "공급처 재고 부족 통보 — 발주 취소 후 광동무역으로 대체",
    timeline: [
      { date: "2026-03-22 14:20", who: "이수민", text: "발주" },
      { date: "2026-03-23 09:08", who: "시스템", text: "공급처 결품 통보" },
      { date: "2026-03-23 11:00", who: "이수민", text: "발주 취소" },
    ],
  },
  {
    id: "PO-2603-027", type: "supply",  supplier: "한방약업사",
    date: "2026-03-18", expected: "2026-03-25", received: "2026-03-26",
    status: "returned", placedBy: "김민준",
    items: [
      L("뜸쑥 (간접뜸)", 4, "kg", 28000, "supply"),
    ],
    note: "습기 흔적 발견 — 전량 반품 후 재발주(PO-2604-002)",
    timeline: [
      { date: "2026-03-18 10:00", who: "김민준", text: "발주" },
      { date: "2026-03-26 14:00", who: "박지원", text: "검수 중 습기 발견" },
      { date: "2026-03-27 09:30", who: "김민준", text: "반품 처리 — 공급처 환불 확인" },
    ],
  },

  // ── 이력 (한 달 이전) ──────────────────────────────────────────
  {
    id: "PO-2603-022", type: "herb",    supplier: "동방한약",
    date: "2026-03-14", expected: "2026-03-20", received: "2026-03-20",
    status: "received", placedBy: "김민준",
    items: [
      L("황금", 900, "g", 108),
      L("백출", 1200, "g", 120),
      L("당귀", 1200, "g", 145),
    ],
    timeline: [
      { date: "2026-03-14 10:00", who: "김민준", text: "발주" },
      { date: "2026-03-20 13:50", who: "박지원", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2603-014", type: "supply",  supplier: "케어웍스",
    date: "2026-03-08", expected: "2026-03-15", received: "2026-03-15",
    status: "received", placedBy: "이수민",
    items: [
      L("진료 가운 (일회용)", 300, "매", 920, "supply"),
      L("마스크 KF94", 12, "박스", 18000, "supply"),
    ],
    timeline: [
      { date: "2026-03-08 11:00", who: "이수민", text: "발주" },
      { date: "2026-03-15 10:20", who: "이수민", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2602-019", type: "herb",    supplier: "신원약업",
    date: "2026-02-22", expected: "2026-02-28", received: "2026-02-28",
    status: "received", placedBy: "김민준",
    items: [
      L("백복령", 600, "g", 110),
      L("복령",  1500, "g",  78),
      L("계지",  1500, "g",  64),
    ],
    timeline: [
      { date: "2026-02-22 10:00", who: "김민준", text: "발주" },
      { date: "2026-02-28 14:00", who: "박지원", text: "입고 검수 완료" },
    ],
  },
  {
    id: "PO-2602-009", type: "supply",  supplier: "오피스나라",
    date: "2026-02-10", expected: "2026-02-15", received: "2026-02-15",
    status: "received", placedBy: "이수민",
    items: [
      L("A4 복사용지", 4, "박스", 22000, "supply"),
      L("두루마리 화장지", 6, "박스", 24000, "supply"),
      L("청소세제", 4, "통", 9800, "supply"),
    ],
    timeline: [
      { date: "2026-02-10 11:00", who: "이수민", text: "발주" },
      { date: "2026-02-15 09:40", who: "이수민", text: "입고 완료" },
    ],
  },
];

// 추천 기본 설정 (RecommendationSettingsModal 기본값)
const REC_DEFAULTS = {
  scope: "both",          // both | herb | supply
  daysLeftTrigger: 14,    // 잔여 일수가 이 값 이하일 때 추천
  thresholdMultiplier: 1, // 안전 임계치 × 배수 미만일 때 추천 (1=임계치 그대로)
  targetCoverDays: 60,    // 발주 후 보유 목표 일수
  roundingHerb: 100,      // 약재 수량 라운딩 (g)
  roundingSupply: 1,      // 소모품 수량 라운딩 (단위)
  groupBySupplier: true,  // 공급처별 자동 그룹핑
  minOrderValue: 200000,  // 공급처당 최소 발주 금액 (원)
  autoApprove: false,     // 자동 승인 여부
  autoApproveLimit: 500000, // 자동 승인 가능 최대 금액 (원)
  channels: { dashboard: true, email: true, sms: false },
  excludeCats: [],        // 추천에서 제외할 효능 분류 (약재)
  excludeSupCats: [],     // 추천에서 제외할 소모품 분류
  leadTimeBuffer: 3,      // 공급처 리드타임 추가 여유일
};

// PO 토탈 헬퍼
function poTotal(po) {
  return po.items.reduce((s, i) => s + i.subtotal, 0);
}
function poItemCount(po) {
  return po.items.length;
}
function poQtyCount(po) {
  return po.items.reduce((s, i) => s + i.qty, 0);
}

// 평균 리드 타임 계산 (received - date)
function poLeadDays(po) {
  if (!po.received) return null;
  const a = new Date(po.date);
  const b = new Date(po.received);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// 공급처 메타데이터 (담당자 · 연락처 · 평균 리드타임 · 결제 조건 · 최소 발주 금액)
const SUPPLIERS = {
  "동방한약":     { contact: "박지영 차장", phone: "02-3456-7890",  avgLead: 7,  payment: "월말 정산",  minOrder: 200000, note: "정기 발주 거래처" },
  "신원약업":     { contact: "김태호 과장", phone: "02-2345-6789",  avgLead: 7,  payment: "선결제",      minOrder: 100000, note: "" },
  "광동무역":     { contact: "이미라 부장", phone: "02-4567-8901",  avgLead: 10, payment: "후불 30일",   minOrder: 300000, note: "수입 약재 전문" },
  "금산인삼조합": { contact: "정현우 팀장", phone: "041-789-0123",  avgLead: 8,  payment: "선결제",      minOrder: 100000, note: "" },
  "제주한방":     { contact: "강지수 차장", phone: "064-712-3456",  avgLead: 6,  payment: "월말 정산",  minOrder: 100000, note: "" },
  "동방의료기":   { contact: "임철수 과장", phone: "02-5678-9012",  avgLead: 5,  payment: "월말 정산",  minOrder:  50000, note: "" },
  "삼성약품":     { contact: "최영민 부장", phone: "02-6789-0123",  avgLead: 4,  payment: "월말 정산",  minOrder:  50000, note: "" },
  "케어웍스":     { contact: "윤서연 차장", phone: "031-345-6789", avgLead: 5,  payment: "월말 정산",  minOrder: 100000, note: "" },
  "에코파우치":   { contact: "한지훈 과장", phone: "031-456-7890", avgLead: 7,  payment: "후불 30일",   minOrder: 150000, note: "" },
  "한방약업사":   { contact: "조경아 팀장", phone: "031-567-8901", avgLead: 6,  payment: "선결제",      minOrder:  50000, note: "" },
  "한지문화사":   { contact: "오민석 대리", phone: "031-678-9012", avgLead: 5,  payment: "월말 정산",  minOrder:  50000, note: "" },
  "프린텍":       { contact: "신유진 사원", phone: "031-789-0123", avgLead: 3,  payment: "선결제",      minOrder:  30000, note: "" },
  "오피스나라":   { contact: "황현태 대리", phone: "1588-1234",    avgLead: 2,  payment: "월말 정산",  minOrder:  30000, note: "" },
};

// 추천 계산 (RecommendationSettingsModal 프리뷰와 동일 로직)
function computeRecommendations(settings = REC_DEFAULTS) {
  const items = [];

  if (settings.scope === "both" || settings.scope === "herb") {
    HERBS.forEach(h => {
      if (settings.excludeCats?.includes(h.category)) return;
      const daysLeft = projectedRunOutDays(h);
      const belowThreshold = h.stock < h.threshold * settings.thresholdMultiplier;
      if (daysLeft > settings.daysLeftTrigger && !belowThreshold) return;
      const need = (h.monthly / 30) * settings.targetCoverDays - h.stock;
      const round = settings.roundingHerb || 1;
      const qty = Math.max(h.threshold, Math.ceil(need / round) * round);
      const thresholdGap = Math.round((h.threshold - h.stock) / h.threshold * 100);
      items.push({
        kind: "herb", id: h.id, name: h.name, supplier: h.supplier,
        unit: "g", category: h.category,
        currentStock: h.stock, threshold: h.threshold, monthly: h.monthly,
        daysLeft, qty, unitPrice: h.unitPrice,
        reason: daysLeft <= settings.daysLeftTrigger
          ? `잔여 ${daysLeft}일` : `임계치 ${thresholdGap}% 미달`,
        urgency: daysLeft <= 7 ? "high" : daysLeft <= 14 ? "med" : "low",
      });
    });
  }
  if (settings.scope === "both" || settings.scope === "supply") {
    SUPPLIES.forEach(s => {
      if (settings.excludeSupCats?.includes(s.category)) return;
      const daysLeft = supRunOut(s);
      const belowThreshold = s.stock < s.threshold * settings.thresholdMultiplier;
      if (daysLeft > settings.daysLeftTrigger && !belowThreshold) return;
      const need = (s.monthly / 30) * settings.targetCoverDays - s.stock;
      const round = settings.roundingSupply || 1;
      const qty = Math.max(s.threshold, Math.ceil(need / round) * round);
      const thresholdGap = Math.round((s.threshold - s.stock) / s.threshold * 100);
      items.push({
        kind: "supply", id: s.id, name: s.name, supplier: s.supplier,
        unit: s.unit, category: s.category, pack: s.pack,
        currentStock: s.stock, threshold: s.threshold, monthly: s.monthly,
        daysLeft, qty, unitPrice: s.unitPrice,
        reason: daysLeft <= settings.daysLeftTrigger
          ? `잔여 ${daysLeft}일` : `임계치 ${thresholdGap}% 미달`,
        urgency: daysLeft <= 7 ? "high" : daysLeft <= 14 ? "med" : "low",
      });
    });
  }

  // 공급처별 그룹핑
  const groups = {};
  items.forEach(i => {
    if (!groups[i.supplier]) groups[i.supplier] = { supplier: i.supplier, items: [] };
    groups[i.supplier].items.push(i);
  });

  return Object.values(groups)
    .map(g => ({
      ...g,
      total: g.items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    }))
    .sort((a, b) => {
      // 긴급도 우선, 그 다음 금액 큰 순
      const aUrg = a.items.some(i => i.urgency === "high") ? 0 : 1;
      const bUrg = b.items.some(i => i.urgency === "high") ? 0 : 1;
      if (aUrg !== bUrg) return aUrg - bUrg;
      return b.total - a.total;
    });
}

Object.assign(window, {
  PURCHASE_ORDERS, PO_STATUS, REC_DEFAULTS, SUPPLIERS,
  poTotal, poItemCount, poQtyCount, poLeadDays, computeRecommendations,
});
