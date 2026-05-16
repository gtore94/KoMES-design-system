// KoMES — Medical Forms Output Screen (서식 출력)
// 진단서 (Medical Certificate) 완성, 나머지 탭은 placeholder.
// 좌측: A4 미리보기 (의료법 시행규칙 별지 제5호의2서식)
// 우측: 입력 패널 + 발급 이력

const { useState: useStateMF, useMemo: useMemoMF, useRef: useRefMF, useEffect: useEffectMF } = React;

// ── Sample fixture ──────────────────────────────────────────────
// 기본 환자는 PatientPickerData의 첫 환자(박지영)와 동기화됨
const MF_PATIENT = {
  id: 1,
  name: "박지영",
  rrn: "850523-2******",
  rrnFull: "850523-2123456",
  address: "서울특별시 강남구 테헤란로 123, 405동 1502호",
  phone: "010-3421-9087",
  chartNo: "00012483",
};

const MF_CLINIC = {
  name: "자생한의원 강남점",
  address: "서울특별시 강남구 테헤란로 215, 4층",
  license: "12345",
  doctorRole: "han", // doc | dent | han
  doctorName: "김민준",
};

const MF_DEFAULT_DX = {
  registry: "00012483",
  serial: "2026-0042",
  judgment: "clinical", // clinical | final
  mainDx: "경추의 염좌 및 긴장",
  subDx: "경부통",
  icdCodes: "S13.4, M54.2",
  onsetDate: "2026-04-05",
  diagnosisDate: "2026-04-10",
  treatment:
    "한방 치료(체침·부항·온열 치료) 및 한약 처방을 2026년 4월 10일부터 시행 중이며,\n경추 가동성 회복 및 통증 감소 위해 향후 약 4주간 주 2회 통원 치료가 필요할 것으로 사료됨.\n증상 호전 정도에 따라 치료 기간은 조정될 수 있음.",
  admitDate: "",
  dischargeDate: "",
  purpose: "보험 청구용",
  remarks: "본 진단서는 보험 청구 목적으로 발급되었으며, 환자 본인 요청에 의해 작성됨.",
  issueDate: "2026-05-16",
};

