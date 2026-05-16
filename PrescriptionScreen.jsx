// KoMES — Prescription Editor Screen
const { useState: useStateRx, useEffect: useEffectRx } = React;

const HERB_SUGGESTIONS = [
  { name: "황기", latin: "Astragalus", category: "보기", defaultDose: 10 },
  { name: "백출", latin: "Atractylodes", category: "보기", defaultDose: 8 },
  { name: "복신", latin: "Poria cocos", category: "안신", defaultDose: 10 },
  { name: "산조인", latin: "Ziziphus", category: "안신", defaultDose: 12 },
  { name: "용안육", latin: "Longan", category: "보혈", defaultDose: 8 },
  { name: "감초", latin: "Glycyrrhiza", category: "조화", defaultDose: 6 },
  { name: "당귀", latin: "Angelica", category: "보혈", defaultDose: 10 },
  { name: "천궁", latin: "Ligusticum", category: "활혈", defaultDose: 8 },
];

const AI_SUGGESTION = {
  name: "귀비탕 가감",
  confidence: 87,
  herbs: [
    { name: "황기", dose: 10 },
    { name: "백출", dose: 8 },
    { name: "복신", dose: 10 },
    { name: "산조인", dose: 12 },
    { name: "용안육", dose: 8 },
    { name: "감초", dose: 6 },
  ],
  rationale: "기허혈허 + 불면 패턴에 적합. 최근 6개월 내 유사 증례 23건 기반.",
};

function PrescriptionScreen({ patient, onBack }) {
  const [herbs, setHerbs] = useStateRx([
    { name: "황기", dose: 10 },
    { name: "백출", dose: 8 },
    { name: "감초", dose: 6 },
  ]);
  const [days, setDays] = useStateRx("14");
  const [memo, setMemo] = useStateRx("");
  const [showAI, setShowAI] = useStateRx(true);
  const [herbSearch, setHerbSearch] = useStateRx("");
  const [saved, setSaved] = useStateRx(false);

  const totalWeight = herbs.reduce((s, h) => s + Number(h.dose), 0);

  const addHerb = (herb) => {
    if (!herbs.find(h => h.name === herb.name)) {
      setHerbs([...herbs, { name: herb.name, dose: herb.defaultDose }]);
    }
    setHerbSearch("");
  };

  const removeHerb = (name) => setHerbs(herbs.filter(h => h.name !== name));
  const updateDose = (name, val) => setHerbs(herbs.map(h => h.name === name ? { ...h, dose: val } : h));

  const applyAI = () => setHerbs(AI_SUGGESTION.herbs.map(h => ({ ...h })));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const filteredSuggestions = herbSearch
    ? HERB_SUGGESTIONS.filter(h => h.name.includes(herbSearch) && !herbs.find(x => x.name === h.name))
    : [];

  return <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
    <TopBar
      title="신규 처방"
      subtitle={patient ? `${patient.name} · ${patient.gender} · ${patient.age}세` : ""}
      actions={<>
        <Button variant="secondary" size="sm" icon="arrow-left" onClick={onBack}>취소</Button>
        <Button variant="primary" icon={saved ? "check" : "save"} onClick={handleSave}>
          {saved ? "저장 완료" : "처방 저장"}
        </Button>
      </>}
    />

    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Left — Herb editor */}
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* AI Suggestion banner */}
        {showAI && (
          <div style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-lg)", padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="sparkles" size={16} style={{ color: "var(--jade-600)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>AI 추천: {AI_SUGGESTION.name}</span>
                <span style={{ fontSize: 12, background: "var(--brand-muted)", color: "var(--text-brand)", padding: "1px 7px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)" }}>적합도 {AI_SUGGESTION.confidence}%</span>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--jade-400)", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--jade-600)", fontFamily: "var(--font-sans)", marginBottom: 10, lineHeight: 1.5 }}>{AI_SUGGESTION.rationale}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {AI_SUGGESTION.herbs.map(h => (
                <span key={h.name} style={{ fontSize: 11, background: "var(--brand-muted)", color: "var(--text-brand)", padding: "3px 9px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-mono)" }}>
                  {h.name} {h.dose}g
                </span>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon="clipboard-copy" onClick={applyAI}>처방에 적용</Button>
          </div>
        )}

        {/* Herb table */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>약재 구성</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>총 {totalWeight}g / 첩</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
            <thead>
              <tr style={{ background: "var(--bg-raised)" }}>
                {["약재명", "효능 분류", "용량 (g)", ""].map(h => (
                  <th key={h} style={{ padding: "7px 14px", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {herbs.map((h, i) => {
                const info = HERB_SUGGESTIONS.find(x => x.name === h.name);
                return <tr key={h.name} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "8px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{h.name}</div>
                    {info && <div style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>{info.latin}</div>}
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    {info && <span style={{ fontSize: 11, background: "var(--bg-raised)", color: "var(--text-secondary)", padding: "2px 7px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>{info.category}</span>}
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    <input type="number" value={h.dose} onChange={e => updateDose(h.name, e.target.value)}
                      style={{ width: 64, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "4px 8px", outline: "none", textAlign: "right" }} />
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    <button onClick={() => removeHerb(h.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 15, lineHeight: 1, padding: "2px 4px", borderRadius: "var(--radius-sm)" }}>×</button>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>

          {/* Add herb */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)", position: "relative" }}>
            <Input placeholder="약재 추가..." value={herbSearch} onChange={setHerbSearch} icon="plus" />
            {filteredSuggestions.length > 0 && (
              <div style={{ position: "absolute", left: 14, right: 14, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 10, marginTop: 4 }}>
                {filteredSuggestions.map(h => (
                  <div key={h.name} onClick={() => addHerb(h)}
                    style={{ padding: "8px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "var(--font-sans)", borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--brand-subtle)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontWeight: 500 }}>{h.name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{h.category} · 기본 {h.defaultDose}g</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Memo */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "14px 18px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>복용 지도 / 메모</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="복용 방법, 주의사항 등 기재..."
            rows={3} style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 12px", outline: "none", resize: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 240, background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)", padding: "16px", display: "flex", flexDirection: "column", gap: 16, flexShrink: 0, overflowY: "auto" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 10 }}>처방 설정</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 4, fontFamily: "var(--font-sans)" }}>처방 일수</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" value={days} onChange={e => setDays(e.target.value)}
                  style={{ width: 64, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-primary)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "6px 8px", outline: "none", textAlign: "center" }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>일</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 10 }}>처방 요약</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--font-sans)" }}>
              <span style={{ color: "var(--text-secondary)" }}>약재 수</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{herbs.length}종</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--font-sans)" }}>
              <span style={{ color: "var(--text-secondary)" }}>총 중량 / 첩</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{totalWeight}g</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--font-sans)" }}>
              <span style={{ color: "var(--text-secondary)" }}>처방 일수</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{days}일</span>
            </div>
          </div>
        </div>

        {saved && (
          <div style={{ background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)", borderRadius: "var(--radius-md)", padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="check-circle" size={14} style={{ color: "var(--status-success-text)" }} />
            <span style={{ fontSize: 12, color: "var(--status-success-text)", fontFamily: "var(--font-sans)" }}>처방이 저장되었습니다.</span>
          </div>
        )}
      </div>
    </div>
  </div>;
}

Object.assign(window, { PrescriptionScreen });
