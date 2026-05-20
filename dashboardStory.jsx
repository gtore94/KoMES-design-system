// KoMES — 경영 대시보드 Variation C (Story / 스토리 시각형)
// 위→아래 스토리 흐름. Hero 매출 + 사이드 AI, 큰 시각화 위주, 페이지가 흐름을 가짐.

function DashboardStory({ period, showMoM, showYoY }) {
  const p = DASH.byPeriod[period];
  const maxStaffRev = Math.max(...DASH.staff.map(s => s.revenue));
  const mtdProgress = 20 / 31; // 5월 20일 / 31

  return (
    <div style={{ padding: "24px 32px 40px", display: "flex", flexDirection: "column", gap: 32, maxWidth: 1320, margin: "0 auto" }}>

      {/* ── SECTION 1 — Hero (오늘 + 이번 달 매출) ── */}
      <section>
        <SectionHeader eyebrow="01 · 오늘의 진료실" title="2026년 5월 20일, 수요일" hint="오후 2:32 기준" />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.6fr) minmax(0, 1fr)", gap: 18 }}>
          {/* Hero card — 매출 + 큰 차트 */}
          <div style={{
            background: "linear-gradient(135deg, var(--jade-900) 0%, var(--jade-700) 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "28px 32px",
            color: "var(--stone-50)",
            position: "relative", overflow: "hidden",
            boxShadow: "var(--shadow-lg)",
          }}>
            {/* 배경 장식 — 한지 텍스처 느낌의 가벼운 원 */}
            <div style={{ position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", right: 40, bottom: -80, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "var(--jade-200)", fontFamily: "var(--font-sans)", textTransform: "uppercase" }}>
                  {DASH.byPeriod[period].label} 매출
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {fmtKRWshort(p.revenue)}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--jade-200)", fontFamily: "var(--font-sans)" }}>원</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
                  {showMoM && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 12, fontWeight: 600,
                      background: "rgba(255,255,255,0.14)", color: "var(--stone-50)",
                      border: "1px solid rgba(255,255,255,0.20)",
                      borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "4px 11px",
                      fontFamily: "var(--font-sans)",
                    }}>
                      <Icon name="trending-up" size={12} />
                      전월 대비 <span style={{ fontFamily: "var(--font-mono)" }}>+{p.mom}%</span>
                    </span>
                  )}
                  {showYoY && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 12, fontWeight: 600,
                      background: "rgba(255,255,255,0.14)", color: "var(--stone-50)",
                      border: "1px solid rgba(255,255,255,0.20)",
                      borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "4px 11px",
                      fontFamily: "var(--font-sans)",
                    }}>
                      <Icon name="calendar" size={12} />
                      전년 동월 <span style={{ fontFamily: "var(--font-mono)" }}>+{p.yoy}%</span>
                    </span>
                  )}
                </div>

                {/* 월 진행률 + 예상 */}
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--jade-200)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>
                    <span>5월 진행률 · 20/31일</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{Math.round(mtdProgress * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.10)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ width: `${mtdProgress * 100}%`, height: "100%", background: "var(--jade-200)", borderRadius: "var(--radius-full)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--jade-200)" }}>
                    <span>월말 예상 <strong style={{ color: "var(--stone-50)", fontFamily: "var(--font-mono)", fontSize: 14 }}>{fmtKRWshort(Math.round(p.revenue / mtdProgress))}원</strong></span>
                    <span>목표 대비 <strong style={{ color: "var(--jade-200)", fontFamily: "var(--font-mono)", fontSize: 14 }}>104%</strong></span>
                  </div>
                </div>
              </div>

              {/* 작은 일별 스파크 */}
              <div style={{ width: 280, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--jade-200)", fontFamily: "var(--font-sans)", marginBottom: 4 }}>최근 7개월 추이</div>
                <Sparkline values={DASH.monthlyTrend.revenue.slice(-7)} width={280} height={90} color="var(--jade-200)" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--jade-300)" }}>
                  {DASH.monthlyTrend.months.slice(-7).map((m, i) => <span key={i}>{m}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* 사이드 — 오늘 미니 KPI 4개 + 알림 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SideMetric label="오늘 환자" value={DASH.today.patients} unit="명" sub={`신환 ${DASH.today.newPatients} · 재진 ${DASH.today.returning}`} icon="users" color="var(--accent-pine)" />
            <SideMetric label="오늘 예약" value={`${Math.round(DASH.today.schedule.shown / DASH.today.schedule.booked * 100)}%`} sub={`예약 ${DASH.today.schedule.booked} · 노쇼 ${DASH.today.schedule.noShow}`} icon="calendar" color="var(--accent-slate)" />
            <SideMetric label="청구 대기" value={DASH.today.awaitingClaim} unit="건" sub="오늘 수납 완료 중" icon="file-text" color="var(--amber-600)" />
            <SideMetric label="수금 대기" value={DASH.today.awaitingPayment} unit="건" sub="결제 미완료" icon="wallet" color="var(--cinnabar-600)" />
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — 흐름 (월간 매출 큰 차트) ── */}
      <section>
        <SectionHeader eyebrow="02 · 12개월 흐름" title="매출은 어디로 가고 있나" hint={`전월 대비 ${fmtPct(DASH.byPeriod.month.mom)} · 전년 동월 대비 ${fmtPct(DASH.byPeriod.month.yoy)}`} />
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 28 }}>
              <NumberStat label="올해 누적" value={fmtKRWshort(DASH.byPeriod.year.revenue) + "원"} mom={null} yoy={showYoY ? DASH.byPeriod.year.yoy : null} />
              <NumberStat label="이번 달 누적" value={fmtKRWshort(DASH.byPeriod.month.revenue) + "원"} mom={showMoM ? DASH.byPeriod.month.mom : null} />
              <NumberStat label="일평균" value={fmtKRWshort(DASH.byPeriod.month.revenue / 20) + "원"} />
              <NumberStat label="객단가" value={fmtKRWshort(Math.round(DASH.byPeriod.month.revenue / DASH.byPeriod.month.patients)) + "원"} />
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 18, height: 2, background: "var(--brand)" }} /> 2025–2026
              </span>
              {showYoY && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 18, borderTop: "2px dashed var(--ink-300)", display: "inline-block" }} /> 2024–2025
                </span>
              )}
            </div>
          </div>
          <LineChart data={DASH.monthlyTrend} width={1180} height={300} showPrev={showYoY} yTicks={5} />
        </div>
      </section>

      {/* ── SECTION 3 — 환자 + 청구 (2 col) ── */}
      <section>
        <SectionHeader eyebrow="03 · 누가 왔고, 보험은 어떻게 흘렀나" title="환자 구성과 청구 현황" />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)", gap: 18 }}>
          {/* 환자 구성 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
            <SubHeading icon="users" title="환자 구성" hint="이번 달 642명" />
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, marginTop: 16, alignItems: "center" }}>
              <Donut
                segs={DASH.patientMix.insurance.map(x => ({ value: x.value, color: x.color, label: x.label }))}
                size={180} thickness={26}
                centerLabel="신환 비율"
                centerValue="23.2%"
                centerSub="+4.7p MoM"
              />
              <DonutLegend segs={DASH.patientMix.insurance} />
            </div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>연령대 분포</div>
              <BarChart
                categories={DASH.patientMix.age.map(a => a.label)}
                values={DASH.patientMix.age.map(a => a.value)}
                width={460} height={120} color="var(--accent-pine)"
                valueFmt={(v) => v + "%"}
              />
            </div>
          </div>

          {/* 청구 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
            <SubHeading icon="file-check" title="보험 청구 흐름" hint="이번 달 ₩49.2M 청구" />
            <div style={{ marginTop: 4 }}>
              {DASH.insurance.rows.map(r => <InsuranceClaimRow key={r.key} row={r} />)}
            </div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>보류 aging — 14일 이상은 즉시 조치</div>
              <BarChart
                categories={DASH.insurance.aging.map(a => a.range)}
                values={DASH.insurance.aging.map(a => a.count)}
                width={460} height={120}
                color="var(--amber-500)" valueFmt={(v) => v + "건"}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — 사람 (직원/원장 실적) ── */}
      <section>
        <SectionHeader eyebrow="04 · 원장님과 한의사들" title="누가 얼마나 진료했나" hint="이번 달 매출 기준 정렬" />
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 80px 130px 80px 60px",
            alignItems: "center", gap: 12,
            padding: "0 0 8px",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            color: "var(--text-muted)", textTransform: "uppercase",
            fontFamily: "var(--font-sans)",
          }}>
            <span style={{ width: 26 }}></span>
            <span>실적 비교 (매출 대비)</span>
            <span style={{ textAlign: "right" }}>환자</span>
            <span style={{ textAlign: "right" }}>매출</span>
            <span style={{ textAlign: "right" }}>청구</span>
            <span style={{ textAlign: "right" }}>전월</span>
          </div>
          {DASH.staff.map(s => <StaffRow key={s.name} s={s} maxRevenue={maxStaffRev} />)}
        </div>
      </section>

      {/* ── SECTION 5 — 어디서, 어떻게 왔나 ── */}
      <section>
        <SectionHeader eyebrow="05 · 어디서, 어떻게" title="환자는 어디서 오는가" />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 18 }}>
          {/* 지역 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
            <SubHeading icon="map-pin" title="지역별 분포" hint="이번 달 신환 + 재진 환자 기준" />
            <div style={{ marginTop: 16 }}>
              <RegionDistribution data={DASH.regions} />
            </div>
          </div>
          {/* 내원 경로 */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
            <SubHeading icon="route" title="내원 경로" hint="신환 기준" />
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 16 }}>
              <Donut
                segs={DASH.referral.map(x => ({ value: x.value, color: x.color, label: x.label }))}
                size={170} thickness={28}
                centerLabel="지인 + 재방문"
                centerValue="50%"
                centerSub="환자 만족도가 동력"
              />
              <div style={{ flex: 1 }}>
                <DonutLegend segs={DASH.referral} showPct={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — Top 처방·시술 + 예약 점유 ── */}
      <section>
        <SectionHeader eyebrow="06 · 잘 나가는 것들" title="Top 처방 · 시술 · 그리고 예약" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Card title="Top 시술 (회)" icon="activity" padding={16}>
            {DASH.top.treatments.slice(0, 5).map((t, i) => (
              <TopRow key={i} rank={i + 1} label={t.label} value={t.count + "회"} trend={t.trend} />
            ))}
          </Card>
          <Card title="Top 한약 처방 (매출)" icon="flask-conical" padding={16}>
            {DASH.top.herbs.map((t, i) => (
              <TopRow key={i} rank={i + 1} label={t.label} value={fmtKRWshort(t.revenue) + "원"} trend={t.trend} />
            ))}
          </Card>
          <Card title="예약 점유율" subtitle="이번 주 78% · 다음 주 64%" icon="calendar-check" padding={16}>
            <OccupancyBars
              days={DASH.occupancy.weekDays}
              valuesA={DASH.occupancy.thisWeek}
              valuesB={DASH.occupancy.nextWeek}
            />
          </Card>
        </div>
      </section>

      {/* ── SECTION 7 — AI 인사이트 (펼쳐서) ── */}
      <section>
        <SectionHeader eyebrow="07 · AI가 본 이번 달" title="놓치면 안 될 신호들" hint="지난 7일 데이터 기반 자동 분석" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {DASH.insights.map((ins, i) => <AIInsightCard key={i} insight={ins} />)}
        </div>
      </section>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────
function SideMetric({ label, value, unit, sub, icon, color }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 4,
      fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 22, height: 22, borderRadius: "var(--radius-sm)",
          background: `${color}1A`, color, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={12} />
        </span>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{value}</span>
        {unit && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{unit}</span>}
      </div>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</span>
    </div>
  );
}

function SubHeading({ icon, title, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <Icon name={icon} size={14} style={{ color: "var(--text-secondary)", alignSelf: "center" }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</span>
      {hint && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>· {hint}</span>}
    </div>
  );
}

function NumberStat({ label, value, mom, yoy }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em", marginTop: 2 }}>{value}</div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {mom != null && <ComparisonChip value={mom} label="MoM" />}
        {yoy != null && <ComparisonChip value={yoy} label="YoY" />}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardStory, SideMetric, SubHeading, NumberStat });
