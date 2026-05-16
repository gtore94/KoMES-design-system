// KoMES — New Patient Registration Modal
const { useState: useStateNP } = React;

const initialNP = {
  // 기본
  name: "", nameHanja: "", gender: "여", birth: "", rrnTail: "",
  phone: "", phone2: "",
  postcode: "", address: "", addressDetail: "",
  // 진료
  visitType: "초진", referrer: "", chief: "",
  category: "내과", room: "진료실 1", attendingDoctor: "김민준 원장",
  // 보험
  insuranceType: "건강보험", insuranceNo: "", relation: "본인",
  // 태그
  tags: [],
  // 관계도 (가족 / 지인 소개)
  relations: [],
  newRelType: "배우자", newRelName: "", newRelPhone: "",
  // 메모
  memo: "",
  // 동의
  agreePrivacy: false, agreeMarketing: false, agreeSMS: true,
};

const TAG_OPTIONS = [
  { key: "VIP",     icon: "crown",      bg: "var(--status-warning-bg)",   color: "var(--amber-700)",   border: "var(--amber-200)" },
  { key: "임신부",  icon: "baby",       bg: "var(--status-danger-bg)", color: "var(--cinnabar-700)", border: "var(--cinnabar-200)" },
  { key: "알러지",  icon: "alert-triangle", bg: "var(--status-danger-bg)", color: "var(--cinnabar-700)", border: "var(--cinnabar-200)" },
  { key: "보호자",  icon: "users",      bg: "var(--stone-200)",    color: "var(--ink-600)",      border: "var(--stone-300)" },
  { key: "노인",    icon: "user",       bg: "var(--stone-200)",    color: "var(--ink-600)",      border: "var(--stone-300)" },
  { key: "소아",    icon: "smile",      bg: "var(--brand-muted)",     color: "var(--jade-700)",     border: "var(--jade-200)" },
  { key: "산정특례",icon: "shield-check", bg: "var(--brand-muted)",   color: "var(--jade-700)",     border: "var(--jade-200)" },
  { key: "연예인",  icon: "star",       bg: "var(--status-danger-bg)", color: "var(--cinnabar-700)", border: "var(--cinnabar-200)" },
];

