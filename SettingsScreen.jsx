// KoMES — Settings (테마 전환 포함)
const { useState: useStateSet, useEffect: useEffectSet } = React;

/* ────────────────────────────────────────────────────────────
   Theme application — global helper
   `data-theme` on <html> drives all token overrides in index.html.
   ──────────────────────────────────────────────────────────── */
const THEME_STORAGE_KEY = "komes_theme";
const THEME_COLOR_KEY   = "komes_color";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "auto") {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }
  root.setAttribute("data-theme-pref", theme);
}

function applyColor(color) {
  if (color && color !== "jade") {
    document.documentElement.setAttribute("data-color", color);
  } else {
    document.documentElement.removeAttribute("data-color");
  }
}

// Init on first load (idempotent)
(function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  applyTheme(saved);
  applyColor(localStorage.getItem(THEME_COLOR_KEY) || "jade");
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener && mq.addEventListener("change", () => {
      if ((localStorage.getItem(THEME_STORAGE_KEY) || "light") === "auto") applyTheme("auto");
    });
  }
})();

/* ────────────────────────────────────────────────────────────
   Reusable settings primitives
   ──────────────────────────────────────────────────────────── */
function SettingsSection({ title, description, children }) {
  return (
    <section style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      marginBottom: 20,
      overflow: "hidden",
    }}>
      <header style={{
        padding: "18px 22px 14px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500,
          color: "var(--text-primary)", letterSpacing: "-0.005em",
        }}>{title}</div>
        {description && (
          <div style={{
            fontSize: 12, color: "var(--text-muted)",
            fontFamily: "var(--font-sans)", marginTop: 3, lineHeight: 1.5,
          }}>{description}</div>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, hint, control, alignTop }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(180px, 240px) 1fr",
      gap: 24,
      padding: "16px 22px",
      borderBottom: "1px solid var(--border-subtle)",
      alignItems: alignTop ? "flex-start" : "center",
    }}>
      <div>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
        }}>{label}</div>
        {hint && (
          <div style={{
            fontSize: 11.5, color: "var(--text-muted)",
            fontFamily: "var(--font-sans)", marginTop: 3, lineHeight: 1.5,
          }}>{hint}</div>
        )}
      </div>
      <div>{control}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Theme picker — three swatch cards
   ──────────────────────────────────────────────────────────── */
function ThemeCard({ value, label, hint, active, onSelect, preview }) {
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        gap: 10, padding: 12,
        background: "var(--bg-surface)",
        border: `1.5px solid ${active ? "var(--border-brand)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: active ? "0 0 0 3px var(--brand-subtle)" : "none",
        cursor: "pointer", textAlign: "left",
        fontFamily: "var(--font-sans)",
        transition: "all 0.14s ease",
        minWidth: 0,
      }}>
      {/* Mini preview */}
      <div className={preview.className} style={{
        height: 100, borderRadius: "var(--radius-md)",
        background: preview.bg,
        border: `1px solid ${preview.border}`,
        padding: 10, display: "flex", flexDirection: "column", gap: 6,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: preview.dot1 }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: preview.dot2 }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: preview.dot3 }} />
        </div>
        <div style={{
          height: 8, width: "70%", background: preview.line1, borderRadius: 2,
        }} />
        <div style={{
          height: 6, width: "45%", background: preview.line2, borderRadius: 2,
        }} />
        <div style={{
          marginTop: "auto", display: "flex", gap: 5,
        }}>
          <span style={{
            fontSize: 9, padding: "2px 7px", borderRadius: 999,
            background: preview.pill, color: preview.pillText,
            fontFamily: "var(--font-mono)", fontWeight: 600,
          }}>처방</span>
          <span style={{
            fontSize: 9, padding: "2px 7px", borderRadius: 999,
            border: `1px solid ${preview.border}`,
            color: preview.line1,
            fontFamily: "var(--font-mono)", fontWeight: 500,
          }}>대기</span>
        </div>
      </div>

      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          border: `1.5px solid ${active ? "var(--brand)" : "var(--border-default)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {active && <span style={{
            width: 7, height: 7, borderRadius: "50%", background: "var(--brand)",
          }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
          }}>{label}</div>
          <div style={{
            fontSize: 11, color: "var(--text-muted)", marginTop: 1,
          }}>{hint}</div>
        </div>
      </div>
    </button>
  );
}

const THEME_PREVIEWS = {
  light: {
    className: "theme-preview-light",
    bg: "var(--bg-page)", border: "var(--border-subtle)",
    dot1: "var(--text-danger)", dot2: "var(--amber-500)", dot3: "var(--brand)",
    line1: "var(--text-primary)", line2: "var(--text-muted)",
    pill: "var(--brand-muted)", pillText: "var(--text-brand)",
  },
  dark: {
    className: "theme-preview-dark",
    bg: "var(--bg-page)", border: "var(--border-subtle)",
    dot1: "var(--text-danger)", dot2: "var(--amber-400)", dot3: "var(--brand)",
    line1: "var(--text-primary)", line2: "var(--text-muted)",
    pill: "var(--brand-muted)", pillText: "var(--text-brand)",
  },
  auto: {
    className: "theme-preview-auto",
    bg: "linear-gradient(120deg, var(--theme-preview-light-bg) 0%, var(--theme-preview-light-bg) 48%, var(--theme-preview-dark-bg) 52%, var(--theme-preview-dark-bg) 100%)",
    border: "var(--theme-preview-border)",
    dot1: "var(--cinnabar-600)", dot2: "var(--amber-500)", dot3: "var(--brand)",
    line1: "var(--text-muted)", line2: "var(--text-muted)",
    pill: "var(--brand-muted)", pillText: "var(--brand)",
  },
};

