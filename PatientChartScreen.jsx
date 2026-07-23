// KoMES — Patient Chart Screen (재설계: 단일 페이지, 전체 이력)
const { useState: useStateChart, useRef: useRefChart, useEffect: useEffectChart } = React;

// ── Sample data ─────────────────────────────────────────────────
const HISTORY = [
  {
    id: "v11", date: "2026-04-22", doctor: "김민준", visitType: "재진", isToday: true,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "S43.4", name: "어깨관절의 염좌 및 긴장", primary: false },
    ],
    soap: {
      s: "두통 지속, 전보다 빈도 줄었으나 어지러움 여전함. 수면은 조금 개선됨.",
      o: "혈압 116/74 · 맥박 70 · 체온 36.4°C\n망진: 안색 호전, 설태 박백\n문진: 납량 호전",
      a: "기허혈허(氣虛血虛) 호전 중. 수면장애 잔존.",
      p: "귀비탕 가감 유지, 2주 연장. 산조인 증량.",
    },
    actingOrders: [
      { type: "경혈침술",     sites: "백회, 풍지, 족삼리", count: 15, duration: 20, done: true },
      { type: "간접구",       sites: "관원, 신궐",         count: 3,  duration: 10, done: false },
    ],
    rxOrders: [
      { name: "귀비탕 가감", herbs: "황기 10g, 백출 8g, 복신 10g, 산조인 15g, 용안육 8g, 감초 6g", days: 14, status: "조제 중" },
    ],
    aiNote: "두통+불면 호전 패턴. 산조인 증량 적합도 91%",
  },
  {
    id: "v10", date: "2026-04-18", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "S43.4", name: "어깨관절의 염좌 및 긴장", primary: false },
    ],
    soap: {
      s: "두통 주 1회로 감소. 경항부 강직은 아침에 남아 있음. 수면 6시간 유지.",
      o: "혈압 118/72 · 맥박 72\n경추 굴곡 40° / 신전 35° — 가동범위 개선\n견정 압통 (+/3)",
      a: "기허혈허(氣虛血虛) 호전. 경항부 강직 잔존.",
      p: "귀비탕 유지. 경항부 위주 자침 + 유관법 병행.",
    },
    actingOrders: [
      { type: "경혈침술",     sites: "풍지, 견정, 곡지", count: 12, duration: 20, done: true },
      { type: "침전기자극술", sites: "견정 (2Hz)",       count: 2,  duration: 15, done: true },
      { type: "유관법",       sites: "견정, 대추",        count: 4,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v9", date: "2026-04-15", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "F51.0", name: "비기질성 불면증", primary: false },
    ],
    soap: {
      s: "수면 질 개선, 야간 각성 1회로 감소. 어지러움은 간헐적.",
      o: "혈압 120/76 · 맥박 74\n설태 박백, 맥 침세(沈細)",
      a: "심비양허(心脾兩虛) 호전 중.",
      p: "귀비탕 가감 유지. 백회·신문 자침 추가.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "백회, 신문, 삼음교", count: 14, duration: 20, done: true },
      { type: "간접구",   sites: "관원, 신궐",         count: 3,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v8", date: "2026-04-10", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "M54.22", name: "경추통, 경부", primary: false },
    ],
    soap: {
      s: "두통이 지속되며 어지러움이 있다. 수면의 질이 낮고 자주 깬다고 함.",
      o: "혈압 118/76 · 맥박 72 · 체온 36.5°C\n망진: 안색 약간 창백, 설태 박백",
      a: "기허혈허(氣虛血虛) 패턴. 수면장애 동반.",
      p: "귀비탕 가감, 2주 처방. 다음 내원 시 수면 상태 재평가.",
    },
    actingOrders: [
      { type: "경혈침술",     sites: "백회, 풍지, 합곡", count: 12, duration: 20, done: true },
      { type: "침전기자극술", sites: "족삼리 (2Hz)",      count: 2,  duration: 15, done: true },
      { type: "유관법",       sites: "견정, 대추",         count: 4,  duration: 10, done: true },
    ],
    rxOrders: [
      { name: "귀비탕 가감", herbs: "황기 10g, 백출 8g, 복신 10g, 산조인 12g, 용안육 8g, 감초 6g", days: 14, status: "완료" },
    ],
    aiNote: "두통+불면 패턴에서 귀비탕(歸脾湯) 적합도 87%",
  },
  {
    id: "v7", date: "2026-04-06", doctor: "박지훈", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "S43.4", name: "어깨관절의 염좌 및 긴장", primary: false },
    ],
    soap: {
      s: "우측 어깨 결림 동반. 마우스 사용 후 악화된다고 함.",
      o: "견관절 외전 150°에서 통증. 극상근 압통 (++/3)",
      a: "경항부 염좌에 견관절 염좌 동반.",
      p: "견관절 부위 자침 추가. 단순추나 병행 시작.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "견우, 견료, 곡지", count: 12, duration: 20, done: true },
      { type: "단순추나", sites: "경추·견갑 교정",    count: 1,  duration: 15, done: true },
      { type: "유관법",   sites: "견정, 천종",        count: 4,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v6", date: "2026-04-02", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "F51.0", name: "비기질성 불면증", primary: false },
    ],
    soap: {
      s: "야간 각성 2회. 두통은 주 2회로 감소. 피로감 지속.",
      o: "혈압 122/78 · 맥박 76\n망진: 안색 창백, 설담(舌淡)",
      a: "기허혈허(氣虛血虛) 패턴. 수면장애 동반.",
      p: "보기·양혈 위주 자침. 처방 변경 검토.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "족삼리, 삼음교, 백회", count: 14, duration: 20, done: true },
      { type: "간접구",   sites: "관원, 기해",           count: 3,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: "불면 동반 — 귀비탕(歸脾湯) 전환 적합도 84%",
  },
  {
    id: "v5", date: "2026-03-29", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "M54.56", name: "요통, 요추부", primary: false },
    ],
    soap: {
      s: "장시간 착석 후 요부 불편감 추가 호소. 두통은 유지.",
      o: "요추 신전 시 경미한 통증. SLR 음성\n요방형근 압통 (+/3)",
      a: "경항부 염좌 치료 중 요부 근긴장 동반.",
      p: "요부 자침 추가. 경피경근온열 병행.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "신수, 대장수, 위중", count: 12, duration: 20, done: true },
      { type: "유관법",   sites: "요양관, 신수",        count: 4,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v4", date: "2026-03-26", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
    ],
    soap: {
      s: "두통 VAS 4/10으로 감소. 목 돌릴 때 뻐근함 남음.",
      o: "경추 회전 우 55° / 좌 60°\n맥 현세(弦細)",
      a: "간기울결(肝氣鬱結) 완화 중.",
      p: "시호소간탕 가감 2주 연장. 주 2회 통원 유지.",
    },
    actingOrders: [
      { type: "경혈침술",     sites: "풍지, 천주, 합곡", count: 12, duration: 20, done: true },
      { type: "침전기자극술", sites: "풍지 (2Hz)",       count: 2,  duration: 15, done: true },
    ],
    rxOrders: [
      { name: "시호소간탕 가감", herbs: "시호 8g, 백작약 10g, 지실 6g, 진피 6g, 향부자 8g, 천궁 6g, 감초 4g", days: 14, status: "완료" },
    ],
    aiNote: null,
  },
  {
    id: "v3", date: "2026-03-22", doctor: "박지훈", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "M54.22", name: "경추통, 경부", primary: false },
    ],
    soap: {
      s: "업무 스트레스 증가로 두통 빈도 유지. 견갑 부위 결림 호소.",
      o: "견갑거근·상부승모근 압통 (++/3)\n혈압 124/80",
      a: "간기울결(肝氣鬱結) 지속. 근막통 동반.",
      p: "상부승모근 위주 자침 + 부항. 스트레칭 교육.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "견정, 견외수, 곡지", count: 12, duration: 20, done: true },
      { type: "유관법",   sites: "견정, 대추, 천종",   count: 5,  duration: 10, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v2", date: "2026-03-19", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
    ],
    soap: {
      s: "초진 후 첫 재진. 두통 VAS 5/10. 약 복용 후 속쓰림 없음.",
      o: "혈압 120/78 · 맥박 76\n경추 압통 (+/3)",
      a: "간기울결(肝氣鬱結).",
      p: "시호소간탕 유지. 주 2회 통원.",
    },
    actingOrders: [
      { type: "경혈침술", sites: "태충, 합곡, 풍지", count: 10, duration: 20, done: true },
    ],
    rxOrders: [],
    aiNote: null,
  },
  {
    id: "v1", date: "2026-03-15", doctor: "김민준", visitType: "초진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
    ],
    soap: {
      s: "두통 초진. 업무 스트레스 많다고 함. 두통 주 3회, VAS 6/10.",
      o: "혈압 122/80 · 맥박 78\n망진: 안면홍조, 설홍 설태 박황",
      a: "간기울결(肝氣鬱結) 의심.",
      p: "시호소간탕, 1주 처방. 추적 관찰.",
    },
    actingOrders: [
      { type: "경혈침술",     sites: "태충, 합곡, 내관", count: 10, duration: 20, done: true },
      { type: "단순추나",     sites: "경추 교정",         count: 1,  duration: 15, done: true },
    ],
    rxOrders: [
      { name: "시호소간탕", herbs: "시호 8g, 백작약 10g, 지실 6g, 진피 6g, 향부자 8g, 감초 4g", days: 7, status: "완료" },
    ],
    aiNote: null,
  },
];

