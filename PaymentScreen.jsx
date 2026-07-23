// KoMES — 수납 (Payment / Billing)
// Patient queue → charge breakdown → payment methods
const { useState: useStatePay, useEffect: useEffectPay, useMemo: useMemoPay } = React;

// ── Mock waiting queue ─────────────────────────────────────────
const PAYMENT_QUEUE_SEED = [
  {
    id: "p1", chartNo: "C-00231", name: "이재현", gender: "남", age: 34, dob: "1991-12-26",
    insurance: "건보", visit: "재진", visitTime: "16:42", chargeTime: "17:55",
    doctor: "김민준", department: "한방내과",
    status: "대기", // 대기 / 완료
    diagnoses: [
      { code: "M54.5", label: "요통" },
      { code: "M62.6", label: "근육 긴장" },
    ],
    items: [
      { kind: "진찰", label: "한의 외래 재진 진찰료", amount: 11500, copay: 0.30 },
      { kind: "시술", label: "침술 (단순)", amount: 6300, copay: 0.30 },
      { kind: "시술", label: "온냉경락요법", amount: 5200, copay: 0.30 },
    ],
    discountType: "none", discountValue: 0,
    note: "",
  },
  {
    id: "p2", chartNo: "C-00187", name: "오세훈", gender: "남", age: 46, dob: "1979-06-20",
    insurance: "건보", visit: "재진", visitTime: "15:10", chargeTime: "16:20",
    doctor: "이지영", department: "한방내과",
    status: "완료", paidAt: "16:38", paidBy: "카드",
    diagnoses: [{ code: "M75.0", label: "유착성 견관절낭염" }],
    items: [
      { kind: "진찰", label: "한의 외래 재진 진찰료", amount: 11500, copay: 0.30 },
      { kind: "시술", label: "추나요법-단순추나", amount: 32000, copay: 0.30 },
    ],
    discountType: "none", discountValue: 0,
    note: "",
  },
  {
    id: "p3", chartNo: "C-00099", name: "정유미", gender: "여", age: 30, dob: "1995-03-18",
    insurance: "건보", visit: "초진", visitTime: "14:00", chargeTime: "15:11",
    doctor: "김민준", department: "한방내과",
    status: "완료", paidAt: "15:24", paidBy: "현금",
    diagnoses: [{ code: "N94.6", label: "월경통" }],
    items: [
      { kind: "진찰", label: "한의 외래 초진 진찰료", amount: 17400, copay: 0.30 },
      { kind: "시술", label: "약침술", amount: 18000, copay: 0.30 },
      { kind: "한약", label: "탕전 1제 (10일분)", amount: 165000, copay: 0 },
    ],
    discountType: "none", discountValue: 0,
    note: "",
  },
];

const PayKRW = (n) => `${Math.round(n).toLocaleString("ko-KR")}원`;

function calcAmounts(p) {
  const total = p.items.reduce((s, it) => s + it.amount, 0);
  const insuranceCovered = p.items.reduce((s, it) => s + it.amount * (1 - it.copay), 0);
  const subjectToCopay = p.items.reduce((s, it) => s + it.amount * it.copay, 0);
  let discount = 0;
  if (p.discountType === "percent") discount = subjectToCopay * (p.discountValue / 100);
  else if (p.discountType === "fixed") discount = p.discountValue;
  const net = Math.max(0, subjectToCopay - discount);
  return { total, insuranceCovered, copay: subjectToCopay, discount, net };
}

