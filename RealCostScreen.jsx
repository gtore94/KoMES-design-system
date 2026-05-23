// KoMES — 실비보험 조회·안내 화면 (RealCost / 실손의료보험)
// nav key: "realcost"
// 좌측: 오늘 안내 대상 환자 리스트
// 우측: 환자별 가입정보 + AI 청구 도우미 + 청구 가능 항목 + 절차/서류 + 액션

const { useState: useStRC, useMemo: useMmRC, useEffect: useEfRC } = React;

// ── 숫자 포맷터 ─────────────────────────────────────────────────
const rcKRW = (n) => `₩${(n || 0).toLocaleString("ko-KR")}`;
const rcNUM = (n) => (n || 0).toLocaleString("ko-KR");

// ── Patient list row ────────────────────────────────────────────
function RCPatientRow({ patient, policy, isActive, isClaimed, onClick }) {
  const insurer = policy?.enrolled ? RC_INSURERS.find(i => i.id === policy.insurerId) : null;
  const gen = policy?.enrolled ? RC_GENERATIONS.find(g => g.id === policy.generation) : null;
  const todayItems = RC_TODAY_ITEMS[patient.id];
  const claimableTotal = todayItems
    ? todayItems.items.filter(it => it.claimable).reduce((s, it) => s + it.amount, 0)
    : 0;
  const refund = policy ? rcEstimateRefund(policy, claimableTotal) : 0;

  return (
    <div onClick={onClick} style={{
      padding: "12px 14px",
      borderBottom: "1px solid var(--border-subtle)",
      background: isActive ? "var(--brand-subtle)" : "var(--bg-surface)",
      borderLeft: isActive ? "3px solid var(--jade-500)" : "3px solid transparent",
      cursor: "pointer", transition: "background 0.1s",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <Avatar name={patient.name} size={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6,
          }}>
            {patient.name}
            <span style={{ fontWeight: 400, fontSize: 11, color: "var(--text-muted)" }}>
              {patient.gender} · {patient.age}
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            {patient.chartNo} · {todayItems?.visitDate || patient.lastVisit}
          </div>
        </div>
        {isClaimed && (
          <span title="안내 완료" style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "1px 6px", borderRadius: "var(--radius-full)",
            background: "var(--status-success-bg)", color: "var(--status-success-text)",
            border: "1px solid var(--status-success-border)",
            fontSize: 9, fontWeight: 600, fontFamily: "var(--font-sans)",
          }}>
            <Icon name="check" size={9} /> 안내
          </span>
        )}
      </div>

      {policy?.enrolled ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 7px", borderRadius: "var(--radius-sm)",
            background: insurer.color + "14", color: insurer.color,
            fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)",
            border: `1px solid ${insurer.color}33`,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: insurer.color }} />
            {insurer.short}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, color: "var(--text-secondary)",
            padding: "2px 6px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
          }}>{gen.id}</span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
            color: refund > 0 ? "var(--text-brand)" : "var(--text-muted)",
          }}>
            {refund > 0 ? `≈ ${rcKRW(refund)}` : "—"}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 7px", borderRadius: "var(--radius-sm)",
            background: "var(--bg-raised)", color: "var(--text-muted)",
            fontSize: 10, fontWeight: 500, fontFamily: "var(--font-sans)",
            border: "1px dashed var(--border-default)",
          }}>
            <Icon name="circle-slash" size={9} />
            미가입 / 미확인
          </span>
        </div>
      )}
    </div>
  );
}

