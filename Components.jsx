// KoMES UI Kit — Shared Components
// Exported to window for use in index.html

const { useState, useRef, useEffect } = React;

// ── Icons (Lucide via CDN) ──────────────────────────────────────
function Icon({ name, size = 16, style = {}, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) window.lucide.createIcons({ nodes: [ref.current] });
  }, [name]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", ...style }} className={className}>
    <i data-lucide={name} style={{ width: size, height: size }}></i>
  </span>;
}

// ── Avatar ──────────────────────────────────────────────────────
function Avatar({ name, size = 28 }) {
  const char = name ? name[0] : "?";
  return <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "var(--jade-200)", color: "var(--jade-700)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
    fontFamily: "var(--font-sans)"
  }}>{char}</div>;
}

// ── Badge ───────────────────────────────────────────────────────
function Badge({ variant = "neutral", children }) {
  const styles = {
    success: { background: "var(--status-success-bg)", color: "var(--status-success-text)", border: "1px solid var(--status-success-border)" },
    warning: { background: "var(--status-warning-bg)", color: "var(--status-warning-text)", border: "1px solid var(--status-warning-border)" },
    danger:  { background: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  border: "1px solid var(--status-danger-border)" },
    neutral: { background: "var(--status-neutral-bg)", color: "var(--status-neutral-text)", border: "1px solid var(--status-neutral-border)" },
    brand:   { background: "var(--jade-50)", color: "var(--jade-700)", border: "1px solid var(--jade-200)" },
  };
  return <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 500, padding: "2px 8px",
    borderRadius: "var(--radius-full)", ...styles[variant],
    fontFamily: "var(--font-sans)"
  }}>{children}</span>;
}

// ── Button ──────────────────────────────────────────────────────
function Button({ variant = "primary", size = "md", onClick, children, disabled, icon }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "var(--font-sans)", fontWeight: 500, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
    transition: "all 0.12s ease", letterSpacing: "0.01em", whiteSpace: "nowrap"
  };
  const sizes = {
    sm: { fontSize: 11, padding: "5px 11px", borderRadius: "var(--radius-sm)" },
    md: { fontSize: 13, padding: "8px 16px", borderRadius: "var(--radius-md)" },
  };
  const variants = {
    primary:   { background: "var(--jade-500)", color: "white", boxShadow: "var(--shadow-sm)" },
    secondary: { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" },
    ghost:     { background: "transparent", color: "var(--jade-700)" },
    danger:    { background: "var(--cinnabar-600)", color: "white" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant] }}>
    {icon && <Icon name={icon} size={13} />}
    {children}
  </button>;
}

