// KoMES — Patient Management (환자 관리)
// 전체 환자 등록부 · 검색 · 필터 · 관계도(가족/소개)
const { useState: useStateMgr, useMemo: useMemoMgr, useEffect: useEffectMgr } = React;

// ── 확장 환자 마스터 (PatientListScreen의 PATIENTS + 관계/태그/통계) ──
const PATIENT_MASTER = [
  { id: 1,  name: "홍길동", gender: "남", dob: "1985-04-12", age: 40, phone: "010-1234-5678", address: "서울 마포구 합정동", regDate: "2024-03-10", lastVisit: "2026-04-22", visitCount: 12, insurance: "자보", tags: ["VIP"],   chief: "두통, 어지러움", status: "active",   memo: "스트레스성 두통",       relations: [{ id: 2, type: "배우자" }, { id: 9, type: "지인 소개" }] },
  { id: 2,  name: "김수진", gender: "여", dob: "1972-11-30", age: 52, phone: "010-9876-5432", address: "서울 마포구 합정동", regDate: "2024-05-22", lastVisit: "2026-04-22", visitCount: 28, insurance: "건강보험", tags: ["VIP","갱년기"], chief: "요통, 피로감", status: "active",   memo: "홍길동 환자 배우자",     relations: [{ id: 1, type: "배우자" }, { id: 10, type: "친구" }] },
  { id: 3,  name: "이민호", gender: "남", dob: "1990-07-22", age: 34, phone: "010-5555-1234", address: "서울 강남구 역삼동", regDate: "2025-08-15", lastVisit: "2026-04-22", visitCount: 4,  insurance: "건강보험", tags: ["초진"],  chief: "소화불량, 복통",   status: "active",   memo: "",                      relations: [] },
  { id: 4,  name: "박지현", gender: "여", dob: "1968-02-14", age: 57, phone: "010-3344-7788", address: "경기 고양시 일산동", regDate: "2023-09-04", lastVisit: "2026-04-22", visitCount: 41, insurance: "건강보험", tags: ["불면증"],  chief: "불면증, 심계항진", status: "active",   memo: "수면제 복용 이력",       relations: [{ id: 5, type: "자녀" }] },
  { id: 5,  name: "최동욱", gender: "남", dob: "2001-09-05", age: 23, phone: "010-7722-9900", address: "경기 고양시 일산동", regDate: "2025-12-01", lastVisit: "2026-04-22", visitCount: 6,  insurance: "건강보험", tags: ["소아"], chief: "비염, 두통",      status: "active",   memo: "박지현 환자 아들",       relations: [{ id: 4, type: "부모" }] },
  { id: 6,  name: "정유미", gender: "여", dob: "1995-03-18", age: 30, phone: "010-6611-2233", address: "서울 송파구 잠실동", regDate: "2026-04-10", lastVisit: "2026-04-22", visitCount: 1,  insurance: "건강보험", tags: ["초진","산정특례"], chief: "생리통, 빈혈", status: "active",   memo: "",                      relations: [] },
  { id: 7,  name: "오세훈", gender: "남", dob: "1979-06-20", age: 46, phone: "010-8800-4411", address: "서울 강서구 화곡동", regDate: "2024-11-22", lastVisit: "2026-04-22", visitCount: 18, insurance: "건강보험", tags: [],  chief: "어깨 통증",        status: "active",   memo: "",                      relations: [] },
  { id: 8,  name: "윤지영", gender: "여", dob: "2000-01-11", age: 26, phone: "010-2200-8833", address: "서울 종로구 평창동", regDate: "2026-02-04", lastVisit: "2026-04-22", visitCount: 3,  insurance: "건강보험", tags: ["알러지"], chief: "피부 트러블",  status: "active",   memo: "페니실린 알러지",        relations: [] },
  { id: 9,  name: "강민재", gender: "남", dob: "1988-11-03", age: 37, phone: "010-1122-5566", address: "서울 마포구 망원동", regDate: "2024-07-18", lastVisit: "2026-04-22", visitCount: 9,  insurance: "건강보험", tags: [], chief: "무릎 통증",            status: "active",   memo: "",                      relations: [{ id: 1, type: "지인" }] },
  { id: 10, name: "임소연", gender: "여", dob: "1993-04-25", age: 33, phone: "010-9911-3344", address: "서울 마포구 합정동", regDate: "2025-04-30", lastVisit: "2026-04-22", visitCount: 7,  insurance: "건강보험", tags: ["갱년기"],  chief: "갱년기 증상",   status: "active",   memo: "",                      relations: [{ id: 2, type: "친구" }] },
  { id: 11, name: "한지민", gender: "여", dob: "1991-08-14", age: 34, phone: "010-4455-1100", address: "경기 성남시 분당구", regDate: "2025-01-10", lastVisit: "2026-04-15", visitCount: 14, insurance: "건강보험", tags: ["VIP"], chief: "어지러움",       status: "active",   memo: "",                      relations: [] },
  { id: 12, name: "장우성", gender: "남", dob: "1983-12-02", age: 42, phone: "010-7711-9922", address: "인천 연수구 송도동", regDate: "2026-05-01", lastVisit: "—",         visitCount: 1,  insurance: "자보", tags: ["초진","자보"], chief: "허리 통증",   status: "active",   memo: "교통사고 — 5/1 수상",     relations: [] },
  { id: 13, name: "송재호", gender: "남", dob: "1976-05-18", age: 49, phone: "010-3322-7755", address: "서울 강동구 천호동", regDate: "2026-04-12", lastVisit: "2026-04-26", visitCount: 5,  insurance: "자보", tags: ["자보"], chief: "교통사고 후 경항통", status: "active", memo: "쌍방 사고 — 4/12 수상",   relations: [] },
  { id: 14, name: "안세영", gender: "여", dob: "1995-09-23", age: 30, phone: "010-6677-2244", address: "서울 동작구 사당동", regDate: "2026-03-10", lastVisit: "2026-03-20", visitCount: 8,  insurance: "자보", tags: ["자보"], chief: "교통사고 후 요통", status: "active",   memo: "직장 출근길 사고",        relations: [] },
  { id: 15, name: "노준호", gender: "남", dob: "1955-08-09", age: 70, phone: "010-2244-6688", address: "서울 광진구 자양동", regDate: "2022-06-12", lastVisit: "2025-11-04", visitCount: 67, insurance: "건강보험", tags: ["노인","산정특례"], chief: "관절염, 만성요통", status: "dormant", memo: "오래된 단골",            relations: [{ id: 16, type: "배우자" }] },
  { id: 16, name: "황순자", gender: "여", dob: "1957-02-22", age: 68, phone: "010-3355-7799", address: "서울 광진구 자양동", regDate: "2022-06-12", lastVisit: "2026-01-20", visitCount: 52, insurance: "건강보험", tags: ["노인"], chief: "어깨, 무릎 통증", status: "active", memo: "노준호 환자 배우자",     relations: [{ id: 15, type: "배우자" }] },
];