// ── Stat pill (top bar) ─────────────────────────────────────────
function RCPillStat({ icon, label, value, tone, mono }) {
  const tones = {
    neutral: { bg: "var(--bg-raised)", fg: "var(--text-secondary)", bd: "var(--border-subtle)", ic: "var(--text-muted)" },
    brand:   { bg: "var(--brand-subtle)", fg: "var(--text-brand)", bd: "var(--brand-muted)", ic: "var(--jade-600)" },
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

// ── Section card ────────────────────────────────────────────────
function RCSection({ title, icon, actions, children, accent }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        padding: "10px 14px",
        background: accent ? "var(--brand-subtle)" : "var(--bg-raised)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {icon && <Icon name={icon} size={14} style={{ color: accent ? "var(--text-brand)" : "var(--text-secondary)" }} />}
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
          color: accent ? "var(--text-brand)" : "var(--text-primary)",
          letterSpacing: "0.01em", flex: 1,
        }}>{title}</div>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ── Insurer "credit card" style summary ─────────────────────────
function RCInsuranceCard({ patient, policy }) {
  if (!policy?.enrolled) {
    return (
      <div style={{
        padding: 18, borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border-default)",
        background: "var(--bg-raised)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "var(--radius-full)",
          background: "var(--bg-surface)", border: "1px solid var(--border-default)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)",
        }}>
          <Icon name="shield-off" size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>
            실비보험 미가입 / 미확인
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
            {policy?.note || "환자 본인 확인 후 가입 여부를 업데이트해주세요."}
          </div>
        </div>
        <Button variant="secondary" size="sm" icon="user-cog"
          onClick={() => showToast("환자 차트에서 실비보험 정보를 입력합니다.")}>
          정보 입력
        </Button>
      </div>
    );
  }

  const insurer = RC_INSURERS.find(i => i.id === policy.insurerId);
  const gen = RC_GENERATIONS.find(g => g.id === policy.generation);

  return (
    <div style={{
      position: "relative",
      padding: 18, borderRadius: "var(--radius-lg)",
      background: `linear-gradient(135deg, ${insurer.color} 0%, ${insurer.color}dd 100%)`,
      color: "#fff", overflow: "hidden",
      boxShadow: `0 8px 24px ${insurer.color}33, var(--shadow-sm)`,
    }}>
      {/* texture */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.18), transparent 50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: -40, bottom: -40, width: 180, height: 180,
        borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
            실손의료보험 · {gen.id}
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, marginTop: 6, letterSpacing: "-0.01em" }}>
            {insurer.name}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, opacity: 0.85, marginTop: 2 }}>
            {policy.productName}
          </div>
        </div>
        <div style={{
          padding: "5px 10px", background: "rgba(255,255,255,0.18)",
          borderRadius: "var(--radius-full)",
          fontSize: 10, fontWeight: 700, fontFamily: "var(--font-sans)",
          backdropFilter: "blur(4px)",
        }}>
          {gen.name.split(" ")[1] || gen.name}
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 18, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", opacity: 0.92 }}>
        {policy.policyNo}
      </div>

      <div style={{
        position: "relative", marginTop: 14, paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.2)",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
      }}>
        <RCMini label="공제금액" value={rcKRW(policy.deductible)} />
        <RCMini label="자기부담" value={`${policy.coRate}%`} />
        <RCMini label="자보 보장" value={policy.accidentCovered ? "가능" : "불가"} />
        <RCMini label="가입일" value={policy.enrollDate} mono />
      </div>
    </div>
  );
}
function RCMini({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)" }}>{value}</div>
    </div>
  );
}

// ── AI Claim helper ─────────────────────────────────────────────
function RCAIHelper({ patient, policy, todayItems, refund }) {
  if (!policy?.enrolled) {
    return (
      <RCSection title="AI 청구 도우미" icon="sparkles">
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="info" size={18} style={{ color: "var(--text-muted)" }} />
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            가입 정보가 없어 청구 분석을 진행할 수 없습니다.
          </div>
        </div>
      </RCSection>
    );
  }
  if (!todayItems) {
    return (
      <RCSection title="AI 청구 도우미" icon="sparkles">
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="calendar-x" size={18} style={{ color: "var(--text-muted)" }} />
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            오늘 진료 내역이 없습니다. 진료 후 다시 확인해주세요.
          </div>
        </div>
      </RCSection>
    );
  }

  const insurer = RC_INSURERS.find(i => i.id === policy.insurerId);
  const gen = RC_GENERATIONS.find(g => g.id === policy.generation);
  const claimable = todayItems.items.filter(it => it.claimable);
  const excluded = todayItems.items.filter(it => !it.claimable);
  const claimableTotal = claimable.reduce((s, it) => s + it.amount, 0);

  // suggested actions
  const suggestions = [];
  if (claimableTotal >= 200000) suggestions.push({ icon: "file-text", text: "20만원 이상 — 진료비 세부산정내역서 필수 첨부" });
  if (claimableTotal >= 1000000) suggestions.push({ icon: "stamp", text: "100만원 이상 — 진단서 권장 첨부" });
  if (todayItems.relatedAccident) suggestions.push({ icon: "car", text: `${todayItems.relatedAccident.kind} 사건 진행 중 — 자보 종결 후 본인부담분만 청구` });
  if (todayItems.aiHint) suggestions.push({ icon: "lightbulb", text: todayItems.aiHint });
  if (policy.generation === "2G" || policy.generation === "3G") {
    if (todayItems.items.some(it => it.type === "비급여")) {
      suggestions.push({ icon: "alert-triangle", text: `${gen.id} — 한방 비급여 보장 제외. 급여 항목만 청구 가능합니다.` });
    }
  }
  if (claimableTotal === 0) suggestions.push({ icon: "info", text: "오늘 진료에서 청구 가능한 항목이 없습니다." });

  return (
    <RCSection title="AI 청구 도우미" icon="sparkles" accent
      actions={<span style={{
        fontSize: 10, fontWeight: 600, padding: "2px 8px",
        background: "var(--bg-surface)", border: "1px solid var(--brand-muted)",
        borderRadius: "var(--radius-full)", color: "var(--text-brand)",
        fontFamily: "var(--font-sans)",
      }}>Beta</span>}
    >
      <div style={{ padding: "16px 16px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: 12, marginBottom: 14 }}>
          <RCMetric
            label="예상 환급액"
            value={rcKRW(refund)}
            sub={`청구가능 ${rcKRW(claimableTotal)} × ${100 - policy.coRate}% − 공제 ${rcKRW(policy.deductible)}`}
            tone="brand"
          />
          <RCMetric
            label="청구 가능 항목"
            value={`${claimable.length}건`}
            sub={`전체 ${todayItems.items.length}건 중`}
          />
          <RCMetric
            label="제외 항목"
            value={`${excluded.length}건`}
            sub={excluded.length > 0 ? "비급여·세대 기준" : "없음"}
            tone={excluded.length > 0 ? "warning" : "neutral"}
          />
        </div>

        <div style={{
          padding: 12, borderRadius: "var(--radius-md)",
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)",
            marginBottom: 8,
          }}>AI 추천 액션</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {suggestions.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                <Icon name="check-circle" size={12} style={{ color: "var(--jade-600)", verticalAlign: "-2px", marginRight: 6 }} />
                추가 안내 사항 없음 — 기본 절차로 청구 가능합니다.
              </div>
            )}
            {suggestions.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                fontSize: 12, color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)", lineHeight: 1.5,
              }}>
                <Icon name={s.icon} size={13} style={{ color: "var(--jade-600)", flexShrink: 0, marginTop: 1 }} />
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: "var(--bg-raised)",
          borderRadius: "var(--radius-md)",
          fontSize: 10, color: "var(--text-muted)",
          fontFamily: "var(--font-sans)", lineHeight: 1.5,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name="info" size={11} />
          환급액은 표준약관 기준 추정치입니다 — 실제 지급액은 {insurer.name} 심사 결과에 따라 달라질 수 있습니다.
        </div>
      </div>
    </RCSection>
  );
}
function RCMetric({ label, value, sub, tone }) {
  const tones = {
    brand:   { fg: "var(--text-brand)", bg: "var(--brand-subtle)", bd: "var(--brand-muted)" },
    warning: { fg: "var(--status-warning-text)", bg: "var(--status-warning-bg)", bd: "var(--status-warning-border)" },
    neutral: { fg: "var(--text-primary)", bg: "var(--bg-surface)", bd: "var(--border-subtle)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      padding: 12, borderRadius: "var(--radius-md)",
      background: t.bg, border: `1px solid ${t.bd}`,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: t.fg, opacity: 0.75,
        letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-sans)",
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
        color: t.fg, marginTop: 4, lineHeight: 1.1,
      }}>{value}</div>
      {sub && <div style={{
        fontSize: 10, color: "var(--text-muted)", marginTop: 4,
        fontFamily: "var(--font-sans)", lineHeight: 1.4,
      }}>{sub}</div>}
    </div>
  );
}

