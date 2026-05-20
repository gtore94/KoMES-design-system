// 알림 센터 모달 — 규칙 / 히스토리 / 처리 로그
// 우측 슬라이드 드로어, 큰 너비. 권한별 표시:
//   원장 : 모든 탭 + 규칙 편집 가능
//   데스크: 히스토리/로그만 읽기 (규칙 탭 잠금)

const { useState: useStateAC, useMemo: useMemoAC, useEffect: useEffectAC } = React;

// ──────────────────────────────────────────────────────────────
// 공용 유틸
// ──────────────────────────────────────────────────────────────
function sevColor(s) {
  return s === "critical" ? "var(--cinnabar-600)"
       : s === "warning"  ? "var(--amber-500)"
       : "var(--brand)";
}
function sevLabel(s) {
  return s === "critical" ? "긴급" : s === "warning" ? "주의" : "안내";
}
function sevMeta(s) {
  return s === "critical" ? { bg:"var(--status-danger-bg)",  text:"var(--status-danger-text)",  border:"var(--status-danger-border)" }
       : s === "warning"  ? { bg:"var(--status-warning-bg)", text:"var(--status-warning-text)", border:"var(--status-warning-border)" }
       :                    { bg:"var(--brand-subtle)",      text:"var(--text-brand)",          border:"var(--brand-muted)" };
}

function SevPill({ severity, dense }) {
  const m = sevMeta(severity);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: dense ? 9.5 : 10.5, fontWeight: 600,
      padding: dense ? "1px 6px" : "1px 7px",
      borderRadius: "var(--radius-full)",
      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
      fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: sevColor(severity) }} />
      {sevLabel(severity)}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    active:    { bg: "var(--status-danger-bg)",  text: "var(--status-danger-text)",  border: "var(--status-danger-border)",  dot: "var(--cinnabar-600)", label: "활성" },
    resolved:  { bg: "var(--status-success-bg)", text: "var(--status-success-text)", border: "var(--status-success-border)", dot: "var(--brand)",        label: "해결" },
    snoozed:   { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)", border: "var(--status-warning-border)", dot: "var(--amber-500)",    label: "미룸" },
    dismissed: { bg: "var(--status-neutral-bg)", text: "var(--status-neutral-text)", border: "var(--status-neutral-border)", dot: "var(--text-muted)",   label: "해제" },
  };
  const m = map[status] || map.dismissed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10.5, fontWeight: 600, padding: "1px 8px",
      borderRadius: "var(--radius-full)",
      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
      fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

function ActionIcon({ action }) {
  const map = {
    created:     { icon: "plus-circle",   color: "var(--text-brand)" },
    resolved:    { icon: "check-circle-2", color: "var(--brand)" },
    snoozed:     { icon: "clock",         color: "var(--amber-500)" },
    dismissed:   { icon: "x-circle",      color: "var(--text-muted)" },
    assigned:    { icon: "user-plus",     color: "var(--text-secondary)" },
    "rule-edit":   { icon: "settings-2",  color: "var(--text-secondary)" },
    "rule-toggle": { icon: "toggle-left", color: "var(--text-secondary)" },
  };
  const m = map[action] || map.created;
  return <Icon name={m.icon} size={14} style={{ color: m.color }} />;
}

function actionLabel(a) {
  return ({
    created:    "생성됨",
    resolved:   "해결",
    snoozed:    "미루기",
    dismissed:  "해제",
    assigned:   "담당 배정",
    "rule-edit":   "규칙 수정",
    "rule-toggle": "규칙 ON/OFF",
  })[a] || a;
}

// ──────────────────────────────────────────────────────────────
// 토글 (작은 스위치)
// ──────────────────────────────────────────────────────────────
function MiniToggle({ checked, onChange, disabled }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); if (!disabled && onChange) onChange(!checked); }}
      role="switch" aria-checked={checked} disabled={disabled}
      style={{
        position: "relative", width: 34, height: 19, padding: 0,
        borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--brand)" : "var(--stone-400)",
        border: "none", opacity: disabled ? 0.5 : 1,
        transition: "background 0.18s ease", flexShrink: 0,
      }}>
      <span style={{
        position: "absolute", top: 2, left: checked ? 17 : 2,
        width: 15, height: 15, borderRadius: "50%",
        background: "var(--text-on-brand)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.18s ease",
      }} />
    </button>
  );
}

