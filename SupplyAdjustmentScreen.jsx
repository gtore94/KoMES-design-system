// KoMES — 소모품 재고 조정 (실사 모드) 화면

const { useState: useStSA, useMemo: useMemoSA } = React;

const SUP_ADJ_REASONS = [
  { key: "count",   label: "실사 보정",     hint: "정기 재고 실사로 발견된 차이" },
  { key: "damage",  label: "파손/오염",     hint: "보관 중 파손 또는 변색" },
  { key: "expire",  label: "유효기간 폐기", hint: "유효기간 경과 폐기" },
  { key: "open",    label: "개봉 분배",     hint: "단위 분할로 인한 보정" },
  { key: "loss",    label: "분실",          hint: "도난 또는 식별 불가" },
  { key: "return",  label: "공급처 반품",   hint: "품질 이상으로 반품" },
  { key: "other",   label: "기타",          hint: "직접 메모 필요" },
];

function SupplyAdjustmentScreen({ onClose, onSubmit }) {
  const [edits, setEdits]         = useStSA({});
  const [category, setCategory]   = useStSA("all");
  const [filter, setFilter]       = useStSA("all");
  const [search, setSearch]       = useStSA("");
  const [confirmOpen, setConfirm] = useStSA(false);

  const rows = useMemoSA(() => {
    let out = SUPPLIES.slice();
    if (category !== "all") out = out.filter(s => s.category === category);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(s => s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q));
    }
    if (filter === "edited") out = out.filter(s => edits[s.id]?.counted !== undefined && edits[s.id]?.counted !== "");
    if (filter === "diff")   out = out.filter(s => {
      const c = edits[s.id]?.counted;
      return c !== undefined && c !== "" && Number(c) !== s.stock;
    });
    if (filter === "empty")  out = out.filter(s => edits[s.id]?.counted === undefined || edits[s.id]?.counted === "");
    return out;
  }, [category, search, filter, edits]);

  const summary = useMemoSA(() => {
    let counted = 0, items = 0, valueDelta = 0, diffPlus = 0, diffMinus = 0;
    Object.keys(edits).forEach(id => {
      const e = edits[id];
      const s = SUPPLIES.find(x => x.id === id);
      if (!s || e.counted === "" || e.counted === undefined) return;
      counted++;
      const c = Number(e.counted);
      const d = c - s.stock;
      if (d > 0) diffPlus++; else if (d < 0) diffMinus++;
      if (d !== 0) items++;
      valueDelta += d * s.unitPrice;
    });
    return { counted, items, valueDelta, diffPlus, diffMinus, total: SUPPLIES.length };
  }, [edits]);

  const setEdit = (id, patch) =>
    setEdits(e => ({ ...e, [id]: { counted: "", reason: "count", memo: "", ...e[id], ...patch } }));
  const fillSystem = (s) => setEdit(s.id, { counted: s.stock });
  const clearRow = (id) =>
    setEdits(e => { const next = { ...e }; delete next[id]; return next; });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <div style={{
        background: "linear-gradient(90deg, var(--jade-800) 0%, var(--jade-700) 100%)",
        color: "white", padding: "10px 24px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 2px 4px rgba(17,30,28,0.1)",
      }}>
        <Icon name="clipboard-check" size={16} style={{ color: "var(--stone-300)" }} />
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>재고 실사 모드</div>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }}></div>
        <div style={{ fontSize: 11, color: "var(--stone-300)" }}>소모품 · 의료·포장재·사무·청소 품목의 실사를 진행합니다</div>
        <div style={{ flex: 1 }}></div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--stone-300)" }}>
          담당 김민준 · 2026-05-16 14:32
        </div>
      </div>

      <TopBar
        title="소모품 재고 조정"
        subtitle={`실측 ${summary.counted} / ${summary.total}품목 · 차이 발생 ${summary.items}건`}
        actions={<>
          <Button variant="ghost" size="sm" icon="x" onClick={onClose}>취소</Button>
          <Button variant="secondary" size="sm" icon="save" onClick={() => onSubmit && onSubmit({ draft: true, edits })}>임시 저장</Button>
          <Button variant="primary" size="sm" icon="check-check"
            onClick={() => setConfirm(true)}
            disabled={summary.counted === 0}>조정 확정 ({summary.items})</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Stats */}
          <div style={{ padding: "12px 24px 0", display: "flex", gap: 10 }}>
            <SAStatCard icon="boxes" label="실사 진행률" value={`${summary.counted}/${summary.total}`} sub={`${Math.round(summary.counted / summary.total * 100)}% 완료`} />
            <SAStatCard icon="trending-up" label="증가 품목" value={`${summary.diffPlus}건`} sub="실측 > 시스템" tone="success" />
            <SAStatCard icon="trending-down" label="감소 품목" value={`${summary.diffMinus}건`} sub="실측 < 시스템" tone="danger" />
            <SAStatCard icon="banknote" label="가치 변동" value={(summary.valueDelta >= 0 ? "+" : "") + won(summary.valueDelta)} sub={`${summary.items}품목 차이`} tone={summary.valueDelta < 0 ? "danger" : summary.valueDelta > 0 ? "success" : "neutral"} />
          </div>

          {/* Category quick filter */}
          <div style={{ padding: "16px 24px 8px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, background: "var(--bg-raised)", padding: 3, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              {[
                { key: "all",    label: "전체",    count: SUPPLIES.length },
                { key: "empty",  label: "미실사",  count: SUPPLIES.length - summary.counted },
                { key: "edited", label: "실사 완료", count: summary.counted },
                { key: "diff",   label: "차이 발생", count: summary.items },
              ].map(t => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  style={{
                    padding: "5px 12px", fontFamily: "var(--font-sans)", fontSize: 12,
                    border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                    background: filter === t.key ? "var(--bg-surface)" : "transparent",
                    color: filter === t.key ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: filter === t.key ? 600 : 400,
                    boxShadow: filter === t.key ? "var(--shadow-sm)" : "none",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                  {t.label}
                  <span style={{
                    fontSize: 10, fontFamily: "var(--font-mono)",
                    background: filter === t.key ? (t.key === "diff" ? "var(--status-danger-bg)" : "var(--brand-muted)") : "var(--bg-raised)",
                    color: filter === t.key ? (t.key === "diff" ? "var(--status-danger-text)" : "var(--text-brand)") : "var(--text-muted)",
                    padding: "0 6px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                  }}>{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <div style={{ width: 220 }}>
              <Input value={search} onChange={setSearch} placeholder="품명 / SKU" icon="search" />
            </div>
          </div>

          {/* Category chips */}
          <div style={{ padding: "0 24px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SUP_CATEGORIES.map(c => {
              const sel = category === c.key;
              const tone = c.key === "all" ? null : SUP_CAT_COLOR[c.label];
              return (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 12px",
                    border: `1px solid ${sel ? (tone?.fg || "var(--text-secondary)") : "var(--border-default)"}`,
                    background: sel ? (tone?.bg || "var(--bg-raised)") : "var(--bg-surface)",
                    color: sel ? (tone?.fg || "var(--text-primary)") : "var(--text-secondary)",
                    borderRadius: "var(--radius-full)", whiteSpace: "nowrap", cursor: "pointer",
                    fontWeight: sel ? 600 : 400,
                  }}>
                  {c.key === "all" ? "분류 전체" : c.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-raised)" }}>
                    <th style={hdrLs}>품목</th>
                    <th style={hdrLs}>위치</th>
                    <th style={hdrRs}>시스템 재고</th>
                    <th style={{ ...hdrCs, width: 200 }}>실측 수량</th>
                    <th style={hdrRs}>차이</th>
                    <th style={hdrLs}>조정 사유</th>
                    <th style={hdrLs}>메모</th>
                    <th style={{ ...hdrCs, width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(s => {
                    const e = edits[s.id];
                    const counted = e?.counted;
                    const hasCount = counted !== undefined && counted !== "";
                    const diff = hasCount ? Number(counted) - s.stock : 0;
                    const diffPct = hasCount && s.stock > 0 ? (diff / s.stock) * 100 : 0;
                    const reason = e?.reason || "count";
                    const memo = e?.memo || "";
                    const cat = SUP_CAT_COLOR[s.category] || SUP_CAT_COLOR["사무"];

                    const tone = !hasCount ? "muted" :
                      diff === 0 ? "match" :
                      Math.abs(diffPct) > 20 ? "alert" : "diff";

                    return (
                      <tr key={s.id} style={{
                        borderTop: "1px solid var(--border-subtle)",
                        background: tone === "match" ? "var(--brand-subtle)" :
                                    tone === "alert" ? "var(--status-danger-bg)" :
                                    tone === "diff"  ? "var(--status-warning-bg)" : "transparent",
                      }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 1 }}>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.sku}</span>
                            <span style={{ fontSize: 10, background: cat.bg, color: cat.fg, padding: "0 6px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", border: `1px solid ${cat.border}` }}>{s.category}</span>
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.pack}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.location}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{supFmt(s.stock, s.unit)}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{won(s.stock * s.unitPrice)}</div>
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input type="number" value={counted ?? ""} placeholder="—"
                              onChange={ev => setEdit(s.id, { counted: ev.target.value })}
                              style={{
                                width: 110, padding: "7px 10px", textAlign: "right",
                                fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                                color: tone === "alert" ? "var(--status-danger-text)" :
                                       tone === "diff"  ? "var(--status-warning-text)" :
                                       tone === "match" ? "var(--text-brand)" : "var(--text-primary)",
                                background: "var(--bg-surface)",
                                border: `1px solid ${
                                  tone === "alert" ? "var(--cinnabar-400)" :
                                  tone === "diff"  ? "var(--amber-400)" :
                                  tone === "match" ? "var(--jade-300)" : "var(--border-default)"}`,
                                borderRadius: "var(--radius-md)", outline: "none",
                              }} />
                            <button onClick={() => fillSystem(s)} title="시스템 재고와 동일"
                              style={{
                                padding: "6px 7px", border: "1px solid var(--border-default)",
                                background: "var(--bg-surface)", borderRadius: "var(--radius-sm)",
                                cursor: "pointer", color: "var(--text-muted)",
                                display: "inline-flex", alignItems: "center",
                              }}>
                              <Icon name="equal" size={12} />
                            </button>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: 24 }}>{s.unit}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          {hasCount ? (
                            <>
                              <div style={{
                                fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600,
                                color: diff > 0 ? "var(--text-brand)" :
                                       diff < 0 ? "var(--status-danger-text)" : "var(--text-muted)",
                              }}>
                                {diff > 0 ? "+" : ""}{diff} {s.unit}
                              </div>
                              {diff !== 0 && (
                                <div style={{
                                  fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 1,
                                  color: Math.abs(diffPct) > 20 ? "var(--status-danger-text)" : "var(--text-muted)",
                                }}>
                                  {diffPct > 0 ? "+" : ""}{diffPct.toFixed(1)}%
                                </div>
                              )}
                            </>
                          ) : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>대기</span>}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <select value={reason} disabled={!hasCount || diff === 0}
                            onChange={ev => setEdit(s.id, { reason: ev.target.value })}
                            style={{
                              fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
                              background: !hasCount || diff === 0 ? "var(--bg-raised)" : "var(--bg-surface)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "var(--radius-md)", padding: "6px 24px 6px 8px",
                              outline: "none", appearance: "none",
                              cursor: hasCount && diff !== 0 ? "pointer" : "not-allowed",
                              opacity: !hasCount || diff === 0 ? 0.5 : 1, width: 120,
                              backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'><path fill='%238A9E9A' d='M0 0l4 5 4-5z'/></svg>\")",
                              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                            }}>
                            {SUP_ADJ_REASONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <input value={memo} disabled={!hasCount}
                            onChange={ev => setEdit(s.id, { memo: ev.target.value })}
                            placeholder={hasCount ? (reason === "other" ? "사유 입력" : "선택") : "—"}
                            style={{
                              width: "100%", padding: "7px 10px",
                              fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
                              background: !hasCount ? "var(--bg-raised)" : "var(--bg-surface)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "var(--radius-md)", outline: "none",
                              opacity: !hasCount ? 0.5 : 1, minWidth: 110,
                            }} />
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "center" }}>
                          {hasCount && (
                            <button onClick={() => clearRow(s.id)} title="실측값 삭제"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                              <Icon name="rotate-ccw" size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  조건에 맞는 품목이 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        <SAReviewPanel summary={summary} edits={edits} />
      </div>

      {confirmOpen && (
        <SAConfirmModal
          summary={summary} edits={edits}
          onClose={() => setConfirm(false)}
          onConfirm={() => { setConfirm(false); onSubmit && onSubmit({ draft: false, edits, summary }); }}
        />
      )}
    </div>
  );
}

const hdrBaseS = {
  padding: "10px 14px", fontSize: 10, fontWeight: 700,
  color: "var(--text-muted)", letterSpacing: "0.06em",
  textTransform: "uppercase", whiteSpace: "nowrap",
};
const hdrLs = { ...hdrBaseS, textAlign: "left" };
const hdrRs = { ...hdrBaseS, textAlign: "right" };
const hdrCs = { ...hdrBaseS, textAlign: "center" };

function SAStatCard({ icon, label, value, sub, tone = "neutral" }) {
  const tones = {
    neutral: { fg: "var(--text-primary)",  bg: "var(--bg-raised)",  iconFg: "var(--text-secondary)" },
    success: { fg: "var(--text-brand)",      bg: "var(--brand-subtle)",    iconFg: "var(--text-brand)" },
    danger:  { fg: "var(--status-danger-text)",  bg: "var(--status-danger-bg)", iconFg: "var(--status-danger-text)" },
  };
  const t = tones[tone];
  return (
    <div style={{
      flex: 1, background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
      padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--radius-md)",
        background: t.bg, color: t.iconFg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: t.fg, fontFamily: "var(--font-mono)", marginTop: 2, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

function SAReviewPanel({ summary, edits }) {
  const changes = Object.keys(edits)
    .map(id => {
      const s = SUPPLIES.find(x => x.id === id);
      const e = edits[id];
      if (!s || e.counted === "" || e.counted === undefined) return null;
      const diff = Number(e.counted) - s.stock;
      if (diff === 0) return null;
      return { s, diff, reason: e.reason };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.diff * b.s.unitPrice) - Math.abs(a.diff * a.s.unitPrice));

  return (
    <div style={{
      width: 300, background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border-subtle)", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 16, flexShrink: 0, overflowY: "auto",
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>실사 진행</div>
        <div style={{ position: "relative", height: 8, background: "var(--bg-raised)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: 0,
            width: `${(summary.counted / summary.total) * 100}%`,
            background: "var(--jade-500)", transition: "width 0.2s ease",
          }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--text-secondary)" }}>{summary.counted} / {summary.total}품목</span>
          <span style={{ color: "var(--text-muted)" }}>{Math.round(summary.counted / summary.total * 100)}%</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
          가장 큰 차이 ({changes.length}건)
        </div>
        {changes.length === 0 ? (
          <div style={{
            padding: "20px 12px", textAlign: "center", color: "var(--text-muted)",
            fontSize: 12, background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
            border: "1px dashed var(--border-subtle)",
          }}>
            아직 차이가 발생한<br/>품목이 없습니다
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {changes.slice(0, 8).map(({ s, diff, reason }) => {
              const r = SUP_ADJ_REASONS.find(x => x.key === reason);
              const valueDelta = diff * s.unitPrice;
              return (
                <div key={s.id} style={{
                  padding: "8px 10px", border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)", background: "var(--bg-raised)",
                  display: "flex", flexDirection: "column", gap: 2,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{
                      fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600,
                      color: diff > 0 ? "var(--text-brand)" : "var(--status-danger-text)", flexShrink: 0,
                    }}>
                      {diff > 0 ? "+" : ""}{diff} {s.unit}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>{r?.label}</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{valueDelta > 0 ? "+" : ""}{won(valueDelta)}</span>
                  </div>
                </div>
              );
            })}
            {changes.length > 8 && (
              <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", padding: "4px 0", fontFamily: "var(--font-mono)" }}>
                + {changes.length - 8}건 더
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        marginTop: "auto", padding: "12px 14px", background: "var(--brand-subtle)",
        border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>총 가치 변동</span>
          <span style={{
            fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)",
            color: summary.valueDelta < 0 ? "var(--status-danger-text)" : summary.valueDelta > 0 ? "var(--text-brand)" : "var(--text-primary)",
          }}>
            {summary.valueDelta > 0 ? "+" : ""}{won(summary.valueDelta)}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>
          조정 확정 시 모든 차이는 재고 이력에 사유와 함께 기록됩니다.
        </div>
      </div>
    </div>
  );
}

function SAConfirmModal({ summary, edits, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)", backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: 460, padding: "24px 26px", boxShadow: "var(--shadow-xl)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
            background: "var(--brand-muted)", color: "var(--text-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="check-check" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}>재고 조정 확정</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>아래 내용으로 시스템 재고를 보정합니다</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <SACfRow label="실사 완료" value={`${summary.counted}품목 / 전체 ${summary.total}품목`} />
          <SACfRow label="차이 발생" value={`${summary.items}품목`} />
          <SACfRow label="증가 / 감소" value={`+${summary.diffPlus} / −${summary.diffMinus}`} />
          <SACfRow label="가치 변동" value={`${summary.valueDelta > 0 ? "+" : ""}${won(summary.valueDelta)}`}
                   accent={summary.valueDelta < 0 ? "var(--status-danger-text)" : "var(--text-brand)"} bold />
        </div>

        <div style={{
          marginTop: 14, padding: "10px 12px", background: "var(--status-warning-bg)",
          border: "1px solid var(--status-warning-border)", borderRadius: "var(--radius-md)",
          fontSize: 11, color: "var(--status-warning-text)", display: "flex", gap: 8,
        }}>
          <Icon name="alert-triangle" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>확정 후에는 개별 항목별 사유만 수정 가능하며 전체 취소는 불가능합니다.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check-check" onClick={onConfirm}>조정 확정</Button>
        </div>
      </div>
    </div>
  );
}

function SACfRow({ label, value, accent, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "var(--bg-surface)" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{
        fontSize: bold ? 14 : 12, fontFamily: "var(--font-mono)",
        color: accent || "var(--text-primary)", fontWeight: bold ? 600 : 400,
      }}>{value}</span>
    </div>
  );
}

Object.assign(window, { SupplyAdjustmentScreen });
