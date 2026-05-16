// KoMES — 소모품 관리 화면 (의료/포장재/사무/청소)

const { useState: useStSup, useMemo: useMemoSup } = React;

function SuppliesScreen({ onNavigate, onOpenRecSettings, onCreateDrafts }) {
  const [selectedId, setSelectedId]     = useStSup("s-009");
  const [category, setCategory]         = useStSup("all");
  const [statusFilter, setStatusFilter] = useStSup("all");
  const [supplier, setSupplier]         = useStSup("all");
  const [search, setSearch]             = useStSup("");
  const [showAI, setShowAI]             = useStSup(true);
  const [sortKey, setSortKey]           = useStSup("name");
  const [sortDir, setSortDir]           = useStSup("asc");
  const [toast, setToast]               = useStSup(null);
  const [intakeOpen, setIntakeOpen]     = useStSup(false);
  const [registerOpen, setRegister]     = useStSup(false);
  const [adjustMode, setAdjustMode]     = useStSup(false);

  const alerts = useMemoSup(() => SUPPLIES.filter(s => supStatus(s).key !== "ok"), []);

  const aiSuggestions = useMemoSup(() => {
    return SUPPLIES
      .filter(s => s.stock < s.threshold || supRunOut(s) <= 14)
      .map(s => {
        const targetDays = 60;
        const need = Math.ceil((s.monthly / 30) * targetDays - s.stock);
        const suggestQty = Math.max(s.threshold, Math.ceil(need));
        return { id: s.id, name: s.name, supplier: s.supplier, unit: s.unit,
                 monthly: s.monthly, daysLeft: supRunOut(s), suggestQty, unitPrice: s.unitPrice };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);

  const suppliers = useMemoSup(() => {
    const set = new Set(SUPPLIES.map(s => s.supplier));
    return ["all", ...Array.from(set)];
  }, []);

  const rows = useMemoSup(() => {
    let out = SUPPLIES.slice();
    if (category !== "all")     out = out.filter(s => s.category === category);
    if (supplier !== "all")     out = out.filter(s => s.supplier === supplier);
    if (statusFilter !== "all") out = out.filter(s => supStatus(s).key === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(s => s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q));
    }
    out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "stock")    return (a.stock - b.stock) * dir;
      if (sortKey === "monthly")  return (a.monthly - b.monthly) * dir;
      if (sortKey === "value")    return (a.stock * a.unitPrice - b.stock * b.unitPrice) * dir;
      if (sortKey === "expiry")   {
        const da = a.expiry ? daysUntil(a.expiry) : 9999;
        const db = b.expiry ? daysUntil(b.expiry) : 9999;
        return (da - db) * dir;
      }
      if (sortKey === "lastIn")   return (new Date(a.lastIn) - new Date(b.lastIn)) * dir;
      if (sortKey === "category") return a.category.localeCompare(b.category, "ko") * dir;
      return a.name.localeCompare(b.name, "ko") * dir;
    });
    return out;
  }, [category, supplier, statusFilter, search, sortKey, sortDir]);

  const selected = SUPPLIES.find(s => s.id === selectedId) || null;
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  if (adjustMode) {
    return <SupplyAdjustmentScreen
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
        title="소모품"
        subtitle={`현재 ${SUPPLIES.length}품목 · 마지막 동기화 4분 전`}
        actions={<>
          <Button variant="ghost" size="sm" icon="download" onClick={() => showToast("소모품 재고 엑셀을 내려받았습니다.")}>엑셀</Button>
          <Button variant="secondary" size="sm" icon="clipboard-edit" onClick={() => setAdjustMode(true)}>재고 조정</Button>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => setRegister(true)}>품목 등록</Button>
          <Button variant="primary" size="sm" icon="package-plus" onClick={() => setIntakeOpen(true)}>입고 등록</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <SPKpiStrip items={SUPPLIES} alerts={alerts} openPOs={SUP_OPEN_POS} />

          {showAI && (
            <SPAICard
              suggestions={aiSuggestions}
              onApply={() => { setShowAI(false); onCreateDrafts && onCreateDrafts("supply"); }}
              onDismiss={() => setShowAI(false)}
              onOpenSettings={onOpenRecSettings}
            />
          )}

          <SPAlertSection alerts={alerts} onPick={setSelectedId} />

          <SPOpenPOs pos={SUP_OPEN_POS} onOpenHistory={() => onNavigate && onNavigate("orders")} />

          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", marginRight: 8 }}>전체 소모품</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rows.length} / {SUPPLIES.length}품목</span>
              <div style={{ flex: 1 }}></div>
              <div style={{ width: 220 }}>
                <Input value={search} onChange={setSearch} placeholder="품명 / SKU 검색" icon="search" />
              </div>
              <SPSelect value={category} onChange={setCategory}
                options={SUP_CATEGORIES.map(c => ({ value: c.key, label: c.label }))} />
              <SPSelect value={supplier} onChange={setSupplier}
                options={suppliers.map(s => ({ value: s, label: s === "all" ? "공급처 전체" : s }))} />
              <SPSelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: "all",      label: "상태 전체" },
                { value: "ok",       label: "정상" },
                { value: "low",      label: "재고 부족" },
                { value: "critical", label: "소진 임박" },
                { value: "expiring", label: "유효기간 임박" },
              ]} />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-raised)" }}>
                    <SPTh label="품목" sortable onClick={() => toggleSort("name")} active={sortKey==="name"} dir={sortDir} />
                    <SPTh label="분류" sortable onClick={() => toggleSort("category")} active={sortKey==="category"} dir={sortDir} />
                    <SPTh label="SKU" />
                    <SPTh label="재고 / 임계치" right sortable onClick={() => toggleSort("stock")} active={sortKey==="stock"} dir={sortDir} />
                    <SPTh label="월 소비" right sortable onClick={() => toggleSort("monthly")} active={sortKey==="monthly"} dir={sortDir} />
                    <SPTh label="최근 입고" sortable onClick={() => toggleSort("lastIn")} active={sortKey==="lastIn"} dir={sortDir} />
                    <SPTh label="유효기간" sortable onClick={() => toggleSort("expiry")} active={sortKey==="expiry"} dir={sortDir} />
                    <SPTh label="공급처" />
                    <SPTh label="재고가치" right sortable onClick={() => toggleSort("value")} active={sortKey==="value"} dir={sortDir} />
                    <SPTh label="위치" />
                    <SPTh label="상태" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(s => {
                    const st = supStatus(s);
                    const dExpiry = s.expiry ? daysUntil(s.expiry) : null;
                    const isSel = s.id === selectedId;
                    const value = s.stock * s.unitPrice;
                    const ratio = Math.min(s.stock / (s.threshold * 2), 1);
                    const cat = SUP_CAT_COLOR[s.category] || SUP_CAT_COLOR["사무"];
                    return (
                      <tr key={s.id} onClick={() => setSelectedId(s.id)}
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          background: isSel ? "var(--brand-subtle)" : "transparent",
                          cursor: "pointer", transition: "background 0.1s ease",
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--bg-raised)"; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{s.pack}</div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ fontSize: 11, background: cat.bg, color: cat.fg, padding: "2px 8px", borderRadius: "var(--radius-full)", border: `1px solid ${cat.border}` }}>{s.category}</span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.sku}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", minWidth: 150 }}>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{supFmt(s.stock, s.unit)}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                            <div style={{ width: 64, height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{
                                width: `${ratio * 100}%`, height: "100%",
                                background: st.key === "critical" ? "var(--cinnabar-500)" :
                                            st.key === "low"      ? "var(--amber-500)" :
                                                                    "var(--jade-500)",
                              }}></div>
                            </div>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>임 {supFmt(s.threshold, s.unit)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{supFmt(s.monthly, s.unit)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.lastIn}</td>
                        <td style={{ padding: "10px 14px" }}>
                          {s.expiry ? <>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.expiry}</div>
                            <div style={{ fontSize: 10, color: dExpiry <= 90 ? "var(--cinnabar-700)" : "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>D-{dExpiry}</div>
                          </> : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)" }}>{s.supplier}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{won(value)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.location}</td>
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
                  조건에 맞는 품목이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        <SPDetailPanel item={selected} onIntake={() => setIntakeOpen(true)} onToast={showToast} />
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink-800)", color: "var(--bg-raised)",
          padding: "10px 18px", borderRadius: "var(--radius-md)",
          fontSize: 13, fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 8, zIndex: 100,
        }}>
          <Icon name="check-circle" size={14} style={{ color: "var(--jade-300)" }} />
          {toast}
        </div>
      )}

      {intakeOpen && (
        <SPIntakeModal item={selected} onClose={() => setIntakeOpen(false)}
          onSubmit={(qty) => { setIntakeOpen(false); showToast(`${selected?.name} ${supFmt(qty, selected?.unit || "")} 입고 처리되었습니다.`); }} />
      )}

      {/* 신규 품목 등록 모달 */}
      {registerOpen && (
        <SupplyRegistrationModal
          onClose={() => setRegister(false)}
          onSubmit={(data) => {
            setRegister(false);
            showToast(`신규 품목 '${data.name}'이(가) 등록되었습니다.`);
          }} />
      )}
    </div>
  );
}

