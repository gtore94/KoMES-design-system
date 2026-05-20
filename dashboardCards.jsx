// KoMES — 경영 대시보드 shared cards
// 3가지 레이아웃 변형에서 공유하는 카드 컴포넌트들.

const { useState: useStateDB } = React;

// ─── Card shell ────────────────────────────────────────────
function Card({ title, subtitle, icon, action, children, padding = 16, compact, accent }) {
  return (
    <section style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      {(title || icon || action) && (
        <header style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: compact ? "10px 14px 8px" : "14px 16px 10px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          {icon && <Icon name={icon} size={14} style={{ color: "var(--text-secondary)" }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: compact ? 12 : 13, fontWeight: 600, color: "var(--text-primary)",
              fontFamily: "var(--font-sans)", letterSpacing: "0.01em",
            }}>{title}</div>
            {subtitle && (
              <div style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2,
              }}>{subtitle}</div>
            )}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: typeof padding === "number" ? padding : padding, flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </section>
  );
}

// ─── Comparison chip (MoM / YoY) ───────────────────────────
function ComparisonChip({ value, label, size = "sm" }) {
  const up = value >= 0;
  const color = up ? "var(--jade-700)" : "var(--cinnabar-700)";
  const bg   = up ? "var(--jade-50)"  : "var(--cinnabar-100)";
  const border = up ? "var(--jade-200)" : "var(--cinnabar-200)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: size === "lg" ? 12 : 10.5, fontWeight: 600,
      color, background: bg, border: `1px solid ${border}`,
      borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: size === "lg" ? "3px 9px" : "1px 7px",
      fontFamily: "var(--font-sans)",
    }}>
      <Icon name={up ? "trending-up" : "trending-down"} size={size === "lg" ? 12 : 10} />
      {label && <span style={{ fontFamily: "var(--font-sans)" }}>{label}</span>}
      <span style={{ fontFamily: "var(--font-mono)" }}>{up ? "+" : ""}{value.toFixed(1)}%</span>
    </span>
  );
}

// ─── KPI Tile (large) ──────────────────────────────────────
function KPITile({ icon, iconColor, label, value, unit, mom, yoy, sub, spark, sparkColor, size = "md" }) {
  const valueFontSize = size === "lg" ? 32 : size === "sm" ? 20 : 26;
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: size === "sm" ? "12px 14px" : "16px 18px",
      boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column", gap: size === "sm" ? 6 : 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && (
          <span style={{
            width: 28, height: 28, borderRadius: "var(--radius-md)",
            background: `${iconColor || "var(--brand)"}1A`,
            color: iconColor || "var(--brand)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name={icon} size={15} />
          </span>
        )}
        <span style={{
          fontSize: 12, color: "var(--text-secondary)", fontWeight: 500,
          fontFamily: "var(--font-sans)", letterSpacing: "0.01em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          minWidth: 0, flex: 1,
        }}>{label}</span>
        {spark && (
          <span style={{ marginLeft: "auto", flexShrink: 0 }}>
            <Sparkline values={spark} width={64} height={20} color={sparkColor || iconColor || "var(--brand)"} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{
          fontFamily: "var(--font-serif)", fontWeight: 500,
          fontSize: valueFontSize, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1,
        }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {mom !== undefined && <ComparisonChip value={mom} label="전월" />}
        {yoy !== undefined && <ComparisonChip value={yoy} label="전년" />}
        {sub && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{sub}</span>
        )}
      </div>
    </div>
  );
}

