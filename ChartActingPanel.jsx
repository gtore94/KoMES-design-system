// KoMES — Chart Acting Panel
// 상병 관리 + 액팅 오더(경과별 자보 제한) + 자보 경과 배너 + AI Tab 자동완성
const { useState: useStateCAP, useRef: useRefCAP, useEffect: useEffectCAP, useMemo: useMemoCAP } = React;

// ── 상병(KCD) 카탈로그 ────────────────────────────────────────────
const DIAGNOSIS_CATALOG = [
  { code: "S13.4", name: "경추의 염좌 및 긴장", region: "경추" },
  { code: "S13.6", name: "경추의 다른 부분의 염좌 및 긴장", region: "경추" },
  { code: "S33.5", name: "요추의 염좌", region: "요추" },
  { code: "S33.6", name: "골반의 염좌", region: "요천추" },
  { code: "S43.4", name: "어깨관절의 염좌", region: "견관절" },
  { code: "S53.4", name: "팔꿈치의 염좌", region: "주관절" },
  { code: "S63.5", name: "손목의 염좌", region: "수관절" },
  { code: "S83.5", name: "무릎의 염좌", region: "슬관절" },
  { code: "S93.4", name: "발목의 염좌", region: "족관절" },
  { code: "M54.2", name: "경부통", region: "경추" },
  { code: "M54.5", name: "요통", region: "요추" },
  { code: "M62.838", name: "근육경련", region: "전신" },
  { code: "M79.1", name: "근육통", region: "전신" },
  { code: "M25.5", name: "관절통", region: "관절" },
  { code: "G44.2", name: "긴장형 두통", region: "두부" },
  { code: "F51.0", name: "비기질성 불면증", region: "정신" },
];

// ── 한방 액팅 오더 카탈로그 (수가 코드 + 자보 경과별 가능 여부) ───
// phase: 1=급성기(0–7일), 2=아급성기(8–28일), 3=만성기(29일+)
// allowedPhases: 자보 환자에서 청구 가능한 경과 단계
const ACTING_ORDER_CATALOG = [
  { code: "40020", key: "경혈 침술 1부위",        short: "침-1",    icon: "zap",         color: "var(--accent-pine)", allowedPhases: [1,2,3], default: true,  duration: 15, fee: 4920 },
  { code: "40021", key: "경혈 침술 2부위",        short: "침-2",    icon: "zap",         color: "var(--accent-pine)", allowedPhases: [1,2,3], default: true,  duration: 15, fee: 6210 },
  { code: "40022", key: "경혈 침술 3부위",        short: "침-3",    icon: "zap",         color: "var(--accent-pine)", allowedPhases: [2,3],   default: false, duration: 20, autoOnly: true, note: "자보 한정", fee: 7480 },
  { code: "40080", key: "침전기 자극술",          short: "전침",    icon: "activity",    color: "var(--jade-400)", allowedPhases: [1,2,3], default: false, duration: 15, fee: 2860 },
  { code: "40090", key: "직접구",                 short: "직접구",  icon: "flame",       color: "var(--amber-600)", allowedPhases: [1,2,3], default: false, duration: 10, fee: 1830 },
  { code: "40091", key: "간접구",                 short: "간접구",  icon: "flame",       color: "var(--amber-500)", allowedPhases: [1,2,3], default: false, duration: 10, fee: 2200 },
  { code: "40095", key: "기기구",                 short: "기기구",  icon: "thermometer", color: "var(--cinnabar-500)", allowedPhases: [1,2,3], default: false, duration: 10, fee: 2750 },
  { code: "40300", key: "건식부항(유관법)",       short: "건부항",  icon: "circle-dot",  color: "var(--cinnabar-600)", allowedPhases: [1,2,3], default: false, duration: 10, fee: 5530 },
  { code: "40310", key: "습식부항(자락관법)",     short: "습부항",  icon: "droplets",    color: "var(--cinnabar-500)", allowedPhases: [1,2],   default: false, duration: 10, note: "급성·아급성기", fee: 6840 },
  { code: "40320", key: "약침술",                 short: "약침",    icon: "syringe",     color: "var(--brand)", allowedPhases: [1,2,3], default: false, duration: 10, fee: 11540 },
  { code: "40400", key: "추나요법(단순)",         short: "추나-단", icon: "hand",        color: "var(--ink-400)", allowedPhases: [2,3],   default: false, duration: 15, note: "1주 이후 권장", fee: 14750 },
  { code: "40401", key: "추나요법(복잡)",         short: "추나-복", icon: "hands",       color: "var(--accent-slate)", allowedPhases: [2,3],   default: false, duration: 30, fee: 32100 },
];

