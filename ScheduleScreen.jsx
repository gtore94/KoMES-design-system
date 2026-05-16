// KoMES — 예약 관리 (Appointment Management)
// Day / Week / Month views + new appointment creation
const { useState: useStateSch, useMemo: useMemoSch, useEffect: useEffectSch } = React;

const KO_WEEKDAYS_SCH = ["일", "월", "화", "수", "목", "금", "토"];
const KO_MONTHS_SCH = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// Operating hours: 09:00 – 19:00, 30-min slots
const HOURS_SCH = [];
for (let h = 9; h < 19; h++) {
  HOURS_SCH.push(`${String(h).padStart(2, "0")}:00`);
  HOURS_SCH.push(`${String(h).padStart(2, "0")}:30`);
}

// Mock doctors (rooms)
const DOCTORS_SCH = [
  { id: "d1", name: "김민준 원장", room: "진료실 1", color: "#4A7C6F", bg: "var(--doc-d1-bg)", border: "var(--doc-d1-border)" },
  { id: "d2", name: "이지영 원장", room: "진료실 2", color: "#B5873E", bg: "var(--doc-d2-bg)", border: "var(--doc-d2-border)" },
  { id: "d3", name: "박서윤 부원장", room: "치료실 A", color: "#5A6E8A", bg: "var(--doc-d3-bg)", border: "var(--doc-d3-border)" },
];

// Treatment types
const TREATMENTS_SCH = [
  { key: "초진", mins: 40 },
  { key: "재진", mins: 20 },
  { key: "침치료", mins: 30 },
  { key: "약침", mins: 25 },
  { key: "추나", mins: 40 },
  { key: "한약 상담", mins: 30 },
];

// Generate seed appointments for the current week (anchored to today)
const TODAY_SCH = new Date(2026, 4, 10); // May 10, 2026 to match the system date

const ymdSch = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const startOfWeekSch = (d) => {
  const x = new Date(d); x.setHours(0,0,0,0);
  x.setDate(x.getDate() - x.getDay()); // Sunday
  return x;
};
const addDaysSch = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };

const buildSeedSch = () => {
  const wkStart = startOfWeekSch(TODAY_SCH);
  const seed = [];
  let id = 1;
  // Mon
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 1)), start: "09:30", mins: 20, doctor: "d1", patient: "한지민", chief: "어지러움", visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 1)), start: "10:30", mins: 30, doctor: "d2", patient: "장우성", chief: "허리 통증",  visit: "초진", status: "확정", insurance: "자보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 1)), start: "14:00", mins: 40, doctor: "d1", patient: "송재호", chief: "경항통",     visit: "재진", status: "확정", insurance: "자보" });
  // Tue
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 2)), start: "10:00", mins: 30, doctor: "d3", patient: "안세영", chief: "요통",       visit: "재진", status: "대기", insurance: "자보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 2)), start: "11:30", mins: 25, doctor: "d2", patient: "정유미", chief: "생리통",     visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 2)), start: "15:30", mins: 40, doctor: "d1", patient: "오세훈", chief: "어깨 통증",  visit: "재진", status: "확정", insurance: "건보" });
  // Wed
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 3)), start: "09:00", mins: 40, doctor: "d1", patient: "이민호", chief: "소화불량",   visit: "초진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 3)), start: "13:30", mins: 20, doctor: "d2", patient: "박지현", chief: "불면증",     visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 3)), start: "16:00", mins: 30, doctor: "d3", patient: "강민재", chief: "무릎 통증",  visit: "재진", status: "확정", insurance: "건보" });
  // Thu
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 4)), start: "10:30", mins: 30, doctor: "d1", patient: "윤지영", chief: "피부 트러블",visit: "초진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 4)), start: "14:30", mins: 40, doctor: "d2", patient: "최동욱", chief: "비염",       visit: "재진", status: "노쇼", insurance: "건보" });
  // Fri
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 5)), start: "09:30", mins: 25, doctor: "d1", patient: "임소연", chief: "갱년기",     visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 5)), start: "11:00", mins: 30, doctor: "d3", patient: "홍길동", chief: "두통",       visit: "재진", status: "확정", insurance: "자보" });
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 5)), start: "16:30", mins: 40, doctor: "d2", patient: "김수진", chief: "요통, 피로", visit: "재진", status: "확정", insurance: "건보" });
  // Sat
  seed.push({ id: id++, date: ymdSch(addDaysSch(wkStart, 6)), start: "10:00", mins: 30, doctor: "d1", patient: "장태호", chief: "목 통증",    visit: "초진", status: "확정", insurance: "건보" });
  // Other days in the month
  seed.push({ id: id++, date: "2026-05-11", start: "09:30", mins: 30, doctor: "d1", patient: "남궁민", chief: "두통",      visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: "2026-05-11", start: "14:00", mins: 30, doctor: "d2", patient: "조혜린", chief: "어지럼증",  visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: "2026-05-12", start: "10:00", mins: 25, doctor: "d3", patient: "이수민", chief: "관절통",   visit: "초진", status: "대기", insurance: "건보" });
  seed.push({ id: id++, date: "2026-05-13", start: "15:30", mins: 30, doctor: "d1", patient: "조현우", chief: "재진",      visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: "2026-05-14", start: "11:00", mins: 40, doctor: "d2", patient: "백수정", chief: "한약 상담", visit: "재진", status: "확정", insurance: "건보" });
  seed.push({ id: id++, date: "2026-05-15", start: "16:00", mins: 30, doctor: "d1", patient: "권보라", chief: "요통",     visit: "재진", status: "확정", insurance: "건보" });
  return seed;
};

