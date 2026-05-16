// KoMES — Patient Dashboard Screen (진료 흐름 보드)
const { useState: useStateDash, useEffect: useEffectDash } = React;

const PATIENTS = [
  { id: 11, name: "한지민", gender: "여", dob: "1991-08-14", age: 34, phone: "010-4455-1100", lastVisit: "2026-04-15", stage: "예약",     chief: "어지러움 (10:30)",   waitMins: 0,  visitType: "재진" },
  { id: 12, name: "장우성", gender: "남", dob: "1983-12-02", age: 42, phone: "010-7711-9922", lastVisit: "—",         stage: "예약",     chief: "허리 통증 (11:00)", waitMins: 0,  visitType: "초진", insurance: "자보", injuryDate: "2026-05-01" },
  { id: 13, name: "송재호", gender: "남", dob: "1976-05-18", age: 49, phone: "010-3322-7755", lastVisit: "2026-04-26", stage: "진료대기", chief: "교통사고 후 경항통", waitMins: 12, visitType: "재진", insurance: "자보", injuryDate: "2026-04-12" },
  { id: 14, name: "안세영", gender: "여", dob: "1995-09-23", age: 30, phone: "010-6677-2244", lastVisit: "2026-03-20", stage: "치료실",   chief: "교통사고 후 요통",   waitMins: 9,  visitType: "재진", insurance: "자보", injuryDate: "2026-03-10" },
  { id: 1,  name: "홍길동", gender: "남", dob: "1985-04-12", age: 40, phone: "010-1234-5678", lastVisit: "2026-04-22", stage: "진료대기", chief: "두통, 어지러움",     waitMins: 18, visitType: "재진", insurance: "자보", injuryDate: "2026-04-04" },
  { id: 2,  name: "김수진", gender: "여", dob: "1972-11-30", age: 52, phone: "010-9876-5432", lastVisit: "2026-04-22", stage: "진료실",   chief: "요통, 피로감",     waitMins: 7,  visitType: "재진" },
  { id: 3,  name: "이민호", gender: "남", dob: "1990-07-22", age: 34, phone: "010-5555-1234", lastVisit: "2026-04-22", stage: "치료대기", chief: "소화불량, 복통",    waitMins: 5,  visitType: "초진" },
  { id: 4,  name: "박지현", gender: "여", dob: "1968-02-14", age: 57, phone: "010-3344-7788", lastVisit: "2026-04-22", stage: "치료실",   chief: "불면증, 심계항진", waitMins: 22, visitType: "재진" },
  { id: 5,  name: "최동욱", gender: "남", dob: "2001-09-05", age: 23, phone: "010-7722-9900", lastVisit: "2026-04-22", stage: "수납대기", chief: "비염, 두통",        waitMins: 3,  visitType: "재진" },
  { id: 6,  name: "정유미", gender: "여", dob: "1995-03-18", age: 30, phone: "010-6611-2233", lastVisit: "2026-04-22", stage: "수납완료", chief: "생리통, 빈혈",      waitMins: 0,  visitType: "초진" },
  { id: 7,  name: "오세훈", gender: "남", dob: "1979-06-20", age: 46, phone: "010-8800-4411", lastVisit: "2026-04-22", stage: "진료대기", chief: "어깨 통증",         waitMins: 31, visitType: "재진" },
  { id: 8,  name: "윤지영", gender: "여", dob: "2000-01-11", age: 26, phone: "010-2200-8833", lastVisit: "2026-04-22", stage: "치료실",   chief: "피부 트러블",       waitMins: 14, visitType: "초진" },
  { id: 9,  name: "강민재", gender: "남", dob: "1988-11-03", age: 37, phone: "010-1122-5566", lastVisit: "2026-04-22", stage: "수납대기", chief: "무릎 통증",         waitMins: 8,  visitType: "재진" },
  { id: 10, name: "임소연", gender: "여", dob: "1993-04-25", age: 33, phone: "010-9911-3344", lastVisit: "2026-04-22", stage: "수납완료", chief: "갱년기 증상",       waitMins: 0,  visitType: "재진" },
];