// ── AI 자동완성 스니펫 (의사 작성 패턴 기반) ─────────────────────
// Subject가 sStartsWith로 시작하면 ghostSuffix를 제안
const SOAP_AUTOCOMPLETE = {
  s: [
    { trigger: "두통",   suffix: " 지속, 빈도는 감소함. 어지러움 동반. 수면의 질 낮음" },
    { trigger: "요통",   suffix: " 지속, 굴곡 시 악화. 우측 둔부 방사통 호소. VAS 6/10" },
    { trigger: "교통사고", suffix: " 후 경항부 강직, 우측 견관절 통증 호소. 수면장애 동반" },
    { trigger: "어깨",   suffix: " 결림 3주, 야간 통증 동반. 외전 시 제한" },
  ],
  o: [
    { trigger: "혈압",   suffix: " 116/74 · 맥박 70 · 체온 36.4°C\n망진: 안색 호전, 설태 박백\n맥진: 침세(沈細)" },
    { trigger: "압통",   suffix: " 양성 (+/3), 경추 가동범위 굴곡 30°/신전 25°\n방사통 음성" },
  ],
  a: [
    { trigger: "기허",   suffix: "혈허(氣虛血虛) 패턴, 수면장애 동반" },
    { trigger: "경항",   suffix: "부염좌 (S13.4) 아급성기, 견관절 염좌 동반" },
    { trigger: "요부",   suffix: "염좌 (S33.5) 급성기, 좌골신경통 의심" },
  ],
  p: [
    { trigger: "귀비",   suffix: "탕 가감 14일분. 산조인 증량. 2주 후 추적" },
    { trigger: "체침",   suffix: " + 전침 + 부항 병행. 주 3회 1주 시행 후 재평가" },
  ],
};

// ── 자보 경과 배너 ───────────────────────────────────────────────
// 사용 한도(추나 20회 / 첩약 21일분)는 progress bar로 시각화.
// "8주 보장 종료" 같은 잘못된 정보는 표시하지 않음.
function AutoInsuranceBar({ injuryDate, today = new Date(), chunaUsed = 7, herbDaysUsed = 14, yakchimUsedWeek = 2, seupUsedWeek = 1 }) {
  if (!injuryDate) return null;
  const d0 = new Date(injuryDate);
  const days = Math.max(0, Math.floor((today - d0) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;
  const phase = days <= 7 ? 1 : days <= 28 ? 2 : 3;
  const irClaimable = days <= 17; // 2주 3일 이내 IR 2부위 청구 가능

  // 사용 한도
  const CHUNA_MAX = 20;
  const HERB_MAX = 21;
  const YAKCHIM_WEEK_MAX = 3;
  const SEUP_WEEK_MAX = 3;
  const chunaPct = Math.min(chunaUsed / CHUNA_MAX, 1) * 100;
  const herbPct = Math.min(herbDaysUsed / HERB_MAX, 1) * 100;
  const yakchimPct = Math.min(yakchimUsedWeek / YAKCHIM_WEEK_MAX, 1) * 100;
  const seupPct = Math.min(seupUsedWeek / SEUP_WEEK_MAX, 1) * 100;
  const chunaWarn = chunaUsed >= CHUNA_MAX * 0.8;
  const herbWarn = herbDaysUsed >= HERB_MAX * 0.8;
  const yakchimWarn = yakchimUsedWeek >= YAKCHIM_WEEK_MAX;
  const seupWarn = seupUsedWeek >= SEUP_WEEK_MAX;

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--jade-900) 0%, var(--jade-700) 100%)",
      color: "var(--stone-50)",
      borderRadius: "var(--radius-lg)",
      padding: "12px 16px",
      marginBottom: 14,
      display: "flex", alignItems: "stretch", gap: 18,
      boxShadow: "var(--shadow-md)",
    }}>
      {/* LEFT: 환자 메타 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-md)",
          background: "var(--overlay-white-10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="car" size={18} style={{ color: "var(--stone-50)" }} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--stone-200)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
              자동차 보험 환자
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--stone-300)", fontFamily: "var(--font-sans)", marginTop: 1 }}>
            수상일 <span style={{ fontFamily: "var(--font-mono)" }}>{injuryDate}</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--stone-400)", fontFamily: "var(--font-sans)", marginTop: 1 }}>
            삼성화재 · 경과 <span style={{ fontFamily: "var(--font-mono)", color: "var(--stone-200)" }}>{weeks}주{remDays > 0 ? ` ${remDays}일` : ""}</span> ({days}일)
          </div>
          {irClaimable && (
            <span style={{
              display: "inline-flex", marginTop: 5,
              fontSize: 10, fontWeight: 600,
              color: "var(--text-brand)", background: "var(--brand-muted)",
              padding: "1px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
              border: "1px solid var(--brand)",
              fontFamily: "var(--font-sans)",
            }}>IR 2부위 청구 가능</span>
          )}
        </div>
      </div>

      {/* divider */}
      <div style={{ width: 1, background: "var(--overlay-white-12)", flexShrink: 0 }} />

      {/* RIGHT: 사용 한도 progress bars */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", alignItems: "center", minWidth: 0 }}>
        <UsageBar
          icon="hand"
          label="추나요법"
          used={chunaUsed}
          max={CHUNA_MAX}
          unit="회"
          pct={chunaPct}
          warn={chunaWarn}
          hint="연 20회 한도"
        />
        <UsageBar
          icon="leaf"
          label="첩약"
          used={herbDaysUsed}
          max={HERB_MAX}
          unit="일"
          pct={herbPct}
          warn={herbWarn}
          hint="처방 1건 21일분"
        />
        <UsageBar
          icon="syringe"
          label="약침"
          used={yakchimUsedWeek}
          max={YAKCHIM_WEEK_MAX}
          unit="회"
          pct={yakchimPct}
          warn={yakchimWarn}
          hint="주 3회 한도"
        />
        <UsageBar
          icon="droplets"
          label="습부항"
          used={seupUsedWeek}
          max={SEUP_WEEK_MAX}
          unit="회"
          pct={seupPct}
          warn={seupWarn}
          hint="주 3회 한도"
        />
      </div>
    </div>
  );
}

