// KoMES — 경영 대시보드 (3가지 레이아웃 변형)
// Variation: brief (임원 브리핑) / dense (정보 밀집) / story (스토리 시각)

const { useState: useStateDV, useMemo: useMemoDV } = React;

// ════════════════════════════════════════════════════════════
// VARIATION A — BRIEF (임원 브리핑형)
// ════════════════════════════════════════════════════════════
function DashboardBrief({ period, showMoM, showYoY }) {
  const p = DASH.byPeriod[period];
  const maxStaffRev = Math.max(...DASH.staff.map(s => s.revenue));

  return (
    <div style={{ padding: "20px 24px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Row 1 — 핵심 KPI 4타일 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <KPITile
          icon="banknote" iconColor="var(--jade-600)"
          label={`${p.label} 매출`}
          value={fmtKRWshort(p.revenue)} unit="원"
          mom={showMoM ? p.mom : undefined}
          yoy={showYoY ? p.yoy : undefined}
          spark={DASH.monthlyTrend.revenue.slice(-7)}
          sparkColor="var(--jade-600)"
        />
        <KPITile
          icon="users" iconColor="var(--accent-pine)"
          label={`${p.label} 환자`}
          value={p.patients.toLocaleString("ko-KR")} unit="명"
          mom={showMoM ? 7.2 : undefined}
          yoy={showYoY ? 12.4 : undefined}
          spark={DASH.monthlyTrend.patients.slice(-7)}
          sparkColor="var(--accent-pine)"
          sub={`신환 ${DASH.patientMix.visitType[0].value} · 재진 ${DASH.patientMix.visitType[1].value}`}
        />
        <KPITile
          icon="file-text" iconColor="var(--accent-slate)"
          label="보험 청구"
          value={p.claims.toLocaleString("ko-KR")} unit="건"
          sub={`승인률 ${Math.round((339 / 385) * 100)}% · 보류 31 · 반려 15`}
        />
        <KPITile
          icon="wallet" iconColor="var(--cinnabar-600)"
          label="미수금"
          value={fmtKRWshort(p.ar)} unit="원"
          mom={showMoM ? 12.0 : undefined}
          sub="총 15건 · 최장 92일"
        />
      </div>

      {/* Row 2 — 큰 매출 차트 + AI 인사이트 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1fr)", gap: 14 }}>
        <Card
          title="월간 매출 추이"
          subtitle={`최근 12개월 · 단위 만원 ${showYoY ? "· 전년 동월 점선 비교" : ""}`}
          icon="line-chart"
          action={
            <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 16, height: 2, background: "var(--brand)" }} /> 올해
              </span>
              {showYoY && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 16, height: 2, background: "var(--ink-300)", borderTop: "1.5px dashed var(--ink-300)" }} /> 전년
                </span>
              )}
            </div>
          }
        >
          <LineChart data={DASH.monthlyTrend} width={720} height={240} showPrev={showYoY} />
          <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
            <Stat label="이번 달 누적" value={fmtKRWshort(p.revenue) + "원"} mom={showMoM ? p.mom : null} yoy={showYoY ? p.yoy : null} />
            <Stat label="일평균" value={fmtKRWshort(p.revenue / 20) + "원"} sub="진료일 기준" />
            <Stat label="객단가" value={fmtKRWshort(Math.round(p.revenue / p.patients)) + "원"} mom={showMoM ? 1.8 : null} />
            <Stat label="월말 예상" value={fmtKRWshort(Math.round(p.revenue * 31 / 20)) + "원"} sub="페이스 기준" />
          </div>
        </Card>

        <Card title="AI 인사이트" icon="sparkles" subtitle="지난 7일 데이터 분석">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DASH.insights.slice(0, 4).map((ins, i) => (
              <AIInsightCard key={i} insight={ins} compact />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3 — 환자 구성 + 청구 + 예약 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Card title="환자 구성" subtitle="이번 달 누적" icon="pie-chart">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut
              segs={DASH.patientMix.insurance.map(x => ({ value: x.value, color: x.color, label: x.label }))}
              size={140} thickness={20}
              centerLabel="환자"
              centerValue={DASH.patientMix.insurance.reduce((a, s) => a + s.value, 0).toLocaleString("ko-KR")}
              centerSub="명"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <DonutLegend segs={DASH.patientMix.insurance} compact />
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans)", fontSize: 11 }}>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>신환 비율</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: "var(--cinnabar-600)" }}>23.2%</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }}>전월 대비</div>
                  <div style={{ marginTop: 4 }}>
                    <ComparisonChip value={DASH.patientMix.momNew - 18.5} label="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="보험 청구" subtitle="이번 달 현황" icon="file-check">
          {DASH.insurance.rows.map(r => <InsuranceClaimRow key={r.key} row={r} />)}
          <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--cinnabar-100)", border: "1px solid var(--cinnabar-200)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--cinnabar-700)" }}>
            <Icon name="alert-circle" size={13} />
            14일 이상 지연 6건 · 즉시 검토 권장
          </div>
        </Card>

        <Card title="예약 점유율" subtitle="이번 주 / 다음 주" icon="calendar-check">
          <div style={{ display: "flex", gap: 14, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
            <BigNumber value={`${DASH.occupancy.weekTotal}%`} label="이번 주" tone="brand" />
            <BigNumber value={`${DASH.occupancy.nextWeekTotal}%`} label="다음 주" tone="muted" />
          </div>
          <OccupancyBars
            days={DASH.occupancy.weekDays}
            valuesA={DASH.occupancy.thisWeek}
            valuesB={DASH.occupancy.nextWeek}
          />
        </Card>
      </div>

      {/* Row 4 — 직원 실적 (넓게) + Top 처방/시술 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 14 }}>
        <Card title="원장/한의사별 진료 실적" subtitle="이번 달 누적 · 매출 기준 정렬" icon="user-cog">
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 80px 130px 80px 60px",
            alignItems: "center", gap: 12,
            padding: "0 0 6px",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            color: "var(--text-muted)", textTransform: "uppercase",
            fontFamily: "var(--font-sans)",
          }}>
            <span style={{ width: 26 }}></span>
            <span>실적 비교</span>
            <span style={{ textAlign: "right" }}>환자</span>
            <span style={{ textAlign: "right" }}>매출</span>
            <span style={{ textAlign: "right" }}>청구</span>
            <span style={{ textAlign: "right" }}>전월</span>
          </div>
          {DASH.staff.map(s => <StaffRow key={s.name} s={s} maxRevenue={maxStaffRev} />)}
        </Card>

        <Card title="Top 처방·시술" subtitle="이번 달" icon="award">
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-sans)", marginBottom: 6 }}>시술 (회)</div>
            {DASH.top.treatments.slice(0, 4).map((t, i) => (
              <TopRow key={i} rank={i + 1} label={t.label} value={t.count.toLocaleString("ko-KR") + "회"} share={t.share} trend={t.trend} />
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-sans)", marginTop: 14, marginBottom: 6 }}>한약 처방</div>
            {DASH.top.herbs.slice(0, 3).map((t, i) => (
              <TopRow key={i} rank={i + 1} label={t.label} value={fmtKRWshort(t.revenue) + "원"} trend={t.trend} />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 5 — 지역 + 내원 경로 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="지역별 환자 분포" subtitle="이번 달 · 환자 수 기준" icon="map-pin">
          <RegionDistribution data={DASH.regions} />
        </Card>

        <Card title="내원 경로" subtitle="신환 기준 · 이번 달" icon="route">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Donut
              segs={DASH.referral.map(x => ({ value: x.value, color: x.color, label: x.label }))}
              size={150} thickness={26}
              centerLabel="지인소개"
              centerValue="38%"
              centerSub="가장 많음"
            />
            <div style={{ flex: 1 }}>
              <DonutLegend segs={DASH.referral} compact showPct={false} />
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                지인 소개 + 재방문이 <strong style={{ color: "var(--text-primary)" }}>50%</strong> — 기존 환자 만족도가 신환 유입의 주요 동력.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── 작은 보조 컴포넌트 ───────────────────────────────────
function Stat({ label, value, mom, yoy, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.1 }}>{value}</div>
      <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
        {mom != null && <ComparisonChip value={mom} label="MoM" />}
        {yoy != null && <ComparisonChip value={yoy} label="YoY" />}
        {sub && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{sub}</span>}
      </div>
    </div>
  );
}

function BigNumber({ value, label, tone = "brand" }) {
  const color = tone === "brand" ? "var(--text-brand)" : "var(--text-secondary)";
  return (
    <div style={{ flex: 1, fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function TopRow({ rank, label, value, share, trend }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "20px 1fr auto 50px", gap: 10,
      alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, color: rank === 1 ? "var(--brand)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}>{rank}.</span>
      <span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontWeight: 600 }}>{value}</span>
      {trend != null && (
        <span style={{
          fontSize: 10.5, fontFamily: "var(--font-mono)", textAlign: "right", fontWeight: 600,
          color: trend >= 0 ? "var(--jade-700)" : "var(--cinnabar-700)",
        }}>{trend >= 0 ? "+" : ""}{trend}%</span>
      )}
    </div>
  );
}

Object.assign(window, { DashboardBrief, Stat, BigNumber, TopRow });