const STAGES = [
  { key: "예약",     icon: "calendar-clock", color: "#5A6E8A", bg: "rgba(90, 110, 138, 0.12)",  border: "rgba(90, 110, 138, 0.32)",  label: "예약" },
  { key: "진료대기", icon: "clock",         color: "#C4974B", bg: "rgba(196, 151, 75, 0.12)", border: "rgba(196, 151, 75, 0.32)", label: "진료 대기" },
  { key: "진료실",   icon: "stethoscope",   color: "#5C8B7E", bg: "rgba(92, 139, 126, 0.14)", border: "rgba(92, 139, 126, 0.34)", label: "진료 중" },
  { key: "치료대기", icon: "hourglass",     color: "#6B7E7B", bg: "rgba(107, 126, 123, 0.14)", border: "rgba(107, 126, 123, 0.32)", label: "치료 대기" },
  { key: "치료실",   icon: "activity",      color: "#6B9E90", bg: "rgba(107, 158, 144, 0.14)", border: "rgba(107, 158, 144, 0.34)", label: "치료 중" },
  { key: "수납대기", icon: "credit-card",   color: "#9A8E82", bg: "rgba(154, 142, 130, 0.14)", border: "rgba(154, 142, 130, 0.32)", label: "수납 대기" },
  { key: "수납완료", icon: "check-circle-2",color: "#4A7C6F", bg: "rgba(74, 124, 111, 0.16)", border: "rgba(74, 124, 111, 0.36)", label: "수납 완료" },
];

const STAGE_BY_KEY = STAGES.reduce((a, s) => (a[s.key] = s, a), {});

// High-level groupings for the dashboard board.
// Each group bundles its sub-stages and uses a single column color identity.
const GROUPS = [
  { key: "예약", label: "예약", icon: "calendar-clock", color: "#5A6E8A", bg: "var(--board-appt-bg)",  border: "var(--board-appt-border)",  subStages: ["예약"] },
  { key: "대기", label: "대기", icon: "clock",          color: "#B5873E", bg: "var(--board-wait-bg)",  border: "var(--board-wait-border)",  subStages: ["진료대기", "치료대기"] },
  { key: "치료", label: "치료", icon: "activity",       color: "#3A7065", bg: "var(--board-treat-bg)", border: "var(--board-treat-border)", subStages: ["진료실", "치료실"] },
  { key: "수납", label: "수납", icon: "credit-card",    color: "#7A6E60", bg: "var(--board-pay-bg)",   border: "var(--board-pay-border)",   subStages: ["수납대기", "수납완료"] },
];

const NEXT_STAGE = {
  "예약":     "진료대기",
  "진료대기": "진료실",
  "진료실":   "치료대기",
  "치료대기": "치료실",
  "치료실":   "수납대기",
  "수납대기": "수납완료",
};