// ── Input ───────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text", hint, error, icon }) {
  const [focused, setFocused] = useState(false);
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
        <Icon name={icon} size={14} />
      </span>}
      <input type={type} value={value} onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
          background: "var(--bg-surface)", border: `1px solid ${error ? "var(--border-danger)" : focused ? "var(--border-brand)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)", padding: icon ? "7px 10px 7px 30px" : "7px 10px",
          outline: "none", width: "100%", boxShadow: focused ? "0 0 0 3px var(--jade-100)" : "none",
          transition: "all 0.12s ease", boxSizing: "border-box"
        }} />
    </div>
    {error && <span style={{ fontSize: 11, color: "var(--text-danger)", fontFamily: "var(--font-sans)" }}>{error}</span>}
    {hint && !error && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{hint}</span>}
  </div>;
}

// ── Sidebar ─────────────────────────────────────────────────────
function Sidebar({ activeScreen, onNavigate }) {
  const [collapsed, setCollapsed] = React.useState(false);

  const navGroups = [
    { label: "진료", items: [
      { key: "patients", icon: "layout-dashboard", label: "진료 현황" },
      { key: "registry", icon: "users",            label: "환자 관리" },
      { key: "schedule", icon: "calendar",          label: "예약 관리" },
      { key: "payment",  icon: "credit-card",       label: "수납" },
    ]},
    { label: "청구", items: [
      { key: "claim",    icon: "file-text",         label: "보험 청구" },
    ]},
    { label: "처방", items: [
      { key: "prescriptions", icon: "flask-conical", label: "처방 관리" },
      { key: "inventory",     icon: "package",        label: "약재 재고" },
    ]},
    { label: "비품/운영", items: [
      { key: "supplies", icon: "boxes",          label: "소모품" },
      { key: "orders",   icon: "clipboard-list", label: "발주 이력" },
    ]},
    { label: "분석", items: [
      { key: "stats", icon: "bar-chart-2", label: "통계" },
      { key: "ai",    icon: "sparkles",    label: "AI 분석" },
    ]},
  ];

  const navItem = (key, icon, label, isActive) => (
    <div key={key} onClick={() => onNavigate(key)} title={collapsed ? label : undefined}
      style={{
        display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 8, padding: collapsed ? "8px 0" : "7px 8px",
        borderRadius: "var(--radius-md)", cursor: "pointer",
        background: isActive ? "var(--jade-600)" : "transparent",
        color: isActive ? "white" : "var(--ink-200)",
        fontSize: 13, fontWeight: isActive ? 500 : 400,
        transition: "background 0.12s ease, color 0.12s ease", fontFamily: "var(--font-sans)",
      }}>
      <Icon name={icon} size={15} />
      {!collapsed && label}
    </div>
  );

  return <div style={{
    width: collapsed ? 56 : 220, background: "var(--ink-800)",
    display: "flex", flexDirection: "column", flexShrink: 0, height: "100%",
    transition: "width 0.2s ease", overflow: "hidden",
  }}>
    {collapsed ? (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: "var(--jade-500)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "white" }}>K</span>
        </div>
        <div onClick={() => setCollapsed(false)} style={{ cursor: "pointer", color: "var(--ink-300)", display: "flex", alignItems: "center", padding: 2, borderRadius: "var(--radius-sm)" }}>
          <Icon name="chevron-right" size={13} />
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "var(--jade-500)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "white" }}>K</span>
          </div>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 400, color: "var(--stone-50)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>KoMES</span>
        </div>
        <div onClick={() => setCollapsed(true)} style={{ cursor: "pointer", color: "var(--ink-300)", display: "flex", alignItems: "center", padding: 3, borderRadius: "var(--radius-sm)" }}>
          <Icon name="chevron-left" size={13} />
        </div>
      </div>
    )}

    {navGroups.map(g => (
      <div key={g.label} style={{ padding: collapsed ? "10px 4px 2px" : "10px 8px 2px" }}>
        {!collapsed && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-300)", textTransform: "uppercase", padding: "0 6px", marginBottom: 3 }}>{g.label}</div>}
        {g.items.map(item => navItem(item.key, item.icon, item.label, activeScreen === item.key))}
      </div>
    ))}

    <div style={{ padding: collapsed ? "10px 4px 2px" : "10px 8px 2px" }}>
      {navItem("settings", "settings", "설정", activeScreen === "settings")}
    </div>

    <div style={{ marginTop: "auto", padding: collapsed ? "10px 4px" : "10px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 8, padding: "6px 6px", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
        <Avatar name="김" size={26} />
        {!collapsed && <>
          <div>
            <div style={{ fontSize: 12, color: "var(--stone-100)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>김민준</div>
            <div style={{ fontSize: 10, color: "var(--ink-300)", fontFamily: "var(--font-sans)" }}>원장</div>
          </div>
          <Icon name="chevrons-up-down" size={13} style={{ marginLeft: "auto", color: "var(--ink-300)" }} />
        </>}
      </div>
    </div>
  </div>;
}

// ── TopBar ──────────────────────────────────────────────────────
function TopBar({ title, subtitle, actions }) {
  return <div style={{
    height: 54, background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
    display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{subtitle}</div>}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {actions}
      <div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 4px" }}></div>
      <Icon name="bell" size={17} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
    </div>
  </div>;
}

// Export everything
Object.assign(window, { Icon, Avatar, Badge, Button, Input, Sidebar, TopBar });