// 오늘 진료(중앙 칼럼) / 과거 기록(좌측 칼럼) 분리 — 최신순
const TODAY_VISIT = HISTORY.find(v => v.isToday) || null;
const PAST_VISITS = HISTORY.filter(v => !v.isToday);

// 「한방 수가리스트(2025.11.1. 시행)」 산정명칭 기준 약칭
const ACTING_TYPES = [
  { key: "경혈침술",     icon: "zap",        color: "var(--accent-pine)" },
  { key: "침전기자극술", icon: "activity",   color: "var(--jade-400)" },
  { key: "전자침술",     icon: "activity",   color: "var(--jade-400)" },
  { key: "약침술",       icon: "syringe",    color: "var(--brand)" },
  { key: "간접구",       icon: "flame",      color: "var(--amber-500)" },
  { key: "유관법",       icon: "circle-dot", color: "var(--cinnabar-600)" },
  { key: "자락관법",     icon: "droplets",   color: "var(--cinnabar-500)" },
  { key: "단순추나",     icon: "hand",       color: "var(--ink-300)" },
  { key: "레이저침술",   icon: "scan-line",  color: "var(--ink-400)" },
];

// ── Section Header ───────────────────────────────────────────────
function ChartSectionHeader({ icon, title, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={15} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>{children}</div>
    </div>
  );
}

