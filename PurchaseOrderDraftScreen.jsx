// KoMES — 발주서 초안 편집 화면
// AI 추천 → "발주서 초안 만들기" 클릭 시 진입
// 좌: 공급처별 초안 리스트 / 메인: 선택된 초안의 편집 영역

const { useState: useStPOD, useMemo: useMemoPOD, useEffect: useEffPOD } = React;

const TODAY_STR = "2026-05-16";
const STAFF_OPTIONS = ["김민준 (원장)", "이수민 (간호조무)", "박지원 (간호조무)"];
const PAYMENT_OPTIONS = ["월말 정산", "선결제", "후불 30일", "현금 결제"];

function PurchaseOrderDraftScreen({ onClose, onSubmit, initialRecommendations }) {
  // 초기 초안 구성: 추천 결과 → drafts 배열
  const [drafts, setDrafts] = useStPOD(() => {
    const recs = initialRecommendations || computeRecommendations(REC_DEFAULTS);
    return recs.map((g, i) => {
      const meta = SUPPLIERS[g.supplier] || {};
      const expected = addDays(TODAY_STR, (meta.avgLead || 7));
      return {
        id: `DRAFT-${String(i + 1).padStart(3, "0")}`,
        supplier: g.supplier,
        orderDate: TODAY_STR,
        expectedDate: expected,
        placedBy: STAFF_OPTIONS[0],
        paymentTerms: meta.payment || "월말 정산",
        note: "",
        items: g.items.map(it => ({ ...it, key: `${it.id}-${Math.random().toString(36).slice(2, 8)}` })),
        deletedItems: [],
      };
    });
  });

  const [selectedIdx, setSelectedIdx] = useStPOD(0);
  const [activeItemKey, setActiveItemKey] = useStPOD(null);
  const [toast, setToast] = useStPOD(null);
  const [confirmSubmit, setConfirmSubmit] = useStPOD(false);

  // 자동으로 첫 라인 활성화
  useEffPOD(() => {
    const d = drafts[selectedIdx];
    if (d && d.items.length > 0 && !activeItemKey) {
      setActiveItemKey(d.items[0].key);
    }
  }, [selectedIdx, drafts.length]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  // ── Mutators ────────────────────────────────────────────────
  const updateDraft = (idx, patch) => {
    setDrafts(d => d.map((x, i) => i === idx ? { ...x, ...patch } : x));
  };
  const updateItem = (draftIdx, itemKey, patch) => {
    setDrafts(d => d.map((x, i) => i !== draftIdx ? x : {
      ...x,
      items: x.items.map(it => it.key === itemKey ? { ...it, ...patch } : it),
    }));
  };
  const removeItem = (draftIdx, itemKey) => {
    setDrafts(d => d.map((x, i) => i !== draftIdx ? x : {
      ...x,
      items: x.items.filter(it => it.key !== itemKey),
      deletedItems: [...x.deletedItems, x.items.find(it => it.key === itemKey)],
    }));
    showToast("품목이 제거되었습니다. 우측 상단 '복원'에서 되돌릴 수 있습니다.");
  };
  const restoreDeleted = (draftIdx) => {
    setDrafts(d => d.map((x, i) => i !== draftIdx ? x : {
      ...x,
      items: [...x.items, ...x.deletedItems],
      deletedItems: [],
    }));
    showToast("삭제된 품목이 복원되었습니다.");
  };
  const removeDraft = (idx) => {
    setDrafts(d => d.filter((_, i) => i !== idx));
    setSelectedIdx(Math.max(0, idx - 1));
    showToast("초안이 삭제되었습니다.");
  };
  const resetItemQty = (draftIdx, itemKey) => {
    setDrafts(d => d.map((x, i) => i !== draftIdx ? x : {
      ...x,
      items: x.items.map(it => {
        if (it.key !== itemKey) return it;
        // 원본 추천 수량으로 재계산: targetCoverDays 기준 그대로
        const need = (it.monthly / 30) * REC_DEFAULTS.targetCoverDays - it.currentStock;
        const round = it.kind === "herb" ? REC_DEFAULTS.roundingHerb : REC_DEFAULTS.roundingSupply;
        const qty = Math.max(it.threshold, Math.ceil(need / round) * round);
        return { ...it, qty };
      }),
    }));
  };

  const current = drafts[selectedIdx] || null;
  const totalAll = drafts.reduce((s, d) =>
    s + d.items.reduce((ss, i) => ss + i.qty * i.unitPrice, 0), 0);
  const totalItems = drafts.reduce((s, d) => s + d.items.length, 0);

  if (drafts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Icon name="inbox" size={32} style={{ color: "var(--text-muted)" }} />
        <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>모든 초안이 삭제되었습니다</div>
        <Button variant="secondary" size="md" icon="arrow-left" onClick={onClose}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      {/* Mode banner */}
      <div style={{
        background: "linear-gradient(90deg, var(--jade-800) 0%, var(--jade-700) 100%)",
        color: "white", padding: "10px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Icon name="sparkles" size={16} style={{ color: "var(--jade-200)" }} />
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>AI 추천 발주서 초안</div>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }}></div>
        <div style={{ fontSize: 11, color: "var(--jade-200)" }}>
          공급처 {drafts.length}곳 · 총 {totalItems}품목 · 합계 {won(totalAll)} — 검토 후 승인 요청
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--jade-200)" }}>
          작성 시각 {TODAY_STR} 14:32
        </div>
      </div>

      <TopBar
        title="발주서 초안 편집"
        subtitle={`${current?.supplier} · ${current?.items.length}품목 선택됨`}
        actions={<>
          <Button variant="ghost" size="sm" icon="x" onClick={onClose}>닫기</Button>
          <Button variant="secondary" size="sm" icon="save" onClick={() => onSubmit && onSubmit({ draft: true, drafts })}>임시 저장</Button>
          <Button variant="primary" size="sm" icon="send" onClick={() => setConfirmSubmit(true)}
            disabled={drafts.length === 0 || totalItems === 0}>승인 요청 ({drafts.length}건)</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Left — drafts sidebar */}
        <PODraftSidebar
          drafts={drafts}
          selectedIdx={selectedIdx}
          onSelect={i => { setSelectedIdx(i); setActiveItemKey(null); }}
          totalAll={totalAll}
        />

        {/* Main — selected draft edit */}
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0, background: "var(--bg-raised)" }}>
          {current && (
            <PODraftEditor
              draft={current}
              draftIdx={selectedIdx}
              activeItemKey={activeItemKey}
              onSelectItem={setActiveItemKey}
              onUpdateDraft={(patch) => updateDraft(selectedIdx, patch)}
              onUpdateItem={(key, patch) => updateItem(selectedIdx, key, patch)}
              onRemoveItem={(key) => removeItem(selectedIdx, key)}
              onResetQty={(key) => resetItemQty(selectedIdx, key)}
              onRestore={() => restoreDeleted(selectedIdx)}
              onRemoveDraft={() => removeDraft(selectedIdx)}
            />
          )}
        </div>

        {/* Right — line reason / supplier info panel */}
        <PODraftRightPanel
          draft={current}
          activeItemKey={activeItemKey}
        />
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

      {confirmSubmit && (
        <PODraftConfirmModal
          drafts={drafts} totalAll={totalAll} totalItems={totalItems}
          onClose={() => setConfirmSubmit(false)}
          onConfirm={() => { setConfirmSubmit(false); onSubmit && onSubmit({ draft: false, drafts }); }}
        />
      )}
    </div>
  );
}