const MF_HISTORY = [
  { id: "F-2026-0041", type: "진단서", patient: "박지영", date: "2026-04-22", purpose: "보험 청구용", status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0038", type: "통원확인서", patient: "박지영", date: "2026-04-10", purpose: "회사 제출",    status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0033", type: "소견서", patient: "이수민", date: "2026-04-04", purpose: "타병원 의뢰",  status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0029", type: "진단서", patient: "최영호", date: "2026-03-28", purpose: "법원 제출",    status: "발급완료", issuedBy: "김민준" },
];

const MF_TABS = [
  { key: "diagnosis",        label: "진단서",        active: true,  desc: "의료법 시행규칙 별지 제5호의2서식" },
  { key: "injury",           label: "상해진단서",     active: false, desc: "의료법 시행규칙 별지 제5호의3서식" },
  { key: "opinion",          label: "소견서",        active: false, desc: "진료 소견에 관한 의사 의견서" },
  { key: "treatment_proof",  label: "진료확인서",     active: false, desc: "내원·진료 사실 확인" },
  { key: "admission_proof",  label: "입퇴원확인서",   active: false, desc: "입원/퇴원 일자 확인" },
  { key: "outpatient_proof", label: "통원확인서",     active: false, desc: "통원 일자 및 횟수 확인" },
];

// ── Utility: format date ─────────────────────────────────────────
const splitYMD = (s) => {
  if (!s) return { y: "", m: "", d: "" };
  const [y, m, d] = s.split("-");
  return { y: y || "", m: (m || "").replace(/^0/, ""), d: (d || "").replace(/^0/, "") };
};

// ── A4 Preview — 진단서 ───────────────────────────────────────────
function DiagnosisPreviewA4({ data, clinic, patient }) {
  const onset = splitYMD(data.onsetDate);
  const dx    = splitYMD(data.diagnosisDate);
  const adm   = splitYMD(data.admitDate);
  const dis   = splitYMD(data.dischargeDate);
  const iss   = splitYMD(data.issueDate);

  const Chk = ({ on }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 13, height: 13, border: "1.2px solid #111", marginRight: 4,
      fontSize: 11, lineHeight: 1, fontFamily: "var(--font-serif)",
      verticalAlign: "middle",
    }}>{on ? "√" : ""}</span>
  );

  const td = {
    padding: "6px 8px", borderBottom: "1px solid #111", borderRight: "1px solid #111",
    fontSize: 11.5, verticalAlign: "middle", color: "#111", lineHeight: 1.55,
  };
  const lh = { // label header (left column shaded)
    ...td, background: "#F2EFE8", textAlign: "center", fontWeight: 500,
    width: 110, color: "#1C2B2B",
  };
  const lhWide = { ...lh, width: 130 };

  return (
    <div className="a4-paper" style={{
      width: 794, minHeight: 1123, background: "white", color: "#111",
      padding: "42px 56px 36px", fontFamily: "var(--font-sans)",
      boxShadow: "0 12px 40px rgba(17, 30, 28, 0.15), 0 2px 8px rgba(17,30,28,0.08)",
      position: "relative",
    }}>
      {/* Top meta strip */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: 10, color: "#1C2B2B", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "#111" }}></span>
          <span>의료법 시행규칙 [별지 제5호의2서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "#3A4F4C" }}>&lt;개정 2019. 9. 27.&gt;</div>
      </div>

      {/* Title */}
      <div style={{
        textAlign: "center", fontFamily: "var(--font-serif)",
        fontSize: 30, fontWeight: 600, letterSpacing: "1.2em",
        margin: "26px 0 22px", paddingLeft: "1.2em", color: "#0E1A18",
      }}>진 단 서</div>

      {/* Registry strip */}
      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 0,
        marginBottom: 6, fontSize: 10.5, color: "#1C2B2B",
      }}>
        <div style={{ border: "1px solid #111", borderRight: "none", padding: "4px 10px", background: "#F2EFE8", fontWeight: 500 }}>등록번호</div>
        <div style={{ border: "1px solid #111", padding: "4px 14px", minWidth: 130, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.registry || "\u00A0"}</div>
        <div style={{ border: "1px solid #111", borderLeft: "none", padding: "4px 10px", background: "#F2EFE8", fontWeight: 500 }}>연번호</div>
        <div style={{ border: "1px solid #111", borderLeft: "none", padding: "4px 14px", minWidth: 110, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.serial || "\u00A0"}</div>
      </div>

      {/* Main table */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid #111", borderLeft: "1px solid #111", marginBottom: 18 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>환자의<br/>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address} &nbsp;&nbsp;<span style={{ color: "#3A4F4C" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh} rowSpan={2}>병 &nbsp;명</td>
            <td style={{ ...td, borderRight: "1px solid #111", paddingTop: 8, paddingBottom: 8 }}>
              <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
                <span><Chk on={data.judgment === "clinical"} /> 임상적 추정</span>
                <span><Chk on={data.judgment === "final"} /> 최 종 진 단</span>
              </div>
            </td>
            <td style={lh}>(주 질병ㆍ부상)</td>
            <td style={td}>{data.mainDx}</td>
          </tr>
          <tr>
            <td style={td}>&nbsp;</td>
            <td style={lh}>(부 질병ㆍ부상)</td>
            <td style={td}>{data.subDx || "\u00A0"}</td>
          </tr>
          <tr>
            <td style={lh}>질병분류기호</td>
            <td colSpan={3} style={{ ...td, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>발병 연월일</td>
            <td style={td}>
              <span style={{ fontFamily: "var(--font-mono)" }}>{onset.y || "____"}</span> 년&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{onset.m || "__"}</span> 월&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{onset.d || "__"}</span> 일
            </td>
            <td style={lh}>진단 연월일</td>
            <td style={td}>
              <span style={{ fontFamily: "var(--font-mono)" }}>{dx.y || "____"}</span> 년&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{dx.m || "__"}</span> 월&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{dx.d || "__"}</span> 일
            </td>
          </tr>
          <tr>
            <td style={lh}>치료 내용 및 향후<br/>치료에 대한 소견</td>
            <td colSpan={3} style={{ ...td, whiteSpace: "pre-wrap", minHeight: 96, height: 96, verticalAlign: "top", paddingTop: 8 }}>
              {data.treatment}
            </td>
          </tr>
          <tr>
            <td style={lh}>입원ㆍ퇴원<br/>연월일</td>
            <td colSpan={3} style={td}>
              <span>입원일: </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{adm.y || "____"}</span> 년&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{adm.m || "__"}</span> 월&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{adm.d || "__"}</span> 일부터&nbsp;&nbsp;&nbsp;
              <span>퇴원일: </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{dis.y || "____"}</span> 년&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{dis.m || "__"}</span> 월&nbsp;
              <span style={{ fontFamily: "var(--font-mono)" }}>{dis.d || "__"}</span> 일까지
            </td>
          </tr>
          <tr>
            <td style={lh}>용 &nbsp;도</td>
            <td colSpan={3} style={td}>{data.purpose}</td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid #111" }}>비 &nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid #111", minHeight: 36, whiteSpace: "pre-wrap" }}>{data.remarks || "\u00A0"}</td>
          </tr>
        </tbody>
      </table>

      {/* Certification statement */}
      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "#0E1A18", marginBottom: 18 }}>
        「의료법」 제17조 및 같은 법 시행규칙 제9조제1항에 따라 위와 같이 진단합니다.
      </div>

      {/* Date line */}
      <div style={{ textAlign: "center", fontSize: 13, margin: "6px 0 20px", letterSpacing: "0.04em" }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.y || "____"}</span> 년&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.m || "__"}</span> 월&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.d || "__"}</span> 일
      </div>

      {/* Issuer block */}
      <div style={{ fontSize: 12, lineHeight: 2.1, color: "#0E1A18", paddingLeft: 4 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "#1C2B2B" }}>의료기관 명칭:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid #111", paddingBottom: 2 }}>{clinic.name}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "#1C2B2B" }}>주소:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid #111", paddingBottom: 2 }}>{clinic.address}</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Chk on={clinic.doctorRole === "doc"} />의사
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Chk on={clinic.doctorRole === "dent"} />치과의사
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Chk on={clinic.doctorRole === "han"} />한의사
          </span>
          <span style={{ marginLeft: 12 }}>면허번호&nbsp;&nbsp;제&nbsp;
            <span style={{ fontFamily: "var(--font-mono)", borderBottom: "0.7px solid #111", padding: "0 14px" }}>{clinic.license}</span>
            &nbsp;호
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}>
          <span style={{ minWidth: 92, color: "#1C2B2B" }}>성 &nbsp;명:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid #111", paddingBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500 }}>{clinic.doctorName}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#3A4F4C", fontSize: 11 }}>(서명 또는 인)</span>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, border: "2px solid #B03028", borderRadius: "50%",
                color: "#B03028", fontFamily: "var(--font-serif)", fontWeight: 700,
                fontSize: 13, letterSpacing: "-0.05em",
              }}>{clinic.doctorName[0]}印</span>
            </span>
          </span>
        </div>
      </div>

      {/* Writer guide footer */}
      <div style={{
        marginTop: 32, paddingTop: 12, borderTop: "0.5px solid #777",
        fontSize: 9, lineHeight: 1.6, color: "#3A4F4C",
      }}>
        <div style={{ fontWeight: 600, color: "#1C2B2B", marginBottom: 4, letterSpacing: "0.3em", textAlign: "center" }}>작 성 방 법</div>
        <div style={{ display: "flex", gap: 4 }}>
          <span>1.</span>
          <span>환자의 인적사항은 진찰한 의사, 치과의사 또는 한의사가 주민등록증, 기간 만료 전 여권, 운전면허증, 공무원증, 국립ㆍ공립대학 학생증, 군무원증, 건강보험증, 외국인등록증 등 국가공인 신분증(환자가 미성년자인 경우에는 주민등록등본ㆍ초본, 학생증 등으로 대체 가능합니다)과 대조하여 확인하고 서명 또는 날인합니다.</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
          <span>2.</span>
          <span>"병명"란에는 "임상적 추정"과 "최종진단" 중 택일하여 [ ]에 √ 표시를 하고, 질병명은 한글로 적되 영어로 적을 경우에는 한글을 함께 적으며, 질병분류기호도 함께 적습니다.</span>
        </div>
      </div>

      <div style={{
        position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "#6B7E7B",
      }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── Placeholder Preview (for other tabs) ─────────────────────────
function PlaceholderPreviewA4({ label, desc }) {
  return (
    <div style={{
      width: 794, minHeight: 1123, background: "white", color: "#111",
      padding: 56, fontFamily: "var(--font-sans)",
      boxShadow: "0 12px 40px rgba(17, 30, 28, 0.15), 0 2px 8px rgba(17,30,28,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%", border: "1.5px dashed var(--ink-300)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
      }}>
        <Icon name="file-text" size={26} style={{ color: "var(--ink-400)" }} />
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink-700)", letterSpacing: "0.4em", paddingLeft: "0.4em" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{desc}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 36, padding: "8px 16px", border: "1px solid var(--border-subtle)", borderRadius: 999, background: "var(--stone-50)" }}>
        템플릿 준비 중 · 진단서 양식 우선 출시
      </div>
    </div>
  );
}