const COLOR_PREVIEWS = {
  jade: {
    className: "color-preview-jade",
    bg: "var(--jade-100)", border: "var(--jade-300)",
    dot1: "var(--text-brand)", dot2: "var(--brand)", dot3: "var(--jade-200)",
    line1: "var(--text-brand)", line2: "var(--brand)",
    pill: "var(--brand)", pillText: "var(--stone-50)",
  },
  navy: {
    bg: "var(--navy-100)", border: "var(--navy-300)",
    dot1: "var(--navy-700)", dot2: "var(--navy-500)", dot3: "var(--navy-300)",
    line1: "var(--navy-700)", line2: "var(--navy-400)",
    pill: "var(--navy-500)", pillText: "var(--navy-50)",
  },
  pink: {
    className: "color-preview-pink",
    bg: "var(--jade-100)", border: "var(--jade-300)",
    dot1: "var(--text-brand)", dot2: "var(--brand)", dot3: "var(--jade-200)",
    line1: "var(--text-brand)", line2: "var(--brand)",
    pill: "var(--brand)", pillText: "var(--stone-50)",
  },
};

/* ────────────────────────────────────────────────────────────
   Toggle (used for several boolean prefs)
   ──────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)}
      role="switch" aria-checked={checked}
      style={{
        position: "relative",
        width: 38, height: 22, padding: 0,
        borderRadius: 999, cursor: "pointer",
        background: checked ? "var(--brand)" : "var(--stone-300)",
        border: "none",
        transition: "background 0.18s ease",
        flexShrink: 0,
      }}>
      <span style={{
        position: "absolute", top: 2,
        left: checked ? 18 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: "var(--text-on-brand)",
        boxShadow: "0 1px 3px rgba(var(--ink-900-rgb), 0.20)",
        transition: "left 0.18s ease",
      }} />
    </button>
  );
}

function SegBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px",
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
      background: active ? "var(--bg-surface)" : "transparent",
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      border: active ? "1px solid var(--border-default)" : "1px solid transparent",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      boxShadow: active ? "var(--shadow-sm)" : "none",
    }}>{children}</button>
  );
}

function SegGroup({ value, onChange, options }) {
  return (
    <div style={{
      display: "inline-flex", gap: 2, padding: 3,
      background: "var(--bg-raised)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-subtle)",
    }}>
      {options.map(opt => (
        <SegBtn key={opt.value} active={value === opt.value} onClick={() => onChange(opt.value)}>
          {opt.label}
        </SegBtn>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main screen
   ──────────────────────────────────────────────────────────── */
