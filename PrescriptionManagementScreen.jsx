// KoMES — 처방 관리 (대기열 + 조제 워크플로우)
const { useState: useStateRxM, useMemo: useMemoRxM } = React;

// ── Workflow columns ────────────────────────────────────────────────
const RX_COLUMNS = [
  { key: "received",   label: "접수",     icon: "inbox",          color: "var(--accent-slate)", bg: "var(--board-appt-bg)",  border: "var(--board-appt-border)",  next: "dispensing" },
  { key: "dispensing", label: "조제중",   icon: "flask-conical",  color: "var(--accent-bronze)", bg: "var(--board-wait-bg)",  border: "var(--board-wait-border)",  next: ["pickup", "shipping"] },
  { key: "pickup",     label: "픽업 대기", icon: "shopping-bag",  color: "var(--jade-600)", bg: "var(--board-treat-bg)", border: "var(--board-treat-border)", next: "completed" },
  { key: "shipping",   label: "배송중",   icon: "truck",          color: "var(--accent-marine)", bg: "var(--board-pay-bg)",   border: "var(--board-pay-border)",   next: "completed" },
  { key: "completed",  label: "완료",     icon: "check-circle-2", color: "var(--brand)", bg: "var(--bg-raised)",      border: "var(--border-subtle)",      next: null },
];

