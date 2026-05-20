// 병원 관리 — 편집/추가 모달 모음 + 토스트 시스템
// 실제 데이터 연동 없이 UI 동작만. 저장 시 토스트 피드백.
// 토큰(--*)만 사용. 하드코딩 색상 금지.

const { useState: useStateCE, useEffect: useEffectCE } = React;

// ══════════════════════════════════════════════════════════════
// 토스트
// ══════════════════════════════════════════════════════════════
const TOAST_EVENT = "komes-toast";

function showToast(message, opts = {}) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, ...opts } }));
}

// 시작 → 완료 두 단계 피드백 (동기화/백업 등 실행 액션용)
function toastProgress(startMsg, doneMsg, ms = 1400) {
  showToast(startMsg, { variant: "info", icon: "loader", duration: ms + 300 });
  setTimeout(() => showToast(doneMsg, { variant: "success", icon: "check-circle-2" }), ms);
}

const TOAST_META = {
  success: { bg: "var(--status-success-bg)", border: "var(--status-success-border)", text: "var(--status-success-text)", dot: "var(--brand)" },
  warning: { bg: "var(--status-warning-bg)", border: "var(--status-warning-border)", text: "var(--status-warning-text)", dot: "var(--amber-500)" },
  info:    { bg: "var(--brand-subtle)",      border: "var(--brand-muted)",           text: "var(--text-brand)",         dot: "var(--brand)" },
};

