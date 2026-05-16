// KoMES — Left Rail: Mini Calendar + Tasks
const { useState: useStateRail, useMemo: useMemoRail } = React;

const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KO_MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// Mock appointment density per day-of-month for the displayed month
const DAY_DENSITY = {
  3: 2, 4: 1, 5: 3, 8: 1, 10: 2, 11: 4, 12: 1, 15: 2, 17: 5, 18: 3,
  19: 2, 22: 1, 24: 3, 25: 2, 26: 4, 28: 1, 29: 2,
};

const SEED_TASKS = [
  { id: "t1", text: "한지민 환자 보험 청구 확인",     who: "김간호", due: "오늘 15:00", done: false, priority: "high" },
  { id: "t2", text: "재고 부족 약재 발주 (당귀, 황기)", who: "박실장", due: "오늘",       done: false, priority: "med"  },
  { id: "t3", text: "이민호 초진 차트 검토",            who: "원장",   due: "내일 09:00", done: false, priority: "med"  },
  { id: "t4", text: "정유미 처방 결과 추적 통화",       who: "김간호", due: "내일",       done: true,  priority: "low"  },
  { id: "t5", text: "주간 매출 보고서 정리",            who: "박실장", due: "금요일",     due_far: true, done: false, priority: "low"  },
];

function MiniCalendar() {
  const today = new Date();
  const [view, setView] = useStateRail({ y: today.getFullYear(), m: today.getMonth() }); // 0-indexed
  const [selected, setSelected] = useStateRail(today.getDate());

  const cells = useMemoRail(() => {
    const first = new Date(view.y, view.m, 1);
    const last = new Date(view.y, view.m + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const prevMonthLast = new Date(view.y, view.m, 0).getDate();
    const cells = [];
    // leading
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ d: prevMonthLast - i, muted: true });
    }
    for (let d = 1; d <= daysInMonth; d++) cells.push({ d, muted: false });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - daysInMonth - startWeekday + 1, muted: true });
    return cells;
  }, [view]);

  const isToday = (cell) => !cell.muted && cell.d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
  const move = (delta) => {
    const m = view.m + delta;
    if (m < 0) setView({ y: view.y - 1, m: 11 });
    else if (m > 11) setView({ y: view.y + 1, m: 0 });
    else setView({ y: view.y, m });
  };

  return (
    <div style={{ padding: "12px 14px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500, color: "var(--rail-text)", letterSpacing: "-0.01em" }}>
            {view.y}.{String(view.m + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 11, color: "var(--rail-text-muted)", fontFamily: "var(--font-sans)" }}>
            {KO_MONTHS[view.m]}
          </span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={() => move(-1)} style={navBtn}><Icon name="chevron-left" size={13} /></button>
          <button onClick={() => { setView({ y: today.getFullYear(), m: today.getMonth() }); setSelected(today.getDate()); }}
            style={{ ...navBtn, fontSize: 10, fontWeight: 600, color: "var(--rail-text-secondary)", padding: "0 8px", width: "auto" }}>오늘</button>
          <button onClick={() => move(1)} style={navBtn}><Icon name="chevron-right" size={13} /></button>
        </div>
      </div>

      {/* Weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {KO_WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", fontSize: 10, fontWeight: 600,
            color: i === 0 ? "var(--cinnabar-600)" : i === 6 ? "var(--jade-600)" : "var(--rail-text-muted)",
            fontFamily: "var(--font-sans)", padding: "4px 0",
          }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((cell, i) => {
          const dow = i % 7;
          const sel = !cell.muted && cell.d === selected;
          const td = isToday(cell);
          const density = !cell.muted ? DAY_DENSITY[cell.d] || 0 : 0;
          return (
            <div key={i} onClick={() => !cell.muted && setSelected(cell.d)}
              style={{
                aspectRatio: "1",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "relative", borderRadius: "var(--radius-sm)",
                cursor: cell.muted ? "default" : "pointer",
                background: sel ? "var(--jade-500)" : td ? "var(--brand-subtle)" : "transparent",
                border: td && !sel ? "1px solid var(--jade-300)" : "1px solid transparent",
                transition: "all 0.12s",
              }}>
              <span style={{
                fontSize: 12, fontWeight: sel || td ? 600 : 400,
                fontFamily: "var(--font-mono)",
                color: sel ? "#fff"
                  : cell.muted ? "var(--rail-text-muted)"
                  : dow === 0 ? "var(--cinnabar-600)"
                  : dow === 6 ? "var(--jade-600)"
                  : "var(--rail-text)",
              }}>{cell.d}</span>
              {density > 0 && !cell.muted && (
                <div style={{
                  position: "absolute", bottom: 3, display: "flex", gap: 1.5,
                }}>
                  {Array.from({ length: Math.min(density, 3) }).map((_, k) => (
                    <span key={k} style={{
                      width: 3, height: 3, borderRadius: "50%",
                      background: sel ? "rgba(255,255,255,0.85)" : "var(--jade-500)",
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day summary */}
      <div style={{
        marginTop: 12, padding: "10px 12px",
        background: "var(--brand-subtle)", border: "1px solid var(--jade-100)",
        borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "var(--text-brand)",
          lineHeight: 1, minWidth: 26, textAlign: "center",
        }}>{selected}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
            예약 {DAY_DENSITY[selected] || 0}건 · 대기 0건
          </div>
          <div style={{ fontSize: 10, color: "var(--rail-text-muted)", fontFamily: "var(--font-sans)" }}>
            {KO_MONTHS[view.m]} {selected}일 ({KO_WEEKDAYS[new Date(view.y, view.m, selected).getDay()]})
          </div>
        </div>
        <Icon name="chevron-right" size={14} style={{ color: "var(--jade-500)" }} />
      </div>
    </div>
  );
}

const navBtn = {
  width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "1px solid var(--rail-border)", borderRadius: "var(--radius-sm)",
  cursor: "pointer", color: "var(--rail-text-secondary)",
};

function TaskItem({ task, onToggle }) {
  const priColors = {
    high: { dot: "var(--cinnabar-600)", text: "var(--status-danger-text)", bg: "var(--status-danger-bg)" },
    med:  { dot: "var(--amber-500)",    text: "var(--status-warning-text)",    bg: "var(--status-warning-bg)" },
    low:  { dot: "var(--ink-300)",      text: "var(--rail-text-muted)",   bg: "var(--bg-raised)" },
  }[task.priority] || {};
  return (
    <div style={{
      display: "flex", gap: 9, padding: "9px 12px",
      borderBottom: "1px solid var(--rail-divider)",
      opacity: task.done ? 0.55 : 1,
      cursor: "pointer",
    }} onClick={() => onToggle(task.id)}>
      <div style={{
        width: 14, height: 14, marginTop: 2, borderRadius: "var(--radius-sm)",
        border: `1.5px solid ${task.done ? "var(--jade-500)" : "var(--rail-border)"}`,
        background: task.done ? "var(--jade-500)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {task.done && <Icon name="check" size={9} style={{ color: "#fff" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: "var(--rail-text)",
          fontFamily: "var(--font-sans)", lineHeight: 1.4,
          textDecoration: task.done ? "line-through" : "none",
        }}>{task.text}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 10, color: "var(--rail-text-muted)", fontFamily: "var(--font-sans)",
          }}>
            <Icon name="user" size={9} />{task.who}
          </span>
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)",
            color: task.due_far ? "var(--rail-text-muted)" : "var(--rail-text-secondary)",
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            <Icon name="clock" size={9} />{task.due}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 9, fontWeight: 600, color: priColors.text, background: priColors.bg,
            borderRadius: "var(--radius-full)", padding: "1px 7px",
            fontFamily: "var(--font-sans)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: priColors.dot }} />
            {task.priority === "high" ? "높음" : task.priority === "med" ? "보통" : "낮음"}
          </span>
        </div>
      </div>
    </div>
  );
}