// ── Patient row (queue) ────────────────────────────────────────
function QueueRow({ p, selected, onSelect }) {
  const a = calcAmounts(p);
  const isPending = p.status === "대기";
  return (
    <div onClick={() => onSelect(p.id)} style={{
      padding: "12px 14px",
      borderBottom: "1px solid var(--border-subtle)",
      borderLeft: `3px solid ${selected ? "var(--jade-500)" : "transparent"}`,
      background: selected ? "var(--brand-subtle)" : "transparent",
      cursor: "pointer",
      transition: "all 0.12s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
          {p.name}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 600, padding: "1px 7px",
          borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
          color: p.visit === "초진" ? "var(--status-danger-text)" : "var(--text-brand)",
          background: p.visit === "초진" ? "var(--status-danger-bg)" : "var(--brand-subtle)",
          border: `1px solid ${p.visit === "초진" ? "var(--status-danger-border)" : "var(--brand-muted)"}`,
          fontFamily: "var(--font-sans)",
        }}>{p.visit}</span>
        <span style={{
          marginLeft: "auto",
          fontSize: 13, fontWeight: 700,
          color: isPending ? "var(--status-danger-text)" : "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          textDecoration: isPending ? "none" : "line-through",
        }}>
          {PayKRW(a.net)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {p.chartNo}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {p.gender}/{p.age}세
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", color: isPending ? "var(--status-warning-text)" : "var(--text-brand)" }}>
          {isPending ? `대기 ${p.chargeTime}` : `완료 ${p.paidAt} · ${p.paidBy}`}
        </span>
      </div>
    </div>
  );
}

// ── Big payment method button ──────────────────────────────────
function PayMethodBtn({ icon, label, hint, primary, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px",
      background: primary ? "var(--jade-500)" : "var(--bg-surface)",
      border: `1px solid ${primary ? "var(--jade-500)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      width: "100%",
      transition: "all 0.12s",
      fontFamily: "var(--font-sans)",
      boxShadow: primary ? "var(--shadow-sm)" : "none",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--radius-md)",
        background: primary ? "var(--overlay-white-20)" : "var(--brand-subtle)",
        color: primary ? "var(--text-on-brand)" : "var(--text-brand)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={18} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: primary ? "var(--text-on-brand)" : "var(--text-primary)" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: 11, color: primary ? "var(--overlay-white-80)" : "var(--text-muted)", marginTop: 2 }}>
            {hint}
          </div>
        )}
      </div>
      <Icon name="chevron-right" size={16} style={{ color: primary ? "var(--text-on-brand)" : "var(--text-muted)" }} />
    </button>
  );
}

// ── Main Payment Screen ────────────────────────────────────────
function PaymentScreen() {
  const [list, setList] = useStatePay(() => {
    try {
      const saved = localStorage.getItem("komes_payments_v1");
      return saved ? JSON.parse(saved) : PAYMENT_QUEUE_SEED;
    } catch { return PAYMENT_QUEUE_SEED; }
  });
  useEffectPay(() => { localStorage.setItem("komes_payments_v1", JSON.stringify(list)); }, [list]);

  const [tab, setTab] = useStatePay("대기"); // 대기 / 완료
  const [selectedId, setSelectedId] = useStatePay(() => list.find(p => p.status === "대기")?.id || list[0]?.id);
  const [confirmMethod, setConfirmMethod] = useStatePay(null);

  const tabList = list.filter(p => p.status === tab);
  const selected = list.find(p => p.id === selectedId);

  const update = (id, patch) => setList(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  // Stats
  const pendingCount = list.filter(p => p.status === "대기").length;
  const pendingTotal = list.filter(p => p.status === "대기").reduce((s, p) => s + calcAmounts(p).net, 0);
  const doneCount = list.filter(p => p.status === "완료").length;
  const doneTotal = list.filter(p => p.status === "완료").reduce((s, p) => s + calcAmounts(p).net, 0);

  // Reset
  const reset = () => setList(PAYMENT_QUEUE_SEED);

  const handlePay = (method) => {
    if (!selected) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    update(selected.id, { status: "완료", paidAt: `${hh}:${mm}`, paidBy: method });
    setConfirmMethod(null);
    // Move to next pending
    const next = list.find(p => p.id !== selected.id && p.status === "대기");
    if (next) setSelectedId(next.id);
  };

  const setDiscount = (type, value) => {
    if (!selected) return;
    update(selected.id, { discountType: type, discountValue: value });
  };

  const amounts = selected ? calcAmounts(selected) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="수납"
        subtitle="진료 완료 환자의 본인 부담금 수납 및 결제 처리"
        actions={<>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px",
            background: "var(--status-warning-bg)", border: "1px solid var(--status-warning-border)",
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
          }}>
            <Icon name="clock" size={13} style={{ color: "var(--status-warning-text)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--status-warning-text)", fontFamily: "var(--font-sans)" }}>
              대기 {pendingCount}건
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--status-warning-text)", fontFamily: "var(--font-mono)" }}>
              {PayKRW(pendingTotal)}
            </span>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px",
            background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)",
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
          }}>
            <Icon name="check-circle-2" size={13} style={{ color: "var(--text-brand)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
              완료 {doneCount}건
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>
              {PayKRW(doneTotal)}
            </span>
          </div>
          <button onClick={reset} title="시드 초기화" style={{
            width: 30, height: 30, borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            cursor: "pointer", color: "var(--text-muted)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="rotate-ccw" size={14} />
          </button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Queue panel */}
        <div style={{
          width: 320, flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", minHeight: 0,
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
            {[
              { k: "대기", l: "수납 대기", n: pendingCount, color: "var(--amber-600)" },
              { k: "완료", l: "수납 완료", n: doneCount,    color: "var(--jade-600)" },
            ].map(t => {
              const active = tab === t.k;
              return (
                <button key={t.k} onClick={() => {
                  setTab(t.k);
                  const first = list.find(p => p.status === t.k);
                  if (first) setSelectedId(first.id);
                }} style={{
                  flex: 1, padding: "12px 8px",
                  background: "transparent", border: "none",
                  borderBottom: active ? `2px solid ${t.color}` : "2px solid transparent",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  color: active ? t.color : "var(--text-muted)",
                  fontWeight: active ? 600 : 500, fontSize: 13,
                }}>
                  {t.l}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "1px 7px",
                    borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                    background: active ? t.color : "var(--bg-raised)",
                    color: active ? "var(--text-on-brand)" : "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}>{t.n}</span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tabList.length === 0 ? (
              <div style={{
                padding: "40px 20px", textAlign: "center",
                color: "var(--text-muted)", fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}>
                <Icon name="inbox" size={28} style={{ color: "var(--stone-400)", marginBottom: 8 }} />
                <div>수납 {tab === "대기" ? "대기" : "완료"} 환자가 없습니다.</div>
              </div>
            ) : tabList.map(p => (
              <QueueRow key={p.id} p={p} selected={selectedId === p.id} onSelect={setSelectedId} />
            ))}
          </div>
        </div>

        {/* Center: charge breakdown */}
        <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {!selected ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              color: "var(--text-muted)",
            }}>
              <Icon name="credit-card" size={36} style={{ color: "var(--stone-400)" }} />
              <span style={{ fontSize: 13, fontFamily: "var(--font-sans)" }}>왼쪽에서 환자를 선택하세요</span>
            </div>
          ) : (
            <>
              {/* Patient header */}
              <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "var(--shadow-sm)",
              }}>
                <Avatar name={selected.name} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                      {selected.name}
                    </span>
                    <Badge variant="brand">{selected.insurance}</Badge>
                    <Badge variant={selected.visit === "초진" ? "danger" : "neutral"}>{selected.visit}</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{selected.chartNo}</span>
                    <span>·</span>
                    <span>{selected.gender}/{selected.age}세 · {selected.dob}</span>
                    <span>·</span>
                    <span>{selected.department} · {selected.doctor}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase" }}>진료 완료</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-secondary)" }}>{selected.visitTime}</div>
                </div>
              </div>

              {/* Diagnosis + Items */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <div style={panelStyle}>
                  <div style={panelHeader}>
                    <Icon name="clipboard-list" size={14} style={{ color: "var(--jade-600)" }} />
                    <span>진단 (상병)</span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.diagnoses.length === 0 ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>진단 정보 없음</span>
                    ) : selected.diagnoses.map(d => (
                      <span key={d.code} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", fontSize: 12,
                        background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)",
                        color: "var(--text-brand)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                        fontFamily: "var(--font-sans)",
                      }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{d.code}</span>
                        <span>{d.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={panelStyle}>
                  <div style={panelHeader}>
                    <Icon name="receipt" size={14} style={{ color: "var(--jade-600)" }} />
                    <span>시행 내역 (처치/시술)</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                      총 {selected.items.length}건
                    </span>
                  </div>
                  <div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "60px 1fr 90px 80px",
                      padding: "6px 16px", borderBottom: "1px solid var(--border-subtle)",
                      background: "var(--bg-raised)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-sans)",
                    }}>
                      <span>구분</span>
                      <span>항목</span>
                      <span style={{ textAlign: "right" }}>금액</span>
                      <span style={{ textAlign: "right" }}>본인부담</span>
                    </div>
                    {selected.items.map((it, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "60px 1fr 90px 80px",
                        padding: "10px 16px",
                        borderBottom: i < selected.items.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        alignItems: "center",
                      }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: it.kind === "한약" ? "var(--status-warning-bg)" : it.kind === "시술" ? "var(--brand-subtle)" : "var(--bg-raised)",
                          color: it.kind === "한약" ? "var(--status-warning-text)" : it.kind === "시술" ? "var(--text-brand)" : "var(--text-secondary)",
                          fontFamily: "var(--font-sans)",
                          width: "fit-content",
                        }}>{it.kind}</span>
                        <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{it.label}</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", textAlign: "right" }}>
                          {PayKRW(it.amount)}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500, textAlign: "right" }}>
                          {PayKRW(it.amount * it.copay)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div style={panelStyle}>
                <div style={panelHeader}>
                  <Icon name="edit-3" size={14} style={{ color: "var(--jade-600)" }} />
                  <span>수납 메모</span>
                </div>
                <div style={{ padding: 12 }}>
                  <textarea
                    value={selected.note}
                    onChange={e => update(selected.id, { note: e.target.value })}
                    placeholder="할인 사유, 특이사항 등을 기록하세요"
                    disabled={selected.status === "완료"}
                    style={{
                      width: "100%", minHeight: 56,
                      padding: "9px 11px", fontSize: 13,
                      fontFamily: "var(--font-sans)", color: "var(--text-primary)",
                      background: selected.status === "완료" ? "var(--bg-raised)" : "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: payment summary + actions */}
        {selected && (
          <div style={{
            width: 360, flexShrink: 0,
            background: "var(--bg-surface)",
            borderLeft: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column", minHeight: 0,
          }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Amounts */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  fontFamily: "var(--font-sans)", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Icon name="calculator" size={12} />
                  금액 명세
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <SumRow label="총 진료비" value={PayKRW(amounts.total)} />
                  <SumRow label="급여 부담금" value={`-${PayKRW(amounts.insuranceCovered)}`} muted />
                  <SumRow label="본인 부담금" value={PayKRW(amounts.copay)} bold />
                </div>
              </div>

              {/* Discount */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  fontFamily: "var(--font-sans)", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Icon name="percent" size={12} />
                  할인 적용
                </div>
                <div style={{
                  background: "var(--bg-raised)",
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-md)", padding: 10,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { k: "none", l: "없음" },
                      { k: "percent", l: "% 할인" },
                      { k: "fixed", l: "정액 할인" },
                    ].map(o => (
                      <button key={o.k} onClick={() => setDiscount(o.k, 0)}
                        disabled={selected.status === "완료"}
                        style={{
                          flex: 1, padding: "5px 8px", fontSize: 11, fontWeight: 600,
                          background: selected.discountType === o.k ? "var(--jade-500)" : "var(--bg-surface)",
                          color: selected.discountType === o.k ? "var(--text-on-brand)" : "var(--text-secondary)",
                          border: `1px solid ${selected.discountType === o.k ? "var(--jade-500)" : "var(--border-default)"}`,
                          borderRadius: "var(--radius-sm)",
                          cursor: selected.status === "완료" ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-sans)",
                          opacity: selected.status === "완료" ? 0.5 : 1,
                        }}>{o.l}</button>
                    ))}
                  </div>
                  {selected.discountType !== "none" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="number" min={0}
                        value={selected.discountValue || ""}
                        onChange={e => setDiscount(selected.discountType, parseFloat(e.target.value) || 0)}
                        disabled={selected.status === "완료"}
                        placeholder="0"
                        style={{
                          flex: 1, padding: "6px 10px", fontSize: 13,
                          fontFamily: "var(--font-mono)", textAlign: "right",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)", outline: "none",
                          background: selected.status === "완료" ? "var(--bg-raised)" : "var(--bg-surface)",
                        }}
                      />
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", minWidth: 24 }}>
                        {selected.discountType === "percent" ? "%" : "원"}
                      </span>
                    </div>
                  )}
                  {amounts.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px dashed var(--border-default)" }}>
                      <span style={{ fontSize: 12, color: "var(--status-danger-text)", fontFamily: "var(--font-sans)" }}>할인액</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--status-danger-text)", fontFamily: "var(--font-mono)" }}>
                        -{PayKRW(amounts.discount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Final amount */}
              <div style={{
                background: "var(--brand-subtle)",
                border: "1.5px solid var(--jade-300)",
                borderRadius: "var(--radius-lg)",
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
                    최종 수납액
                  </span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: "var(--text-brand)", fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                    {PayKRW(amounts.net)}
                  </span>
                </div>
                {selected.status === "완료" && (
                  <div style={{
                    marginTop: 8, fontSize: 11, color: "var(--text-brand)", fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Icon name="check-circle-2" size={12} />
                    {selected.paidAt}에 {selected.paidBy}로 수납 완료
                  </div>
                )}
              </div>

              {/* Pay methods (only if 대기) */}
              {selected.status === "대기" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Icon name="wallet" size={12} />
                    결제 수단
                  </div>
                  <PayMethodBtn icon="credit-card" label="카드 결제" hint="신용·체크카드 단말기 연동" primary onClick={() => setConfirmMethod("카드")} />
                  <PayMethodBtn icon="banknote" label="현금" hint="현금 영수증 발행 가능" onClick={() => setConfirmMethod("현금")} />
                  <PayMethodBtn icon="repeat" label="계좌 이체" hint="실시간 입금 확인" onClick={() => setConfirmMethod("이체")} />
                  <PayMethodBtn icon="layers" label="복합 결제" hint="카드 + 현금 분할 결제" onClick={() => setConfirmMethod("복합")} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={completedActionBtn}>
                    <Icon name="rotate-ccw" size={14} />수납 취소
                  </button>
                  <button style={{ ...completedActionBtn, background: "var(--jade-500)", color: "var(--text-on-brand)", border: "none" }}>
                    <Icon name="printer" size={14} />영수증 출력
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmMethod && selected && (
        <div onClick={() => setConfirmMethod(null)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "var(--bg-overlay)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 380, background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            boxShadow: "var(--shadow-xl)",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>
                {confirmMethod} 결제 확인
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
                아래 금액을 {confirmMethod}(으)로 수납 처리합니다.
              </div>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>환자</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{selected.name} ({selected.chartNo})</span>
              </div>
              <div style={{
                background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)",
                borderRadius: "var(--radius-md)", padding: "14px 16px",
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-brand)", fontWeight: 600 }}>수납 금액</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-brand)", fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}>
                  {PayKRW(amounts.net)}
                </span>
              </div>
              {confirmMethod === "현금" && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--jade-500)" }} />
                  현금영수증 발행 (소득공제용)
                </label>
              )}
            </div>
            <div style={{
              padding: 14, borderTop: "1px solid var(--border-subtle)",
              display: "flex", gap: 8, justifyContent: "flex-end",
            }}>
              <button onClick={() => setConfirmMethod(null)} style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500,
                background: "transparent", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>취소</button>
              <button onClick={() => handlePay(confirmMethod)} style={{
                padding: "8px 18px", fontSize: 13, fontWeight: 600,
                background: "var(--jade-500)", border: "none",
                borderRadius: "var(--radius-md)", color: "var(--text-on-brand)",
                cursor: "pointer", fontFamily: "var(--font-sans)",
                display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: "var(--shadow-sm)",
              }}>
                <Icon name="check" size={13} />
                {PayKRW(amounts.net)} 수납 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SumRow({ label, value, muted, bold }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 0",
      borderBottom: bold ? "1px solid var(--border-subtle)" : "none",
    }}>
      <span style={{
        fontSize: bold ? 13 : 12,
        fontWeight: bold ? 600 : 400,
        color: muted ? "var(--text-muted)" : "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
      }}>{label}</span>
      <span style={{
        fontSize: bold ? 14 : 13,
        fontWeight: bold ? 700 : 500,
        color: muted ? "var(--text-muted)" : "var(--text-primary)",
        fontFamily: "var(--font-mono)",
      }}>{value}</span>
    </div>
  );
}

const panelStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  boxShadow: "var(--shadow-sm)",
};
const panelHeader = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 16px",
  borderBottom: "1px solid var(--border-subtle)",
  fontSize: 13, fontWeight: 600,
  color: "var(--text-primary)", fontFamily: "var(--font-sans)",
  background: "var(--bg-raised)",
};
const completedActionBtn = {
  width: "100%", padding: "10px 14px", fontSize: 13, fontWeight: 500,
  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
};

Object.assign(window, { PaymentScreen });
