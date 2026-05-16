// KoMES — 약재 재고 관리 화면 (Herb Inventory)
// 종합 대시보드: KPI · AI 발주 추천 · 주의 필요 · 진행 중 발주 · 재고 테이블 + 우측 상세 패널

const { useState: useStHerb, useMemo: useMemoHerb } = React;

function HerbInventoryScreen() {
  const [selectedId, setSelectedId]   = useStHerb("h-002");
  const [category, setCategory]       = useStHerb("all");
  const [statusFilter, setStatusFilter] = useStHerb("all");
  const [supplier, setSupplier]       = useStHerb("all");
  const [search, setSearch]           = useStHerb("");
  const [showAI, setShowAI]           = useStHerb(true);
  const [sortKey, setSortKey]         = useStHerb("name");
  const [sortDir, setSortDir]         = useStHerb("asc");
  const [toast, setToast]             = useStHerb(null);
  const [intakeOpen, setIntakeOpen]   = useStHerb(false);
  const [registerOpen, setRegister]   = useStHerb(false);
  const [adjustMode, setAdjustMode]   = useStHerb(false);

  // 알림 대상 (주의 필요)
  const alerts = useMemoHerb(() => HERBS.filter(h => {
    const st = herbStatus(h);
    return st.key !== "ok";
  }), []);

  // AI 발주 추천 — 잔여 14일 이하 OR 임계치 미만
  const aiSuggestions = useMemoHerb(() => {
    return HERBS
      .filter(h => h.stock < h.threshold || projectedRunOutDays(h) <= 14)
      .map(h => {
        const targetDays = 60;
        const need = Math.ceil((h.monthly / 30) * targetDays - h.stock);
        const suggestQty = Math.max(h.threshold, Math.ceil(need / 100) * 100);
        return { id: h.id, name: h.name, monthly: h.monthly, daysLeft: projectedRunOutDays(h), suggestQty, unitPrice: h.unitPrice };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);

  // 공급처 목록
  const suppliers = useMemoHerb(() => {
    const set = new Set(HERBS.map(h => h.supplier));
    return ["all", ...Array.from(set)];
  }, []);

  // 필터 + 정렬된 약재
  const rows = useMemoHerb(() => {
    let out = HERBS.slice();
    if (category !== "all")    out = out.filter(h => h.category === category);
    if (supplier !== "all")    out = out.filter(h => h.supplier === supplier);
    if (statusFilter !== "all") out = out.filter(h => herbStatus(h).key === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(h => h.name.includes(search) || h.latin.toLowerCase().includes(q));
    }
    out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "stock")    return (a.stock - b.stock) * dir;
      if (sortKey === "monthly")  return (a.monthly - b.monthly) * dir;
      if (sortKey === "value")    return (a.stock * a.unitPrice - b.stock * b.unitPrice) * dir;
      if (sortKey === "expiry")   return (daysUntil(a.expiry) - daysUntil(b.expiry)) * dir;
      if (sortKey === "lastIn")   return (new Date(a.lastIn) - new Date(b.lastIn)) * dir;
      return a.name.localeCompare(b.name, "ko") * dir;
    });
    return out;
  }, [category, supplier, statusFilter, search, sortKey, sortDir]);

  const selected = HERBS.find(h => h.id === selectedId) || null;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  // 재고 조정 모드일 때는 전체 화면 인계
  if (adjustMode) {
    return <HerbAdjustmentScreen
      onClose={() => setAdjustMode(false)}
      onSubmit={({ draft, summary }) => {
        setAdjustMode(false);
        showToast(draft
          ? "재고 조정 내역이 임시 저장되었습니다."
          : `재고 조정 ${summary?.items || 0}건이 확정되었습니다.`);
      }} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="약재 재고"
        subtitle="현재 24종 · 마지막 동기화 2분 전"
        actions={<>
          <Button variant="ghost" size="sm" icon="download" onClick={() => showToast("재고 현황 엑셀을 내려받았습니다.")}>엑셀</Button>
          <Button variant="secondary" size="sm" icon="clipboard-edit" onClick={() => setAdjustMode(true)}>재고 조정</Button>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => setRegister(true)}>약재 등록</Button>
          <Button variant="primary" size="sm" icon="package-plus" onClick={() => setIntakeOpen(true)}>입고 등록</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Main column — block scroll wrapper, flex column inside */}
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <HIKpiStrip herbs={HERBS} alerts={alerts} openPOs={OPEN_PURCHASE_ORDERS} />

          {showAI && (
            <HIAICard
              suggestions={aiSuggestions}
              onApply={() => { setShowAI(false); showToast(`발주서 초안 ${aiSuggestions.length}품목이 생성되었습니다.`); }}
              onDismiss={() => setShowAI(false)}
            />
          )}

          <HIAlertSection alerts={alerts} onPick={setSelectedId} />

          <HIOpenPOs pos={OPEN_PURCHASE_ORDERS} />

          {/* Filters + Table */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
          }}>
            {/* Filter bar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", marginRight: 8 }}>전체 재고</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rows.length} / {HERBS.length}종</span>
              <div style={{ flex: 1 }}></div>
              <div style={{ width: 200 }}>
                <Input value={search} onChange={setSearch} placeholder="약재명 / 학명 검색" icon="search" />
              </div>
              <HISelect value={category} onChange={setCategory}
                options={HERB_CATEGORIES.map(c => ({ value: c.key, label: c.label }))} />
              <HISelect value={supplier} onChange={setSupplier}
                options={suppliers.map(s => ({ value: s, label: s === "all" ? "공급처 전체" : s }))} />
              <HISelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: "all",      label: "상태 전체" },
                { value: "ok",       label: "정상" },
                { value: "low",      label: "재고 부족" },
                { value: "critical", label: "소진 임박" },
                { value: "expiring", label: "유효기간 임박" },
              ]} />
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--stone-100)" }}>
                    <HITh label="약재" sortable onClick={() => toggleSort("name")} active={sortKey==="name"} dir={sortDir} />
                    <HITh label="분류" />
                    <HITh label="재고 / 임계치" right sortable onClick={() => toggleSort("stock")} active={sortKey==="stock"} dir={sortDir} />
                    <HITh label="월 소비" right sortable onClick={() => toggleSort("monthly")} active={sortKey==="monthly"} dir={sortDir} />
                    <HITh label="최근 입고" sortable onClick={() => toggleSort("lastIn")} active={sortKey==="lastIn"} dir={sortDir} />
                    <HITh label="유효기간" sortable onClick={() => toggleSort("expiry")} active={sortKey==="expiry"} dir={sortDir} />
                    <HITh label="원산지 / 공급처" />
                    <HITh label="재고가치" right sortable onClick={() => toggleSort("value")} active={sortKey==="value"} dir={sortDir} />
                    <HITh label="위치" />
                    <HITh label="상태" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(h => {
                    const st = herbStatus(h);
                    const dExpiry = daysUntil(h.expiry);
                    const isSel = h.id === selectedId;
                    const value = h.stock * h.unitPrice;
                    const ratio = Math.min(h.stock / (h.threshold * 2), 1);
                    return (
                      <tr key={h.id} onClick={() => setSelectedId(h.id)}
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          background: isSel ? "var(--jade-50)" : "transparent",
                          cursor: "pointer", transition: "background 0.1s ease",
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--stone-50)"; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{h.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic", marginTop: 1 }}>{h.latin}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ fontSize: 11, background: "var(--stone-100)", color: "var(--text-secondary)", padding: "2px 7px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>{h.category}</span>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", minWidth: 140 }}>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{fmtMass(h.stock)}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                            <div style={{ width: 64, height: 4, background: "var(--stone-200)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                width: `${ratio * 100}%`, height: "100%",
                                background: st.key === "critical" ? "var(--cinnabar-500)" :
                                            st.key === "low"      ? "var(--amber-500)" :
                                                                    "var(--jade-500)",
                              }}></div>
                            </div>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>임 {fmtMass(h.threshold)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{fmtMass(h.monthly)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{h.lastIn}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{h.expiry}</div>
                          <div style={{ fontSize: 10, color: dExpiry <= 90 ? "var(--cinnabar-700)" : "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>D-{dExpiry}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{h.supplier}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{h.origin}</div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{won(value)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{h.location}</td>
                        <td style={{ padding: "10px 14px" }}>
                          {st.key === "ok"
                            ? <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>정상</span>
                            : <Badge variant={st.tone}>{st.label}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
                  조건에 맞는 약재가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Right detail panel */}
        <HIDetailPanel herb={selected} onIntake={() => setIntakeOpen(true)} onToast={showToast} />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink-800)", color: "var(--stone-50)",
          padding: "10px 18px", borderRadius: "var(--radius-md)",
          fontSize: 13, fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 8, zIndex: 100,
        }}>
          <Icon name="check-circle" size={14} style={{ color: "var(--jade-300)" }} />
          {toast}
        </div>
      )}

      {/* Intake modal */}
      {intakeOpen && (
        <HIIntakeModal herb={selected} onClose={() => setIntakeOpen(false)}
          onSubmit={(qty) => { setIntakeOpen(false); showToast(`${selected?.name} ${fmtMass(qty)} 입고 처리되었습니다.`); }} />
      )}

      {/* 신규 약재 등록 모달 */}
      {registerOpen && (
        <HerbRegistrationModal
          onClose={() => setRegister(false)}
          onSubmit={(data) => {
            setRegister(false);
            showToast(`신규 약재 '${data.name}'이(가) 등록되었습니다.`);
          }} />
      )}
    </div>
  );
}