// ── 좌측 초안 사이드바 ───────────────────────────────────────────
function PODraftSidebar({ drafts, selectedIdx, onSelect, totalAll }) {
  return (
    <div style={{
      width: 280, background: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 16px 12px",
        background: "linear-gradient(180deg, var(--jade-50), var(--bg-surface))",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>총 합계</div>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{won(totalAll)}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-sans)" }}>
          {drafts.length}개 발주서 초안
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {drafts.map((d, i) => {
          const total = d.items.reduce((s, x) => s + x.qty * x.unitPrice, 0);
          const meta = SUPPLIERS[d.supplier] || {};
          const belowMin = meta.minOrder && total < meta.minOrder;
          const urgent = d.items.filter(x => x.urgency === "high").length;
          const isSel = i === selectedIdx;
          return (
            <div key={d.id} onClick={() => onSelect(i)} style={{
              padding: "11px 12px", marginBottom: 4,
              borderRadius: "var(--radius-md)", cursor: "pointer",
              background: isSel ? "var(--brand-subtle)" : "transparent",
              border: `1px solid ${isSel ? "var(--jade-300)" : "transparent"}`,
              transition: "all 0.1s ease",
            }}
            onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--bg-raised)"; }}
            onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isSel ? "var(--jade-800)" : "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{d.supplier}</span>
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{d.items.length}품목</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{won(total)}</span>
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                {urgent > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 600, background: "var(--status-danger-bg)", color: "var(--cinnabar-700)", padding: "1px 6px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)" }}>긴급 {urgent}</span>
                )}
                {belowMin && (
                  <span title={`최소 발주 ${won(meta.minOrder)}`}
                        style={{ fontSize: 9, fontWeight: 600, background: "var(--status-warning-bg)", color: "var(--amber-700)", padding: "1px 6px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)" }}>
                    최소금액 미달
                  </span>
                )}
                {!urgent && !belowMin && (
                  <span style={{ fontSize: 9, fontWeight: 500, background: "var(--brand-muted)", color: "var(--jade-700)", padding: "1px 6px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)" }}>준비됨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 메인 편집 영역 ───────────────────────────────────────────────
function PODraftEditor({ draft, draftIdx, activeItemKey, onSelectItem, onUpdateDraft, onUpdateItem, onRemoveItem, onResetQty, onRestore, onRemoveDraft }) {
  const meta = SUPPLIERS[draft.supplier] || {};
  const total = draft.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const belowMin = meta.minOrder && total < meta.minOrder;

  return (
    <div style={{ padding: "20px 28px 32px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 1100, minWidth: 0 }}>

      {/* 공급처 헤더 카드 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: "18px 22px",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--radius-md)",
            background: "var(--brand-muted)", color: "var(--jade-700)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="building-2" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{draft.supplier}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{draft.id}</span>
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", flexWrap: "wrap", rowGap: 4 }}>
              {meta.contact && <span style={{ whiteSpace: "nowrap" }}><Icon name="user" size={11} style={{ verticalAlign: "-1px", color: "var(--text-muted)" }} /> {meta.contact}</span>}
              {meta.phone && <span style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}><Icon name="phone" size={11} style={{ verticalAlign: "-1px", color: "var(--text-muted)" }} /> {meta.phone}</span>}
              {meta.avgLead != null && <span style={{ whiteSpace: "nowrap" }}><Icon name="truck" size={11} style={{ verticalAlign: "-1px", color: "var(--text-muted)" }} /> 평균 리드 {meta.avgLead}일</span>}
              {meta.minOrder != null && <span style={{ whiteSpace: "nowrap" }}><Icon name="banknote" size={11} style={{ verticalAlign: "-1px", color: "var(--text-muted)" }} /> 최소 {won(meta.minOrder)}</span>}
            </div>
            {meta.note && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic", fontFamily: "var(--font-sans)" }}>{meta.note}</div>
            )}
          </div>
          <Button variant="ghost" size="sm" icon="trash-2" onClick={onRemoveDraft}>이 초안 삭제</Button>
        </div>
      </div>

      {/* 발주 기본 정보 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: "16px 22px", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>발주 기본 정보</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          <PODField label="발주일">
            <input type="date" value={draft.orderDate}
              onChange={e => onUpdateDraft({ orderDate: e.target.value })}
              style={fieldStyle} />
          </PODField>
          <PODField label="입고 예정일">
            <input type="date" value={draft.expectedDate}
              onChange={e => onUpdateDraft({ expectedDate: e.target.value })}
              style={fieldStyle} />
          </PODField>
          <PODField label="담당자">
            <select value={draft.placedBy} onChange={e => onUpdateDraft({ placedBy: e.target.value })}
              style={{ ...fieldStyle, appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238A9E9A' d='M0 0l5 6 5-6z'/></svg>\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 }}>
              {STAFF_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </PODField>
          <PODField label="결제 조건">
            <select value={draft.paymentTerms} onChange={e => onUpdateDraft({ paymentTerms: e.target.value })}
              style={{ ...fieldStyle, appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%238A9E9A' d='M0 0l5 6 5-6z'/></svg>\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 }}>
              {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </PODField>
        </div>
      </div>

      {/* 품목 테이블 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
      }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>발주 품목</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{draft.items.length}건</span>
          <div style={{ flex: 1 }}></div>
          {draft.deletedItems.length > 0 && (
            <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={onRestore}>
              {draft.deletedItems.length}건 복원
            </Button>
          )}
          <Button variant="ghost" size="sm" icon="plus" onClick={() => {}}>품목 추가</Button>
        </div>

        {draft.items.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            품목이 없습니다 — 위의 "복원" 또는 "품목 추가"로 추가하세요
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
            <thead>
              <tr style={{ background: "var(--bg-raised)" }}>
                <th style={dHdrL}>품목</th>
                <th style={dHdrL}>추천 사유</th>
                <th style={dHdrR}>현재 재고</th>
                <th style={{ ...dHdrC, width: 170 }}>발주 수량</th>
                <th style={{ ...dHdrR, width: 110 }}>단가</th>
                <th style={dHdrR}>소계</th>
                <th style={{ ...dHdrC, width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {draft.items.map(it => {
                const isActive = activeItemKey === it.key;
                const subtotal = it.qty * it.unitPrice;
                return (
                  <tr key={it.key}
                    onClick={() => onSelectItem(it.key)}
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      background: isActive ? "var(--brand-subtle)" : "transparent",
                      cursor: "pointer", transition: "background 0.1s ease",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-raised)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 22, height: 22, borderRadius: "var(--radius-sm)",
                          background: it.kind === "herb" ? "var(--brand-muted)" : "var(--bg-raised)",
                          color: it.kind === "herb" ? "var(--jade-700)" : "var(--ink-600)",
                          flexShrink: 0,
                        }}>
                          <Icon name={it.kind === "herb" ? "leaf" : "package"} size={11} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{it.name}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" }}>{it.category}{it.pack ? ` · ${it.pack}` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        display: "inline-block",
                        fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)",
                        color: it.urgency === "high" ? "var(--cinnabar-700)" :
                               it.urgency === "med"  ? "var(--amber-700)" : "var(--jade-700)",
                        padding: "2px 8px", borderRadius: "var(--radius-full)",
                        background: it.urgency === "high" ? "var(--status-danger-bg)" :
                                    it.urgency === "med"  ? "var(--status-warning-bg)" : "var(--brand-muted)",
                        whiteSpace: "nowrap",
                      }}>
                        {it.urgency === "high" ? "긴급" : it.urgency === "med" ? "주의" : "여유"} · {it.reason}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                      {it.kind === "herb" ? fmtMass(it.currentStock) : `${it.currentStock} ${it.unit}`}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <QtyStepper
                        value={it.qty}
                        unit={it.unit}
                        kind={it.kind}
                        onChange={v => onUpdateItem(it.key, { qty: Math.max(0, v) })}
                        onReset={() => onResetQty(it.key)}
                      />
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <input type="number" value={it.unitPrice}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onUpdateItem(it.key, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                        style={{
                          width: 90, padding: "6px 10px", textAlign: "right",
                          fontFamily: "var(--font-mono)", fontSize: 12,
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)", outline: "none",
                          background: "var(--bg-surface)",
                        }} />
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {won(subtotal)}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <button onClick={e => { e.stopPropagation(); onRemoveItem(it.key); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                        title="이 품목 삭제">
                        <Icon name="x" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: "var(--bg-raised)", borderTop: "2px solid var(--border-default)" }}>
                <td colSpan={5} style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>합계</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{won(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* 최소 발주 금액 경고 */}
      {belowMin && (
        <div style={{
          padding: "12px 16px", background: "var(--status-warning-bg)",
          border: "1px solid var(--amber-200)", borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <Icon name="alert-triangle" size={15} style={{ color: "var(--amber-700)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber-700)" }}>최소 발주 금액 미달</div>
            <div style={{ fontSize: 11, color: "var(--amber-700)", marginTop: 2, lineHeight: 1.5 }}>
              {draft.supplier}의 최소 발주 금액은 {won(meta.minOrder)}입니다. 현재 {won(total)} — {won(meta.minOrder - total)} 더 필요합니다.
              승인은 가능하나 공급처 처리 시 배송비가 추가될 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* 메모 */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px", boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>공급처 전달 메모</div>
        <textarea value={draft.note} onChange={e => onUpdateDraft({ note: e.target.value })}
          placeholder="배송 시 주의 사항, 분할 입고 요청, 결제 조건 변경 등을 입력하세요"
          style={{
            width: "100%", minHeight: 56, padding: "8px 11px",
            fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
            background: "var(--bg-surface)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
          }} />
      </div>
    </div>
  );
}

// ── 수량 스텝퍼 ──────────────────────────────────────────────────
function QtyStepper({ value, unit, kind, onChange, onReset }) {
  const step = kind === "herb" ? 100 : 1;
  return (
    <div onClick={e => e.stopPropagation()} style={{
      display: "flex", alignItems: "center", gap: 4,
      border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
      background: "var(--bg-surface)", padding: 2,
    }}>
      <button onClick={() => onChange(value - step)}
        style={stepBtn}>
        <Icon name="minus" size={11} />
      </button>
      <input type="number" value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        style={{
          width: 64, padding: "5px 6px", textAlign: "right",
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
          color: "var(--text-primary)", border: "none", outline: "none",
          background: "transparent",
        }} />
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", paddingRight: 4 }}>{unit}</span>
      <button onClick={() => onChange(value + step)}
        style={stepBtn}>
        <Icon name="plus" size={11} />
      </button>
      <button onClick={onReset} title="추천 수량으로 복원"
        style={{ ...stepBtn, marginLeft: 2, color: "var(--jade-700)" }}>
        <Icon name="sparkles" size={10} />
      </button>
    </div>
  );
}

const stepBtn = {
  width: 22, height: 22, border: "none", background: "transparent",
  cursor: "pointer", color: "var(--text-secondary)",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "var(--radius-sm)",
};

// ── 우측 추천 사유 / 공급처 상세 패널 ────────────────────────────
function PODraftRightPanel({ draft, activeItemKey }) {
  if (!draft) return <div style={{ width: 320, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)" }}></div>;

  const item = draft.items.find(it => it.key === activeItemKey);

  return (
    <div style={{
      width: 320, background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border-subtle)",
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16,
      flexShrink: 0, overflowY: "auto",
    }}>
      {item ? (
        <PODItemDetail item={item} draft={draft} />
      ) : (
        <div style={{
          color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-sans)",
          padding: "24px 12px", textAlign: "center",
          background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-subtle)",
        }}>
          품목을 선택하면<br/>추천 사유와 가격 이력이 표시됩니다
        </div>
      )}

      {/* Draft summary */}
      <div style={{
        marginTop: "auto", padding: "12px 14px", background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>이 발주서</div>
        <PODFact label="공급처" value={draft.supplier} />
        <PODFact label="품목" value={`${draft.items.length}건`} />
        <PODFact label="발주일" value={draft.orderDate} mono />
        <PODFact label="입고 예정" value={draft.expectedDate} mono />
        <PODFact label="결제 조건" value={draft.paymentTerms} />
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }}></div>
        <PODFact label="합계"
          value={won(draft.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))} bold />
      </div>
    </div>
  );
}

function PODItemDetail({ item, draft }) {
  const meta = SUPPLIERS[draft.supplier] || {};
  const projectedReceive = addDays(draft.orderDate, meta.avgLead || 7);
  const stockAfter = item.currentStock + item.qty;
  const daysAfter = Math.round((stockAfter / (item.monthly / 30)));

  return (
    <>
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, borderRadius: "var(--radius-md)",
            background: item.kind === "herb" ? "var(--brand-muted)" : "var(--bg-raised)",
            color: item.kind === "herb" ? "var(--jade-700)" : "var(--ink-600)",
            flexShrink: 0,
          }}>
            <Icon name={item.kind === "herb" ? "leaf" : "package"} size={14} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{item.name}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{item.category}{item.pack ? ` · ${item.pack}` : ""}</div>
          </div>
        </div>
      </div>

      {/* AI 추천 사유 박스 */}
      <div style={{
        padding: "12px 14px",
        background: item.urgency === "high" ? "var(--status-danger-bg)" :
                    item.urgency === "med"  ? "var(--status-warning-bg)" : "var(--brand-subtle)",
        border: `1px solid ${item.urgency === "high" ? "var(--cinnabar-200)" : item.urgency === "med" ? "var(--amber-200)" : "var(--jade-200)"}`,
        borderRadius: "var(--radius-md)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Icon name="sparkles" size={12} style={{
            color: item.urgency === "high" ? "var(--cinnabar-700)" :
                   item.urgency === "med"  ? "var(--amber-700)" : "var(--jade-700)" }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
            color: item.urgency === "high" ? "var(--cinnabar-700)" :
                   item.urgency === "med"  ? "var(--amber-700)" : "var(--jade-700)",
          }}>AI 추천 사유</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6 }}>
          {item.urgency === "high" && <>현재 잔여 <b>{item.daysLeft}일</b> — 보충이 지연되면 처방 불가 위험이 있습니다.</>}
          {item.urgency === "med"  && <>현재 잔여 <b>{item.daysLeft}일</b> — 안전 기간 내 보충이 필요합니다.</>}
          {item.urgency === "low"  && <>안전 임계치 미달 — 다음 회차에 묶어 보충 권장됩니다.</>}
        </div>
      </div>

      {/* 재고 분석 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>재고 분석</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <PODFact label="현재 재고"
            value={item.kind === "herb" ? fmtMass(item.currentStock) : `${item.currentStock} ${item.unit}`}
            mono />
          <PODFact label="안전 임계치"
            value={item.kind === "herb" ? fmtMass(item.threshold) : `${item.threshold} ${item.unit}`}
            mono />
          <PODFact label="월 소비"
            value={item.kind === "herb" ? fmtMass(item.monthly) : `${item.monthly} ${item.unit}`}
            mono />
          <PODFact label="잔여 일수" value={`${item.daysLeft}일`} mono
            accent={item.daysLeft <= 7 ? "var(--cinnabar-700)" : item.daysLeft <= 14 ? "var(--amber-700)" : null} />
        </div>
      </div>

      {/* 발주 후 시뮬레이션 */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>발주 후 (시뮬레이션)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <PODFact label="입고 예정일" value={projectedReceive} mono />
          <PODFact label="입고 후 재고"
            value={item.kind === "herb" ? fmtMass(stockAfter) : `${stockAfter} ${item.unit}`}
            mono />
          <PODFact label="다음 발주 예상" value={`${daysAfter}일 후`} mono
            accent="var(--jade-700)" />
        </div>
      </div>

      {/* 단가 변동 (임시 데이터) */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>최근 매입 단가</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { date: "2026-05", price: item.unitPrice, current: true },
            { date: "2026-03", price: Math.round(item.unitPrice * 0.96) },
            { date: "2026-01", price: Math.round(item.unitPrice * 0.94) },
            { date: "2025-11", price: Math.round(item.unitPrice * 0.92) },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "6px 10px",
              background: p.current ? "var(--brand-subtle)" : "var(--bg-raised)",
              border: `1px solid ${p.current ? "var(--jade-200)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              fontSize: 11, fontFamily: "var(--font-mono)",
            }}>
              <span style={{ color: p.current ? "var(--jade-800)" : "var(--text-muted)" }}>{p.date}{p.current && " · 현재"}</span>
              <span style={{ color: p.current ? "var(--jade-800)" : "var(--text-secondary)", fontWeight: p.current ? 600 : 400 }}>{won(p.price)} / {item.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 승인 요청 확인 모달 ──────────────────────────────────────────
function PODraftConfirmModal({ drafts, totalAll, totalItems, onClose, onConfirm }) {
  const urgentCount = drafts.reduce((s, d) =>
    s + d.items.filter(i => i.urgency === "high").length, 0);
  const belowMinCount = drafts.filter(d => {
    const meta = SUPPLIERS[d.supplier] || {};
    const total = d.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    return meta.minOrder && total < meta.minOrder;
  }).length;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: 480, padding: "24px 26px", boxShadow: "var(--shadow-xl)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "var(--radius-full)",
            background: "var(--brand-muted)", color: "var(--jade-700)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="send" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}>승인 요청</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>아래 발주서가 원장님 승인 큐에 등록됩니다</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <PODFact label="발주서 수" value={`${drafts.length}건`} />
          <PODFact label="품목" value={`${totalItems}건`} />
          {urgentCount > 0 && <PODFact label="긴급 품목 포함" value={`${urgentCount}건`} accent="var(--cinnabar-700)" />}
          <PODFact label="총 발주 금액" value={won(totalAll)} bold />
        </div>

        {belowMinCount > 0 && (
          <div style={{
            marginTop: 14, padding: "10px 12px", background: "var(--status-warning-bg)",
            border: "1px solid var(--amber-200)", borderRadius: "var(--radius-md)",
            fontSize: 11, color: "var(--amber-700)", display: "flex", gap: 8,
          }}>
            <Icon name="alert-triangle" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{belowMinCount}개 발주서가 공급처 최소 금액에 미달합니다 — 배송비가 추가될 수 있습니다.</span>
          </div>
        )}

        <div style={{
          marginTop: 14, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5,
        }}>
          승인 시 발주서는 원장님께 자동 전송되며 승인이 완료되면 공급처로 발주가 이뤄집니다.
          승인 대기 중에는 발주 이력에서 수정 가능합니다.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="send" onClick={onConfirm}>승인 요청 전송</Button>
        </div>
      </div>
    </div>
  );
}

// ── 작은 도우미들 ────────────────────────────────────────────────
function PODField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</label>
      {children}
    </div>
  );
}

function PODFact({ label, value, accent, bold, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{
        fontSize: bold ? 14 : 12,
        fontFamily: mono || bold ? "var(--font-mono)" : "var(--font-sans)",
        color: accent || "var(--text-primary)",
        fontWeight: bold ? 600 : 400,
        whiteSpace: "nowrap",
      }}>{value}</span>
    </div>
  );
}

const fieldStyle = {
  width: "100%", padding: "8px 11px",
  fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)", outline: "none",
};

const dHdrBase = {
  padding: "10px 14px", fontSize: 10, fontWeight: 700,
  color: "var(--text-muted)", letterSpacing: "0.06em",
  textTransform: "uppercase", whiteSpace: "nowrap",
};
const dHdrL = { ...dHdrBase, textAlign: "left" };
const dHdrR = { ...dHdrBase, textAlign: "right" };
const dHdrC = { ...dHdrBase, textAlign: "center" };

// 날짜 더하기 (YYYY-MM-DD)
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

Object.assign(window, { PurchaseOrderDraftScreen });
