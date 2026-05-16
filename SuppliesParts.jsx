// KoMES — 소모품 화면 (부속)
// 1) KPI Strip · 2) AI 발주 추천 · 3) 주의 필요 · 4) 진행 중 발주

function SPKpi({ label, value, sub, accent }) {
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

function SPKpiStrip({ items, alerts, openPOs }) {
  const totalValue = items.reduce((s, x) => s + x.stock * x.unitPrice, 0);
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <SPKpi label="등록 품목" value={`${items.length}종`} sub="활성 SKU" />
      <SPKpi label="재고 가치" value={won(totalValue)} sub="현재 단가 기준" />
      <SPKpi label="주의 필요" value={`${alerts.length}건`} sub="부족 · 임박 합계"
        accent={alerts.length ? "var(--cinnabar-700)" : undefined} />
      <SPKpi label="진행 중 발주" value={`${openPOs.length}건`} sub="입고 대기" />
    </div>
  );
}

function SPAICard({ suggestions, onApply, onDismiss, onOpenSettings }) {
  if (!suggestions.length) return null;
  const totalCost = suggestions.reduce((s, x) => s + x.suggestQty * x.unitPrice, 0);
  return (
    <div style={{
      background: "var(--brand-subtle)", border: "1px solid var(--jade-200)",
      borderRadius: "var(--radius-lg)", padding: "16px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sparkles" size={16} style={{ color: "var(--jade-600)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--jade-700)", fontFamily: "var(--font-sans)" }}>
            AI 발주 추천 · {suggestions.length}품목
          </span>
          <span style={{ fontSize: 11, background: "var(--brand-muted)", color: "var(--jade-700)", padding: "2px 9px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)" }}>
            지난 90일 소비 패턴 분석
          </span>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--jade-400)", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: "var(--jade-700)", fontFamily: "var(--font-sans)", lineHeight: 1.5, marginBottom: 12 }}>
        안전 임계치 이하 또는 2주 미만 잔여 품목을 공급처별로 묶어 추천합니다. 적용 시 발주서 초안으로 이동합니다.
      </div>
      <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--jade-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
          <thead>
            <tr style={{ background: "var(--brand-subtle)" }}>
              {["품목", "공급처", "월 소비", "잔여", "추천 수량", "예상 금액"].map(h => (
                <th key={h} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "var(--jade-700)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suggestions.map(s => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--jade-100)" }}>
                <td style={{ padding: "7px 12px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-secondary)" }}>{s.supplier}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{supFmt(s.monthly, s.unit)}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--cinnabar-700)", fontFamily: "var(--font-mono)" }}>{s.daysLeft}일</td>
                <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "var(--jade-700)", fontFamily: "var(--font-mono)" }}>{supFmt(s.suggestQty, s.unit)}</td>
                <td style={{ padding: "7px 12px", fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{won(s.suggestQty * s.unitPrice)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid var(--jade-200)", background: "var(--brand-subtle)" }}>
              <td colSpan={5} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, color: "var(--jade-700)", textAlign: "right" }}>합계</td>
              <td style={{ padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "var(--jade-700)", fontFamily: "var(--font-mono)" }}>{won(totalCost)}</td>
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

function SPAlertSection({ alerts, onPick }) {
  if (!alerts.length) return null;
  return (
    <div style={{
      background: "var(--status-danger-bg)", border: "1px solid var(--cinnabar-200)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
    }}>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--cinnabar-200)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="alert-triangle" size={15} style={{ color: "var(--cinnabar-700)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cinnabar-800)", fontFamily: "var(--font-sans)" }}>주의 필요 · {alerts.length}건</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--cinnabar-700)", fontFamily: "var(--font-sans)" }}>클릭 시 상세 패널 열기</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--cinnabar-200)" }}>
        {alerts.map(a => {
          const st = supStatus(a);
          const dExpiry = a.expiry ? daysUntil(a.expiry) : null;
          const reason = st.key === "critical" ? `잔여 ${supRunOut(a)}일` :
                         st.key === "low"      ? `임계치 ${Math.round((a.threshold - a.stock) / a.threshold * 100)}% 미달` :
                         `유효기간 D-${dExpiry}`;
          return (
            <div key={a.id} onClick={() => onPick(a.id)} style={{
              background: "var(--bg-surface)", padding: "10px 14px", cursor: "pointer",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--status-danger-bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-surface)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                <Badge variant={st.tone}>{st.label}</Badge>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", display: "flex", justifyContent: "space-between" }}>
                <span>{a.category} · {supFmt(a.stock, a.unit)}</span>
                <span style={{ color: "var(--cinnabar-700)", fontFamily: "var(--font-mono)" }}>{reason}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SPOpenPOs({ pos, onOpenHistory }) {
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

Object.assign(window, { SPKpiStrip, SPAICard, SPAlertSection, SPOpenPOs });