// ── Status colors ──────────────────────────────────────────────
const STATUS_SCH = {
  "확정": { bg: "var(--brand-subtle)",       border: "var(--jade-300)",     text: "var(--text-brand)",   dot: "var(--jade-500)"   },
  "대기": { bg: "var(--status-warning-bg)",  border: "var(--status-warning-border)",    text: "var(--status-warning-text)",  dot: "var(--amber-500)"  },
  "노쇼": { bg: "var(--status-danger-bg)",   border: "var(--status-danger-border)", text: "var(--status-danger-text)", dot: "var(--cinnabar-600)" },
  "취소": { bg: "var(--bg-raised)",          border: "var(--border-subtle)",    text: "var(--text-muted)", dot: "var(--text-secondary)"  },
};

// ── Helpers ────────────────────────────────────────────────────
const minsFromTimeSch = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const timeFromMinsSch = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;

// ── New Appointment Modal ──────────────────────────────────────
function NewAppointmentModal({ initial, onClose, onSubmit }) {
  const [d, setD] = useStateSch({
    date: initial?.date || ymdSch(TODAY_SCH),
    start: initial?.start || "10:00",
    doctor: initial?.doctor || "d1",
    patient: "",
    visit: "재진",
    treatment: "재진",
    chief: "",
    insurance: "건보",
    phone: "",
    notify: true,
  });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const treatmentMins = (TREATMENTS_SCH.find(t => t.key === d.treatment) || TREATMENTS_SCH[0]).mins;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "var(--bg-overlay)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 560,
        background: "var(--bg-page)",
        borderRadius: "var(--radius-xl)", overflow: "hidden",
        boxShadow: "var(--shadow-xl)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: "var(--brand-muted)", color: "var(--text-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="calendar-plus" size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              새 예약
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              날짜·시간·환자 정보를 입력해 예약을 추가합니다
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "var(--radius-sm)",
            background: "transparent", border: "1px solid var(--border-subtle)",
            cursor: "pointer", color: "var(--text-secondary)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}>
          {/* Date / Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
            <div>
              <div style={apptLbl}>날짜</div>
              <input type="date" value={d.date} onChange={e => set("date", e.target.value)} style={apptInput} />
            </div>
            <div>
              <div style={apptLbl}>시작 시간</div>
              <select value={d.start} onChange={e => set("start", e.target.value)} style={apptInput}>
                {HOURS_SCH.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <div style={apptLbl}>소요 시간</div>
              <div style={{
                ...apptInput, background: "var(--bg-raised)",
                color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
                display: "flex", alignItems: "center",
              }}>{treatmentMins}분</div>
            </div>
          </div>

          {/* Doctor */}
          <div>
            <div style={apptLbl}>담당의 / 진료실</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {DOCTORS_SCH.map(doc => {
                const sel = d.doctor === doc.id;
                return (
                  <button key={doc.id} onClick={() => set("doctor", doc.id)} style={{
                    padding: "9px 10px", borderRadius: "var(--radius-md)",
                    border: `1px solid ${sel ? doc.color : "var(--border-subtle)"}`,
                    background: sel ? doc.bg : "var(--bg-surface)",
                    cursor: "pointer", textAlign: "left",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.12s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: doc.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: sel ? doc.color : "var(--text-primary)" }}>
                        {doc.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, paddingLeft: 14 }}>{doc.room}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Treatment + Visit */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
            <div>
              <div style={apptLbl}>진료 / 시술 항목</div>
              <select value={d.treatment} onChange={e => set("treatment", e.target.value)} style={apptInput}>
                {TREATMENTS_SCH.map(t => <option key={t.key} value={t.key}>{t.key} · {t.mins}분</option>)}
              </select>
            </div>
            <div>
              <div style={apptLbl}>방문 구분</div>
              <div style={{ display: "flex", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 2, gap: 2 }}>
                {["초진", "재진"].map(v => (
                  <button key={v} onClick={() => set("visit", v)} style={{
                    flex: 1, padding: "6px 10px", border: "none", cursor: "pointer",
                    background: d.visit === v ? "var(--bg-surface)" : "transparent",
                    color: d.visit === v ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: d.visit === v ? 600 : 400,
                    boxShadow: d.visit === v ? "var(--shadow-sm)" : "none",
                    borderRadius: "var(--radius-sm)", fontSize: 12,
                    fontFamily: "var(--font-sans)",
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient */}
          <div>
            <div style={apptLbl}>환자 검색</div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                <Icon name="search" size={14} />
              </span>
              <input value={d.patient} onChange={e => set("patient", e.target.value)}
                placeholder="이름, 차트번호, 전화번호로 검색"
                style={{ ...apptInput, paddingLeft: 32 }} />
            </div>
          </div>

          {/* Phone + Insurance */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
            <div>
              <div style={apptLbl}>연락처</div>
              <input value={d.phone} onChange={e => set("phone", e.target.value)}
                placeholder="010-0000-0000"
                style={{ ...apptInput, fontFamily: "var(--font-mono)" }} />
            </div>
            <div>
              <div style={apptLbl}>보험</div>
              <select value={d.insurance} onChange={e => set("insurance", e.target.value)} style={apptInput}>
                <option value="건보">건강보험</option>
                <option value="자보">자동차보험</option>
                <option value="산재">산재</option>
                <option value="일반">일반(비급여)</option>
              </select>
            </div>
          </div>

          {/* Chief */}
          <div>
            <div style={apptLbl}>예약 사유 / 메모</div>
            <textarea value={d.chief} onChange={e => set("chief", e.target.value)}
              placeholder="예: 허리 통증 재진, MRI 결과 상담"
              style={{ ...apptInput, minHeight: 56, resize: "vertical", padding: "9px 11px" }} />
          </div>

          {/* Notify */}
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", background: "var(--brand-subtle)",
            border: "1px solid var(--jade-100)", borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}>
            <input type="checkbox" checked={d.notify} onChange={e => set("notify", e.target.checked)}
              style={{ accentColor: "var(--jade-500)" }} />
            <span style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
              예약 확정 SMS 발송
            </span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              D-{Math.max(0, Math.round((new Date(d.date) - new Date(ymdSch(TODAY_SCH)))/86400000))}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px", background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", gap: 8, justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 500,
            background: "transparent", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>취소</button>
          <button onClick={() => onSubmit && onSubmit({ ...d, mins: treatmentMins, status: "확정" })}
            disabled={!d.patient}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              background: d.patient ? "var(--jade-500)" : "var(--stone-300)",
              border: "none", borderRadius: "var(--radius-md)", color: "#fff",
              cursor: d.patient ? "pointer" : "not-allowed",
              fontFamily: "var(--font-sans)",
              display: "inline-flex", alignItems: "center", gap: 6,
              boxShadow: d.patient ? "var(--shadow-sm)" : "none",
            }}>
            <Icon name="calendar-check" size={13} />예약 등록
          </button>
        </div>
      </div>
    </div>
  );
}

const apptLbl = {
  fontSize: 11, fontWeight: 600, color: "var(--text-secondary)",
  marginBottom: 5, fontFamily: "var(--font-sans)",
  letterSpacing: "0.02em",
};
const apptInput = {
  width: "100%", padding: "8px 11px", fontSize: 13,
  fontFamily: "var(--font-sans)", color: "var(--text-primary)",
  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)", outline: "none",
  boxSizing: "border-box",
};

// ── Overlap layout: assigns col / totalCols to each appt ──────
function layoutApptsSch(appts) {
  if (!appts.length) return [];
  const sorted = [...appts].sort((a, b) => minsFromTimeSch(a.start) - minsFromTimeSch(b.start));
  const colAssign = new Array(sorted.length).fill(0);
  const colEnds = [];
  for (let i = 0; i < sorted.length; i++) {
    const s = minsFromTimeSch(sorted[i].start);
    const e = s + sorted[i].mins;
    let c = 0;
    while (c < colEnds.length && colEnds[c] > s) c++;
    colAssign[i] = c;
    colEnds[c] = e;
  }
  return sorted.map((a, i) => {
    const s = minsFromTimeSch(a.start);
    const e = s + a.mins;
    let maxCol = colAssign[i];
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const s2 = minsFromTimeSch(sorted[j].start);
      const e2 = s2 + sorted[j].mins;
      if (s < e2 && e > s2) maxCol = Math.max(maxCol, colAssign[j]);
    }
    return { ...a, col: colAssign[i], totalCols: maxCol + 1 };
  });
}

// ── Appointment Block (Day/Week) ───────────────────────────────
function ApptBlock({ appt, onClick, hourHeightPx, col = 0, totalCols = 1 }) {
  const startMin = minsFromTimeSch(appt.start);
  const top = ((startMin - 9*60) / 60) * hourHeightPx;
  const height = (appt.mins / 60) * hourHeightPx;
  const doc = DOCTORS_SCH.find(x => x.id === appt.doctor);
  const status = STATUS_SCH[appt.status] || STATUS_SCH["확정"];
  const leftPct = (col / totalCols * 100).toFixed(1);
  const rightPct = ((totalCols - col - 1) / totalCols * 100).toFixed(1);
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick && onClick(appt); }}
      style={{
        position: "absolute",
        left: `calc(${leftPct}% + 2px)`,
        right: `calc(${rightPct}% + 2px)`,
        top: top + 2, height: Math.max(height - 4, 22),
        background: doc.bg,
        border: `1px solid ${doc.border}`,
        borderLeft: `3px solid ${doc.color}`,
        borderRadius: "var(--radius-sm)",
        padding: "4px 6px",
        cursor: "pointer",
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-sans)",
        opacity: appt.status === "노쇼" || appt.status === "취소" ? 0.6 : 1,
        textDecoration: appt.status === "취소" ? "line-through" : "none",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600, color: doc.color, flexShrink: 0 }}>
          {appt.start}
        </span>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: status.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
          {appt.patient}
        </span>
      </div>
      {height > 36 && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {appt.chief}
        </div>
      )}
    </div>
  );
}