// ── 사용 한도 progress bar ───────────────────────────────────────
function UsageBar({ icon, label, used, max, unit, pct, warn, hint }) {
  const remaining = Math.max(0, max - used);
  const barColor = warn ? "var(--amber-400)" : "var(--brand)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <Icon name={icon} size={12} style={{ color: "var(--stone-200)", flexShrink: 0, alignSelf: "center" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--stone-100)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: "var(--stone-400)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
          {hint}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: warn ? "var(--status-warning-border)" : "var(--stone-50)", lineHeight: 1, letterSpacing: "-0.01em", flexShrink: 0 }}>
          {used}<span style={{ fontSize: 11, color: "var(--stone-400)", fontWeight: 400, margin: "0 1px" }}>/</span>{max}
          <span style={{ fontSize: 10, color: "var(--stone-300)", fontWeight: 400, marginLeft: 2 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 6, background: "var(--overlay-white-12)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: barColor,
          transition: "width 0.3s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--stone-400)", fontFamily: "var(--font-mono)" }}>
        <span>{used >= max ? "한도 도달" : `잔여 ${remaining}${unit}`}</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

// ── 상병 섹션 ────────────────────────────────────────────────────
function DiagnosisSection({ initialDx = [] }) {
  const [dx, setDx] = useStateCAP(initialDx);
  const [adding, setAdding] = useStateCAP(false);
  const [query, setQuery] = useStateCAP("");

  const matches = query.trim()
    ? DIAGNOSIS_CATALOG.filter(c => c.name.includes(query) || c.code.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : DIAGNOSIS_CATALOG.slice(0, 5);

  const aiSuggestions = ["S13.4", "M54.2"]
    .filter(c => !dx.find(d => d.code === c))
    .map(c => DIAGNOSIS_CATALOG.find(x => x.code === c))
    .filter(Boolean);

  const addDx = (item, primary = false) => {
    if (dx.find(d => d.code === item.code)) return;
    const exists = dx.find(d => d.primary);
    setDx(prev => [...prev, { ...item, primary: primary || !exists }]);
    setQuery(""); setAdding(false);
  };

  const remove = (code) => setDx(prev => prev.filter(d => d.code !== code));
  const setPrimary = (code) => setDx(prev => prev.map(d => ({ ...d, primary: d.code === code })));

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="file-text" size={14} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>상병</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>KCD-8</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)", background: "var(--brand-muted)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px" }}>
          {dx.length}건
        </span>
        <button onClick={() => setAdding(!adding)} style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, color: "var(--text-brand)",
          background: adding ? "var(--brand-muted)" : "var(--bg-surface)", border: "1px solid var(--brand-muted)",
          borderRadius: "var(--radius-sm)", padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>
          <Icon name={adding ? "x" : "plus"} size={11} />{adding ? "닫기" : "상병 추가"}
        </button>
      </div>

      {/* AI 추천 상병 */}
      {!adding && aiSuggestions.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <Icon name="sparkles" size={11} style={{ color: "var(--jade-600)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>AI 추천</span>
          {aiSuggestions.map(s => (
            <button key={s.code} onClick={() => addDx(s)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, color: "var(--text-brand)",
              background: "var(--brand-subtle)", border: "1px dashed var(--jade-300)",
              borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "3px 9px",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>
              <Icon name="plus" size={10} />
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s.code}</span>
              <span>{s.name}</span>
            </button>
          ))}
          <button onClick={() => aiSuggestions.forEach(s => addDx(s))} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 600, color: "var(--text-on-brand)",
            background: "var(--jade-500)", border: "none",
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "3px 10px",
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
            <Icon name="plus" size={10} />모두 추가
          </button>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>· 환자 주소증 + 과거 패턴 기반</span>
        </div>
      )}

      {/* 등록된 상병 */}
      {dx.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: adding ? 12 : 0 }}>
          {dx.map(d => (
            <div key={d.code} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 12px", borderRadius: "var(--radius-md)",
              border: `1px solid ${d.primary ? "var(--jade-300)" : "var(--border-subtle)"}`,
              background: d.primary ? "var(--brand-subtle)" : "var(--bg-raised)",
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px",
                color: d.primary ? "var(--text-on-brand)" : "var(--text-muted)",
                background: d.primary ? "var(--jade-500)" : "var(--bg-raised)",
                borderRadius: "var(--radius-sm)", letterSpacing: "0.04em",
                fontFamily: "var(--font-sans)",
                cursor: d.primary ? "default" : "pointer",
              }} onClick={() => !d.primary && setPrimary(d.code)}>
                {d.primary ? "주상병" : "부상병"}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>{d.code}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", padding: "1px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>{d.region}</span>
              <button onClick={() => remove(d.code)} style={{ display: "inline-flex", alignItems: "center", padding: 3, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <Icon name="x" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 상병 추가 */}
      {adding && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
            <Icon name="search" size={13} style={{ color: "var(--text-muted)" }} />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="상병명 또는 KCD 코드 검색 (예: 요추, S33.5)"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "var(--font-sans)", background: "transparent" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 200, overflowY: "auto" }}>
            {matches.map(m => (
              <div key={m.code} onClick={() => addDx(m)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--brand-subtle)"; e.currentTarget.style.borderColor = "var(--jade-300)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>{m.code}</span>
                <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>{m.name}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{m.region}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 자동완성 텍스트영역 ──────────────────────────────────────
function TabAutocompleteTextarea({ value, onChange, snippets = [], placeholder, rows = 2 }) {
  const ref = useRefCAP(null);

  const ghost = useMemoCAP(() => {
    if (!value) return "";
    const trimmedTail = value.split(/[.\n]/).pop().trim();
    if (!trimmedTail) return "";
    const match = snippets.find(s => trimmedTail.includes(s.trigger) && !value.includes(s.suffix.trim().slice(0, 8)));
    return match ? match.suffix : "";
  }, [value, snippets]);

  const onKey = (e) => {
    if (e.key === "Tab" && ghost) {
      e.preventDefault();
      onChange(value + ghost);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Ghost shadow text overlay */}
      {ghost && (
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          padding: "7px 10px", fontSize: 13, fontFamily: "var(--font-sans)",
          color: "transparent", pointerEvents: "none",
          whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6,
          boxSizing: "border-box",
        }}>
          <span>{value}</span>
          <span style={{ color: "var(--jade-400)", background: "var(--brand-subtle)", borderRadius: 2, padding: "0 2px" }}>{ghost}</span>
        </div>
      )}
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={onKey} rows={rows} placeholder={placeholder}
        style={{
          position: "relative", width: "100%",
          fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
          background: ghost ? "transparent" : "var(--bg-raised)",
          border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
          padding: "7px 10px", outline: "none", resize: "vertical", lineHeight: 1.6,
          boxSizing: "border-box",
        }} />
      {ghost && (
        <div style={{
          position: "absolute", right: 8, bottom: 6,
          fontSize: 9, fontWeight: 600, color: "var(--text-brand)",
          background: "var(--brand-muted)", border: "1px solid var(--brand-muted)",
          borderRadius: "var(--radius-sm)", padding: "1px 5px",
          fontFamily: "var(--font-sans)", letterSpacing: "0.04em",
          display: "inline-flex", alignItems: "center", gap: 3,
          pointerEvents: "none",
        }}>
          <Icon name="sparkles" size={9} />Tab 자동완성
        </div>
      )}
    </div>
  );
}

// ── SOAP (with AI tab autocomplete) ─────────────────────────────
function SoapBlockAI({ data, editable }) {
  const [vals, setVals] = useStateCAP(data);
  const fields = [
    { key: "s", label: "S 주소증",        rows: 2 },
    { key: "o", label: "O 객관적 소견",    rows: 3 },
    { key: "a", label: "A 진단",           rows: 2 },
    { key: "p", label: "P 치료 계획",      rows: 2 },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {fields.map(f => (
        <div key={f.key}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--font-sans)" }}>{f.label}</div>
          {editable ? (
            <TabAutocompleteTextarea
              value={vals[f.key]}
              onChange={v => setVals(prev => ({ ...prev, [f.key]: v }))}
              snippets={SOAP_AUTOCOMPLETE[f.key] || []}
              rows={f.rows}
            />
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, fontFamily: "var(--font-sans)", whiteSpace: "pre-line" }}>{vals[f.key]}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── 액팅 오더 섹션 (자보 경과 인지) ──────────────────────────────
function ActingOrderPanel({ injuryDate, today = new Date() }) {
  const days = injuryDate ? Math.max(0, Math.floor((today - new Date(injuryDate)) / 86400000)) : null;
  const phase = days == null ? null : days <= 7 ? 1 : days <= 28 ? 2 : 3;

  const [orders, setOrders] = useStateCAP(() => ACTING_ORDER_CATALOG.filter(c => c.default).map(c => ({
    code: c.code, sites: c.key === "경혈 침술 1부위" ? "백회, 풍지, 천주" : "견정, 견우, 곡지",
    count: 12, done: false,
  })));
  const [showCatalog, setShowCatalog] = useStateCAP(false);

  const addOrder = (cat) => {
    setOrders(prev => [...prev, { code: cat.code, sites: "", count: 10, done: false }]);
    setShowCatalog(false);
  };

  const removeOrder = (i) => setOrders(prev => prev.filter((_, idx) => idx !== i));
  const toggleDone = (i) => setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, done: !o.done } : o));
  const updateSites = (i, v) => setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, sites: v } : o));

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="zap" size={14} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>액팅 오더</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)", background: "var(--brand-muted)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px" }}>
          {orders.length}건
        </span>
        {phase && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)", background: "var(--bg-raised)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 8px" }}>
            자동차보험
          </span>
        )}
        <button onClick={() => setShowCatalog(!showCatalog)} style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, color: "var(--text-brand)",
          background: showCatalog ? "var(--brand-muted)" : "var(--bg-surface)", border: "1px solid var(--brand-muted)",
          borderRadius: "var(--radius-sm)", padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>
          <Icon name={showCatalog ? "x" : "plus"} size={11} />{showCatalog ? "닫기" : "오더 추가"}
        </button>
      </div>

      {/* AI 추천 액팅 */}
      {!showCatalog && phase && (() => {
        const aiOrders = ACTING_ORDER_CATALOG
          .filter(c => c.allowedPhases.includes(phase) && !orders.find(o => o.code === c.code) && ["40080", "40300"].includes(c.code))
          .slice(0, 3);
        if (!aiOrders.length) return null;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <Icon name="sparkles" size={11} style={{ color: "var(--jade-600)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>AI 추천</span>
            {aiOrders.map(c => (
              <button key={c.code} onClick={() => addOrder(c)} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, color: c.color,
                background: `${c.color}12`, border: `1px dashed ${c.color}55`,
                borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "3px 9px",
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>
                <Icon name="plus" size={10} />
                {c.key}
              </button>
            ))}
            <button onClick={() => aiOrders.forEach(c => addOrder(c))} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, color: "var(--text-on-brand)",
              background: "var(--jade-500)", border: "none",
              borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "3px 10px",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>
              <Icon name="plus" size={10} />모두 추가
            </button>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>· 상병 + 경과 단계 기반</span>
          </div>
        );
      })()}

      {/* 등록된 액팅 오더 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: showCatalog ? 12 : 0 }}>
        {orders.map((o, i) => {
          const cat = ACTING_ORDER_CATALOG.find(c => c.code === o.code);
          if (!cat) return null;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 12px", borderRadius: "var(--radius-md)",
              background: o.done ? "var(--bg-raised)" : "var(--bg-surface)",
              border: `1px solid ${o.done ? "var(--border-subtle)" : "var(--border-default)"}`,
              opacity: o.done ? 0.7 : 1, transition: "all 0.12s",
            }}>
              <div onClick={() => toggleDone(i)} style={{
                width: 16, height: 16, borderRadius: "var(--radius-sm)",
                border: `2px solid ${o.done ? "var(--jade-400)" : "var(--border-default)"}`,
                background: o.done ? "var(--jade-400)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: "pointer",
              }}>
                {o.done && <Icon name="check" size={10} style={{ color: "var(--text-on-brand)" }} />}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{cat.code}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, background: `${cat.color}18`, padding: "2px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                {cat.short}
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                {cat.key}
              </span>
              <input value={o.sites} onChange={e => updateSites(i, e.target.value)}
                placeholder="부위 / 경혈"
                style={{ flex: 1, minWidth: 60, fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--text-secondary)", border: "none", outline: "none", background: "transparent", padding: "2px 4px", borderBottom: "1px dashed var(--border-subtle)" }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{cat.duration}분</span>
              <button onClick={() => removeOrder(i)} style={{ display: "inline-flex", alignItems: "center", padding: 3, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <Icon name="x" size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 카탈로그 */}
      {showCatalog && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12 }}>
          {phase && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
              <Icon name="info" size={10} style={{ verticalAlign: "middle", marginRight: 4 }} />
              자동차보험 환자 — 청구 가능한 항목만 활성화됩니다
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {ACTING_ORDER_CATALOG.map(c => {
              const allowed = !phase || c.allowedPhases.includes(phase);
              const already = orders.find(o => o.code === c.code);
              return (
                <button key={c.code} disabled={!allowed || already} onClick={() => addOrder(c)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: "var(--radius-sm)",
                  background: already ? "var(--bg-raised)" : "var(--bg-surface)",
                  border: `1px solid ${allowed ? "var(--border-subtle)" : "var(--status-danger-border)"}`,
                  opacity: allowed && !already ? 1 : 0.45,
                  cursor: allowed && !already ? "pointer" : "not-allowed",
                  textAlign: "left", transition: "all 0.12s",
                }}
                onMouseEnter={e => { if (allowed && !already) { e.currentTarget.style.background = "var(--brand-subtle)"; e.currentTarget.style.borderColor = "var(--jade-300)"; } }}
                onMouseLeave={e => { if (allowed && !already) { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; } }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: `${c.color}18`, padding: "2px 6px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", minWidth: 46, textAlign: "center", flexShrink: 0 }}>
                    {c.short}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{c.key}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{c.code} · {c.duration}분{c.note ? ` · ${c.note}` : ""}</div>
                  </div>
                  {already && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>등록됨</span>}
                  {!allowed && <span style={{ fontSize: 9, color: "var(--status-danger-text)", fontWeight: 600, background: "var(--status-danger-bg)", borderRadius: "var(--radius-sm)", padding: "1px 5px", fontFamily: "var(--font-sans)" }}>청구 불가</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 액팅 오더 청구 요약 패널 (오늘 액팅 비용) ─────────────────────
function ActingBillingPanel({ orders = null, insurance = "건강보험" }) {
  // 데모: 현재 차트의 오늘 액팅 — 침-1 + 침-2 + 전침 + 건부항 (자보) 가정
  const demoOrders = orders || [
    { code: "40020", count: 1 },
    { code: "40021", count: 1 },
    { code: "40080", count: 1 },
    { code: "40300", count: 1 },
  ];

  const items = demoOrders
    .map(o => {
      const cat = ACTING_ORDER_CATALOG.find(c => c.code === o.code);
      if (!cat) return null;
      return { ...cat, count: o.count, subtotal: cat.fee * o.count };
    })
    .filter(Boolean);

  const total = items.reduce((s, it) => s + it.subtotal, 0);
  const isAuto = insurance === "자보";
  const patientPay = isAuto ? 0 : Math.round(total * 0.4); // 본인부담 40% 가정 (한방 외래)
  const insurancePay = total - patientPay;

  const fmt = (n) => n.toLocaleString("ko-KR");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="receipt" size={15} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>오늘 액팅 청구</span>
        <span style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 600, color: isAuto ? "var(--status-danger-text)" : "var(--text-brand)",
          background: isAuto ? "var(--status-danger-bg)" : "var(--brand-muted)",
          border: `1px solid ${isAuto ? "var(--status-danger-border)" : "var(--brand-muted)"}`,
          borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 8px", fontFamily: "var(--font-sans)",
        }}>{insurance}</span>
      </div>

      {/* 항목 라인 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < items.length - 1 ? "1px dashed var(--border-subtle)" : "none" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: 36 }}>{it.code}</span>
            <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>
              {it.key}
              {it.count > 1 && <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 4, fontFamily: "var(--font-mono)" }}>×{it.count}</span>}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              ₩{fmt(it.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div style={{
        background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          <span>총 진료비</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>₩{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          <span>{isAuto ? "보험사 청구" : "공단 부담"}</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>₩{fmt(insurancePay)}</span>
        </div>
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "2px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
            {isAuto ? "환자 부담" : "본인 부담"}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: isAuto ? "var(--text-brand)" : "var(--status-danger-text)", fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
            ₩{fmt(patientPay)}
          </span>
        </div>
        {isAuto && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>
            자보 환자 — 환자 본인부담금 없음
          </div>
        )}
      </div>

      <button style={{
        width: "100%", marginTop: 10, padding: "8px 12px",
        background: "var(--jade-500)", color: "var(--text-on-brand)", border: "none",
        borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "var(--font-sans)",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        boxShadow: "var(--shadow-sm)",
      }}>
        <Icon name="credit-card" size={13} />수납 처리
      </button>
    </div>
  );
}

// ── 액팅 오더 + 청구 통합 패널 (실시간 계산) ──────────────────────
function ActingOrderBillingPanel({ injuryDate, insurance = "건강보험" }) {
  const days = injuryDate ? Math.max(0, Math.floor((new Date() - new Date(injuryDate)) / 86400000)) : null;
  const phase = days == null ? null : days <= 7 ? 1 : days <= 28 ? 2 : 3;
  const isAuto = insurance === "자보";

  const [orders, setOrders] = useStateCAP(() => ACTING_ORDER_CATALOG.filter(c => c.default).map(c => ({
    code: c.code, sites: c.key === "경혈 침술 1부위" ? "백회, 풍지, 천주" : "견정, 견우, 곡지",
    done: false,
  })));
  const [showCatalog, setShowCatalog] = useStateCAP(false);

  const addOrder = (cat) => {
    if (orders.find(o => o.code === cat.code)) return;
    setOrders(prev => [...prev, { code: cat.code, sites: "", done: false }]);
  };
  const removeOrder = (i) => setOrders(prev => prev.filter((_, idx) => idx !== i));
  const toggleDone = (i) => setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, done: !o.done } : o));
  const updateSites = (i, v) => setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, sites: v } : o));

  const items = orders.map(o => {
    const cat = ACTING_ORDER_CATALOG.find(c => c.code === o.code);
    return cat ? { ...o, ...cat, subtotal: cat.fee } : null;
  }).filter(Boolean);

  const total = items.reduce((s, it) => s + it.subtotal, 0);
  const patientPay = isAuto ? 0 : Math.round(total * 0.4);
  const insurancePay = total - patientPay;
  const fmt = (n) => n.toLocaleString("ko-KR");

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="zap" size={15} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>오늘 액팅 오더</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)", background: "var(--brand-muted)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px" }}>
          {orders.length}건
        </span>
        <span style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 600,
          color: isAuto ? "var(--status-danger-text)" : "var(--text-brand)",
          background: isAuto ? "var(--status-danger-bg)" : "var(--brand-muted)",
          border: `1px solid ${isAuto ? "var(--status-danger-border)" : "var(--brand-muted)"}`,
          borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 8px", fontFamily: "var(--font-sans)",
        }}>{isAuto ? "자동차보험" : insurance}</span>
      </div>

      {/* AI 추천 */}
      {!showCatalog && phase && (() => {
        const aiOrders = ACTING_ORDER_CATALOG
          .filter(c => c.allowedPhases.includes(phase) && !orders.find(o => o.code === c.code) && ["40080", "40300"].includes(c.code));
        if (!aiOrders.length) return null;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            <Icon name="sparkles" size={10} style={{ color: "var(--jade-600)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>AI 추천</span>
            {aiOrders.map(c => (
              <button key={c.code} onClick={() => addOrder(c)} style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 10, color: c.color,
                background: `${c.color}12`, border: `1px dashed ${c.color}55`,
                borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 7px",
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>
                <Icon name="plus" size={9} />{c.short}
              </button>
            ))}
            <button onClick={() => aiOrders.forEach(c => addOrder(c))} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 600, color: "var(--text-on-brand)",
              background: "var(--jade-500)", border: "none",
              borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "2px 8px",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>
              <Icon name="plus" size={9} />모두 추가
            </button>
          </div>
        );
      })()}

      {/* 등록된 오더 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 8px", borderRadius: "var(--radius-sm)",
            background: it.done ? "var(--bg-raised)" : "var(--bg-surface)",
            border: `1px solid ${it.done ? "var(--border-subtle)" : "var(--border-default)"}`,
            opacity: it.done ? 0.7 : 1, transition: "all 0.12s",
          }}>
            <div onClick={() => toggleDone(i)} style={{
              width: 14, height: 14, borderRadius: "var(--radius-sm)", flexShrink: 0,
              border: `2px solid ${it.done ? "var(--jade-400)" : "var(--border-default)"}`,
              background: it.done ? "var(--jade-400)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              {it.done && <Icon name="check" size={9} style={{ color: "var(--text-on-brand)" }} />}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{it.code}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: it.color, background: `${it.color}18`, padding: "1px 6px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
              {it.short}
            </span>
            <input value={it.sites} onChange={e => updateSites(i, e.target.value)}
              placeholder="부위"
              style={{ flex: 1, minWidth: 30, fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--text-secondary)", border: "none", outline: "none", background: "transparent", padding: "1px 2px" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              ₩{fmt(it.subtotal)}
            </span>
            <button onClick={() => removeOrder(i)} style={{ display: "inline-flex", alignItems: "center", padding: 2, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <Icon name="x" size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* 카탈로그에서 추가 */}
      <button onClick={() => setShowCatalog(!showCatalog)} style={{
        width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
        fontSize: 11, fontWeight: 500, color: "var(--text-brand)",
        background: showCatalog ? "var(--brand-subtle)" : "transparent",
        border: "1px dashed var(--jade-300)",
        borderRadius: "var(--radius-sm)", padding: "5px 9px", cursor: "pointer", fontFamily: "var(--font-sans)",
        marginBottom: showCatalog ? 8 : 12,
      }}>
        <Icon name={showCatalog ? "chevron-up" : "plus"} size={11} />
        {showCatalog ? "닫기" : "오더 추가"}
      </button>

      {showCatalog && (
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: 8, marginBottom: 12, maxHeight: 220, overflowY: "auto" }}>
          {phase && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>
              <Icon name="info" size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
              자동차보험 청구 가능 항목
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {ACTING_ORDER_CATALOG.map(c => {
              const allowed = !phase || c.allowedPhases.includes(phase);
              const already = orders.find(o => o.code === c.code);
              return (
                <button key={c.code} disabled={!allowed || already} onClick={() => addOrder(c)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 7px", borderRadius: "var(--radius-sm)",
                  background: already ? "var(--bg-raised)" : "var(--bg-surface)",
                  border: `1px solid ${allowed ? "var(--border-subtle)" : "var(--status-danger-border)"}`,
                  opacity: allowed && !already ? 1 : 0.45,
                  cursor: allowed && !already ? "pointer" : "not-allowed",
                  textAlign: "left", transition: "all 0.12s",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: `${c.color}18`, padding: "1px 5px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", minWidth: 42, textAlign: "center", flexShrink: 0 }}>
                    {c.short}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>{c.key}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>₩{fmt(c.fee)}</span>
                  {already && <Icon name="check" size={11} style={{ color: "var(--jade-500)" }} />}
                  {!allowed && <span style={{ fontSize: 9, color: "var(--status-danger-text)", fontWeight: 600, background: "var(--status-danger-bg)", borderRadius: "var(--radius-sm)", padding: "1px 4px", fontFamily: "var(--font-sans)" }}>불가</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* 청구 합계 */}
      <div style={{
        background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <Icon name="receipt" size={11} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>실시간 청구</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          <span>총 진료비</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>₩{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          <span>{isAuto ? "보험사 청구" : "공단 부담"}</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>₩{fmt(insurancePay)}</span>
        </div>
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "2px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
            {isAuto ? "환자 부담" : "본인 부담"}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: isAuto ? "var(--text-brand)" : "var(--status-danger-text)", fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
            ₩{fmt(patientPay)}
          </span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <button style={{
          flex: 1, padding: "8px 10px",
          background: "var(--bg-surface)", color: "var(--text-secondary)",
          border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
          fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <Icon name="save" size={12} />임시저장
        </button>
        <button style={{
          flex: 1.4, padding: "8px 10px",
          background: "var(--jade-500)", color: "var(--text-on-brand)", border: "none",
          borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--font-sans)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
          boxShadow: "var(--shadow-sm)",
        }}>
          <Icon name="check-circle-2" size={12} />진료 완료
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  AutoInsuranceBar, UsageBar, DiagnosisSection, ActingOrderPanel,
  TabAutocompleteTextarea, SoapBlockAI, ActingBillingPanel, ActingOrderBillingPanel,
  DIAGNOSIS_CATALOG, ACTING_ORDER_CATALOG, SOAP_AUTOCOMPLETE,
});