function ClinicToaster() {
  const [toasts, setToasts] = useStateCE([]);
  useEffectCE(() => {
    const onToast = (e) => {
      const id = Date.now() + Math.random();
      const t = { id, variant: "success", ...e.detail };
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), e.detail.duration || 3200);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div style={{
      position: "fixed", right: 20, bottom: 20, zIndex: 300,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map(t => {
        const m = TOAST_META[t.variant] || TOAST_META.success;
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            minWidth: 260, maxWidth: 360,
            padding: "11px 14px",
            background: "var(--bg-surface)",
            border: `1px solid ${m.border}`,
            borderLeft: `3px solid ${m.dot}`,
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            fontFamily: "var(--font-sans)",
            animation: "toast-in 0.22s ease",
            pointerEvents: "auto",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "var(--radius-sm)",
              background: m.bg, color: m.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name={t.icon || "check-circle-2"} size={15} />
            </div>
            <span style={{
              fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500,
              lineHeight: 1.4,
            }}>{t.message}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 공용 모달 셸 (중앙)
// ══════════════════════════════════════════════════════════════
function ModalShell({ open, onClose, icon, title, subtitle, children, footer, maxWidth = 640 }) {
  useEffectCE(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 220,
      background: "var(--bg-overlay)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "var(--font-sans)",
      animation: "ce-fade 0.18s ease",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth, maxHeight: "calc(100vh - 48px)",
        background: "var(--bg-page)",
        borderRadius: "var(--radius-xl)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)",
        animation: "ce-pop 0.2s ease",
      }}>
        <header style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 22px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "var(--radius-md)",
            background: "var(--brand-subtle)", color: "var(--text-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name={icon} size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500,
              color: "var(--text-primary)", letterSpacing: "-0.01em",
            }}>{title}</div>
            {subtitle && (
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>
            )}
          </div>
          <button onClick={onClose} title="닫기" style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)", color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Icon name="x" size={16} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 22px" }}>
          {children}
        </div>

        {footer && (
          <footer style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            gap: 8, padding: "14px 22px",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
          }}>{footer}</footer>
        )}
      </div>
      <style>{`
        @keyframes ce-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ce-pop { from { transform: scale(0.98); opacity: 0.6; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 폼 필드들
// ══════════════════════════════════════════════════════════════
const ceLabelStyle = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "var(--text-muted)",
  fontFamily: "var(--font-sans)", marginBottom: 5, display: "block",
};

function ceInputStyle(mono) {
  return {
    fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
    fontSize: 13, color: "var(--text-primary)",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    padding: "8px 11px", outline: "none",
    width: "100%", boxSizing: "border-box",
  };
}

function CeToggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      style={{
        position: "relative", width: 38, height: 21, padding: 0,
        borderRadius: 999, cursor: "pointer", border: "none",
        background: checked ? "var(--brand)" : "var(--stone-400)",
        transition: "background 0.18s ease", flexShrink: 0,
      }}>
      <span style={{
        position: "absolute", top: 2, left: checked ? 19 : 2,
        width: 17, height: 17, borderRadius: "50%",
        background: "var(--text-on-brand)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.18s ease",
      }} />
    </button>
  );
}

function CeSegment({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => {
        const on = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: "6px 13px", fontSize: 12, fontWeight: on ? 600 : 500,
            borderRadius: "var(--radius-full)",
            background: on ? "var(--brand-subtle)" : "var(--bg-surface)",
            color: on ? "var(--text-brand)" : "var(--text-secondary)",
            border: `1px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function CeField({ field, value, onChange }) {
  const { type, label, hint, placeholder } = field;
  return (
    <div style={{ gridColumn: field.full ? "1 / -1" : undefined, minWidth: 0 }}>
      <label style={ceLabelStyle}>{label}</label>
      {type === "toggle" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 35 }}>
          <CeToggle checked={!!value} onChange={onChange} />
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
            {value ? "활성" : "비활성"}
          </span>
        </div>
      ) : type === "segment" ? (
        <div style={{ paddingTop: 2 }}>
          <CeSegment options={field.options} value={value} onChange={onChange} />
        </div>
      ) : (
        <input
          type={type === "date" ? "date" : type === "number" ? "number" : "text"}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(type === "number" ? e.target.value.replace(/[^0-9]/g, "") : e.target.value)}
          style={ceInputStyle(type === "mono" || type === "date")} />
      )}
      {hint && (
        <span style={{
          fontSize: 11, color: "var(--text-muted)",
          fontFamily: "var(--font-sans)", marginTop: 4, display: "block",
        }}>{hint}</span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 설정 기반 폼 모달
// ══════════════════════════════════════════════════════════════
function ClinicFormModal({ open, onClose, icon, title, subtitle, fields, initial = {}, cols = 2, submitLabel = "저장", toastMsg }) {
  const [form, setForm] = useStateCE({});

  useEffectCE(() => {
    if (!open) return;
    const seed = {};
    fields.forEach(f => {
      seed[f.key] = initial[f.key] !== undefined ? initial[f.key]
                  : f.type === "toggle" ? false
                  : f.type === "segment" ? (f.options ? f.options[0] : "")
                  : "";
    });
    setForm(seed);
  }, [open]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = () => {
    onClose();
    showToast(toastMsg || "저장되었습니다", { variant: "success", icon: "check-circle-2" });
  };

  return (
    <ModalShell open={open} onClose={onClose} icon={icon} title={title} subtitle={subtitle}
      footer={<>
        <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
        <Button variant="primary" size="md" icon="check" onClick={save}>{submitLabel}</Button>
      </>}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "16px 22px",
      }}>
        {fields.map(f => (
          <CeField key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      </div>
    </ModalShell>
  );
}

// ── 필드 스키마 ──────────────────────────────────────────────
const IDENTITY_FIELDS = [
  { key: "name", label: "기관명", type: "text" },
  { key: "englishName", label: "영문명", type: "text" },
  { key: "representative", label: "대표자", type: "text" },
  { key: "bizNumber", label: "사업자 등록번호", type: "mono" },
  { key: "ykiho", label: "요양기관기호", type: "mono", hint: "공단·심평원 청구 식별번호" },
  { key: "established", label: "개원일", type: "date" },
  { key: "phone", label: "대표 전화", type: "mono" },
  { key: "fax", label: "팩스", type: "mono" },
  { key: "email", label: "대표 이메일", type: "text" },
  { key: "postcode", label: "우편번호", type: "mono" },
  { key: "address", label: "주소", type: "text", full: true },
];

const BILLING_FIELDS = [
  { key: "vatRate", label: "부가세율", type: "text" },
  { key: "cardProcessor", label: "카드 결제 대행사", type: "text" },
  { key: "cashReceiptAuto", label: "현금영수증 자동발행", type: "toggle" },
  { key: "taxInvoiceAuto", label: "세금계산서 자동발행", type: "toggle" },
  { key: "bankAccount", label: "대표 계좌", type: "text", full: true },
];

const ROOM_FIELDS = [
  { key: "code", label: "공간 코드", type: "mono", placeholder: "P-03" },
  { key: "name", label: "공간 이름", type: "text", placeholder: "3진료실" },
  { key: "type", label: "유형", type: "segment", options: ["진료", "치료", "조제", "휴게"] },
  { key: "beds", label: "베드 수", type: "number", placeholder: "1" },
  { key: "staff", label: "담당", type: "text", placeholder: "담당자 (선택)", full: true },
  { key: "status", label: "상태", type: "segment", options: ["운영", "점검 중"], full: true },
];

const EQUIPMENT_FIELDS = [
  { key: "code", label: "자산코드", type: "mono", placeholder: "EQ-011" },
  { key: "maker", label: "제조사", type: "text" },
  { key: "name", label: "장비명", type: "text", placeholder: "장비 모델명", full: true },
  { key: "cat", label: "분류", type: "segment", options: ["진단", "침구", "물리", "수기", "조제", "IT"], full: true },
  { key: "room", label: "위치", type: "mono", placeholder: "P-01" },
  { key: "purchased", label: "구매일", type: "date" },
  { key: "warranty", label: "보증 만료", type: "date" },
  { key: "nextCheck", label: "다음 점검", type: "date" },
  { key: "status", label: "상태", type: "segment", options: ["운영", "점검 예정", "수리 중"], full: true },
];

const MATERIAL_FIELDS = [
  { key: "code", label: "코드", type: "mono", placeholder: "P0001011" },
  { key: "name", label: "명칭", type: "text", placeholder: "치료재 명칭" },
  { key: "limit", label: "상한금액 (원)", type: "number", placeholder: "0" },
  { key: "vendor", label: "판매자", type: "text", placeholder: "판매처", full: true },
  { key: "start", label: "적용시작일", type: "date" },
  { key: "end", label: "적용종료일", type: "date" },
  { key: "benefit", label: "선별급여", type: "segment", options: ["본인부담 기본", "선별급여 50%", "선별급여 80%", "비급여"], full: true },
  { key: "inUse", label: "사용 여부", type: "toggle" },
];

const MENU_FIELDS = [
  { key: "code", label: "EDI 코드", type: "mono", placeholder: "AA000 (비급여는 비워둠)" },
  { key: "cat", label: "분류", type: "text", placeholder: "침구 / 물리 / 약침 ..." },
  { key: "name", label: "항목명", type: "text", placeholder: "항목 이름", full: true },
  { key: "price", label: "단가 (원)", type: "number", placeholder: "0" },
  { key: "ins", label: "급여 구분", type: "segment", options: ["급여", "비급여"] },
];

const LICENSE_FIELDS = [
  { key: "name", label: "이름", type: "text" },
  { key: "role", label: "역할", type: "text", placeholder: "한의사 / 부원장 ..." },
  { key: "license", label: "면허번호", type: "text", placeholder: "한의사 면허 제 00000호", full: true },
  { key: "issued", label: "발급일", type: "date" },
  { key: "status", label: "상태", type: "segment", options: ["유효", "만료"] },
  { key: "spec", label: "전문 분야", type: "text", placeholder: "선택", full: true },
];

const BRANCH_FIELDS = [
  { key: "name", label: "분원명", type: "text", placeholder: "솔잎한의원 ○○점", full: true },
  { key: "role", label: "구분", type: "segment", options: ["본점", "분원"] },
  { key: "since", label: "개원 연도", type: "text", placeholder: "2026" },
  { key: "address", label: "주소", type: "text", placeholder: "도로명 주소", full: true },
  { key: "staff", label: "직원 수", type: "number", placeholder: "0" },
  { key: "status", label: "상태", type: "segment", options: ["운영", "개원 준비"] },
];

// ── 섹션별 래퍼 ──────────────────────────────────────────────
function IdentityEditModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="building-2"
    title="한의원 기본 정보 편집"
    subtitle="요양기관 등록과 일치해야 청구 반려를 예방할 수 있습니다"
    fields={IDENTITY_FIELDS} initial={typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : {}}
    submitLabel="변경사항 저장" toastMsg="기본 정보가 저장되었습니다" />;
}

function BillingEditModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="receipt"
    title="결제 · 세금 편집"
    subtitle="수납 화면 결제 옵션과 세금계산서 자동 발행 설정"
    fields={BILLING_FIELDS} initial={typeof BILLING !== "undefined" ? BILLING : {}}
    submitLabel="변경사항 저장" toastMsg="결제·세금 설정이 저장되었습니다" />;
}

function RoomAddModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="door-open"
    title="진료실 · 베드 추가"
    subtitle="예약 캘린더와 액팅 오더에서 사용되는 공간 단위"
    fields={ROOM_FIELDS} submitLabel="공간 추가" toastMsg="새 공간이 추가되었습니다" />;
}

function EquipmentAddModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="cpu"
    title="장비 등록"
    subtitle="진료·조제·IT 장비의 위치, 점검 일정, 보증 관리"
    fields={EQUIPMENT_FIELDS} submitLabel="장비 등록" toastMsg="장비가 등록되었습니다" />;
}