function WaitChip({ mins, stage }) {
  if (stage === "수납완료") return null;
  const urgent = mins >= 20;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 10, fontFamily: "var(--font-mono)",
      color: urgent ? "var(--status-danger-text)" : "var(--text-muted)",
      background: urgent ? "var(--status-danger-bg)" : "var(--bg-raised)",
      border: `1px solid ${urgent ? "var(--status-danger-border)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px",
    }}>
      <Icon name="clock" size={9} />
      {mins}분
    </span>
  );
}

const SKIP_STAGE = { "예약": "치료대기" };

function PatientCard({ patient, stage, onSelect, onAdvance }) {
  const [hovered, setHovered] = useStateDash(false);
  const [dragging, setDragging] = useStateDash(false);
  const [hoveredBtn, setHoveredBtn] = useStateDash(null);
  const nextStage = NEXT_STAGE[patient.stage];
  const skipStage = SKIP_STAGE[patient.stage] || null;
  const isDone = patient.stage === "수납완료";

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData("patientId", String(patient.id)); e.dataTransfer.effectAllowed = "move"; setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--brand-subtle)" : "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--brand-muted)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        cursor: dragging ? "grabbing" : "pointer",
        transition: "all 0.15s ease",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        opacity: dragging ? 0.45 : (isDone ? 0.7 : 1),
      }}
      onClick={() => onSelect(patient)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={patient.name} size={26} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1.2 }}>{patient.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{patient.gender} · {patient.age}세</div>
          </div>
        </div>
        <WaitChip mins={patient.waitMins} stage={patient.stage} />
      </div>

      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginBottom: 8, lineHeight: 1.4, paddingLeft: 34 }}>
        {patient.chief}
      </div>

      <div style={{ paddingLeft: 34, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
            color: patient.visitType === "초진" ? "var(--cinnabar-600)" : "var(--jade-600)",
            background: patient.visitType === "초진" ? "var(--status-danger-bg)" : "var(--brand-subtle)",
            border: `1px solid ${patient.visitType === "초진" ? "var(--status-danger-border)" : "var(--brand-muted)"}`,
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 7px",
            fontFamily: "var(--font-sans)",
          }}>{patient.visitType}</span>
          {patient.insurance === "자보" && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
              color: "var(--status-warning-text)", background: "var(--status-warning-bg)",
              border: "1px solid var(--status-warning-border)",
              borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 7px",
              fontFamily: "var(--font-sans)",
            }}>자보</span>
          )}
          {isDone && <Icon name="check-circle-2" size={14} style={{ color: "var(--jade-500)", marginLeft: "auto" }} />}
        </div>

        {(nextStage || skipStage) && hovered && (
          <div style={{ display: "flex", gap: 4 }}>
            {nextStage && (
              <button
                onClick={e => { e.stopPropagation(); onAdvance(patient.id, nextStage); }}
                onMouseEnter={() => setHoveredBtn("next")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 500,
                  color: hoveredBtn === "next" ? "#fff" : "var(--text-brand)",
                  background: hoveredBtn === "next" ? "var(--brand)" : "var(--brand-muted)",
                  border: `1px solid ${hoveredBtn === "next" ? "var(--brand)" : "var(--brand-muted)"}`,
                  borderRadius: "var(--radius-sm)", padding: "3px 9px",
                  cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.12s",
                }}
              >{nextStage} →</button>
            )}
            {skipStage && (
              <button
                onClick={e => { e.stopPropagation(); onAdvance(patient.id, skipStage); }}
                onMouseEnter={() => setHoveredBtn("skip")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 500,
                  color: hoveredBtn === "skip" ? "#fff" : "var(--text-brand)",
                  background: hoveredBtn === "skip" ? "var(--brand)" : "var(--brand-muted)",
                  border: `1px solid ${hoveredBtn === "skip" ? "var(--brand)" : "var(--brand-muted)"}`,
                  borderRadius: "var(--radius-sm)", padding: "3px 9px",
                  cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.12s",
                }}
              >{skipStage} →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubStageSection({ stage, patients, onSelect, onAdvance, showDivider, isLast, dragOver, setDragOver, onDrop }) {
  const isOver = dragOver === stage.key;
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
      onDrop={e => { e.preventDefault(); const id = Number(e.dataTransfer.getData("patientId")); if (id) onDrop(id, stage.key); setDragOver(null); }}
      style={{
        flex: isLast ? 1 : undefined,
        background: isOver ? "rgba(0,0,0,0.04)" : "transparent",
        transition: "background 0.12s ease",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 12px 6px",
        borderTop: showDivider ? "1px dashed rgba(0,0,0,0.08)" : "none",
      }}>
        <Icon name={stage.icon} size={11} style={{ color: stage.color }} />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
          color: stage.color, fontFamily: "var(--font-sans)",
          textTransform: "uppercase",
        }}>{stage.label}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: stage.color, opacity: 0.7,
          fontFamily: "var(--font-mono)", marginLeft: "auto",
        }}>{patients.length}</span>
      </div>
      <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {patients.length === 0 && (
          <div style={{
            fontSize: 10, color: stage.color, opacity: isOver ? 0.9 : 0.4,
            textAlign: "center", padding: "8px 0",
            fontFamily: "var(--font-sans)",
            border: `1px dashed ${isOver ? stage.color : "rgba(0,0,0,0.08)"}`,
            borderRadius: "var(--radius-sm)",
            background: isOver ? "rgba(0,0,0,0.03)" : "transparent",
          }}>{isOver ? "여기에 놓기" : "—"}</div>
        )}
        {patients.map(p => (
          <PatientCard key={p.id} patient={p} stage={stage} onSelect={onSelect} onAdvance={onAdvance} />
        ))}
      </div>
    </div>
  );
}

function GroupColumn({ group, patients, onSelect, onAdvance, dragOver, setDragOver, onDrop }) {
  const isOver = group.subStages.includes(dragOver);
  const groupTotal = patients.length;
  return (
    <div
      onDragOver={e => { e.preventDefault(); if (!group.subStages.includes(dragOver)) setDragOver(group.subStages[0]); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
      onDrop={e => { e.preventDefault(); const id = Number(e.dataTransfer.getData("patientId")); if (id) { const target = group.subStages.includes(dragOver) ? dragOver : group.subStages[0]; onDrop(id, target); } setDragOver(null); }}
      style={{
        display: "flex", flexDirection: "column", flex: 1,
        background: group.bg,
        border: `1px solid ${isOver ? group.color : group.border}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: isOver ? `0 0 0 2px ${group.border}` : "none",
        transition: "box-shadow 0.12s ease, border-color 0.12s ease",
      }}>
      {/* Group header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: `1px solid ${group.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={group.icon} size={16} style={{ color: group.color }} />
          <span style={{
            fontSize: 14, fontWeight: 700, color: group.color,
            fontFamily: "var(--font-sans)", letterSpacing: "0.02em",
          }}>{group.label}</span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: group.color, color: "#fff",
          borderRadius: "var(--radius-full)", whiteSpace: "nowrap", minWidth: 22, height: 22,
          padding: "0 7px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)",
        }}>{groupTotal}</span>
      </div>

      {/* Sub-stage sections — last one fills remaining space to capture bottom drops */}
      <div style={{ flex: 1, minHeight: 80, display: "flex", flexDirection: "column" }}>
        {group.subStages.map((stageKey, i) => {
          const stage = STAGE_BY_KEY[stageKey];
          const stagePatients = patients.filter(p => p.stage === stageKey);
          return (
            <SubStageSection
              key={stageKey}
              stage={stage}
              patients={stagePatients}
              onSelect={onSelect}
              onAdvance={onAdvance}
              showDivider={i > 0}
              isLast={i === group.subStages.length - 1}
              dragOver={dragOver}
              setDragOver={setDragOver}
              onDrop={onDrop}
            />
          );
        })}
      </div>
    </div>
  );
}