// ── Today's claimable items table ───────────────────────────────
function RCTodayItems({ todayItems }) {
  if (!todayItems) return null;
  const allClaimable = todayItems.items.filter(it => it.claimable).reduce((s, it) => s + it.amount, 0);
  return (
    <RCSection title="오늘 진료 항목 · 청구 분석" icon="list-checks"
      actions={
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, fontFamily: "var(--font-sans)" }}>
          <span style={{ color: "var(--text-muted)" }}>{todayItems.visitDate}</span>
          <span style={{ color: "var(--border-default)" }}>·</span>
          <span style={{ color: "var(--text-secondary)" }}>진료의 {todayItems.doctor}</span>
        </div>
      }
    >
      <div style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "70px 1fr 70px 100px 120px",
          padding: "8px 14px", background: "var(--bg-raised)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--text-muted)", fontFamily: "var(--font-sans)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <span>코드</span>
          <span>항목</span>
          <span>구분</span>
          <span style={{ textAlign: "right" }}>금액</span>
          <span style={{ textAlign: "center" }}>청구 가능</span>
        </div>
        {todayItems.items.map((it, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "70px 1fr 70px 100px 120px",
            padding: "10px 14px",
            borderBottom: "1px solid var(--bg-raised)",
            alignItems: "start",
            background: it.claimable ? "var(--bg-surface)" : "var(--bg-raised)",
            opacity: it.claimable ? 1 : 0.65,
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{it.code}</span>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{it.name}</div>
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--text-muted)",
                marginTop: 2, lineHeight: 1.4,
              }}>{it.reason}</div>
            </div>
            <span>
              <span style={{
                display: "inline-block",
                padding: "1px 6px", borderRadius: "var(--radius-sm)",
                background: it.type === "급여" ? "var(--brand-subtle)" : "var(--status-warning-bg)",
                color: it.type === "급여" ? "var(--text-brand)" : "var(--status-warning-text)",
                border: `1px solid ${it.type === "급여" ? "var(--brand-muted)" : "var(--status-warning-border)"}`,
                fontSize: 9, fontWeight: 600, fontFamily: "var(--font-sans)",
              }}>{it.type}</span>
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
              color: "var(--text-primary)", textAlign: "right",
            }}>{rcKRW(it.amount)}</span>
            <span style={{ textAlign: "center" }}>
              {it.claimable ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: "var(--radius-full)",
                  background: "var(--status-success-bg)", color: "var(--status-success-text)",
                  border: "1px solid var(--status-success-border)",
                  fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)",
                }}>
                  <Icon name="check" size={10} /> 가능
                </span>
              ) : (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: "var(--radius-full)",
                  background: "var(--bg-raised)", color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 10, fontWeight: 500, fontFamily: "var(--font-sans)",
                }}>
                  <Icon name="x" size={10} /> 제외
                </span>
              )}
            </span>
          </div>
        ))}
        <div style={{
          display: "grid", gridTemplateColumns: "70px 1fr 70px 100px 120px",
          padding: "10px 14px",
          background: "var(--brand-subtle)",
          borderTop: "2px solid var(--brand-muted)",
        }}>
          <span></span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "var(--text-brand)",
            fontFamily: "var(--font-sans)",
          }}>청구 가능 합계</span>
          <span></span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
            color: "var(--text-brand)", textAlign: "right",
          }}>{rcKRW(allClaimable)}</span>
          <span></span>
        </div>
      </div>
    </RCSection>
  );
}