// ──────────────────────────────────────────────────────────────
// 탭 1 — 규칙
// ──────────────────────────────────────────────────────────────
function RulesTab({ canEdit }) {
  const [rules, setRules] = useStateAC(ALERT_RULES);
  const [openId, setOpenId] = useStateAC(null);

  const grouped = useMemoAC(() => {
    const m = {};
    rules.forEach(r => { (m[r.category] = m[r.category] || []).push(r); });
    return m;
  }, [rules]);

  const update = (id, patch) => setRules(prev =>
    prev.map(r => r.id === id ? { ...r, ...patch } : r));

  return (
    <div style={{ padding: "18px 22px 40px" }}>
      {!canEdit && (
        <div style={{
          padding: "10px 14px", marginBottom: 14,
          background: "var(--bg-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}>
          <Icon name="info" size={13} style={{ color: "var(--text-muted)" }} />
          규칙 보기 전용 — 편집은 원장 권한 필요
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-secondary)",
        }}>
          활성 <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {rules.filter(r => r.enabled).length}
          </strong>
          {" / "}
          <span style={{ fontFamily: "var(--font-mono)" }}>{rules.length}</span>
        </div>
        {canEdit && <Button variant="secondary" size="sm" icon="plus">규칙 추가</Button>}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{
            padding: "6px 2px 8px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            color: "var(--text-muted)", textTransform: "uppercase",
            fontFamily: "var(--font-sans)",
          }}>{cat}</div>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}>
            {items.map((r, i) => {
              const isOpen = openId === r.id;
              return (
                <div key={r.id} style={{
                  borderBottom: i < items.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  background: r.enabled ? "transparent" : "var(--bg-raised)",
                  opacity: r.enabled ? 1 : 0.78,
                }}>
                  {/* row */}
                  <div onClick={() => setOpenId(isOpen ? null : r.id)} style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto auto",
                    gap: 12, alignItems: "center",
                    padding: "13px 16px", cursor: "pointer",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "var(--radius-md)",
                      background: sevMeta(r.severity).bg,
                      color: sevMeta(r.severity).text,
                      border: `1px solid ${sevMeta(r.severity).border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name="bell" size={12} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8, marginBottom: 2,
                      }}>
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                          color: "var(--text-primary)",
                        }}>{r.title}</span>
                        <SevPill severity={r.severity} dense />
                      </div>
                      <div style={{
                        fontSize: 11.5, color: "var(--text-secondary)",
                        fontFamily: "var(--font-sans)", lineHeight: 1.45,
                      }}>
                        {r.threshold == null
                          ? r.desc
                          : r.desc.replace("{n}", `${r.threshold}${r.unit}`)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10.5, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)", whiteSpace: "nowrap",
                    }}>
                      {r.lastFired === "—" ? "미발화" : `최근 ${r.lastFired.slice(5, 10)}`}
                    </span>
                    <MiniToggle checked={r.enabled} disabled={!canEdit}
                      onChange={(v) => update(r.id, { enabled: v })} />
                    <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={14}
                      style={{ color: "var(--text-muted)" }} />
                  </div>

                  {/* expanded editor */}
                  {isOpen && (
                    <div style={{
                      padding: "14px 16px 18px 54px",
                      background: "var(--bg-raised)",
                      borderTop: "1px solid var(--border-subtle)",
                    }}>
                      {r.threshold != null && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: 6,
                          }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                              color: "var(--text-muted)", textTransform: "uppercase",
                              fontFamily: "var(--font-sans)",
                            }}>임계값</span>
                            <span style={{
                              fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
                              color: "var(--text-primary)",
                            }}>
                              {r.threshold}<span style={{ color: "var(--text-muted)", marginLeft: 3 }}>{r.unit}</span>
                            </span>
                          </div>
                          <input type="range" min={r.min} max={r.max} value={r.threshold}
                            disabled={!canEdit}
                            onChange={(e) => update(r.id, { threshold: Number(e.target.value) })}
                            style={{ width: "100%", accentColor: "var(--brand)" }} />
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 10, color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)", marginTop: 2,
                          }}>
                            <span>{r.min}{r.unit}</span>
                            <span>{r.max}{r.unit}</span>
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                      }}>
                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                            color: "var(--text-muted)", textTransform: "uppercase",
                            fontFamily: "var(--font-sans)", marginBottom: 6,
                          }}>수신자</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {["원장", "데스크", "한의사"].map(role => {
                              const on = r.receivers.includes(role);
                              return (
                                <button key={role} disabled={!canEdit}
                                  onClick={() => {
                                    const next = on ? r.receivers.filter(x => x !== role)
                                                    : [...r.receivers, role];
                                    update(r.id, { receivers: next });
                                  }}
                                  style={{
                                    padding: "4px 10px", fontSize: 11, fontWeight: 500,
                                    borderRadius: "var(--radius-full)",
                                    background: on ? "var(--brand-subtle)" : "var(--bg-surface)",
                                    color: on ? "var(--text-brand)" : "var(--text-secondary)",
                                    border: `1px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
                                    cursor: canEdit ? "pointer" : "not-allowed",
                                    fontFamily: "var(--font-sans)",
                                    opacity: canEdit ? 1 : 0.6,
                                  }}>{role}</button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                            color: "var(--text-muted)", textTransform: "uppercase",
                            fontFamily: "var(--font-sans)", marginBottom: 6,
                          }}>채널</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {["인앱", "이메일", "SMS"].map(ch => {
                              const on = r.channels.includes(ch);
                              return (
                                <button key={ch} disabled={!canEdit}
                                  onClick={() => {
                                    const next = on ? r.channels.filter(x => x !== ch)
                                                    : [...r.channels, ch];
                                    update(r.id, { channels: next });
                                  }}
                                  style={{
                                    padding: "4px 10px", fontSize: 11, fontWeight: 500,
                                    borderRadius: "var(--radius-full)",
                                    background: on ? "var(--brand-subtle)" : "var(--bg-surface)",
                                    color: on ? "var(--text-brand)" : "var(--text-secondary)",
                                    border: `1px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
                                    cursor: canEdit ? "pointer" : "not-allowed",
                                    fontFamily: "var(--font-sans)",
                                    opacity: canEdit ? 1 : 0.6,
                                  }}>{ch}</button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 14, paddingTop: 12,
                        borderTop: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        fontSize: 11, color: "var(--text-muted)",
                        fontFamily: "var(--font-sans)",
                      }}>
                        <span>
                          최근 발화 ·{" "}
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                            {r.lastFired}
                          </span>
                        </span>
                        {canEdit && (
                          <button style={{
                            border: "none", background: "transparent",
                            color: "var(--text-danger)", cursor: "pointer",
                            fontSize: 11, fontWeight: 500,
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontFamily: "var(--font-sans)",
                          }}>
                            <Icon name="trash-2" size={11} />
                            규칙 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 탭 2 — 히스토리
// ──────────────────────────────────────────────────────────────
function HistoryTab() {
  const [filter, setFilter] = useStateAC("all");
  const [sev, setSev] = useStateAC("all");
  const [query, setQuery] = useStateAC("");

  const filtered = ALERT_HISTORY.filter(h => {
    if (filter !== "all" && h.status !== filter) return false;
    if (sev !== "all" && h.severity !== sev) return false;
    if (query && !h.title.includes(query)) return false;
    return true;
  });

  const counts = ALERT_HISTORY.reduce((m, h) => { m[h.status] = (m[h.status] || 0) + 1; return m; }, {});

  return (
    <div style={{ padding: "18px 22px 40px" }}>
      {/* status filter strip */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap",
        alignItems: "center",
      }}>
        {[
          { k: "all",       l: "전체",  c: ALERT_HISTORY.length },
          { k: "active",    l: "활성",  c: counts.active || 0 },
          { k: "resolved",  l: "해결",  c: counts.resolved || 0 },
          { k: "snoozed",   l: "미룸",  c: counts.snoozed || 0 },
          { k: "dismissed", l: "해제",  c: counts.dismissed || 0 },
        ].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", fontSize: 12, fontWeight: filter === t.k ? 600 : 500,
            background: filter === t.k ? "var(--brand-subtle)" : "var(--bg-surface)",
            color: filter === t.k ? "var(--text-brand)" : "var(--text-secondary)",
            border: `1px solid ${filter === t.k ? "var(--brand)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-full)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
            {t.l}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: filter === t.k ? "var(--text-brand)" : "var(--text-muted)",
            }}>{t.c}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 2,
          padding: 2, background: "var(--bg-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
        }}>
          {[
            { k: "all", l: "모든 등급" },
            { k: "critical", l: "긴급" },
            { k: "warning", l: "주의" },
            { k: "info", l: "안내" },
          ].map(opt => (
            <button key={opt.k} onClick={() => setSev(opt.k)} style={{
              padding: "3px 10px", fontSize: 11, fontWeight: 500,
              background: sev === opt.k ? "var(--bg-surface)" : "transparent",
              color: sev === opt.k ? "var(--text-primary)" : "var(--text-muted)",
              border: sev === opt.k ? "1px solid var(--border-default)" : "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer", fontFamily: "var(--font-sans)",
              boxShadow: sev === opt.k ? "var(--shadow-sm)" : "none",
            }}>{opt.l}</button>
          ))}
        </div>
        <Input placeholder="제목 검색" icon="search"
          value={query} onChange={setQuery} />
      </div>

      {/* table */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden", boxShadow: "var(--shadow-sm)",
      }}>
        <DataTable
          cols={[
            { label: "시점",   mono: true, w: "16%",
              render: (h) => h.ts },
            { label: "등급",   w: "9%",
              render: (h) => <SevPill severity={h.severity} dense /> },
            { label: "제목",   w: "31%",
              render: (h) => <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{h.title}</span> },
            { label: "상태",   w: "10%",
              render: (h) => <StatusPill status={h.status} /> },
            { label: "처리자", key: "actor", w: "12%" },
            { label: "처리 메모", w: "22%",
              render: (h) => h.resolution
                ? <span style={{ color: "var(--text-secondary)" }}>{h.resolution}</span>
                : <span style={{ color: "var(--text-muted)" }}>—</span>
            },
          ]}
          rows={filtered}
        />
        {filtered.length === 0 && (
          <div style={{
            padding: "32px 16px", textAlign: "center",
            color: "var(--text-muted)", fontSize: 12,
            fontFamily: "var(--font-sans)",
          }}>
            조건에 맞는 알림이 없습니다.
          </div>
        )}
      </div>

      <div style={{
        marginTop: 12, fontSize: 11, color: "var(--text-muted)",
        fontFamily: "var(--font-sans)", textAlign: "right",
      }}>
        {filtered.length} 건 · 최근 30일 · 보존 기간 1년
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 탭 3 — 처리 로그 (타임라인)
// ──────────────────────────────────────────────────────────────
function LogTab() {
  const [actorFilter, setActorFilter] = useStateAC("all");
  const [actionFilter, setActionFilter] = useStateAC("all");

  const actors = useMemoAC(() => {
    const s = new Set(ALERT_LOG.map(l => l.actor));
    return ["all", ...Array.from(s)];
  }, []);

  const filtered = ALERT_LOG.filter(l => {
    if (actorFilter !== "all" && l.actor !== actorFilter) return false;
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    return true;
  });

  // Group by date
  const grouped = useMemoAC(() => {
    const m = {};
    filtered.forEach(l => {
      const date = l.ts.slice(0, 10);
      (m[date] = m[date] || []).push(l);
    });
    return m;
  }, [filtered]);

  return (
    <div style={{ padding: "18px 22px 40px" }}>
      <div style={{
        display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          fontSize: 12, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}>
          <Icon name="user" size={12} />
          <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} style={{
            border: "none", background: "transparent", outline: "none",
            fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
          }}>
            {actors.map(a => (
              <option key={a} value={a}>{a === "all" ? "모든 처리자" : a}</option>
            ))}
          </select>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          fontSize: 12, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}>
          <Icon name="filter" size={12} />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={{
            border: "none", background: "transparent", outline: "none",
            fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
          }}>
            <option value="all">모든 액션</option>
            <option value="created">생성</option>
            <option value="resolved">해결</option>
            <option value="snoozed">미루기</option>
            <option value="dismissed">해제</option>
            <option value="assigned">담당 배정</option>
            <option value="rule-edit">규칙 수정</option>
            <option value="rule-toggle">규칙 ON/OFF</option>
          </select>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" icon="download">CSV 내보내기</Button>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 22 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                color: "var(--text-primary)",
                padding: "3px 10px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
              }}>{date}</span>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-muted)",
              }}>{items.length}건</span>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            </div>

            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden", boxShadow: "var(--shadow-sm)",
            }}>
              {items.map((l, i) => (
                <div key={l.id} style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto",
                  gap: 14, alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: i < items.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "var(--radius-full)",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ActionIcon action={l.action} />
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 11.5,
                    color: "var(--text-secondary)", whiteSpace: "nowrap",
                  }}>{l.ts.slice(11)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 2,
                      flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                        color: "var(--text-primary)",
                      }}>{l.actor}</span>
                      {l.role !== "—" && (
                        <span style={{
                          fontSize: 10, color: "var(--text-muted)",
                          fontFamily: "var(--font-sans)",
                        }}>{l.role}</span>
                      )}
                      <span style={{
                        fontSize: 11, color: "var(--text-secondary)",
                        fontFamily: "var(--font-sans)",
                      }}>· {actionLabel(l.action)}</span>
                      <span style={{
                        fontSize: 11, color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)", fontWeight: 500,
                      }}>· {l.targetTitle}</span>
                    </div>
                    {l.detail !== "—" && (
                      <div style={{
                        fontSize: 11.5, color: "var(--text-muted)",
                        fontFamily: "var(--font-sans)", lineHeight: 1.45,
                      }}>{l.detail}</div>
                    )}
                  </div>
                  <button style={{
                    border: "none", background: "transparent",
                    color: "var(--text-muted)", cursor: "pointer",
                    padding: 4, borderRadius: "var(--radius-sm)",
                  }} title="상세 보기">
                    <Icon name="chevron-right" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{
            padding: "44px 16px", textAlign: "center",
            color: "var(--text-muted)", fontSize: 13,
            fontFamily: "var(--font-sans)",
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-lg)",
          }}>
            <Icon name="file-search" size={20} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
            <div>조건에 맞는 처리 로그가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 모달 셸 (우측 드로어)
