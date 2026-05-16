// KoMES — Patient Chart Screen (재설계: 단일 페이지, 전체 이력)
const { useState: useStateChart, useRef: useRefChart, useEffect: useEffectChart } = React;

// ── Sample data ─────────────────────────────────────────────────
const HISTORY = [
  {
    id: "v3", date: "2026-04-22", doctor: "김민준", visitType: "재진", isToday: true,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "S43.4", name: "어긨관절의 염좌", primary: false },
    ],
    soap: {
      s: "두통 지속, 전보다 빈도 줄었으나 어지러움 여전함. 수면은 조금 개선됨.",
      o: "혈압 116/74 · 맥박 70 · 체온 36.4°C\n망진: 안색 호전, 설태 박백\n문진: 납량 호전",
      a: "기허혈허(氣虛血虛) 호전 중. 수면장애 잔존.",
      p: "귀비탕 가감 유지, 2주 연장. 산조인 증량.",
    },
    actingOrders: [
      { type: "체침", sites: "백회, 풍지, 족삼리", count: 15, duration: 20, done: true },
      { type: "뜸",   sites: "관원, 신궐",         count: 3,  duration: 10, done: false },
    ],
    rxOrders: [
      { name: "귀비탕 가감", herbs: "황기 10g, 백출 8g, 복신 10g, 산조인 15g, 용안육 8g, 감초 6g", days: 14, status: "조제 중" },
    ],
    aiNote: "두통+불면 호전 패턴. 산조인 증량 적합도 91%",
  },
  {
    id: "v2", date: "2026-04-10", doctor: "김민준", visitType: "재진", isToday: false,
    diagnoses: [
      { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
      { code: "M54.2", name: "경부통", primary: false },
    ],
    soap: {
      s: "두통이 지속되며 어지러움이 있다. 수면의 질이 낮고 자주 깬다고 함.",
      o: "혈압 118/76 · 맥박 72 · 체온 36.5°C\n망진: 안색 약간 창백, 설태 박백",
      a: "기허혈허(氣虛血虛) 패턴. 수면장애 동반.",
      p: "귀비탕 가감, 2주 처방. 다음 내원 시 수면 상태 재평가.",
    },
    actingOrders: [
      { type: "체침",   sites: "백회, 풍지, 합곡", count: 12, duration: 20, done: true },
      { type: "전침",   sites: "족삼리 (2Hz)",      count: 2,  duration: 15, done: true },
      { type: "부항",   sites: "견정, 대추",         count: 4,  duration: 10, done: true },
    ],
    rxOrders: [
      { name: "귀비탕 가감", herbs: "황기 10g, 백출 8g, 복신 10g, 산조인 12g, 용안육 8g, 감초 6g", days: 14, status: "완료" },
    ],
    aiNote: "두통+불면 패턴에서 귀비탕(歸脾湯) 적합도 87%",
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
      { type: "체침", sites: "태충, 합곡, 내관", count: 10, duration: 20, done: true },
      { type: "추나", sites: "경추 교정",         count: 1,  duration: 15, done: true },
    ],
    rxOrders: [
      { name: "시호소간탕", herbs: "시호 8g, 백작약 10g, 지실 6g, 진피 6g, 향부자 8g, 감초 4g", days: 7, status: "완료" },
    ],
    aiNote: null,
  },
];

const ACTING_TYPES = [
  { key: "체침",   icon: "zap",        color: "#5C8B7E" },
  { key: "전침",   icon: "activity",   color: "#6B9E90" },
  { key: "약침",   icon: "syringe",    color: "#4A7C6F" },
  { key: "뜸",     icon: "flame",      color: "#C4974B" },
  { key: "부항",   icon: "droplets",   color: "#D4756A" },
  { key: "추나",   icon: "hand",       color: "#8A9E9A" },
  { key: "레이저", icon: "scan-line",  color: "#6B7E7B" },
];