function FieldLabel({ children, required, hint }) {
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

function TextField({ value, onChange, placeholder, mono, suffix, prefix, type = "text", disabled, monoMid }) {
  const [focused, setFocused] = useStateNP(false);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: disabled ? "var(--bg-raised)" : "var(--bg-surface)",
      border: `1px solid ${focused ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focused ? "0 0 0 3px var(--jade-100)" : "none",
      transition: "all 0.12s",
      paddingRight: suffix ? 10 : 0,
      paddingLeft: prefix ? 10 : 0,
    }}>
      {prefix && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginRight: 6 }}>{prefix}</span>}
      <input type={type} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1, border: "none", background: "transparent",
          padding: "8px 10px", fontSize: 13, outline: "none",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          color: "var(--text-primary)",
          textAlign: monoMid ? "center" : "left",
          minWidth: 0,
        }}
      />
      {suffix && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{suffix}</span>}
    </div>
  );
}

function SegmentedSelect({ options, value, onChange }) {
  return (
    <div style={{
      display: "inline-flex",
      background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)", padding: 2, gap: 2,
    }}>
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

function SelectField({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "8px 32px 8px 10px", fontSize: 13,
        fontFamily: "var(--font-sans)", color: "var(--text-primary)",
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", appearance: "none", cursor: "pointer",
        outline: "none",
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
        <Icon name="chevron-down" size={14} />
      </span>
    </div>
  );
}

function SectionCard({ icon, title, hint, children, step }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 18px", borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-raised)",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "var(--brand-muted)", color: "var(--jade-700)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
        }}>{step}</div>
        <Icon name={icon} size={15} style={{ color: "var(--jade-600)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
          {title}
        </span>
        {hint && (
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

function NewPatientModal({ onClose, onSubmit }) {
  const [d, setD] = useStateNP(initialNP);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const toggleTag = (tag) => {
    setD(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const required = ["name", "birth", "phone"];
  const filled = required.filter(k => d[k]).length;
  const allRequired = filled === required.length && d.agreePrivacy;

  const computedAge = (() => {
    if (!d.birth || d.birth.length < 6) return null;
    let y = parseInt(d.birth.slice(0, 2), 10);
    if (isNaN(y)) return null;
    const tail = d.rrnTail?.[0];
    if (tail === "1" || tail === "2" || tail === "5" || tail === "6") y += 1900;
    else y += 2000;
    const now = new Date();
    let age = now.getFullYear() - y;
    return age >= 0 && age < 130 ? age : null;
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
        background: "var(--bg-page)",
        borderRadius: "var(--radius-xl)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 22px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "var(--radius-md)",
            background: "var(--brand-muted)", color: "var(--jade-700)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="user-plus" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              신규 환자 등록
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              필수 항목 {filled}/{required.length} 입력됨 · 등록 후 즉시 진료 대기열에 추가됩니다
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
            <button style={iconBtn} title="이전 환자에서 복사">
              <Icon name="copy" size={14} />
            </button>
            <button style={iconBtn} title="가져오기">
              <Icon name="download" size={14} />
            </button>
            <button onClick={onClose} style={{ ...iconBtn, marginLeft: 4 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Section 1: Basic info */}
          <SectionCard step="1" icon="user" title="기본 정보" hint="환자 본인 확인용">
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
              <div>
                <FieldLabel required>이름</FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 8 }}>
                  <TextField value={d.name} onChange={v => set("name", v)} placeholder="홍길동" />
                  <TextField value={d.nameHanja} onChange={v => set("nameHanja", v)} placeholder="한자 (선택)" />
                </div>
              </div>
              <div>
                <FieldLabel required>성별</FieldLabel>
                <SegmentedSelect options={["여", "남", "기타"]} value={d.gender} onChange={v => set("gender", v)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <FieldLabel required hint={computedAge != null ? `만 ${computedAge}세` : ""}>주민등록번호</FieldLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 14px 1fr", alignItems: "center", gap: 6 }}>
                  <TextField value={d.birth} onChange={v => set("birth", v.replace(/[^0-9]/g, "").slice(0,6))} placeholder="900101" mono monoMid />
                  <span style={{ textAlign: "center", color: "var(--text-muted)" }}>-</span>
                  <TextField value={d.rrnTail} onChange={v => set("rrnTail", v.replace(/[^0-9*]/g, "").slice(0,7))} placeholder="*******" mono monoMid />
                </div>
              </div>
              <div>
                <FieldLabel required>휴대폰</FieldLabel>
                <TextField value={d.phone} onChange={v => set("phone", v)} placeholder="010-0000-0000" mono />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1.4fr", gap: 8, marginTop: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FieldLabel>주소</FieldLabel>
              </div>
              <TextField value={d.postcode} onChange={v => set("postcode", v)} placeholder="우편번호" mono />
              <TextField value={d.address} onChange={v => set("address", v)} placeholder="기본 주소" />
              <TextField value={d.addressDetail} onChange={v => set("addressDetail", v)} placeholder="상세 주소" />
            </div>
          </SectionCard>

          {/* Section 2: Visit info */}
          <SectionCard step="2" icon="stethoscope" title="진료 정보">
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
              <div>
                <FieldLabel>방문 구분</FieldLabel>
                <SegmentedSelect options={["초진", "재진"]} value={d.visitType} onChange={v => set("visitType", v)} />
              </div>
              <div>
                <FieldLabel>소개 경로</FieldLabel>
                <SelectField value={d.referrer} onChange={v => set("referrer", v)}
                  options={["", "직접 방문", "지인 소개", "검색", "SNS", "방송", "기타"]} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <FieldLabel>진료 분류</FieldLabel>
                <SelectField value={d.category} onChange={v => set("category", v)}
                  options={["내과", "부인과", "침구과", "재활/통증", "체질/한방"]} />
              </div>
              <div>
                <FieldLabel>진료실</FieldLabel>
                <SelectField value={d.room} onChange={v => set("room", v)}
                  options={["진료실 1", "진료실 2", "치료실 A", "치료실 B"]} />
              </div>
              <div>
                <FieldLabel>담당의</FieldLabel>
                <SelectField value={d.attendingDoctor} onChange={v => set("attendingDoctor", v)}
                  options={["김민준 원장", "이지영 원장", "박서윤 부원장"]} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <FieldLabel>주소증 / 내원 사유</FieldLabel>
              <textarea value={d.chief} onChange={e => set("chief", e.target.value)}
                placeholder="예: 어깨 결림 3주, 야간 통증 동반"
                style={{
                  width: "100%", minHeight: 64, padding: "9px 11px",
                  fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--text-primary)",
                  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
                }}
              />
            </div>
          </SectionCard>

          {/* Section 3: Insurance */}
          <SectionCard step="3" icon="shield" title="보험 정보">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 14 }}>
              <div>
                <FieldLabel>보험 종류</FieldLabel>
                <SegmentedSelect options={["건강보험", "의료급여", "산재", "자보"]} value={d.insuranceType} onChange={v => set("insuranceType", v)} />
              </div>
              <div>
                <FieldLabel>증번호</FieldLabel>
                <TextField value={d.insuranceNo} onChange={v => set("insuranceNo", v)} placeholder="00000000" mono />
              </div>
              <div>
                <FieldLabel>관계</FieldLabel>
                <SelectField value={d.relation} onChange={v => set("relation", v)}
                  options={["본인", "배우자", "자녀", "부모", "기타"]} />
              </div>
            </div>
            <div style={{
              marginTop: 12, padding: "10px 12px",
              background: "var(--brand-subtle)", borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", gap: 10,
              border: "1px solid var(--jade-100)",
            }}>
              <Icon name="check-circle-2" size={14} style={{ color: "var(--jade-600)" }} />
              <span style={{ fontSize: 12, color: "var(--jade-700)", flex: 1 }}>
                건강보험공단 자격 자동 조회가 가능합니다.
              </span>
              <button style={{
                fontSize: 11, fontWeight: 600, color: "var(--jade-700)",
                background: "var(--bg-surface)", border: "1px solid var(--jade-200)",
                borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}>자격 조회</button>
            </div>
          </SectionCard>

          {/* Section 3.5: Relations */}
          <SectionCard step="4" icon="share-2" title="가족 / 지인 관계" hint="선택 항목">
            <FieldLabel>등록된 환자와의 관계</FieldLabel>

            {d.relations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {d.relations.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--brand-muted)", color: "var(--jade-700)",
                      border: "1px solid var(--jade-200)", fontFamily: "var(--font-sans)",
                    }}>{r.type}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{r.name}</div>
                      {r.phone && <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.phone}</div>}
                    </div>
                    <button onClick={() => set("relations", d.relations.filter((_, j) => j !== i))} style={{
                      width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-muted)",
                    }}>
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr auto", gap: 6, alignItems: "center" }}>
              <select value={d.newRelType} onChange={e => set("newRelType", e.target.value)} style={{
                fontSize: 12, padding: "8px 10px",
                border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)", color: "var(--text-primary)",
                fontFamily: "var(--font-sans)", outline: "none", cursor: "pointer", height: 36,
              }}>
                {["배우자","부모","자녀","형제자매","친구","지인","지인 소개","직장 동료","기타"].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
              <input value={d.newRelName} onChange={e => set("newRelName", e.target.value)}
                placeholder="이름"
                style={{
                  fontSize: 13, padding: "8px 11px", height: 36,
                  border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)", color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)", outline: "none",
                }}
              />
              <input value={d.newRelPhone} onChange={e => set("newRelPhone", e.target.value)}
                placeholder="연락처 (선택)"
                style={{
                  fontSize: 13, padding: "8px 11px", height: 36,
                  border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)", color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)", outline: "none",
                }}
              />
              <button onClick={() => {
                if (!d.newRelName.trim()) return;
                setD(prev => ({
                  ...prev,
                  relations: [...prev.relations, { type: prev.newRelType, name: prev.newRelName.trim(), phone: prev.newRelPhone.trim() }],
                  newRelName: "", newRelPhone: "",
                }));
              }} style={{
                height: 36, padding: "0 14px",
                background: "var(--jade-500)", color: "#fff",
                border: "none", borderRadius: "var(--radius-md)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <Icon name="plus" size={12} />추가
              </button>
            </div>

            <div style={{
              marginTop: 10, padding: "8px 11px",
              background: "var(--brand-subtle)", border: "1px dashed var(--jade-200)",
              borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, color: "var(--jade-700)", fontFamily: "var(--font-sans)",
            }}>
              <Icon name="info" size={12} />
              가족 단위 관리가 가능합니다 — 등록된 환자와의 관계를 입력하면 양측 차트에 자동 반영됩니다.
            </div>
          </SectionCard>

          {/* Section 5: Tags + Memo */}
          <SectionCard step="5" icon="tag" title="태그 및 메모" hint="선택 항목">
            <FieldLabel>주의 태그</FieldLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {TAG_OPTIONS.map(tag => {
                const active = d.tags.includes(tag.key);
                return (
                  <button key={tag.key} onClick={() => toggleTag(tag.key)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 11px", borderRadius: "var(--radius-full)",
                    border: `1px solid ${active ? tag.border : "var(--border-subtle)"}`,
                    background: active ? tag.bg : "var(--bg-surface)",
                    color: active ? tag.color : "var(--text-muted)",
                    fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
                    fontFamily: "var(--font-sans)", transition: "all 0.12s",
                  }}>
                    <Icon name={tag.icon} size={11} />
                    {tag.key}
                  </button>
                );
              })}
            </div>

            <FieldLabel>특이사항 / 메모</FieldLabel>
            <textarea value={d.memo} onChange={e => set("memo", e.target.value)}
              placeholder="예: 페니실린 알러지, 임신 14주차"
              style={{
                width: "100%", minHeight: 60, padding: "9px 11px",
                fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--text-primary)",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", outline: "none", resize: "vertical",
              }}
            />
          </SectionCard>

          {/* Section 6: Consents */}
          <SectionCard step="6" icon="file-check" title="동의 항목">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { k: "agreePrivacy",   l: "개인정보 수집 및 이용 동의", req: true,
                  d: "진료 목적의 개인정보 수집·이용에 동의합니다." },
                { k: "agreeSMS",       l: "예약 안내 SMS 수신 동의", req: false,
                  d: "예약·접수 관련 알림을 문자로 받습니다." },
                { k: "agreeMarketing", l: "마케팅 활용 동의", req: false,
                  d: "이벤트·프로모션 정보 수신에 동의합니다." },
              ].map(c => (
                <label key={c.k} style={{
                  display: "flex", gap: 10, padding: "10px 12px",
                  background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                }}>
                  <input type="checkbox" checked={d[c.k]} onChange={e => set(c.k, e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--jade-500)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
                      {c.l} {c.req && <span style={{ color: "var(--cinnabar-600)" }}>(필수)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.d}</div>
                  </div>
                  <Icon name="chevron-right" size={13} style={{ color: "var(--text-muted)", marginTop: 4 }} />
                </label>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="info" size={12} />
            등록 즉시 진료 대기열로 이동합니다.
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 500,
            background: "transparent", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>취소</button>
          <button style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 500,
            background: "var(--bg-surface)", border: "1px solid var(--jade-300)",
            borderRadius: "var(--radius-md)", color: "var(--jade-700)",
            cursor: "pointer", fontFamily: "var(--font-sans)",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <Icon name="save" size={13} />임시 저장
          </button>
          <button onClick={() => onSubmit && onSubmit(d)}
            disabled={!allRequired}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              background: allRequired ? "var(--jade-500)" : "var(--stone-300)",
              border: "none", borderRadius: "var(--radius-md)",
              color: "#fff",
              cursor: allRequired ? "pointer" : "not-allowed",
              fontFamily: "var(--font-sans)",
              display: "inline-flex", alignItems: "center", gap: 6,
              boxShadow: allRequired ? "var(--shadow-sm)" : "none",
            }}>
            <Icon name="user-plus" size={13} />등록 후 접수
          </button>
        </div>
      </div>
    </div>
  );
}

const iconBtn = {
  width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)",
};

Object.assign(window, { NewPatientModal });
