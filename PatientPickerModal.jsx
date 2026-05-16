// KoMES — Patient Picker Modal (환자 변경)
// 모달: 검색 + 필터 + 환자 목록 + 미리보기
const { useState: useStatePM, useMemo: useMemoPM, useEffect: useEffectPM, useRef: useRefPM } = React;

// ── Tag pill ─────────────────────────────────────────────────────
function PPTag({ tag }) {
  const c = window.PP_TAG_COLORS[tag] || { bg: "var(--bg-raised)", color: "var(--text-secondary)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "1px 6px",
      borderRadius: 999, fontSize: 10, fontWeight: 600,
      background: c.bg, color: c.color, letterSpacing: "0.02em",
    }}>{tag}</span>
  );
}

// ── Patient row ──────────────────────────────────────────────────
function PPRow({ patient, selected, onClick, onPick, isCurrent }) {
  const today = patient.lastVisit === window.PP_TODAY_STR;
  return (
    <div
      onClick={onClick}
      onDoubleClick={onPick}
      style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto",
        gap: 12, alignItems: "center",
        padding: "10px 14px",
        background: selected ? "var(--brand-subtle)" : "transparent",
        borderLeft: `3px solid ${selected ? "var(--jade-500)" : "transparent"}`,
        cursor: "pointer", transition: "background 0.08s ease",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--bg-raised)"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar name={patient.name} size={36} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{patient.gender} · {patient.age}세</span>
          <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</span>
          {isCurrent && (
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 6px", background: "var(--ink-100)", color: "var(--text-secondary)", borderRadius: 999, letterSpacing: "0.04em" }}>현재</span>
          )}
          {patient.tags && patient.tags.length > 0 && (
            <span style={{ display: "inline-flex", gap: 3 }}>
              {patient.tags.slice(0, 2).map(t => <PPTag key={t} tag={t} />)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-secondary)" }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>#{patient.chartNo}</span>
          <span style={{ color: "var(--ink-200)" }}>·</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{patient.chief}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
        <div style={{
          fontSize: 10.5, fontFamily: "var(--font-mono)",
          color: today ? "var(--text-brand)" : "var(--text-muted)",
          fontWeight: today ? 600 : 400,
        }}>{patient.lastVisit}</div>
        <div style={{ fontSize: 9.5, color: today ? "var(--jade-600)" : "var(--text-muted)", letterSpacing: "0.04em" }}>
          {today ? "오늘 진료" : "최근 진료"}
        </div>
      </div>
    </div>
  );
}

// ── Filter chip ──────────────────────────────────────────────────
function PPChip({ active, onClick, children, count }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 999,
      border: `1px solid ${active ? "var(--jade-500)" : "var(--border-subtle)"}`,
      background: active ? "var(--jade-500)" : "var(--bg-surface)",
      color: active ? "white" : "var(--text-secondary)",
      fontSize: 11.5, fontWeight: active ? 600 : 500, cursor: "pointer",
      fontFamily: "var(--font-sans)", transition: "all 0.12s ease",
    }}>
      {children}
      {count !== undefined && (
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
          padding: "0 5px", borderRadius: 8,
          background: active ? "rgba(255,255,255,0.22)" : "var(--bg-raised)",
          color: active ? "white" : "var(--text-muted)",
        }}>{count}</span>
      )}
    </button>
  );
}

