// 진료 시간 · 휴진일 편집 모달
// HoursSection "편집" 버튼에서 호출. 중앙 모달.
// 토큰(--*)만 사용. 하드코딩 색상 금지.

const { useState: useStateHE, useEffect: useEffectHE } = React;

// ── 작은 토글 스위치 ──────────────────────────────────────────
function HoursToggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "transparent", border: "none", cursor: "pointer",
        padding: 0, fontFamily: "var(--font-sans)",
      }}>
      <span style={{
        position: "relative", width: 32, height: 18,
        borderRadius: 999, flexShrink: 0,
        background: checked ? "var(--cinnabar-600)" : "var(--stone-400)",
        transition: "background 0.18s ease",
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: "var(--text-on-brand)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          transition: "left 0.18s ease",
        }} />
      </span>
      {label && (
        <span style={{
          fontSize: 11.5, fontWeight: 500,
          color: checked ? "var(--text-danger)" : "var(--text-muted)",
        }}>{label}</span>
      )}
    </button>
  );
}

// ── 시간 입력 ─────────────────────────────────────────────────
function TimeField({ value, onChange, disabled }) {
  return (
    <input type="time" value={value === "—" ? "" : value} disabled={disabled}
      onChange={(e) => onChange(e.target.value || "—")}
      style={{
        fontFamily: "var(--font-mono)", fontSize: 13,
        color: disabled ? "var(--text-muted)" : "var(--text-primary)",
        background: disabled ? "var(--bg-raised)" : "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "5px 8px", outline: "none",
        width: 96, boxSizing: "border-box",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "text",
      }} />
  );
}

// 점심 문자열 "13:00–14:00" → { start, end } / "—" → null
function parseLunch(s) {
  if (!s || s === "—") return null;
  const parts = s.split(/[–-]/).map(x => x.trim());
  return { start: parts[0] || "13:00", end: parts[1] || "14:00" };
}

