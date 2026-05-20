// KoMES — 경영 대시보드 메인 화면
// TopBar + 변형 선택 + 기간/비교 컨트롤 + 알림 + 변형별 본문 렌더

const { useState: useStateMain, useEffect: useEffectMain } = React;

function DashboardScreen() {
  // 상태 — localStorage에 저장
  const [variation, setVariation] = useStateMain(() => localStorage.getItem("komes_dash_var") || "brief");
  const [period, setPeriod]       = useStateMain(() => localStorage.getItem("komes_dash_period") || "month");
  const [showMoM, setShowMoM]     = useStateMain(() => localStorage.getItem("komes_dash_mom") !== "false");
  const [showYoY, setShowYoY]     = useStateMain(() => localStorage.getItem("komes_dash_yoy") !== "false");
  const [showAlerts, setShowAlerts] = useStateMain(() => localStorage.getItem("komes_dash_alerts") !== "false");

  useEffectMain(() => { localStorage.setItem("komes_dash_var", variation); }, [variation]);
  useEffectMain(() => { localStorage.setItem("komes_dash_period", period); }, [period]);
  useEffectMain(() => { localStorage.setItem("komes_dash_mom", showMoM); }, [showMoM]);
  useEffectMain(() => { localStorage.setItem("komes_dash_yoy", showYoY); }, [showYoY]);
  useEffectMain(() => { localStorage.setItem("komes_dash_alerts", showAlerts); }, [showAlerts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }} data-screen-label="경영 대시보드">
      <TopBar
        title="경영 대시보드"
        subtitle={`다인 한의원 · ${DASH.asOf}`}
        actions={
          <>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
            <CompareToggle mom={showMoM} yoy={showYoY} onChangeMom={setShowMoM} onChangeYoy={setShowYoY} />
            <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
            <Button variant="secondary" size="sm" icon="download">내보내기</Button>
          </>
        }
      />

      {/* 변형 선택 바 — 상단 보조 라인 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 24px",
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        }}>레이아웃 변형</span>
        <div style={{
          display: "inline-flex", background: "var(--bg-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: 2,
        }}>
          {[
            { key: "brief", label: "Brief", desc: "임원 브리핑", icon: "layout-grid" },
            { key: "dense", label: "Dense", desc: "정보 밀집",   icon: "rows-3"      },
            { key: "story", label: "Story", desc: "스토리 시각", icon: "book-open"   },
          ].map(v => (
            <button key={v.key} onClick={() => setVariation(v.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 500,
              padding: "5px 12px", borderRadius: "var(--radius-sm)",
              background: variation === v.key ? "var(--bg-surface)" : "transparent",
              color: variation === v.key ? "var(--text-primary)" : "var(--text-muted)",
              border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
              boxShadow: variation === v.key ? "var(--shadow-sm)" : "none",
            }}>
              <Icon name={v.icon} size={12} />
              <span>{v.label}</span>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 400 }}>· {v.desc}</span>
            </button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {DASH.byPeriod[period].label} · {fmtKRW(DASH.byPeriod[period].revenue)} · 환자 {DASH.byPeriod[period].patients}명
        </span>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <input
            type="checkbox"
            checked={showAlerts}
            onChange={(e) => setShowAlerts(e.target.checked)}
            style={{ accentColor: "var(--brand)" }}
          />
          상단 알림
        </label>
      </div>

      {/* 알림 배너 */}
      {showAlerts && <AlertBanner alerts={DASH.alerts} />}

      {/* 본문 — 변형별 */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {variation === "brief" && <DashboardBrief period={period} showMoM={showMoM} showYoY={showYoY} />}
        {variation === "dense" && <DashboardDense period={period} showMoM={showMoM} showYoY={showYoY} />}
        {variation === "story" && <DashboardStory period={period} showMoM={showMoM} showYoY={showYoY} />}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
