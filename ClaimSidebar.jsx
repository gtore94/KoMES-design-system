// KoMES — 보험 청구 화면 (Insurance Claim Screen)
// Left: 청구기간/요약 · Center: 명세서 리스트 · Right: 청구 액션
// 청구 실행 시 ClaimSubmissionFlow 모달 호출 (심평원 API 4단계 워크플로우)

const { useState: useSt, useMemo: useMm, useEffect: useEf, useRef: useRf } = React;

const KRW2 = (n) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const NUM = (n) => Math.round(n).toLocaleString("ko-KR");

// ── 상단 탭 (보험 유형) ─────────────────────────────────────
function ClaimTypeTabs({ active, onChange, counts }) {
  return (
    <div style={{
      display: "flex", gap: 0,
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)",
      padding: "0 24px",
      flexShrink: 0,
    }}>
      {CLAIM_TYPES.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px 12px",
            background: "transparent", border: "none",
            borderBottom: isActive ? `2px solid ${t.pillColor}` : "2px solid transparent",
            cursor: "pointer", fontFamily: "var(--font-sans)",
            marginBottom: -1, transition: "all 0.12s",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "var(--radius-md)",
              background: isActive ? t.pillColor : "var(--bg-raised)",
              color: isActive ? "#fff" : "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.12s",
            }}>
              <Icon name={t.icon} size={15} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                lineHeight: 1.2,
              }}>{t.label}</div>
              <div style={{
                fontSize: 10, color: "var(--text-muted)",
                marginTop: 2, lineHeight: 1.2,
              }}>{t.sublabel}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px",
              borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
              background: isActive ? t.pillColor : "var(--bg-raised)",
              color: isActive ? "#fff" : "var(--text-muted)",
              fontFamily: "var(--font-mono)", marginLeft: 4,
            }}>{counts[t.key]}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }}></div>
    </div>
  );
}