// ── Acting Order Block ───────────────────────────────────────────
function ActingOrderBlock({ orders, editable }) {
  const [items, setItems] = useStateChart(orders);
  const [adding, setAdding] = useStateChart(false);
  const [newType, setNewType] = useStateChart("경혈침술");
  const [newSites, setNewSites] = useStateChart("");

  const toggleDone = (i) => {
    if (!editable) return;
    setItems(prev => prev.map((o, idx) => idx === i ? { ...o, done: !o.done } : o));
  };

  const addItem = () => {
    if (!newSites.trim()) return;
    setItems(prev => [...prev, { type: newType, sites: newSites, count: 10, duration: 20, done: false }]);
    setNewSites(""); setAdding(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((o, i) => {
        const typeInfo = ACTING_TYPES.find(t => t.key === o.type) || ACTING_TYPES[0];
        return (
          <div key={i} onClick={() => toggleDone(i)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: "var(--radius-md)",
            background: o.done ? "var(--bg-raised)" : "var(--bg-surface)",
            border: `1px solid ${o.done ? "var(--border-subtle)" : "var(--border-default)"}`,
            cursor: editable ? "pointer" : "default",
            transition: "all 0.12s",
          }}>
            <div style={{ width: 18, height: 18, borderRadius: "var(--radius-sm)", border: `2px solid ${o.done ? "var(--jade-400)" : "var(--border-default)"}`, background: o.done ? "var(--jade-400)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s" }}>
              {o.done && <Icon name="check" size={11} style={{ color: "var(--text-on-brand)" }} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: typeInfo.color, background: `${typeInfo.color}28`, padding: "2px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", flexShrink: 0 }}>{o.type}</span>
            <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1, textDecoration: o.done ? "line-through" : "none" }}>{o.sites}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{o.count}침 · {o.duration}분</span>
          </div>
        );
      })}

      {editable && !adding && (
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.12s" }}>
          <Icon name="plus" size={13} /> 액팅 오더 추가
        </button>
      )}
      {editable && adding && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-brand)", background: "var(--brand-subtle)" }}>
          <select value={newType} onChange={e => setNewType(e.target.value)} style={{ fontSize: 12, fontFamily: "var(--font-sans)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "4px 6px", background: "var(--bg-surface)", color: "var(--text-primary)" }}>
            {ACTING_TYPES.map(t => <option key={t.key}>{t.key}</option>)}
          </select>
          <input value={newSites} onChange={e => setNewSites(e.target.value)} placeholder="부위 입력..." style={{ flex: 1, fontSize: 13, fontFamily: "var(--font-sans)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "5px 8px", outline: "none" }} />
          <button onClick={addItem} style={{ fontSize: 12, color: "var(--text-on-brand)", background: "var(--jade-500)", border: "none", borderRadius: "var(--radius-sm)", padding: "5px 10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>추가</button>
          <button onClick={() => setAdding(false)} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>취소</button>
        </div>
      )}
    </div>
  );
}

// ── SOAP Block ───────────────────────────────────────────────────
function SoapBlock({ data, editable, mode = "soap" }) {
  const [vals, setVals] = useStateChart(data);
  const fields = [
    { key: "s", label: "S 주소증",        rows: 2 },
    { key: "o", label: "O 객관적 소견",    rows: 3 },
    { key: "a", label: "A 진단",           rows: 2 },
    { key: "p", label: "P 치료 계획",      rows: 2 },
  ];

  if (mode === "plain") {
    // 읽기 전용 plain — 라벨 prefix 붙여서 한 흐름으로 표시
    return (
      <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.8, fontFamily: "var(--font-sans)", whiteSpace: "pre-line" }}>
        {fields.map((f, i) => (
          <span key={f.key}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginRight: 6, fontFamily: "var(--font-sans)" }}>
              [{f.label.split(" ")[0]}]
            </span>
            {vals[f.key]}
            {i < fields.length - 1 ? "\n" : ""}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {fields.map(f => (
        <div key={f.key}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--font-sans)" }}>{f.label}</div>
          {editable ? (
            <textarea value={vals[f.key]} onChange={e => setVals(prev => ({ ...prev, [f.key]: e.target.value }))}
              rows={f.rows} style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "7px 10px", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, fontFamily: "var(--font-sans)", whiteSpace: "pre-line" }}>{vals[f.key]}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Rx Order Block ───────────────────────────────────────────────
function RxOrderBlock({ orders, onPrescribe }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {orders.map((rx, i) => (
        <div key={i} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{rx.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{rx.days}일분</span>
              <Badge variant={rx.status === "완료" ? "success" : rx.status === "조제 중" ? "brand" : "neutral"}>{rx.status}</Badge>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{rx.herbs}</div>
        </div>
      ))}
      {onPrescribe && (
        <button onClick={onPrescribe} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <Icon name="plus" size={13} />처방 오더 추가
        </button>
      )}
    </div>
  );
}

// ── Patient Memo Card ────────────────────────────────────────────
function PatientMemoCard({ storageKey, initial = "" }) {
  const [memo, setMemo] = useStateChart(() => {
    try { return localStorage.getItem(storageKey) ?? initial; } catch { return initial; }
  });
  const [editing, setEditing] = useStateChart(false);
  const [draft, setDraft] = useStateChart(memo);

  useEffectChart(() => {
    try { localStorage.setItem(storageKey, memo); } catch {}
  }, [memo, storageKey]);

  const save = () => { setMemo(draft); setEditing(false); };
  const cancel = () => { setDraft(memo); setEditing(false); };

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 16px", marginBottom: 14,
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: editing || memo ? 8 : 0 }}>
        <Icon name="sticky-note" size={13} style={{ color: "var(--amber-600)" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)", letterSpacing: "0.02em" }}>환자 메모</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>환자 전체에 표시 · 진료 기록과 별개</span>
        {!editing ? (
          <button onClick={() => { setDraft(memo); setEditing(true); }} style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 11, fontWeight: 500, color: "var(--text-secondary)",
            background: "transparent", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)", padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
            <Icon name={memo ? "pencil" : "plus"} size={10} />{memo ? "수정" : "추가"}
          </button>
        ) : (
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button onClick={cancel} style={{
              fontSize: 11, color: "var(--text-muted)",
              background: "transparent", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)", padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>취소</button>
            <button onClick={save} style={{
              fontSize: 11, fontWeight: 600, color: "var(--text-on-brand)",
              background: "var(--jade-500)", border: "none",
              borderRadius: "var(--radius-sm)", padding: "2px 10px", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>저장</button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea value={draft} onChange={e => setDraft(e.target.value)} autoFocus
          rows={3}
          placeholder="예: 페니실린 알러지, 임신 14주차, 보호자 연락처 등"
          style={{
            width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
            background: "var(--bg-raised)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", padding: "7px 10px", outline: "none",
            resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
          }} />
      ) : memo ? (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {memo}
        </div>
      ) : null}
    </div>
  );
}

// ── 과거 진료기록 카드 (좌측 칼럼 — 읽기 전용) ──────────────────
// 상병 + SOAP는 기본 펼침, 액팅·처방 오더만 기본 접힘.
function ChartPastVisitCard({ visit }) {
  const [open, setOpen] = useStateChart(true);
  const [ordersOpen, setOrdersOpen] = useStateChart(false);

  const chip = (text, brand) => ({
    fontSize: 9, color: brand ? "var(--text-brand)" : "var(--text-muted)",
    background: brand ? "var(--brand-subtle)" : "var(--bg-raised)",
    border: `1px solid ${brand ? "var(--brand-muted)" : "var(--border-subtle)"}`,
    borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
    padding: "1px 6px", fontFamily: "var(--font-sans)",
  });

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)", marginBottom: 8, overflow: "hidden",
      boxShadow: open ? "var(--shadow-sm)" : "none", transition: "box-shadow 0.12s",
    }}>
      {/* 헤더 */}
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", cursor: "pointer", userSelect: "none" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-default)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{visit.date}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-sans)",
          color: visit.visitType === "초진" ? "var(--status-danger-text)" : "var(--text-muted)",
          background: visit.visitType === "초진" ? "var(--status-danger-bg)" : "var(--bg-raised)",
        }}>{visit.visitType}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{visit.doctor}</span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      </div>

      {/* 접힌 상태 — 진단 한 줄 + 오더 요약 */}
      {!open && (
        <div style={{ padding: "0 10px 9px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {visit.soap.a}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {visit.actingOrders.map((o, i) => <span key={`a${i}`} style={chip(o.type)}>{o.type}</span>)}
            {visit.rxOrders.map((r, i) => <span key={`r${i}`} style={chip(r.name, true)}>{r.name}</span>)}
          </div>
        </div>
      )}

      {/* 펼친 상태 */}
      {open && (
        <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 9 }}>
          {/* 상병 */}
          {visit.diagnoses && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {visit.diagnoses.map((dx, di) => (
                <span key={di} style={chip("", dx.primary)}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, marginRight: 3 }}>{dx.code}</span>{dx.name}
                </span>
              ))}
            </div>
          )}

          {/* SOAP */}
          <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
            <SoapBlock data={visit.soap} editable={false} mode="plain" />
          </div>

          {/* 액팅 · 처방 오더 — 기본 접힘 */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <div onClick={() => setOrdersOpen(!ordersOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
                padding: "5px 8px", cursor: "pointer", userSelect: "none",
                background: "var(--bg-raised)",
                borderBottom: ordersOpen ? "1px solid var(--border-subtle)" : "none",
              }}>
              <Icon name={ordersOpen ? "chevron-down" : "chevron-right"} size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                액팅 · 처방
              </span>
              {/* 접힘 상태 요약 칩 */}
              {!ordersOpen && (
                <>
                  {visit.actingOrders.map((o, i) => <span key={`a${i}`} style={chip(o.type)}>{o.type}</span>)}
                  {visit.rxOrders.map((r, i) => <span key={`r${i}`} style={chip(r.name, true)}>{r.name}</span>)}
                </>
              )}
            </div>

            {ordersOpen && (
              <div style={{ padding: "7px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                {/* 액팅 오더 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {visit.actingOrders.map((o, i) => {
                    const typeInfo = ACTING_TYPES.find(t => t.key === o.type) || ACTING_TYPES[0];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 7px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: typeInfo.color, background: `${typeInfo.color}28`, padding: "1px 5px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", flexShrink: 0 }}>{o.type}</span>
                        <span style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.sites}</span>
                        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{o.duration}분</span>
                        {o.done && <Icon name="check-circle-2" size={11} style={{ color: "var(--jade-500)", flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>

                {/* 처방 오더 */}
                {visit.rxOrders.map((rx, i) => (
                  <div key={i} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>{rx.name}</span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{rx.days}일분</span>
                      <Badge variant={rx.status === "완료" ? "success" : "brand"}>{rx.status}</Badge>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>{rx.herbs}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 오늘 진료 기록 카드 (중앙 칼럼 — 편집 + AI 자동완성) ──────────
function ChartTodayCard({ visit }) {
  const [mode, setMode] = useStateChart("soap"); // "soap" | "plain"

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--brand-muted)",
      borderRadius: "var(--radius-lg)", padding: "14px 18px", boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="pencil-line" size={14} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
          오늘 · {visit.date}
        </span>
        <Badge variant="brand">진료 중</Badge>
        <Badge variant={visit.visitType === "초진" ? "danger" : "neutral"}>{visit.visitType}</Badge>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>담당: {visit.doctor}</span>
        <div style={{ marginLeft: "auto", display: "inline-flex", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: 1, gap: 1 }}>
          {[{ k: "soap", l: "SOAP", icon: "layout-grid" }, { k: "plain", l: "Plain", icon: "align-left" }].map(opt => (
            <button key={opt.k} onClick={() => setMode(opt.k)} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: mode === opt.k ? 600 : 400,
              padding: "2px 7px", borderRadius: "var(--radius-xs)", border: "none", cursor: "pointer",
              background: mode === opt.k ? "var(--bg-surface)" : "transparent",
              color: mode === opt.k ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === opt.k ? "var(--shadow-sm)" : "none",
              fontFamily: "var(--font-sans)", transition: "all 0.12s",
            }}>
              <Icon name={opt.icon} size={9} />{opt.l}
            </button>
          ))}
        </div>
      </div>

      <SoapBlockAI data={visit.soap} editable={true} mode={mode} />

      {visit.aiNote && (
        <div style={{ marginTop: 12, padding: "9px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="sparkles" size={13} style={{ color: "var(--jade-600)", marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}><strong>AI 추천</strong> {visit.aiNote}</span>
        </div>
      )}
    </div>
  );
}

// ── Main Chart Screen ────────────────────────────────────────────
function PatientChartScreen({ patient, onBack, onPrescribe, onNavigate }) {
  const scrollRef = useRefChart(null);
  const [instructionOpen, setInstructionOpen] = useStateChart(false);
  const [prescriptionOpen, setPrescriptionOpen] = useStateChart(false);
  const [pastOpen, setPastOpen] = useStateChart(true); // 좌측 과거 기록 칼럼

  if (!patient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
        <TopBar title="진료 차트" subtitle="환자를 선택하세요" actions={<Button variant="secondary" size="sm" icon="arrow-left" onClick={onBack}>진료 현황</Button>} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
          <Icon name="file-heart" size={36} style={{ color: "var(--text-muted)" }} />
          <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>진료 현황에서 환자를 선택하거나 검색하세요.</div>
          <Button variant="primary" icon="layout-dashboard" onClick={onBack}>진료 현황으로</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title={`${patient.name} 차트`}
        subtitle={`${patient.gender} · ${patient.age}세 · ${patient.dob} · ${patient.phone}`}
        actions={<>
          <Button variant="secondary" size="sm" icon="arrow-left" onClick={onBack}>목록</Button>
          <Button variant="primary" icon="file-plus" onClick={() => setPrescriptionOpen(true)}>신규 처방</Button>
        </>}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT: 과거 진료기록 ── */}
        {pastOpen ? (
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-page)", overflow: "hidden" }}>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "14px 14px 10px" }}>
              <Icon name="history" size={13} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                과거 진료기록
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "0 6px" }}>
                {PAST_VISITS.length}회
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setPastOpen(false)} title="과거 기록 접기" style={{ display: "inline-flex", alignItems: "center", padding: 3, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <Icon name="chevrons-left" size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 20px" }}>
              {PAST_VISITS.map((visit) => (
                <ChartPastVisitCard key={visit.id} visit={visit} />
              ))}
              {!PAST_VISITS.length && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", textAlign: "center", padding: "20px 0", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                  이전 진료 기록이 없습니다 (초진)
                </div>
              )}
            </div>
          </div>
        ) : (
          <div onClick={() => setPastOpen(true)} title="과거 기록 펼치기" style={{
            width: 34, flexShrink: 0, borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 14,
          }}>
            <Icon name="chevrons-right" size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ writingMode: "vertical-rl", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              과거 진료기록 {PAST_VISITS.length}회
            </span>
          </div>
        )}

        {/* ── CENTER: 오늘 작성 ── */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", borderRight: "1px solid var(--border-subtle)", minWidth: 0 }}>

          {/* Patient summary strip */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "12px 18px", marginBottom: 20, boxShadow: "var(--shadow-sm)", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={patient.name} size={36} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-serif)", lineHeight: 1.2 }}>{patient.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{patient.gender} · {patient.age}세 · {patient.dob}</div>
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "var(--border-subtle)" }} />
            {[
              { label: "총 내원", value: `${HISTORY.length}회` },
              { label: "주소증", value: patient.chief },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-sans)", marginBottom: 1 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{item.value}</div>
              </div>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <div style={{ padding: "5px 10px", background: "var(--status-warning-bg)", border: "1px solid var(--status-warning-border)", borderRadius: "var(--radius-md)", display: "flex", gap: 5, alignItems: "center" }}>
                <Icon name="alert-triangle" size={11} style={{ color: "var(--status-warning-text)" }} />
                <span style={{ fontSize: 11, color: "var(--status-warning-text)", fontFamily: "var(--font-sans)" }}>감초+감수 주의</span>
              </div>
            </div>
          </div>

          {/* Patient memo (특이사항 / 임상 메모) */}
          <PatientMemoCard storageKey={`komes_memo_${patient.id}`} initial={patient.id === 1 ? "감초+감수 배합 주의. 두통 호소 시 풍지·합곡 우선. 보호자 연락처 010-1234-9999 (배우자)." : ""} />

          {/* 자보 경과 배너 (자보 환자만) */}
          {patient.insurance === "자보" && <AutoInsuranceBar injuryDate={patient.injuryDate} />}

          {/* 상병 */}
          <DiagnosisSection initialDx={[
            { code: "S13.4", kcd: "S134", name: "경추의 염좌 및 긴장", region: "경추", primary: true },
            { code: "M54.22", kcd: "M5422", name: "경추통, 경부", region: "경추", primary: false },
          ]} />

          {/* Section label */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="pencil-line" size={12} style={{ color: "var(--text-muted)" }} />
            오늘 진료 기록 (SOAP)
          </div>

          {/* 오늘 작성 카드 */}
          {TODAY_VISIT && <ChartTodayCard visit={TODAY_VISIT} />}
          <div style={{ height: 48 }} />
        </div>

        {/* ── RIGHT: 오늘 오더 + 환자 정보 ── */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", flexShrink: 0, background: "var(--bg-surface)", overflow: "hidden" }}>

          {/* Today's billing + acting orders (통합 — 실시간 계산) */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ActingOrderBillingPanel
              injuryDate={patient.insurance === "자보" ? patient.injuryDate : null}
              insurance={patient.insurance || "건강보험"}
            />
          </div>

          {/* Quick actions — 하단 고정 */}
          <div style={{ flexShrink: 0, padding: "10px 16px 14px", background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { icon: "file-signature", label: "서식 발급",      onClick: () => onNavigate && onNavigate("forms") },
                { icon: "sparkles",       label: "환자 안내문 작성(AI 보조)", onClick: () => setInstructionOpen(true) },
                { icon: "calendar-plus",  label: "예약 추가",       onClick: () => onNavigate && onNavigate("schedule") },
              ].map(a => (
                <button key={a.label} onClick={a.onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-raised)", cursor: "pointer", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", transition: "all 0.12s" }}>
                  <Icon name={a.icon} size={13} style={{ color: "var(--text-muted)" }} />{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {instructionOpen && (
        <PatientInstructionModal
          patient={patient}
          onClose={() => setInstructionOpen(false)}
        />
      )}

      {prescriptionOpen && (
        <div onClick={() => setPrescriptionOpen(false)} style={{
          position: "fixed", inset: 0, background: "var(--bg-overlay)",
          backdropFilter: "blur(2px)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          fontFamily: "var(--font-sans)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "100%", maxWidth: 1100, height: "100%", maxHeight: "92vh",
            background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-xl)", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <PrescriptionScreen patient={patient} onBack={() => setPrescriptionOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PatientChartScreen });
