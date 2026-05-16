// KoMES — 발주 이력 화면 (약재 + 소모품 통합)
// 좌측: KPI · 필터 · PO 리스트 / 우측: 상세 패널 (라인 아이템 · 타임라인)

const { useState: useStPO, useMemo: useMemoPO } = React;

function PurchaseOrderHistoryScreen({ openSettings }) {
  const [selectedId, setSelectedId]   = useStPO(PURCHASE_ORDERS[0].id);
  const [statusFilter, setStatus]     = useStPO("all");
  const [typeFilter, setType]         = useStPO("all");
  const [supplier, setSupplier]       = useStPO("all");
  const [period, setPeriod]           = useStPO("90d"); // 30d | 90d | ytd | all
  const [search, setSearch]           = useStPO("");
  const [toast, setToast]             = useStPO(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  // 기간 필터 cutoff
  const cutoffDays = period === "30d" ? 30 : period === "90d" ? 90 : period === "ytd" ? 366 : 99999;

  const filtered = useMemoPO(() => {
    return PURCHASE_ORDERS.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter !== "all"   && p.type   !== typeFilter)   return false;
      if (supplier !== "all"     && p.supplier !== supplier)   return false;
      const d = (TODAY - new Date(p.date)) / (1000 * 60 * 60 * 24);
      if (d > cutoffDays) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchId = p.id.toLowerCase().includes(q);
        const matchSup = p.supplier.toLowerCase().includes(q);
        const matchItem = p.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchId && !matchSup && !matchItem) return false;
      }
      return true;
    });
  }, [statusFilter, typeFilter, supplier, period, search]);

  const selected = PURCHASE_ORDERS.find(p => p.id === selectedId) || filtered[0] || null;

  // KPI
  const kpi = useMemoPO(() => {
    const thisMonth = PURCHASE_ORDERS.filter(p =>
      new Date(p.date).getMonth() === TODAY.getMonth() &&
      new Date(p.date).getFullYear() === TODAY.getFullYear() &&
      p.status !== "cancelled"
    );
    const inflight = PURCHASE_ORDERS.filter(p => ["pending", "sent", "partial"].includes(p.status));
    const received = PURCHASE_ORDERS.filter(p => p.status === "received" && p.received);
    const leadTimes = received.map(poLeadDays).filter(Boolean);
    const avgLead = leadTimes.length ? Math.round(leadTimes.reduce((s, x) => s + x, 0) / leadTimes.length) : 0;
    const monthValue = thisMonth.reduce((s, p) => s + poTotal(p), 0);
    return {
      monthCount: thisMonth.length,
      monthValue,
      inflight: inflight.length,
      avgLead,
    };
  }, []);

  // 공급처 목록
  const suppliers = useMemoPO(() => {
    const set = new Set(PURCHASE_ORDERS.map(p => p.supplier));
    return ["all", ...Array.from(set).sort()];
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="발주 이력"
        subtitle={`전체 ${PURCHASE_ORDERS.length}건 · 진행 중 ${kpi.inflight}건 · 평균 리드타임 ${kpi.avgLead}일`}
        actions={<>
          <Button variant="ghost" size="sm" icon="download" onClick={() => showToast("발주 이력 엑셀을 내려받았습니다.")}>엑셀</Button>
          <Button variant="secondary" size="sm" icon="settings-2" onClick={openSettings}>추천 조건</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => showToast("새 발주서 작성 화면으로 이동합니다.")}>새 발주</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* KPI strip */}
          <div style={{ padding: "16px 24px 0", display: "flex", gap: 12 }}>
            <POKpi icon="receipt" label="이번 달 발주" value={`${kpi.monthCount}건`} sub={won(kpi.monthValue)} />
            <POKpi icon="truck"   label="진행 중"     value={`${kpi.inflight}건`} sub="입고 대기"
              accent={kpi.inflight > 0 ? "var(--text-brand)" : null} />
            <POKpi icon="timer"   label="평균 리드타임" value={`${kpi.avgLead}일`} sub="최근 완료 발주 기준" />
            <POKpi icon="check-circle" label="이번 분기 입고" value={`${PURCHASE_ORDERS.filter(p => p.status === "received").length}건`} sub="완료 발주" />
          </div>

          {/* Filter bar */}
          <div style={{
            padding: "16px 24px 12px", display: "flex", alignItems: "center",
            gap: 10, flexWrap: "wrap",
          }}>
            {/* Period segmented */}
            <div style={{ display: "flex", gap: 0, background: "var(--bg-raised)", padding: 3, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              {[
                { key: "30d", label: "30일" },
                { key: "90d", label: "90일" },
                { key: "ytd", label: "올해" },
                { key: "all", label: "전체" },
              ].map(t => (
                <button key={t.key} onClick={() => setPeriod(t.key)}
                  style={{
                    padding: "5px 12px", fontFamily: "var(--font-sans)", fontSize: 12,
                    border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                    background: period === t.key ? "var(--bg-surface)" : "transparent",
                    color: period === t.key ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: period === t.key ? 600 : 400,
                    boxShadow: period === t.key ? "var(--shadow-sm)" : "none",
                  }}>{t.label}</button>
              ))}
            </div>

            {/* Type chips */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "all",    label: "전체",   icon: null },
                { key: "herb",   label: "약재",   icon: "leaf" },
                { key: "supply", label: "소모품", icon: "package" },
              ].map(t => (
                <button key={t.key} onClick={() => setType(t.key)}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 12px",
                    border: `1px solid ${typeFilter === t.key ? "var(--jade-500)" : "var(--border-default)"}`,
                    background: typeFilter === t.key ? "var(--brand-subtle)" : "var(--bg-surface)",
                    color: typeFilter === t.key ? "var(--text-brand)" : "var(--text-secondary)",
                    borderRadius: "var(--radius-full)", whiteSpace: "nowrap", cursor: "pointer",
                    fontWeight: typeFilter === t.key ? 600 : 400,
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}>
                  {t.icon && <Icon name={t.icon} size={12} />}
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1 }}></div>
            <div style={{ width: 220 }}>
              <Input value={search} onChange={setSearch} placeholder="발주번호 / 공급처 / 품목" icon="search" />
            </div>
            <POSelect value={statusFilter} onChange={setStatus} options={[
              { value: "all", label: "상태 전체" },
              ...Object.values(PO_STATUS).map(s => ({ value: s.key, label: s.label })),
            ]} />
            <POSelect value={supplier} onChange={setSupplier} options={
              suppliers.map(s => ({ value: s, label: s === "all" ? "공급처 전체" : s }))
            } />
          </div>

          {/* Status pipeline overview */}
          <div style={{ padding: "0 24px 12px" }}>
            <POStatusBar orders={PURCHASE_ORDERS.filter(p => {
              const d = (TODAY - new Date(p.date)) / (1000 * 60 * 60 * 24);
              return d <= cutoffDays;
            })} statusFilter={statusFilter} onClick={setStatus} />
          </div>

          {/* PO list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-raised)" }}>
                    <th style={poHdrL}>발주번호</th>
                    <th style={poHdrC}>유형</th>
                    <th style={poHdrL}>공급처</th>
                    <th style={poHdrL}>품목</th>
                    <th style={poHdrR}>수량</th>
                    <th style={poHdrR}>금액</th>
                    <th style={poHdrL}>발주일</th>
                    <th style={poHdrL}>입고일</th>
                    <th style={poHdrL}>담당</th>
                    <th style={poHdrL}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(po => {
                    const st = PO_STATUS[po.status];
                    const isSel = po.id === selectedId;
                    const total = poTotal(po);
                    const lead = poLeadDays(po);
                    const delayed = po.expected && po.received &&
                      new Date(po.received) > new Date(po.expected);
                    return (
                      <tr key={po.id} onClick={() => setSelectedId(po.id)}
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          background: isSel ? "var(--brand-subtle)" : "transparent",
                          cursor: "pointer", transition: "background 0.1s ease",
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--bg-raised)"; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 500 }}>{po.id}</div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <span title={po.type === "herb" ? "약재" : "소모품"} style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 24, height: 24, borderRadius: "var(--radius-sm)",
                            background: po.type === "herb" ? "var(--brand-muted)" : "var(--bg-raised)",
                            color: po.type === "herb" ? "var(--text-brand)" : "var(--text-secondary)",
                          }}>
                            <Icon name={po.type === "herb" ? "leaf" : "package"} size={12} />
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-primary)" }}>{po.supplier}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{po.items[0].name}</span>
                            {po.items.length > 1 && (
                              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", background: "var(--bg-raised)", padding: "0 5px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", flexShrink: 0 }}>
                                +{po.items.length - 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{po.items.length}품목</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{won(total)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{po.date}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {po.received ? (
                            <span style={{ color: delayed ? "var(--status-danger-text)" : "var(--text-secondary)" }}>
                              {po.received}
                              {delayed && <span style={{ marginLeft: 4, fontSize: 10 }}>(지연)</span>}
                            </span>
                          ) : po.expected ? (
                            <span style={{ color: "var(--text-muted)" }}>예정 {po.expected}</span>
                          ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{po.placedBy}</td>
                        <td style={{ padding: "10px 14px" }}><Badge variant={st.tone}>{st.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  조건에 맞는 발주가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <PODetailPanel po={selected} onToast={showToast} />
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--text-primary)", color: "var(--bg-raised)",
          padding: "10px 18px", borderRadius: "var(--radius-md)",
          fontSize: 13, fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 8, zIndex: 100,
        }}>
          <Icon name="check-circle" size={14} style={{ color: "var(--jade-300)" }} />
          {toast}
        </div>
      )}
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────
function POKpi({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "12px 16px",
      boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)", color: "var(--text-brand)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: accent || "var(--text-primary)", fontFamily: "var(--font-serif)", marginTop: 2, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Status pipeline bar ─────────────────────────────────────────
function POStatusBar({ orders, statusFilter, onClick }) {
  const stages = [
    { key: "pending",  label: "승인 대기" },
    { key: "sent",     label: "발주 완료" },
    { key: "partial",  label: "부분 입고" },
    { key: "received", label: "입고 완료" },
    { key: "cancelled",label: "취소/반품" },
  ];
  const counts = stages.map(s => ({
    ...s,
    count: s.key === "cancelled"
      ? orders.filter(o => o.status === "cancelled" || o.status === "returned").length
      : orders.filter(o => o.status === s.key).length,
  }));

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: "10px 14px", boxShadow: "var(--shadow-sm)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {counts.map((s, i) => {
        const active = statusFilter === s.key;
        return (
          <React.Fragment key={s.key}>
            <button onClick={() => onClick(active ? "all" : s.key)}
              style={{
                flex: 1, padding: "8px 12px", border: "none", cursor: "pointer",
                background: active ? "var(--brand-subtle)" : "transparent",
                borderRadius: "var(--radius-md)", textAlign: "left",
                transition: "background 0.12s ease",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-raised)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-mono)", color: active ? "var(--text-brand)" : "var(--text-primary)", lineHeight: 1 }}>{s.count}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>건</span>
              </div>
              <div style={{ fontSize: 11, color: active ? "var(--text-brand)" : "var(--text-secondary)", marginTop: 3, fontWeight: active ? 600 : 400 }}>{s.label}</div>
            </button>
            {i < counts.length - 1 && (
              <Icon name="chevron-right" size={14} style={{ color: "var(--ink-200)", flexShrink: 0 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Detail panel ────────────────────────────────────────────────
function PODetailPanel({ po, onToast }) {
  if (!po) {
    return (
      <div style={{ width: 380, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)", padding: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        발주를 선택하면 상세가 표시됩니다
      </div>
    );
  }
  const st = PO_STATUS[po.status];
  const total = poTotal(po);
  const lead = poLeadDays(po);
  const expectedDays = po.expected ? Math.round((new Date(po.expected) - new Date(po.date)) / (1000*60*60*24)) : null;

  // Pipeline indicators
  const stageKeys = ["pending", "sent", "partial", "received"];
  const currentIdx = ["cancelled","returned"].includes(po.status) ? -1 : stageKeys.indexOf(po.status);

  return (
    <div style={{
      width: 380, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{po.id}</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em", marginTop: 2 }}>{po.supplier}</div>
          </div>
          <Badge variant={st.tone}>{st.label}</Badge>
        </div>

        {/* Stage pipeline */}
        {currentIdx >= 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12 }}>
            {stageKeys.map((k, i) => {
              const reached = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <React.Fragment key={k}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10,
                      borderRadius: "50%",
                      background: reached ? "var(--jade-500)" : "var(--stone-300)",
                      border: isCurrent ? "3px solid var(--jade-100)" : "none",
                    }}></div>
                    <span style={{
                      fontSize: 9, fontWeight: isCurrent ? 600 : 400,
                      color: reached ? "var(--text-brand)" : "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}>{PO_STATUS[k].label}</span>
                  </div>
                  {i < stageKeys.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentIdx ? "var(--jade-500)" : "var(--stone-300)", marginBottom: 14 }}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: "8px 12px", marginTop: 10, background: po.status === "returned" ? "var(--status-danger-bg)" : "var(--bg-raised)",
            border: `1px solid ${po.status === "returned" ? "var(--status-danger-border)" : "var(--stone-300)"}`,
            borderRadius: "var(--radius-md)", fontSize: 11, color: po.status === "returned" ? "var(--status-danger-text)" : "var(--text-secondary)",
          }}>{st.label} 처리된 발주입니다</div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Facts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <POFact label="발주일"   value={po.date} />
          {po.expected && (
            <POFact label="입고 예정일" value={`${po.expected} · ${expectedDays}일 후`} />
          )}
          {po.received && (
            <POFact
              label="실제 입고일"
              value={`${po.received}${lead ? ` · 리드 ${lead}일` : ""}`}
              accent={po.expected && new Date(po.received) > new Date(po.expected) ? "var(--status-danger-text)" : null}
            />
          )}
          <POFact label="담당자"   value={po.placedBy} />
          <POFact label="유형"     value={po.type === "herb" ? "약재" : "소모품"} />
          <POFact label="총 금액"  value={won(total)} bold />
        </div>

        {/* Line items */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            품목 ({po.items.length})
          </div>
          <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {po.items.map((it, i) => (
              <div key={i} style={{
                padding: "9px 12px",
                borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                display: "grid", gridTemplateColumns: "1fr auto", gap: 4,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{it.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    {it.qty.toLocaleString("ko-KR")} {it.unit} × {won(it.unitPrice)}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 500, textAlign: "right" }}>
                  {won(it.subtotal)}
                </div>
              </div>
            ))}
            <div style={{ padding: "9px 12px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-raised)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>합계</span>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{won(total)}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        {po.note && (
          <div style={{
            padding: "10px 12px", background: "var(--status-warning-bg)",
            border: "1px solid var(--status-warning-border)", borderRadius: "var(--radius-md)",
            fontSize: 12, color: "var(--status-warning-text)", lineHeight: 1.5,
            display: "flex", gap: 8,
          }}>
            <Icon name="message-square" size={13} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{po.note}</span>
          </div>
        )}

        {/* Timeline */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>처리 이력</div>
          <div style={{ position: "relative", paddingLeft: 16 }}>
            <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 1, background: "var(--border-subtle)" }}></div>
            {po.timeline.map((t, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 12 }}>
                <div style={{
                  position: "absolute", left: -16, top: 4,
                  width: 11, height: 11, borderRadius: "50%",
                  background: i === po.timeline.length - 1 ? "var(--jade-500)" : "var(--bg-surface)",
                  border: `2px solid ${i === po.timeline.length - 1 ? "var(--brand-muted)" : "var(--border-default)"}`,
                }}></div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{t.date} · {t.who}</div>
                <div style={{ fontSize: 12, color: "var(--text-primary)", marginTop: 1 }}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 6, background: "var(--bg-raised)" }}>
        <Button variant="secondary" size="sm" icon="printer" onClick={() => onToast("발주서 PDF를 생성합니다.")}>인쇄</Button>
        <Button variant="secondary" size="sm" icon="copy" onClick={() => onToast(`${po.id} 기준 발주서 복제 — 초안 작성`)}>복제</Button>
        <div style={{ flex: 1 }}></div>
        {po.status === "pending" && (
          <Button variant="primary" size="sm" icon="check" onClick={() => onToast(`${po.id} 승인 후 공급처 전송`)}>승인</Button>
        )}
        {po.status === "sent" && (
          <Button variant="primary" size="sm" icon="package-check" onClick={() => onToast(`${po.id} 입고 처리 화면을 엽니다.`)}>입고 처리</Button>
        )}
        {po.status === "partial" && (
          <Button variant="primary" size="sm" icon="package-check" onClick={() => onToast(`${po.id} 잔여 입고 처리`)}>잔여 입고</Button>
        )}
      </div>
    </div>
  );
}

function POFact({ label, value, accent, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 12px", background: "var(--bg-surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: bold ? 14 : 12, fontFamily: "var(--font-mono)", color: accent || "var(--text-primary)", fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function POSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", padding: "6px 28px 6px 10px", outline: "none",
        appearance: "none", cursor: "pointer",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238A9E9A' d='M0 0l5 6 5-6z'/></svg>\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const poHdrBase = {
  padding: "8px 14px", fontSize: 10, fontWeight: 700,
  color: "var(--text-muted)", letterSpacing: "0.06em",
  textTransform: "uppercase", whiteSpace: "nowrap",
};
const poHdrL = { ...poHdrBase, textAlign: "left" };
const poHdrR = { ...poHdrBase, textAlign: "right" };
const poHdrC = { ...poHdrBase, textAlign: "center" };

Object.assign(window, { PurchaseOrderHistoryScreen });