// ── Editor Panel Components ──────────────────────────────────────
function PanelSection({ title, hint, children, right }) {
  return (
    <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-500)" }}>{title}</div>
        {right}
      </div>
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.6 }}>{hint}</div>}
      {children}
    </div>
  );
}

function MiniField({ label, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const fieldInput = {
  fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--text-primary)",
  background: "var(--bg-surface)", border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)", padding: "6px 9px", outline: "none", width: "100%",
};

function TextField({ value, onChange, placeholder, mono, type = "text" }) {
  return <input
    type={type}
    value={value || ""}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    style={{ ...fieldInput, fontFamily: mono ? "var(--font-mono)" : fieldInput.fontFamily }}
  />;
}

function TextArea({ value, onChange, rows = 4, placeholder }) {
  return <textarea
    rows={rows}
    value={value || ""}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    style={{ ...fieldInput, resize: "vertical", lineHeight: 1.55 }}
  />;
}

function RadioPills({ options, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--bg-raised)", borderRadius: "var(--radius-md)", padding: 3, border: "1px solid var(--border-subtle)" }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          border: "none", padding: "6px 12px", borderRadius: "var(--radius-sm)",
          fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500,
          cursor: "pointer",
          background: value === o.value ? "var(--bg-surface)" : "transparent",
          color: value === o.value ? "var(--text-primary)" : "var(--text-secondary)",
          boxShadow: value === o.value ? "var(--shadow-sm)" : "none",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── Editor Panel — 진단서 ────────────────────────────────────────
function DiagnosisEditor({ data, onChange, clinic, patient, onChangePatient }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Patient context (read-only, auto-fetched) */}
      <PanelSection
        title="환자 정보"
        right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--jade-700)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
          <Icon name="arrow-left-right" size={11} /> 환자 변경
        </button>}
      >
        <div style={{
          display: "flex", gap: 12, padding: "10px 12px", background: "var(--jade-50)",
          border: "1px solid var(--jade-200)", borderRadius: "var(--radius-md)",
        }}>
          <Avatar name={patient.name} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>차트번호 {patient.chartNo} · {patient.phone}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>{patient.address}</div>
          </div>
        </div>
      </PanelSection>

      {/* Issue identifiers */}
      <PanelSection title="발급 식별">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="등록번호"><TextField value={data.registry} onChange={set("registry")} mono /></MiniField>
          <MiniField label="연번호"><TextField value={data.serial} onChange={set("serial")} mono /></MiniField>
          <MiniField label="발급일자"><TextField value={data.issueDate} onChange={set("issueDate")} type="date" mono /></MiniField>
          <MiniField label="용도">
            <select value={data.purpose} onChange={(e) => set("purpose")(e.target.value)} style={{ ...fieldInput, paddingRight: 26, appearance: "none", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A5E5B' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
              <option>보험 청구용</option>
              <option>회사 제출용</option>
              <option>학교 제출용</option>
              <option>법원/관공서 제출용</option>
              <option>본인 보관용</option>
              <option>기타</option>
            </select>
          </MiniField>
        </div>
      </PanelSection>

      {/* Diagnosis */}
      <PanelSection title="진단 정보">
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>진단 구분</div>
          <RadioPills
            value={data.judgment}
            onChange={set("judgment")}
            options={[{ value: "clinical", label: "임상적 추정" }, { value: "final", label: "최종 진단" }]}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="주 질병ㆍ부상">
            <TextField value={data.mainDx} onChange={set("mainDx")} placeholder="예: 경추의 염좌 및 긴장" />
          </MiniField>
          <MiniField label="부 질병ㆍ부상 (선택)">
            <TextField value={data.subDx} onChange={set("subDx")} placeholder="예: 경부통" />
          </MiniField>
          <MiniField label="질병분류기호 (KCD)">
            <div style={{ position: "relative" }}>
              <TextField value={data.icdCodes} onChange={set("icdCodes")} mono placeholder="S13.4, M54.2" />
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--jade-700)", background: "var(--jade-50)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--jade-200)" }}>
                <Icon name="sparkles" size={9} /> AI 추천
              </span>
            </div>
          </MiniField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <MiniField label="발병 연월일"><TextField type="date" value={data.onsetDate} onChange={set("onsetDate")} mono /></MiniField>
          <MiniField label="진단 연월일"><TextField type="date" value={data.diagnosisDate} onChange={set("diagnosisDate")} mono /></MiniField>
        </div>
      </PanelSection>

      {/* Treatment opinion */}
      <PanelSection
        title="치료 내용 및 향후 소견"
        right={<button style={{ background: "var(--jade-50)", border: "1px solid var(--jade-200)", color: "var(--jade-700)", padding: "3px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="wand-2" size={10} /> AI로 작성
        </button>}
      >
        <TextArea
          rows={6}
          value={data.treatment}
          onChange={set("treatment")}
          placeholder="현재까지의 치료 내용과 향후 치료에 대한 의학적 소견을 기재하십시오."
        />
      </PanelSection>

      {/* Admission */}
      <PanelSection title="입퇴원 / 비고">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="입원일"><TextField type="date" value={data.admitDate} onChange={set("admitDate")} mono /></MiniField>
          <MiniField label="퇴원일"><TextField type="date" value={data.dischargeDate} onChange={set("dischargeDate")} mono /></MiniField>
        </div>
        <div style={{ marginTop: 10 }}>
          <MiniField label="비고"><TextArea rows={2} value={data.remarks} onChange={set("remarks")} /></MiniField>
        </div>
      </PanelSection>

      {/* Issuer */}
      <PanelSection
        title="발급자"
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-muted)" }}>
          <Icon name="info" size={10} /> 기본 의료기관 정보
        </span>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--stone-100)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>의료기관</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{clinic.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--stone-100)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>한의사 면허</span><span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>제 {clinic.license} 호</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--stone-100)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>발급의</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Avatar name={clinic.doctorName} size={18} /> {clinic.doctorName}
            </span>
          </div>
        </div>
      </PanelSection>

    </div>
  );
}