// ── Detail preview (right pane) ──────────────────────────────────
function PPPreview({ patient }) {
  if (!patient) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
        <Icon name="user-search" size={28} style={{ color: "var(--ink-300)", marginBottom: 10 }} />
        <div>좌측 목록에서 환자를 선택하세요.</div>
      </div>
    );
  }
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <Avatar name={patient.name} size={52} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{patient.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{patient.gender} · {patient.age}세 · <span style={{ fontFamily: "var(--font-mono)" }}>{patient.rrn}</span></div>
        </div>
      </div>
      {patient.tags && patient.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {patient.tags.map(t => <PPTag key={t} tag={t} />)}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "차트번호", value: patient.chartNo, mono: true },
          { label: "연락처",   value: patient.phone,   mono: true },
          { label: "주소",     value: patient.address },
          { label: "최근 진료", value: patient.lastVisit, mono: true },
          { label: "주증상",   value: patient.chief },
        ].map(row => (
          <div key={row.label} style={{
            display: "grid", gridTemplateColumns: "70px 1fr", gap: 10,
            padding: "6px 0", borderBottom: "1px dashed var(--border-subtle)",
          }}>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 2 }}>{row.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: row.mono ? "var(--font-mono)" : "var(--font-sans)", lineHeight: 1.5 }}>{row.value}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: "10px 12px", background: "var(--brand-subtle)",
        border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "flex-start", gap: 8,
      }}>
        <Icon name="info" size={13} style={{ color: "var(--text-brand)", marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 11.5, color: "var(--text-brand)", lineHeight: 1.55 }}>
          이 환자로 변경하면 입력 중인 서식 데이터가 새 환자 정보로 자동 갱신됩니다. 진단 내용은 그대로 유지됩니다.
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────
function PatientPickerModal({ currentPatientId, onClose, onSelect }) {
  const [search, setSearch] = useStatePM("");
  const [filter, setFilter] = useStatePM("all"); // all | today | recent7 | vip | jabo | new
  const [pickedId, setPickedId] = useStatePM(currentPatientId);
  const inputRef = useRefPM(null);

  useEffectPM(() => { inputRef.current?.focus(); }, []);
  useEffectPM(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = useMemoPM(() => {
    const q = search.trim();
    return window.PP_PATIENTS.filter(p => {
      if (filter === "today")    { if (p.lastVisit !== window.PP_TODAY_STR) return false; }
      if (filter === "recent7")  { if (p.lastVisit < "2026-05-09") return false; }
      if (filter === "vip")      { if (!p.tags.includes("VIP")) return false; }
      if (filter === "jabo")     { if (!p.tags.includes("자보")) return false; }
      if (filter === "new")      { if (!p.tags.includes("초진")) return false; }
      if (q && !(p.name.includes(q) || p.phone.includes(q) || p.chartNo.includes(q) || p.chief.includes(q))) return false;
      return true;
    });
  }, [search, filter]);

  const counts = useMemoPM(() => ({
    all:     window.PP_PATIENTS.length,
    today:   window.PP_PATIENTS.filter(p => p.lastVisit === window.PP_TODAY_STR).length,
    recent7: window.PP_PATIENTS.filter(p => p.lastVisit >= "2026-05-09").length,
    vip:     window.PP_PATIENTS.filter(p => p.tags.includes("VIP")).length,
    jabo:    window.PP_PATIENTS.filter(p => p.tags.includes("자보")).length,
    new:     window.PP_PATIENTS.filter(p => p.tags.includes("초진")).length,
  }), []);

  const picked = window.PP_PATIENTS.find(p => p.id === pickedId);
  const confirm = () => { if (picked) { onSelect(picked); onClose(); } };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "var(--bg-overlay)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, backdropFilter: "blur(2px)",
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 900, maxWidth: "100%", maxHeight: "84vh",
          background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="user-round-search" size={17} style={{ color: "var(--text-brand)" }} />
              환자 변경
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 }}>
              서식을 발급할 환자를 선택하세요. 더블클릭하면 바로 적용됩니다.
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            cursor: "pointer", padding: 6, borderRadius: 6,
          }}><Icon name="x" size={18} /></button>
        </div>

        {/* Search + filters */}
        <div style={{ padding: "12px 22px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-raised)" }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 · 전화번호 · 차트번호 · 주증상으로 검색"
              style={{
                width: "100%", padding: "9px 12px 9px 34px",
                fontSize: 13, fontFamily: "var(--font-sans)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", outline: "none",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--border-brand)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-default)"}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                padding: 4, display: "flex",
              }}><Icon name="x" size={13} /></button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <PPChip active={filter === "all"}     onClick={() => setFilter("all")}     count={counts.all}>전체</PPChip>
            <PPChip active={filter === "today"}   onClick={() => setFilter("today")}   count={counts.today}>오늘 진료</PPChip>
            <PPChip active={filter === "recent7"} onClick={() => setFilter("recent7")} count={counts.recent7}>최근 7일</PPChip>
            <PPChip active={filter === "new"}     onClick={() => setFilter("new")}     count={counts.new}>초진</PPChip>
            <PPChip active={filter === "vip"}     onClick={() => setFilter("vip")}     count={counts.vip}>VIP</PPChip>
            <PPChip active={filter === "jabo"}    onClick={() => setFilter("jabo")}    count={counts.jabo}>자보</PPChip>
          </div>
        </div>

        {/* Body: list + preview */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid var(--border-subtle)" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 12.5 }}>
                <Icon name="search-x" size={28} style={{ color: "var(--ink-300)", marginBottom: 10 }} />
                <div style={{ fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>검색 결과가 없습니다</div>
                <div>다른 조건으로 검색해 보세요.</div>
              </div>
            ) : (
              filtered.map((p, i) => (
                <div key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <PPRow
                    patient={p}
                    selected={p.id === pickedId}
                    isCurrent={p.id === currentPatientId}
                    onClick={() => setPickedId(p.id)}
                    onPick={() => { onSelect(p); onClose(); }}
                  />
                </div>
              ))
            )}
          </div>
          <div style={{ width: 320, flexShrink: 0, overflowY: "auto", background: "var(--bg-raised)" }}>
            <PPPreview patient={picked} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px", borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-surface)",
        }}>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{filtered.length}</span>명 표시 중
            <span style={{ color: "var(--ink-200)" }}>·</span>
            <span>↑↓ 이동 · Enter 선택 · Esc 닫기</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
            <Button variant="primary" size="sm" icon="check" onClick={confirm} disabled={!picked || picked.id === currentPatientId}>
              이 환자로 변경
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PatientPickerModal = PatientPickerModal;