const PATIENT_BY_ID = PATIENT_MASTER.reduce((a, p) => (a[p.id] = p, a), {});

const RELATION_TYPES = [
  { key: "배우자",   icon: "heart",    color: "#C4594B" },
  { key: "부모",     icon: "user",     color: "#5A6E8A" },
  { key: "자녀",     icon: "smile",    color: "#3A7065" },
  { key: "형제자매", icon: "users",    color: "#4A7C6F" },
  { key: "친구",     icon: "user-plus", color: "#9A8E82" },
  { key: "지인",     icon: "user-plus", color: "#9A8E82" },
  { key: "지인 소개", icon: "share-2", color: "#B5873E" },
  { key: "직장 동료", icon: "briefcase", color: "#5A6E8A" },
  { key: "기타",     icon: "circle",   color: "#7A6E60" },
];

const TAG_COLORS = {
  "VIP":     { bg: "var(--status-warning-bg)",   color: "var(--status-warning-text)",   border: "var(--status-warning-border)" },
  "자보":    { bg: "var(--status-danger-bg)", color: "var(--status-danger-text)", border: "var(--status-danger-border)" },
  "초진":    { bg: "var(--brand-subtle)",     color: "var(--text-brand)",     border: "var(--brand-muted)" },
  "노인":    { bg: "var(--bg-raised)",   color: "var(--text-secondary)",      border: "var(--border-subtle)" },
  "소아":    { bg: "var(--brand-muted)",    color: "var(--text-brand)",     border: "var(--brand-muted)" },
  "알러지":  { bg: "var(--status-danger-bg)", color: "var(--status-danger-text)", border: "var(--status-danger-border)" },
  "산정특례": { bg: "var(--brand-muted)",   color: "var(--text-brand)",     border: "var(--brand-muted)" },
  "갱년기":  { bg: "var(--status-warning-bg)",   color: "var(--status-warning-text)",   border: "var(--status-warning-border)" },
  "불면증":  { bg: "var(--bg-raised)",   color: "var(--text-secondary)",      border: "var(--border-subtle)" },
};

