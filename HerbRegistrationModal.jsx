// KoMES — 신규 약재 등록 모달
// 섹션형 폼: 기본 정보 · 분류/규격 · 가격/공급 · 보관/유통 · 메모

const { useState: useStHR } = React;

function HerbRegistrationModal({ onClose, onSubmit }) {
  const [name, setName]         = useStHR("");
  const [latin, setLatin]       = useStHR("");
  const [category, setCategory] = useStHR("");
  const [unitPrice, setUP]      = useStHR("");
  const [origin, setOrigin]     = useStHR("");
  const [supplier, setSupplier] = useStHR("");
  const [initStock, setInit]    = useStHR("");
  const [threshold, setThr]     = useStHR("");
  const [monthly, setMonthly]   = useStHR("");
  const [location, setLoc]      = useStHR("");
  const [storage, setStorage]   = useStHR("상온");
  const [expiry, setExpiry]     = useStHR("");
  const [lastIn, setLastIn]     = useStHR("2026-05-16");
  const [memo, setMemo]         = useStHR("");

  const cats = HERB_CATEGORIES.filter(c => c.key !== "all");
  const stockNum  = Number(initStock) || 0;
  const thrNum    = Number(threshold) || 0;
  const upNum     = Number(unitPrice) || 0;
  const initValue = stockNum * upNum;

  const valid = name.trim() && category && upNum > 0 && thrNum > 0;

  const ready = () => onSubmit && onSubmit({
    name, latin, category, unitPrice: upNum, origin, supplier,
    initStock: stockNum, threshold: thrNum, monthly: Number(monthly) || 0,
    location, storage, expiry, lastIn, memo,
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
          background: "linear-gradient(180deg, var(--jade-50) 0%, var(--bg-surface) 100%)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: "var(--jade-100)", color: "var(--jade-700)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="leaf" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>신규 약재 등록</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              현재 24종 등록 · 등록 후 입고와 처방 시스템에 즉시 반영됩니다
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* ── 기본 정보 ── */}
          <HRSection title="기본 정보" sub="처방·재고 화면에 노출되는 식별 정보" num="1">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="약재명 (한글) *" value={name} onChange={setName} placeholder="예: 황기" />
              <Input label="학명 (라틴어)" value={latin} onChange={setLatin} placeholder="예: Astragalus membranaceus" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <HRField label="효능 분류 *">
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {cats.map(c => (
                    <button key={c.key} onClick={() => setCategory(c.key)}
                      style={{
                        fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 10px",
                        border: `1px solid ${category === c.key ? "var(--jade-500)" : "var(--border-default)"}`,
                        background: category === c.key ? "var(--jade-50)" : "var(--bg-surface)",
                        color: category === c.key ? "var(--jade-700)" : "var(--text-secondary)",
                        borderRadius: "var(--radius-full)", cursor: "pointer",
                        fontWeight: category === c.key ? 600 : 400,
                      }}>{c.label}</button>
                  ))}
                </div>
              </HRField>
              <Input label="원산지" value={origin} onChange={setOrigin} placeholder="예: 국산 / 중국산 / 수입" />
            </div>
          </HRSection>

          {/* ── 재고 / 운영 ── */}
          <HRSection title="재고 · 운영 기준" sub="입고와 자동 발주 추천에 사용됩니다" num="2">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Input label="초기 재고 (g)" value={initStock} onChange={setInit} placeholder="0" type="number" />
              <Input label="안전 임계치 (g) *" value={threshold} onChange={setThr} placeholder="예: 1500" type="number" hint="이 값 미만이면 재고 부족 알림" />
              <Input label="월 예상 소비 (g)" value={monthly} onChange={setMonthly} placeholder="예: 1200" type="number" hint="잔여 일수 계산에 사용" />
            </div>
          </HRSection>

          {/* ── 가격 / 공급 ── */}
          <HRSection title="가격 · 공급처" sub="발주·청구·재고가치 계산에 사용됩니다" num="3">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="단가 (원 / g) *" value={unitPrice} onChange={setUP} placeholder="예: 85" type="number" />
              <Input label="주 공급처" value={supplier} onChange={setSupplier} placeholder="예: 동방한약" />
            </div>
            {stockNum > 0 && upNum > 0 && (
              <div style={{
                marginTop: 12, padding: "10px 14px", background: "var(--jade-50)",
                border: "1px solid var(--jade-200)", borderRadius: "var(--radius-md)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>초기 재고가치</span>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--jade-800)" }}>{won(initValue)}</span>
              </div>
            )}
          </HRSection>

          {/* ── 보관 / 유통 ── */}
          <HRSection title="보관 · 유통" sub="유효기간 임박 알림과 위치 식별" num="4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <HRField label="보관 조건">
                <div style={{ display: "flex", gap: 6 }}>
                  {["상온", "냉장", "냉동", "차광"].map(s => (
                    <button key={s} onClick={() => setStorage(s)}
                      style={{
                        flex: 1, fontFamily: "var(--font-sans)", fontSize: 12, padding: "7px 0",
                        border: `1px solid ${storage === s ? "var(--jade-500)" : "var(--border-default)"}`,
                        background: storage === s ? "var(--jade-50)" : "var(--bg-surface)",
                        color: storage === s ? "var(--jade-700)" : "var(--text-secondary)",
                        borderRadius: "var(--radius-md)", cursor: "pointer",
                        fontWeight: storage === s ? 600 : 400,
                      }}>{s}</button>
                  ))}
                </div>
              </HRField>
              <Input label="보관 위치" value={location} onChange={setLoc} placeholder="예: 캐비닛 A-3" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <Input label="최초 입고일" value={lastIn} onChange={setLastIn} placeholder="YYYY-MM-DD" />
              <Input label="유효기간" value={expiry} onChange={setExpiry} placeholder="YYYY-MM-DD" />
            </div>
          </HRSection>

          {/* ── 메모 ── */}
          <HRSection title="메모 (선택)" sub="처방 시 참고 사항" num="5">
            <textarea value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="예: 임산부 금기 · 8g 이상 과량 주의"
              style={{
                width: "100%", minHeight: 64, padding: "9px 11px",
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
              }} />
          </HRSection>
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

function HRSection({ title, sub, num, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "var(--radius-full)",
          background: "var(--jade-100)", color: "var(--jade-700)",
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

function HRField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</label>
      {children}
    </div>
  );
}

Object.assign(window, { HerbRegistrationModal });
