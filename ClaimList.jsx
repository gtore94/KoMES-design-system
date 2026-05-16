// KoMES — 명세서 리스트 & 액션 (Center + Right combined)

const { useState: useStLst, useMemo: useMmLst } = React;

// ── Filter Bar ─────────────────────────────────────────────────
function FilterBar({ search, setSearch, kindFilter, setKindFilter,
  errorOnly, setErrorOnly, density, setDensity,
  selected, onRemoveSelected, kindOptions }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)", flexShrink: 0,
    }}>
      <div style={{ position: "relative", width: 200 }}>
        <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <Icon name="search" size={13} />
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="환자명·차트번호로 검색" style={{
            width: "100%", padding: "7px 10px 7px 28px", fontSize: 12,
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", background: "var(--bg-surface)",
            outline: "none", fontFamily: "var(--font-sans)",
          }} />
      </div>
      <select value={kindFilter} onChange={e => setKindFilter(e.target.value)} style={{
        padding: "7px 24px 7px 10px", fontSize: 12,
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", background: "var(--bg-surface)",
        outline: "none", fontFamily: "var(--font-sans)", color: "var(--text-primary)",
        cursor: "pointer", minWidth: 130,
      }}>
        <option value="">전체 종류</option>
        {kindOptions.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <button onClick={() => setErrorOnly(!errorOnly)} style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "7px 12px", fontSize: 12, fontWeight: 500,
        background: errorOnly ? "var(--cinnabar-100)" : "var(--bg-surface)",
        color: errorOnly ? "var(--cinnabar-700)" : "var(--text-secondary)",
        border: `1px solid ${errorOnly ? "var(--cinnabar-300)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        cursor: "pointer", fontFamily: "var(--font-sans)",
      }}>
        <Icon name="alert-triangle" size={12} />
        오류만 보기
      </button>

      <div style={{ flex: 1 }}></div>

      {selected > 0 && (
        <button onClick={onRemoveSelected} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "7px 12px", fontSize: 12, fontWeight: 500,
          background: "var(--bg-surface)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>
          <Icon name="x-circle" size={12} />
          선택 항목 제외 ({selected})
        </button>
      )}

      <div style={{
        display: "inline-flex", padding: 2,
        background: "var(--stone-100)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
      }}>
        {[
          { k: "comfortable", icon: "rows-3" },
          { k: "compact", icon: "menu" },
        ].map(d => (
          <button key={d.k} onClick={() => setDensity(d.k)} style={{
            padding: "4px 8px",
            background: density === d.k ? "var(--bg-surface)" : "transparent",
            border: "none", borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: density === d.k ? "var(--jade-700)" : "var(--text-muted)",
            display: "inline-flex", alignItems: "center",
            boxShadow: density === d.k ? "var(--shadow-sm)" : "none",
            transition: "all 0.12s",
          }}>
            <Icon name={d.icon} size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Claims Table ────────────────────────────────────────────────
function ClaimsTable({ type, items, selected, setSelected, excluded, setExcluded, density }) {
  const allSelectable = items.filter(it => !excluded.has(it.id)).map(it => it.id);
  const allSelected = allSelectable.length > 0 && allSelectable.every(id => selected.has(id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allSelectable));
  };
  const toggleOne = (id) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };
  const toggleExclude = (id) => {
    const n = new Set(excluded);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setExcluded(n);
    // also remove from selected
    const s = new Set(selected); s.delete(id); setSelected(s);
  };

  // columns differ per type
  let cols, header;
  if (type === "health") {
    cols = "32px 80px 88px 80px 96px 70px 50px 48px 100px 90px 64px 56px";
    header = ["", "명세서", "진료일", "환자명", "주민번호", "진료의", "종류", "내원", "건보청구액", "본인부담금", "급여총액", "제외"];
  } else if (type === "herbal") {
    cols = "32px 80px 88px 80px 96px 70px 80px 60px 110px 90px 56px";
    header = ["", "명세서", "진료일", "환자명", "주민번호", "진료의", "처방", "일수", "약재비", "진찰료", "제외"];
  } else {
    cols = "32px 80px 88px 80px 96px 70px 110px 110px 100px 56px";
    header = ["", "청구서", "진료일", "환자명", "주민번호", "진료의", "보험사", "사고번호", "청구액", "제외"];
  }

  const rowHeight = density === "compact" ? 34 : 42;
  const cellPad = density === "compact" ? "6px 10px" : "10px 10px";

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--bg-surface)" }}>
      <div style={{ minWidth: 900 }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: cols,
          padding: "8px 10px", position: "sticky", top: 0,
          background: "var(--stone-50)", borderBottom: "2px solid var(--border-default)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
          color: "var(--text-secondary)", fontFamily: "var(--font-sans)",
          textTransform: "uppercase", zIndex: 2,
        }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              style={{ accentColor: "var(--jade-500)", cursor: "pointer", width: 14, height: 14 }} />
          </span>
          {header.slice(1).map((h, i) => {
            // numeric right-align (last few cols based on type)
            const numericIdx = type === "health" ? [7, 8, 9, 10] : type === "herbal" ? [7, 8, 9] : [8];
            const isNum = numericIdx.includes(i + 1);
            return <span key={i} style={{ textAlign: isNum ? "right" : "left", display: "block" }}>{h}</span>;
          })}
        </div>

        {items.length === 0 && (
          <div style={{
            padding: "60px 20px", textAlign: "center",
            color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)",
          }}>
            <Icon name="file-search" size={36} style={{ color: "var(--stone-400)", marginBottom: 12 }} />
            <div>해당 조건에 해당하는 명세서가 없습니다.</div>
          </div>
        )}

        {items.map((it) => {
          const isExcluded = excluded.has(it.id);
          const isError = !!it.error;
          const isSelected = selected.has(it.id);
          return (
            <div key={it.id} style={{
              display: "grid", gridTemplateColumns: cols,
              alignItems: "center", padding: cellPad,
              minHeight: rowHeight,
              borderBottom: "1px solid var(--stone-100)",
              background: isExcluded ? "var(--stone-100)"
                : isError ? "var(--cinnabar-100)"
                : isSelected ? "var(--jade-50)" : "transparent",
              opacity: isExcluded ? 0.55 : 1,
              transition: "background 0.1s",
              cursor: isExcluded ? "default" : "pointer",
              position: "relative",
            }} onClick={() => !isExcluded && toggleOne(it.id)}>
              {/* checkbox */}
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isError && (
                  <span title={it.error.msg} style={{ marginRight: 4 }}>
                    <Icon name="alert-triangle" size={12} style={{ color: "var(--cinnabar-700)" }} />
                  </span>
                )}
                <input type="checkbox"
                  checked={isSelected && !isExcluded}
                  disabled={isExcluded}
                  onChange={e => { e.stopPropagation(); toggleOne(it.id); }}
                  onClick={e => e.stopPropagation()}
                  style={{ accentColor: "var(--jade-500)", cursor: "pointer", width: 14, height: 14 }} />
              </span>

              {type === "health" && (<>
                <Mono>{it.seq}</Mono>
                <Mono>{it.visitDate.replace(/-/g, "")}</Mono>
                <Cell>{it.patientName}</Cell>
                <Mono>{it.rrn}</Mono>
                <Cell>{it.doctor}</Cell>
                <KindBadge value={it.kind} />
                <Mono>{it.visitCount}</Mono>
                <NumCell>{NUM(it.claimAmount - it.copay)}</NumCell>
                <NumCell>{NUM(it.copay)}</NumCell>
                <NumCell strong>{NUM(it.coveredTotal)}</NumCell>
              </>)}

              {type === "herbal" && (<>
                <Mono>{it.seq}</Mono>
                <Mono>{it.visitDate.replace(/-/g, "")}</Mono>
                <Cell>{it.patientName}</Cell>
                <Mono>{it.rrn}</Mono>
                <Cell>{it.doctor}</Cell>
                <Cell>{it.formula}</Cell>
                <NumCell>{it.herbalDays}일</NumCell>
                <NumCell>{NUM(it.ingredientCost)}</NumCell>
                <NumCell strong>{NUM(it.consultFee)}</NumCell>
              </>)}

              {type === "auto" && (<>
                <Mono>{it.claimDocNo}</Mono>
                <Mono>{it.visitDate.replace(/-/g, "")}</Mono>
                <Cell>{it.patientName}</Cell>
                <Mono>{it.rrn}</Mono>
                <Cell>{it.doctor}</Cell>
                <Cell>{it.autoInsurer}</Cell>
                <Mono small>{it.accidentNo}</Mono>
                <NumCell strong>{NUM(it.claimAmount)}</NumCell>
              </>)}

              {/* 제외 button */}
              <span style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={e => { e.stopPropagation(); toggleExclude(it.id); }}
                  title={isExcluded ? "제외 해제" : "이번 청구에서 제외"}
                  style={{
                    padding: "3px 8px", fontSize: 10, fontWeight: 500,
                    background: isExcluded ? "var(--stone-300)" : "var(--bg-surface)",
                    color: isExcluded ? "var(--text-primary)" : "var(--text-muted)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>
                  {isExcluded ? "복원" : "제외"}
                </button>
              </span>

              {/* error tooltip strip */}
              {isError && !isExcluded && (
                <div style={{
                  gridColumn: "1 / -1",
                  marginTop: 4, padding: "4px 12px 4px 28px",
                  fontSize: 11, color: "var(--cinnabar-800)",
                  fontFamily: "var(--font-sans)",
                  background: "var(--cinnabar-100)",
                  borderTop: "1px dashed var(--cinnabar-300)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 10, color: "var(--cinnabar-800)" }}>{it.error.code}</span>
                  <span>{it.error.msg}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mono({ children, small }) {
  return <span style={{
    fontFamily: "var(--font-mono)", fontSize: small ? 11 : 12,
    color: "var(--text-secondary)",
  }}>{children}</span>;
}
function Cell({ children }) {
  return <span style={{
    fontFamily: "var(--font-sans)", fontSize: 12,
    color: "var(--text-primary)",
  }}>{children}</span>;
}
function NumCell({ children, strong }) {
  return <span style={{
    fontFamily: "var(--font-mono)", fontSize: 12,
    color: strong ? "var(--text-primary)" : "var(--text-secondary)",
    fontWeight: strong ? 600 : 400,
    textAlign: "right",
  }}>{children}</span>;
}
function KindBadge({ value }) {
  const colors = {
    "보험": { bg: "var(--jade-50)", fg: "var(--jade-700)", bd: "var(--jade-200)" },
    "의료급여": { bg: "var(--amber-100)", fg: "var(--amber-700)", bd: "var(--amber-200)" },
    "시범사업": { bg: "var(--amber-100)", fg: "var(--amber-700)", bd: "var(--amber-200)" },
    "자동차": { bg: "var(--cinnabar-100)", fg: "var(--cinnabar-700)", bd: "var(--cinnabar-200)" },
  };
  const c = colors[value] || colors["보험"];
  return <span style={{
    display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600,
    padding: "1px 7px", borderRadius: "var(--radius-full)",
    background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
    fontFamily: "var(--font-sans)", width: "fit-content",
  }}>{value}</span>;
}

// ── Bottom Action Bar ───────────────────────────────────────
function ActionBar({ type, summary, selected, errorCount, onSubmitAll, onSubmitSelected, onOpenPhysioRecords, onOpenChunaRecords }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--border-subtle)",
      boxShadow: "0 -2px 8px rgba(17, 30, 28, 0.04)",
      flexShrink: 0,
    }}>
      {/* Secondary records (건보/첩약만) */}
      {type !== "auto" && (
        <>
          <SmallBtn icon="activity" onClick={onOpenPhysioRecords}>물리치료 내역</SmallBtn>
          <SmallBtn icon="hand" onClick={onOpenChunaRecords}>추나치료 내역</SmallBtn>
          <div style={{ width: 1, height: 22, background: "var(--border-subtle)" }}></div>
        </>
      )}

      {/* Selection status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 12px",
        background: "var(--stone-50)",
        border: "1px solid var(--stone-200)",
        borderRadius: "var(--radius-md)",
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em" }}>선택</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
            {selected}건
          </span>
        </div>
        {errorCount > 0 && (
          <div style={{
            display: "flex", flexDirection: "column",
            paddingLeft: 10, borderLeft: "1px solid var(--stone-300)",
          }}>
            <span style={{ fontSize: 10, color: "var(--cinnabar-700)", letterSpacing: "0.04em" }}>오류</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--cinnabar-700)", lineHeight: 1.1 }}>
              {errorCount}건
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}></div>

      <button onClick={onSubmitSelected}
        disabled={selected === 0}
        style={{
          padding: "10px 18px", fontSize: 13, fontWeight: 600,
          background: selected === 0 ? "var(--stone-100)" : "var(--bg-surface)",
          color: selected === 0 ? "var(--text-disabled)" : "var(--jade-700)",
          border: `1px solid ${selected === 0 ? "var(--stone-200)" : "var(--jade-300)"}`,
          borderRadius: "var(--radius-md)",
          cursor: selected === 0 ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
        <Icon name="check-square" size={13} />
        선택 항목 청구 ({selected})
      </button>

      <button onClick={onSubmitAll} style={{
        padding: "10px 22px", fontSize: 14, fontWeight: 600,
        background: "var(--jade-500)", color: "#fff",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: "pointer", fontFamily: "var(--font-sans)",
        display: "inline-flex", alignItems: "center", gap: 8,
        boxShadow: "var(--shadow-sm)",
      }}>
        <Icon name="send" size={14} />
        바로 청구하기 · {KRW2(summary.totalClaim)}
      </button>
    </div>
  );
}

function SmallBtn({ icon, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "7px 12px", fontSize: 12, fontWeight: 500,
      background: "var(--bg-surface)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      cursor: "pointer", fontFamily: "var(--font-sans)",
    }}>
      <Icon name={icon} size={12} />
      {children}
    </button>
  );
}

Object.assign(window, { FilterBar, ClaimsTable, ActionBar });