const tagStyle = (tag) => TAG_COLORS[tag] || { bg: "var(--bg-raised)", color: "var(--text-secondary)", border: "var(--border-subtle)" };

// ── Filter Sidebar ───────────────────────────────────────────────
function MgrFilterSidebar({ filter, setFilter, counts }) {
  const items = [
    { key: "all",     icon: "users",         label: "전체 환자" },
    { key: "active",  icon: "heart-pulse",   label: "활동 환자" },
    { key: "new",     icon: "user-plus",     label: "이달 신규" },
    { key: "dormant", icon: "moon",          label: "휴면 환자" },
  ];
  const tagItems = [
    { key: "tag:VIP",      icon: "crown",         label: "VIP" },
    { key: "tag:자보",     icon: "car",           label: "자보 환자" },
    { key: "tag:알러지",   icon: "alert-triangle", label: "알러지" },
    { key: "tag:노인",     icon: "user",          label: "노인" },
    { key: "tag:산정특례", icon: "shield-check",  label: "산정특례" },
  ];
  const relItems = [
    { key: "rel:any",   icon: "share-2",      label: "관계 등록 환자" },
    { key: "rel:none",  icon: "user-x",       label: "관계 미등록" },
  ];

  const renderRow = (item) => (
    <div key={item.key} onClick={() => setFilter(item.key)} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
      borderRadius: "var(--radius-md)", cursor: "pointer",
      background: filter === item.key ? "var(--brand-muted)" : "transparent",
      color: filter === item.key ? "var(--text-brand)" : "var(--text-secondary)",
      fontSize: 12, fontWeight: filter === item.key ? 600 : 400,
      fontFamily: "var(--font-sans)", transition: "all 0.12s",
    }}>
      <Icon name={item.icon} size={13} />
      <span style={{ flex: 1 }}>{item.label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: filter === item.key ? "var(--text-brand)" : "var(--text-muted)" }}>
        {counts[item.key] ?? 0}
      </span>
    </div>
  );

  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)", overflowY: "auto", padding: "14px 10px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 10px", marginBottom: 6, fontFamily: "var(--font-sans)" }}>상태</div>
      {items.map(renderRow)}

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 10px", margin: "16px 0 6px", fontFamily: "var(--font-sans)" }}>태그</div>
      {tagItems.map(renderRow)}

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 10px", margin: "16px 0 6px", fontFamily: "var(--font-sans)" }}>관계도</div>
      {relItems.map(renderRow)}
    </div>
  );
}

