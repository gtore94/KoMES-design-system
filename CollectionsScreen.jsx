// KoMES — 수금 관리 화면 (환자 미수금 + 보험사 입금 대기 통합)
// 사이드바: 청구 → 보험 청구 / 수금 관리

const { useState: useStateCO, useMemo: useMemoCO } = React;

function CollectionsScreen() {
  const [tab, setTab] = useStateCO(() => localStorage.getItem("komes_collect_tab") || "all");
  const [selected, setSelected] = useStateCO(null);  // 선택된 row (사이드 패널)
  const [search, setSearch] = useStateCO("");
  const [sortBy, setSortBy] = useStateCO("urgency"); // urgency | amount | days
  const [typeFilter, setTypeFilter] = useStateCO(() => new Set()); // 빈 Set = 전체

  React.useEffect(() => { localStorage.setItem("komes_collect_tab", tab); }, [tab]);

  // ─── totals ───
  const totals = useMemoCO(() => {
    const patientSum = COLLECTIONS.patient.reduce((a, r) => a + r.amount, 0);
    const insurerSum = COLLECTIONS.insurer.reduce((a, r) => a + r.amount, 0);
    const patientOverdue = COLLECTIONS.patient.filter(r => r.status === "overdue").reduce((a, r) => a + r.amount, 0);
    const insurerHold = COLLECTIONS.insurer.filter(r => r.status === "hold").reduce((a, r) => a + r.amount, 0);
    const long30 = [
      ...COLLECTIONS.patient.filter(r => r.overdueDays > 30),
      ...COLLECTIONS.insurer.filter(r => r.daysOut > 30),
    ];
    return {
      patientSum, insurerSum, total: patientSum + insurerSum,
      patientCount: COLLECTIONS.patient.length, insurerCount: COLLECTIONS.insurer.length,
      patientOverdue, insurerHold, long30Count: long30.length,
      long30Amount: long30.reduce((a, r) => a + r.amount, 0),
    };
  }, []);

  // ─── aging buckets ───
  const aging = useMemoCO(() => {
    const make = (rows, daysKey) => {
      const m = Object.fromEntries(AGE_BUCKETS.map(b => [b, { count: 0, amount: 0 }]));
      rows.forEach(r => {
        const b = ageBucket(r[daysKey]);
        m[b].count += 1;
        m[b].amount += r.amount;
      });
      return m;
    };
    return {
      patient: make(COLLECTIONS.patient, "overdueDays"),
      insurer: make(COLLECTIONS.insurer, "daysOut"),
    };
  }, []);

  // 보험 유형별 카운트
  const insurerTypeCounts = useMemoCO(() => {
    const m = {};
    COLLECTIONS.insurer.forEach(r => { m[r.type] = (m[r.type] || 0) + 1; });
    return m;
  }, []);

  // ─── merged & filtered rows ───
  const rows = useMemoCO(() => {
    let list = [];
    if (tab === "all" || tab === "patient") {
      list = list.concat(COLLECTIONS.patient.map(r => ({
        kind: "patient", id: r.id, name: r.name, subtitle: `${r.gender} · ${r.age}세 · ${r.origin}`,
        amount: r.amount, days: r.overdueDays, status: r.status,
        meta: r.lastContact ? `최근 ${r.lastContact.date} ${r.lastContact.channel} · ${r.lastContact.result}` : "연락 이력 없음",
        sub2: r.promisedDate ? `약속일 ${r.promisedDate}` : null,
        raw: r,
      })));
    }
    if (tab === "all" || tab === "insurer") {
      let insRows = COLLECTIONS.insurer;
      if (typeFilter.size > 0) {
        insRows = insRows.filter(r => typeFilter.has(r.type));
      }
      list = list.concat(insRows.map(r => ({
        kind: "insurer", id: r.id, name: `${r.insurer}`, subtitle: `${r.type} · ${r.patient} · ${r.claimNo}`,
        amount: r.amount, days: r.daysOut, status: r.status,
        meta: r.lastUpdate,
        sub2: `청구 ${r.submittedDate} → 예상 ${r.expectedDate}`,
        raw: r,
      })));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    if (sortBy === "amount") list.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "days") list.sort((a, b) => b.days - a.days);
    else list.sort((a, b) => urgency(b.amount, b.days) - urgency(a.amount, a.days));
    return list;
  }, [tab, search, sortBy, typeFilter]);

  const tabs = [
    { key: "all",     label: "전체",       count: totals.patientCount + totals.insurerCount, icon: "layers" },
    { key: "patient", label: "환자 미수금", count: totals.patientCount, icon: "user" },
    { key: "insurer", label: "보험사 대기", count: totals.insurerCount, icon: "building-2" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }} data-screen-label="수금 관리">
      <TopBar
        title="수금 관리"
        subtitle={`총 받을 돈 ${fmtKRW(totals.total)} · ${COLLECTIONS.asOf} 기준`}
        actions={
          <>
            <Button variant="secondary" size="sm" icon="phone" onClick={() => showToast("미수금 환자에게 일괄 연락을 시작했습니다.")}>일괄 연락</Button>
            <Button variant="secondary" size="sm" icon="download" onClick={() => toastProgress("미수금 내역 내보내는 중…", "미수금 CSV를 내려받았습니다")}>CSV 내보내기</Button>
            <Button variant="primary" size="sm" icon="bell-ring" onClick={() => showToast("독촉 캠페인이 예약되었습니다.")}>독촉 캠페인</Button>
          </>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <KPITile
            icon="banknote" iconColor="var(--cinnabar-600)"
            label="총 미수금"
            value={fmtKRWshort(totals.total)} unit="원"
            sub={`환자 ${fmtKRWshort(totals.patientSum)} + 보험사 ${fmtKRWshort(totals.insurerSum)}`}
          />
          <KPITile
            icon="user" iconColor="var(--accent-slate)"
            label="환자 미수금"
            value={fmtKRWshort(totals.patientSum)} unit="원"
            sub={`${totals.patientCount}건 · 연체 ${fmtKRWshort(totals.patientOverdue)}`}
          />
          <KPITile
            icon="building-2" iconColor="var(--accent-marine)"
            label="보험사 입금 대기"
            value={fmtKRWshort(totals.insurerSum)} unit="원"
            sub={`${totals.insurerCount}건 · 보완요청 ${fmtKRWshort(totals.insurerHold)}`}
          />
          <KPITile
            icon="alert-triangle" iconColor="var(--amber-600)"
            label="30일+ 장기 미수"
            value={`${totals.long30Count}`} unit="건"
            sub={fmtKRWshort(totals.long30Amount) + "원"}
          />
        </div>

        {/* Aging — 양쪽 막대 (환자 vs 보험사) */}
        <Card title="연체 일수별 분포" subtitle="환자 미수금과 보험사 대기를 분리해서 비교" icon="clock" padding={16}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <AgingPanel title="환자 미수금" buckets={aging.patient} totalLabel={`${totals.patientCount}건 · ${fmtKRWshort(totals.patientSum)}원`} color="var(--cinnabar-500)" />
            <AgingPanel title="보험사 입금 대기" buckets={aging.insurer} totalLabel={`${totals.insurerCount}건 · ${fmtKRWshort(totals.insurerSum)}원`} color="var(--accent-marine)" />
          </div>
        </Card>

        {/* 탭 + 리스트 + 사이드 패널 */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)", gap: 14 }}>
          <Card padding={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 14px", borderBottom: "1px solid var(--border-subtle)" }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "12px 14px",
                  background: "transparent", border: "none",
                  borderBottom: tab === t.key ? "2px solid var(--brand)" : "2px solid transparent",
                  color: tab === t.key ? "var(--text-brand)" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: tab === t.key ? 600 : 500,
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  marginBottom: -1,
                }}>
                  <Icon name={t.icon} size={13} />
                  {t.label}
                  <span style={{
                    fontSize: 10.5, fontWeight: 700,
                    background: tab === t.key ? "var(--brand-muted)" : "var(--bg-raised)",
                    color: tab === t.key ? "var(--text-brand)" : "var(--text-muted)",
                    borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px",
                    fontFamily: "var(--font-mono)",
                  }}>{t.count}</span>
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 180 }}>
                  <Input placeholder="이름 · 청구번호 검색" value={search} onChange={setSearch} icon="search" />
                </div>
                <div style={{ display: "flex", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: 2 }}>
                  {[
                    { k: "urgency", l: "긴급도" },
                    { k: "amount",  l: "금액" },
                    { k: "days",    l: "연체일" },
                  ].map(s => (
                    <button key={s.k} onClick={() => setSortBy(s.k)} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: "var(--radius-xs)",
                      background: sortBy === s.k ? "var(--bg-surface)" : "transparent",
                      color: sortBy === s.k ? "var(--text-primary)" : "var(--text-muted)",
                      border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
                      fontWeight: sortBy === s.k ? 600 : 400,
                    }}>{s.l}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 보험 유형 필터 칩 — insurer 탭일 때만 표시 */}
            {tab === "insurer" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                padding: "10px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-raised)",
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginRight: 4,
                }}>보험 유형</span>
                <TypeChip
                  label="전체"
                  count={COLLECTIONS.insurer.length}
                  active={typeFilter.size === 0}
                  onClick={() => setTypeFilter(new Set())}
                />
                {INSURER_TYPES.map(t => (
                  <TypeChip
                    key={t.key}
                    label={t.key}
                    icon={t.icon}
                    color={t.color}
                    count={insurerTypeCounts[t.key] || 0}
                    active={typeFilter.has(t.key)}
                    onClick={() => {
                      setTypeFilter(prev => {
                        const next = new Set(prev);
                        if (next.has(t.key)) next.delete(t.key);
                        else next.add(t.key);
                        return next;
                      });
                    }}
                  />
                ))}
                {typeFilter.size > 0 && (
                  <button onClick={() => setTypeFilter(new Set())} style={{
                    marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: "var(--text-muted)", background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>
                    <Icon name="x" size={11} /> 필터 해제
                  </button>
                )}
              </div>
            )}

            {/* table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "28px 1.6fr 1.5fr 90px 140px 100px 120px",
              gap: 12, padding: "10px 18px", alignItems: "center",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              color: "var(--text-muted)", textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
              background: "var(--bg-raised)",
            }}>
              <span></span>
              <span>대상</span>
              <span>상세 / 최근 활동</span>
              <span style={{ textAlign: "right" }}>연체</span>
              <span style={{ textAlign: "right" }}>금액</span>
              <span>상태</span>
              <span>액션</span>
            </div>

            {/* rows */}
            <div>
              {rows.map((r) => {
                const isSel = selected && selected.id === r.id;
                const isLongOverdue = r.days > 30;
                return (
                  <div key={r.id} onClick={() => setSelected(r)} style={{
                    display: "grid",
                    gridTemplateColumns: "28px 1.6fr 1.5fr 90px 140px 100px 120px",
                    gap: 12, padding: "12px 18px", alignItems: "center",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    background: isSel ? "var(--brand-subtle)" : "transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--bg-raised)"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: "var(--radius-sm)",
                      background: r.kind === "patient" ? "var(--cinnabar-100)" : "var(--accent-marine-bg)",
                      color: r.kind === "patient" ? "var(--cinnabar-700)" : "var(--accent-marine)",
                    }}>
                      <Icon name={r.kind === "patient" ? "user" : "building-2"} size={11} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.subtitle}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.meta}
                      </div>
                      {r.sub2 && (
                        <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {r.sub2}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                        color: isLongOverdue ? "var(--cinnabar-700)" : "var(--text-secondary)",
                      }}>
                        {isLongOverdue && <Icon name="alert-circle" size={11} />}
                        {r.days}일
                      </span>
                    </div>
                    <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      ₩{r.amount.toLocaleString("ko-KR")}
                    </div>
                    <div>
                      <CollectStatusPill status={r.status} />
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {r.kind === "patient" ? (
                        <>
                          <RowAction icon="phone" tip="전화" />
                          <RowAction icon="message-square" tip="문자/카톡" />
                          <RowAction icon="credit-card" tip="부분 수금" />
                          <RowAction icon="trash-2" tip="삭제" danger />
                        </>
                      ) : (
                        <>
                          <RowAction icon="external-link" tip="청구 보기" />
                          <RowAction icon="file-edit" tip="보완 회신" />
                          <RowAction icon="bell" tip="리마인더" />
                          <RowAction icon="trash-2" tip="삭제" danger />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {rows.length === 0 && (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: 13 }}>
                  조건에 맞는 항목이 없습니다.
                </div>
              )}
            </div>
          </Card>

          {/* 사이드 디테일 패널 */}
          {selected && <DetailPanel row={selected} onClose={() => setSelected(null)} />}
        </div>

        {/* 최근 활동 로그 */}
        <Card title="최근 수금 활동" subtitle="연락 · 보완 · 정산 기록" icon="history" padding={0}>
          {COLLECTIONS.activity.map((a, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "100px 60px 1fr 90px 1fr",
              gap: 14, padding: "10px 16px", alignItems: "center",
              borderBottom: i < COLLECTIONS.activity.length - 1 ? "1px solid var(--border-subtle)" : "none",
              fontFamily: "var(--font-sans)", fontSize: 12,
            }}>
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{a.time}</span>
              <span style={{ color: "var(--text-secondary)" }}>{a.who}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{a.action}</span>
              <span style={{ color: "var(--text-brand)", fontWeight: 500 }}>{a.target}</span>
              <span style={{ color: "var(--text-secondary)" }}>{a.result}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Type filter chip ───────────────────────────────────
function TypeChip({ label, icon, color, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11.5, fontWeight: active ? 600 : 500,
      padding: "4px 10px",
      background: active ? (color ? `${color}1A` : "var(--brand-subtle)") : "var(--bg-surface)",
      color: active ? (color || "var(--text-brand)") : "var(--text-secondary)",
      border: `1px solid ${active ? (color || "var(--brand)") : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-full)", cursor: "pointer",
      fontFamily: "var(--font-sans)", transition: "all 0.12s", whiteSpace: "nowrap",
    }}>
      {icon && <Icon name={icon} size={11} />}
      {label}
      <span style={{
        fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
        background: active ? "var(--bg-surface)" : "var(--bg-raised)",
        color: active ? (color || "var(--text-brand)") : "var(--text-muted)",
        borderRadius: "var(--radius-full)", padding: "1px 6px",
      }}>{count}</span>
    </button>
  );
}

// ─── Aging panel ────────────────────────────────────────
function AgingPanel({ title, buckets, totalLabel, color }) {
  const maxCount = Math.max(...AGE_BUCKETS.map(b => buckets[b].count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{totalLabel}</span>
      </div>
      {AGE_BUCKETS.map(b => {
        const { count, amount } = buckets[b];
        const pct = (count / maxCount) * 100;
        const isLong = b === "30일+" || b === "15–30일";
        return (
          <div key={b} style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: isLong ? "var(--cinnabar-700)" : "var(--text-secondary)", fontWeight: isLong ? 600 : 400 }}>{b}</span>
            <div style={{ height: 14, background: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", overflow: "hidden", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: isLong ? "var(--cinnabar-500)" : color, transition: "width 0.3s" }} />
              <span style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                fontSize: 10, fontWeight: 600, color: pct > 30 ? "var(--text-on-brand)" : "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}>{count}건</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "right" }}>
              ₩{amount.toLocaleString("ko-KR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status pill ────────────────────────────────────────
function CollectStatusPill({ status }) {
  const s = COLLECTION_STATUS[status];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10.5, fontWeight: 600, color: s.color,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 9px",
      fontFamily: "var(--font-sans)",
    }}>
      {s.label}
    </span>
  );
}

// ─── Row action ─────────────────────────────────────────
function RowAction({ icon, tip, danger }) {
  const [hover, setHover] = React.useState(false);
  const hoverBg     = danger ? "var(--cinnabar-100)"    : "var(--brand-muted)";
  const hoverColor  = danger ? "var(--cinnabar-700)"    : "var(--text-brand)";
  const hoverBorder = danger ? "var(--cinnabar-200)"    : "var(--brand-muted)";
  return (
    <button title={tip} onClick={e => {
      e.stopPropagation();
      if (danger && !window.confirm("삭제하시겠습니까?")) return;
    }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 26, height: 26,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: hover ? hoverBg : "var(--bg-raised)",
        color: hover ? hoverColor : "var(--text-secondary)",
        border: `1px solid ${hover ? hoverBorder : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-sm)", cursor: "pointer",
        transition: "all 0.12s",
      }}>
      <Icon name={icon} size={12} />
    </button>
  );
}

// ─── Detail panel ───────────────────────────────────────
function DetailPanel({ row, onClose }) {
  const r = row.raw;
  const isPatient = row.kind === "patient";
  return (
    <aside style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-md)",
      overflow: "hidden",
      display: "flex", flexDirection: "column", alignSelf: "flex-start",
      position: "sticky", top: 0,
    }}>
      <div style={{
        padding: "14px 16px",
        background: isPatient ? "var(--cinnabar-100)" : "var(--accent-marine-bg)",
        borderBottom: `1px solid ${isPatient ? "var(--cinnabar-200)" : "var(--accent-marine-border)"}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name={isPatient ? "user" : "building-2"} size={16}
          style={{ color: isPatient ? "var(--cinnabar-700)" : "var(--accent-marine)" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
            {row.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            {row.id}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer",
          borderRadius: "var(--radius-sm)",
        }}>
          <Icon name="x" size={14} />
        </button>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14, fontFamily: "var(--font-sans)" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>금액</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            ₩{row.amount.toLocaleString("ko-KR")}
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
            <CollectStatusPill status={row.status} />
            <span style={{ fontSize: 11.5, color: "var(--cinnabar-700)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{row.days}일 경과</span>
          </div>
        </div>

        {isPatient ? (
          <>
            <DetailRow label="전화" value={r.phone} mono />
            <DetailRow label="진료일" value={r.visitDate} mono />
            <DetailRow label="사유" value={r.origin} />
            {r.promisedDate && <DetailRow label="입금 약속" value={r.promisedDate} mono accent />}
            <DetailRow label="연락 횟수" value={`${r.contacts}회`} mono />
          </>
        ) : (
          <>
            <DetailRow label="청구번호" value={r.claimNo} mono />
            <DetailRow label="환자" value={r.patient} />
            <DetailRow label="유형" value={r.type} />
            <DetailRow label="제출일" value={r.submittedDate} mono />
            <DetailRow label="예상 입금" value={r.expectedDate} mono accent />
          </>
        )}

        {/* 활동 */}
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>최근 활동</div>
          <div style={{
            padding: "10px 12px", background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
            fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5,
          }}>
            {isPatient ? (r.lastContact
              ? <><strong style={{ color: "var(--text-primary)" }}>{r.lastContact.date}</strong> · {r.lastContact.channel}<br />{r.lastContact.result}</>
              : "연락 이력이 없습니다."
            ) : r.lastUpdate}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 6 }}>
          {isPatient ? (
            <>
              <Button variant="primary" icon="phone">전화 걸기</Button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Button variant="secondary" size="sm" icon="message-square">문자 발송</Button>
                <Button variant="secondary" size="sm" icon="credit-card">부분 수금</Button>
              </div>
              <Button variant="ghost" size="sm" icon="calendar">입금 약속 등록</Button>
            </>
          ) : (
            <>
              <Button variant="primary" icon="external-link">청구 상세 열기</Button>
              <Button variant="secondary" size="sm" icon="file-edit">보완 회신</Button>
              <Button variant="ghost" size="sm" icon="bell">리마인더 설정</Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function DetailRow({ label, value, mono, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: "var(--font-sans)" }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 12.5, color: accent ? "var(--text-brand)" : "var(--text-primary)",
        fontWeight: accent ? 600 : 500,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{value}</span>
    </div>
  );
}

Object.assign(window, { CollectionsScreen });