// ── 좌측: 청구 기간 설정 + 요약 ─────────────────────────────
function PeriodAndSummary({
  type, period, setPeriod,
  claimGroup, setClaimGroup,
  diffRate, setDiffRate,
  doctors, summary, weekendOpt, setWeekendOpt,
  onLoadClaims, loaded,
}) {
  return (
    <div style={{
      width: 340, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
          letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "var(--font-sans)", marginBottom: 6,
        }}>STEP 1 · 청구 기간 선택</div>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500,
          color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.3,
        }}>청구할 기간을<br />선택하십시오</div>
      </div>

      <div style={{ padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 청구 구분 */}
        <div>
          <Label>청구 구분</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {["원청구", "추가청구", "보완청구"].map(v => (
              <button key={v} onClick={() => setClaimGroup(v)} style={pillBtn(claimGroup === v)}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 청구 기간 라디오 */}
        <div>
          <Label>청구 기간</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <RadioRow checked={period.mode === "month"} onClick={() => setPeriod({ ...period, mode: "month" })}>
              <select value={period.year} disabled={period.mode !== "month"}
                onChange={e => setPeriod({ ...period, year: parseInt(e.target.value) })}
                style={selectStyle}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              <select value={period.month} disabled={period.mode !== "month"}
                onChange={e => setPeriod({ ...period, month: parseInt(e.target.value) })}
                style={selectStyle}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
                  <option key={m} value={m}>{String(m).padStart(2, "0")}월</option>
                )}
              </select>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap",
              }}>
                <input type="checkbox" checked={weekendOpt} onChange={e => setWeekendOpt(e.target.checked)}
                  disabled={period.mode !== "month"}
                  style={{ accentColor: "var(--jade-500)" }} />
                주단위
              </label>
            </RadioRow>
            <RadioRow checked={period.mode === "range"} onClick={() => setPeriod({ ...period, mode: "range" })}>
              <input type="date" value={period.from} disabled={period.mode !== "range"}
                onChange={e => setPeriod({ ...period, from: e.target.value })}
                style={dateStyle} />
              <span style={{ color: "var(--text-muted)" }}>—</span>
              <input type="date" value={period.to} disabled={period.mode !== "range"}
                onChange={e => setPeriod({ ...period, to: e.target.value })}
                style={dateStyle} />
            </RadioRow>
          </div>
        </div>

        {/* 차등수가 (건보 한정) */}
        {type === "health" && (
          <div>
            <Label>차등수가</Label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setDiffRate("apply")} style={pillBtn(diffRate === "apply")}>
                토·일 포함
              </button>
              <button onClick={() => setDiffRate("exclude")} style={pillBtn(diffRate === "exclude")}>
                토·일 제외
              </button>
            </div>
          </div>
        )}

        <button onClick={onLoadClaims} style={{
          padding: "11px 14px",
          background: loaded ? "var(--bg-surface)" : "var(--jade-500)",
          color: loaded ? "var(--text-secondary)" : "#fff",
          border: loaded ? "1px solid var(--border-default)" : "none",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: loaded ? "none" : "var(--shadow-sm)",
          transition: "all 0.12s",
        }}>
          <Icon name={loaded ? "rotate-ccw" : "download"} size={14} />
          {loaded ? "명세서 다시 불러오기" : "명세서 불러오기"}
        </button>
      </div>

      {/* 청구 내역 요약 */}
      {loaded && (
        <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--border-subtle)", marginTop: 6 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "var(--font-sans)", marginBottom: 6,
          }}>STEP 2 · 청구 내역 요약</div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500,
            color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 14,
          }}>이번에 청구할 내역</div>

          {/* 기간 정보 */}
          <div style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>청구 기간</span>
              <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {summary.periodFrom} ~ {summary.periodTo}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>진료일수</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
                의사 {doctors.length}명 · 총 {doctors.reduce((s, d) => s + d.visitDays, 0)}일
              </span>
            </div>
          </div>

          {/* 의사별 진료일수 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 36px 24px",
              padding: "4px 8px", marginBottom: 4,
              fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
              color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            }}>
              <span>의사</span>
              <span>주민번호</span>
              <span style={{ textAlign: "right" }}>일수</span>
              <span></span>
            </div>
            {doctors.map((d, i) => (
              <div key={d.id} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 36px 24px",
                padding: "7px 8px", alignItems: "center",
                borderBottom: i < doctors.length - 1 ? "1px solid var(--border-subtle)" : "none",
                fontSize: 12,
              }}>
                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{d.name}</span>
                <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{d.rrn}</span>
                <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 500 }}>{d.visitDays}</span>
                <span style={{
                  width: 18, height: 18, borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", cursor: "pointer",
                }}><Icon name="x" size={10} /></span>
              </div>
            ))}
          </div>

          {/* 합계 라인 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SumLine label="명세서 건수">
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{summary.totalCount}건</span>
              {type === "health" && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                  (보험 {summary.healthOnly}건, 의료급여 {summary.medicaidOnly}건)
                </span>
              )}
            </SumLine>
            <SumLine label="청구 합계" bold>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-brand)", fontSize: 14 }}>
                {KRW2(summary.totalClaim)}
              </span>
            </SumLine>
            {type === "health" && (
              <div style={{ paddingLeft: 8, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                보험 {KRW2(summary.healthAmount)}<br />
                의료급여 {KRW2(summary.medicaidAmount)}
              </div>
            )}
            <SumLine label="본인부담금">
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>{KRW2(summary.copayTotal)}</span>
            </SumLine>
          </div>
        </div>
      )}
    </div>
  );
}

// helpers
function Label({ children }) {
  return <div style={{
    fontSize: 11, fontWeight: 600, color: "var(--text-secondary)",
    fontFamily: "var(--font-sans)", marginBottom: 6, letterSpacing: "0.02em",
  }}>{children}</div>;
}
function SumLine({ label, children, bold }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "4px 0",
      borderBottom: bold ? "1px dashed var(--stone-300)" : "none",
      fontSize: 12,
    }}>
      <span style={{
        color: bold ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: bold ? 600 : 400, fontFamily: "var(--font-sans)",
      }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontSize: 12 }}>
        {children}
      </span>
    </div>
  );
}
function RadioRow({ checked, onClick, children }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 8px", borderRadius: "var(--radius-sm)",
      background: checked ? "var(--brand-subtle)" : "transparent",
      border: `1px solid ${checked ? "var(--brand-muted)" : "transparent"}`,
      cursor: "pointer", transition: "all 0.12s",
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: "50%",
        border: `2px solid ${checked ? "var(--jade-500)" : "var(--border-default)"}`,
        background: "var(--bg-surface)", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jade-500)" }}></span>}
      </span>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, color: "var(--text-primary)",
      }}>{children}</div>
    </div>
  );
}
const pillBtn = (active) => ({
  flex: 1, padding: "6px 8px", fontSize: 12, fontWeight: 500,
  background: active ? "var(--jade-500)" : "var(--bg-surface)",
  color: active ? "#fff" : "var(--text-secondary)",
  border: `1px solid ${active ? "var(--jade-500)" : "var(--border-default)"}`,
  borderRadius: "var(--radius-sm)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
  transition: "all 0.12s",
});
const selectStyle = {
  padding: "5px 8px", fontSize: 12,
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)", background: "var(--bg-surface)",
  fontFamily: "var(--font-sans)", color: "var(--text-primary)",
  outline: "none", cursor: "pointer",
};
const dateStyle = {
  padding: "5px 8px", fontSize: 11, flex: 1,
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)", background: "var(--bg-surface)",
  fontFamily: "var(--font-mono)", color: "var(--text-primary)",
  outline: "none", minWidth: 0,
};

Object.assign(window, {
  ClaimTypeTabs, PeriodAndSummary,
  KRW2, NUM,
});
