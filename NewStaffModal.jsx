// KoMES — New Staff Registration Modal
const { useState: useStateSR } = React;

const KO_WEEK_SR = ["월","화","수","목","금","토","일"];

const ROLE_PRESETS = [
  { roleKey: "doctor",     roles: ["원장","부원장","한의사"],              dept: "진료부" },
  { roleKey: "nurse",      roles: ["수간호사","간호사","간호조무사"],       dept: "간호부" },
  { roleKey: "admin",      roles: ["원무실장","원무직원","행정직원"],       dept: "원무부" },
  { roleKey: "therapist",  roles: ["물리치료사"],                          dept: "치료부" },
  { roleKey: "pharmacist", roles: ["한약사"],                              dept: "조제실" },
];

const ALL_ROLES_SR = ROLE_PRESETS.flatMap(g => g.roles.map(r => ({ role: r, roleKey: g.roleKey, dept: g.dept })));

const PERMISSION_PRESETS = [
  { key: "원장",    icon: "crown",          label: "원장",
    perms: ["원장","차트 작성","처방 권한","통계 열람","직원 관리","급여 관리","직원 일정 관리"] },
  { key: "한의사",  icon: "stethoscope",    label: "한의사",
    perms: ["차트 작성","처방 권한","통계 열람"] },
  { key: "간호사",  icon: "heart-pulse",    label: "간호사",
    perms: ["차트 보조 작성","예약 관리","수납","재고 조정"] },
  { key: "원무",    icon: "clipboard-list", label: "원무",
    perms: ["예약 관리","수납","보험 청구","통계 열람"] },
  { key: "조제",    icon: "flask-conical",  label: "조제·약재",
    perms: ["조제 권한","약재 재고 관리","재고 조정","발주"] },
  { key: "치료사",  icon: "hand-helping",   label: "물리치료사",
    perms: ["차트 보조 작성","예약 관리"] },
];

const PERMISSION_GROUPS_SR = [
  { section: "시스템",   icon: "shield",          items: [{ key: "원장",           label: "원장 권한",   desc: "모든 기능 및 직원 관리 접근" }] },
  { section: "진료",     icon: "stethoscope",     items: [
    { key: "차트 작성",      label: "차트 작성",   desc: "환자 차트 신규 작성 및 수정" },
    { key: "차트 보조 작성", label: "차트 보조",   desc: "차트 보조 입력 (생체 신호, V/S)" },
    { key: "처방 권한",      label: "처방 권한",   desc: "한약·침구 처방 발급" },
  ]},
  { section: "예약·수납", icon: "calendar-check", items: [
    { key: "예약 관리",  label: "예약 관리",   desc: "예약 신규/변경/취소" },
    { key: "수납",       label: "수납",        desc: "결제 및 환불 처리" },
    { key: "보험 청구",  label: "보험 청구",   desc: "심평원·자보 청구 작성 및 전송" },
  ]},
  { section: "약재·재고", icon: "flask-conical", items: [
    { key: "조제 권한",      label: "조제 권한",   desc: "탕전·조제 및 출고" },
    { key: "약재 재고 관리", label: "약재 재고",   desc: "약재 입고/출고/폐기 관리" },
    { key: "재고 조정",      label: "재고 조정",   desc: "약재·소모품 재고 수정" },
    { key: "발주",           label: "발주 권한",   desc: "거래처 발주서 생성 및 승인 요청" },
  ]},
  { section: "경영·인사", icon: "briefcase", items: [
    { key: "통계 열람",      label: "통계 열람",   desc: "매출·환자 통계 대시보드" },
    { key: "급여 관리",      label: "급여 관리",   desc: "급여 명세서 조회 및 작성" },
    { key: "직원 관리",      label: "직원 관리",   desc: "직원 정보 및 권한 수정" },
    { key: "직원 일정 관리", label: "직원 일정",   desc: "근무표·휴가 승인" },
  ]},
];

const DEFAULT_SCHEDULE_SR = { 월: "09–18", 화: "09–18", 수: "09–18", 목: "09–18", 금: "09–18", 토: "휴무", 일: "휴무" };

const initialSR = {
  name: "", gender: "여", birth: "", rrnTail: "",
  phone: "", email: "",
  postcode: "", address: "", addressDetail: "",
  role: "한의사", roleKey: "doctor", dept: "진료부",
  specialty: "", workType: "정규직",
  licenses: "",
  joinDate: "2026-05-16",
  schedule: { ...DEFAULT_SCHEDULE_SR },
  permissions: [],
  salaryType: "월급제",
  note: "",
};

