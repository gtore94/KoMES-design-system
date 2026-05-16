// KoMES — 보험 청구 메인 화면 (orchestrator)

const { useState: useS, useMemo: useM, useEffect: useE } = React;

function InsuranceClaimScreen() {
  // claim type tab
  const [type, setType] = useS("health"); // health / herbal / auto

  // period setup
  const [period, setPeriod] = useS({
    mode: "month", year: 2026, month: 4,
    from: "2026-04-01", to: "2026-04-30",
  });
  const [weekendOpt, setWeekendOpt] = useS(false);
  const [claimGroup, setClaimGroup] = useS("원청구");
  const [diffRate, setDiffRate] = useS("apply");

  // list state — keyed per claim type
  const [loaded, setLoaded] = useS({ health: true, herbal: false, auto: false });
  const [search, setSearch] = useS("");
  const [kindFilter, setKindFilter] = useS("");
  const [errorOnly, setErrorOnly] = useS(false);
  const [density, setDensity] = useS("comfortable");
  const [selected, setSelected] = useS(new Set());
  const [excluded, setExcluded] = useS(new Set());

  // submission flow
  const [submission, setSubmission] = useS(null); // { items, type } | null

  // load source data per type
  const allItems = useM(() => {
    if (type === "health") return HEALTH_CLAIMS_SEED;
    if (type === "herbal") return HERBAL_CLAIMS_SEED;
    return AUTO_CLAIMS_SEED;
  }, [type]);

  // filtered items
  const filteredItems = useM(() => {
    let xs = allItems;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      xs = xs.filter(it =>
        it.patientName.toLowerCase().includes(q) ||
        it.chartNo.toLowerCase().includes(q) ||
        it.rrn.toLowerCase().includes(q)
      );
    }
    if (kindFilter) {
      xs = xs.filter(it => (it.kind === kindFilter) || (it.autoInsurer === kindFilter));
    }
    if (errorOnly) {
      xs = xs.filter(it => !!it.error);
    }
    return xs;
  }, [allItems, search, kindFilter, errorOnly]);

  const kindOptions = useM(() => {
    if (type === "health") return ["보험", "의료급여"];
    if (type === "herbal") return ["시범사업"];
    return AUTO_INSURERS;
  }, [type]);

  // counts for tabs
  const counts = {
    health: HEALTH_CLAIMS_SEED.length,
    herbal: HERBAL_CLAIMS_SEED.length,
    auto: AUTO_CLAIMS_SEED.length,
  };

  // selection on type change
  useE(() => {
    setSelected(new Set());
    setExcluded(new Set());
    setSearch("");
    setKindFilter("");
    setErrorOnly(false);
  }, [type]);

  // load claims
  const handleLoad = () => {
    setLoaded({ ...loaded, [type]: true });
    // auto-select all
    setSelected(new Set(allItems.map(it => it.id)));
  };

  // summary
  const summary = useM(() => {
    const visible = allItems.filter(it => !excluded.has(it.id));
    const totalCount = visible.length;
    const healthOnly = visible.filter(it => it.kind === "보험").length;
    const medicaidOnly = visible.filter(it => it.kind === "의료급여").length;
    const healthAmount = visible.filter(it => it.kind === "보험").reduce((s, it) => s + (it.coveredTotal || it.claimAmount), 0);
    const medicaidAmount = visible.filter(it => it.kind === "의료급여").reduce((s, it) => s + (it.coveredTotal || it.claimAmount), 0);
    const totalClaim = visible.reduce((s, it) => s + (it.coveredTotal || it.claimAmount), 0);
    const copayTotal = visible.reduce((s, it) => s + (it.copay || 0), 0);
    const periodFrom = period.mode === "month"
      ? `${period.year}-${String(period.month).padStart(2, "0")}-01`
      : period.from;
    const periodTo = period.mode === "month"
      ? `${period.year}-${String(period.month).padStart(2, "0")}-30`
      : period.to;
    return {
      totalCount, healthOnly, medicaidOnly,
      healthAmount, medicaidAmount, totalClaim,
      copayTotal, periodFrom, periodTo,
    };
  }, [allItems, excluded, period]);

  // selection actions
  const handleRemoveSelected = () => {
    const newEx = new Set(excluded);
    selected.forEach(id => newEx.add(id));
    setExcluded(newEx);
    setSelected(new Set());
  };

  const errorCount = useM(() => {
    return allItems.filter(it => selected.has(it.id) && it.error).length;
  }, [allItems, selected]);

  const handleSubmitAll = () => {
    const items = allItems.filter(it => !excluded.has(it.id));
    setSubmission({ items, type });
  };
  const handleSubmitSelected = () => {
    const items = allItems.filter(it => selected.has(it.id) && !excluded.has(it.id));
    if (items.length === 0) return;
    setSubmission({ items, type });
  };
  const handleCloseSubmission = (mode) => {
    if (mode === "fix") {
      // auto-filter to error only
      setErrorOnly(true);
      // exclude the just-attempted set (no — leave them visible)
    }
    setSubmission(null);
  };

  // stats for top bar
  const totalToClaim = summary.totalCount;
  const totalErrors = useM(() => allItems.filter(it => it.error && !excluded.has(it.id)).length, [allItems, excluded]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="보험 청구"
        subtitle="한차트 명세서 → 심평원 진료비 청구 (HIRA API 연동)"
        actions={<>
          <PillStat icon="files" label="청구 대상" value={`${totalToClaim}건`} tone="neutral" />
          <PillStat icon="alert-triangle"
            label="오류 의심"
            value={`${totalErrors}건`}
            tone={totalErrors > 0 ? "danger" : "neutral"} />
          <PillStat icon="banknote" label="청구 합계" value={KRW2(summary.totalClaim)} tone="brand" mono />
        </>}
      />

      <ClaimTypeTabs active={type} onChange={setType} counts={counts} />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <PeriodAndSummary
          type={type}
          period={period} setPeriod={setPeriod}
          claimGroup={claimGroup} setClaimGroup={setClaimGroup}
          diffRate={diffRate} setDiffRate={setDiffRate}
          weekendOpt={weekendOpt} setWeekendOpt={setWeekendOpt}
          doctors={CLAIM_DOCTORS}
          summary={summary}
          onLoadClaims={handleLoad}
          loaded={loaded[type]}
        />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {!loaded[type] ? (
            <EmptyState type={type} onLoad={handleLoad} />
          ) : (
            <>
              <FilterBar
                search={search} setSearch={setSearch}
                kindFilter={kindFilter} setKindFilter={setKindFilter}
                errorOnly={errorOnly} setErrorOnly={setErrorOnly}
                density={density} setDensity={setDensity}
                selected={selected.size} onRemoveSelected={handleRemoveSelected}
                kindOptions={kindOptions}
              />
              <ClaimsTable
                type={type}
                items={filteredItems}
                selected={selected} setSelected={setSelected}
                excluded={excluded} setExcluded={setExcluded}
                density={density}
              />
              <ActionBar
                type={type}
                summary={summary}
                selected={selected.size}
                errorCount={errorCount}
                onSubmitAll={handleSubmitAll}
                onSubmitSelected={handleSubmitSelected}
                onOpenPhysioRecords={() => alert("물리치료 내역 (모의)")}
                onOpenChunaRecords={() => alert("추나치료 내역 (모의)")}
              />
            </>
          )}
        </div>
      </div>

      {submission && (
        <ClaimSubmissionFlow
          items={submission.items}
          type={submission.type}
          summary={summary}
          onClose={handleCloseSubmission}
        />
      )}
    </div>
  );
}