// ── 작은 도우미들 ──────────────────────────────────────────────
function HITh({ label, sortable, onClick, active, dir, right }) {
  return (
    <th onClick={sortable ? onClick : undefined}
      style={{
        padding: "8px 14px", fontSize: 10, fontWeight: 700,
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        textAlign: right ? "right" : "left", letterSpacing: "0.06em",
        textTransform: "uppercase", cursor: sortable ? "pointer" : "default",
        userSelect: "none", whiteSpace: "nowrap",
      }}>
      {label}
      {sortable && active && <span style={{ marginLeft: 4, fontSize: 9 }}>{dir === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}

function HISelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", padding: "6px 28px 6px 10px", outline: "none",
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238A9E9A' d='M0 0l5 6 5-6z'/></svg>\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
        cursor: "pointer",
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── 우측 상세 패널 ──────────────────────────────────────────────
function HIDetailPanel({ herb, onIntake, onToast }) {
  if (!herb) {
    return (
      <div style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)", padding: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
        약재를 선택하면 상세가 표시됩니다
      </div>
    );
  }
  const st = herbStatus(herb);
  const dExpiry = daysUntil(herb.expiry);
  const runOut = projectedRunOutDays(herb);
  const value = herb.stock * herb.unitPrice;
  const history = HERB_HISTORY[herb.id] || [];

  return (
    <div style={{
      width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)",
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16,
      flexShrink: 0, overflowY: "auto",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{herb.name}</span>
          <Badge variant={st.tone}>{st.label}</Badge>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--font-sans)" }}>{herb.latin}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, background: "var(--stone-100)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-sans)" }}>{herb.category}</span>
          <span style={{ fontSize: 11, background: "var(--stone-100)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-sans)" }}>{herb.origin}</span>
        </div>
      </div>

      {/* Stock bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>현재 재고</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>잔여 {runOut}일</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{fmtMass(herb.stock)}</div>
        <div style={{ position: "relative", height: 6, background: "var(--stone-200)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${Math.min(herb.stock / (herb.threshold * 2), 1) * 100}%`,
            background: st.key === "critical" ? "var(--cinnabar-500)" :
                        st.key === "low"      ? "var(--amber-500)" :
                                                "var(--jade-500)",
          }}></div>
          <div style={{
            position: "absolute", top: -2, bottom: -2,
            left: `${Math.min(herb.threshold / (herb.threshold * 2), 1) * 100}%`,
            width: 2, background: "var(--ink-500)",
          }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>0</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>임계치 {fmtMass(herb.threshold)}</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{fmtMass(herb.threshold * 2)}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="primary" size="sm" icon="package-plus" onClick={onIntake}>입고</Button>
        <Button variant="secondary" size="sm" icon="clipboard-edit" onClick={() => onToast("실사 보정 화면을 엽니다.")}>조정</Button>
        <Button variant="secondary" size="sm" icon="send" onClick={() => onToast(`${herb.name} 발주 라인이 추가되었습니다.`)}>발주</Button>
      </div>

      {/* Facts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        <HIFact label="공급처"     value={herb.supplier} />
        <HIFact label="원산지"     value={herb.origin} />
        <HIFact label="단가"       value={`${won(herb.unitPrice)} / g`} />
        <HIFact label="재고가치"   value={won(value)} />
        <HIFact label="월 소비"    value={fmtMass(herb.monthly)} />
        <HIFact label="안전 임계치" value={fmtMass(herb.threshold)} />
        <HIFact label="최근 입고"   value={herb.lastIn} />
        <HIFact label="유효기간"   value={`${herb.expiry} · D-${dExpiry}`} accent={dExpiry <= 90 ? "var(--cinnabar-700)" : undefined} />
        <HIFact label="보관 위치"  value={herb.location} />
      </div>

      {/* History */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>최근 이력</div>
        {history.length === 0
          ? <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", padding: "8px 0" }}>최근 90일간 이력이 없습니다.</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "82px 38px 1fr auto", gap: 8, alignItems: "center",
                  padding: "7px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                  background: "var(--stone-50)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{h.date}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: h.type === "입고" ? "var(--jade-700)" : h.type === "사용" ? "var(--ink-600)" : "var(--amber-700)",
                    background: h.type === "입고" ? "var(--jade-100)" : h.type === "사용" ? "var(--stone-200)" : "var(--amber-100)",
                    padding: "1px 6px", borderRadius: "var(--radius-sm)", textAlign: "center",
                  }}>{h.type}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.note}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: h.qty > 0 ? "var(--jade-700)" : "var(--text-primary)" }}>
                    {h.qty > 0 ? "+" : ""}{h.qty}g
                  </span>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}

function HIFact({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "var(--bg-surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</span>
      <span style={{ fontSize: 12, color: accent || "var(--text-primary)", fontFamily: "var(--font-mono)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── 입고 등록 모달 ──────────────────────────────────────────────
function HIIntakeModal({ herb, onClose, onSubmit }) {
  const [qty, setQty]     = useStHerb("");
  const [lot, setLot]     = useStHerb("");
  const [expiry, setExp]  = useStHerb("");
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: 440, padding: "22px 24px", boxShadow: "var(--shadow-xl)",
        fontFamily: "var(--font-sans)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>입고 등록</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{herb ? `${herb.name} · 현재 ${fmtMass(herb.stock)}` : "약재 선택 필요"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="입고 수량 (g)" value={qty} onChange={setQty} placeholder="예: 1200" type="number" />
          <Input label="공급처 / 로트번호" value={lot} onChange={setLot} placeholder={herb ? herb.supplier : "공급처"} />
          <Input label="유효기간" value={expiry} onChange={setExp} placeholder="YYYY-MM-DD" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check"
            onClick={() => onSubmit(Number(qty) || 0)} disabled={!qty || !herb}>입고 처리</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HerbInventoryScreen });