function SPTh({ label, sortable, onClick, active, dir, right }) {
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

function SPSelect({ value, onChange, options }) {
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

function SPDetailPanel({ item, onIntake, onToast }) {
  if (!item) {
    return (
      <div style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)", padding: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
        품목을 선택하면 상세가 표시됩니다
      </div>
    );
  }
  const st = supStatus(item);
  const dExpiry = item.expiry ? daysUntil(item.expiry) : null;
  const runOut = supRunOut(item);
  const value = item.stock * item.unitPrice;
  const history = SUP_HISTORY[item.id] || [];
  const cat = SUP_CAT_COLOR[item.category] || SUP_CAT_COLOR["사무"];

  return (
    <div style={{
      width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)",
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16,
      flexShrink: 0, overflowY: "auto",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 19, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em", flex: 1, lineHeight: 1.2 }}>{item.name}</div>
          <Badge variant={st.tone}>{st.label}</Badge>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{item.sku} · {item.pack}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, background: cat.bg, color: cat.fg, padding: "2px 8px", borderRadius: "var(--radius-full)", border: `1px solid ${cat.border}`, fontFamily: "var(--font-sans)" }}>{item.category}</span>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>현재 재고</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>잔여 {runOut}일</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{supFmt(item.stock, item.unit)}</div>
        <div style={{ position: "relative", height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${Math.min(item.stock / (item.threshold * 2), 1) * 100}%`,
            background: st.key === "critical" ? "var(--cinnabar-500)" :
                        st.key === "low"      ? "var(--amber-500)" :
                                                "var(--jade-500)",
          }}></div>
          <div style={{
            position: "absolute", top: -2, bottom: -2,
            left: `${Math.min(item.threshold / (item.threshold * 2), 1) * 100}%`,
            width: 2, background: "var(--ink-500)",
          }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>0</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>임계치 {supFmt(item.threshold, item.unit)}</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{supFmt(item.threshold * 2, item.unit)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="primary" size="sm" icon="package-plus" onClick={onIntake}>입고</Button>
        <Button variant="secondary" size="sm" icon="clipboard-edit" onClick={() => onToast("실사 보정 화면을 엽니다.")}>조정</Button>
        <Button variant="secondary" size="sm" icon="send" onClick={() => onToast(`${item.name} 발주 라인이 추가되었습니다.`)}>발주</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
        <SPFact label="공급처"      value={item.supplier} />
        <SPFact label="단가"        value={`${won(item.unitPrice)} / ${item.unit}`} />
        <SPFact label="재고가치"    value={won(value)} />
        <SPFact label="월 소비"     value={supFmt(item.monthly, item.unit)} />
        <SPFact label="안전 임계치" value={supFmt(item.threshold, item.unit)} />
        <SPFact label="최근 입고"    value={item.lastIn} />
        <SPFact label="유효기간"
                value={item.expiry ? `${item.expiry} · D-${dExpiry}` : "해당 없음"}
                accent={item.expiry && dExpiry <= 90 ? "var(--cinnabar-700)" : undefined} />
        <SPFact label="보관 위치"    value={item.location} />
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>최근 이력</div>
        {history.length === 0
          ? <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", padding: "8px 0" }}>최근 90일간 이력이 없습니다.</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "82px 38px 1fr auto", gap: 8, alignItems: "center",
                  padding: "7px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-raised)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{h.date}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: h.type === "입고" ? "var(--jade-700)" : h.type === "사용" ? "var(--ink-600)" : "var(--amber-700)",
                    background: h.type === "입고" ? "var(--brand-muted)" : h.type === "사용" ? "var(--bg-raised)" : "var(--status-warning-bg)",
                    padding: "1px 6px", borderRadius: "var(--radius-sm)", textAlign: "center",
                  }}>{h.type}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.note}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: h.qty > 0 ? "var(--jade-700)" : "var(--text-primary)" }}>
                    {h.qty > 0 ? "+" : ""}{h.qty} {item.unit}
                  </span>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}

function SPFact({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "var(--bg-surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</span>
      <span style={{ fontSize: 12, color: accent || "var(--text-primary)", fontFamily: "var(--font-mono)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function SPIntakeModal({ item, onClose, onSubmit }) {
  const [qty, setQty]    = useStSup("");
  const [lot, setLot]    = useStSup("");
  const [expiry, setExp] = useStSup("");
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
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item ? `${item.name} · 현재 ${supFmt(item.stock, item.unit)}` : "품목 선택 필요"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label={`입고 수량 (${item?.unit || ""})`} value={qty} onChange={setQty} placeholder="예: 12" type="number" />
          <Input label="공급처 / 로트번호" value={lot} onChange={setLot} placeholder={item ? item.supplier : "공급처"} />
          <Input label="유효기간 (있을 경우)" value={expiry} onChange={setExp} placeholder="YYYY-MM-DD" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check"
            onClick={() => onSubmit(Number(qty) || 0)} disabled={!qty || !item}>입고 처리</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SuppliesScreen });