function MaterialAddModal({ open, onClose, initial }) {
  const editing = !!initial;
  return <ClinicFormModal open={open} onClose={onClose} icon="syringe"
    title={editing ? "치료재 수정" : "새 오더 등록"}
    subtitle="보험 치료재 카탈로그 — 상한금액·판매자·적용기간·선별급여"
    fields={MATERIAL_FIELDS} initial={initial}
    submitLabel={editing ? "변경사항 저장" : "치료재 등록"}
    toastMsg={editing ? "치료재가 수정되었습니다" : "치료재가 등록되었습니다"} />;
}

function MenuItemAddModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="list-checks"
    title="진료 과목 · 수가 항목 추가"
    subtitle="청구 시 자동 매핑되는 EDI 코드와 가격"
    fields={MENU_FIELDS} submitLabel="항목 추가" toastMsg="수가 항목이 추가되었습니다" />;
}

function LicenseAddModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="shield-check"
    title="면허 · 자격 추가"
    subtitle="보건소 신고 양식에 자동으로 채워집니다"
    fields={LICENSE_FIELDS} submitLabel="자격 추가" toastMsg="면허·자격이 추가되었습니다" />;
}

function BranchAddModal({ open, onClose }) {
  return <ClinicFormModal open={open} onClose={onClose} icon="git-branch"
    title="분원 추가"
    subtitle="본점·분원 간 환자 차트 공유 및 처방 동기화"
    fields={BRANCH_FIELDS} submitLabel="분원 추가" toastMsg="분원이 추가되었습니다" />;
}

