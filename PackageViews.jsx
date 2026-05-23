// KoMES — 패키지 카탈로그·등록 환자 뷰 + 상세 모달
const { useState: useStatePkgV, useMemo: useMemoPkgV } = React;

// ── Catalog Card Grid ───────────────────────────────────────────────
function CatalogGrid({ rows, onSelect }) {
  if (rows.length === 0) {
    return (
      <div style={{
        padding: "60px 20px", textAlign: "center",
        color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)",
        background: "var(--bg-surface)", border: "1px dashed var(--border-default)",
        borderRadius: "var(--radius-lg)",
      }}>
        <Icon name="package-search" size={28} style={{ color: "var(--text-disabled)", marginBottom: 8 }} />
        <div>조건에 맞는 패키지가 없습니다.</div>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
      {rows.map(p => <CatalogCard key={p.id} pkg={p} onClick={() => onSelect(p)} />)}
    </div>
  );
}

function CatalogCard({ pkg, onClick }) {
  const [hovered, setHovered] = useStatePkgV(false);
  const cat = PACKAGE_CATEGORIES.find(c => c.key === pkg.category);
  const tone = PKG_TONES[cat.tone];
  const status = PKG_STATUS[pkg.status];
  const isInactive = pkg.status !== "active";
  const totalSessions = pkg.includes.reduce((s, i) => s + i.count, 0);
  const discount = Math.round((1 - pkg.memberPrice / pkg.price) * 100);

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--brand-muted)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)", overflow: "hidden", cursor: "pointer",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "all 0.14s ease",
        opacity: isInactive ? 0.78 : 1,
        display: "flex", flexDirection: "column",
      }}>
      {/* Header band */}
      <div style={{
        padding: "12px 14px",
        background: tone.bg,
        borderBottom: `1px solid ${tone.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "var(--radius-md)",
          background: "var(--bg-surface)", color: tone.fg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "var(--shadow-sm)",
        }}>
          <Icon name={cat.icon} size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tone.fg, fontFamily: "var(--font-sans)" }}>
            {cat.label}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{pkg.code}</div>
        </div>
        {pkg.badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: "var(--font-sans)",
            background: "var(--ink-800)", color: "var(--text-on-brand)",
            padding: "2px 7px", borderRadius: "var(--radius-sm)",
            letterSpacing: "0.06em",
          }}>{pkg.badge}</span>
        )}
        <Badge variant={status.variant}>
          <Icon name={status.icon} size={9} /> {status.label}
        </Badge>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            {pkg.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginTop: 3, lineHeight: 1.45 }}>
            {pkg.tagline}
          </div>
        </div>

        {/* Sessions + validity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, fontFamily: "var(--font-sans)", padding: "8px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="layers" size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{totalSessions}</span>
            <span style={{ color: "var(--text-muted)" }}>회차</span>
          </span>
          <span style={{ width: 1, height: 11, background: "var(--border-default)" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="calendar-clock" size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{pkg.validity}</span>
            <span style={{ color: "var(--text-muted)" }}>일 유효</span>
          </span>
        </div>

        {/* Includes chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {pkg.includes.map((inc, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 10, fontFamily: "var(--font-sans)",
              padding: "2px 7px", borderRadius: "var(--radius-full)",
              background: "var(--brand-subtle)", color: "var(--text-brand)",
              border: "1px solid var(--brand-muted)",
            }}>
              {inc.type}
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{inc.count}</span>
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Price block */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em" }}>회원가</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>{KRW(pkg.memberPrice)}</span>
              {discount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--status-danger-text)", fontFamily: "var(--font-sans)" }}>{discount}%↓</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textDecoration: "line-through", marginTop: 1 }}>{KRW(pkg.price)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em" }}>등록</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>
              {pkg.active}<span style={{ fontSize: 11, color: "var(--text-muted)" }}> / {pkg.enrolled}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 1 }}>+{pkg.monthlyEnroll} 이번 달</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Catalog Table ────────────────────────────────────────────────────
function CatalogTable({ rows, onSelect }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr style={{ background: "var(--bg-raised)" }}>
            {["코드", "패키지", "카테고리", "회차", "유효", "회원가", "정가", "활성/등록", "이번 달", "누적 매출", "상태"].map(h => (
              <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(p => {
            const cat = PACKAGE_CATEGORIES.find(c => c.key === p.category);
            const tone = PKG_TONES[cat.tone];
            const totalSessions = p.includes.reduce((s, i) => s + i.count, 0);
            const status = PKG_STATUS[p.status];
            return (
              <tr key={p.id} onClick={() => onSelect(p)} style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-raised)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{p.code}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.tagline}</div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: "var(--radius-full)", background: tone.bg, color: tone.fg, border: `1px solid ${tone.border}` }}>
                    <Icon name={cat.icon} size={10} /> {cat.label}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{totalSessions}회</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{p.validity}일</td>
                <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600, whiteSpace: "nowrap" }}>{KRW(p.memberPrice)}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", textDecoration: "line-through" }}>{KRW(p.price)}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{p.active} / {p.enrolled}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>+{p.monthlyEnroll}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{KRW(p.revenue)}</td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <Badge variant={status.variant}>
                    <Icon name={status.icon} size={9} /> {status.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={11} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>조건에 맞는 패키지가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Enrollment Table ─────────────────────────────────────────────────
function EnrollmentTable({ rows, onSelect }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr style={{ background: "var(--bg-raised)" }}>
            {["환자", "패키지", "구매일", "진행률", "최근 방문", "만료", "결제액", "담당", "상태"].map(h => (
              <th key={h} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(e => {
            const cat = PACKAGE_CATEGORIES.find(c => c.key === e.category);
            const tone = PKG_TONES[cat.tone];
            const stat = ENR_STATUS[e.status];
            const pct = Math.min(100, Math.round((e.sessionsUsed / e.sessionsTotal) * 100));

            // Expiry color logic
            let expColor = "var(--text-secondary)";
            let expLabel = `D-${e.daysLeft}`;
            if (e.status === "completed")      { expColor = "var(--text-muted)";        expLabel = "완료"; }
            else if (e.status === "expired")   { expColor = "var(--cinnabar-600)";      expLabel = "만료"; }
            else if (e.daysLeft < 0)           { expColor = "var(--cinnabar-600)";      expLabel = `+${Math.abs(e.daysLeft)}일 초과`; }
            else if (e.daysLeft <= 7)          { expColor = "var(--status-warning-text)"; }

            // Last visit color
            let lvColor = "var(--text-secondary)";
            if (e.status === "active" && e.daysSinceLastVisit >= 14) lvColor = "var(--status-warning-text)";

            return (
              <tr key={e.id} onClick={() => onSelect(e)} style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}
                onMouseEnter={ev => ev.currentTarget.style.background = "var(--bg-raised)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={e.patient.name} size={28} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{e.patient.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.patient.gender}·{e.patient.age} · {e.patient.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{e.packageName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, padding: "1px 6px", borderRadius: "var(--radius-full)", background: tone.bg, color: tone.fg, border: `1px solid ${tone.border}` }}>
                      <Icon name={cat.icon} size={9} /> {cat.label}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.packageCode}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{e.startDate}</td>
                <td style={{ padding: "10px 14px", minWidth: 140 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-raised)", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: e.status === "expired" ? "var(--cinnabar-500)"
                          : pct >= 100 ? "var(--jade-500)"
                          : "var(--jade-400)",
                        transition: "width 0.2s",
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{e.sessionsUsed}</span>
                      <span style={{ color: "var(--text-muted)" }}> / {e.sessionsTotal}</span>
                    </span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: lvColor, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {e.lastVisit}
                  <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 5 }}>
                    ({e.daysSinceLastVisit === 0 ? "오늘" : `${e.daysSinceLastVisit}일 전`})
                  </span>
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{e.expiryDate}</div>
                  <div style={{ fontSize: 11, color: expColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{expLabel}</div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", fontWeight: 500 }}>{KRW(e.paid)}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{e.sales}</td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <Badge variant={stat.variant}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: stat.dot }} /> {stat.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={9} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>조건에 맞는 등록 환자가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { CatalogGrid, CatalogCard, CatalogTable, EnrollmentTable });