// ── Section Header ───────────────────────────────────────────────
function SectionHeader({ icon, title, children }) {
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
  const [newType, setNewType] = useStateChart("체침");
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
              {o.done && <Icon name="check" size={11} style={{ color: "white" }} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: typeInfo.color, background: `${typeInfo.color}28`, padding: "2px 7px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>{o.type}</span>
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
          <select value={newType} onChange={e => setNewType(e.target.value)} style={{ fontSize: 12, fontFamily: "var(--font-sans)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "4px 6px", background: "white", color: "var(--text-primary)" }}>
            {ACTING_TYPES.map(t => <option key={t.key}>{t.key}</option>)}
          </select>
          <input value={newSites} onChange={e => setNewSites(e.target.value)} placeholder="부위 입력..." style={{ flex: 1, fontSize: 13, fontFamily: "var(--font-sans)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "5px 8px", outline: "none" }} />
          <button onClick={addItem} style={{ fontSize: 12, color: "white", background: "var(--jade-500)", border: "none", borderRadius: "var(--radius-sm)", padding: "5px 10px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>추가</button>
          <button onClick={() => setAdding(false)} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>취소</button>
        </div>
      )}
    </div>
  );
}

// ── SOAP Block ───────────────────────────────────────────────────
function SoapBlock({ data, editable }) {
  const [vals, setVals] = useStateChart(data);
  const fields = [
    { key: "s", label: "S 주소증",        rows: 2 },
    { key: "o", label: "O 객관적 소견",    rows: 3 },
    { key: "a", label: "A 진단",           rows: 2 },
    { key: "p", label: "P 치료 계획",      rows: 2 },
  ];
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

// ── Visit Card (history — SOAP + collapsible orders) ─────────────
function VisitCard({ visit }) {
  const [expanded, setExpanded] = useStateChart(true); // 기본 펼침
  const [ordersOpen, setOrdersOpen] = useStateChart(false);

  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* Timeline spine */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0, width: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: visit.isToday ? "var(--jade-500)" : "var(--border-default)", border: `2px solid ${visit.isToday ? "var(--jade-300)" : "var(--border-subtle)"}`, flexShrink: 0, marginTop: 14, zIndex: 1 }} />
        <div style={{ width: 2, flex: 1, background: "var(--border-subtle)", minHeight: 20 }} />
      </div>

      {/* Card */}
      <div style={{ flex: 1, marginBottom: 14 }}>
        {/* Visit header */}
        <div onClick={() => setExpanded(!expanded)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", userSelect: "none" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: visit.isToday ? "var(--text-brand)" : "var(--text-primary)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
            {visit.isToday ? "오늘 · " : ""}{visit.date}
          </span>
          {visit.isToday && <Badge variant="brand">진료 중</Badge>}
          <Badge variant={visit.visitType === "초진" ? "danger" : "neutral"}>{visit.visitType}</Badge>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>담당: {visit.doctor}</span>
          {/* Inline diagnosis summary */}
          {!visit.isToday && (
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "1px 9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
              {visit.soap.a}
            </span>
          )}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} style={{ color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }} />
        </div>

        {/* SOAP block */}
        {expanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "var(--bg-surface)", border: `1px solid ${visit.isToday ? "var(--brand-muted)" : "var(--border-subtle)"}`, borderRadius: "var(--radius-lg)", padding: "14px 18px", boxShadow: visit.isToday ? "var(--shadow-md)" : "var(--shadow-sm)" }}>
              {visit.isToday
                ? <SoapBlockAI data={visit.soap} editable={true} />
                : <SoapBlock data={visit.soap} editable={false} />}
              {visit.aiNote && (
                <div style={{ marginTop: 12, padding: "9px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon name="sparkles" size={13} style={{ color: "var(--jade-600)", marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}><strong>AI 추천</strong> {visit.aiNote}</span>
                </div>
              )}
            </div>

            {/* Past orders — collapsible sub-section */}
            {!visit.isToday && (
              <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <div onClick={() => setOrdersOpen(!ordersOpen)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", cursor: "pointer", borderBottom: ordersOpen ? "1px solid var(--border-subtle)" : "none", flexWrap: "wrap" }}>
                  <Icon name="clipboard-check" size={13} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>상병 · 오더</span>
                  {/* 상병 요약 */}
                  {visit.diagnoses && visit.diagnoses.map((dx, di) => (
                    <span key={di} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, color: dx.primary ? "var(--text-brand)" : "var(--text-secondary)",
                      background: dx.primary ? "var(--brand-subtle)" : "var(--bg-raised)",
                      border: `1px solid ${dx.primary ? "var(--brand-muted)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-full)", padding: "1px 8px", fontFamily: "var(--font-sans)",
                    }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{dx.code}</span>
                      {dx.name}
                    </span>
                  ))}
                  <div style={{ flex: 1 }} />
                  <div style={{ display: "flex", gap: 5 }}>
                    {visit.actingOrders.map((o, i) => (
                      <span key={i} style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", padding: "1px 7px", fontFamily: "var(--font-sans)" }}>{o.type}</span>
                    ))}
                    {visit.rxOrders.map((r, i) => (
                      <span key={i} style={{ fontSize: 10, color: "var(--text-brand)", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-full)", padding: "1px 7px", fontFamily: "var(--font-sans)" }}>{r.name}</span>
                    ))}
                  </div>
                  <Icon name={ordersOpen ? "chevron-up" : "chevron-down"} size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </div>

                {ordersOpen && (
                  <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Acting orders */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>액팅 오더</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {visit.actingOrders.map((o, i) => {
                          const typeInfo = ACTING_TYPES.find(t => t.key === o.type) || ACTING_TYPES[0];
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: o.done ? "var(--bg-raised)" : "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: typeInfo.color, background: `${typeInfo.color}28`, padding: "1px 6px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>{o.type}</span>
                              <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1, textDecoration: o.done ? "line-through" : "none" }}>{o.sites}</span>
                              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{o.count}침 · {o.duration}분</span>
                              {o.done && <Icon name="check-circle-2" size={13} style={{ color: "var(--jade-500)", flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Rx orders */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>처방 오더</div>
                      {visit.rxOrders.map((rx, i) => (
                        <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{rx.name}</span>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{rx.days}일분</span>
                              <Badge variant="success">{rx.status}</Badge>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>{rx.herbs}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Chart Screen ────────────────────────────────────────────
function PatientChartScreen({ patient, onBack, onPrescribe, onNavigate }) {
  const scrollRef = useRefChart(null);
  const [instructionOpen, setInstructionOpen] = useStateChart(false);

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
          <Button variant="primary" icon="file-plus" onClick={onPrescribe}>신규 처방</Button>
        </>}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT: SOAP 이력 타임라인 ── */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", borderRight: "1px solid var(--border-subtle)" }}>

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

          {/* 자보 경과 배너 (자보 환자만) */}
          {patient.insurance === "자보" && <AutoInsuranceBar injuryDate={patient.injuryDate} />}

          {/* 상병 */}
          <DiagnosisSection initialDx={[
            { code: "S13.4", name: "경추의 염좌 및 긴장", region: "경추", primary: true },
            { code: "M54.2", name: "경부통", region: "경추", primary: false },
          ]} />

          {/* Section label */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="git-branch" size={12} style={{ color: "var(--text-muted)" }} />
            진료 기록 (SOAP) — {HISTORY.length}회
          </div>

          {/* Timeline — SOAP only */}
          {HISTORY.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
          <div style={{ height: 48 }} />
        </div>

        {/* ── RIGHT: 오늘 오더 + 환자 정보 ── */}
        <div style={{ width: 300, display: "flex", flexDirection: "column", flexShrink: 0, background: "var(--bg-page)", overflowY: "auto" }}>

          {/* Today's billing + acting orders (통합 — 실시간 계산) */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <ActingOrderBillingPanel
              injuryDate={patient.insurance === "자보" ? patient.injuryDate : null}
              insurance={patient.insurance || "건강보험"}
            />
          </div>

          {/* Next appointment + visit history */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>다음 예약</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--jade-600)", fontFamily: "var(--font-sans)" }}>2026-05-06 (수) 14:00</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 14 }}>재진</div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>내원 이력</div>
            {HISTORY.map((v) => (
              <div key={v.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: v.isToday ? "var(--jade-500)" : "var(--border-default)", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: v.isToday ? "var(--jade-600)" : "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: v.isToday ? 600 : 400 }}>{v.date}</span>
                <Badge variant={v.visitType === "초진" ? "danger" : "neutral"}>{v.visitType}</Badge>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ padding: "14px 16px", background: "var(--bg-surface)", marginTop: 8 }}>
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
    </div>
  );
}

Object.assign(window, { PatientChartScreen });
