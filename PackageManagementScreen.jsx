// KoMES — 패키지 관리 (카탈로그 + 등록 환자)
const { useState: useStatePkg, useMemo: useMemoPkg } = React;

const KRW = n => "₩" + n.toLocaleString("ko-KR");

const ENR_STATUS = {
  active:    { label: "진행중", variant: "success", icon: "play",          dot: "var(--jade-500)" },
  paused:    { label: "일시중지", variant: "warning", icon: "pause",        dot: "var(--amber-500)" },
  completed: { label: "완료",   variant: "neutral", icon: "check-circle-2", dot: "var(--ink-300)" },
  expired:   { label: "만료",   variant: "danger",  icon: "circle-x",       dot: "var(--cinnabar-600)" },
  refunded:  { label: "환불",   variant: "neutral", icon: "rotate-ccw",     dot: "var(--ink-300)" },
};

const PKG_STATUS = {
  active:       { label: "판매중",   variant: "success", icon: "check"      },
  paused:       { label: "일시중지", variant: "warning", icon: "pause"      },
  discontinued: { label: "단종",     variant: "neutral", icon: "archive"    },
};

function PackageManagementScreen() {
  const [tab, setTab]             = useStatePkg("catalog"); // catalog | enroll
  const [view, setView]           = useStatePkg("card");    // card | table  (catalog only)
  const [search, setSearch]       = useStatePkg("");
  const [category, setCategory]   = useStatePkg("all");
  const [pkgStatus, setPkgStatus] = useStatePkg("all");
  const [enrStatus, setEnrStatus] = useStatePkg("active");
  const [expSoon, setExpSoon]     = useStatePkg(false);
  const [selPkg, setSelPkg]       = useStatePkg(null);
  const [selEnr, setSelEnr]       = useStatePkg(null);
  const [newPkgOpen, setNewPkgOpen] = useStatePkg(false);

  const totalActivePkg = PACKAGES.filter(p => p.status === "active").length;
  const totalEnrollAct = ENROLLMENTS.filter(e => e.status === "active").length;
  const expiringSoon   = ENROLLMENTS.filter(e => e.status === "active" && e.daysLeft >= 0 && e.daysLeft <= 7).length;
  const monthlyRevenue = ENROLLMENTS.filter(e => e.status === "active" || e.status === "completed").reduce((s,e) => s + e.paid, 0);
  const totalEnrollAll = ENROLLMENTS.length;

  const catalogRows = useMemoPkg(() => {
    return PACKAGES.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (pkgStatus !== "all" && p.status !== pkgStatus) return false;
      if (search.trim() && !`${p.name}${p.code}${p.tagline}`.includes(search.trim())) return false;
      return true;
    });
  }, [category, pkgStatus, search]);

  const enrollRows = useMemoPkg(() => {
    return ENROLLMENTS.filter(e => {
      if (enrStatus !== "all" && e.status !== enrStatus) return false;
      if (category !== "all" && e.category !== category) return false;
      if (expSoon && !(e.status === "active" && e.daysLeft >= 0 && e.daysLeft <= 7)) return false;
      if (search.trim() && !`${e.patient.name}${e.packageName}${e.packageCode}${e.patient.phone}`.includes(search.trim())) return false;
      return true;
    });
  }, [enrStatus, category, expSoon, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="패키지 관리"
        subtitle={`판매중 ${totalActivePkg}개 · 진행 환자 ${totalEnrollAct}명 · 누적 ${totalEnrollAll}건`}
        actions={<>
          <Button variant="ghost" size="sm" icon="download"
            onClick={() => toastProgress("패키지 목록 내보내는 중…", "패키지 목록 엑셀을 내려받았습니다")}>엑셀</Button>
          <Button variant="secondary" size="sm" icon="settings-2"
            onClick={() => showToast("패키지 정책 설정을 엽니다.")}>정책</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => setNewPkgOpen(true)}>신규 패키지</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* KPI strip */}
        <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <PkgKpi icon="tags"          label="활성 상품"      value={`${totalActivePkg}개`}            hint={`전체 ${PACKAGES.length} · 단종 ${PACKAGES.filter(p=>p.status==="discontinued").length}`} />
          <PkgKpi icon="users-round"   label="진행 환자"      value={`${totalEnrollAct}명`}            hint={`이번 달 신규 ${ENROLLMENTS.filter(e => Math.abs(daysBetween(new Date(e.startDate), PKG_TODAY)) <= 30).length}명`} tone="brand" />
          <PkgKpi icon="clock-alert"   label="만료 임박"     value={`${expiringSoon}명`}              hint="7일 이내 만료" tone={expiringSoon ? "warning" : "default"} />
          <PkgKpi icon="trending-up"   label="누적 결제액"   value={KRW(monthlyRevenue)}              hint="진행+완료 합계" />
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 24px 0", gap: 4, borderBottom: "1px solid var(--border-subtle)" }}>
          <PkgTab active={tab === "catalog"} onClick={() => setTab("catalog")}
            icon="layers" label="카탈로그" count={PACKAGES.length} />
          <PkgTab active={tab === "enroll"}  onClick={() => setTab("enroll")}
            icon="user-check" label="등록 환자" count={ENROLLMENTS.length} />
          <div style={{ flex: 1 }} />
          {tab === "catalog" && (
            <div style={{ display: "flex", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 2, marginBottom: 6 }}>
              {[
                { key: "card",  icon: "layout-grid", label: "카드" },
                { key: "table", icon: "table",       label: "표" },
              ].map(v => {
                const sel = view === v.key;
                return (
                  <button key={v.key} onClick={() => setView(v.key)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px",
                    fontSize: 11, fontFamily: "var(--font-sans)",
                    background: sel ? "var(--bg-surface)" : "transparent",
                    color: sel ? "var(--text-primary)" : "var(--text-muted)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", fontWeight: sel ? 600 : 400,
                    boxShadow: sel ? "var(--shadow-sm)" : "none",
                  }}>
                    <Icon name={v.icon} size={12} /> {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div style={{ padding: "12px 24px 8px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === "catalog" ? "패키지명 / 코드" : "환자명 / 패키지 / 전화번호"}
              style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", padding: "7px 10px 7px 32px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <CatChip cat={null} active={category === "all"} onClick={() => setCategory("all")} />
            {PACKAGE_CATEGORIES.map(c => (
              <CatChip key={c.key} cat={c} active={category === c.key} onClick={() => setCategory(c.key)} />
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {tab === "catalog" && (
            <PkgSelect label="상태" value={pkgStatus} onChange={setPkgStatus} options={[
              { value: "all", label: "전체" },
              { value: "active", label: "판매중" },
              { value: "paused", label: "일시중지" },
              { value: "discontinued", label: "단종" },
            ]} />
          )}
          {tab === "enroll" && <>
            <PkgSelect label="상태" value={enrStatus} onChange={setEnrStatus} options={[
              { value: "all",       label: "전체" },
              { value: "active",    label: "진행중" },
              { value: "paused",    label: "일시중지" },
              { value: "completed", label: "완료" },
              { value: "expired",   label: "만료" },
            ]} />
            <button onClick={() => setExpSoon(!expSoon)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px",
              fontSize: 12, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
              border: `1px solid ${expSoon ? "var(--status-warning-text)" : "var(--border-default)"}`,
              background: expSoon ? "var(--status-warning-bg)" : "var(--bg-surface)",
              color: expSoon ? "var(--status-warning-text)" : "var(--text-secondary)",
              borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: expSoon ? 600 : 400,
            }}>
              <Icon name="clock-alert" size={13} /> 7일 이내 만료만
            </button>
          </>}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
          {tab === "catalog" && view === "card" && (
            <CatalogGrid rows={catalogRows} onSelect={setSelPkg} />
          )}
          {tab === "catalog" && view === "table" && (
            <CatalogTable rows={catalogRows} onSelect={setSelPkg} />
          )}
          {tab === "enroll" && (
            <EnrollmentTable rows={enrollRows} onSelect={setSelEnr} />
          )}
        </div>
      </div>

      {selPkg && <PackageDetailModal pkg={selPkg} onClose={() => setSelPkg(null)} />}
      {selEnr && <EnrollmentDetailModal enr={selEnr} onClose={() => setSelEnr(null)} />}
      {newPkgOpen && <NewPackageModal onClose={() => setNewPkgOpen(false)} />}
    </div>
  );
}

// ── KPI card (same shape as RxKpi) ─────────────────────────────────
function PkgKpi({ icon, label, value, hint, tone = "default" }) {
  const tones = {
    default: { iconBg: "var(--bg-raised)",        iconFg: "var(--text-secondary)" },
    brand:   { iconBg: "var(--brand-muted)",      iconFg: "var(--text-brand)" },
    warning: { iconBg: "var(--status-warning-bg)", iconFg: "var(--status-warning-text)" },
    danger:  { iconBg: "var(--status-danger-bg)",  iconFg: "var(--status-danger-text)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: t.iconBg, color: t.iconFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: 1, lineHeight: 1.1 }}>{value}</div>
        {hint && <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{hint}</div>}
      </div>
    </div>
  );
}

function PkgTab({ active, onClick, icon, label, count }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "8px 14px 10px", fontSize: 13, fontFamily: "var(--font-sans)",
      background: "transparent", border: "none", cursor: "pointer",
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      fontWeight: active ? 600 : 400,
      borderBottom: `2px solid ${active ? "var(--brand)" : "transparent"}`,
      marginBottom: -1,
    }}>
      <Icon name={icon} size={14} />
      {label}
      <span style={{
        fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
        background: active ? "var(--brand-muted)" : "var(--bg-raised)",
        color: active ? "var(--text-brand)" : "var(--text-muted)",
        padding: "1px 7px", borderRadius: "var(--radius-full)",
      }}>{count}</span>
    </button>
  );
}

function CatChip({ cat, active, onClick }) {
  if (!cat) {
    return (
      <button onClick={onClick} style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px",
        fontSize: 11, fontFamily: "var(--font-sans)",
        background: active ? "var(--ink-800)" : "var(--bg-surface)",
        color: active ? "var(--text-on-brand)" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--ink-800)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-full)", cursor: "pointer",
        fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
      }}>전체</button>
    );
  }
  const t = PKG_TONES[cat.tone];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
      fontSize: 11, fontFamily: "var(--font-sans)",
      background: active ? t.bg : "var(--bg-surface)",
      color: active ? t.fg : "var(--text-secondary)",
      border: `1px solid ${active ? t.border : "var(--border-default)"}`,
      borderRadius: "var(--radius-full)", cursor: "pointer",
      fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
    }}>
      <Icon name={cat.icon} size={11} /> {cat.label}
    </button>
  );
}

function PkgSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", padding: "6px 10px", outline: "none", cursor: "pointer",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

Object.assign(window, { PackageManagementScreen });
