// 병원 관리 — 화면 공통 셸 (실 KoMES 앱용)
// MiniRail 없음 — 실 앱의 Sidebar가 좌측 네비를 담당.

// ──────────────────────────────────────────────────────────────
// 권한 배지 / 잠금 안내
// ──────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === "원장";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: "var(--radius-full)",
      background: isAdmin ? "var(--brand-muted)" : "var(--bg-raised)",
      color: isAdmin ? "var(--text-brand)" : "var(--text-secondary)",
      border: `1px solid ${isAdmin ? "var(--brand)" : "var(--border-default)"}`,
      fontFamily: "var(--font-sans)",
    }}>
      <Icon name={isAdmin ? "shield-check" : "user-round"} size={11} />
      {role} 권한
    </span>
  );
}

function LockedNote() {
  return (
    <div style={{
      padding: "24px 20px", textAlign: "center",
      background: "var(--bg-raised)",
    }}>
      <Icon name="lock" size={16} style={{ color: "var(--text-muted)", marginBottom: 6 }} />
      <div style={{
        fontSize: 12.5, color: "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
      }}>
        이 영역은 <strong style={{ color: "var(--text-primary)" }}>원장 권한</strong>이 있는 계정에서만 편집할 수 있습니다.
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 섹션 카드 셸
// ──────────────────────────────────────────────────────────────
function SectionCard({ title, hint, icon, perm, actions, children, anchor, dense }) {
  const locked = perm === "locked";
  const ro = perm === "read";
  return (
    <section id={anchor} data-section-card style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
    }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: dense ? "11px 16px" : "15px 18px",
        borderBottom: "1px solid var(--border-subtle)",
        background: locked ? "var(--bg-raised)" : "transparent",
      }}>
        {icon && (
          <div style={{
            width: 28, height: 28, borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--brand-subtle)", color: "var(--text-brand)",
            flexShrink: 0,
          }}>
            <Icon name={icon} size={15} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: dense ? 15 : 17, fontWeight: 500,
            color: "var(--text-primary)", letterSpacing: "-0.005em",
          }}>{title}</div>
          {hint && (
            <div style={{
              fontSize: 11.5, color: "var(--text-muted)",
              marginTop: 2, fontFamily: "var(--font-sans)",
            }}>{hint}</div>
          )}
        </div>
        {ro && <Badge variant="neutral">읽기 전용</Badge>}
        {locked && <Badge variant="warning">권한 필요</Badge>}
        {!locked && !ro && actions}
      </header>
      {locked ? <LockedNote /> : <div>{children}</div>}
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// 필드 표시 헬퍼
// ──────────────────────────────────────────────────────────────
function FieldGrid({ children, cols = 2, pad = 18 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: "16px 28px",
      padding: pad,
    }}>{children}</div>
  );
}

