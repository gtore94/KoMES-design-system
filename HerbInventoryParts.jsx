// KoMES — 약재 재고 화면 (부속 컴포넌트)
// 1) KPI Strip · 2) AI 발주 추천 카드 · 3) 주의 필요 섹션 · 4) 진행 중 발주 카드

const { useState: useStHI } = React;

// KPI 한 칸
function HIKpi({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "14px 18px",
      boxShadow: "var(--shadow-sm)", minWidth: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent || "var(--text-primary)", fontFamily: "var(--font-serif)", marginTop: 4, letterSpacing: "-0.01em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function HIKpiStrip({ herbs, alerts, openPOs }) {
  const totalValue = herbs.reduce((s, h) => s + h.stock * h.unitPrice, 0);
  const totalKinds = herbs.length;
  const lowCount   = alerts.length;
  const poInflight = openPOs.length;
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <HIKpi label="등록 약재" value={`${totalKinds}종`} sub="현재 활성 품목" />
      <HIKpi label="재고 가치" value={won(totalValue)} sub="현재 단가 기준" />
      <HIKpi label="주의 필요" value={`${lowCount}건`} sub="부족 · 임박 합계"
        accent={lowCount ? "var(--status-danger-text)" : undefined} />
      <HIKpi label="진행 중 발주" value={`${poInflight}건`} sub="입고 대기" />
    </div>
  );
}

// AI 발주 추천
function HIAICard({ suggestions, onApply, onDismiss, onOpenSettings }) {
  if (!suggestions.length) return null;
  const totalCost = suggestions.reduce((s, x) => s + x.suggestQty * x.unitPrice, 0);
  return (
    <div style={{
      background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)",
      borderRadius: "var(--radius-lg)", padding: "16px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sparkles" size={16} style={{ color: "var(--text-brand)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
            AI 발주 추천 · {suggestions.length}품목
          </span>
          <span style={{ fontSize: 11, background: "var(--brand-muted)", color: "var(--text-brand)", padding: "2px 9px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
            지난 90일 소비 패턴 분석
          </span>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)", lineHeight: 1.5, marginBottom: 12 }}>
        현재 안전 임계치 이하 및 월 평균 소비 대비 2주 미만 잔여 품목을 묶어 추천합니다. 적용 시 발주서 초안으로 이동합니다.
      </div>
      <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-muted)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
          <thead>
            <tr style={{ background: "var(--brand-subtle)" }}>
              {["약재", "월 소비", "잔여", "추천 수량", "예상 금액"].map(h => (
                <th key={h} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "var(--text-brand)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suggestions.map(s => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "7px 12px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{fmtMass(s.monthly)}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--status-danger-text)", fontFamily: "var(--font-mono)" }}>{s.daysLeft}일</td>
                <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>{fmtMass(s.suggestQty)}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{won(s.suggestQty * s.unitPrice)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid var(--brand-muted)", background: "var(--brand-subtle)" }}>
              <td colSpan={4} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, color: "var(--text-brand)", textAlign: "right" }}>합계</td>
              <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>{won(totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button variant="primary" size="sm" icon="check" onClick={onApply}>발주서 초안 만들기</Button>
        <Button variant="ghost" size="sm" icon="settings" onClick={onOpenSettings}>추천 조건 조정</Button>
      </div>
    </div>
  );
}

// 주의 필요 섹션
function HIAlertSection({ alerts, onPick }) {
  if (!alerts.length) return null;
  return (
    <div style={{
      background: "var(--status-danger-bg)", border: "1px solid var(--status-danger-border)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
    }}>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--status-danger-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="alert-triangle" size={15} style={{ color: "var(--status-danger-text)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--status-danger-text)", fontFamily: "var(--font-sans)" }}>주의 필요 · {alerts.length}건</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--status-danger-text)", fontFamily: "var(--font-sans)" }}>클릭 시 상세 패널 열기</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--status-danger-border)" }}>
        {alerts.map(a => {
          const st = herbStatus(a);
          const dExpiry = daysUntil(a.expiry);
          const reason = st.key === "critical" ? `잔여 ${projectedRunOutDays(a)}일` :
                         st.key === "low"      ? `임계치 ${Math.round((a.threshold - a.stock) / a.threshold * 100)}% 미달` :
                         `유효기간 D-${dExpiry}`;
          return (
            <div key={a.id} onClick={() => onPick(a.id)} style={{
              background: "var(--bg-surface)", padding: "10px 14px", cursor: "pointer",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--status-danger-bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-surface)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{a.name}</span>
                <Badge variant={st.tone}>{st.label}</Badge>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", display: "flex", justifyContent: "space-between" }}>
                <span>{a.category} · {fmtMass(a.stock)}</span>
                <span style={{ color: "var(--status-danger-text)", fontFamily: "var(--font-mono)" }}>{reason}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 진행 중 발주 카드
function HIOpenPOs({ pos, onOpenHistory }) {
  if (!pos.length) return null;
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "14px 18px", boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>진행 중 발주</span>
        <Button variant="ghost" size="sm" icon="external-link" onClick={onOpenHistory}>전체 발주 이력</Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {pos.map(p => (
          <div key={p.id} style={{
            display: "grid", gridTemplateColumns: "120px 1fr auto auto auto",
            gap: 12, alignItems: "center", padding: "8px 10px",
            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)",
          }}>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{p.id}</span>
            <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.supplier} · {p.itemCount}품목</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{won(p.total)}</span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>입고 예정 {p.expectedDate}</span>
            <Badge variant={p.status === "발주 완료" ? "brand" : "warning"}>{p.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HIKpiStrip, HIAICard, HIAlertSection, HIOpenPOs });