// ─── Alert banner row ──────────────────────────────────────
function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{
      display: "flex", gap: 8, padding: "10px 24px", borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)", overflowX: "auto", flexShrink: 0,
    }}>
      {alerts.map((a, i) => {
        const tones = {
          danger: { color: "var(--cinnabar-700)", bg: "var(--cinnabar-100)", border: "var(--cinnabar-200)" },
          warn:   { color: "var(--amber-700)",    bg: "var(--amber-100)",    border: "var(--amber-200)" },
          info:   { color: "var(--text-brand)",   bg: "var(--brand-subtle)", border: "var(--brand-muted)" },
        };
        const t = tones[a.tone] || tones.info;
        return (
          <div key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 10px 6px 12px",
            background: t.bg, border: `1px solid ${t.border}`,
            borderRadius: "var(--radius-full)",
            fontFamily: "var(--font-sans)", fontSize: 12, color: t.color, fontWeight: 500,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <Icon name={a.icon} size={13} />
            {a.text}
            {a.cta && (
              <button style={{
                fontSize: 11, fontWeight: 600, color: t.color, background: "transparent",
                border: `1px solid ${t.color}`, borderRadius: "var(--radius-sm)",
                padding: "1px 8px", cursor: "pointer", fontFamily: "var(--font-sans)", marginLeft: 4,
              }}>{a.cta} →</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── AI Insight card ───────────────────────────────────────
function AIInsightCard({ insight, compact }) {
  const tones = {
    good:  { color: "var(--jade-700)",     bg: "var(--jade-50)",      dot: "var(--jade-500)" },
    warn:  { color: "var(--amber-700)",    bg: "var(--amber-100)",    dot: "var(--amber-500)" },
    alert: { color: "var(--cinnabar-700)", bg: "var(--cinnabar-100)", dot: "var(--cinnabar-500)" },
  };
  const t = tones[insight.tone] || tones.good;
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderLeft: `3px solid ${t.dot}`,
      borderRadius: "var(--radius-md)",
      padding: compact ? "10px 12px" : "12px 14px",
      display: "flex", gap: 10,
      fontFamily: "var(--font-sans)",
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)",
        background: t.bg, color: t.color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={insight.icon} size={14} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{insight.title}</span>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em",
            color: t.color, background: t.bg, padding: "1px 6px", borderRadius: "var(--radius-sm)",
          }}>{insight.tag}</span>
        </div>
        <div style={{ fontSize: compact ? 11 : 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          {insight.body}
        </div>
        {insight.cta && !compact && (
          <button style={{
            marginTop: 8, fontSize: 11, fontWeight: 600,
            color: t.color, background: "transparent",
            border: `1px solid ${t.dot}`, borderRadius: "var(--radius-sm)",
            padding: "2px 9px", cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>{insight.cta} →</button>
        )}
      </div>
    </div>
  );
}

// ─── Insurance claim row ───────────────────────────────────
function InsuranceClaimRow({ row, maxAmount }) {
  const segs = [
    { label: "승인",  value: row.ok,     color: "var(--jade-500)" },
    { label: "보류",  value: row.hold,   color: "var(--amber-500)" },
    { label: "반려",  value: row.reject, color: "var(--cinnabar-500)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: row.color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{row.label}</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          ₩{(row.amount / 10000).toLocaleString("ko-KR")}<span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-muted)" }}>만</span>
        </span>
      </div>
      <StackedRow segs={segs} height={8} />
      <div style={{ display: "flex", gap: 10, fontSize: 10.5, fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
        <span>총 <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{row.total}</strong>건</span>
        <span style={{ color: "var(--jade-700)" }}>승인 {row.ok}</span>
        <span style={{ color: "var(--amber-700)" }}>보류 {row.hold}</span>
        <span style={{ color: "var(--cinnabar-700)" }}>반려 {row.reject}</span>
      </div>
    </div>
  );
}

// ─── Staff performance row ─────────────────────────────────
function StaffRow({ s, maxRevenue, maxPatients, compact }) {
  const trendNum = parseFloat(s.trend);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: compact ? "auto 1fr 64px 90px 60px" : "auto 1fr 80px 130px 80px 60px",
      alignItems: "center", gap: 12,
      padding: compact ? "8px 0" : "10px 0",
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: `${s.color}1A`, color: s.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600,
        }}>{s.name[0]}</span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.role}</div>
        </div>
      </div>
      <div style={{ height: 6, background: "var(--bg-sunken)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
        <div style={{ width: `${(s.revenue / maxRevenue) * 100}%`, height: "100%", background: s.color }} />
      </div>
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", textAlign: "right", fontWeight: 600 }}>
        {s.patients}<span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>명</span>
      </div>
      <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-primary)", textAlign: "right", fontWeight: 600 }}>
        ₩{(s.revenue / 10000).toLocaleString("ko-KR")}<span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>만</span>
      </div>
      {!compact && (
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "right" }}>
          청구 {s.claims}
        </div>
      )}
      <div style={{ textAlign: "right" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 2,
          fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600,
          color: trendNum >= 0 ? "var(--jade-700)" : "var(--cinnabar-700)",
        }}>
          <Icon name={trendNum >= 0 ? "arrow-up-right" : "arrow-down-right"} size={11} />
          {s.trend}%
        </span>
      </div>
    </div>
  );
}

// ─── Period selector ───────────────────────────────────────
function PeriodSelector({ value, onChange }) {
  const options = [
    { key: "today",   label: "오늘" },
    { key: "week",    label: "주" },
    { key: "month",   label: "월" },
    { key: "quarter", label: "분기" },
    { key: "year",    label: "년" },
  ];
  return (
    <div style={{
      display: "inline-flex", background: "var(--bg-raised)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)", padding: 2,
    }}>
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} style={{
          fontSize: 12, fontWeight: 500,
          padding: "4px 12px", borderRadius: "var(--radius-sm)",
          background: value === o.key ? "var(--bg-surface)" : "transparent",
          color: value === o.key ? "var(--text-primary)" : "var(--text-muted)",
          border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
          boxShadow: value === o.key ? "var(--shadow-sm)" : "none",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─── Compare toggle (MoM / YoY) ────────────────────────────
function CompareToggle({ mom, yoy, onChangeMom, onChangeYoy }) {
  const btn = (on, label, onClick) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      padding: "5px 10px", borderRadius: "var(--radius-sm)",
      background: on ? "var(--brand-subtle)" : "var(--bg-surface)",
      border: `1px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
      color: on ? "var(--text-brand)" : "var(--text-secondary)",
      cursor: "pointer", fontFamily: "var(--font-sans)",
    }}>
      <span style={{
        width: 11, height: 11, borderRadius: "var(--radius-xs)",
        border: `1.5px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
        background: on ? "var(--brand)" : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>{on && <Icon name="check" size={7} style={{ color: "var(--text-on-brand)" }} />}</span>
      {label}
    </button>
  );
  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {btn(mom, "MoM 전월", () => onChangeMom(!mom))}
      {btn(yoy, "YoY 전년", () => onChangeYoy(!yoy))}
    </div>
  );
}

// ─── Section header (story 변형용) ─────────────────────────
function SectionHeader({ eyebrow, title, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 0 14px" }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--text-brand)", fontFamily: "var(--font-sans)",
      }}>{eyebrow}</div>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap",
      }}>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500,
          color: "var(--text-primary)", letterSpacing: "-0.01em",
        }}>{title}</h2>
        {hint && (
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{hint}</span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  Card, ComparisonChip, KPITile, AlertBanner, AIInsightCard,
  InsuranceClaimRow, StaffRow, PeriodSelector, CompareToggle, SectionHeader,
});