// ── Sample prescriptions ────────────────────────────────────────────
const RX_QUEUE = [
  { id: "rx-1", code: "RX-2605-0231", patient: "김지수", gender: "여", age: 34, doctor: "김민준", name: "귀비탕 가감", herbs: [["황기",10],["백출",8],["복신",10],["산조인",12],["용안육",8],["감초",6]], days: 14, status: "received",   priority: "normal", pickup: "visit",   createdAt: "09:12", dispenser: null,    issues: [] },
  { id: "rx-2", code: "RX-2605-0232", patient: "박서연", gender: "여", age: 52, doctor: "이지영", name: "시호소간탕", herbs: [["시호",8],["백작약",10],["지실",6],["진피",6],["향부자",8],["감초",4]], days: 7,  status: "received",   priority: "urgent", pickup: "visit",   createdAt: "09:38", dispenser: null,    issues: ["임산부 확인 필요"] },
  { id: "rx-3", code: "RX-2605-0233", patient: "장우성", gender: "남", age: 42, doctor: "김민준", name: "독활기생탕", herbs: [["독활",6],["상기생",10],["두충",8],["우슬",8],["진교",6],["방풍",6],["세신",3],["당귀",10],["천궁",6],["백작약",8],["숙지황",10],["인삼",6],["복령",8],["감초",4]], days: 21, status: "received",  priority: "normal", pickup: "delivery", createdAt: "10:04", dispenser: null,    issues: ["자보 청구"] },
  { id: "rx-4", code: "RX-2605-0228", patient: "최민호", gender: "남", age: 28, doctor: "박서윤", name: "보중익기탕", herbs: [["황기",15],["인삼",8],["백출",10],["감초",6],["당귀",6],["진피",6],["승마",4],["시호",4]], days: 14, status: "dispensing", priority: "normal", pickup: "visit",   createdAt: "08:42", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-5", code: "RX-2605-0229", patient: "정유진", gender: "여", age: 46, doctor: "김민준", name: "당귀작약산", herbs: [["당귀",10],["백작약",12],["천궁",6],["백출",10],["복령",10],["택사",8]], days: 14, status: "dispensing", priority: "normal", pickup: "delivery", createdAt: "08:55", dispenser: "한약사 이수민", issues: ["백작약 부족 가능"] },
  { id: "rx-6", code: "RX-2605-0224", patient: "이서연", gender: "여", age: 38, doctor: "이지영", name: "팔물탕", herbs: [["인삼",8],["백출",10],["복령",10],["감초",4],["숙지황",10],["당귀",10],["천궁",6],["백작약",10]], days: 7, status: "pickup", priority: "normal", pickup: "visit", createdAt: "어제 16:21", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-7", code: "RX-2605-0225", patient: "오한결", gender: "남", age: 31, doctor: "김민준", name: "소청룡탕", herbs: [["마황",6],["계지",6],["백작약",6],["오미자",4],["반하",6],["세신",3],["건강",4],["감초",4]], days: 5, status: "pickup",     priority: "urgent", pickup: "visit",   createdAt: "어제 17:08", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-8", code: "RX-2605-0220", patient: "한가람", gender: "여", age: 27, doctor: "박서윤", name: "온경탕",   herbs: [["당귀",8],["천궁",6],["백작약",8],["계지",6],["오수유",4],["맥문동",10],["반하",6],["인삼",6],["감초",4],["생강",4],["목단피",6]], days: 14, status: "shipping",  priority: "normal", pickup: "delivery", createdAt: "어제 14:30", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-9", code: "RX-2605-0212", patient: "윤도현", gender: "남", age: 55, doctor: "김민준", name: "육미지황탕", herbs: [["숙지황",16],["산수유",8],["산약",8],["택사",6],["복령",6],["목단피",6]], days: 21, status: "shipping",  priority: "normal", pickup: "delivery", createdAt: "어제 11:47", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-10", code: "RX-2605-0205", patient: "강하늘", gender: "남", age: 41, doctor: "이지영", name: "쌍화탕", herbs: [["백작약",10],["숙지황",6],["황기",6],["당귀",6],["천궁",6],["계지",4],["감초",4],["생강",4],["대추",4]], days: 7, status: "completed", priority: "normal", pickup: "visit", createdAt: "그제 15:12", dispenser: "한약사 이수민", issues: [] },
  { id: "rx-11", code: "RX-2605-0198", patient: "신유나", gender: "여", age: 33, doctor: "김민준", name: "감맥대조탕", herbs: [["감초",10],["부소맥",30],["대추",10]], days: 14, status: "completed", priority: "normal", pickup: "delivery", createdAt: "그제 10:25", dispenser: "한약사 이수민", issues: [] },
];

// resolve next status (dispensing splits by pickup method)
function nextStatusOf(rx) {
  const col = RX_COLUMNS.find(c => c.key === rx.status);
  if (!col || !col.next) return null;
  if (Array.isArray(col.next)) return rx.pickup === "delivery" ? "shipping" : "pickup";
  return col.next;
}

function PrescriptionManagementScreen() {
  const [queue, setQueue]         = useStateRxM(RX_QUEUE);
  const [search, setSearch]       = useStateRxM("");
  const [doctor, setDoctor]       = useStateRxM("all");
  const [pickup, setPickup]       = useStateRxM("all");
  const [urgentOnly, setUrgent]   = useStateRxM(false);
  const [view, setView]           = useStateRxM("kanban"); // kanban | list
  const [selected, setSelected]   = useStateRxM(null);
  const [dragOver, setDragOver]   = useStateRxM(null);

  const doctors = useMemoRxM(() => Array.from(new Set(queue.map(r => r.doctor))), [queue]);

  const rows = useMemoRxM(() => {
    return queue.filter(r => {
      if (doctor !== "all" && r.doctor !== doctor) return false;
      if (pickup !== "all" && r.pickup !== pickup) return false;
      if (urgentOnly && r.priority !== "urgent") return false;
      if (search.trim() && !(`${r.patient}${r.code}${r.name}`.includes(search.trim()))) return false;
      return true;
    });
  }, [queue, search, doctor, pickup, urgentOnly]);

  const advance = (id, toStatus) => {
    const target = toStatus || nextStatusOf(queue.find(r => r.id === id));
    if (!target) return;
    setQueue(prev => prev.map(r => r.id === id ? { ...r, status: target } : r));
    setSelected(prev => prev && prev.id === id ? { ...prev, status: target } : prev);
  };

  const counts = useMemoRxM(() => RX_COLUMNS.reduce((acc, c) => { acc[c.key] = rows.filter(r => r.status === c.key).length; return acc; }, {}), [rows]);
  const todayCount   = queue.filter(r => !String(r.createdAt).startsWith("어제") && !String(r.createdAt).startsWith("그제")).length;
  const urgentCount  = queue.filter(r => r.priority === "urgent" && r.status !== "completed").length;
  const issueCount   = queue.filter(r => r.issues.length > 0 && r.status !== "completed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="처방 관리"
        subtitle={`전체 ${RX_QUEUE.length}건 · 진행 중 ${RX_QUEUE.filter(r => r.status !== "completed").length}건`}
        actions={<>
          <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("처방 목록 내보내는 중…", "처방 목록 엑셀을 내려받았습니다")}>엑셀</Button>
          <Button variant="secondary" size="sm" icon="printer" onClick={() => showToast("처방전 출력 묶음을 생성합니다.")}>출력 묶음</Button>
          <Button variant="primary" size="sm" icon="plus">신규 처방</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* KPI strip */}
          <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <RxKpi icon="inbox"          label="오늘 접수"   value={`${todayCount}건`} hint={`전체 ${RX_QUEUE.length}건`} />
            <RxKpi icon="flask-conical"  label="조제 중"     value={`${counts.dispensing || 0}건`} hint="조제실 처리 중" tone="brand" />
            <RxKpi icon="alert-triangle" label="긴급 처방"   value={`${urgentCount}건`} hint="우선 처리 필요"   tone={urgentCount ? "warning" : "default"} />
            <RxKpi icon="alert-circle"   label="확인 필요"   value={`${issueCount}건`} hint="재고·금기·청구"   tone={issueCount ? "danger" : "default"} />
          </div>

          {/* Filter bar */}
          <div style={{ padding: "14px 24px 10px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
              <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="환자명 / 처방코드 / 처방명"
                style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <RxSelect label="처방의" value={doctor} onChange={setDoctor} options={[{ value: "all", label: "전체" }, ...doctors.map(d => ({ value: d, label: d }))]} />
            <RxSelect label="수령" value={pickup} onChange={setPickup} options={[
              { value: "all", label: "전체" },
              { value: "visit", label: "방문 픽업" },
              { value: "delivery", label: "택배 배송" },
            ]} />

            <button onClick={() => setUrgent(!urgentOnly)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 11px",
              fontSize: 12, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
              border: `1px solid ${urgentOnly ? "var(--status-warning-text)" : "var(--border-default)"}`,
              background: urgentOnly ? "var(--status-warning-bg)" : "var(--bg-surface)",
              color: urgentOnly ? "var(--status-warning-text)" : "var(--text-secondary)",
              borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: urgentOnly ? 600 : 400,
            }}>
              <Icon name="alert-triangle" size={13} /> 긴급만
            </button>

            <div style={{ flex: 1 }} />

            {/* View toggle */}
            <div style={{ display: "flex", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 2 }}>
              {[
                { key: "kanban", icon: "kanban", label: "보드" },
                { key: "list",   icon: "list",   label: "목록" },
              ].map(v => {
                const sel = view === v.key;
                return (
                  <button key={v.key} onClick={() => setView(v.key)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px",
                    fontSize: 11, fontFamily: "var(--font-sans)",
                    background: sel ? "var(--bg-surface)" : "transparent",
                    color: sel ? "var(--text-primary)" : "var(--text-muted)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", fontWeight: sel ? 600 : 400,
                    boxShadow: sel ? "var(--shadow-sm)" : "none",
                  }}>
                    <Icon name={v.icon} size={12} /> {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: "8px 24px 20px", overflow: "auto" }}>
            {view === "kanban"
              ? <RxKanban rows={rows} onSelect={setSelected} selectedId={selected?.id} onAdvance={advance} dragOver={dragOver} setDragOver={setDragOver} />
              : <RxList rows={rows} onSelect={setSelected} selectedId={selected?.id} onAdvance={advance} />}
          </div>
        </div>

      </div>

      {/* Detail modal */}
      {selected && <RxDetailModal rx={selected} onClose={() => setSelected(null)} onAdvance={advance} />}
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────
function RxKpi({ icon, label, value, hint, tone = "default" }) {
  const tones = {
    default: { bg: "var(--bg-surface)", border: "var(--border-subtle)", iconBg: "var(--bg-raised)",       iconFg: "var(--text-secondary)" },
    brand:   { bg: "var(--bg-surface)", border: "var(--border-subtle)", iconBg: "var(--brand-muted)",     iconFg: "var(--text-brand)" },
    warning: { bg: "var(--bg-surface)", border: "var(--border-subtle)", iconBg: "var(--status-warning-bg)", iconFg: "var(--status-warning-text)" },
    danger:  { bg: "var(--bg-surface)", border: "var(--border-subtle)", iconBg: "var(--status-danger-bg)",  iconFg: "var(--status-danger-text)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: "var(--radius-lg)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: t.iconBg, color: t.iconFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: 1, lineHeight: 1.1 }}>{value}</div>
        {hint && <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{hint}</div>}
      </div>
    </div>
  );
}

// ── Filter select ────────────────────────────────────────────────────
function RxSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", padding: "6px 10px", outline: "none", cursor: "pointer",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Kanban view ──────────────────────────────────────────────────────
function RxKanban({ rows, onSelect, selectedId, onAdvance, dragOver, setDragOver }) {
  const handleDrop = (e, colKey) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("rxId");
    if (id) onAdvance(id, colKey);
    setDragOver(null);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${RX_COLUMNS.length}, 1fr)`, gap: 12, height: "100%" }}>
      {RX_COLUMNS.map(col => {
        const colRows = rows.filter(r => r.status === col.key);
        const isOver = dragOver === col.key;
        return (
          <div key={col.key}
            onDragOver={e => { e.preventDefault(); setDragOver(col.key); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              display: "flex", flexDirection: "column",
              background: col.bg,
              border: `1px solid ${isOver ? col.color : col.border}`,
              borderRadius: "var(--radius-lg)", overflow: "hidden", minWidth: 0,
              boxShadow: isOver ? `0 0 0 2px ${col.border}` : "none",
              transition: "box-shadow 0.12s ease, border-color 0.12s ease",
            }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${col.border}` }}>
              <Icon name={col.icon} size={14} style={{ color: "var(--text-secondary)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{col.label}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-surface)", padding: "1px 8px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>{colRows.length}</span>
            </div>
            <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", minHeight: 80 }}>
              {colRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-sans)", padding: "20px 0" }}>
                  {isOver ? "여기에 놓기" : "비어있음"}
                </div>
              ) : colRows.map(rx => (
                <RxCard key={rx.id} rx={rx} onClick={() => onSelect(rx)} selected={selectedId === rx.id} onAdvance={onAdvance} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Kanban card ──────────────────────────────────────────────────────
function RxCard({ rx, onClick, selected, onAdvance }) {
  const [hovered, setHovered] = useStateRxM(false);
  const [dragging, setDragging] = useStateRxM(false);
  const nextStatus = nextStatusOf(rx);
  const nextCol = nextStatus && RX_COLUMNS.find(c => c.key === nextStatus);

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData("rxId", rx.id); e.dataTransfer.effectAllowed = "move"; setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? "var(--brand-subtle)" : "var(--bg-surface)",
        border: `1px solid ${selected ? "var(--brand)" : hovered ? "var(--brand-muted)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)", padding: "9px 11px",
        cursor: dragging ? "grabbing" : "pointer",
        boxShadow: selected ? "0 0 0 2px var(--brand-muted)" : hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "all 0.12s ease", display: "flex", flexDirection: "column", gap: 5,
        opacity: dragging ? 0.45 : 1,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{rx.patient}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rx.gender}·{rx.age}</span>
        <div style={{ flex: 1 }} />
        {rx.priority === "urgent" && <Badge variant="warning">긴급</Badge>}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="leaf" size={11} style={{ color: "var(--text-brand)", flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rx.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>{rx.code}</span>
        <span>·</span>
        <span>{rx.days}일</span>
        <div style={{ flex: 1 }} />
        <Icon name={rx.pickup === "delivery" ? "truck" : "shopping-bag"} size={11} />
        <span>{rx.pickup === "delivery" ? "택배" : "방문"}</span>
      </div>
      {rx.issues.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--status-warning-text)", fontFamily: "var(--font-sans)", marginTop: 2 }}>
          <Icon name="alert-triangle" size={11} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rx.issues[0]}</span>
        </div>
      )}
      {nextCol && hovered && (
        <button
          onClick={e => { e.stopPropagation(); onAdvance(rx.id); }}
          style={{
            marginTop: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: "var(--text-brand)",
            background: "var(--brand-muted)", border: "1px solid var(--brand-muted)",
            borderRadius: "var(--radius-sm)", padding: "4px 9px",
            cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.12s",
          }}>
          {nextCol.label}으로 <Icon name="arrow-right" size={11} />
        </button>
      )}
    </div>
  );
}

// ── List view ────────────────────────────────────────────────────────
function RxList({ rows, onSelect, selectedId }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr style={{ background: "var(--bg-raised)" }}>
            {["처방코드", "환자", "처방명", "처방의", "일수", "수령", "상태", "접수 시각", "메모"].map(h => (
              <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(rx => {
            const col = RX_COLUMNS.find(c => c.key === rx.status);
            const sel = selectedId === rx.id;
            return (
              <tr key={rx.id} onClick={() => onSelect(rx)} style={{
                borderTop: "1px solid var(--border-subtle)", cursor: "pointer",
                background: sel ? "var(--brand-subtle)" : "transparent",
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "var(--bg-raised)"; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {rx.priority === "urgent" && <Icon name="alert-triangle" size={11} style={{ color: "var(--status-warning-text)", marginRight: 5, verticalAlign: "-1px" }} />}
                  {rx.code}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{rx.patient}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rx.gender} · {rx.age}세</div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-primary)" }}>{rx.name}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{rx.doctor}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{rx.days}일</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  <Icon name={rx.pickup === "delivery" ? "truck" : "shopping-bag"} size={11} style={{ marginRight: 4, verticalAlign: "-1px" }} />
                  {rx.pickup === "delivery" ? "택배" : "방문"}
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", padding: "2px 8px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name={col?.icon || "circle"} size={10} /> {col?.label || rx.status}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{rx.createdAt}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: rx.issues.length ? "var(--status-warning-text)" : "var(--text-muted)" }}>
                  {rx.issues[0] || "—"}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>조건에 맞는 처방이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Detail modal ─────────────────────────────────────────────────────
function RxDetailModal({ rx, onClose, onAdvance }) {
  const col = RX_COLUMNS.find(c => c.key === rx.status);
  const nextStatus = nextStatusOf(rx);
  const nextCol = nextStatus && RX_COLUMNS.find(c => c.key === nextStatus);
  const totalWeight = rx.herbs.reduce((s, [, d]) => s + d, 0);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      backdropFilter: "blur(2px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 760, maxHeight: "88vh",
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "flex-start", gap: 14,
          background: "linear-gradient(180deg, var(--brand-subtle) 0%, var(--bg-surface) 100%)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--radius-md)",
            background: "var(--brand-muted)", color: "var(--text-brand)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="flask-conical" size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rx.code}</span>
              {rx.priority === "urgent" && <Badge variant="warning">긴급</Badge>}
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)", letterSpacing: "-0.01em", marginTop: 2 }}>{rx.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
              {rx.patient} · {rx.gender} · {rx.age}세 · 처방 {rx.doctor}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Status banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: col?.bg, border: `1px solid ${col?.border}`, borderRadius: "var(--radius-md)" }}>
            <Icon name={col?.icon || "circle"} size={16} style={{ color: "var(--text-primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{col?.label || rx.status}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              접수 {rx.createdAt}{rx.dispenser ? ` · 조제 ${rx.dispenser}` : ""}
            </span>
          </div>

          {/* Issues */}
          {rx.issues.length > 0 && (
            <div style={{ background: "var(--status-warning-bg)", border: "1px solid var(--status-warning-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon name="alert-triangle" size={14} style={{ color: "var(--status-warning-text)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--status-warning-text)", fontFamily: "var(--font-sans)" }}>확인 필요</span>
              </div>
              {rx.issues.map((i, idx) => (
                <div key={idx} style={{ fontSize: 12, color: "var(--status-warning-text)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>· {i}</div>
              ))}
            </div>
          )}

          {/* Herbs + Meta side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            {/* Herbs */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>약재 구성</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rx.herbs.length}종 · {totalWeight}g / 첩</div>
              </div>
              <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {rx.herbs.map(([name, dose], idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 14px", fontSize: 13, fontFamily: "var(--font-sans)",
                    borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                    background: idx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-raised)",
                  }}>
                    <span style={{ color: "var(--text-primary)" }}>{name}</span>
                    <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{dose}g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>처방 정보</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, fontFamily: "var(--font-sans)", padding: "10px 14px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--bg-raised)" }}>
                <DetailRow label="처방 일수" value={`${rx.days}일`} mono />
                <DetailRow label="총 중량" value={`${totalWeight * rx.days}g`} mono />
                <DetailRow label="수령 방법" value={rx.pickup === "delivery" ? "택배 배송" : "방문 픽업"} icon={rx.pickup === "delivery" ? "truck" : "shopping-bag"} />
                <DetailRow label="처방의" value={rx.doctor} />
                {rx.dispenser && <DetailRow label="조제 담당" value={rx.dispenser} />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, alignItems: "center", background: "var(--bg-raised)" }}>
          <Button variant="ghost" size="md" icon="printer" onClick={() => showToast("처방전을 출력합니다.")}>출력</Button>
          <Button variant="ghost" size="md" icon="copy" onClick={() => showToast("이전 처방을 복사해 재처방을 시작합니다.")}>재처방</Button>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" size="md" onClick={onClose}>닫기</Button>
          {nextCol && (
            <Button variant="primary" size="md" icon="arrow-right" onClick={() => onAdvance && onAdvance(rx.id)}>
              {nextCol.label}으로
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", display: "inline-flex", alignItems: "center", gap: 5 }}>
        {icon && <Icon name={icon} size={12} style={{ color: "var(--text-secondary)" }} />}
        {value}
      </span>
    </div>
  );
}

Object.assign(window, { PrescriptionManagementScreen });