// ── Patient Row ──────────────────────────────────────────────────
function PatientRow({ p, selected, onSelect }) {
  return (
    <div onClick={() => onSelect(p)} style={{
      display: "grid",
      gridTemplateColumns: "32px 1.2fr 0.7fr 1fr 0.8fr 1.2fr 0.7fr 0.9fr",
      alignItems: "center", gap: 10,
      padding: "10px 16px",
      cursor: "pointer",
      background: selected ? "var(--brand-subtle)" : "transparent",
      borderLeft: `3px solid ${selected ? "var(--jade-500)" : "transparent"}`,
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
      transition: "all 0.1s",
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--bg-raised)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
      <Avatar name={p.name} size={28} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {p.name}
          {p.relations.length > 0 && (
            <Icon name="share-2" size={10} style={{ color: "var(--jade-500)", marginLeft: 5, verticalAlign: "middle" }} />
          )}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.gender} · 만 {p.age}세 · {p.dob}</div>
      </div>
      <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{p.phone}</span>
      <span style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.chief}</span>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: "2px 8px",
        borderRadius: "var(--radius-full)", textAlign: "center",
        ...tagStyle(p.insurance === "자보" ? "자보" : ""),
        background: p.insurance === "자보" ? "var(--status-danger-bg)" : "var(--bg-raised)",
        color: p.insurance === "자보" ? "var(--status-danger-text)" : "var(--text-secondary)",
        border: `1px solid ${p.insurance === "자보" ? "var(--status-danger-border)" : "var(--border-subtle)"}`,
        justifySelf: "start",
      }}>{p.insurance}</span>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {p.tags.slice(0, 2).map(t => {
          const s = tagStyle(t);
          return (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600, padding: "1px 7px",
              borderRadius: "var(--radius-full)",
              background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            }}>{t}</span>
          );
        })}
        {p.tags.length > 2 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{p.tags.length - 2}</span>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{p.visitCount}회</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.lastVisit}</div>
      </div>
      <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)", justifySelf: "end" }} />
    </div>
  );
}