// ══════════════════════════════════════════════════════════════
// 로고 업로드 모달
// ══════════════════════════════════════════════════════════════
function LogoUploadModal({ open, onClose }) {
  const [fileName, setFileName] = useStateCE("");

  useEffectCE(() => { if (open) setFileName(""); }, [open]);

  const pick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/svg+xml,.png,.svg";
    input.onchange = () => { if (input.files && input.files[0]) setFileName(input.files[0].name); };
    input.click();
  };

  const save = () => {
    onClose();
    showToast(fileName ? `로고 "${fileName}" 가 업로드되었습니다` : "로고가 저장되었습니다",
      { variant: "success", icon: "image" });
  };

  return (
    <ModalShell open={open} onClose={onClose} icon="image" maxWidth={520}
      title="로고 업로드"
      subtitle="처방전·진단서·접수증·문자 발신에 사용됩니다"
      footer={<>
        <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
        <Button variant="primary" size="md" icon="upload" onClick={save} disabled={!fileName}>업로드</Button>
      </>}>
      <div onClick={pick} style={{
        aspectRatio: "16 / 9",
        border: `1px dashed ${fileName ? "var(--brand)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
        cursor: "pointer",
        background: fileName ? "var(--brand-subtle)" : "var(--bg-raised)",
        transition: "all 0.15s ease",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "var(--radius-full)",
          background: fileName ? "var(--brand-muted)" : "var(--bg-surface)",
          color: "var(--text-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border-subtle)",
        }}>
          <Icon name={fileName ? "check" : "upload-cloud"} size={24} />
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
          fontFamily: "var(--font-sans)",
        }}>{fileName || "클릭하여 파일 선택"}</div>
        <div style={{
          fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        }}>PNG · SVG · 권장 1:1 또는 가로형 · 최대 2MB</div>
      </div>
      {fileName && (
        <button onClick={(e) => { e.stopPropagation(); setFileName(""); }} style={{
          marginTop: 12, background: "transparent", border: "none",
          color: "var(--text-danger)", cursor: "pointer",
          fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
          display: "inline-flex", alignItems: "center", gap: 5,
        }}>
          <Icon name="x" size={12} /> 선택 취소
        </button>
      )}
    </ModalShell>
  );
}

// ══════════════════════════════════════════════════════════════
// 보험 임의처방 등록/수정 모달 (약재 조합 빌더)
// ══════════════════════════════════════════════════════════════
function PrescriptionRxModal({ open, onClose, initial }) {
  const editing = !!initial;
  const suppliers = typeof RX_SUPPLIERS !== "undefined" ? RX_SUPPLIERS : ["경방신약(주)"];

  const [name, setName] = useStateCE("");
  const [note, setNote] = useStateCE("");
  const [supplier, setSupplier] = useStateCE(suppliers[0]);
  const [herbName, setHerbName] = useStateCE("");
  const [herbQty, setHerbQty] = useStateCE(0);
  const [herbs, setHerbs] = useStateCE([]);

  useEffectCE(() => {
    if (!open) return;
    setName(initial?.name || "");
    setNote(initial?.note || "");
    setHerbs(initial?.herbs ? initial.herbs.map(h => ({ ...h })) : []);
    setSupplier(suppliers[0]);
    setHerbName(""); setHerbQty(0);
  }, [open]);

  const addHerb = () => {
    if (!herbName.trim()) return;
    setHerbs(prev => [...prev, { supplier, name: herbName.trim(), qty: Number(herbQty) || 0 }]);
    setHerbName(""); setHerbQty(0);
  };
  const removeHerb = (i) => setHerbs(prev => prev.filter((_, idx) => idx !== i));

  const save = () => {
    onClose();
    showToast(editing ? "임의처방이 수정되었습니다" : "임의처방이 등록되었습니다",
      { variant: "success", icon: "check-circle-2" });
  };

  const inputStyle = {
    fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)", padding: "8px 11px", outline: "none",
    width: "100%", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--text-muted)",
    fontFamily: "var(--font-sans)", marginBottom: 5, display: "block",
  };
  const stepBtn = {
    width: 30, height: 34, borderRadius: "var(--radius-sm)",
    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
    color: "var(--text-secondary)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  return (
    <ModalShell open={open} onClose={onClose} icon="pill"
      title={editing ? "임의처방 수정" : "새 임의처방 등록"}
      subtitle="원내 조제용 보험 한약 처방 — 약재를 조합해 등록합니다"
      footer={<>
        <Button variant="secondary" size="md" onClick={onClose}>닫기</Button>
        <Button variant="primary" size="md" icon="check" onClick={save}>{editing ? "변경사항 저장" : "등록"}</Button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 22px" }}>
        <div>
          <label style={labelStyle}>임의처방명</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 작약감초탕" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>비고</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="선택" style={inputStyle} />
        </div>
      </div>

      {/* 약재 추가 줄 */}
      <div style={{ marginTop: 18 }}>
        <label style={labelStyle}>약재 추가</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)}
            style={{ ...inputStyle, width: 150, cursor: "pointer" }}>
            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={herbName} onChange={(e) => setHerbName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addHerb(); }}
            placeholder="약재명 입력" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
          <button onClick={() => setHerbQty(q => Math.max(0, (Number(q) || 0) - 1))} style={stepBtn} title="감소">
            <Icon name="minus" size={14} />
          </button>
          <input value={herbQty} onChange={(e) => setHerbQty(e.target.value.replace(/[^0-9]/g, ""))}
            style={{ ...inputStyle, width: 56, textAlign: "center", fontFamily: "var(--font-mono)" }} />
          <button onClick={() => setHerbQty(q => (Number(q) || 0) + 1)} style={stepBtn} title="증가">
            <Icon name="plus" size={14} />
          </button>
          <Button variant="secondary" size="md" onClick={addHerb}>추가</Button>
        </div>
      </div>

      {/* 약재 목록 */}
      <div style={{ marginTop: 14 }}>
        {herbs.length === 0 ? (
          <div style={{
            padding: "20px 16px", textAlign: "center",
            color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-sans)",
            background: "var(--bg-surface)", border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)",
          }}>추가된 약재가 없습니다. 위에서 약재를 검색해 추가하세요.</div>
        ) : (
          <div style={{
            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden",
          }}>
            {herbs.map((h, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "150px 1fr auto auto",
                gap: 10, alignItems: "center", padding: "9px 12px",
                borderBottom: i < herbs.length - 1 ? "1px solid var(--border-subtle)" : "none",
                background: i % 2 ? "var(--bg-raised)" : "var(--bg-surface)",
              }}>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{h.supplier}</span>
                <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>{h.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-secondary)" }}>{h.qty}g</span>
                <button onClick={() => removeHerb(i)} title="삭제" style={{
                  width: 26, height: 26, borderRadius: "var(--radius-sm)",
                  background: "transparent", color: "var(--text-danger)", border: "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <Icon name="trash-2" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

Object.assign(window, {
  showToast, toastProgress, ClinicToaster,
  IdentityEditModal, BillingEditModal, RoomAddModal, EquipmentAddModal, MaterialAddModal,
  MenuItemAddModal, LicenseAddModal, BranchAddModal, LogoUploadModal, PrescriptionRxModal,
});
