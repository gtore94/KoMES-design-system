// KoMES — 신규 소모품(품목) 등록 모달
// 섹션형 폼: 기본 정보 · 단위/규격 · 재고 기준 · 가격/공급 · 보관/유통

const { useState: useStSR } = React;

function SupplyRegistrationModal({ onClose, onSubmit }) {
  const [name, setName]         = useStSR("");
  const [category, setCategory] = useStSR("");
  const [sku, setSku]           = useStSR("");
  const [unit, setUnit]         = useStSR("");
  const [pack, setPack]         = useStSR("");
  const [unitPrice, setUP]      = useStSR("");
  const [supplier, setSupplier] = useStSR("");
  const [initStock, setInit]    = useStSR("");
  const [threshold, setThr]     = useStSR("");
  const [monthly, setMonthly]   = useStSR("");
  const [location, setLoc]      = useStSR("");
  const [hasExpiry, setHE]      = useStSR(true);
  const [expiry, setExpiry]     = useStSR("");
  const [lastIn, setLastIn]     = useStSR("2026-05-16");
  const [memo, setMemo]         = useStSR("");

  const cats = SUP_CATEGORIES.filter(c => c.key !== "all");
  const unitPresets = ["박스", "팩", "개", "매", "롤", "kg", "L", "통", "세트", "묶음"];

  const stockNum  = Number(initStock) || 0;
  const thrNum    = Number(threshold) || 0;
  const upNum     = Number(unitPrice) || 0;
  const initValue = stockNum * upNum;
  const valid = name.trim() && category && unit && upNum > 0 && thrNum > 0;

  const ready = () => onSubmit && onSubmit({
    name, category, sku, unit, pack, unitPrice: upNum, supplier,
    initStock: stockNum, threshold: thrNum, monthly: Number(monthly) || 0,
    location, expiry: hasExpiry ? expiry : null, lastIn, memo,
  });

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: 880, maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px 16px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "flex-start", gap: 12,
          background: "linear-gradient(180deg, var(--stone-100) 0%, var(--bg-surface) 100%)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: "var(--stone-200)", color: "var(--ink-700)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="package" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>신규 품목 등록</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              의료·포장재·사무·청소 소모품 마스터에 추가됩니다
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* ── 기본 정보 ── */}
          <SRSection title="기본 정보" sub="품목 식별과 분류" num="1">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <Input label="품명 *" value={name} onChange={setName} placeholder="예: 일회용 침 0.20×30mm" />
              <Input label="SKU / 품번" value={sku} onChange={setSku} placeholder="예: ND-2030-100" />
            </div>
            <div style={{ marginTop: 14 }}>
              <SRField label="분류 *">
                <div style={{ display: "flex", gap: 6 }}>
                  {cats.map(c => {
                    const sel = category === c.key;
                    const tone = SUP_CAT_COLOR[c.label] || SUP_CAT_COLOR["사무"];
                    return (
                      <button key={c.key} onClick={() => setCategory(c.key)}
                        style={{
                          flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, padding: "10px 0",
                          border: `1px solid ${sel ? tone.fg : "var(--border-default)"}`,
                          background: sel ? tone.bg : "var(--bg-surface)",
                          color: sel ? tone.fg : "var(--text-secondary)",
                          borderRadius: "var(--radius-md)", cursor: "pointer",
                          fontWeight: sel ? 600 : 400, transition: "all 0.12s ease",
                        }}>
                        <Icon name={
                          c.label === "의료" ? "stethoscope" :
                          c.label === "포장재" ? "package-2" :
                          c.label === "사무" ? "file-text" : "spray-can"
                        } size={14} style={{ marginRight: 6, verticalAlign: "-3px" }} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </SRField>
            </div>
          </SRSection>

          {/* ── 단위 / 규격 ── */}
          <SRSection title="단위 · 규격" sub="입출고와 표시에 사용되는 기준 단위" num="2">
            <SRField label="기본 단위 *">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {unitPresets.map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    style={{
                      fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 12px",
                      border: `1px solid ${unit === u ? "var(--jade-500)" : "var(--border-default)"}`,
                      background: unit === u ? "var(--jade-50)" : "var(--bg-surface)",
                      color: unit === u ? "var(--jade-700)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-full)", cursor: "pointer",
                      fontWeight: unit === u ? 600 : 400,
                    }}>{u}</button>
                ))}
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="직접 입력"
                  style={{
                    flex: 1, minWidth: 100, fontFamily: "var(--font-sans)", fontSize: 12,
                    padding: "5px 10px", border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)", outline: "none",
                  }} />
              </div>
            </SRField>
            <Input label="포장 규격" value={pack} onChange={setPack} placeholder="예: 100개입, 500ml, 50매" hint="구매 단위 1개에 포함된 수량" />
          </SRSection>

          {/* ── 재고 기준 ── */}
          <SRSection title="재고 기준" sub="자동 발주 추천과 잔여 일수 계산 기준" num="3">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Input label={`초기 재고 (${unit || "단위"})`} value={initStock} onChange={setInit} placeholder="0" type="number" />
              <Input label="안전 임계치 *" value={threshold} onChange={setThr} placeholder="예: 10" type="number" hint="이 값 미만시 재고 부족" />
              <Input label="월 예상 소비" value={monthly} onChange={setMonthly} placeholder="예: 12" type="number" hint="잔여 일수 계산" />
            </div>
          </SRSection>

          {/* ── 가격 / 공급 ── */}
          <SRSection title="가격 · 공급처" sub="발주서 자동 생성에 사용됩니다" num="4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label={`단가 (원 / ${unit || "단위"}) *`} value={unitPrice} onChange={setUP} placeholder="예: 12000" type="number" />
              <Input label="주 공급처" value={supplier} onChange={setSupplier} placeholder="예: 동방의료기" />
            </div>
            {stockNum > 0 && upNum > 0 && (
              <div style={{
                marginTop: 12, padding: "10px 14px", background: "var(--stone-100)",
                border: "1px solid var(--stone-300)", borderRadius: "var(--radius-md)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>초기 재고가치</span>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{won(initValue)}</span>
              </div>
            )}
          </SRSection>

          {/* ── 보관 / 유통 ── */}
          <SRSection title="보관 · 유통" sub="유효기간 임박 알림 및 보관 위치" num="5">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="보관 위치" value={location} onChange={setLoc} placeholder="예: 창고 A-1" />
              <Input label="최초 입고일" value={lastIn} onChange={setLastIn} placeholder="YYYY-MM-DD" />
            </div>
            <div style={{ marginTop: 14 }}>
              <SRField label="유효기간 관리">
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: hasExpiry ? 10 : 0 }}>
                  <button onClick={() => setHE(true)}
                    style={{
                      fontFamily: "var(--font-sans)", fontSize: 12, padding: "6px 14px",
                      border: `1px solid ${hasExpiry ? "var(--jade-500)" : "var(--border-default)"}`,
                      background: hasExpiry ? "var(--jade-50)" : "var(--bg-surface)",
                      color: hasExpiry ? "var(--jade-700)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-md)", cursor: "pointer",
                      fontWeight: hasExpiry ? 600 : 400,
                    }}>유효기간 있음</button>
                  <button onClick={() => setHE(false)}
                    style={{
                      fontFamily: "var(--font-sans)", fontSize: 12, padding: "6px 14px",
                      border: `1px solid ${!hasExpiry ? "var(--jade-500)" : "var(--border-default)"}`,
                      background: !hasExpiry ? "var(--jade-50)" : "var(--bg-surface)",
                      color: !hasExpiry ? "var(--jade-700)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-md)", cursor: "pointer",
                      fontWeight: !hasExpiry ? 600 : 400,
                    }}>해당 없음</button>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {hasExpiry ? "유효기간 90일 이내 진입 시 알림" : "기간 알림이 발생하지 않습니다"}
                  </span>
                </div>
                {hasExpiry && (
                  <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="YYYY-MM-DD"
                    style={{
                      width: "50%", fontFamily: "var(--font-sans)", fontSize: 13,
                      padding: "7px 10px", border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)", outline: "none",
                    }} />
                )}
              </SRField>
            </div>
          </SRSection>

          {/* ── 메모 ── */}
          <SRSection title="메모 (선택)" sub="사용 시 주의 사항이나 대체 품목" num="6">
            <textarea value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="예: 멸균 포장 · 개봉 후 6개월 이내 사용"
              style={{
                width: "100%", minHeight: 64, padding: "9px 11px",
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
              }} />
          </SRSection>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 28px", borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 10, background: "var(--stone-50)",
        }}>
          <Icon name="info" size={13} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            * 표시는 필수 항목입니다. 등록 후에도 모든 정보는 수정 가능합니다.
          </span>
          <div style={{ flex: 1 }}></div>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="ghost" size="md" icon="copy-plus" onClick={ready} disabled={!valid}>저장 후 계속</Button>
          <Button variant="primary" size="md" icon="check" onClick={ready} disabled={!valid}>등록</Button>
        </div>
      </div>
    </div>
  );
}

function SRSection({ title, sub, num, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "var(--radius-full)",
          background: "var(--stone-200)", color: "var(--ink-700)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
        }}>{num}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)", marginLeft: 4 }}></div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SRField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</label>
      {children}
    </div>
  );
}

Object.assign(window, { SupplyRegistrationModal });