function SettingsScreen() {
  const [tab, setTab] = useStateSet("appearance"); // appearance | general | account
  const [theme, setTheme] = useStateSet(() => localStorage.getItem(THEME_STORAGE_KEY) || "light");
  const [color, setColor] = useStateSet(() => localStorage.getItem(THEME_COLOR_KEY) || "jade");
  const [density, setDensity] = useStateSet(() => localStorage.getItem("komes_density") || "comfortable");
  const [fontSize, setFontSize] = useStateSet(() => localStorage.getItem("komes_font_size") || "default");
  const [reduceMotion, setReduceMotion] = useStateSet(() => localStorage.getItem("komes_reduce_motion") === "true");

  // Apply + persist
  useEffectSet(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  useEffectSet(() => {
    localStorage.setItem(THEME_COLOR_KEY, color);
    applyColor(color);
  }, [color]);

  useEffectSet(() => {
    localStorage.setItem("komes_density", density);
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  useEffectSet(() => {
    localStorage.setItem("komes_font_size", fontSize);
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  useEffectSet(() => {
    localStorage.setItem("komes_reduce_motion", String(reduceMotion));
    document.documentElement.setAttribute("data-reduce-motion", String(reduceMotion));
  }, [reduceMotion]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="설정"
        subtitle="외관, 일반 환경, 계정 정보를 관리합니다"
        actions={null}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Settings sidebar */}
        <aside style={{
          width: 200, flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          padding: "20px 12px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            color: "var(--text-muted)", textTransform: "uppercase",
            padding: "0 10px 8px",
          }}>설정</div>
          {[
            { key: "appearance", icon: "palette",   label: "외관" },
            { key: "general",    icon: "sliders-horizontal", label: "일반" },
            { key: "account",    icon: "user",      label: "계정" },
            { key: "clinic",     icon: "building-2", label: "한의원 정보" },
            { key: "billing",    icon: "receipt",   label: "청구 환경" },
            { key: "shortcuts",  icon: "command",   label: "단축키" },
          ].map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "8px 10px",
              border: "none", background: tab === item.key ? "var(--brand-subtle)" : "transparent",
              color: tab === item.key ? "var(--text-brand)" : "var(--text-secondary)",
              fontFamily: "var(--font-sans)", fontSize: 13,
              fontWeight: tab === item.key ? 600 : 400,
              borderRadius: "var(--radius-md)",
              cursor: "pointer", marginBottom: 2,
              textAlign: "left",
            }}>
              <Icon name={item.icon} size={14} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 36px 60px" }}>
          <div style={{ maxWidth: 820 }}>

            {tab === "appearance" && (
              <>
                <SettingsSection
                  title="테마"
                  description="모드와 색상을 독립적으로 선택합니다. 변경은 즉시 반영됩니다.">
                  <div style={{ padding: "18px 22px 20px" }}>

                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "var(--text-muted)",
                      marginBottom: 10,
                    }}>모드</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      <ThemeCard value="light" label="라이트" hint="기본 한지 톤"
                        active={theme === "light"} onSelect={setTheme}
                        preview={THEME_PREVIEWS.light} />
                      <ThemeCard value="dark" label="다크" hint="야간 진료·당직용"
                        active={theme === "dark"} onSelect={setTheme}
                        preview={THEME_PREVIEWS.dark} />
                      <ThemeCard value="auto" label="시스템" hint="OS 설정을 따름"
                        active={theme === "auto"} onSelect={setTheme}
                        preview={THEME_PREVIEWS.auto} />
                    </div>

                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "var(--text-muted)",
                      marginTop: 20, marginBottom: 10,
                    }}>색상</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      <ThemeCard value="jade" label="재이드" hint="클래식 한의 톤"
                        active={color === "jade"} onSelect={setColor}
                        preview={COLOR_PREVIEWS.jade} />
                      <ThemeCard value="navy" label="네이비" hint="청색 브랜드 톤"
                        active={color === "navy"} onSelect={setColor}
                        preview={COLOR_PREVIEWS.navy} />
                      <ThemeCard value="pink" label="핑크" hint="벚꽃 톤"
                        active={color === "pink"} onSelect={setColor}
                        preview={COLOR_PREVIEWS.pink} />
                    </div>

                    <div style={{
                      marginTop: 18, padding: "10px 14px",
                      background: "var(--brand-subtle)",
                      border: "1px solid var(--brand-muted)",
                      borderRadius: "var(--radius-md)",
                      display: "flex", alignItems: "center", gap: 10,
                      fontSize: 12, color: "var(--text-brand)",
                      fontFamily: "var(--font-sans)",
                    }}>
                      <Icon name="info" size={14} />
                      현재 적용: <strong style={{ fontWeight: 600 }}>{
                        theme === "light" ? "라이트" :
                        theme === "dark" ? "다크" : "시스템 자동"
                      }</strong>
                      {" · "}
                      <strong style={{ fontWeight: 600 }}>{
                        color === "navy" ? "네이비" :
                        color === "pink" ? "핑크" :
                        "재이드"
                      }</strong>
                      <span style={{
                        marginLeft: "auto", fontFamily: "var(--font-mono)",
                        fontSize: 11, opacity: 0.75,
                      }}>data-theme={theme}{color !== "jade" ? ` · ${color}` : ""}</span>
                    </div>
                  </div>
                </SettingsSection>

                <SettingsSection title="레이아웃" description="목록·테이블 행 간격과 글자 크기를 조정합니다.">
                  <Row
                    label="화면 밀도"
                    hint="진료 현황·환자 목록의 행 높이에 적용됩니다"
                    control={
                      <SegGroup value={density} onChange={setDensity} options={[
                        { value: "compact",     label: "조밀" },
                        { value: "comfortable", label: "기본" },
                        { value: "spacious",    label: "넉넉" },
                      ]} />
                    } />
                  <Row
                    label="글자 크기"
                    hint="본문 텍스트 기준 — 차트·처방 화면 모두에 적용"
                    control={
                      <SegGroup value={fontSize} onChange={setFontSize} options={[
                        { value: "small",   label: "작게" },
                        { value: "default", label: "기본" },
                        { value: "large",   label: "크게" },
                      ]} />
                    } />
                  <Row
                    label="모션 줄이기"
                    hint="화면 전환·애니메이션 효과를 최소화합니다"
                    control={
                      <Toggle checked={reduceMotion} onChange={setReduceMotion} />
                    } />
                </SettingsSection>
              </>
            )}

            {tab !== "appearance" && (
              <SettingsSection title={({
                general: "일반", account: "계정", clinic: "한의원 정보",
                billing: "청구 환경", shortcuts: "단축키",
              })[tab]} description="이 화면은 준비 중입니다.">
                <div style={{
                  padding: "44px 22px", textAlign: "center",
                  color: "var(--text-muted)", fontSize: 13,
                  fontFamily: "var(--font-sans)",
                }}>
                  <Icon name="construction" size={28} style={{ color: "var(--text-muted)", marginBottom: 10 }} />
                  <div>곧 제공될 예정입니다.</div>
                </div>
              </SettingsSection>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen, applyTheme });
