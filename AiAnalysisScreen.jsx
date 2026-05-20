// KoMES — AI 경영 분석 리포트
// 경영 대시보드(DASH) 데이터를 바탕으로 자동 생성된 분석 리포트 형태.
// 차트/카드 컴포넌트는 dashboard* 파일에서 전역으로 로드됨.

function AiReportSection({ no, title, hint, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
          color: "var(--text-brand)", letterSpacing: "0.04em",
        }}>{no}</span>
        <h2 style={{
          fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 500,
          color: "var(--text-primary)", letterSpacing: "-0.01em",
        }}>{title}</h2>
        {hint && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function AiMetric({ label, value, unit, mom, yoy, tone }) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "14px 16px", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
        <span style={{
          fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 26, lineHeight: 1,
          color: tone === "warn" ? "var(--text-warning)" : "var(--text-primary)", letterSpacing: "-0.01em",
        }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
        {mom != null && <ComparisonChip value={mom} label="전월" />}
        {yoy != null && <ComparisonChip value={yoy} label="전년" />}
      </div>
    </div>
  );
}

function AiAnalysisScreen() {
  const p = DASH.byPeriod.month;
  const arCount = 15;
  const claimsHold = 31;

  const goodInsights  = DASH.insights.filter(i => i.tone === "good");
  const riskInsights  = DASH.insights.filter(i => i.tone !== "good");

  const actions = [
    { icon: "file-warning", text: "14일 이상 지연된 보험 청구 6건을 우선 검토해 반려·삭감 리스크를 줄이세요.", tone: "alert" },
    { icon: "wallet",       text: `미수금 ${fmtKRWshort(p.ar)}원(${arCount}건) 중 최장 92일 건부터 수금 안내를 발송하세요.`, tone: "warn" },
    { icon: "trending-up",  text: "자보 환자 급증세에 맞춰 자보 진료 슬롯·인력 배치를 1주 단위로 점검하세요.", tone: "good" },
    { icon: "users",        text: "SNS 광고 전환율이 개선됐습니다. 채널별 ROI를 분석해 예산을 재배분하세요.", tone: "good" },
  ];
  const toneColor = (t) => t === "alert" ? "var(--cinnabar-600)" : t === "warn" ? "var(--amber-600)" : "var(--brand)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="AI 경영 분석"
        subtitle={`${DASH.asOf} 기준 · 자동 생성 리포트`}
        actions={<Button variant="secondary" size="sm" icon="sparkles">리포트 재생성</Button>}
      />

      <main style={{ flex: 1, overflowY: "auto", padding: "26px 36px 60px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* 요약 Hero */}
          <div style={{
            background: "linear-gradient(135deg, var(--jade-900) 0%, var(--jade-700) 100%)",
            borderRadius: "var(--radius-xl)", padding: "26px 30px", color: "var(--stone-50)",
            position: "relative", overflow: "hidden", boxShadow: "var(--shadow-lg)", marginBottom: 28,
          }}>
            <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--jade-200)", fontFamily: "var(--font-sans)" }}>
                <Icon name="sparkles" size={13} /> AI 요약
              </div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 400, lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
                이번 달 매출은 <strong style={{ fontWeight: 600 }}>{fmtKRWshort(p.revenue)}원</strong>으로 전월 대비
                <strong style={{ fontWeight: 600 }}> +{p.mom}%</strong>, 전년 동월 대비 <strong style={{ fontWeight: 600 }}>+{p.yoy}%</strong> 성장했습니다.
                환자 {p.patients.toLocaleString("ko-KR")}명, 신환 비율 23.2%로 전월(18.5%) 대비 +4.7%p 개선됐습니다.
                다만 미수금 {fmtKRWshort(p.ar)}원({arCount}건)과 보험 청구 보류 {claimsHold}건이 누적돼
                <strong style={{ fontWeight: 600 }}> 현금흐름·청구 관리</strong>에 주의가 필요합니다.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                {["성장세 지속", "신환 유입 개선", "청구 보류 주의"].map((t, i) => (
                  <span key={i} style={{
                    fontSize: 11.5, fontWeight: 600, padding: "4px 11px", borderRadius: "var(--radius-full)",
                    background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.20)",
                    fontFamily: "var(--font-sans)",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 1. 핵심 지표 */}
          <AiReportSection no="01" title="핵심 지표" hint="이번 달 누적 · 전월/전년 비교">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <AiMetric label="매출" value={fmtKRWshort(p.revenue)} unit="원" mom={p.mom} yoy={p.yoy} />
              <AiMetric label="환자" value={p.patients.toLocaleString("ko-KR")} unit="명" mom={7.2} yoy={12.4} />
              <AiMetric label="보험 청구" value={p.claims.toLocaleString("ko-KR")} unit="건" />
              <AiMetric label="미수금" value={fmtKRWshort(p.ar)} unit="원" mom={12.0} tone="warn" />
            </div>
          </AiReportSection>

          {/* 2. 매출 추이 */}
          <AiReportSection no="02" title="매출 흐름" hint="최근 12개월 · 단위 만원">
            <Card>
              <LineChart data={DASH.monthlyTrend} width={880} height={240} showPrev />
            </Card>
          </AiReportSection>

          {/* 3. AI 인사이트 */}
          <AiReportSection no="03" title="AI 인사이트" hint="지난 7일 데이터에서 탐지">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {DASH.insights.map((ins, i) => <AIInsightCard key={i} insight={ins} />)}
            </div>
          </AiReportSection>

          {/* 4. 강점 / 리스크 */}
          <AiReportSection no="04" title="강점 · 리스크">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Card title="성장 동력" icon="trending-up" accent="var(--brand)">
                <ul style={{ margin: 0, padding: "4px 0 4px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {goodInsights.map((g, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--text-primary)" }}>{g.title}</strong> — {g.body}
                    </li>
                  ))}
                  <li style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                    객단가 <strong style={{ color: "var(--text-primary)" }}>{fmtKRWshort(Math.round(p.revenue / p.patients))}원</strong> · 안정적 유지
                  </li>
                </ul>
              </Card>
              <Card title="주의 · 리스크" icon="alert-triangle" accent="var(--cinnabar-500)">
                <ul style={{ margin: 0, padding: "4px 0 4px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {riskInsights.map((r, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--text-primary)" }}>{r.title}</strong> — {r.body}
                    </li>
                  ))}
                  <li style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                    미수금 <strong style={{ color: "var(--text-warning)" }}>{fmtKRWshort(p.ar)}원</strong> · 최장 92일 경과
                  </li>
                </ul>
              </Card>
            </div>
          </AiReportSection>

          {/* 5. 권장 액션 */}
          <AiReportSection no="05" title="권장 액션" hint="우선순위 순">
            <Card>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {actions.map((a, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 4px",
                    borderBottom: i < actions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "var(--radius-md)", flexShrink: 0,
                      background: `${toneColor(a.tone)}1A`, color: toneColor(a.tone),
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name={a.icon} size={15} />
                    </span>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1.5, paddingTop: 4 }}>
                      {a.text}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </AiReportSection>

          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", textAlign: "center", marginTop: 8 }}>
            본 리포트는 경영 대시보드 데이터를 기반으로 자동 생성되었습니다 · 참고용
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { AiAnalysisScreen });