function PillStat({ icon, label, value, tone, mono }) {
  const tones = {
    neutral: { bg: "var(--bg-raised)", fg: "var(--text-secondary)", bd: "var(--border-subtle)", iconColor: "var(--text-muted)" },
    brand:   { bg: "var(--brand-subtle)", fg: "var(--jade-700)", bd: "var(--jade-200)", iconColor: "var(--jade-600)" },
    danger:  { bg: "var(--status-danger-bg)", fg: "var(--cinnabar-700)", bd: "var(--cinnabar-200)", iconColor: "var(--cinnabar-600)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "5px 12px",
      background: t.bg, border: `1px solid ${t.bd}`,
      borderRadius: "var(--radius-full)",
    }}>
      <Icon name={icon} size={13} style={{ color: t.iconColor }} />
      <span style={{ fontSize: 11, fontWeight: 500, color: t.fg, fontFamily: "var(--font-sans)" }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 700, color: t.fg,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      }}>{value}</span>
    </div>
  );
}

function EmptyState({ type, onLoad }) {
  const t = CLAIM_TYPES.find(x => x.key === type);
  return (
    <div style={{
      flex: 1,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      background: "var(--bg-page)",
      padding: 40,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "var(--radius-xl)",
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-default)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-muted)",
      }}>
        <Icon name="folder-open" size={28} />
      </div>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500,
          color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.01em",
        }}>{t.label} 명세서를 불러와 주세요</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>
          좌측에서 청구 기간을 선택한 뒤 <b>명세서 불러오기</b>를 클릭하면<br />
          한차트에서 진료 명세서를 자동으로 추출합니다.
        </div>
      </div>
      <button onClick={onLoad} style={{
        marginTop: 6, padding: "10px 22px", fontSize: 13, fontWeight: 600,
        background: "var(--jade-500)", color: "#fff",
        border: "none", borderRadius: "var(--radius-md)",
        cursor: "pointer", fontFamily: "var(--font-sans)",
        display: "inline-flex", alignItems: "center", gap: 8,
        boxShadow: "var(--shadow-sm)",
      }}>
        <Icon name="download" size={14} />
        명세서 불러오기
      </button>
    </div>
  );
}

Object.assign(window, { InsuranceClaimScreen });