function TasksPanel() {
  const [tasks, setTasks] = useStateRail(SEED_TASKS);
  const [filter, setFilter] = useStateRail("open"); // open | all | done

  const visible = tasks.filter(t => filter === "all" ? true : filter === "done" ? t.done : !t.done);
  const openCount = tasks.filter(t => !t.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px 8px",
        borderBottom: "1px solid var(--rail-border)",
      }}>
        <Icon name="clipboard-list" size={14} style={{ color: "var(--jade-600)" }} />
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--rail-text)",
        }}>업무</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--text-brand)",
          background: "var(--brand-muted)", borderRadius: "var(--radius-full)",
          padding: "1px 7px",
        }}>{openCount}</span>

        <button style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 500, color: "var(--text-brand)",
          background: "transparent", border: "1px solid var(--brand-muted)",
          borderRadius: "var(--radius-sm)", padding: "2px 7px", cursor: "pointer",
          fontFamily: "var(--font-sans)",
        }}>
          <Icon name="plus" size={10} />추가
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid var(--rail-divider)" }}>
        {[{ k: "open", l: "진행 중" }, { k: "done", l: "완료" }, { k: "all", l: "전체" }].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)} style={{
            fontSize: 11, fontWeight: filter === t.k ? 600 : 400,
            padding: "3px 8px", borderRadius: "var(--radius-sm)",
            background: filter === t.k ? "var(--rail-surface)" : "transparent",
            border: filter === t.k ? "1px solid var(--rail-border)" : "1px solid transparent",
            color: filter === t.k ? "var(--rail-text)" : "var(--rail-text-muted)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>{t.l}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {visible.length === 0 ? (
          <div style={{
            padding: "24px 16px", textAlign: "center",
            fontSize: 11, color: "var(--rail-text-muted)", fontFamily: "var(--font-sans)",
          }}>업무가 없습니다.</div>
        ) : visible.map(t => (
          <TaskItem key={t.id} task={t} onToggle={(id) => {
            setTasks(prev => prev.map(x => x.id === id ? { ...x, done: !x.done } : x));
          }} />
        ))}
      </div>
    </div>
  );
}

function LeftRail() {
  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: "var(--rail-bg)",
      borderRight: "1px solid var(--rail-border)",
      display: "flex", flexDirection: "column",
      minHeight: 0,
    }}>
      <MiniCalendar />
      <div style={{ height: 8, background: "var(--rail-stripe)", borderTop: "1px solid var(--rail-border)", borderBottom: "1px solid var(--rail-border)" }} />
      <TasksPanel />
    </div>
  );
}

Object.assign(window, { LeftRail });