// ── Insurer-specific procedure & docs guide ─────────────────────
function RCProcedure({ policy, claimable, todayItems }) {
  if (!policy?.enrolled) return null;
  const insurer = RC_INSURERS.find(i => i.id === policy.insurerId);
  const proc = RC_PROCEDURES.default;

  // doc mandatory rules — also escalate by amount
  const docs = proc.docs.map(d => {
    let mandatory = d.mandatory;
    if (d.id === "detail" && claimable >= 200000) mandatory = true;
    if (d.id === "certify" && claimable >= 1000000) mandatory = true;
    return { ...d, mandatory };
  });

  return (
    <RCSection
      title={`${insurer.name} 청구 절차·서류`}
      icon="route"
      actions={
        <span style={{ fontSize: 10, fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}>
          심사기간 {proc.reviewDays}
        </span>
      }
    >
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 16 }}>
        {/* Channels / steps */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "var(--font-sans)", marginBottom: 10,
          }}>접수 채널 & 절차</div>

          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            padding: 12, borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
            marginBottom: 12,
          }}>
            <RCChannelRow icon="smartphone" label={insurer.app} hint="가장 빠름 · 영업일 1~3일" preferred />
            <RCChannelRow icon="globe"      label={insurer.web} hint="홈페이지 마이페이지" />
            <RCChannelRow icon="printer"    label={`팩스 ${insurer.efax}`} hint="서류 송신 후 콜센터 확인 권장" />
            <RCChannelRow icon="phone"      label={insurer.call} hint="콜센터 우편 접수 안내" />
          </div>

          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "var(--font-sans)", marginBottom: 8,
          }}>처리 흐름</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["1", "서류 준비",  "한의원에서 발급된 영수증·세부내역서·진단서를 챙깁니다."],
              ["2", "보험사 접수", `${insurer.app} 앱 또는 팩스로 제출합니다.`],
              ["3", "심사",       `${insurer.name} 심사부에서 ${proc.reviewDays} 내 확인합니다.`],
              ["4", "환급 지급",  "등록된 계좌로 환급액이 입금됩니다."],
            ].map(([n, t, d]) => (
              <div key={n} style={{ display: "flex", gap: 10, padding: "6px 4px" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--brand-subtle)", color: "var(--text-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                  flexShrink: 0, border: "1px solid var(--brand-muted)",
                }}>{n}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{t}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.45 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents checklist */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "var(--font-sans)", marginBottom: 10,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>필요 서류 체크리스트</span>
            <Button variant="ghost" size="sm" icon="file-plus"
              onClick={() => showToast(`서식 발급 화면으로 이동합니다.`)}>
              묶음 발급
            </Button>
          </div>

          <div style={{
            display: "flex", flexDirection: "column", gap: 0,
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)", overflow: "hidden",
          }}>
            {docs.map((d, i) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "9px 12px",
                background: d.mandatory ? "var(--bg-surface)" : "var(--bg-raised)",
                borderBottom: i < docs.length - 1 ? "1px solid var(--bg-raised)" : "none",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "var(--radius-sm)",
                  border: `1.5px solid ${d.mandatory ? "var(--jade-500)" : "var(--border-default)"}`,
                  background: d.mandatory ? "var(--jade-500)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  {d.mandatory && <Icon name="check" size={12} style={{ color: "#fff" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{d.label}</span>
                    {d.mandatory && (
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: "1px 5px", borderRadius: "var(--radius-sm)",
                        background: "var(--status-danger-bg)", color: "var(--status-danger-text)",
                        border: "1px solid var(--status-danger-border)",
                        fontFamily: "var(--font-sans)",
                      }}>필수</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>{d.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RCSection>
  );
}
function RCChannelRow({ icon, label, hint, preferred }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 4px" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "var(--radius-sm)",
        background: preferred ? "var(--jade-500)" : "var(--bg-surface)",
        color: preferred ? "#fff" : "var(--text-secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, border: preferred ? "none" : "1px solid var(--border-default)",
      }}>
        <Icon name={icon} size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 12, fontWeight: preferred ? 700 : 500,
          color: "var(--text-primary)", fontFamily: "var(--font-sans)",
        }}>
          {label}
          {preferred && (
            <span style={{
              marginLeft: 6, fontSize: 9, fontWeight: 700,
              padding: "1px 6px", borderRadius: "var(--radius-full)",
              background: "var(--brand-subtle)", color: "var(--text-brand)",
              border: "1px solid var(--brand-muted)",
            }}>권장</span>
          )}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{hint}</div>
      </div>
    </div>
  );
}

