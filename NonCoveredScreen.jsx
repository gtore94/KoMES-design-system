// KoMES — 비급여(미용·다이어트) 전용 화면
// nav key: "noncovered"
// 탭: 시술 메뉴 / 오늘 시술 / 상담 보드 / 환자 인사이트

const { useState: useStNC, useMemo: useMmNC } = React;

// ── 작은 유틸 ────────────────────────────────────────────────────
function NCToneStyle(toneKey) {
  return NC_TONES[toneKey] || NC_TONES.pine;
}
function NCCategoryOf(catKey) {
  return NC_CATEGORIES.find(c => c.key === catKey);
}
function NCProcedureOf(id) {
  return NC_PROCEDURES.find(p => p.id === id);
}

// ── 시술 시각적 헤더 (이미지 자리 — 줄무늬 placeholder) ─────────
function NCProcedureHero({ category, badge, size = "card" }) {
  const cat = NCCategoryOf(category);
  const t = NCToneStyle(cat.tone);
  const heights = { card: 96, lg: 140, sm: 60 };
  return (
    <div style={{
      position: "relative",
      height: heights[size],
      background: t.bg,
      borderBottom: `1px solid ${t.border}`,
      backgroundImage:
        `repeating-linear-gradient(135deg, transparent 0 14px, ${t.border} 14px 15px)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
        color: t.fg, opacity: 0.7,
        background: t.bg,
        padding: "3px 9px", borderRadius: "var(--radius-sm)",
        border: `1px dashed ${t.border}`,
        letterSpacing: "0.04em",
      }}>{cat.label} 시술 사진</div>
      {/* 카테고리 아이콘 워터마크 */}
      <Icon name={cat.icon} size={size === "lg" ? 38 : 22}
        style={{
          position: "absolute", right: 12, top: 10,
          color: t.fg, opacity: 0.28,
        }} />
      {badge && (
        <span style={{
          position: "absolute", left: 10, top: 10,
          padding: "2px 8px", fontSize: 9, fontWeight: 700,
          background: badge === "BEST" ? "var(--ink-900)" : "var(--cinnabar-700)",
          color: "var(--stone-50)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)", letterSpacing: "0.08em",
        }}>{badge}</span>
      )}
    </div>
  );
}

// ── KPI Pill (TopBar 우측) ──────────────────────────────────────
function NCPillStat({ icon, label, value, tone, mono }) {
  const tones = {
    neutral: { bg: "var(--bg-raised)", fg: "var(--text-secondary)", bd: "var(--border-subtle)", ic: "var(--text-muted)" },
    brand:   { bg: "var(--brand-subtle)", fg: "var(--text-brand)", bd: "var(--brand-muted)", ic: "var(--jade-600)" },
    pink:    { bg: "var(--pink-100)", fg: "var(--pink-700)", bd: "var(--pink-200)", ic: "var(--pink-600)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-text)", bd: "var(--status-warning-border)", ic: "var(--amber-600)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "5px 12px",
      background: t.bg, border: `1px solid ${t.bd}`,
      borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
    }}>
      <Icon name={icon} size={13} style={{ color: t.ic }} />
      <span style={{ fontSize: 11, fontWeight: 500, color: t.fg, fontFamily: "var(--font-sans)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: t.fg, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)" }}>{value}</span>
    </div>
  );
}

// ── 카테고리 chip ───────────────────────────────────────────────
function NCCatChip({ cat, active, onClick, count }) {
  if (!cat) {
    return (
      <button onClick={onClick} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
        fontSize: 11, fontFamily: "var(--font-sans)",
        background: active ? "var(--ink-800)" : "var(--bg-surface)",
        color: active ? "var(--text-on-brand)" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--ink-800)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-full)", cursor: "pointer",
        fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
      }}>
        전체
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          color: active ? "var(--ink-200)" : "var(--text-muted)",
        }}>{count}</span>
      </button>
    );
  }
  const t = NCToneStyle(cat.tone);
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
      fontSize: 11, fontFamily: "var(--font-sans)",
      background: active ? t.bg : "var(--bg-surface)",
      color: active ? t.fg : "var(--text-secondary)",
      border: `1px solid ${active ? t.border : "var(--border-default)"}`,
      borderRadius: "var(--radius-full)", cursor: "pointer",
      fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
    }}>
      <Icon name={cat.icon} size={11} /> {cat.label}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color: active ? t.fg : "var(--text-muted)", opacity: 0.85,
      }}>{count}</span>
    </button>
  );
}

// ── KPI 카드 ────────────────────────────────────────────────────
function NCKpi({ icon, label, value, hint, tone = "default", trend }) {
  const tones = {
    default: { iconBg: "var(--bg-raised)",        iconFg: "var(--text-secondary)" },
    brand:   { iconBg: "var(--brand-muted)",      iconFg: "var(--text-brand)" },
    pink:    { iconBg: "var(--pink-100)",         iconFg: "var(--pink-700)" },
    warning: { iconBg: "var(--status-warning-bg)",iconFg: "var(--status-warning-text)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--radius-md)",
        background: t.iconBg, color: t.iconFg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{label}</div>
        <div style={{
          fontSize: 18, fontWeight: 600, color: "var(--text-primary)",
          fontFamily: "var(--font-mono)", marginTop: 1, lineHeight: 1.1,
        }}>{value}</div>
        {hint && <div style={{
          fontSize: 10, color: "var(--text-muted)",
          fontFamily: "var(--font-sans)", marginTop: 2,
        }}>{hint}</div>}
      </div>
      {trend != null && (
        <div style={{
          display: "flex", alignItems: "center", gap: 3,
          fontSize: 11, fontWeight: 700,
          color: trend >= 0 ? "var(--text-brand)" : "var(--status-danger-text)",
          fontFamily: "var(--font-mono)",
        }}>
          <Icon name={trend >= 0 ? "trending-up" : "trending-down"} size={12} />
          {trend >= 0 ? "+" : ""}{trend}%
        </div>
      )}
    </div>
  );
}

// ── 탭 ──────────────────────────────────────────────────────────
function NCTab({ active, onClick, icon, label, count }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "8px 14px 10px", fontSize: 13, fontFamily: "var(--font-sans)",
      background: "transparent", border: "none", cursor: "pointer",
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      fontWeight: active ? 600 : 400,
      borderBottom: `2px solid ${active ? "var(--brand)" : "transparent"}`,
      marginBottom: -1,
    }}>
      <Icon name={icon} size={14} />
      {label}
      {count != null && (
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
          background: active ? "var(--brand-muted)" : "var(--bg-raised)",
          color: active ? "var(--text-brand)" : "var(--text-muted)",
          padding: "1px 7px", borderRadius: "var(--radius-full)",
        }}>{count}</span>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// 탭 1. 시술 메뉴 (카탈로그)
// ════════════════════════════════════════════════════════════════
function NCProcedureCard({ proc, onClick }) {
  const cat = NCCategoryOf(proc.category);
  const t = NCToneStyle(cat.tone);
  return (
    <div onClick={onClick} style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden", cursor: "pointer",
      boxShadow: "var(--shadow-sm)",
      transition: "transform 0.12s, box-shadow 0.12s",
      display: "flex", flexDirection: "column",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <NCProcedureHero category={proc.category} badge={proc.badge} />

      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: t.fg, background: t.bg,
            padding: "1px 6px", borderRadius: "var(--radius-sm)",
            border: `1px solid ${t.border}`, fontWeight: 700, letterSpacing: "0.04em",
          }}>{proc.code}</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            <Icon name="clock" size={9} /> {proc.duration}분
          </span>
          {proc.consult && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: "1px 5px", borderRadius: "var(--radius-sm)",
              background: "var(--status-warning-bg)", color: "var(--status-warning-text)",
              border: "1px solid var(--status-warning-border)",
              fontFamily: "var(--font-sans)",
              display: "inline-flex", alignItems: "center", gap: 3,
            }}><Icon name="message-circle" size={9} /> 상담</span>
          )}
        </div>

        <div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500,
            color: "var(--text-primary)", lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}>{proc.name}</div>
          <div style={{
            fontSize: 11, color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)", marginTop: 2, lineHeight: 1.4,
          }}>{proc.tagline}</div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px dashed var(--border-subtle)",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700,
              color: "var(--text-primary)", lineHeight: 1,
            }}>{NC_KRW(proc.price)}</div>
            <div style={{
              fontSize: 9, color: "var(--text-muted)",
              fontFamily: "var(--font-sans)", marginTop: 2,
            }}>회원 {NC_KRW(proc.memberPrice)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 10, color: "var(--text-muted)",
              fontFamily: "var(--font-sans)",
            }}>이번달</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
              color: "var(--text-brand)",
            }}>{proc.monthlySales}건</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NCCatalogGrid({ rows, onSelect }) {
  if (rows.length === 0) {
    return (
      <div style={{
        padding: "60px 0", textAlign: "center",
        color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)",
      }}>조건에 맞는 시술이 없습니다.</div>
    );
  }
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 14,
    }}>
      {rows.map(p => (
        <NCProcedureCard key={p.id} proc={p} onClick={() => onSelect(p)} />
      ))}
    </div>
  );
}

function NCCatalogTable({ rows, onSelect }) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 90px 70px 110px 90px 90px",
        padding: "10px 16px", background: "var(--bg-raised)",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <span>코드</span>
        <span>시술명</span>
        <span>카테고리</span>
        <span style={{ textAlign: "right" }}>소요</span>
        <span style={{ textAlign: "right" }}>가격</span>
        <span style={{ textAlign: "right" }}>이번달</span>
        <span style={{ textAlign: "right" }}>매출</span>
      </div>
      {rows.map(p => {
        const cat = NCCategoryOf(p.category);
        const t = NCToneStyle(cat.tone);
        return (
          <div key={p.id} onClick={() => onSelect(p)} style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 90px 70px 110px 90px 90px",
            padding: "11px 16px", borderBottom: "1px solid var(--bg-raised)",
            alignItems: "center", cursor: "pointer", background: "var(--bg-surface)",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{p.code}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
                color: "var(--text-primary)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {p.name}
                {p.badge && <span style={{
                  fontSize: 8, fontWeight: 700,
                  padding: "1px 5px", borderRadius: "var(--radius-sm)",
                  background: p.badge === "BEST" ? "var(--ink-900)" : "var(--cinnabar-700)",
                  color: "var(--stone-50)", letterSpacing: "0.04em",
                }}>{p.badge}</span>}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{p.tagline}</div>
            </div>
            <span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                padding: "2px 8px", borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-sans)",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <Icon name={cat.icon} size={10} /> {cat.label}
              </span>
            </span>
            <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>{p.duration}분</span>
            <span style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{NC_KRW(p.price)}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>회원 {NC_KRW(p.memberPrice)}</div>
            </span>
            <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-brand)" }}>{p.monthlySales}건</span>
            <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>{NC_KRW(p.monthlyRevenue)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── 시술 상세 모달 ──────────────────────────────────────────────
function NCProcedureModal({ proc, onClose }) {
  const cat = NCCategoryOf(proc.category);
  const t = NCToneStyle(cat.tone);

  // 이 시술 추천 후보 환자
  const candidates = NC_RECOMMEND_PATIENTS.filter(c => c.recommendId === proc.id);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400,
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: "92%", maxWidth: 720, maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)", overflow: "hidden",
      }}>
        <NCProcedureHero category={proc.category} badge={proc.badge} size="lg" />

        <div style={{ padding: "16px 22px 22px", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                  color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                  padding: "2px 8px", borderRadius: "var(--radius-sm)",
                  letterSpacing: "0.04em",
                }}>{proc.code}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                  padding: "2px 8px", borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-sans)",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Icon name={cat.icon} size={10} /> {cat.label}
                </span>
                {proc.consult && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "2px 8px", borderRadius: "var(--radius-full)",
                    background: "var(--status-warning-bg)", color: "var(--status-warning-text)",
                    border: "1px solid var(--status-warning-border)",
                    fontFamily: "var(--font-sans)",
                  }}>상담 필요</span>
                )}
              </div>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500,
                color: "var(--text-primary)", letterSpacing: "-0.01em",
              }}>{proc.name}</div>
              <div style={{
                fontSize: 12, color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)", marginTop: 3,
              }}>{proc.tagline}</div>
            </div>
            <button onClick={onClose} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: 4,
            }}>
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* 가격 + 정보 */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
            marginBottom: 16,
          }}>
            <NCDetailStat label="정가" value={NC_KRW(proc.price)} mono primary />
            <NCDetailStat label="회원가" value={NC_KRW(proc.memberPrice)} mono />
            <NCDetailStat label="소요시간" value={`${proc.duration}분`} />
            <NCDetailStat label="시술실" value={proc.room} />
          </div>

          {/* 담당자 */}
          <div style={{
            padding: "10px 14px", borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          }}>
            <Avatar name={proc.staff[0]} size={32} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{proc.staff}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>주 담당 · 1주 평균 {proc.recommend}건 시술 가능</div>
            </div>
          </div>

          {/* 이번달 성과 */}
          <div style={{
            padding: 14, borderRadius: "var(--radius-md)",
            background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)",
            marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>이번달 시술</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--text-brand)", marginTop: 2 }}>{proc.monthlySales}건</div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>이번달 매출</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--text-brand)", marginTop: 2 }}>{NC_KRW(proc.monthlyRevenue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>주 평균 가능</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--text-brand)", marginTop: 2 }}>{proc.recommend}건</div>
            </div>
          </div>

          {/* 추천 후보 */}
          {candidates.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
              }}>
                <Icon name="sparkles" size={13} style={{ color: "var(--text-brand)" }} />
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "var(--text-secondary)",
                  letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)",
                }}>AI 추천 환자</div>
              </div>
              <div style={{
                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}>
                {candidates.map((c, i) => (
                  <div key={c.id} style={{
                    padding: "9px 12px",
                    borderBottom: i < candidates.length - 1 ? "1px solid var(--bg-raised)" : "none",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <Avatar name={c.name} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                        {c.name} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>· {c.ageGender}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{c.reason}</div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                      color: "var(--text-brand)",
                    }}>{c.score}점</div>
                    <Button variant="ghost" size="sm" icon="send"
                      onClick={() => { showToast(`${c.name} 환자에게 ${proc.name} 안내 발송`); }}>
                      안내
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 액션 바 */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
            <Button variant="ghost" size="md" icon="edit-3"
              onClick={() => showToast("시술 정보 편집 화면을 엽니다.")}>편집</Button>
            <Button variant="secondary" size="md" icon="calendar-plus"
              onClick={() => { showToast("예약 화면으로 이동합니다."); onClose(); }}>예약 잡기</Button>
            <Button variant="primary" size="md" icon="receipt"
              onClick={() => { showToast(`${proc.name} 결제 화면으로 이동합니다.`); onClose(); }}>수납</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function NCDetailStat({ label, value, mono, primary }) {
  return (
    <div style={{
      padding: "9px 11px", borderRadius: "var(--radius-md)",
      background: primary ? "var(--brand-subtle)" : "var(--bg-raised)",
      border: `1px solid ${primary ? "var(--brand-muted)" : "var(--border-subtle)"}`,
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: "var(--text-muted)",
        letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)",
      }}>{label}</div>
      <div style={{
        fontSize: primary ? 15 : 13, fontWeight: 700, marginTop: 3,
        color: primary ? "var(--text-brand)" : "var(--text-primary)",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      }}>{value}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 탭 2. 오늘 시술 (타임라인)
// ════════════════════════════════════════════════════════════════
function NCTodayView({ onOpenChart }) {
  const [filterStaff, setFilterStaff] = useStNC("all");

  const staffOptions = useMmNC(() => {
    const set = new Set(NC_TODAY_SCHEDULE.map(s => s.staff));
    return ["all", ...Array.from(set)];
  }, []);

  const rows = NC_TODAY_SCHEDULE.filter(s => filterStaff === "all" || s.staff === filterStaff);

  // 매출 합
  const doneRevenue = NC_TODAY_SCHEDULE
    .filter(s => s.status === "done")
    .reduce((a, b) => a + b.paid, 0);
  const expectedRevenue = NC_TODAY_SCHEDULE
    .reduce((a, b) => a + b.paid, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 상단 통계 */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
      }}>
        <NCKpi icon="check-circle-2" label="완료" value={`${NC_TODAY_SCHEDULE.filter(s => s.status === "done").length}건`} hint={NC_KRW(doneRevenue)} tone="brand" />
        <NCKpi icon="play" label="진행중" value={`${NC_TODAY_SCHEDULE.filter(s => s.status === "in_progress").length}건`} tone="warning" />
        <NCKpi icon="hourglass" label="대기" value={`${NC_TODAY_SCHEDULE.filter(s => s.status === "ready").length}건`} />
        <NCKpi icon="calendar" label="예약" value={`${NC_TODAY_SCHEDULE.filter(s => s.status === "scheduled").length}건`} hint={`예상 ${NC_KRW(expectedRevenue)}`} />
      </div>

      {/* 필터 + 액션 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
      }}>
        <Icon name="user-cog" size={13} style={{ color: "var(--text-muted)" }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>담당</span>
        <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} style={{
          fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
          background: "var(--bg-surface)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)", padding: "5px 10px", outline: "none", cursor: "pointer",
        }}>
          {staffOptions.map(s => (
            <option key={s} value={s}>{s === "all" ? "전체" : s}</option>
          ))}
        </select>
        <span style={{
          marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        }}>
          <Icon name="mouse-pointer-click" size={11} />
          행을 클릭하면 비급여 차트가 열립니다
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" icon="printer"
          onClick={() => toastProgress("프린터로 전송 중…", "오늘 비급여 시술 표가 인쇄되었습니다")}>인쇄</Button>
        <Button variant="secondary" size="sm" icon="plus"
          onClick={() => showToast("신규 시술 예약을 잡습니다.")}>시술 추가</Button>
      </div>

      {/* 타임라인 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "60px 1fr 90px 1fr 130px 90px 80px",
          padding: "10px 14px", background: "var(--bg-raised)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--text-muted)", fontFamily: "var(--font-sans)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <span>시간</span>
          <span>환자</span>
          <span>카테고리</span>
          <span>시술</span>
          <span>담당</span>
          <span style={{ textAlign: "right" }}>결제</span>
          <span style={{ textAlign: "center" }}>상태</span>
        </div>
        {rows.map(s => {
          const proc = NCProcedureOf(s.procedureId);
          const cat = NCCategoryOf(proc.category);
          const t = NCToneStyle(cat.tone);
          const st = NC_SCHEDULE_STATUS[s.status];
          return (
            <div key={s.id} onClick={() => onOpenChart && onOpenChart(s.patient)} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 90px 1fr 130px 90px 80px",
              padding: "11px 14px", borderBottom: "1px solid var(--bg-raised)",
              alignItems: "center", cursor: "pointer",
              background: s.status === "in_progress" ? "var(--brand-subtle)" :
                          s.status === "ready" ? "var(--status-warning-bg)" :
                          "var(--bg-surface)",
              opacity: s.status === "done" ? 0.7 : 1,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.time}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{s.patient}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{s.chartNo}</div>
              </div>
              <span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                  padding: "2px 7px", borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-sans)",
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <Icon name={cat.icon} size={9} /> {cat.label}
                </span>
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{proc.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{proc.code} · {proc.duration}분 · {proc.room}</div>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)",
              }}>
                <Avatar name={s.staff[0]} size={20} />
                {s.staff}
              </div>
              <span style={{
                textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                color: "var(--text-primary)",
              }}>{NC_KRW(s.paid)}</span>
              <span style={{ textAlign: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: "var(--radius-full)",
                  background: st.bg, color: st.fg,
                  fontSize: 10, fontWeight: 700, fontFamily: "var(--font-sans)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
                  {st.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 탭 3. 상담 보드 (kanban)
// ════════════════════════════════════════════════════════════════
function NCConsultBoard() {
  const grouped = useMmNC(() => {
    const m = {};
    for (const s of NC_CONSULT_STAGES) m[s.key] = [];
    for (const l of NC_CONSULT_LEADS) (m[l.stage] || (m[l.stage] = [])).push(l);
    return m;
  }, []);

  // 전환율 계산
  const total = NC_CONSULT_LEADS.length;
  const wonCnt = grouped.won?.length || 0;
  const wonRevenue = (grouped.won || []).reduce((a, b) => a + (b.quoted || 0), 0);
  const pipelineRevenue = NC_CONSULT_LEADS
    .filter(l => l.stage !== "won")
    .reduce((a, b) => a + (b.quoted || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 상단 통계 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <NCKpi icon="inbox" label="총 리드" value={`${total}건`} hint="이번달 신규 문의" />
        <NCKpi icon="trending-up" label="전환율" value={`${Math.round((wonCnt / total) * 100)}%`} hint={`${wonCnt}건 전환`} tone="brand" />
        <NCKpi icon="banknote" label="전환 매출" value={NC_KRW(wonRevenue)} tone="brand" />
        <NCKpi icon="hourglass" label="파이프라인" value={NC_KRW(pipelineRevenue)} hint="진행 중 견적" tone="warning" />
      </div>

      {/* 칸반 */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10,
      }}>
        {NC_CONSULT_STAGES.map(st => {
          const items = grouped[st.key] || [];
          return (
            <div key={st.key} style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              display: "flex", flexDirection: "column", minHeight: 360,
            }}>
              <div style={{
                padding: "10px 12px",
                background: st.bg, borderBottom: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Icon name={st.icon} size={13} style={{ color: st.fg }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: st.fg, fontFamily: "var(--font-sans)" }}>{st.label}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                  background: "var(--bg-surface)", color: st.fg,
                  padding: "1px 7px", borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-subtle)",
                }}>{items.length}</span>
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto" }}>
                {items.length === 0 && (
                  <div style={{
                    padding: "20px 4px", textAlign: "center",
                    fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
                  }}>비어 있음</div>
                )}
                {items.map(l => {
                  const proc = NCProcedureOf(l.interest);
                  const cat = NCCategoryOf(proc.category);
                  const t = NCToneStyle(cat.tone);
                  return (
                    <div key={l.id} style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "9px 11px", cursor: "pointer",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    onClick={() => showToast(`${l.patient} 리드 상세를 엽니다.`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                          {l.patient}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                          {l.gender} · {l.age}
                        </span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>{l.id}</span>
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 10, fontWeight: 600,
                        color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                        padding: "2px 7px", borderRadius: "var(--radius-sm)",
                        fontFamily: "var(--font-sans)", marginBottom: 6,
                      }}>
                        <Icon name={cat.icon} size={9} /> {proc.name}
                      </div>
                      <div style={{
                        fontSize: 10, color: "var(--text-secondary)",
                        fontFamily: "var(--font-sans)", lineHeight: 1.4, marginBottom: 6,
                      }}>{l.note}</div>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                        paddingTop: 6, borderTop: "1px dashed var(--border-subtle)",
                      }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
                        }}>
                          <Icon name="megaphone" size={9} /> {l.source}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                        }}>
                          <Icon name="clock" size={9} /> {l.lastTouch}
                        </span>
                        {l.quoted != null && (
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                            color: "var(--text-brand)",
                          }}>{NC_KRW(l.quoted)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 탭 4. 인사이트
// ════════════════════════════════════════════════════════════════
function NCInsightsView() {
  // 카테고리별 매출
  const byCat = useMmNC(() => {
    const m = {};
    for (const c of NC_CATEGORIES) m[c.key] = { revenue: 0, sales: 0, count: 0 };
    for (const p of NC_PROCEDURES) {
      m[p.category].revenue += p.monthlyRevenue;
      m[p.category].sales   += p.monthlySales;
      m[p.category].count   += 1;
    }
    const totalRev = NC_PROCEDURES.reduce((s, p) => s + p.monthlyRevenue, 0);
    return NC_CATEGORIES.map(c => ({
      cat: c,
      revenue: m[c.key].revenue,
      sales: m[c.key].sales,
      count: m[c.key].count,
      pct: totalRev > 0 ? (m[c.key].revenue / totalRev) * 100 : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }, []);

  // TOP 시술
  const topProcs = [...NC_PROCEDURES].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 6);

  // 담당자별
  const byStaff = useMmNC(() => {
    const m = {};
    for (const s of NC_TODAY_SCHEDULE) {
      if (!m[s.staff]) m[s.staff] = { count: 0, revenue: 0 };
      m[s.staff].count += 1;
      m[s.staff].revenue += s.paid;
    }
    return Object.entries(m).map(([k, v]) => ({ staff: k, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, []);

  const totalRev = NC_PROCEDURES.reduce((s, p) => s + p.monthlyRevenue, 0);
  const maxStaffRev = Math.max(...byStaff.map(s => s.revenue), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 상단 — 이번달 총합 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: "16px 20px",
        display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 16,
        boxShadow: "var(--shadow-sm)",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>이번달 비급여 누적</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "var(--text-brand)", marginTop: 4, lineHeight: 1 }}>
            {NC_KRW(totalRev)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
            <Icon name="trending-up" size={11} style={{ color: "var(--text-brand)", verticalAlign: "-2px", marginRight: 3 }} />
            전월 대비 +12.4% · 목표 ₩140,000,000 대비 88%
          </div>
        </div>
        <NCKpi icon="layers" label="총 시술 종" value={`${NC_PROCEDURES.length}종`} hint={`판매 중 ${NC_PROCEDURES.length}`} />
        <NCKpi icon="repeat" label="평균 회당가" value={NC_KRW(Math.round(totalRev / NC_PROCEDURES.reduce((s, p) => s + p.monthlySales, 0)))} hint="가중 평균" />
        <NCKpi icon="users" label="이번달 시술 환자" value={`${NC_PROCEDURES.reduce((s, p) => s + p.monthlySales, 0)}건`} tone="brand" trend={12} />
      </div>

      {/* 카테고리별 매출 (수평 바) */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: "var(--text-primary)",
          fontFamily: "var(--font-sans)", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 7,
        }}>
          <Icon name="pie-chart" size={14} style={{ color: "var(--text-brand)" }} />
          카테고리별 매출 비중
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {byCat.map(b => {
            const t = NCToneStyle(b.cat.tone);
            return (
              <div key={b.cat.key} style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px", gap: 12, alignItems: "center" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600, color: t.fg,
                  fontFamily: "var(--font-sans)",
                }}>
                  <Icon name={b.cat.icon} size={13} />
                  {b.cat.label}
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>· {b.count}종</span>
                </div>
                <div style={{
                  height: 16, background: "var(--bg-raised)",
                  borderRadius: "var(--radius-full)", overflow: "hidden",
                  border: "1px solid var(--border-subtle)", position: "relative",
                }}>
                  <div style={{
                    width: `${b.pct}%`, height: "100%",
                    background: t.fg, opacity: 0.85,
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.3s",
                  }} />
                  <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: 10, fontWeight: 700, color: "var(--stone-50)",
                    fontFamily: "var(--font-mono)", mixBlendMode: "difference",
                  }}>{b.pct.toFixed(1)}%</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {NC_KRW(b.revenue)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                    {b.sales}건
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP 시술 + 담당자 매트릭스 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        {/* TOP 시술 */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "var(--text-primary)",
            fontFamily: "var(--font-sans)", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <Icon name="trophy" size={14} style={{ color: "var(--amber-600)" }} />
            이번달 매출 TOP 6
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {topProcs.map((p, i) => {
              const cat = NCCategoryOf(p.category);
              const t = NCToneStyle(cat.tone);
              const max = topProcs[0].monthlyRevenue;
              return (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "28px 1fr 80px 90px", gap: 10,
                  padding: "8px 10px", borderRadius: "var(--radius-md)",
                  background: i === 0 ? t.bg : "var(--bg-raised)",
                  border: `1px solid ${i === 0 ? t.border : "var(--border-subtle)"}`,
                  alignItems: "center",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: i < 3 ? "var(--amber-500)" : "var(--ink-200)",
                    color: i < 3 ? "var(--ink-900)" : "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                  }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.code} · {cat.label}</div>
                  </div>
                  <div style={{
                    height: 6, background: "var(--bg-surface)",
                    borderRadius: "var(--radius-full)", overflow: "hidden",
                    border: "1px solid var(--border-subtle)",
                  }}>
                    <div style={{
                      width: `${(p.monthlyRevenue / max) * 100}%`, height: "100%",
                      background: t.fg, borderRadius: "var(--radius-full)",
                    }} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{NC_KRW(p.monthlyRevenue)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{p.monthlySales}건</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 담당자 매트릭스 (오늘 기준) */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)", padding: 18, boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "var(--text-primary)",
            fontFamily: "var(--font-sans)", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <Icon name="users" size={14} style={{ color: "var(--text-brand)" }} />
            오늘 담당자 매출
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byStaff.map((s, i) => (
              <div key={s.staff} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: "var(--radius-md)",
                background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              }}>
                <Avatar name={s.staff[0]} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{s.staff}</div>
                  <div style={{
                    height: 4, background: "var(--bg-surface)", borderRadius: "var(--radius-full)",
                    marginTop: 5, overflow: "hidden", border: "1px solid var(--border-subtle)",
                  }}>
                    <div style={{
                      width: `${(s.revenue / maxStaffRev) * 100}%`, height: "100%",
                      background: "var(--jade-500)", borderRadius: "var(--radius-full)",
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{NC_KRW(s.revenue)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{s.count}건</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 메인 화면
// ════════════════════════════════════════════════════════════════
function NonCoveredScreen({ onOpenChart }) {
  const [tab, setTab]       = useStNC("menu"); // menu | today | consult | insights
  const [category, setCat]  = useStNC("all");
  const [search, setSearch] = useStNC("");
  const [view, setView]     = useStNC("card");  // card | table
  const [selProc, setSelProc] = useStNC(null);

  const filtered = useMmNC(() => {
    return NC_PROCEDURES.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${p.name} ${p.code} ${p.tagline}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [category, search]);

  // TopBar 통계
  const todayDone = NC_TODAY_SCHEDULE.filter(s => s.status === "done");
  const todayRev  = todayDone.reduce((s, x) => s + x.paid, 0);
  const monthRev  = NC_PROCEDURES.reduce((s, p) => s + p.monthlyRevenue, 0);
  const inProgress = NC_TODAY_SCHEDULE.filter(s => s.status === "in_progress" || s.status === "ready").length;
  const leads = NC_CONSULT_LEADS.filter(l => l.stage !== "won").length;

  // 카테고리별 count
  const catCounts = useMmNC(() => {
    const m = { all: NC_PROCEDURES.length };
    for (const c of NC_CATEGORIES) m[c.key] = NC_PROCEDURES.filter(p => p.category === c.key).length;
    return m;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="비급여 · 미용/다이어트"
        subtitle="개별 시술 메뉴 · 오늘 시술 · 상담 보드 · 매출 인사이트"
        actions={<>
          <NCPillStat icon="banknote" label="오늘 매출" value={NC_KRW(todayRev)} tone="brand" mono />
          <NCPillStat icon="calendar-clock" label="진행/대기" value={`${inProgress}건`} tone={inProgress > 0 ? "warning" : "neutral"} />
          <NCPillStat icon="inbox" label="상담 대기" value={`${leads}건`} tone="pink" />
          <NCPillStat icon="trending-up" label="이번달" value={NC_KRW(monthRev)} tone="brand" mono />
          <Button variant="primary" size="sm" icon="stethoscope" onClick={() => onOpenChart && onOpenChart()}>비급여 차트</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* 탭 */}
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 24px 0", gap: 4,
          borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)",
        }}>
          <NCTab active={tab === "menu"}     onClick={() => setTab("menu")}     icon="layout-grid"    label="시술 메뉴"  count={NC_PROCEDURES.length} />
          <NCTab active={tab === "today"}    onClick={() => setTab("today")}    icon="calendar-clock" label="오늘 시술"  count={NC_TODAY_SCHEDULE.length} />
          <NCTab active={tab === "consult"}  onClick={() => setTab("consult")}  icon="message-circle" label="상담 보드"  count={NC_CONSULT_LEADS.length} />
          <NCTab active={tab === "insights"} onClick={() => setTab("insights")} icon="bar-chart-2"    label="인사이트"   />
          <div style={{ flex: 1 }} />
          {tab === "menu" && (
            <>
              <Button variant="ghost" size="sm" icon="download"
                onClick={() => toastProgress("시술 메뉴 내보내는 중…", "비급여 시술 메뉴 엑셀을 내려받았습니다")}>엑셀</Button>
              <Button variant="secondary" size="sm" icon="settings-2"
                onClick={() => showToast("회원 등급·할인 정책을 설정합니다.")}>정책</Button>
              <Button variant="primary" size="sm" icon="plus"
                onClick={() => showToast("신규 비급여 시술을 등록합니다.")}>신규 시술</Button>
            </>
          )}
        </div>

        {/* 시술 메뉴 탭: 필터 바 */}
        {tab === "menu" && (
          <div style={{
            padding: "12px 24px", display: "flex", gap: 10, alignItems: "center",
            flexWrap: "wrap", background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
              <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="시술명 / 코드"
                style={{
                  width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", padding: "7px 10px 7px 32px",
                  outline: "none", boxSizing: "border-box",
                }} />
            </div>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <NCCatChip cat={null} count={catCounts.all} active={category === "all"} onClick={() => setCat("all")} />
              {NC_CATEGORIES.map(c => (
                <NCCatChip key={c.key} cat={c} count={catCounts[c.key]} active={category === c.key} onClick={() => setCat(c.key)} />
              ))}
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 2 }}>
              {[
                { key: "card",  icon: "layout-grid", label: "카드" },
                { key: "table", icon: "table",       label: "표" },
              ].map(v => {
                const sel = view === v.key;
                return (
                  <button key={v.key} onClick={() => setView(v.key)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px",
                    fontSize: 11, fontFamily: "var(--font-sans)",
                    background: sel ? "var(--bg-surface)" : "transparent",
                    color: sel ? "var(--text-primary)" : "var(--text-muted)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", fontWeight: sel ? 600 : 400,
                    boxShadow: sel ? "var(--shadow-sm)" : "none",
                  }}>
                    <Icon name={v.icon} size={12} /> {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 본문 */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
          {tab === "menu" && view === "card"  && <NCCatalogGrid rows={filtered}  onSelect={setSelProc} />}
          {tab === "menu" && view === "table" && <NCCatalogTable rows={filtered} onSelect={setSelProc} />}
          {tab === "today"    && <NCTodayView onOpenChart={onOpenChart} />}
          {tab === "consult"  && <NCConsultBoard />}
          {tab === "insights" && <NCInsightsView />}
        </div>
      </div>

      {selProc && <NCProcedureModal proc={selProc} onClose={() => setSelProc(null)} />}
    </div>
  );
}

Object.assign(window, { NonCoveredScreen });