// ── Relations Editor (관계도) ────────────────────────────────────
function RelationsPanel({ patient, allPatients, onPatientClick }) {
  const [relations, setRelations] = useStateMgr(patient.relations || []);
  const [adding, setAdding] = useStateMgr(false);
  const [searchQ, setSearchQ] = useStateMgr("");
  const [pickedType, setPickedType] = useStateMgr("배우자");

  useEffectMgr(() => {
    setRelations(patient.relations || []);
    setAdding(false);
    setSearchQ("");
  }, [patient.id]);

  const candidates = useMemoMgr(() => {
    const q = searchQ.trim();
    const excludeIds = new Set([patient.id, ...relations.map(r => r.id)]);
    let pool = allPatients.filter(p => !excludeIds.has(p.id));
    if (q) pool = pool.filter(p => p.name.includes(q) || p.phone.includes(q));
    return pool.slice(0, 6);
  }, [searchQ, relations, patient.id, allPatients]);

  const addRelation = (id) => {
    setRelations(prev => [...prev, { id, type: pickedType }]);
    setSearchQ("");
  };
  const removeRelation = (id) => setRelations(prev => prev.filter(r => r.id !== id));
  const setType = (id, type) => setRelations(prev => prev.map(r => r.id === id ? { ...r, type } : r));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="share-2" size={14} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>관계도</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)", background: "var(--brand-muted)", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>
          {relations.length}건
        </span>
        <button onClick={() => setAdding(!adding)} style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, color: "var(--text-brand)",
          background: adding ? "var(--brand-muted)" : "transparent", border: "1px solid var(--brand-muted)",
          borderRadius: "var(--radius-sm)", padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>
          <Icon name={adding ? "x" : "plus"} size={11} />{adding ? "닫기" : "관계 추가"}
        </button>
      </div>

      {/* Existing relations */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: adding ? 12 : 0 }}>
        {relations.length === 0 && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", padding: "12px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
            등록된 관계가 없습니다. 가족이나 지인을 추가해 보세요.
          </div>
        )}
        {relations.map(rel => {
          const target = PATIENT_BY_ID[rel.id];
          if (!target) return null;
          const typeInfo = RELATION_TYPES.find(t => t.key === rel.type) || RELATION_TYPES[0];
          return (
            <div key={rel.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              border: "1px solid var(--border-subtle)", background: "var(--bg-raised)",
              borderRadius: "var(--radius-md)",
            }}>
              <select value={rel.type} onChange={e => setType(rel.id, e.target.value)} style={{
                fontSize: 10, fontWeight: 600, padding: "3px 6px",
                color: typeInfo.color, background: `${typeInfo.color}18`,
                border: `1px solid ${typeInfo.color}33`,
                borderRadius: "var(--radius-full)", fontFamily: "var(--font-sans)",
                cursor: "pointer", outline: "none",
              }}>
                {RELATION_TYPES.map(t => <option key={t.key} value={t.key}>{t.key}</option>)}
              </select>
              <Avatar name={target.name} size={26} />
              <div onClick={() => onPatientClick(target)} style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{target.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{target.gender} · {target.age}세 · 내원 {target.visitCount}회</div>
              </div>
              <button onClick={() => onPatientClick(target)} title="차트로 이동" style={{ ...iconBtnSmall, color: "var(--jade-600)" }}>
                <Icon name="external-link" size={12} />
              </button>
              <button onClick={() => removeRelation(rel.id)} title="삭제" style={iconBtnSmall}>
                <Icon name="x" size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new relation */}
      {adding && (
        <div style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", padding: 12 }}>
          {/* Type picker */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-brand)", marginBottom: 6, fontFamily: "var(--font-sans)" }}>관계 유형</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {RELATION_TYPES.map(t => {
              const active = pickedType === t.key;
              return (
                <button key={t.key} onClick={() => setPickedType(t.key)} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, padding: "3px 9px", borderRadius: "var(--radius-full)",
                  border: `1px solid ${active ? t.color : "var(--border-subtle)"}`,
                  background: active ? `${t.color}22` : "var(--bg-surface)",
                  color: active ? t.color : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>
                  <Icon name={t.icon} size={10} />{t.key}
                </button>
              );
            })}
          </div>

          {/* Patient search */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-brand)", marginBottom: 6, fontFamily: "var(--font-sans)" }}>환자 검색</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", marginBottom: 8 }}>
            <Icon name="search" size={13} style={{ color: "var(--text-muted)" }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="등록된 환자 이름·연락처로 검색"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
            {candidates.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "8px", textAlign: "center", fontFamily: "var(--font-sans)" }}>
                검색 결과가 없습니다.
              </div>
            )}
            {candidates.map(c => (
              <button key={c.id} onClick={() => addRelation(c.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font-sans)", transition: "all 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--jade-300)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
                <Avatar name={c.name} size={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.gender} · {c.age}세 · {c.phone}</div>
                </div>
                <Icon name="plus" size={13} style={{ color: "var(--jade-600)" }} />
              </button>
            ))}
          </div>

          {/* Quick: 외부 인물 (등록 안 된 사람) */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--jade-200)" }}>
            <button style={{
              width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 11, color: "var(--text-brand)", background: "transparent",
              border: "1px dashed var(--jade-300)", borderRadius: "var(--radius-sm)",
              padding: "6px 10px", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>
              <Icon name="user-plus" size={11} />등록되지 않은 인물 추가 (이름·연락처만)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtnSmall = {
  width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-muted)",
};

// ── Detail Panel ─────────────────────────────────────────────────
function PatientDetailPanel({ patient, onClose, onSelectPatient, onOpenChart, allPatients }) {
  const [tab, setTab] = useStateMgr("info"); // info | relations | history

  useEffectMgr(() => { setTab("info"); }, [patient.id]);

  return (
    <div style={{ width: 420, flexShrink: 0, borderLeft: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Avatar name={patient.name} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)", letterSpacing: "-0.01em" }}>
              {patient.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>
              {patient.gender} · 만 {patient.age}세 · {patient.dob}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {patient.tags.map(t => {
                const s = tagStyle(t);
                return (
                  <span key={t} style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: "var(--radius-full)",
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: "var(--font-sans)",
                  }}>{t}</span>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} style={iconBtnSmall}>
            <Icon name="x" size={13} />
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "총 내원", value: `${patient.visitCount}회` },
            { label: "최근 내원", value: patient.lastVisit },
            { label: "보험", value: patient.insurance },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "7px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action */}
        <button onClick={() => onOpenChart(patient)} style={{
          width: "100%", marginTop: 12, padding: "8px 12px",
          background: "var(--jade-500)", color: "#fff",
          border: "none", borderRadius: "var(--radius-md)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "var(--font-sans)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "var(--shadow-sm)",
        }}>
          <Icon name="file-heart" size={14} />차트 열기
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border-subtle)", padding: "0 12px", flexShrink: 0 }}>
        {[
          { k: "info",      l: "기본 정보", i: "user" },
          { k: "relations", l: "관계도",    i: "share-2", count: patient.relations.length },
          { k: "history",   l: "내원 이력", i: "clock" },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 12, fontWeight: tab === t.k ? 600 : 400,
            color: tab === t.k ? "var(--text-brand)" : "var(--text-muted)",
            borderBottom: `2px solid ${tab === t.k ? "var(--jade-500)" : "transparent"}`,
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-sans)", marginBottom: -1,
          }}>
            <Icon name={t.i} size={12} />{t.l}
            {t.count != null && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-brand)", background: "var(--brand-muted)", padding: "0 5px", borderRadius: "var(--radius-full)", fontFamily: "var(--font-mono)" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {tab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "연락처",    value: patient.phone, mono: true, icon: "phone" },
              { label: "주소",      value: patient.address, icon: "map-pin" },
              { label: "최근 주소증", value: patient.chief, icon: "stethoscope" },
              { label: "등록일",    value: patient.regDate, mono: true, icon: "calendar" },
              { label: "메모",      value: patient.memo || "—", icon: "notebook-pen" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 4 }}>
                  <Icon name={f.icon} size={10} />{f.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: f.mono ? "var(--font-mono)" : "var(--font-sans)", lineHeight: 1.5 }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "relations" && (
          <RelationsPanel patient={patient} allPatients={allPatients} onPatientClick={onSelectPatient} />
        )}

        {tab === "history" && (
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 10 }}>
              총 {patient.visitCount}회 내원 · 최근 {patient.lastVisit}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { date: patient.lastVisit, type: "재진", dx: patient.chief, dr: "김민준" },
                { date: "2026-04-10", type: "재진", dx: patient.chief, dr: "김민준" },
                { date: "2026-03-15", type: "초진", dx: patient.chief, dr: "김민준" },
              ].filter(v => v.date !== "—").map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{v.date}</span>
                  <Badge variant={v.type === "초진" ? "danger" : "neutral"}>{v.type}</Badge>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{v.dx}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{v.dr}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