// ── Action bar ──────────────────────────────────────────────────
function RCActionBar({ patient, policy, onSent, onPrintPreview, onQR }) {
  if (!policy?.enrolled) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "12px 18px",
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--border-subtle)",
      boxShadow: "0 -2px 8px rgba(var(--ink-900-rgb), 0.04)",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px",
        background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
      }}>
        <Icon name="user" size={13} style={{ color: "var(--text-muted)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
          {patient.name}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          {patient.phone}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <Button variant="secondary" size="md" icon="qr-code" onClick={onQR}>QR 안내</Button>
      <Button variant="secondary" size="md" icon="printer"
        onClick={onPrintPreview}>A4 인쇄</Button>
      <Button variant="secondary" size="md" icon="message-circle"
        onClick={() => { toastProgress("카카오톡 안내문 전송 중…", `${patient.name} 환자에게 카카오톡 안내가 전송되었습니다`); onSent(); }}>
        카카오톡
      </Button>
      <Button variant="primary" size="md" icon="send"
        onClick={() => { toastProgress("SMS 안내 전송 중…", `${patient.name} 환자(${patient.phone})에게 SMS 안내가 전송되었습니다`); onSent(); }}>
        SMS 안내 전송
      </Button>
    </div>
  );
}

// ── QR modal ────────────────────────────────────────────────────
function RCQRModal({ patient, policy, onClose }) {
  const insurer = RC_INSURERS.find(i => i.id === policy.insurerId);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        padding: 28, width: 380, boxShadow: "var(--shadow-xl)",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
          실비보험 안내
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 18 }}>
          {patient.name} 환자 · {insurer.name}
        </div>

        <div style={{
          width: 220, height: 220, margin: "0 auto",
          background: "var(--bg-raised)",
          border: "8px solid var(--bg-surface)",
          boxShadow: "var(--shadow-md)",
          borderRadius: "var(--radius-md)",
          display: "grid", gridTemplateColumns: "repeat(21, 1fr)",
          padding: 12, gap: 1,
        }}>
          {/* fake QR — deterministic pattern based on patient id */}
          {Array.from({ length: 21 * 21 }).map((_, i) => {
            const seed = (i * 9301 + patient.id * 7919 + 49297) % 233280;
            const on = (seed / 233280) > 0.5;
            // forced finder patterns at 3 corners
            const r = Math.floor(i / 21), c = i % 21;
            const corner = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
            const cornerRing = corner && ((r === 0 || r === 6 || c === 0 || c === 6 ||
                                         r === 14 || r === 20 || c === 14 || c === 20));
            const cornerInner = corner && ((r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                                          (r >= 2 && r <= 4 && c >= 16 && c <= 18) ||
                                          (r >= 16 && r <= 18 && c >= 2 && c <= 4));
            return <div key={i} style={{
              background: (cornerRing || cornerInner || (!corner && on)) ? "var(--ink-900)" : "transparent",
              aspectRatio: "1 / 1",
            }} />;
          })}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>
          대기실 태블릿 / 환자 휴대폰에서 스캔하면<br />
          청구 절차와 필요 서류를 안내받습니다.
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center" }}>
          <Button variant="secondary" size="md" icon="copy" onClick={() => showToast("안내 링크가 복사되었습니다.")}>링크 복사</Button>
          <Button variant="primary" size="md" icon="check" onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}

