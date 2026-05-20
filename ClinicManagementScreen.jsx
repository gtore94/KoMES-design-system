// 병원 관리 화면 — 좌측 서브탭 + 우측 폼 (Layout A 패턴)
// 권한별 표시: 원장 = 편집, 데스크 = 일부 잠금/읽기 전용
// "권한 미리보기" 토글로 데스크 시각 확인 가능 (개발/시연용)

const { useState: useStateCM } = React;

function ClinicManagementScreen() {
  const [tab, setTab] = useStateCM(() => localStorage.getItem("komes_clinic_tab") || "identity");
  const [role, setRole] = useStateCM(() => localStorage.getItem("komes_clinic_role") || "원장");
  const [alertCenter, setAlertCenter] = useStateCM(null);  // null | "rules" | "history" | "log"

  React.useEffect(() => { localStorage.setItem("komes_clinic_tab", tab); }, [tab]);
  React.useEffect(() => { localStorage.setItem("komes_clinic_role", role); }, [role]);

  // 섹션을 그룹별로 묶음
  const grouped = React.useMemo(() => {
    const m = {};
    SECTIONS.forEach(s => { (m[s.group] = m[s.group] || []).push(s); });
    return m;
  }, []);

  // 섹션별 알림 개수 (가장 높은 severity 기준 점 색상)
  const alertsBySection = React.useMemo(() => {
    const m = {};
    ALERTS.forEach(a => {
      if (!a.jump) return;
      const cur = m[a.jump] || { count: 0, severity: "info" };
      cur.count += 1;
      // critical > warning > info
      const rank = { critical: 0, warning: 1, info: 2 };
      if (rank[a.severity] < rank[cur.severity]) cur.severity = a.severity;
      m[a.jump] = cur;
    });
    return m;
  }, []);

  const current = SECTIONS.find(s => s.id === tab);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--bg-page)",
    }}>
      <TopBar
        title="병원 관리"
        subtitle="한의원 운영에 필요한 모든 설정을 한 곳에서"
        actions={<>
          {/* 권한 미리보기 — 시연/QA 용도 */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 2,
            padding: 2, background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}>
            {["원장", "데스크"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 500,
                background: role === r ? "var(--bg-surface)" : "transparent",
                color: role === r ? "var(--text-primary)" : "var(--text-muted)",
                border: role === r ? "1px solid var(--border-default)" : "1px solid transparent",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                boxShadow: role === r ? "var(--shadow-sm)" : "none",
              }}>{r === "원장" ? "원장 보기" : "데스크 보기"}</button>
            ))}
          </div>
          <RoleBadge role={role} />
          <Button variant="secondary" size="sm" icon="bell" onClick={() => setAlertCenter("history")}>
            알림 센터
          </Button>
          <Button variant="ghost" size="sm" icon="external-link">공개 페이지</Button>
        </>}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 서브 사이드바 */}
        <aside style={{
          width: 224, flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          padding: "16px 10px", overflowY: "auto",
        }}>
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} style={{ marginBottom: 12 }}>
              <div style={{
                padding: "4px 10px 6px",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                color: "var(--text-muted)", textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
              }}>{groupName}</div>
              {items.map(s => {
                const p = permFor(role, s.id);
                const active = tab === s.id;
                const al = alertsBySection[s.id];
                const sevColor = al && (
                  al.severity === "critical" ? "var(--cinnabar-600)" :
                  al.severity === "warning"  ? "var(--amber-500)"    :
                                                "var(--brand)"
                );
                return (
                  <button key={s.id} onClick={() => setTab(s.id)} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    width: "100%", padding: "7px 10px",
                    border: "none",
                    background: active ? "var(--brand-subtle)" : "transparent",
                    color: active ? "var(--text-brand)" : "var(--text-secondary)",
                    fontFamily: "var(--font-sans)", fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer", marginBottom: 1,
                    textAlign: "left", opacity: p === "locked" ? 0.6 : 1,
                  }}>
                    <Icon name={s.icon} size={14} />
                    <span style={{ flex: 1 }}>{s.label}</span>
                    {al && (
                      <span title={`알림 ${al.count}건`} style={{
                        display: "inline-flex", alignItems: "center",
                        justifyContent: "center",
                        minWidth: 16, height: 16, padding: "0 5px",
                        borderRadius: "var(--radius-full)",
                        background: sevColor, color: "var(--text-on-brand)",
                        fontSize: 9.5, fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                      }}>{al.count}</span>
                    )}
                    {p === "locked" && <Icon name="lock" size={11} style={{ color: "var(--text-muted)" }} />}
                    {p === "read" && <Icon name="eye" size={11} style={{ color: "var(--text-muted)" }} />}
                  </button>
                );
              })}
            </div>
          ))}

          {/* 시스템 상태 미니 카드 — 알림 상태 반영 */}
          {(() => {
            const counts = ALERTS.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m; }, {});
            const tone = counts.critical ? "critical" : counts.warning ? "warning" : "ok";
            const meta = tone === "critical"
              ? { dot: "var(--cinnabar-600)", title: `긴급 알림 ${counts.critical}건`, hint: counts.warning ? `주의 ${counts.warning}건 동반` : "즉시 확인 필요" }
              : tone === "warning"
              ? { dot: "var(--amber-500)",    title: `주의 알림 ${counts.warning}건`,  hint: "조만간 확인 필요" }
              : { dot: "var(--brand)",        title: "모든 시스템 정상",                hint: "동기화 · 4분 전" };
            return (
              <div style={{
                marginTop: 16, padding: "10px 12px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: 11, color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "var(--radius-full)",
                    background: meta.dot,
                  }} />
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{meta.title}</span>
                </div>
                <div style={{ fontFamily: tone === "ok" ? "var(--font-mono)" : "var(--font-sans)", fontSize: 10.5 }}>
                  {meta.hint}
                </div>
              </div>
            );
          })()}
        </aside>

        {/* 메인 콘텐츠 */}
        {tab === "staff" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <StaffManagementScreen />
          </div>
        ) : (
          <main style={{ flex: 1, overflowY: "auto", padding: "26px 36px 60px" }}>
            <div style={{ maxWidth: 880 }}>
              {/* 알림 배너 */}
              <NotificationBanner
                alerts={ALERTS}
                role={role}
                onJump={(id) => setTab(id)}
                onOpenSettings={() => setAlertCenter("rules")}
                onOpenHistory={() => setAlertCenter("history")}
              />

              {/* breadcrumb */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: 14, fontSize: 12, color: "var(--text-muted)",
                fontFamily: "var(--font-sans)",
              }}>
                <span>병원 관리</span>
                <Icon name="chevron-right" size={11} />
                <span style={{ color: "var(--text-secondary)" }}>{current?.group}</span>
                <Icon name="chevron-right" size={11} />
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {current?.label}
                </span>
              </div>
              {renderSection(tab, role)}
            </div>
          </main>
        )}
      </div>

      <AlertCenterModal
        open={alertCenter !== null}
        onClose={() => setAlertCenter(null)}
        initialTab={alertCenter || "rules"}
        role={role}
      />

      <ClinicToaster />
    </div>
  );
}

Object.assign(window, { ClinicManagementScreen });