// ── 진료시간 편집 모달 ────────────────────────────────────────
function HoursEditModal({ open, onClose, hours = HOURS, holidays = HOLIDAYS }) {
  const [draft, setDraft] = useStateHE([]);
  const [holiDraft, setHoliDraft] = useStateHE([]);

  // 모달이 열릴 때 시드 데이터로 초안 초기화
  useEffectHE(() => {
    if (!open) return;
    setDraft(hours.map(h => ({
      ...h,
      lunch: parseLunch(h.lunch),
      hasLunch: !!parseLunch(h.lunch),
    })));
    setHoliDraft(holidays.map(h => ({ ...h })));
  }, [open]);

  useEffectHE(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const setDay = (i, patch) => setDraft(prev =>
    prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));

  // 월~금 첫 영업일 기준으로 평일 일괄 적용
  const applyWeekday = () => {
    const base = draft.find((d, i) => i < 5 && !d.closed) || draft[0];
    if (!base) return;
    setDraft(prev => prev.map((d, i) => i < 5
      ? { ...d, closed: false, open: base.open, close: base.close,
          hasLunch: base.hasLunch, lunch: base.lunch ? { ...base.lunch } : null }
      : d));
  };

  const setHoli = (i, patch) => setHoliDraft(prev =>
    prev.map((h, idx) => idx === i ? { ...h, ...patch } : h));
  const addHoli = () => setHoliDraft(prev => [
    ...prev, { date: "", name: "", auto: false },
  ]);
  const removeHoli = (i) => setHoliDraft(prev => prev.filter((_, idx) => idx !== i));

  const openDays = draft.filter(d => !d.closed).length;

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--text-muted)",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 220,
      background: "var(--bg-overlay)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "var(--font-sans)",
      animation: "he-fade 0.18s ease",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 720, maxHeight: "calc(100vh - 48px)",
        background: "var(--bg-page)",
        borderRadius: "var(--radius-xl)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
        animation: "he-pop 0.2s ease",
      }}>
        {/* 헤더 */}
        <header style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 22px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "var(--radius-md)",
            background: "var(--brand-subtle)", color: "var(--text-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name="clock" size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500,
              color: "var(--text-primary)", letterSpacing: "-0.01em",
            }}>진료 시간 · 휴진일 편집</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
              저장 시 예약·홈페이지·카카오톡 채널에 자동 동기화됩니다
            </div>
          </div>
          <button onClick={onClose} title="닫기" style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)", color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Icon name="x" size={16} />
          </button>
        </header>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px" }}>
          {/* 주간 진료 시간 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                color: "var(--text-primary)",
              }}>주간 진료 시간</span>
              <span style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
              }}>운영 {openDays}일</span>
            </div>
            <Button variant="ghost" size="sm" icon="copy" onClick={applyWeekday}>
              월–금 일괄 적용
            </Button>
          </div>

          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden", boxShadow: "var(--shadow-sm)",
            marginBottom: 24,
          }}>
            {draft.map((d, i) => (
              <div key={d.day} style={{
                display: "grid",
                gridTemplateColumns: "64px 92px 1fr",
                gap: 14, alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < draft.length - 1 ? "1px solid var(--border-subtle)" : "none",
                background: d.closed ? "var(--bg-raised)" : "transparent",
              }}>
                {/* 요일 */}
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                  color: d.closed ? "var(--text-muted)" : "var(--text-primary)",
                }}>{d.day.replace("요일", "")}</span>

                {/* 휴진 토글 */}
                <HoursToggle checked={d.closed} label={d.closed ? "휴진" : "운영"}
                  onChange={(v) => setDay(i, { closed: v })} />

                {/* 시간 입력 */}
                {d.closed ? (
                  <span style={{
                    fontSize: 12, color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}>휴진일 — 예약을 받지 않습니다</span>
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <TimeField value={d.open} onChange={(v) => setDay(i, { open: v })} />
                      <span style={{ color: "var(--text-muted)" }}>–</span>
                      <TimeField value={d.close} onChange={(v) => setDay(i, { close: v })} />
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      paddingLeft: 14, borderLeft: "1px solid var(--border-subtle)",
                    }}>
                      <HoursToggle checked={d.hasLunch} label="점심"
                        onChange={(v) => setDay(i, {
                          hasLunch: v,
                          lunch: v ? (d.lunch || { start: "13:00", end: "14:00" }) : d.lunch,
                        })} />
                      {d.hasLunch && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <TimeField value={(d.lunch || {}).start || "13:00"}
                            onChange={(v) => setDay(i, { lunch: { ...(d.lunch || {}), start: v } })} />
                          <span style={{ color: "var(--text-muted)" }}>–</span>
                          <TimeField value={(d.lunch || {}).end || "14:00"}
                            onChange={(v) => setDay(i, { lunch: { ...(d.lunch || {}), end: v } })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 휴진일 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                color: "var(--text-primary)",
              }}>예정된 휴진일</span>
              <span style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
              }}>{holiDraft.length}건</span>
            </div>
            <Button variant="ghost" size="sm" icon="plus" onClick={addHoli}>
              휴진일 추가
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {holiDraft.map((h, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr auto auto",
                gap: 10, alignItems: "center",
                padding: "10px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
              }}>
                <input type="date" value={h.date} disabled={h.auto}
                  onChange={(e) => setHoli(i, { date: e.target.value })}
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: 12.5,
                    color: h.auto ? "var(--text-muted)" : "var(--text-primary)",
                    background: h.auto ? "var(--bg-raised)" : "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "5px 8px", outline: "none", boxSizing: "border-box",
                    opacity: h.auto ? 0.7 : 1,
                    cursor: h.auto ? "not-allowed" : "text",
                  }} />
                <input type="text" value={h.name} disabled={h.auto}
                  placeholder="휴진 사유 (예: 학회 참석)"
                  onChange={(e) => setHoli(i, { name: e.target.value })}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: 13,
                    color: h.auto ? "var(--text-secondary)" : "var(--text-primary)",
                    background: h.auto ? "var(--bg-raised)" : "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 10px", outline: "none", boxSizing: "border-box",
                    opacity: h.auto ? 0.85 : 1,
                    cursor: h.auto ? "not-allowed" : "text",
                  }} />
                {h.auto
                  ? <Badge variant="brand">법정</Badge>
                  : <span style={{ width: 1 }} />}
                <button onClick={() => removeHoli(i)} disabled={h.auto}
                  title={h.auto ? "법정 공휴일은 자동 관리됩니다" : "삭제"}
                  style={{
                    width: 28, height: 28, borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    color: h.auto ? "var(--text-muted)" : "var(--text-danger)",
                    border: "none",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: h.auto ? "not-allowed" : "pointer",
                    opacity: h.auto ? 0.4 : 1,
                  }}>
                  <Icon name="trash-2" size={14} />
                </button>
              </div>
            ))}
            {holiDraft.length === 0 && (
              <div style={{
                padding: "20px 16px", textAlign: "center",
                color: "var(--text-muted)", fontSize: 12,
                fontFamily: "var(--font-sans)",
                background: "var(--bg-surface)",
                border: "1px dashed var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}>등록된 휴진일이 없습니다.</div>
            )}
          </div>

          <div style={{
            marginTop: 12, display: "flex", alignItems: "center", gap: 7,
            fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
          }}>
            <Icon name="info" size={12} />
            법정 공휴일은 자동으로 채워지며 직접 수정할 수 없습니다.
          </div>
        </div>

        {/* 푸터 */}
        <footer style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 8, padding: "14px 22px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check" onClick={onClose}>
            변경사항 저장
          </Button>
        </footer>
      </div>
      <style>{`
        @keyframes he-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes he-pop { from { transform: scale(0.98); opacity: 0.6; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

Object.assign(window, { HoursEditModal });