// ── A4 print preview ────────────────────────────────────────────
function RCPrintPreview({ patient, policy, todayItems, refund, onClose }) {
  const insurer = RC_INSURERS.find(i => i.id === policy.insurerId);
  const gen = RC_GENERATIONS.find(g => g.id === policy.generation);
  const claimable = todayItems?.items.filter(it => it.claimable) || [];
  const claimableTotal = claimable.reduce((s, it) => s + it.amount, 0);
  const proc = RC_PROCEDURES.default;
  const docs = proc.docs.map(d => {
    let mandatory = d.mandatory;
    if (d.id === "detail" && claimableTotal >= 200000) mandatory = true;
    if (d.id === "certify" && claimableTotal >= 1000000) mandatory = true;
    return { ...d, mandatory };
  });

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400,
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
        width: "92%", maxWidth: 880, maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="printer" size={16} style={{ color: "var(--text-secondary)" }} />
          <div style={{ flex: 1, fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
            실비보험 청구 안내문 · A4 미리보기
          </div>
          <Button variant="ghost" size="sm" icon="x" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" icon="printer"
            onClick={() => { toastProgress("프린터로 전송 중…", "안내문 1매가 인쇄되었습니다", 1400); onClose(); }}>
            인쇄
          </Button>
        </div>

        {/* A4 sheet */}
        <div style={{ flex: 1, overflow: "auto", background: "var(--bg-raised)", padding: 24 }}>
          <div style={{
            width: 720, margin: "0 auto",
            background: "#fff", padding: "40px 48px",
            boxShadow: "var(--shadow-md)", borderRadius: 4,
            fontFamily: "var(--font-sans)", color: "#111",
          }}>
            {/* clinic header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #2A5548", paddingBottom: 14, marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, color: "#2A5548", letterSpacing: "-0.01em" }}>
                  자생한의원 강남점
                </div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                  서울특별시 강남구 테헤란로 215, 4층 · TEL 02-555-1234
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#666" }}>
                <div>발급일: {todayItems?.visitDate || "2026-05-16"}</div>
                <div style={{ marginTop: 2 }}>담당: 김민준 원장</div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, marginBottom: 6, textAlign: "center", letterSpacing: "-0.01em" }}>
              실손의료보험 청구 안내
            </div>
            <div style={{ fontSize: 11, color: "#666", textAlign: "center", marginBottom: 22 }}>
              본 안내문은 환자분의 실손의료보험 청구를 돕기 위한 한의원 발행 자료입니다.
            </div>

            {/* Patient + insurance box */}
            <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: 14, marginBottom: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <RCPrintField label="환자명" value={`${patient.name} (${patient.gender}, ${patient.age}세)`} />
              <RCPrintField label="차트번호" value={patient.chartNo} mono />
              <RCPrintField label="보험사" value={insurer.name} />
              <RCPrintField label="가입세대" value={`${gen.id} · ${gen.name}`} />
              <RCPrintField label="증권번호" value={policy.policyNo} mono />
              <RCPrintField label="공제·자기부담" value={`${rcKRW(policy.deductible)} / ${policy.coRate}%`} />
            </div>

            {/* Claimable items */}
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2A5548", marginBottom: 6, letterSpacing: "0.04em" }}>
              ① 오늘 진료 항목 중 청구 가능 내역
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "#f6f4ef" }}>
                  <th style={{ ...rcPrintTh, width: 60 }}>코드</th>
                  <th style={rcPrintTh}>항목</th>
                  <th style={{ ...rcPrintTh, width: 50 }}>구분</th>
                  <th style={{ ...rcPrintTh, width: 80, textAlign: "right" }}>금액</th>
                </tr>
              </thead>
              <tbody>
                {claimable.map((it, i) => (
                  <tr key={i}>
                    <td style={{ ...rcPrintTd, fontFamily: "var(--font-mono)" }}>{it.code}</td>
                    <td style={rcPrintTd}>{it.name}</td>
                    <td style={rcPrintTd}>{it.type}</td>
                    <td style={{ ...rcPrintTd, textAlign: "right", fontFamily: "var(--font-mono)" }}>{rcKRW(it.amount)}</td>
                  </tr>
                ))}
                <tr style={{ background: "#f6f4ef", fontWeight: 700 }}>
                  <td style={rcPrintTd} colSpan={3}>청구 가능 합계</td>
                  <td style={{ ...rcPrintTd, textAlign: "right", fontFamily: "var(--font-mono)" }}>{rcKRW(claimableTotal)}</td>
                </tr>
                <tr style={{ background: "#eaf4f0", fontWeight: 700, color: "#2A5548" }}>
                  <td style={rcPrintTd} colSpan={3}>예상 환급액 (자기부담·공제 차감)</td>
                  <td style={{ ...rcPrintTd, textAlign: "right", fontFamily: "var(--font-mono)" }}>{rcKRW(refund)}</td>
                </tr>
              </tbody>
            </table>

            {/* Procedure */}
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2A5548", marginBottom: 6, letterSpacing: "0.04em" }}>
              ② 청구 절차
            </div>
            <ol style={{ fontSize: 11, lineHeight: 1.7, color: "#333", paddingLeft: 18, marginBottom: 16 }}>
              <li>아래 ③ 필요 서류를 한의원에서 발급받습니다.</li>
              <li><b>{insurer.app}</b> 앱 또는 팩스({insurer.efax})로 {insurer.name}에 접수합니다.</li>
              <li>{insurer.name} 심사부에서 {proc.reviewDays} 내 확인합니다.</li>
              <li>등록된 계좌로 환급액이 입금됩니다. 콜센터: <b>{insurer.call}</b></li>
            </ol>

            {/* Document checklist */}
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2A5548", marginBottom: 6, letterSpacing: "0.04em" }}>
              ③ 필요 서류 체크리스트
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: "10px 14px" }}>
              {docs.map((d, i) => (
                <div key={d.id} style={{
                  padding: "5px 0", display: "flex", gap: 10, alignItems: "center",
                  borderBottom: i < docs.length - 1 ? "1px dashed #eee" : "none",
                  fontSize: 11,
                }}>
                  <span style={{
                    width: 14, height: 14, border: "1.5px solid #333",
                    display: "inline-block", borderRadius: 2, flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: d.mandatory ? 700 : 400 }}>
                    {d.label}
                    {d.mandatory && <span style={{ color: "#B03028", marginLeft: 6, fontWeight: 700 }}>[필수]</span>}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: "#888" }}>{d.note}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 22, padding: 10, background: "#fafaf6", borderRadius: 4, fontSize: 10, color: "#666", lineHeight: 1.6 }}>
              ※ 예상 환급액은 표준약관 기준 추정치로, 실제 지급액은 {insurer.name}의 심사 결과에 따라 달라질 수 있습니다.
              세부 약관·청구 한도는 보험사에 직접 문의해주시기 바랍니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const rcPrintTh = {
  padding: "6px 8px", borderBottom: "1px solid #ddd",
  textAlign: "left", fontWeight: 700, fontSize: 10, color: "#555",
};
const rcPrintTd = {
  padding: "6px 8px", borderBottom: "1px dashed #eee",
  fontSize: 11, color: "#222",
};
function RCPrintField({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#777", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12, color: "#111", marginTop: 2, fontFamily: mono ? "var(--font-mono)" : undefined }}>{value}</div>
    </div>
  );
}