function PatientManagementScreen({ onOpenChart }) {
  const [patients] = useStateMgr(PATIENT_MASTER);
  const [filter, setFilter] = useStateMgr("all");
  const [search, setSearch] = useStateMgr("");
  const [sort, setSort] = useStateMgr("recent"); // recent | visits | name | reg
  const [selectedId, setSelectedId] = useStateMgr(patients[0]?.id);
  const [showNewPatient, setShowNewPatient] = useStateMgr(false);

  const counts = useMemoMgr(() => {
    const tagSet = (key) => patients.filter(p => p.tags.includes(key)).length;
    return {
      "all":     patients.length,
      "active":  patients.filter(p => p.status === "active").length,
      "new":     patients.filter(p => p.regDate >= "2026-04-01").length,
      "dormant": patients.filter(p => p.status === "dormant").length,
      "tag:VIP":      tagSet("VIP"),
      "tag:자보":     patients.filter(p => p.insurance === "자보").length,
      "tag:알러지":   tagSet("알러지"),
      "tag:노인":     tagSet("노인"),
      "tag:산정특례": tagSet("산정특례"),
      "rel:any":   patients.filter(p => p.relations.length > 0).length,
      "rel:none":  patients.filter(p => p.relations.length === 0).length,
    };
  }, [patients]);

  const filtered = useMemoMgr(() => {
    let list = patients;
    if (filter === "active")        list = list.filter(p => p.status === "active");
    else if (filter === "new")      list = list.filter(p => p.regDate >= "2026-04-01");
    else if (filter === "dormant")  list = list.filter(p => p.status === "dormant");
    else if (filter.startsWith("tag:")) {
      const tag = filter.slice(4);
      if (tag === "자보") list = list.filter(p => p.insurance === "자보");
      else list = list.filter(p => p.tags.includes(tag));
    }
    else if (filter === "rel:any")  list = list.filter(p => p.relations.length > 0);
    else if (filter === "rel:none") list = list.filter(p => p.relations.length === 0);

    if (search.trim()) {
      const q = search.trim();
      list = list.filter(p => p.name.includes(q) || p.phone.includes(q) || p.chief.includes(q));
    }

    return [...list].sort((a, b) => {
      if (sort === "visits") return b.visitCount - a.visitCount;
      if (sort === "name")   return a.name.localeCompare(b.name, "ko");
      if (sort === "reg")    return b.regDate.localeCompare(a.regDate);
      // recent
      const aV = a.lastVisit === "—" ? "0000-00-00" : a.lastVisit;
      const bV = b.lastVisit === "—" ? "0000-00-00" : b.lastVisit;
      return bV.localeCompare(aV);
    });
  }, [patients, filter, search, sort]);

  const selected = patients.find(p => p.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="환자 관리"
        subtitle={`등록 환자 ${patients.length}명 · 활동 ${counts.active}명 · 이달 신규 ${counts.new}명`}
        actions={<>
          <div style={{ width: 240 }}>
            <Input placeholder="이름·연락처·주소증 검색…" value={search} onChange={setSearch} icon="search" />
          </div>
          <Button variant="secondary" size="sm" icon="download">내보내기</Button>
          <Button variant="primary" icon="user-plus" onClick={() => setShowNewPatient(true)}>신규 등록</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <MgrFilterSidebar filter={filter} setFilter={setFilter} counts={counts} />

        {/* Patient list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Sort/toolbar */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface)" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{filtered.length}</span>명
            </span>
            <div style={{ width: 1, height: 16, background: "var(--border-subtle)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>정렬</span>
            <div style={{ display: "flex", gap: 2, background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: 2 }}>
              {[
                { k: "recent", l: "최근 내원" },
                { k: "visits", l: "내원 횟수" },
                { k: "reg",    l: "등록일" },
                { k: "name",   l: "가나다순" },
              ].map(o => (
                <button key={o.k} onClick={() => setSort(o.k)} style={{
                  fontSize: 11, fontWeight: sort === o.k ? 600 : 400,
                  padding: "3px 9px", borderRadius: "var(--radius-sm)",
                  border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
                  background: sort === o.k ? "var(--bg-surface)" : "transparent",
                  color: sort === o.k ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: sort === o.k ? "var(--shadow-sm)" : "none",
                }}>{o.l}</button>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 1.2fr 0.7fr 1fr 0.8fr 1.2fr 0.7fr 0.9fr",
            alignItems: "center", gap: 10,
            padding: "8px 16px", background: "var(--bg-raised)",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "var(--text-muted)",
            fontFamily: "var(--font-sans)",
          }}>
            <span></span>
            <span>환자</span>
            <span>연락처</span>
            <span>주소증</span>
            <span>보험</span>
            <span>태그</span>
            <span style={{ textAlign: "right" }}>내원/최근</span>
            <span></span>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
                <Icon name="users" size={32} style={{ color: "var(--stone-300)", marginBottom: 10 }} />
                <div>조건에 맞는 환자가 없습니다.</div>
              </div>
            ) : filtered.map(p => (
              <PatientRow key={p.id} p={p} selected={selectedId === p.id} onSelect={() => setSelectedId(p.id)} />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <PatientDetailPanel
            patient={selected}
            allPatients={patients}
            onClose={() => setSelectedId(null)}
            onSelectPatient={(p) => setSelectedId(p.id)}
            onOpenChart={onOpenChart}
          />
        )}
      </div>

      {showNewPatient && (
        <NewPatientModal
          onClose={() => setShowNewPatient(false)}
          onSubmit={() => setShowNewPatient(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { PatientManagementScreen, PATIENT_MASTER, RELATION_TYPES });