// ──────────────────────────────────────────────────────────────
function AlertCenterModal({ open, onClose, role, initialTab = "rules" }) {
  const [tab, setTab] = useStateAC(initialTab);
  const canEdit = role === "원장";

  useEffectAC(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  useEffectAC(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tabs = [
    { k: "rules",   l: "자동 규칙",     icon: "settings-2",   locked: !canEdit },
    { k: "history", l: "히스토리",      icon: "list",          locked: false },
    { k: "log",     l: "처리 로그",     icon: "scroll-text",   locked: false },
  ];

  // active rule count for badge
  const activeRules = ALERT_RULES.filter(r => r.enabled).length;
  const activeAlerts = ALERT_HISTORY.filter(h => h.status === "active").length;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--bg-overlay)",
      display: "flex", justifyContent: "flex-end",
      animation: "ac-fade 0.2s ease",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "min(960px, 92vw)", height: "100%",
        background: "var(--bg-page)",
        boxShadow: "var(--shadow-xl)",
        display: "flex", flexDirection: "column",
        animation: "ac-slide 0.22s ease",
      }}>
        {/* Header */}
        <header style={{
          padding: "16px 22px 0",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            paddingBottom: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--radius-md)",
              background: "var(--brand-subtle)", color: "var(--text-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="bell-ring" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500,
                color: "var(--text-primary)", letterSpacing: "-0.01em",
              }}>알림 센터</div>
              <div style={{
                fontSize: 12, color: "var(--text-muted)",
                fontFamily: "var(--font-sans)", marginTop: 2,
              }}>
                활성 알림 <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{activeAlerts}</strong>
                {" · "}
                활성 규칙 <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{activeRules}/{ALERT_RULES.length}</strong>
                {" · "}
                <RoleBadge role={role} />
              </div>
            </div>
            <button onClick={onClose} title="닫기" style={{
              width: 32, height: 32, borderRadius: "var(--radius-md)",
              background: "var(--bg-raised)", color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
              <Icon name="x" size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => {
              const active = tab === t.k;
              return (
                <button key={t.k} onClick={() => setTab(t.k)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? "var(--brand)" : "transparent"}`,
                  marginBottom: -1,
                  color: active ? "var(--text-brand)" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  opacity: t.locked ? 0.75 : 1,
                }}>
                  <Icon name={t.icon} size={13} />
                  {t.l}
                  {t.locked && <Icon name="lock" size={10} style={{ color: "var(--text-muted)" }} />}
                </button>
              );
            })}
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "rules"   && <RulesTab canEdit={canEdit} />}
          {tab === "history" && <HistoryTab />}
          {tab === "log"     && <LogTab />}
        </div>
      </div>
      <style>{`
        @keyframes ac-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ac-slide { from { transform: translateX(20px); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

Object.assign(window, {
  AlertCenterModal,
  // exports for potential reuse:
  SevPill, StatusPill, ActionIcon,
});