// ── History list ─────────────────────────────────────────────────
function IssueHistory() {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="history" size={14} style={{ color: "var(--text-secondary)" }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>최근 발급 이력</div>
        </div>
        <button style={{ background: "none", border: "none", color: "var(--jade-700)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>전체 보기</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "var(--stone-50)", color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <th style={{ textAlign: "left", padding: "8px 14px", fontWeight: 600 }}>발급번호</th>
            <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600 }}>서식</th>
            <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600 }}>환자</th>
            <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600 }}>발급일</th>
            <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600 }}>용도</th>
            <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600 }}>상태</th>
            <th style={{ textAlign: "right", padding: "8px 14px", fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {MF_HISTORY.map((h, i) => (
            <tr key={h.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{h.id}</td>
              <td style={{ padding: "10px 10px", color: "var(--text-primary)", fontWeight: 500 }}>{h.type}</td>
              <td style={{ padding: "10px 10px", color: "var(--text-primary)" }}>{h.patient}</td>
              <td style={{ padding: "10px 10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{h.date}</td>
              <td style={{ padding: "10px 10px", color: "var(--text-secondary)" }}>{h.purpose}</td>
              <td style={{ padding: "10px 10px" }}><Badge variant="success">{h.status}</Badge></td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                <button style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", marginRight: 4 }}>
                  <Icon name="rotate-ccw" size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />재발급
                </button>
                <button style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <Icon name="printer" size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />인쇄
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
function MedicalFormScreen() {
  const [activeTab, setActiveTab] = useStateMF("diagnosis");
  const [zoom, setZoom] = useStateMF(0.72);
  const [data, setData] = useStateMF(MF_DEFAULT_DX);
  const [patient, setPatient] = useStateMF(MF_PATIENT);
  const [pickerOpen, setPickerOpen] = useStateMF(false);
  const stageRef = useRefMF(null);

  const handlePatientChange = (newPatient) => {
    setPatient({
      id: newPatient.id,
      name: newPatient.name,
      rrn: newPatient.rrn,
      rrnFull: newPatient.rrnFull,
      address: newPatient.address,
      phone: newPatient.phone,
      chartNo: newPatient.chartNo,
    });
    // 등록번호는 차트번호 기반으로 갱신
    setData((d) => ({ ...d, registry: newPatient.chartNo }));
  };

  const previewWidth = 794;
  const isDiagnosis = activeTab === "diagnosis";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      {/* Top bar */}
      <div style={{
        height: 54, background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>서식 출력</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>진단서 · 소견서 · 확인서 등 환자 발급 서식</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Button variant="secondary" size="sm" icon="save">임시 저장</Button>
          <Button variant="secondary" size="sm" icon="file-down">PDF 저장</Button>
          <Button variant="secondary" size="sm" icon="send">환자에게 전송</Button>
          <Button variant="primary" size="sm" icon="printer">인쇄 / 발급</Button>
          <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }}></div>
          <Icon name="bell" size={17} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", padding: "0 24px", gap: 4, flexShrink: 0,
        flexWrap: "nowrap", overflow: "hidden",
      }}>
        {MF_TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                border: "none", background: "transparent", padding: "12px 12px 11px",
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? "var(--jade-700)" : "var(--text-secondary)",
                borderBottom: `2px solid ${active ? "var(--jade-500)" : "transparent"}`,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                marginBottom: -1, fontFamily: "var(--font-sans)",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
              <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
              {!t.active && (
                <span style={{ fontSize: 9, padding: "1px 5px", background: "var(--stone-200)", color: "var(--ink-500)", borderRadius: 999, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>곧 출시</span>
              )}
            </button>
          );
        })}
        <div style={{ flex: 1, minWidth: 8 }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 0", flexShrink: 0, whiteSpace: "nowrap" }}>
          <button style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "2px 6px", cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => setZoom(Math.max(0.45, zoom - 0.1))}><Icon name="minus" size={11} /></button>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", minWidth: 38, textAlign: "center", fontFamily: "var(--font-mono)" }}>{Math.round(zoom * 100)}%</div>
          <button style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "2px 6px", cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}><Icon name="plus" size={11} /></button>
          <button style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "3px 8px", fontSize: 11, marginLeft: 4, color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setZoom(0.72)}>맞춤</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Preview stage */}
        <div ref={stageRef} style={{
          flex: 1, overflow: "auto",
          background: "linear-gradient(180deg, var(--stone-100) 0%, var(--stone-200) 100%)",
          padding: "32px 24px 48px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 0,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px",
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: 999, fontSize: 11.5, color: "var(--text-secondary)",
            boxShadow: "var(--shadow-sm)", whiteSpace: "nowrap", flexShrink: 0,
            maxWidth: "100%", overflow: "hidden",
          }}>
            <Icon name="file" size={12} />
            <span style={{ whiteSpace: "nowrap" }}>{MF_TABS.find(t => t.key === activeTab)?.label}</span>
            <span style={{ color: "var(--ink-200)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>A4 · 210×297mm</span>
            <span style={{ color: "var(--ink-200)" }}>·</span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{MF_TABS.find(t => t.key === activeTab)?.desc}</span>
          </div>
          <div style={{
            transform: `scale(${zoom})`, transformOrigin: "top center",
            width: previewWidth,
            marginBottom: `${(zoom - 1) * 1123}px`,  // visual gap compensation
          }}>
            {isDiagnosis
              ? <DiagnosisPreviewA4 data={data} clinic={MF_CLINIC} patient={patient} />
              : <PlaceholderPreviewA4 label={MF_TABS.find(t => t.key === activeTab)?.label} desc={MF_TABS.find(t => t.key === activeTab)?.desc} />
            }
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          width: 400, background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>서식 입력</div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>좌측 미리보기에 실시간 반영됩니다.</div>
            </div>
            {isDiagnosis && <button onClick={() => setData(MF_DEFAULT_DX)} style={{
              background: "none", border: "1px solid var(--border-subtle)",
              borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-secondary)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <Icon name="rotate-ccw" size={10} /> 초기화
            </button>}
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {isDiagnosis ? (
              <DiagnosisEditor data={data} onChange={setData} clinic={MF_CLINIC} patient={patient} onChangePatient={() => setPickerOpen(true)} />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.6 }}>
                <Icon name="construction" size={26} style={{ color: "var(--ink-300)", marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>입력 양식 준비 중</div>
                <div>이 서식은 현재 진단서를 기준으로 디자인 중입니다. 필요한 입력 항목을 알려주시면 즉시 작업할 수 있어요.</div>
              </div>
            )}
          </div>
          {/* Footer status */}
          <div style={{
            padding: "10px 16px", borderTop: "1px solid var(--border-subtle)",
            background: "var(--stone-50)", fontSize: 11, color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jade-500)" }}></span>
              자동 저장됨 · 방금 전
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
              <Icon name="shield-check" size={11} /> 의료법 별지 제5호의2서식
            </span>
          </div>
        </div>
      </div>

      {/* Bottom history */}
      <div style={{ padding: "16px 24px 24px", background: "var(--bg-page)", flexShrink: 0, borderTop: "1px solid var(--border-subtle)" }}>
        <IssueHistory />
      </div>

      {/* Patient picker modal */}
      {pickerOpen && (
        <PatientPickerModal
          currentPatientId={patient.id}
          onClose={() => setPickerOpen(false)}
          onSelect={handlePatientChange}
        />
      )}
    </div>
  );
}

window.MedicalFormScreen = MedicalFormScreen;