// ── Shared helpers ──────────────────────────────────────────────────
function SRFieldLabel({ children, required, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
        {children}
      </span>
      {required && <span style={{ color: "var(--cinnabar-600)", fontSize: 12 }}>*</span>}
      {hint && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginLeft: 4 }}>{hint}</span>}
    </div>
  );
}

function SRTextField({ value, onChange, placeholder, mono, type = "text", disabled }) {
  const [focused, setFocused] = useStateSR(false);
  return (
    <input
      type={type} value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        width: "100%", border: `1px solid ${focused ? "var(--border-brand)" : "var(--border-default)"}`,
        background: disabled ? "var(--stone-100)" : "var(--bg-surface)",
        borderRadius: "var(--radius-md)", padding: "8px 10px",
        fontSize: 13, outline: "none",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        color: "var(--text-primary)",
        boxShadow: focused ? "0 0 0 3px var(--jade-100)" : "none",
        transition: "all 0.12s", boxSizing: "border-box",
      }}
    />
  );
}

function SRSelect({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "8px 30px 8px 10px", fontSize: 13,
        fontFamily: "var(--font-sans)", color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", appearance: "none", cursor: "pointer", outline: "none",
        boxSizing: "border-box",
      }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
        <Icon name="chevron-down" size={14} />
      </span>
    </div>
  );
}

function SRSegmented({ options, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--stone-100)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 2, gap: 2 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: "5px 12px", border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: value === opt ? 600 : 400,
          background: value === opt ? "var(--bg-surface)" : "transparent",
          color: value === opt ? "var(--text-primary)" : "var(--text-muted)",
          borderRadius: "var(--radius-sm)",
          boxShadow: value === opt ? "var(--shadow-sm)" : "none",
          fontFamily: "var(--font-sans)", transition: "all 0.12s",
        }}>{opt}</button>
      ))}
    </div>
  );
}