function Field({ label, value, mono, hint, badge, full }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      gridColumn: full ? "1 / -1" : undefined,
      minWidth: 0,
    }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
        color: "var(--text-muted)", textTransform: "uppercase",
        fontFamily: "var(--font-sans)",
      }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{
          fontSize: 14, color: "var(--text-primary)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontWeight: 500,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</span>
        {badge}
      </div>
      {hint && (
        <span style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "var(--font-sans)",
        }}>{hint}</span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 알림 배너 — 만료/미연동/백업 경고/점검 중 등
// ──────────────────────────────────────────────────────────────
const SEVERITY_META = {
  critical: {
    bg:    "var(--status-danger-bg)",
    text:  "var(--status-danger-text)",
    border:"var(--status-danger-border)",
    dot:   "var(--cinnabar-600)",
  },
  warning: {
    bg:    "var(--status-warning-bg)",
    text:  "var(--status-warning-text)",
    border:"var(--status-warning-border)",
    dot:   "var(--amber-500)",
  },
  info: {
    bg:    "var(--brand-subtle)",
    text:  "var(--text-brand)",
    border:"var(--brand-muted)",
    dot:   "var(--brand)",
  },
};

function severityRank(s) { return s === "critical" ? 0 : s === "warning" ? 1 : 2; }

function AlertRow({ alert, role, onJump, onDismiss, dense }) {
  const meta = SEVERITY_META[alert.severity] || SEVERITY_META.info;
  const targetPerm = alert.jump ? permFor(role, alert.jump) : null;
  const ctaDisabled = targetPerm === "locked";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr auto auto",
      gap: 12, alignItems: "center",
      padding: dense ? "9px 14px" : "11px 14px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-md)",
        background: meta.bg, color: meta.text,
        border: `1px solid ${meta.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={alert.icon || "info"} size={13} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 1,
        }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{alert.title}</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 600,
            padding: "1px 7px", borderRadius: "var(--radius-full)",
            background: meta.bg, color: meta.text,
            border: `1px solid ${meta.border}`,
            fontFamily: "var(--font-sans)",
            flexShrink: 0,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot }} />
            {alert.severity === "critical" ? "긴급" : alert.severity === "warning" ? "주의" : "안내"}
          </span>
        </div>
        <div style={{
          fontSize: 11.5, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)", lineHeight: 1.45,
        }}>{alert.body}</div>
      </div>
      {alert.jump && (
        ctaDisabled ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 500, color: "var(--text-muted)",
            fontFamily: "var(--font-sans)",
            padding: "4px 8px",
          }}>
            <Icon name="lock" size={11} />
            권한 필요
          </span>
        ) : (
          <button onClick={() => onJump && onJump(alert.jump)} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, fontWeight: 600, color: "var(--text-brand)",
            background: "transparent", border: "none",
            cursor: "pointer", padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          }}>
            {alert.cta || "이동"}
            <Icon name="arrow-right" size={12} />
          </button>
        )
      )}
      <button onClick={() => onDismiss && onDismiss(alert.id)} title="알림 닫기" style={{
        width: 24, height: 24, display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        background: "transparent", border: "none", cursor: "pointer",
        color: "var(--text-muted)", borderRadius: "var(--radius-sm)",
      }}>
        <Icon name="x" size={13} />
      </button>
    </div>
  );
}

function NotificationBanner({ alerts, role, onJump, onOpenSettings, onOpenHistory }) {
  const [dismissed, setDismissed] = React.useState(() => new Set());
  const [expanded, setExpanded] = React.useState(false);

  const visible = alerts
    .filter(a => !dismissed.has(a.id))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  if (visible.length === 0) return null;

  const collapsedLimit = 2;
  const showAll = expanded || visible.length <= collapsedLimit;
  const shown = showAll ? visible : visible.slice(0, collapsedLimit);

  const counts = visible.reduce((m, a) => {
    m[a.severity] = (m[a.severity] || 0) + 1; return m;
  }, {});

  const dismiss = (id) => setDismissed(prev => {
    const s = new Set(prev); s.add(id); return s;
  });
  const dismissAll = () => setDismissed(new Set(alerts.map(a => a.id)));

  return (
    <section data-clinic-alerts style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      marginBottom: 18,
    }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px",
        background: "var(--bg-raised)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: "var(--radius-sm)",
          background: counts.critical ? "var(--status-danger-bg)" :
                      counts.warning  ? "var(--status-warning-bg)" :
                                        "var(--brand-subtle)",
          color:    counts.critical ? "var(--status-danger-text)" :
                    counts.warning  ? "var(--status-warning-text)" :
                                      "var(--text-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="bell" size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8,
          }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600,
              color: "var(--text-primary)",
            }}>
              알림 · {visible.length}건
            </span>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 11,
              color: "var(--text-muted)",
              display: "inline-flex", gap: 8,
            }}>
              {counts.critical > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cinnabar-600)" }} />
                  긴급 {counts.critical}
                </span>
              )}
              {counts.warning > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber-500)" }} />
                  주의 {counts.warning}
                </span>
              )}
              {counts.info > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)" }} />
                  안내 {counts.info}
                </span>
              )}
            </span>
          </div>
        </div>
        {visible.length > collapsedLimit && (
          <button onClick={() => setExpanded(e => !e)} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, fontWeight: 500, color: "var(--text-secondary)",
            background: "transparent", border: "none", cursor: "pointer",
            padding: "4px 8px", borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-sans)",
          }}>
            {expanded ? "접기" : `+${visible.length - collapsedLimit}개 더보기`}
            <Icon name={expanded ? "chevron-up" : "chevron-down"} size={12} />
          </button>
        )}
        {onOpenHistory && (
          <button onClick={onOpenHistory} title="히스토리" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, fontWeight: 500, color: "var(--text-secondary)",
            background: "transparent", border: "none", cursor: "pointer",
            padding: "4px 8px", borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-sans)",
          }}>
            <Icon name="list" size={12} />
            히스토리
          </button>
        )}
        {onOpenSettings && (
          <button onClick={onOpenSettings} title="알림 규칙 설정" style={{
            width: 26, height: 26, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--text-muted)", borderRadius: "var(--radius-sm)",
          }}>
            <Icon name="settings-2" size={13} />
          </button>
        )}
        <button onClick={dismissAll} title="모두 닫기" style={{
          fontSize: 11, color: "var(--text-muted)",
          background: "transparent", border: "none", cursor: "pointer",
          padding: "4px 6px", fontFamily: "var(--font-sans)",
        }}>
          모두 닫기
        </button>
      </header>
      <div>
        {shown.map(a => (
          <AlertRow key={a.id} alert={a} role={role}
            onJump={onJump} onDismiss={dismiss} />
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────
// 데이터 테이블
// ──────────────────────────────────────────────────────────────
const tHead = {
  padding: "9px 14px",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "var(--text-muted)",
  borderBottom: "1px solid var(--border-subtle)",
  textAlign: "left", fontFamily: "var(--font-sans)",
  background: "var(--bg-raised)",
};
const tCell = {
  padding: "10px 14px", fontSize: 13, color: "var(--text-primary)",
  borderBottom: "1px solid var(--border-subtle)",
  fontFamily: "var(--font-sans)",
};
const tCellMono = { ...tCell, fontFamily: "var(--font-mono)" };

function DataTable({ cols, rows }) {
  return (
    <div style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{cols.map((c,i)=>(
          <th key={i} style={{ ...tHead, textAlign: c.align || "left", width: c.w }}>{c.label}</th>
        ))}</tr></thead>
        <tbody>
          {rows.map((r,ri)=>(
            <tr key={ri}>
              {cols.map((c,ci)=>(
                <td key={ci} style={{
                  ...(c.mono ? tCellMono : tCell),
                  textAlign: c.align || "left",
                }}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, {
  RoleBadge, LockedNote, SectionCard,
  FieldGrid, Field, DataTable,
  AlertRow, NotificationBanner, SEVERITY_META,
  tHead, tCell, tCellMono,
});