function PatientListScreen({ onSelectPatient }) {
  const [patients, setPatients] = useStateDash(() => {
    try {
      const saved = localStorage.getItem("komes_dashboard_patients_v3");
      return saved ? JSON.parse(saved) : PATIENTS;
    } catch { return PATIENTS; }
  });

  useEffectDash(() => {
    localStorage.setItem("komes_dashboard_patients_v3", JSON.stringify(patients));
  }, [patients]);

  const [search, setSearch] = useStateDash("");
  const [view, setView] = useStateDash("board"); // "board" | "list"
  const [showNewPatient, setShowNewPatient] = useStateDash(false);
  const [dragOver, setDragOver] = useStateDash(null);

  const advanceStage = (id, newStage) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, stage: newStage, waitMins: 0 } : p));
  };

  const resetPatients = () => setPatients(PATIENTS);

  const filtered = search
    ? patients.filter(p => p.name.includes(search) || p.chief.includes(search))
    : patients;

  const totalActive = patients.filter(p => p.stage !== "수납완료").length;
  const totalDone = patients.filter(p => p.stage === "수납완료").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="오늘의 진료 현황"
        subtitle={`${new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} · 진료 중 ${totalActive}명 · 완료 ${totalDone}명`}
        actions={<>
          <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: "var(--radius-md)", padding: 2, gap: 2 }}>
            {[{ key: "board", icon: "layout-dashboard" }, { key: "list", icon: "list" }].map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{
                display: "flex", alignItems: "center", padding: "5px 10px", borderRadius: "var(--radius-sm)",
                border: "none", cursor: "pointer", transition: "all 0.12s",
                background: view === v.key ? "var(--bg-surface)" : "transparent",
                boxShadow: view === v.key ? "var(--shadow-sm)" : "none",
                color: view === v.key ? "var(--text-primary)" : "var(--text-muted)",
              }}>
                <Icon name={v.icon} size={14} />
              </button>
            ))}
          </div>
          <div style={{ width: 200 }}>
            <Input placeholder="환자 검색..." value={search} onChange={setSearch} icon="search" />
          </div>
          <Button variant="primary" icon="user-plus" onClick={() => setShowNewPatient(true)}>신규 등록</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <LeftRail />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
      {/* Summary bar — grouped totals with sub-stage breakdown */}
      <div style={{
        display: "flex", gap: 0, background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)", padding: "0 24px", overflowX: "auto", flexShrink: 0,
      }}>
        {GROUPS.map((g, i) => {
          const groupCount = patients.filter(p => g.subStages.includes(p.stage)).length;
          return (
            <div key={g.key} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "10px 20px",
              borderRight: i < GROUPS.length - 1 ? "1px solid var(--border-subtle)" : "none",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={g.icon} size={15} style={{ color: g.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: g.color, fontFamily: "var(--font-sans)" }}>{g.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: g.color, fontFamily: "var(--font-mono)" }}>{groupCount}</span>
              </div>
              {g.subStages.length > 1 && (
                <div style={{ display: "flex", gap: 8, paddingLeft: 4, borderLeft: `1px dashed ${g.border}` }}>
                  {g.subStages.map(stageKey => {
                    const stage = STAGE_BY_KEY[stageKey];
                    const c = patients.filter(p => p.stage === stageKey).length;
                    return (
                      <div key={stageKey} style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{stage.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: stage.color, fontFamily: "var(--font-mono)" }}>{c}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <button onClick={resetPatients} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-sans)", padding: "8px 0", flexShrink: 0,
        }}>
          <Icon name="rotate-ccw" size={11} />초기화
        </button>
      </div>

      {/* Board view — 4 group columns (예약 / 대기 / 치료 / 수납) */}
      {view === "board" && (
        <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 14, minWidth: "max-content", height: "100%", alignItems: "stretch" }}>
            {GROUPS.map(group => {
              const groupPatients = filtered.filter(p => group.subStages.includes(p.stage));
              return (
                <div key={group.key} style={{ width: 260, flexShrink: 0, display: "flex" }}>
                  <GroupColumn
                    group={group}
                    patients={groupPatients}
                    onSelect={onSelectPatient}
                    onAdvance={advanceStage}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    onDrop={advanceStage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view — grouped by 예약 / 대기 / 치료 / 수납 with sub-stage tags */}
      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {GROUPS.map(group => {
            const groupPatients = filtered.filter(p => group.subStages.includes(p.stage));
            if (groupPatients.length === 0) return null;
            return (
              <div key={group.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${group.border}` }}>
                  <Icon name={group.icon} size={16} style={{ color: group.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: group.color, fontFamily: "var(--font-sans)", letterSpacing: "0.02em" }}>{group.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: group.color, fontFamily: "var(--font-mono)" }}>{groupPatients.length}명</span>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                  {groupPatients.map((p, i) => {
                    const subStage = STAGE_BY_KEY[p.stage];
                    return (
                      <div key={p.id} onClick={() => onSelectPatient(p)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < groupPatients.length - 1 ? "1px solid var(--border-subtle)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--brand-subtle)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <Avatar name={p.name} size={28} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginLeft: 8 }}>{p.gender} · {p.age}세</span>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{p.chief}</span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, fontWeight: 600, color: subStage.color,
                          background: subStage.bg, border: `1px solid ${subStage.border}`,
                          borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 8px",
                          fontFamily: "var(--font-sans)",
                        }}>
                          <Icon name={subStage.icon} size={10} />{subStage.label}
                        </span>
                        <WaitChip mins={p.waitMins} stage={p.stage} />
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: p.visitType === "초진" ? "var(--cinnabar-600)" : "var(--jade-600)",
                          background: p.visitType === "초진" ? "var(--status-danger-bg)" : "var(--brand-subtle)",
                          border: `1px solid ${p.visitType === "초진" ? "var(--status-danger-border)" : "var(--brand-muted)"}`,
                          borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 7px", fontFamily: "var(--font-sans)",
                        }}>{p.visitType}</span>
                        {p.insurance === "자보" && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: "var(--status-warning-text)", background: "var(--status-warning-bg)",
                            border: "1px solid var(--status-warning-border)",
                            borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 7px", fontFamily: "var(--font-sans)",
                          }}>자보</span>
                        )}
                        {NEXT_STAGE[p.stage] && (
                          <button onClick={e => { e.stopPropagation(); advanceStage(p.id, NEXT_STAGE[p.stage]); }}
                            style={{ fontSize: 11, color: "var(--text-brand)", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-sm)", padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
                            {NEXT_STAGE[p.stage]} →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>

      {showNewPatient && (
        <NewPatientModal
          onClose={() => setShowNewPatient(false)}
          onSubmit={() => setShowNewPatient(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { PatientListScreen, PATIENTS });
