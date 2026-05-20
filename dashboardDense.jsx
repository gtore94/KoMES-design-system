// KoMES — 경영 대시보드 Variation B (Dense / 정보 밀집형)
// 한 화면에 모든 지표를 컴팩트하게 표시. 좁은 KPI 6개 + 미니 카드 그리드.

function DashboardDense({ period, showMoM, showYoY }) {
  const p = DASH.byPeriod[period];
  const maxStaffRev = Math.max(...DASH.staff.map(s => s.revenue));
  const claimsTotal = DASH.insurance.rows.reduce((a, r) => a + r.total, 0);
  const claimsOk    = DASH.insurance.rows.reduce((a, r) => a + r.ok, 0);

  return (
    <div style={{ padding: "14px 18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Row 1 — 6 narrow KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <MiniKPI icon="banknote"   iconColor="var(--jade-600)"    label="매출"     value={fmtKRWshort(p.revenue)} mom={showMoM ? p.mom : null} yoy={showYoY ? p.yoy : null} />
        <MiniKPI icon="users"      iconColor="var(--accent-pine)" label="환자"     value={p.patients.toLocaleString("ko-KR")} unit="명" mom={showMoM ? 7.2 : null} yoy={showYoY ? 12.4 : null} />
        <MiniKPI icon="user-plus"  iconColor="var(--cinnabar-600)" label="신환"    value={DASH.patientMix.visitType[0].value} unit="명" mom={showMoM ? 25.6 : null} />
        <MiniKPI icon="file-text"  iconColor="var(--accent-slate)" label="청구"    value={claimsTotal} unit="건" sub={`승인 ${Math.round(claimsOk / claimsTotal * 100)}%`} />
        <MiniKPI icon="calendar"   iconColor="var(--amber-600)"    label="예약점유" value={`${DASH.occupancy.weekTotal}%`} sub={`다음 ${DASH.occupancy.nextWeekTotal}%`} />
        <MiniKPI icon="wallet"     iconColor="var(--cinnabar-700)" label="미수금"  value={fmtKRWshort(p.ar)} mom={showMoM ? 12.0 : null} />
      </div>

      {/* Row 2 — Revenue trend (wide) + Patient mix + Insurance summary */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
        <Card title="월간 매출 추이" subtitle="12개월 · 만원" icon="line-chart" padding={12} compact>
          <LineChart data={DASH.monthlyTrend} width={520} height={180} showPrev={showYoY} yTicks={4} />
        </Card>

        <Card title="환자 구성" icon="pie-chart" padding={12} compact>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Donut
              segs={DASH.patientMix.insurance.map(x => ({ value: x.value, color: x.color, label: x.label }))}
              size={120} thickness={18}
              centerValue="642" centerSub="명"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <DonutLegend segs={DASH.patientMix.insurance} compact />
            </div>
          </div>
        </Card>

        <Card title="보험 청구" icon="file-check" padding={12} compact>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DASH.insurance.rows.map(r => (
              <div key={r.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: r.color }} />
                  <span style={{ fontSize: 11.5, color: "var(--text-primary)", fontWeight: 500 }}>{r.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{r.total}건</span>
                </div>
                <StackedRow segs={[
                  { label: "승인", value: r.ok, color: "var(--jade-500)" },
                  { label: "보류", value: r.hold, color: "var(--amber-500)" },
                  { label: "반려", value: r.reject, color: "var(--cinnabar-500)" },
                ]} height={6} />
              </div>
            ))}
            <div style={{ marginTop: 4, padding: "6px 8px", background: "var(--cinnabar-100)", borderRadius: "var(--radius-sm)", fontSize: 10.5, color: "var(--cinnabar-700)", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="alert-circle" size={11} />14일+ 지연 6건
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3 — Staff (wide) + AI insights stack */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr)", gap: 10 }}>
        <Card title="직원별 실적" subtitle="이번 달 · 매출 순" icon="user-cog" padding={12} compact>
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 64px 90px 60px",
            alignItems: "center", gap: 10,
            padding: "0 0 5px",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            color: "var(--text-muted)", textTransform: "uppercase",
            fontFamily: "var(--font-sans)",
          }}>
            <span style={{ width: 26 }}></span>
            <span>비교</span>
            <span style={{ textAlign: "right" }}>환자</span>
            <span style={{ textAlign: "right" }}>매출</span>
            <span style={{ textAlign: "right" }}>전월</span>
          </div>
          {DASH.staff.map(s => <StaffRow key={s.name} s={s} maxRevenue={maxStaffRev} compact />)}
        </Card>

        <Card title="AI 인사이트" icon="sparkles" padding={10} compact>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DASH.insights.slice(0, 3).map((ins, i) => <AIInsightCard key={i} insight={ins} compact />)}
          </div>
        </Card>
      </div>

      {/* Row 4 — Top treatments + Top herbs + Regions + Referrals — 4 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        <Card title="Top 시술" icon="activity" padding={12} compact>
          {DASH.top.treatments.slice(0, 5).map((t, i) => (
            <TopRow key={i} rank={i + 1} label={t.label} value={t.count + "회"} trend={t.trend} />
          ))}
        </Card>
        <Card title="Top 한약" icon="flask-conical" padding={12} compact>
          {DASH.top.herbs.map((t, i) => (
            <TopRow key={i} rank={i + 1} label={t.label} value={fmtKRWshort(t.revenue)} trend={t.trend} />
          ))}
        </Card>
        <Card title="지역 분포" icon="map-pin" padding={12} compact>
          <RegionDistribution data={DASH.regions} />
        </Card>
        <Card title="내원 경로" icon="route" padding={12} compact>
          <Donut
            segs={DASH.referral.map(x => ({ value: x.value, color: x.color, label: x.label }))}
            size={130} thickness={20}
            centerValue="38%" centerSub="지인 소개"
          />
          <div style={{ marginTop: 8 }}>
            <DonutLegend segs={DASH.referral.slice(0, 4)} compact showPct={false} />
          </div>
        </Card>
      </div>

      {/* Row 5 — 예약 점유 + 일평균 흐름 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
        <Card title="예약 점유율 · 요일" subtitle="이번 주 vs 다음 주" icon="calendar-check" padding={12} compact>
          <OccupancyBars
            days={DASH.occupancy.weekDays}
            valuesA={DASH.occupancy.thisWeek}
            valuesB={DASH.occupancy.nextWeek}
          />
        </Card>
        <Card title="청구 보류 aging" subtitle="보류 일수 분포" icon="clock" padding={12} compact>
          <BarChart
            categories={DASH.insurance.aging.map(a => a.range)}
            values={DASH.insurance.aging.map(a => a.count)}
            width={420} height={140}
            color="var(--amber-500)"
            valueFmt={(v) => v + "건"}
          />
        </Card>
      </div>
    </div>
  );
}

// ─── MiniKPI ───────────────────────────────────────────────
function MiniKPI({ icon, iconColor, label, value, unit, mom, yoy, sub }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "10px 12px",
      boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: iconColor, display: "flex", flexShrink: 0 }}><Icon name={icon} size={12} /></span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, fontFamily: "var(--font-sans)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.01em" }}>{value}</span>
        {unit && <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        {mom != null && <ComparisonChip value={mom} label="" />}
        {yoy != null && <ComparisonChip value={yoy} label="" />}
        {sub && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{sub}</span>}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardDense, MiniKPI });