// ── Main screen ─────────────────────────────────────────────────
function RealCostScreen({ onNavigate }) {
  // load eligible patients
  const eligiblePatients = useMmRC(() => {
    return RC_TODAY_ELIGIBLE_IDS.map(id => PP_PATIENTS.find(p => p.id === id)).filter(Boolean);
  }, []);

  const [search, setSearch] = useStRC("");
  const [filter, setFilter] = useStRC("all"); // all | enrolled | nonenrolled | today
  const [activeId, setActiveId] = useStRC(eligiblePatients[0]?.id || null);
  const [claimedIds, setClaimedIds] = useStRC(new Set([8])); // 오세훈 이미 안내됨
  const [showQR, setShowQR] = useStRC(false);
  const [showPrint, setShowPrint] = useStRC(false);

  const filteredPatients = useMmRC(() => {
    let xs = eligiblePatients;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      xs = xs.filter(p => p.name.toLowerCase().includes(q) || p.chartNo.includes(q));
    }
    if (filter === "enrolled") xs = xs.filter(p => RC_PATIENT_POLICIES[p.id]?.enrolled);
    if (filter === "nonenrolled") xs = xs.filter(p => !RC_PATIENT_POLICIES[p.id]?.enrolled);
    if (filter === "today") xs = xs.filter(p => RC_TODAY_ITEMS[p.id]?.visitDate === "2026-05-16");
    return xs;
  }, [eligiblePatients, search, filter]);

  // also add non-enrolled patients into the list for the "all" / "nonenrolled" filter
  const extraNonEnrolled = useMmRC(() => {
    return PP_PATIENTS.filter(p =>
      !eligiblePatients.find(e => e.id === p.id) &&
      RC_PATIENT_POLICIES[p.id] &&
      (filter === "nonenrolled" || filter === "all")
    );
  }, [filter, eligiblePatients]);

  const allShown = [...filteredPatients, ...(filter === "nonenrolled" || (filter === "all" && search.trim()) ? extraNonEnrolled : [])];

  const activePatient = allShown.find(p => p.id === activeId) || allShown[0];
  const activePolicy = activePatient ? RC_PATIENT_POLICIES[activePatient.id] : null;
  const activeToday = activePatient ? RC_TODAY_ITEMS[activePatient.id] : null;

  const activeClaimable = activeToday
    ? activeToday.items.filter(it => it.claimable).reduce((s, it) => s + it.amount, 0)
    : 0;
  const activeRefund = activePolicy ? rcEstimateRefund(activePolicy, activeClaimable) : 0;

  // top-bar stats
  const stats = useMmRC(() => {
    const enrolled = eligiblePatients.filter(p => RC_PATIENT_POLICIES[p.id]?.enrolled).length;
    const totalRefund = eligiblePatients.reduce((s, p) => {
      const policy = RC_PATIENT_POLICIES[p.id];
      const today = RC_TODAY_ITEMS[p.id];
      if (!policy?.enrolled || !today) return s;
      const claimable = today.items.filter(it => it.claimable).reduce((a, it) => a + it.amount, 0);
      return s + rcEstimateRefund(policy, claimable);
    }, 0);
    const inAccident = eligiblePatients.filter(p => RC_TODAY_ITEMS[p.id]?.relatedAccident).length;
    return { eligible: eligiblePatients.length, enrolled, totalRefund, inAccident };
  }, [eligiblePatients]);

  const markSent = () => {
    const n = new Set(claimedIds);
    if (activePatient) n.add(activePatient.id);
    setClaimedIds(n);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="실비보험"
        subtitle="실손의료보험 가입 조회 · 청구 가이드 · 환자 안내"
        actions={<>
          <RCPillStat icon="users" label="안내 대상" value={`${stats.eligible}명`} tone="neutral" />
          <RCPillStat icon="shield-check" label="가입 확인" value={`${stats.enrolled}명`} tone="brand" />
          {stats.inAccident > 0 && <RCPillStat icon="car" label="자보 진행" value={`${stats.inAccident}명`} tone="warning" />}
          <RCPillStat icon="banknote" label="합산 예상 환급" value={rcKRW(stats.totalRefund)} tone="brand" mono />
        </>}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Left list */}
        <div style={{
          width: 320, borderRight: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)", display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          <div style={{
            padding: 12, borderBottom: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                color: "var(--text-muted)", display: "flex",
              }}>
                <Icon name="search" size={13} />
              </span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="환자명·차트번호 검색"
                style={{
                  width: "100%", padding: "7px 10px 7px 28px", fontSize: 12,
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", background: "var(--bg-surface)",
                  outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{
              display: "flex", padding: 2, background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            }}>
              {[
                { k: "all",         label: "전체" },
                { k: "enrolled",    label: "가입" },
                { k: "nonenrolled", label: "미가입" },
                { k: "today",       label: "오늘" },
              ].map(o => (
                <button key={o.k} onClick={() => setFilter(o.k)}
                  style={{
                    flex: 1, padding: "5px 8px", fontSize: 11, fontWeight: 600,
                    background: filter === o.k ? "var(--bg-surface)" : "transparent",
                    color: filter === o.k ? "var(--text-brand)" : "var(--text-muted)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    boxShadow: filter === o.k ? "var(--shadow-sm)" : "none",
                    transition: "all 0.12s",
                  }}>{o.label}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {allShown.map(p => (
              <RCPatientRow
                key={p.id}
                patient={p}
                policy={RC_PATIENT_POLICIES[p.id]}
                isActive={activeId === p.id}
                isClaimed={claimedIds.has(p.id)}
                onClick={() => setActiveId(p.id)}
              />
            ))}
            {allShown.length === 0 && (
              <div style={{
                padding: 40, textAlign: "center", color: "var(--text-muted)",
                fontSize: 12, fontFamily: "var(--font-sans)",
              }}>
                <Icon name="search-x" size={24} style={{ color: "var(--stone-400)", marginBottom: 8 }} />
                <div>해당하는 환자가 없습니다.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {activePatient ? (
            <>
              <div style={{ flex: 1, overflow: "auto", padding: "18px 20px 12px" }}>
                {/* patient header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <Avatar name={activePatient.name} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                      {activePatient.name}
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginLeft: 8, fontFamily: "var(--font-sans)" }}>
                        {activePatient.gender} · {activePatient.age}세 · {activePatient.rrn}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginTop: 2 }}>
                      차트 {activePatient.chartNo} · {activePatient.chief} · {activePatient.phone}
                    </div>
                  </div>
                  {claimedIds.has(activePatient.id) && (
                    <Badge variant="success">
                      <Icon name="check-circle" size={11} style={{ marginRight: 2 }} />
                      안내 완료
                    </Badge>
                  )}
                  {activeToday?.relatedAccident && (
                    <Badge variant="warning">
                      <Icon name="car" size={11} style={{ marginRight: 2 }} />
                      {activeToday.relatedAccident.kind} 진행
                    </Badge>
                  )}
                </div>

                {/* insurance card */}
                <div style={{ marginBottom: 14 }}>
                  <RCInsuranceCard patient={activePatient} policy={activePolicy} />
                </div>

                {/* AI helper */}
                <div style={{ marginBottom: 14 }}>
                  <RCAIHelper patient={activePatient} policy={activePolicy} todayItems={activeToday} refund={activeRefund} />
                </div>

                {/* Today's items */}
                {activeToday && (
                  <div style={{ marginBottom: 14 }}>
                    <RCTodayItems todayItems={activeToday} />
                  </div>
                )}

                {/* Procedure + docs */}
                <RCProcedure policy={activePolicy} claimable={activeClaimable} todayItems={activeToday} />
              </div>

              {/* Action bar */}
              <RCActionBar
                patient={activePatient}
                policy={activePolicy}
                onSent={markSent}
                onPrintPreview={() => setShowPrint(true)}
                onQR={() => setShowQR(true)}
              />
            </>
          ) : (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 10, color: "var(--text-muted)",
            }}>
              <Icon name="shield-plus" size={32} />
              <div style={{ fontSize: 13, fontFamily: "var(--font-sans)" }}>좌측에서 환자를 선택해주세요</div>
            </div>
          )}
        </div>
      </div>

      {showQR && activePatient && activePolicy?.enrolled && (
        <RCQRModal patient={activePatient} policy={activePolicy} onClose={() => setShowQR(false)} />
      )}
      {showPrint && activePatient && activePolicy?.enrolled && (
        <RCPrintPreview
          patient={activePatient} policy={activePolicy}
          todayItems={activeToday} refund={activeRefund}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { RealCostScreen });