// ── Day View ───────────────────────────────────────────────────
function DayView({ date, appts, onCellClick, onApptClick, doctorFilter }) {
  const HOUR_PX = 56;
  const dayStr = ymdSch(date);
  const todays = appts.filter(a => a.date === dayStr && (!doctorFilter || a.doctor === doctorFilter));
  // Group by doctor (column per doctor)
  const visibleDocs = doctorFilter ? DOCTORS_SCH.filter(d => d.id === doctorFilter) : DOCTORS_SCH;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Doctor column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `64px repeat(${visibleDocs.length}, 1fr)`,
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}>
        <div style={{ padding: "10px 8px", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "right" }}>시간</div>
        {visibleDocs.map(doc => (
          <div key={doc.id} style={{
            padding: "10px 14px",
            borderLeft: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: doc.color }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{doc.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                {doc.room} · 예약 {todays.filter(a => a.doctor === doc.id).length}건
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hour grid */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-surface)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `64px repeat(${visibleDocs.length}, 1fr)`,
          position: "relative",
        }}>
          {/* Hour labels column */}
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                height: HOUR_PX, padding: "4px 8px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: 10, color: "var(--text-muted)",
                fontFamily: "var(--font-mono)", textAlign: "right",
              }}>{String(9+i).padStart(2,"0")}:00</div>
            ))}
          </div>
          {/* Doctor columns */}
          {visibleDocs.map(doc => (
            <div key={doc.id} style={{
              position: "relative",
              borderLeft: "1px solid var(--border-subtle)",
            }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}
                  onClick={() => onCellClick && onCellClick({ date: dayStr, start: `${String(9+i).padStart(2,"0")}:00`, doctor: doc.id })}
                  style={{
                    height: HOUR_PX,
                    borderTop: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    position: "relative",
                  }}>
                  {/* Half-hour line */}
                  <div style={{
                    position: "absolute", top: HOUR_PX/2, left: 0, right: 0,
                    borderTop: "1px dashed var(--border-subtle)",
                  }} />
                </div>
              ))}
              {/* Appointment blocks for this doctor */}
              {layoutApptsSch(todays.filter(a => a.doctor === doc.id)).map(a => (
                <ApptBlock key={a.id} appt={a} onClick={onApptClick} hourHeightPx={HOUR_PX} col={a.col} totalCols={a.totalCols} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Week View ──────────────────────────────────────────────────
function WeekView({ date, appts, onCellClick, onApptClick, doctorFilter }) {
  const HOUR_PX = 52;
  const wkStart = startOfWeekSch(date);
  const days = Array.from({ length: 7 }, (_, i) => addDaysSch(wkStart, i));
  const todayStr = ymdSch(TODAY_SCH);
  const filtered = doctorFilter ? appts.filter(a => a.doctor === doctorFilter) : appts;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Day headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `56px repeat(7, 1fr)`,
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}>
        <div style={{ padding: "10px 6px", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "right" }}>시간</div>
        {days.map((d, i) => {
          const isToday = ymdSch(d) === todayStr;
          const dayCt = filtered.filter(a => a.date === ymdSch(d)).length;
          return (
            <div key={i} style={{
              padding: "8px 10px",
              borderLeft: "1px solid var(--border-subtle)",
              background: isToday ? "var(--brand-subtle)" : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: i === 0 ? "var(--cinnabar-600)" : i === 6 ? "var(--jade-600)" : "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}>{KO_WEEKDAYS_SCH[i]}</span>
                <span style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18, fontWeight: isToday ? 600 : 400,
                  color: isToday ? "var(--text-brand)" : "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}>{d.getDate()}</span>
                {dayCt > 0 && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 10, fontWeight: 600,
                    color: "var(--text-brand)", background: "var(--brand-muted)",
                    borderRadius: "var(--radius-full)", padding: "1px 7px",
                    fontFamily: "var(--font-mono)",
                  }}>{dayCt}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour grid */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-surface)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `56px repeat(7, 1fr)`,
          position: "relative",
        }}>
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                height: HOUR_PX, padding: "4px 8px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: 10, color: "var(--text-muted)",
                fontFamily: "var(--font-mono)", textAlign: "right",
              }}>{String(9+i).padStart(2,"0")}:00</div>
            ))}
          </div>
          {days.map((d, di) => {
            const dayStr = ymdSch(d);
            const isToday = dayStr === todayStr;
            const dayAppts = filtered.filter(a => a.date === dayStr);
            return (
              <div key={di} style={{
                position: "relative",
                borderLeft: "1px solid var(--border-subtle)",
                background: isToday ? "rgba(74,124,111,0.03)" : "transparent",
              }}>
                {Array.from({ length: 10 }).map((_, hi) => (
                  <div key={hi}
                    onClick={() => onCellClick && onCellClick({ date: dayStr, start: `${String(9+hi).padStart(2,"0")}:00` })}
                    style={{
                      height: HOUR_PX,
                      borderTop: "1px solid var(--border-subtle)",
                      cursor: "pointer", position: "relative",
                    }}>
                    <div style={{
                      position: "absolute", top: HOUR_PX/2, left: 0, right: 0,
                      borderTop: "1px dashed var(--border-subtle)",
                    }} />
                  </div>
                ))}
                {layoutApptsSch(dayAppts).map(a => (
                  <ApptBlock key={a.id} appt={a} onClick={onApptClick} hourHeightPx={HOUR_PX} col={a.col} totalCols={a.totalCols} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Month View ─────────────────────────────────────────────────
function MonthView({ date, appts, onCellClick, onDayClick, onApptClick, doctorFilter }) {
  const view = { y: date.getFullYear(), m: date.getMonth() };
  const filtered = doctorFilter ? appts.filter(a => a.doctor === doctorFilter) : appts;

  const cells = useMemoSch(() => {
    const first = new Date(view.y, view.m, 1);
    const last = new Date(view.y, view.m + 1, 0);
    const startWk = first.getDay();
    const days = last.getDate();
    const prevDays = new Date(view.y, view.m, 0).getDate();
    const out = [];
    for (let i = startWk - 1; i >= 0; i--) {
      const d = new Date(view.y, view.m - 1, prevDays - i);
      out.push({ d, muted: true });
    }
    for (let dn = 1; dn <= days; dn++) {
      out.push({ d: new Date(view.y, view.m, dn), muted: false });
    }
    while (out.length % 7 !== 0) {
      const last = out[out.length - 1].d;
      out.push({ d: new Date(last.getFullYear(), last.getMonth(), last.getDate()+1), muted: true });
    }
    return out;
  }, [view.y, view.m]);

  const todayStr = ymdSch(TODAY_SCH);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "var(--bg-surface)" }}>
      {/* Day-of-week header */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-raised)", flexShrink: 0,
      }}>
        {KO_WEEKDAYS_SCH.map((w, i) => (
          <div key={w} style={{
            padding: "8px 10px",
            borderLeft: i > 0 ? "1px solid var(--border-subtle)" : "none",
            fontSize: 11, fontWeight: 700,
            color: i === 0 ? "var(--cinnabar-600)" : i === 6 ? "var(--jade-600)" : "var(--text-secondary)",
            fontFamily: "var(--font-sans)", letterSpacing: "0.04em",
          }}>{w}요일</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "1fr", overflowY: "auto" }}>
        {cells.map((c, i) => {
          const dayStr = ymdSch(c.d);
          const dayAppts = filtered.filter(a => a.date === dayStr);
          const isToday = dayStr === todayStr;
          const dow = c.d.getDay();
          return (
            <div key={i}
              onClick={() => onDayClick && onDayClick(c.d)}
              style={{
                minHeight: 110,
                borderTop: i >= 7 ? "1px solid var(--border-subtle)" : "none",
                borderLeft: i % 7 !== 0 ? "1px solid var(--border-subtle)" : "none",
                background: c.muted ? "var(--bg-raised)" : isToday ? "var(--brand-subtle)" : "var(--bg-surface)",
                padding: "6px 8px",
                cursor: c.muted ? "default" : "pointer",
                display: "flex", flexDirection: "column", gap: 3,
                opacity: c.muted ? 0.4 : 1,
                position: "relative",
              }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12, fontWeight: isToday ? 700 : 500,
                  color: isToday ? "#fff" : dow === 0 ? "var(--cinnabar-600)" : dow === 6 ? "var(--jade-600)" : "var(--text-primary)",
                  background: isToday ? "var(--jade-500)" : "transparent",
                  borderRadius: "50%",
                  width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{c.d.getDate()}</span>
                {dayAppts.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: "var(--text-brand)", fontFamily: "var(--font-mono)",
                  }}>{dayAppts.length}건</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                {dayAppts.slice(0, 3).map(a => {
                  const doc = DOCTORS_SCH.find(x => x.id === a.doctor);
                  return (
                    <div key={a.id} onClick={(e) => { e.stopPropagation(); onApptClick && onApptClick(a); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "2px 5px",
                        background: doc.bg, borderLeft: `2px solid ${doc.color}`,
                        borderRadius: 2, fontSize: 10,
                        fontFamily: "var(--font-sans)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                      <span style={{ fontFamily: "var(--font-mono)", color: doc.color, fontWeight: 600, flexShrink: 0 }}>
                        {a.start}
                      </span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{a.patient}</span>
                    </div>
                  );
                })}
                {dayAppts.length > 3 && (
                  <div style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 5, fontFamily: "var(--font-sans)" }}>
                    +{dayAppts.length - 3}건 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Appointment Detail Drawer ──────────────────────────────────
function ApptDetail({ appt, onClose, onChangeStatus }) {
  if (!appt) return null;
  const doc = DOCTORS_SCH.find(x => x.id === appt.doctor);
  const status = STATUS_SCH[appt.status] || STATUS_SCH["확정"];
  const endMin = minsFromTimeSch(appt.start) + appt.mins;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(17,30,28,0.3)",
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, height: "100%",
        background: "var(--bg-surface)",
        boxShadow: "var(--shadow-xl)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 12,
          background: doc.bg, borderLeft: `4px solid ${doc.color}`,
        }}>
          <Avatar name={appt.patient} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>
              {appt.patient}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              {appt.visit} · {appt.insurance}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "var(--radius-sm)",
            background: "rgba(255,255,255,0.6)", border: "1px solid var(--border-subtle)",
            cursor: "pointer", color: "var(--text-secondary)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={15} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={detailRow}>
            <Icon name="calendar" size={14} style={{ color: "var(--text-muted)" }} />
            <span style={detailKey}>날짜</span>
            <span style={detailVal}>{appt.date}</span>
          </div>
          <div style={detailRow}>
            <Icon name="clock" size={14} style={{ color: "var(--text-muted)" }} />
            <span style={detailKey}>시간</span>
            <span style={detailVal}>{appt.start} – {timeFromMinsSch(endMin)} ({appt.mins}분)</span>
          </div>
          <div style={detailRow}>
            <Icon name="stethoscope" size={14} style={{ color: "var(--text-muted)" }} />
            <span style={detailKey}>담당의</span>
            <span style={detailVal}>{doc.name} · {doc.room}</span>
          </div>
          <div style={detailRow}>
            <Icon name="file-text" size={14} style={{ color: "var(--text-muted)" }} />
            <span style={detailKey}>주소증</span>
            <span style={detailVal}>{appt.chief}</span>
          </div>
          <div style={detailRow}>
            <Icon name="circle-dot" size={14} style={{ color: status.dot }} />
            <span style={detailKey}>상태</span>
            <span style={{
              ...detailVal, color: status.text, background: status.bg,
              border: `1px solid ${status.border}`,
              borderRadius: "var(--radius-full)", padding: "2px 10px",
              fontSize: 11, fontWeight: 600,
            }}>{appt.status}</span>
          </div>

          <div style={{
            marginTop: 4, padding: 12,
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
              상태 변경
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {Object.keys(STATUS_SCH).map(s => {
                const sc = STATUS_SCH[s];
                const sel = appt.status === s;
                return (
                  <button key={s} onClick={() => onChangeStatus && onChangeStatus(appt.id, s)} style={{
                    padding: "6px 4px", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${sel ? sc.border : "var(--border-subtle)"}`,
                    background: sel ? sc.bg : "var(--bg-surface)",
                    color: sel ? sc.text : "var(--text-secondary)",
                    fontSize: 11, fontWeight: sel ? 600 : 400,
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{
          padding: 14, borderTop: "1px solid var(--border-subtle)",
          display: "flex", gap: 8,
        }}>
          <button style={{
            flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 500,
            background: "transparent", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}><Icon name="message-circle" size={12} />SMS 발송</button>
          <button style={{
            flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 600,
            background: "var(--jade-500)", border: "none",
            borderRadius: "var(--radius-md)", color: "#fff",
            cursor: "pointer", fontFamily: "var(--font-sans)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}><Icon name="user-check" size={12} />접수 처리</button>
        </div>
      </div>
    </div>
  );
}

const detailRow = { display: "flex", alignItems: "center", gap: 10 };
const detailKey = { fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)", width: 50, flexShrink: 0 };
const detailVal = { fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 };

// ── Main Schedule Screen ───────────────────────────────────────
function ScheduleScreen() {
  const [appts, setAppts] = useStateSch(() => {
    try {
      const saved = localStorage.getItem("komes_appts_v1");
      return saved ? JSON.parse(saved) : buildSeedSch();
    } catch { return buildSeedSch(); }
  });
  useEffectSch(() => { localStorage.setItem("komes_appts_v1", JSON.stringify(appts)); }, [appts]);

  const [view, setView] = useStateSch("week"); // day / week / month
  const [date, setDate] = useStateSch(TODAY_SCH);
  const [doctorFilter, setDoctorFilter] = useStateSch(""); // "" = all
  const [showNew, setShowNew] = useStateSch(false);
  const [newInitial, setNewInitial] = useStateSch(null);
  const [selectedAppt, setSelectedAppt] = useStateSch(null);

  const goPrev = () => {
    if (view === "day") setDate(addDaysSch(date, -1));
    else if (view === "week") setDate(addDaysSch(date, -7));
    else setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (view === "day") setDate(addDaysSch(date, 1));
    else if (view === "week") setDate(addDaysSch(date, 7));
    else setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const headerLabel = (() => {
    if (view === "day") return `${date.getFullYear()}년 ${KO_MONTHS_SCH[date.getMonth()]} ${date.getDate()}일 (${KO_WEEKDAYS_SCH[date.getDay()]})`;
    if (view === "week") {
      const s = startOfWeekSch(date), e = addDaysSch(s, 6);
      return `${s.getFullYear()}년 ${s.getMonth()+1}월 ${s.getDate()}일 — ${e.getDate()}일`;
    }
    return `${date.getFullYear()}년 ${KO_MONTHS_SCH[date.getMonth()]}`;
  })();

  // Counts for header
  const periodAppts = (() => {
    if (view === "day") return appts.filter(a => a.date === ymdSch(date));
    if (view === "week") {
      const s = startOfWeekSch(date), e = addDaysSch(s, 6);
      return appts.filter(a => a.date >= ymdSch(s) && a.date <= ymdSch(e));
    }
    const my = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
    return appts.filter(a => a.date.startsWith(my));
  })();
  const periodFiltered = doctorFilter ? periodAppts.filter(a => a.doctor === doctorFilter) : periodAppts;
  const newCnt = periodFiltered.filter(a => a.visit === "초진").length;
  const reCnt = periodFiltered.filter(a => a.visit === "재진").length;
  const noShowCnt = periodFiltered.filter(a => a.status === "노쇼").length;

  const onCellClick = (init) => { setNewInitial(init); setShowNew(true); };
  const onNewSubmit = (a) => {
    setAppts(prev => [...prev, { ...a, id: Math.max(0, ...prev.map(x => x.id)) + 1 }]);
    setShowNew(false);
  };
  const onChangeStatus = (id, status) => {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSelectedAppt(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="예약 관리"
        subtitle={`${headerLabel} · 총 ${periodFiltered.length}건 (초진 ${newCnt} · 재진 ${reCnt}${noShowCnt ? ` · 노쇼 ${noShowCnt}` : ""})`}
        actions={<>
          {/* View segmented */}
          <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: "var(--radius-md)", padding: 2, gap: 2 }}>
            {[
              { key: "day", l: "일간" },
              { key: "week", l: "주간" },
              { key: "month", l: "월간" },
            ].map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{
                padding: "5px 14px", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                background: view === v.key ? "var(--bg-surface)" : "transparent",
                boxShadow: view === v.key ? "var(--shadow-sm)" : "none",
                color: view === v.key ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: view === v.key ? 600 : 400, fontSize: 12, fontFamily: "var(--font-sans)",
              }}>{v.l}</button>
            ))}
          </div>
          <Button variant="primary" icon="calendar-plus" onClick={() => { setNewInitial(null); setShowNew(true); }}>새 예약</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Subheader: nav + filters */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 24px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={goPrev} style={navIconBtn}><Icon name="chevron-left" size={16} /></button>
            <button onClick={() => setDate(TODAY_SCH)} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: 500,
              background: "var(--bg-surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>오늘</button>
            <button onClick={goNext} style={navIconBtn}><Icon name="chevron-right" size={16} /></button>
          </div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500,
            color: "var(--text-primary)", letterSpacing: "-0.01em",
          }}>{headerLabel}</div>

          <div style={{ flex: 1 }} />

          {/* Doctor filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}>담당의</span>
            <button onClick={() => setDoctorFilter("")} style={{
              padding: "4px 10px", fontSize: 11, fontWeight: doctorFilter === "" ? 600 : 400,
              background: doctorFilter === "" ? "var(--jade-500)" : "var(--bg-surface)",
              color: doctorFilter === "" ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${doctorFilter === "" ? "var(--jade-500)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>전체</button>
            {DOCTORS_SCH.map(doc => {
              const sel = doctorFilter === doc.id;
              return (
                <button key={doc.id} onClick={() => setDoctorFilter(doc.id)} style={{
                  padding: "4px 10px", fontSize: 11, fontWeight: sel ? 600 : 400,
                  background: sel ? doc.bg : "var(--bg-surface)",
                  color: sel ? doc.color : "var(--text-secondary)",
                  border: `1px solid ${sel ? doc.color : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font-sans)",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: doc.color }} />
                  {doc.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minHeight: 0, padding: "0 24px 16px", display: "flex", flexDirection: "column" }}>
          <div style={{
            flex: 1, minHeight: 0, marginTop: 16,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "var(--shadow-sm)",
          }}>
            {view === "day"   && <DayView   date={date} appts={appts} onCellClick={onCellClick} onApptClick={setSelectedAppt} doctorFilter={doctorFilter} />}
            {view === "week"  && <WeekView  date={date} appts={appts} onCellClick={onCellClick} onApptClick={setSelectedAppt} doctorFilter={doctorFilter} />}
            {view === "month" && <MonthView date={date} appts={appts} onApptClick={setSelectedAppt} onDayClick={(d) => { setDate(d); setView("day"); }} doctorFilter={doctorFilter} />}
          </div>

          {/* Status legend */}
          <div style={{ display: "flex", gap: 14, padding: "10px 4px", flexShrink: 0 }}>
            {Object.keys(STATUS_SCH).map(s => {
              const sc = STATUS_SCH[s];
              return (
                <div key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{s}</span>
                </div>
              );
            })}
            <div style={{ width: 1, height: 14, background: "var(--border-subtle)" }} />
            {DOCTORS_SCH.map(doc => (
              <div key={doc.id} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: doc.bg, border: `2px solid ${doc.color}` }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNew && (
        <NewAppointmentModal initial={newInitial} onClose={() => setShowNew(false)} onSubmit={onNewSubmit} />
      )}
      {selectedAppt && (
        <ApptDetail appt={selectedAppt} onClose={() => setSelectedAppt(null)} onChangeStatus={onChangeStatus} />
      )}
    </div>
  );
}

const navIconBtn = {
  width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--text-secondary)",
};

Object.assign(window, { ScheduleScreen });