function SRSectionCard({ step, icon, title, hint, children }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid var(--stone-200)", background: "var(--stone-50)" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--jade-100)", color: "var(--jade-700)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>{step}</div>
        <Icon name={icon} size={15} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</span>
        {hint && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{hint}</span>}
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────────────
function staffToForm(s) {
  if (!s) return initialSR;
  return {
    ...initialSR,
    name: s.name ?? "",
    gender: s.gender ?? "여",
    birth: s.birth ?? "", rrnTail: "",
    phone: s.phone ?? "", email: s.email ?? "",
    postcode: "", address: s.address ?? "", addressDetail: "",
    role: s.role ?? "한의사", roleKey: s.roleKey ?? "doctor", dept: s.dept ?? "진료부",
    specialty: s.specialty ?? "", workType: s.workType ?? "정규직",
    licenses: Array.isArray(s.licenses) ? s.licenses.join(", ") : (s.licenses ?? ""),
    joinDate: s.joinDate ?? "2026-05-16",
    schedule: s.schedule ? { ...DEFAULT_SCHEDULE_SR, ...s.schedule } : { ...DEFAULT_SCHEDULE_SR },
    permissions: s.permissions ? [...s.permissions] : [],
    salaryType: s.salary?.type ?? "월급제",
    note: s.note ?? "",
  };
}

function NewStaffModal({ onClose, onSubmit, initialData }) {
  const [d, setD] = useStateSR(() => staffToForm(initialData));
  const isEdit = !!initialData;
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const togglePermission = (key) => {
    setD(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const setScheduleDay = (day, val) => {
    setD(prev => ({ ...prev, schedule: { ...prev.schedule, [day]: val } }));
  };

  const handleRoleChange = (roleName) => {
    const found = ALL_ROLES_SR.find(r => r.role === roleName);
    if (found) setD(prev => ({ ...prev, role: found.role, roleKey: found.roleKey, dept: found.dept }));
  };

  const required = ["name", "phone", "role", "joinDate"];
  const filled = required.filter(k => d[k]).length;
  const allRequired = filled === required.length;

  const computedAge = (() => {
    if (!d.birth || d.birth.length < 6) return null;
    let y = parseInt(d.birth.slice(0, 2), 10);
    if (isNaN(y)) return null;
    const tail = d.rrnTail?.[0];
    y += (tail === "1" || tail === "2" || tail === "5" || tail === "6") ? 1900 : 2000;
    const age = new Date(2026, 4, 16).getFullYear() - y;
    return age >= 0 && age < 80 ? age : null;
  })();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "var(--bg-overlay)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "var(--font-sans)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 920, maxHeight: "calc(100vh - 48px)",
        background: "var(--bg-page)", borderRadius: "var(--radius-xl)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--jade-100)", color: "var(--jade-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user-plus" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{isEdit ? "직원 정보 수정" : "신규 직원 등록"}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {isEdit ? `${initialData.name} · 필수 항목 ${filled}/${required.length} 입력됨` : `필수 항목 ${filled}/${required.length} 입력됨 · 등록 후 즉시 직원 목록에 추가됩니다`}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)" }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Section 1: 기본 정보 */}
          <SRSectionCard step="1" icon="user" title="기본 정보">
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
              <div>
                <SRFieldLabel required>이름</SRFieldLabel>
                <SRTextField value={d.name} onChange={v => set("name", v)} placeholder="홍길동" />
              </div>
              <div>
                <SRFieldLabel>성별</SRFieldLabel>
                <SRSegmented options={["여", "남"]} value={d.gender} onChange={v => set("gender", v)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <SRFieldLabel hint={computedAge != null ? `만 ${computedAge}세` : ""}>주민등록번호</SRFieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 14px 1fr", alignItems: "center", gap: 6 }}>
                  <SRTextField value={d.birth} onChange={v => set("birth", v.replace(/[^0-9]/g,"").slice(0,6))} placeholder="900101" mono />
                  <span style={{ textAlign: "center", color: "var(--text-muted)" }}>-</span>
                  <SRTextField value={d.rrnTail} onChange={v => set("rrnTail", v.replace(/[^0-9*]/g,"").slice(0,7))} placeholder="*******" mono />
                </div>
              </div>
              <div>
                <SRFieldLabel required>휴대폰</SRFieldLabel>
                <SRTextField value={d.phone} onChange={v => set("phone", v)} placeholder="010-0000-0000" mono />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <SRFieldLabel>이메일</SRFieldLabel>
              <SRTextField value={d.email} onChange={v => set("email", v)} placeholder="example@komes.kr" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1.4fr", gap: 8, marginTop: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <SRFieldLabel>주소</SRFieldLabel>
              </div>
              <SRTextField value={d.postcode} onChange={v => set("postcode", v)} placeholder="우편번호" mono />
              <SRTextField value={d.address} onChange={v => set("address", v)} placeholder="기본 주소" />
              <SRTextField value={d.addressDetail} onChange={v => set("addressDetail", v)} placeholder="상세 주소" />
            </div>
          </SRSectionCard>

          {/* Section 2: 직무 정보 */}
          <SRSectionCard step="2" icon="briefcase" title="직무 정보">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <SRFieldLabel required>직책</SRFieldLabel>
                <SRSelect value={d.role} onChange={handleRoleChange}
                  options={ALL_ROLES_SR.map(r => r.role)} />
              </div>
              <div>
                <SRFieldLabel>부서</SRFieldLabel>
                <SRSelect value={d.dept} onChange={v => set("dept", v)}
                  options={["진료부","간호부","원무부","치료부","조제실"]} />
              </div>
              <div>
                <SRFieldLabel>고용 형태</SRFieldLabel>
                <SRSelect value={d.workType} onChange={v => set("workType", v)}
                  options={["정규직","계약직","파트타임","인턴"]} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <SRFieldLabel>전문 분야</SRFieldLabel>
                <SRTextField value={d.specialty} onChange={v => set("specialty", v)} placeholder="예: 침구·내과" />
              </div>
              <div>
                <SRFieldLabel required>입사일</SRFieldLabel>
                <SRTextField value={d.joinDate} onChange={v => set("joinDate", v)} placeholder="YYYY-MM-DD" mono />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <SRFieldLabel>면허 · 자격증</SRFieldLabel>
              <SRTextField value={d.licenses} onChange={v => set("licenses", v)} placeholder="예: 한의사 면허 #12345" />
            </div>

            <div style={{ marginTop: 14 }}>
              <SRFieldLabel>메모</SRFieldLabel>
              <textarea value={d.note} onChange={e => set("note", e.target.value)}
                placeholder="특이사항, 주의사항 등"
                style={{
                  width: "100%", minHeight: 56, padding: "9px 11px",
                  fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--text-primary)",
                  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", outline: "none", resize: "vertical", boxSizing: "border-box",
                }}
              />
            </div>
          </SRSectionCard>

          {/* Section 3: 근무 일정 */}
          <SRSectionCard step="3" icon="calendar" title="근무 일정" hint="기본 주간 근무 시간">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {KO_WEEK_SR.map(day => {
                const val = d.schedule[day] ?? "휴무";
                const isOff = val === "휴무" || val === "휴진";
                return (
                  <div key={day} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textAlign: "center", color: day === "토" || day === "일" ? "var(--cinnabar-600)" : "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{day}</div>
                    <select value={isOff ? val : "custom"} onChange={e => {
                      if (e.target.value === "휴무" || e.target.value === "휴진") setScheduleDay(day, e.target.value);
                      else setScheduleDay(day, "09–18");
                    }} style={{
                      fontSize: 11, padding: "4px 6px", border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)", background: "var(--bg-surface)",
                      color: "var(--text-primary)", fontFamily: "var(--font-sans)", outline: "none", cursor: "pointer",
                    }}>
                      <option value="custom">직접 입력</option>
                      <option value="휴무">휴무</option>
                      <option value="휴진">휴진</option>
                    </select>
                    {!isOff && (
                      <input value={val} onChange={e => setScheduleDay(day, e.target.value)}
                        placeholder="09–18"
                        style={{
                          fontSize: 11, padding: "5px 6px", border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)", background: "var(--bg-surface)",
                          color: "var(--text-primary)", fontFamily: "var(--font-mono)",
                          outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center",
                        }}
                      />
                    )}
                    {isOff && (
                      <div style={{ fontSize: 11, padding: "5px 6px", background: "var(--stone-100)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                        {val}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SRSectionCard>

          {/* Section 4: 초기 권한 */}
          <SRSectionCard step="4" icon="shield-check" title="초기 권한 설정" hint={`${d.permissions.length}개 선택됨`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* 권한 세트 프리셋 */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 7 }}>권한 세트</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PERMISSION_PRESETS.map(preset => {
                    const active = preset.perms.length === d.permissions.length &&
                      preset.perms.every(p => d.permissions.includes(p));
                    return (
                      <button key={preset.key} onClick={() => set("permissions", [...preset.perms])} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: "var(--radius-full)",
                        border: `1px solid ${active ? "var(--jade-300)" : "var(--border-default)"}`,
                        background: active ? "var(--jade-100)" : "var(--bg-surface)",
                        color: active ? "var(--jade-700)" : "var(--text-secondary)",
                        fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
                        fontFamily: "var(--font-sans)", transition: "all 0.12s",
                      }}>
                        <Icon name={preset.icon} size={11} />
                        {preset.label}
                        <span style={{ fontSize: 10, color: active ? "var(--jade-600)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {preset.perms.length}
                        </span>
                      </button>
                    );
                  })}
                  <button onClick={() => set("permissions", [])} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-subtle)",
                    background: "transparent", color: "var(--text-muted)",
                    fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>
                    <Icon name="x" size={10} />전체 해제
                  </button>
                </div>
              </div>
              {PERMISSION_GROUPS_SR.map(group => (
                <div key={group.section}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>
                    <Icon name={group.icon} size={10} />{group.section}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                    {group.items.map(p => {
                      const active = d.permissions.includes(p.key);
                      return (
                        <label key={p.key} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                          border: `1px solid ${active ? "var(--jade-200)" : "var(--border-subtle)"}`,
                          background: active ? "var(--jade-50)" : "var(--bg-surface)",
                          borderRadius: "var(--radius-md)", cursor: "pointer",
                        }}>
                          <input type="checkbox" checked={active} onChange={() => togglePermission(p.key)}
                            style={{ accentColor: "var(--jade-500)", cursor: "pointer", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 1 }}>{p.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SRSectionCard>

          {/* Section 5: 급여 */}
          <SRSectionCard step="5" icon="banknote" title="급여 정보">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <SRFieldLabel>급여 유형</SRFieldLabel>
                <SRSegmented options={["월급제","연봉제","시급제"]} value={d.salaryType} onChange={v => set("salaryType", v)} />
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--stone-50)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="lock" size={14} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>급여 금액은 등록 후 원장 권한으로 별도 입력합니다.</span>
            </div>
          </SRSectionCard>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px", background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="info" size={12} />
            {isEdit ? "변경 사항이 즉시 반영됩니다." : "등록 즉시 직원 목록에 추가됩니다."}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, background: "transparent", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            취소
          </button>
          <button
            onClick={() => onSubmit && onSubmit(d)}
            disabled={!allRequired}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              background: allRequired ? "var(--jade-500)" : "var(--stone-300)",
              border: "none", borderRadius: "var(--radius-md)", color: "#fff",
              cursor: allRequired ? "pointer" : "not-allowed",
              fontFamily: "var(--font-sans)",
              display: "inline-flex", alignItems: "center", gap: 6,
              boxShadow: allRequired ? "var(--shadow-sm)" : "none",
            }}>
            <Icon name={isEdit ? "save" : "user-plus"} size={13} />{isEdit ? "수정 완료" : "직원 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NewStaffModal });
