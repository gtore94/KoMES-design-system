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

const MF_DEFAULT_INJURY = {
  registry: "00012483",
  serial: "2026-0043",
  judgment: "final",
  mainDx: "우측 견관절 염좌",
  subDx: "견부통",
  icdCodes: "S43.4, M75.1",
  injuryDate: "2026-04-05",
  diagnosisDate: "2026-04-10",
  injuryCause: "교통사고(차량 추돌)로 인한 우측 어깨 부위 충격",
  injuryAreaDegree: "우측 견관절 부위 염좌, 근육통 동반, 경미한 부종 관찰됨",
  hospitalizationNeeded: "아니요",
  surgeryNeeded: "아니요",
  complicationPossible: "가능성 낮음",
  normalActivityPossible: "제한적 가능",
  mealPossible: "가능",
  injuryOpinion: "우측 견관절 부위 염좌로 단순 보존적 치료가 필요한 상태임",
  treatmentStartDate: "2026-04-10",
  treatmentEndDate: "2026-05-10",
  treatmentDays: "30",
  treatmentFutureOpinion: "한방 치료(체침·부항·온열 치료) 및 한약 처방을 통해 회복 중이며,\n향후 약 4주간 주 2회 통원 치료가 필요할 것으로 사료됨.",
  admitDate: "",
  dischargeDate: "",
  purpose: "보험 청구용",
  remarks: "",
  issueDate: "2026-05-16",
};

const MF_DEFAULT_FEE = {
  startDate: "2026-04-10",
  endDate: "2026-05-09",
  visits: 8,
  issueDate: "2026-05-16",
  purpose: "보험 청구용",
};

const MF_DEFAULT_REFERRAL = {
  toClinicName: "서울대학교병원 정형외과",
  toAddress: "서울특별시 종로구 대학로 101",
  toDoctor: "",
  purpose: "정밀 검사 및 전문 치료 의뢰",
  mainDx: "경추의 염좌 및 긴장",
  subDx: "경부통",
  icdCodes: "S13.4, M54.2",
  onsetDate: "2026-04-05",
  treatment: "한방 치료(체침·부항·온열 치료)를 2026년 4월 10일부터 시행 중이며, 경추부 증상이 지속되어 정밀 검사가 필요한 상태입니다.",
  requestContent: "경추부 MRI 정밀 검사 및 전문적 치료를 의뢰드립니다. 검사 후 결과 회신 부탁드립니다.",
  remarks: "",
  issueDate: "2026-05-16",
};

const MF_DEFAULT_OPINION = {
  mainDx: "경추의 염좌 및 긴장",
  subDx: "경부통",
  icdCodes: "S13.4, M54.2",
  onsetDate: "2026-04-05",
  diagnosisDate: "2026-04-10",
  opinion: "상기 환자는 2026년 4월 5일 교통사고(차량 추돌)로 인한 경추부 염좌로 내원하였습니다.\n경추부 통증, 경직 및 두통을 호소하고 있으며, 이학적 검사상 경추의 운동 제한 및 압통이 확인되었습니다.\n한방 치료(체침·부항·온열치료)를 통해 증상 호전 중이나, 지속적인 통원 치료가 필요한 상태로 사료됩니다.",
  purpose: "보험 청구용",
  issueDate: "2026-05-16",
  remarks: "",
};

const MF_DEFAULT_TREATMENT_PROOF = {
  startDate: "2026-04-10",
  endDate: "2026-05-09",
  mainDx: "경추의 염좌 및 긴장",
  icdCodes: "S13.4",
  purpose: "보험 청구용",
  issueDate: "2026-05-16",
  remarks: "",
};

const MF_DEFAULT_ADMISSION_PROOF = {
  admitDate: "2026-04-10",
  dischargeDate: "2026-04-24",
  mainDx: "경추의 염좌 및 긴장",
  icdCodes: "S13.4",
  purpose: "보험 청구용",
  issueDate: "2026-05-16",
  remarks: "",
};

const MF_DEFAULT_OUTPATIENT_PROOF = {
  startDate: "2026-04-10",
  endDate: "2026-05-09",
  visitCount: 8,
  visitDates: "2026-04-10, 2026-04-15, 2026-04-22, 2026-04-29, 2026-05-06, 2026-05-09, 2026-05-13, 2026-05-16",
  mainDx: "경추의 염좌 및 긴장",
  icdCodes: "S13.4",
  purpose: "보험 청구용",
  issueDate: "2026-05-16",
  remarks: "",
};

const MF_FEE_ITEMS = [
  { category: "진찰료",           selfPay: 40500,  insurancePay:  94500, nonCovered:      0 },
  { category: "한방 침구 치료료", selfPay: 36000,  insurancePay:  84000, nonCovered:      0 },
  { category: "부항술",           selfPay: 19200,  insurancePay:  44800, nonCovered:      0 },
  { category: "적외선치료",       selfPay: 11520,  insurancePay:  26880, nonCovered:      0 },
  { category: "경피전기자극치료", selfPay: 18000,  insurancePay:  42000, nonCovered:      0 },
  { category: "첩약(탕약)",       selfPay:     0,  insurancePay:      0, nonCovered: 120000 },
];

const MF_CALC_ITEMS = [
  { date: "04-10", code: "AA154", name: "초진진찰료",         type: "급여",  count: 1, unit:  30000, total:  30000 },
  { date: "04-10", code: "CB011", name: "체침(15분 이상)",    type: "급여",  count: 1, unit:  15000, total:  15000 },
  { date: "04-10", code: "CB021", name: "부항술(편측)",       type: "급여",  count: 1, unit:   8000, total:   8000 },
  { date: "04-10", code: "FZ971", name: "적외선치료(1부위)",  type: "급여",  count: 1, unit:   4800, total:   4800 },
  { date: "04-10", code: "FZ411", name: "경피전기자극치료",   type: "급여",  count: 1, unit:   7500, total:   7500 },
  { date: "04-10", code: "HB001", name: "첩약(탕약) 처방",   type: "비급여", count: 1, unit: 120000, total: 120000 },
  { date: "04-15", code: "AA174", name: "재진진찰료",         type: "급여",  count: 1, unit:  20000, total:  20000 },
  { date: "04-15", code: "CB011", name: "체침(15분 이상)",    type: "급여",  count: 1, unit:  15000, total:  15000 },
  { date: "04-15", code: "CB021", name: "부항술(편측)",       type: "급여",  count: 1, unit:   8000, total:   8000 },
  { date: "04-15", code: "FZ971", name: "적외선치료(1부위)",  type: "급여",  count: 1, unit:   4800, total:   4800 },
  { date: "04-15", code: "FZ411", name: "경피전기자극치료",   type: "급여",  count: 1, unit:   7500, total:   7500 },
  { date: "04-22", code: "AA174", name: "재진진찰료",         type: "급여",  count: 1, unit:  20000, total:  20000 },
  { date: "04-22", code: "CB011", name: "체침(15분 이상)",    type: "급여",  count: 1, unit:  15000, total:  15000 },
  { date: "04-22", code: "CB021", name: "부항술(편측)",       type: "급여",  count: 1, unit:   8000, total:   8000 },
  { date: "04-22", code: "FZ971", name: "적외선치료(1부위)",  type: "급여",  count: 1, unit:   4800, total:   4800 },
  { date: "04-22", code: "FZ411", name: "경피전기자극치료",   type: "급여",  count: 1, unit:   7500, total:   7500 },
  { date: "04-29", code: "AA174", name: "재진진찰료",         type: "급여",  count: 1, unit:  20000, total:  20000 },
  { date: "04-29", code: "CB011", name: "체침(15분 이상)",    type: "급여",  count: 1, unit:  15000, total:  15000 },
  { date: "04-29", code: "CB021", name: "부항술(편측)",       type: "급여",  count: 1, unit:   8000, total:   8000 },
  { date: "04-29", code: "FZ971", name: "적외선치료(1부위)",  type: "급여",  count: 1, unit:   4800, total:   4800 },
];

const MF_HISTORY = [
  { id: "F-2026-0041", type: "진단서", patient: "박지영", date: "2026-04-22", purpose: "보험 청구용", status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0038", type: "통원확인서", patient: "박지영", date: "2026-04-10", purpose: "회사 제출",    status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0033", type: "소견서", patient: "이수민", date: "2026-04-04", purpose: "타병원 의뢰",  status: "발급완료", issuedBy: "김민준" },
  { id: "F-2026-0029", type: "진단서", patient: "최영호", date: "2026-03-28", purpose: "법원 제출",    status: "발급완료", issuedBy: "김민준" },
];

const MF_TABS = [
  { key: "diagnosis",        label: "진단서",        active: true,  desc: "의료법 시행규칙 별지 제5호의2서식" },
  { key: "injury",           label: "상해진단서",     active: true,  desc: "의료법 시행규칙 별지 제5호의3서식" },
  { key: "referral",         label: "진료의뢰서",     active: true,  desc: "의료법 시행규칙 별지 제12호서식" },
  { key: "opinion",          label: "소견서",        active: true,  desc: "진료 소견에 관한 의사 의견서" },
  { key: "treatment_proof",  label: "진료확인서",     active: true,  desc: "의료법 시행규칙 별지 제7호서식" },
  { key: "admission_proof",  label: "입퇴원확인서",   active: true,  desc: "의료법 시행규칙 별지 제8호서식" },
  { key: "outpatient_proof", label: "통원확인서",     active: true,  desc: "통원 일자 및 횟수 확인" },
  { key: "fee_detail",       label: "진료비 세부내역서", active: true,  desc: "진료비 항목별 세부 내역" },
  { key: "calc_detail",      label: "세부산정내역",      active: true,  desc: "진료 항목별 세부 산정 내역서" },
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
      width: 13, height: 13, border: "1.2px solid var(--form-border)", marginRight: 4,
      fontSize: 11, lineHeight: 1, fontFamily: "var(--font-serif)",
      verticalAlign: "middle",
    }}>{on ? "√" : ""}</span>
  );

  const td = {
    padding: "6px 8px", borderBottom: "1px solid var(--form-border)", borderRight: "1px solid var(--form-border)",
    fontSize: 11.5, verticalAlign: "middle", color: "var(--form-border)", lineHeight: 1.55,
  };
  const lh = { // label header (left column shaded)
    ...td, background: "var(--form-table-header-bg)", textAlign: "center", fontWeight: 500,
    width: 110, color: "var(--text-primary)",
  };
  const lhWide = { ...lh, width: 130 };

  return (
    <div className="a4-paper" style={{
      width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)",
      padding: "42px 56px 36px", fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-paper)",
      position: "relative",
    }}>
      {/* Top meta strip */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: 10, color: "var(--text-primary)", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>의료법 시행규칙 [별지 제5호의2서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;개정 2019. 9. 27.&gt;</div>
      </div>

      {/* Title */}
      <div style={{
        textAlign: "center", fontFamily: "var(--font-serif)",
        fontSize: 30, fontWeight: 600, letterSpacing: "1.2em",
        margin: "26px 0 22px", paddingLeft: "1.2em", color: "var(--ink-900)",
      }}>진 단 서</div>

      {/* Registry strip */}
      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 0,
        marginBottom: 6, fontSize: 10.5, color: "var(--text-primary)",
      }}>
        <div style={{ border: "1px solid var(--form-border)", borderRight: "none", padding: "4px 10px", background: "var(--form-table-header-bg)", fontWeight: 500 }}>등록번호</div>
        <div style={{ border: "1px solid var(--form-border)", padding: "4px 14px", minWidth: 130, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.registry || "\u00A0"}</div>
        <div style={{ border: "1px solid var(--form-border)", borderLeft: "none", padding: "4px 10px", background: "var(--form-table-header-bg)", fontWeight: 500 }}>연번호</div>
        <div style={{ border: "1px solid var(--form-border)", borderLeft: "none", padding: "4px 14px", minWidth: 110, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.serial || "\u00A0"}</div>
      </div>

      {/* Main table */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 18 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>환자의<br/>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address} &nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh} rowSpan={2}>병 &nbsp;명</td>
            <td style={{ ...td, borderRight: "1px solid var(--form-border)", paddingTop: 8, paddingBottom: 8 }}>
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
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비 &nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 36, whiteSpace: "pre-wrap" }}>{data.remarks || "\u00A0"}</td>
          </tr>
        </tbody>
      </table>

      {/* Certification statement */}
      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 18 }}>
        「의료법」 제17조 및 같은 법 시행규칙 제9조제1항에 따라 위와 같이 진단합니다.
      </div>

      {/* Date line */}
      <div style={{ textAlign: "center", fontSize: 13, margin: "6px 0 20px", letterSpacing: "0.04em" }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.y || "____"}</span> 년&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.m || "__"}</span> 월&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.d || "__"}</span> 일
      </div>

      {/* Issuer block */}
      <div style={{ fontSize: 12, lineHeight: 2.1, color: "var(--ink-900)", paddingLeft: 4 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>의료기관 명칭:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.name}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>주소:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.address}</span>
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
            <span style={{ fontFamily: "var(--font-mono)", borderBottom: "0.7px solid var(--form-border)", padding: "0 14px" }}>{clinic.license}</span>
            &nbsp;호
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>성 &nbsp;명:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500 }}>{clinic.doctorName}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>(서명 또는 인)</span>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, border: "2px solid var(--form-seal)", borderRadius: "50%",
                color: "var(--form-seal)", fontFamily: "var(--font-serif)", fontWeight: 700,
                fontSize: 13, letterSpacing: "-0.05em",
              }}>{clinic.doctorName[0]}印</span>
            </span>
          </span>
        </div>
      </div>

      {/* Writer guide footer */}
      <div style={{
        marginTop: 32, paddingTop: 12, borderTop: "0.5px solid var(--form-rule)",
        fontSize: 9, lineHeight: 1.6, color: "var(--text-secondary)",
      }}>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "0.3em", textAlign: "center" }}>작 성 방 법</div>
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
        position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)",
      }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 상해진단서 ──────────────────────────────────────
function InjuryPreviewA4({ data, clinic, patient }) {
  const injDate = splitYMD(data.injuryDate);
  const dxDate  = splitYMD(data.diagnosisDate);
  const txStart = splitYMD(data.treatmentStartDate);
  const txEnd   = splitYMD(data.treatmentEndDate);
  const adm     = splitYMD(data.admitDate);
  const dis     = splitYMD(data.dischargeDate);
  const iss     = splitYMD(data.issueDate);

  const Chk = ({ on }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 13, height: 13, border: "1.2px solid var(--form-border)", marginRight: 4,
      fontSize: 11, lineHeight: 1, fontFamily: "var(--font-serif)", verticalAlign: "middle",
    }}>{on ? "√" : ""}</span>
  );

  const td = {
    padding: "5px 8px", borderBottom: "1px solid var(--form-border)", borderRight: "1px solid var(--form-border)",
    fontSize: 11, verticalAlign: "middle", color: "var(--form-border)", lineHeight: 1.5,
  };
  const lh = {
    ...td, background: "var(--form-table-header-bg)", textAlign: "center", fontWeight: 500,
    width: 126, color: "var(--text-primary)", fontSize: 10.5,
  };

  const YMD = ({ p }) => (
    <span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.y || "____"}</span> 년&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.m || "__"}</span> 월&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.d || "__"}</span> 일
    </span>
  );

  return (
    <div className="a4-paper" style={{
      width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)",
      padding: "42px 56px 36px", fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-paper)",
      position: "relative",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        fontSize: 10, color: "var(--text-primary)", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>의료법 시행규칙 [별지 제5호의3서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;개정 2019. 9. 27.&gt;</div>
      </div>

      <div style={{
        textAlign: "center", fontFamily: "var(--font-serif)",
        fontSize: 30, fontWeight: 600, letterSpacing: "1.2em",
        margin: "18px 0 16px", paddingLeft: "1.2em", color: "var(--ink-900)",
      }}>상 해 진 단 서</div>

      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 0,
        marginBottom: 6, fontSize: 10.5, color: "var(--text-primary)",
      }}>
        <div style={{ border: "1px solid var(--form-border)", borderRight: "none", padding: "4px 10px", background: "var(--form-table-header-bg)", fontWeight: 500 }}>등록번호</div>
        <div style={{ border: "1px solid var(--form-border)", padding: "4px 14px", minWidth: 130, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.registry || " "}</div>
        <div style={{ border: "1px solid var(--form-border)", borderLeft: "none", padding: "4px 10px", background: "var(--form-table-header-bg)", fontWeight: 500 }}>면&nbsp;번&nbsp;호</div>
        <div style={{ border: "1px solid var(--form-border)", borderLeft: "none", padding: "4px 14px", minWidth: 110, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{data.serial || " "}</div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 14 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>환자의<br/>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={2} style={td}>{patient.address}</td>
            <td style={td}><span style={{ color: "var(--text-secondary)" }}>(전화번호 : </span>{patient.phone}<span style={{ color: "var(--text-secondary)" }}>)</span></td>
          </tr>
          <tr>
            <td style={lh} rowSpan={2}>병&nbsp;&nbsp;&nbsp;&nbsp;명</td>
            <td style={{ ...td, borderRight: "1px solid var(--form-border)" }}>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <span><Chk on={data.judgment === "clinical"} /> 임상적 추정</span>
                <span><Chk on={data.judgment === "final"} /> 최 종 진 단</span>
              </div>
            </td>
            <td style={{ ...lh, fontSize: 10 }}>(주 질병ㆍ부상)</td>
            <td style={td}>{data.mainDx}</td>
          </tr>
          <tr>
            <td style={td}>&nbsp;</td>
            <td style={{ ...lh, fontSize: 10 }}>(부 질병ㆍ부상)</td>
            <td style={td}>{data.subDx || " "}</td>
          </tr>
          <tr>
            <td style={lh}>질병분류기호</td>
            <td colSpan={3} style={{ ...td, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>발병 또는 상해<br/>연월일</td>
            <td style={td}><YMD p={injDate} /></td>
            <td style={lh}>진단 연월일</td>
            <td style={td}><YMD p={dxDate} /></td>
          </tr>
          <tr>
            <td style={lh}>상해의 원인 또는<br/>추정되는 상해의<br/>원인</td>
            <td colSpan={3} style={td}>{data.injuryCause || " "}</td>
          </tr>
          <tr>
            <td style={lh}>상해 부위와 정도</td>
            <td colSpan={3} style={td}>{data.injuryAreaDegree || " "}</td>
          </tr>
          <tr>
            <td style={lh}>입원의 필요 여부</td>
            <td colSpan={3} style={td}>{data.hospitalizationNeeded || " "}</td>
          </tr>
          <tr>
            <td style={lh}>외과적 수술 여부</td>
            <td colSpan={3} style={td}>{data.surgeryNeeded || " "}</td>
          </tr>
          <tr>
            <td style={lh}>합병증 발생 가능<br/>여부</td>
            <td colSpan={3} style={td}>{data.complicationPossible || " "}</td>
          </tr>
          <tr>
            <td style={lh}>통상활동의 가능<br/>여부</td>
            <td colSpan={3} style={td}>{data.normalActivityPossible || " "}</td>
          </tr>
          <tr>
            <td style={lh}>식사의 가능 여부</td>
            <td colSpan={3} style={td}>{data.mealPossible || " "}</td>
          </tr>
          <tr>
            <td style={lh}>상해에 대한 소견</td>
            <td colSpan={3} style={td}>{data.injuryOpinion || " "}</td>
          </tr>
          <tr>
            <td style={lh}>치 료 기 간</td>
            <td colSpan={3} style={td}>
              <YMD p={txStart} /> 부터&nbsp;&nbsp;&nbsp;
              <YMD p={txEnd} /> 까지&nbsp;&nbsp;
              <span style={{ color: "var(--text-secondary)", fontSize: 10.5 }}>(진단일부터&nbsp;
                <span style={{ fontFamily: "var(--font-mono)" }}>{data.treatmentDays || "__"}</span> 일간)
              </span>
            </td>
          </tr>
          <tr>
            <td style={lh}>치료 후 및 향후<br/>치료에 대한 소견</td>
            <td colSpan={3} style={{ ...td, whiteSpace: "pre-wrap", minHeight: 64, height: 64, verticalAlign: "top", paddingTop: 8 }}>
              {data.treatmentFutureOpinion || " "}
            </td>
          </tr>
          <tr>
            <td style={lh}>입원ㆍ퇴원<br/>연월일</td>
            <td colSpan={3} style={td}>
              <span>입원일: </span><YMD p={adm} /><span> 부터&nbsp;&nbsp;&nbsp;</span>
              <span>퇴원일: </span><YMD p={dis} /><span> 까지</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비&nbsp;&nbsp;&nbsp;&nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 30 }}>{data.remarks || " "}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>
        「의료법」 제17조 및 같은 법 시행규칙 제9조제2항에 따라 위와 같이 진단합니다.
      </div>

      <div style={{ textAlign: "center", fontSize: 13, margin: "4px 0 16px", letterSpacing: "0.04em" }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.y || "____"}</span> 년&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.m || "__"}</span> 월&nbsp;&nbsp;
        <span style={{ fontFamily: "var(--font-mono)" }}>{iss.d || "__"}</span> 일
      </div>

      <div style={{ fontSize: 12, lineHeight: 2.1, color: "var(--ink-900)", paddingLeft: 4 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>의료기관 명칭:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.name}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>주소:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.address}</span>
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
            <span style={{ fontFamily: "var(--font-mono)", borderBottom: "0.7px solid var(--form-border)", padding: "0 14px" }}>{clinic.license}</span>
            &nbsp;호
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}>
          <span style={{ minWidth: 92, color: "var(--text-primary)" }}>성 &nbsp;명:</span>
          <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500 }}>{clinic.doctorName}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>(서명 또는 인)</span>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, border: "2px solid var(--form-seal)", borderRadius: "50%",
                color: "var(--form-seal)", fontFamily: "var(--font-serif)", fontWeight: 700,
                fontSize: 13, letterSpacing: "-0.05em",
              }}>{clinic.doctorName[0]}印</span>
            </span>
          </span>
        </div>
      </div>

      <div style={{
        marginTop: 24, paddingTop: 10, borderTop: "0.5px solid var(--form-rule)",
        fontSize: 9, lineHeight: 1.6, color: "var(--text-secondary)",
      }}>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "0.3em", textAlign: "center" }}>작 성 방 법</div>
        <div style={{ display: "flex", gap: 4 }}>
          <span>1.</span>
          <span>환자의 인적사항은 진찰한 의사, 치과의사 또는 한의사가 주민등록증, 기간 만료 전 여권, 운전면허증, 공무원증, 국립ㆍ공립대학 학생증, 군무원증, 건강보험증, 외국인등록증 등 국가공인 신분증(환자가 미성년자인 경우에는 주민등록등본ㆍ초본, 학생증 등으로 대체 가능합니다)과 대조하여 확인하고 서명 또는 날인합니다.</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
          <span>2.</span>
          <span>"병명"란에는 "임상적 추정"과 "최종진단" 중 택일하여 [ ]에 √ 표시를 하고, 질병명은 한글로 적되 영어로 적을 경우에는 한글을 함께 적으며, 질병분류기호도 함께 적습니다.</span>
        </div>
      </div>

      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>
        210mm×297mm[백상지 80g/㎡]
      </div>
    </div>
  );
}

// ── Editor Panel — 상해진단서 ────────────────────────────────────
function InjuryEditor({ data, onChange, clinic, patient, onChangePatient }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  const YNOptions = [
    { value: "예", label: "예" },
    { value: "아니요", label: "아니요" },
  ];
  const YNField = ({ label, k }) => (
    <MiniField label={label}>
      <TextField value={data[k]} onChange={set(k)} placeholder="예 / 아니요" />
    </MiniField>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection
        title="환자 정보"
        right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
          <Icon name="arrow-left-right" size={11} /> 환자 변경
        </button>}
      >
        <div style={{
          display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)",
          border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)",
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

      <PanelSection title="발급 식별">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="등록번호"><TextField value={data.registry} onChange={set("registry")} mono /></MiniField>
          <MiniField label="면번호"><TextField value={data.serial} onChange={set("serial")} mono /></MiniField>
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
            <TextField value={data.mainDx} onChange={set("mainDx")} placeholder="예: 우측 견관절 염좌" />
          </MiniField>
          <MiniField label="부 질병ㆍ부상 (선택)">
            <TextField value={data.subDx} onChange={set("subDx")} placeholder="예: 견부통" />
          </MiniField>
          <MiniField label="질병분류기호 (KCD)">
            <div style={{ position: "relative" }}>
              <TextField value={data.icdCodes} onChange={set("icdCodes")} mono placeholder="S43.4, M75.1" />
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--text-brand)", background: "var(--brand-subtle)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--brand-muted)" }}>
                <Icon name="sparkles" size={9} /> AI 추천
              </span>
            </div>
          </MiniField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <MiniField label="발병/상해 연월일"><TextField type="date" value={data.injuryDate} onChange={set("injuryDate")} mono /></MiniField>
          <MiniField label="진단 연월일"><TextField type="date" value={data.diagnosisDate} onChange={set("diagnosisDate")} mono /></MiniField>
        </div>
      </PanelSection>

      <PanelSection title="상해 상세">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="상해의 원인 또는 추정되는 원인">
            <TextArea rows={2} value={data.injuryCause} onChange={set("injuryCause")} placeholder="예: 교통사고(차량 추돌)로 인한 충격" />
          </MiniField>
          <MiniField label="상해 부위와 정도">
            <TextArea rows={2} value={data.injuryAreaDegree} onChange={set("injuryAreaDegree")} placeholder="예: 우측 견관절 부위 염좌, 부종 동반" />
          </MiniField>
        </div>
      </PanelSection>

      <PanelSection title="상태 평가">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <YNField label="입원의 필요 여부" k="hospitalizationNeeded" />
          <YNField label="외과적 수술 여부" k="surgeryNeeded" />
          <YNField label="합병증 발생 가능 여부" k="complicationPossible" />
          <YNField label="통상활동의 가능 여부" k="normalActivityPossible" />
          <YNField label="식사의 가능 여부" k="mealPossible" />
        </div>
        <div style={{ marginTop: 10 }}>
          <MiniField label="상해에 대한 소견">
            <TextArea rows={2} value={data.injuryOpinion} onChange={set("injuryOpinion")} placeholder="상해에 대한 종합 의학적 소견" />
          </MiniField>
        </div>
      </PanelSection>

      <PanelSection
        title="치료 기간 및 향후 소견"
        right={<button style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", color: "var(--text-brand)", padding: "3px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="wand-2" size={10} /> AI로 작성
        </button>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
          <MiniField label="치료 시작일"><TextField type="date" value={data.treatmentStartDate} onChange={set("treatmentStartDate")} mono /></MiniField>
          <MiniField label="치료 종료일"><TextField type="date" value={data.treatmentEndDate} onChange={set("treatmentEndDate")} mono /></MiniField>
          <MiniField label="치료 일수"><TextField value={data.treatmentDays} onChange={set("treatmentDays")} mono placeholder="30" /></MiniField>
        </div>
        <MiniField label="치료 후 및 향후 치료에 대한 소견">
          <TextArea rows={4} value={data.treatmentFutureOpinion} onChange={set("treatmentFutureOpinion")} placeholder="현재까지의 치료 내용과 향후 치료에 대한 소견" />
        </MiniField>
      </PanelSection>

      <PanelSection title="입퇴원 / 비고">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="입원일"><TextField type="date" value={data.admitDate} onChange={set("admitDate")} mono /></MiniField>
          <MiniField label="퇴원일"><TextField type="date" value={data.dischargeDate} onChange={set("dischargeDate")} mono /></MiniField>
        </div>
        <div style={{ marginTop: 10 }}>
          <MiniField label="비고"><TextArea rows={2} value={data.remarks} onChange={set("remarks")} /></MiniField>
        </div>
      </PanelSection>

      <PanelSection
        title="발급자"
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-muted)" }}>
          <Icon name="info" size={10} /> 기본 의료기관 정보
        </span>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>의료기관</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{clinic.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>한의사 면허</span><span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>제 {clinic.license} 호</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
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

// ── Shared A4 helpers ─────────────────────────────────────────────
const A4_TD = { padding: "6px 8px", borderBottom: "1px solid var(--form-border)", borderRight: "1px solid var(--form-border)", fontSize: 11.5, verticalAlign: "middle", color: "var(--form-border)", lineHeight: 1.55 };
const A4_LH = { ...A4_TD, background: "var(--form-table-header-bg)", textAlign: "center", fontWeight: 500, width: 120, color: "var(--text-primary)" };

function A4Chk({ on }) {
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 13, height: 13, border: "1.2px solid var(--form-border)", marginRight: 4, fontSize: 11, lineHeight: 1, fontFamily: "var(--font-serif)", verticalAlign: "middle" }}>{on ? "√" : ""}</span>;
}

function A4IssuerBlock({ clinic }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 2.1, color: "var(--ink-900)", paddingLeft: 4 }}>
      <div style={{ display: "flex", gap: 14 }}>
        <span style={{ minWidth: 92, color: "var(--text-primary)" }}>의료기관 명칭:</span>
        <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.name}</span>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <span style={{ minWidth: 92, color: "var(--text-primary)" }}>주소:</span>
        <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2 }}>{clinic.address}</span>
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><A4Chk on={clinic.doctorRole === "doc"} />의사</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><A4Chk on={clinic.doctorRole === "dent"} />치과의사</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><A4Chk on={clinic.doctorRole === "han"} />한의사</span>
        <span style={{ marginLeft: 12 }}>면허번호&nbsp;&nbsp;제&nbsp;<span style={{ fontFamily: "var(--font-mono)", borderBottom: "0.7px solid var(--form-border)", padding: "0 14px" }}>{clinic.license}</span>&nbsp;호</span>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}>
        <span style={{ minWidth: 92, color: "var(--text-primary)" }}>성 &nbsp;명:</span>
        <span style={{ flex: 1, borderBottom: "0.7px solid var(--form-border)", paddingBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500 }}>{clinic.doctorName}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>(서명 또는 인)</span>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, border: "2px solid var(--form-seal)", borderRadius: "50%", color: "var(--form-seal)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 13, letterSpacing: "-0.05em" }}>{clinic.doctorName[0]}印</span>
          </span>
        </span>
      </div>
    </div>
  );
}

function A4DateLine({ p }) {
  return (
    <div style={{ textAlign: "center", fontSize: 13, margin: "6px 0 20px", letterSpacing: "0.04em" }}>
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.y || "____"}</span> 년&nbsp;&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.m || "__"}</span> 월&nbsp;&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.d || "__"}</span> 일
    </div>
  );
}

function A4YMD({ p }) {
  return (
    <span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.y || "____"}</span> 년&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.m || "__"}</span> 월&nbsp;
      <span style={{ fontFamily: "var(--font-mono)" }}>{p.d || "__"}</span> 일
    </span>
  );
}

// ── A4 Preview — 진료의뢰서 ──────────────────────────────────────
function ReferralPreviewA4({ data, clinic, patient }) {
  const onset = splitYMD(data.onsetDate);
  const iss   = splitYMD(data.issueDate);
  const td = A4_TD, lh = A4_LH;

  return (
    <div className="a4-paper" style={{ width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)", padding: "42px 56px 36px", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-paper)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, color: "var(--text-primary)", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>의료법 시행규칙 [별지 제12호서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;개정 2016. 1. 4.&gt;</div>
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 600, letterSpacing: "1.2em", margin: "22px 0 20px", paddingLeft: "1.2em", color: "var(--ink-900)" }}>진 료 의 뢰 서</div>

      <div style={{ fontSize: 13, marginBottom: 14, lineHeight: 2.2 }}>
        <div>
          <span style={{ fontWeight: 600, marginRight: 8 }}>수 신:</span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 14 }}>{data.toClinicName}</span>
          {data.toDoctor && <span>&nbsp;&nbsp;{data.toDoctor} 선생님 귀하</span>}
        </div>
        {data.toAddress && <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginLeft: 52 }}>{data.toAddress}</div>}
      </div>

      <div style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--text-primary)", marginBottom: 16 }}>
        아래와 같이 환자를 의뢰하오니 진료하여 주시기 바랍니다.
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address}&nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh}>병&nbsp;&nbsp;&nbsp;&nbsp;명</td>
            <td style={td}>{data.mainDx}{data.subDx ? ` / ${data.subDx}` : ""}</td>
            <td style={lh}>질병분류기호</td>
            <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>발병 연월일</td>
            <td colSpan={3} style={td}><A4YMD p={onset} /></td>
          </tr>
          <tr>
            <td style={lh}>의뢰 목적</td>
            <td colSpan={3} style={td}>{data.purpose}</td>
          </tr>
          <tr>
            <td style={lh}>현재까지의<br/>치료 내용</td>
            <td colSpan={3} style={{ ...td, whiteSpace: "pre-wrap", minHeight: 76, height: 76, verticalAlign: "top", paddingTop: 8 }}>{data.treatment}</td>
          </tr>
          <tr>
            <td style={lh}>의뢰 내용</td>
            <td colSpan={3} style={{ ...td, whiteSpace: "pre-wrap", minHeight: 64, height: 64, verticalAlign: "top", paddingTop: 8 }}>{data.requestContent}</td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비&nbsp;&nbsp;&nbsp;&nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 32 }}>{data.remarks || " "}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>
        「의료법」 제17조 및 같은 법 시행규칙 제12조에 따라 위와 같이 진료를 의뢰합니다.
      </div>
      <A4DateLine p={iss} />
      <A4IssuerBlock clinic={clinic} />
      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 소견서 ──────────────────────────────────────────
function OpinionPreviewA4({ data, clinic, patient }) {
  const onset = splitYMD(data.onsetDate);
  const dx    = splitYMD(data.diagnosisDate);
  const iss   = splitYMD(data.issueDate);
  const td = A4_TD, lh = A4_LH;

  return (
    <div className="a4-paper" style={{ width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)", padding: "42px 56px 36px", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-paper)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, paddingBottom: 14, borderBottom: "2px solid var(--text-primary)" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-900)", fontFamily: "var(--font-serif)" }}>{clinic.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{clinic.address}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10.5, color: "var(--text-secondary)", lineHeight: 1.9 }}>
          <div>한의사 면허 제 {clinic.license} 호</div>
          <div>{clinic.doctorName}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 600, letterSpacing: "1.4em", margin: "0 0 28px", paddingLeft: "1.4em", color: "var(--ink-900)" }}>소 견 서</div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 24 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address}&nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh}>진단명</td>
            <td style={td}>{data.mainDx}{data.subDx ? ` / ${data.subDx}` : ""}</td>
            <td style={lh}>질병분류기호</td>
            <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>발병 연월일</td>
            <td style={td}><A4YMD p={onset} /></td>
            <td style={lh}>진단 연월일</td>
            <td style={td}><A4YMD p={dx} /></td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>용&nbsp;&nbsp;&nbsp;&nbsp;도</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)" }}>{data.purpose}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "0.15em", textAlign: "center" }}>[ 소 견 내 용 ]</div>
        <div style={{ border: "1px solid var(--form-border)", padding: "16px 18px", minHeight: 240, fontSize: 12.5, lineHeight: 2.1, color: "var(--form-border)", whiteSpace: "pre-wrap" }}>{data.opinion}</div>
      </div>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>위와 같이 소견서를 작성합니다.</div>
      <A4DateLine p={iss} />
      <A4IssuerBlock clinic={clinic} />
      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 진료확인서 ──────────────────────────────────────
function TreatmentProofPreviewA4({ data, clinic, patient }) {
  const start = splitYMD(data.startDate);
  const end   = splitYMD(data.endDate);
  const iss   = splitYMD(data.issueDate);
  const td = A4_TD, lh = A4_LH;

  return (
    <div className="a4-paper" style={{ width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)", padding: "42px 56px 36px", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-paper)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, color: "var(--text-primary)", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>의료법 시행규칙 [별지 제7호서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;개정 2019. 9. 27.&gt;</div>
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, letterSpacing: "1em", margin: "26px 0 22px", paddingLeft: "1em", color: "var(--ink-900)" }}>진 료 확 인 서</div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address}&nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh}>병&nbsp;&nbsp;&nbsp;&nbsp;명</td>
            <td style={td}>{data.mainDx}</td>
            <td style={lh}>질병분류기호</td>
            <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>진료 기간</td>
            <td colSpan={3} style={td}>
              <A4YMD p={start} />&nbsp; 부터&nbsp;&nbsp;&nbsp; <A4YMD p={end} />&nbsp; 까지
            </td>
          </tr>
          <tr>
            <td style={lh}>용&nbsp;&nbsp;&nbsp;&nbsp;도</td>
            <td colSpan={3} style={td}>{data.purpose}</td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비&nbsp;&nbsp;&nbsp;&nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 36 }}>{data.remarks || " "}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>위와 같이 진료하였음을 확인합니다.</div>
      <A4DateLine p={iss} />
      <A4IssuerBlock clinic={clinic} />
      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 입퇴원확인서 ────────────────────────────────────
function AdmissionProofPreviewA4({ data, clinic, patient }) {
  const adm = splitYMD(data.admitDate);
  const dis = splitYMD(data.dischargeDate);
  const iss = splitYMD(data.issueDate);
  const td = A4_TD, lh = A4_LH;

  return (
    <div className="a4-paper" style={{ width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)", padding: "42px 56px 36px", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-paper)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, color: "var(--text-primary)", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>의료법 시행규칙 [별지 제8호서식]</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;개정 2019. 9. 27.&gt;</div>
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 600, letterSpacing: "0.8em", margin: "26px 0 22px", paddingLeft: "0.8em", color: "var(--ink-900)" }}>입 퇴 원 확 인 서</div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address}&nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh}>병&nbsp;&nbsp;&nbsp;&nbsp;명</td>
            <td style={td}>{data.mainDx}</td>
            <td style={lh}>질병분류기호</td>
            <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>입원 연월일</td>
            <td colSpan={3} style={td}><A4YMD p={adm} />&nbsp; 부터</td>
          </tr>
          <tr>
            <td style={lh}>퇴원 연월일</td>
            <td colSpan={3} style={td}><A4YMD p={dis} />&nbsp; 까지</td>
          </tr>
          <tr>
            <td style={lh}>용&nbsp;&nbsp;&nbsp;&nbsp;도</td>
            <td colSpan={3} style={td}>{data.purpose}</td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비&nbsp;&nbsp;&nbsp;&nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 36 }}>{data.remarks || " "}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>위와 같이 입원·퇴원하였음을 확인합니다.</div>
      <A4DateLine p={iss} />
      <A4IssuerBlock clinic={clinic} />
      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 통원확인서 ──────────────────────────────────────
function OutpatientProofPreviewA4({ data, clinic, patient }) {
  const start = splitYMD(data.startDate);
  const end   = splitYMD(data.endDate);
  const iss   = splitYMD(data.issueDate);
  const td = A4_TD, lh = A4_LH;

  return (
    <div className="a4-paper" style={{ width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)", padding: "42px 56px 36px", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-paper)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, color: "var(--text-primary)", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--form-border)" }}></span>
          <span>통원확인서</span>
        </div>
        <div style={{ fontSize: 9.5, color: "var(--text-secondary)" }}>&lt;{data.issueDate}&gt;</div>
      </div>

      <div style={{ textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, letterSpacing: "1em", margin: "26px 0 22px", paddingLeft: "1em", color: "var(--ink-900)" }}>통 원 확 인 서</div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={lh}>환자의 성명</td>
            <td style={td}>{patient.name}</td>
            <td style={lh}>주민등록번호</td>
            <td style={td}>{patient.rrn}</td>
          </tr>
          <tr>
            <td style={lh}>환자의 주소</td>
            <td colSpan={3} style={td}>{patient.address}&nbsp;&nbsp;<span style={{ color: "var(--text-secondary)" }}>(전화번호: {patient.phone})</span></td>
          </tr>
          <tr>
            <td style={lh}>병&nbsp;&nbsp;&nbsp;&nbsp;명</td>
            <td style={td}>{data.mainDx}</td>
            <td style={lh}>질병분류기호</td>
            <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{data.icdCodes}</td>
          </tr>
          <tr>
            <td style={lh}>통원 기간</td>
            <td colSpan={3} style={td}>
              <A4YMD p={start} />&nbsp; 부터&nbsp;&nbsp;&nbsp; <A4YMD p={end} />&nbsp; 까지
            </td>
          </tr>
          <tr>
            <td style={lh}>통원 횟수</td>
            <td colSpan={3} style={td}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>{data.visitCount}</span> 회
            </td>
          </tr>
          <tr>
            <td style={lh}>내원 날짜</td>
            <td colSpan={3} style={{ ...td, lineHeight: 2, fontSize: 11 }}>{data.visitDates}</td>
          </tr>
          <tr>
            <td style={lh}>용&nbsp;&nbsp;&nbsp;&nbsp;도</td>
            <td colSpan={3} style={td}>{data.purpose}</td>
          </tr>
          <tr>
            <td style={{ ...lh, borderBottom: "1.5px solid var(--form-border)" }}>비&nbsp;&nbsp;&nbsp;&nbsp;고</td>
            <td colSpan={3} style={{ ...td, borderBottom: "1.5px solid var(--form-border)", minHeight: 36 }}>{data.remarks || " "}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--ink-900)", marginBottom: 14 }}>위와 같이 통원 치료하였음을 확인합니다.</div>
      <A4DateLine p={iss} />
      <A4IssuerBlock clinic={clinic} />
      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── Editor — 진료의뢰서 ──────────────────────────────────────────
function ReferralEditor({ data, onChange, clinic, patient, onChangePatient }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection title="환자 정보" right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Icon name="arrow-left-right" size={11} /> 환자 변경</button>}>
        <div style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)" }}>
          <Avatar name={patient.name} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>차트번호 {patient.chartNo} · {patient.phone}</div>
          </div>
        </div>
      </PanelSection>
      <PanelSection title="수신처">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="의료기관명"><TextField value={data.toClinicName} onChange={set("toClinicName")} placeholder="예: 서울대학교병원 정형외과" /></MiniField>
          <MiniField label="주소"><TextField value={data.toAddress} onChange={set("toAddress")} /></MiniField>
          <MiniField label="담당 의사 (선택)"><TextField value={data.toDoctor} onChange={set("toDoctor")} placeholder="예: 홍길동" /></MiniField>
        </div>
      </PanelSection>
      <PanelSection title="진단 정보">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="주 질병ㆍ부상"><TextField value={data.mainDx} onChange={set("mainDx")} /></MiniField>
          <MiniField label="부 질병ㆍ부상 (선택)"><TextField value={data.subDx} onChange={set("subDx")} /></MiniField>
          <MiniField label="질병분류기호"><TextField value={data.icdCodes} onChange={set("icdCodes")} mono /></MiniField>
          <MiniField label="발병 연월일"><TextField type="date" value={data.onsetDate} onChange={set("onsetDate")} mono /></MiniField>
        </div>
      </PanelSection>
      <PanelSection title="의뢰 내용">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="의뢰 목적"><TextField value={data.purpose} onChange={set("purpose")} /></MiniField>
          <MiniField label="현재까지의 치료 내용"><TextArea rows={3} value={data.treatment} onChange={set("treatment")} /></MiniField>
          <MiniField label="의뢰 내용"><TextArea rows={3} value={data.requestContent} onChange={set("requestContent")} /></MiniField>
          <MiniField label="비고"><TextArea rows={2} value={data.remarks} onChange={set("remarks")} /></MiniField>
        </div>
      </PanelSection>
      <PanelSection title="발급">
        <MiniField label="발급일자"><TextField type="date" value={data.issueDate} onChange={set("issueDate")} mono /></MiniField>
      </PanelSection>
    </div>
  );
}

// ── Editor — 소견서 ──────────────────────────────────────────────
function OpinionEditor({ data, onChange, clinic, patient, onChangePatient }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection title="환자 정보" right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Icon name="arrow-left-right" size={11} /> 환자 변경</button>}>
        <div style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)" }}>
          <Avatar name={patient.name} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>차트번호 {patient.chartNo} · {patient.phone}</div>
          </div>
        </div>
      </PanelSection>
      <PanelSection title="진단 정보">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <MiniField label="주 진단명"><TextField value={data.mainDx} onChange={set("mainDx")} /></MiniField>
          <MiniField label="부 진단명 (선택)"><TextField value={data.subDx} onChange={set("subDx")} /></MiniField>
          <MiniField label="질병분류기호"><TextField value={data.icdCodes} onChange={set("icdCodes")} mono /></MiniField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <MiniField label="발병 연월일"><TextField type="date" value={data.onsetDate} onChange={set("onsetDate")} mono /></MiniField>
          <MiniField label="진단 연월일"><TextField type="date" value={data.diagnosisDate} onChange={set("diagnosisDate")} mono /></MiniField>
        </div>
      </PanelSection>
      <PanelSection title="소견 내용" right={<button style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", color: "var(--text-brand)", padding: "3px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Icon name="wand-2" size={10} /> AI로 작성</button>}>
        <TextArea rows={7} value={data.opinion} onChange={set("opinion")} placeholder="환자 상태 및 소견을 기재하십시오." />
      </PanelSection>
      <PanelSection title="발급">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="발급일자"><TextField type="date" value={data.issueDate} onChange={set("issueDate")} mono /></MiniField>
          <MiniField label="용도">
            <select value={data.purpose} onChange={(e) => set("purpose")(e.target.value)} style={{ ...fieldInput, paddingRight: 26, appearance: "none" }}>
              <option>보험 청구용</option><option>회사 제출용</option><option>법원/관공서 제출용</option><option>본인 보관용</option><option>기타</option>
            </select>
          </MiniField>
        </div>
        <div style={{ marginTop: 10 }}><MiniField label="비고"><TextArea rows={2} value={data.remarks} onChange={set("remarks")} /></MiniField></div>
      </PanelSection>
    </div>
  );
}

// ── Editor — 확인서 공통 (진료확인서 / 입퇴원확인서 / 통원확인서) ─
function CertEditor({ data, onChange, patient, onChangePatient, certType }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  const isAdmission  = certType === "admission_proof";
  const isOutpatient = certType === "outpatient_proof";
  const purposeSelect = (
    <select value={data.purpose} onChange={(e) => set("purpose")(e.target.value)} style={{ ...fieldInput, paddingRight: 26, appearance: "none" }}>
      <option>보험 청구용</option><option>회사 제출용</option><option>학교 제출용</option><option>법원/관공서 제출용</option><option>본인 보관용</option><option>기타</option>
    </select>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection title="환자 정보" right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Icon name="arrow-left-right" size={11} /> 환자 변경</button>}>
        <div style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)" }}>
          <Avatar name={patient.name} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>차트번호 {patient.chartNo} · {patient.phone}</div>
          </div>
        </div>
      </PanelSection>
      <PanelSection title="진단 정보">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="병명" span={2}><TextField value={data.mainDx} onChange={set("mainDx")} /></MiniField>
          <MiniField label="질병분류기호" span={2}><TextField value={data.icdCodes} onChange={set("icdCodes")} mono /></MiniField>
        </div>
      </PanelSection>
      <PanelSection title={isAdmission ? "입퇴원 기간" : isOutpatient ? "통원 정보" : "진료 기간"}>
        {isAdmission ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniField label="입원일"><TextField type="date" value={data.admitDate} onChange={set("admitDate")} mono /></MiniField>
            <MiniField label="퇴원일"><TextField type="date" value={data.dischargeDate} onChange={set("dischargeDate")} mono /></MiniField>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniField label="시작일"><TextField type="date" value={data.startDate} onChange={set("startDate")} mono /></MiniField>
            <MiniField label="종료일"><TextField type="date" value={data.endDate} onChange={set("endDate")} mono /></MiniField>
            {isOutpatient && (
              <>
                <MiniField label="총 통원 횟수"><TextField value={String(data.visitCount)} onChange={(v) => set("visitCount")(Number(v))} mono placeholder="8" /></MiniField>
                <MiniField label="" span={1}><div style={{ height: 10 }} /></MiniField>
                <MiniField label="내원 날짜 (쉼표 구분)" span={2}>
                  <TextArea rows={3} value={data.visitDates} onChange={set("visitDates")} placeholder="2026-04-10, 2026-04-15, ..." />
                </MiniField>
              </>
            )}
          </div>
        )}
      </PanelSection>
      <PanelSection title="발급">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="발급일자"><TextField type="date" value={data.issueDate} onChange={set("issueDate")} mono /></MiniField>
          <MiniField label="용도">{purposeSelect}</MiniField>
        </div>
        <div style={{ marginTop: 10 }}><MiniField label="비고"><TextArea rows={2} value={data.remarks} onChange={set("remarks")} /></MiniField></div>
      </PanelSection>
    </div>
  );
}

// ── A4 Preview — 진료비 세부내역서 ───────────────────────────────
function FeeDetailPreviewA4({ patient, clinic, meta }) {
  const fmt = (n) => n > 0 ? n.toLocaleString("ko-KR") : "–";
  const totalSelf = MF_FEE_ITEMS.reduce((s, i) => s + i.selfPay, 0);
  const totalIns  = MF_FEE_ITEMS.reduce((s, i) => s + i.insurancePay, 0);
  const totalNon  = MF_FEE_ITEMS.reduce((s, i) => s + i.nonCovered, 0);
  const grandTotal = totalSelf + totalIns + totalNon;
  const patientTotal = totalSelf + totalNon;

  const th = {
    padding: "7px 8px", background: "var(--form-table-header-bg)", borderBottom: "1px solid var(--form-border)",
    borderRight: "1px solid var(--form-border)", fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textAlign: "center",
  };
  const td = {
    padding: "6px 10px", borderBottom: "1px solid var(--form-border-soft)", borderRight: "1px solid var(--form-border-soft)",
    fontSize: 11.5, verticalAlign: "middle", color: "var(--form-border)",
  };
  const numTd = { ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11 };
  const totTh = { ...th, background: "var(--form-total-row-bg)", fontWeight: 700, fontSize: 12, borderBottom: "1.5px solid var(--form-border)" };
  const totTd = { ...numTd, background: "var(--form-total-row-bg)", fontWeight: 700, borderBottom: "1.5px solid var(--form-border)" };

  return (
    <div className="a4-paper" style={{
      width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)",
      padding: "48px 56px 40px", fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-paper)",
      position: "relative",
    }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 600, letterSpacing: "0.7em", paddingLeft: "0.7em", color: "var(--ink-900)", marginBottom: 5 }}>
          진료비 세부내역서
        </div>
        <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>의료법 시행규칙 제17조의2에 의거 발급</div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--form-border)", marginBottom: 22 }}>
        {[
          ["의료기관", clinic.name],
          ["발급일", meta.issueDate],
          ["주소", clinic.address],
          ["진료 기간", `${meta.startDate} ~ ${meta.endDate} (${meta.visits}회)`],
          ["환자 성명", patient.name],
          ["주민등록번호", patient.rrn],
          ["차트번호", patient.chartNo],
          ["전화번호", patient.phone],
        ].map(([label, value], i) => (
          <div key={i} style={{
            display: "flex",
            borderBottom: i < 6 ? "1px solid var(--form-border-soft)" : "none",
            borderRight: i % 2 === 0 ? "1px solid var(--form-border-soft)" : "none",
          }}>
            <div style={{ width: 88, padding: "6px 10px", background: "var(--form-table-header-bg)", fontSize: 10.5, fontWeight: 600, color: "var(--text-primary)", flexShrink: 0 }}>{label}</div>
            <div style={{ flex: 1, padding: "6px 10px", fontSize: 11 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Fee table */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border)", marginBottom: 22 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: 160, textAlign: "left" }} rowSpan={2}>항목 구분</th>
            <th style={{ ...th }} colSpan={2}>급&nbsp;&nbsp;여</th>
            <th style={{ ...th }} rowSpan={2}>비급여</th>
            <th style={{ ...th }} rowSpan={2}>합&nbsp;&nbsp;계</th>
          </tr>
          <tr>
            <th style={{ ...th, fontSize: 10 }}>본인부담</th>
            <th style={{ ...th, fontSize: 10 }}>공단부담</th>
          </tr>
        </thead>
        <tbody>
          {MF_FEE_ITEMS.map((item, i) => {
            const rowTotal = item.selfPay + item.insurancePay + item.nonCovered;
            return (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 500 }}>{item.category}</td>
                <td style={numTd}>{fmt(item.selfPay)}</td>
                <td style={numTd}>{fmt(item.insurancePay)}</td>
                <td style={numTd}>{fmt(item.nonCovered)}</td>
                <td style={numTd}>{fmt(rowTotal)}</td>
              </tr>
            );
          })}
          <tr>
            <td style={{ ...totTh, textAlign: "left" }}>합&nbsp;&nbsp;&nbsp;계</td>
            <td style={totTd}>{totalSelf.toLocaleString("ko-KR")}</td>
            <td style={totTd}>{totalIns.toLocaleString("ko-KR")}</td>
            <td style={totTd}>{totalNon.toLocaleString("ko-KR")}</td>
            <td style={totTd}>{grandTotal.toLocaleString("ko-KR")}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "공단 부담금",       value: totalIns,  sub: "건강보험공단 지급" },
          { label: "급여 본인부담금",   value: totalSelf, sub: "본인 직접 납부" },
          { label: "비급여 본인부담금", value: totalNon,  sub: "급여 미적용 항목" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "12px 14px", background: "var(--form-cell-alt-bg)" }}>
            <div style={{ fontSize: 10.5, color: "var(--text-secondary)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ink-900)" }}>
              {value.toLocaleString("ko-KR")} <span style={{ fontSize: 11, fontWeight: 500 }}>원</span>
            </div>
            <div style={{ fontSize: 9.5, color: "var(--ink-400)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Patient total */}
      <div style={{
        background: "var(--form-payment-bg)", border: "1.5px solid var(--form-payment-border)", borderRadius: 10,
        padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>환자 납부 총액</div>
          <div style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 1 }}>급여 본인부담 + 비급여 합산</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--form-payment-text)" }}>
          {patientTotal.toLocaleString("ko-KR")} <span style={{ fontSize: 13 }}>원</span>
        </div>
      </div>

      <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.8, borderTop: "0.5px solid var(--form-border-soft)", paddingTop: 10, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>유의사항</div>
        <div>1. 본 내역서는 의료법 시행규칙 제17조의2에 의거하여 발급됩니다.</div>
        <div>2. 급여 항목의 공단 부담금은 건강보험공단에 직접 청구하며, 환자는 본인부담금만 납부합니다.</div>
        <div>3. 비급여 항목은 건강보험이 적용되지 않으며, 전액 본인이 부담합니다.</div>
        <div>4. 이의가 있으실 경우 원무과 또는 건강보험심사평가원(☎1644-2000)에 문의하시기 바랍니다.</div>
      </div>

      <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-primary)", lineHeight: 2 }}>
        <div>{clinic.name}</div>
        <div style={{ color: "var(--text-secondary)" }}>한의사 {clinic.doctorName} <span style={{ fontSize: 10 }}>(서명)</span></div>
      </div>

      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── A4 Preview — 세부산정내역 ─────────────────────────────────────
function CalcDetailPreviewA4({ patient, clinic, meta }) {
  const grouped = MF_CALC_ITEMS.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const grandTotal    = MF_CALC_ITEMS.reduce((s, i) => s + i.total, 0);
  const coveredTotal  = MF_CALC_ITEMS.filter(i => i.type === "급여").reduce((s, i) => s + i.total, 0);
  const nonCovTotal   = MF_CALC_ITEMS.filter(i => i.type === "비급여").reduce((s, i) => s + i.total, 0);

  const th = {
    padding: "6px 7px", background: "var(--form-table-header-bg)", borderBottom: "1px solid var(--form-border)",
    borderRight: "1px solid var(--form-border-soft)", fontSize: 10.5, fontWeight: 600, color: "var(--text-primary)", textAlign: "center",
  };
  const td = {
    padding: "5px 7px", borderBottom: "1px solid var(--form-border-light)", borderRight: "1px solid var(--form-border-light)",
    fontSize: 10.5, verticalAlign: "middle", color: "var(--form-border)",
  };
  const numTd = { ...td, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 10 };

  return (
    <div className="a4-paper" style={{
      width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)",
      padding: "40px 48px 36px", fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-paper)",
      position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, letterSpacing: "0.5em", paddingLeft: "0.5em", color: "var(--ink-900)" }}>세부산정내역</div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>진료비 항목별 세부 산정 내역서</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, lineHeight: 2, color: "var(--text-primary)" }}>
          <div><span style={{ color: "var(--text-secondary)" }}>환자: </span>{patient.name} ({patient.rrn})</div>
          <div><span style={{ color: "var(--text-secondary)" }}>차트: </span>{patient.chartNo} · {patient.phone}</div>
          <div><span style={{ color: "var(--text-secondary)" }}>기간: </span>{meta.startDate} ~ {meta.endDate}</div>
          <div><span style={{ color: "var(--text-secondary)" }}>의료기관: </span>{clinic.name}</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "1.5px solid var(--form-border)", borderLeft: "1px solid var(--form-border-soft)", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: 50 }}>진료일</th>
            <th style={{ ...th, width: 60 }}>코드</th>
            <th style={{ ...th }}>항목명</th>
            <th style={{ ...th, width: 48 }}>구분</th>
            <th style={{ ...th, width: 34 }}>횟수</th>
            <th style={{ ...th, width: 74 }}>단가(원)</th>
            <th style={{ ...th, width: 82, borderRight: "1px solid var(--form-border)" }}>금액(원)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, items]) =>
            items.map((item, j) => (
              <tr key={`${date}-${j}`} style={{ borderBottom: j === items.length - 1 ? "1px solid var(--form-border-divider)" : undefined }}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 10, textAlign: "center", color: "var(--text-secondary)", background: "var(--form-cell-alt-bg)", borderBottom: j === items.length - 1 ? "1px solid var(--form-border-divider)" : td.borderBottom }}>
                  {j === 0 ? date : ""}
                </td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)" }}>{item.code}</td>
                <td style={td}>{item.name}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span style={{
                    display: "inline-block", padding: "1px 5px", borderRadius: 4, fontSize: 9.5, fontWeight: 600,
                    background: item.type === "급여" ? "var(--form-covered-bg)" : "var(--form-noncovered-bg)",
                    color: item.type === "급여" ? "var(--form-covered-text)" : "var(--form-noncovered-text)",
                    border: `1px solid ${item.type === "급여" ? "var(--form-covered-border)" : "var(--form-noncovered-border)"}`,
                  }}>{item.type}</span>
                </td>
                <td style={numTd}>{item.count}</td>
                <td style={numTd}>{item.unit.toLocaleString("ko-KR")}</td>
                <td style={{ ...numTd, borderRight: "1px solid var(--form-border-soft)" }}>{item.total.toLocaleString("ko-KR")}</td>
              </tr>
            ))
          )}
          <tr style={{ borderTop: "1.5px solid var(--form-border)" }}>
            <td colSpan={5} style={{ ...td, background: "var(--form-table-header-bg)", fontWeight: 700, borderRight: "none", borderBottom: "1.5px solid var(--form-border)" }}>합&nbsp;&nbsp;&nbsp;계</td>
            <td style={{ ...numTd, background: "var(--form-table-header-bg)", fontWeight: 700, borderBottom: "1.5px solid var(--form-border)" }}></td>
            <td style={{ ...numTd, background: "var(--form-table-header-bg)", fontWeight: 700, borderRight: "1px solid var(--form-border-soft)", borderBottom: "1.5px solid var(--form-border)" }}>{grandTotal.toLocaleString("ko-KR")}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {[
          { label: "총 진료비",   value: grandTotal,   color: "var(--text-primary)" },
          { label: "급여 합계",   value: coveredTotal, color: "var(--form-covered-total-text)" },
          { label: "비급여 합계", value: nonCovTotal,  color: "var(--form-noncovered-total-text)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 14px", background: "var(--form-cell-alt-bg)" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
              {value.toLocaleString("ko-KR")} <span style={{ fontSize: 10, fontWeight: 500 }}>원</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9.5, color: "var(--text-secondary)", lineHeight: 1.8, borderTop: "0.5px solid var(--form-border-soft)", paddingTop: 10, marginBottom: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 3, color: "var(--text-primary)" }}>유의사항</div>
        <div>1. 본 내역은 건강보험 청구 기준으로 산정된 금액이며, 실제 납부액은 급여 본인부담금과 비급여 금액의 합산입니다.</div>
        <div>2. 급여 항목의 본인부담률은 외래 30%, 입원 20%가 적용됩니다(경감 대상자 별도).</div>
        <div>3. 세부 내역에 이의가 있으실 경우 원무과에 문의하시기 바랍니다.</div>
      </div>

      <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-primary)", lineHeight: 2 }}>
        <div>발급일: {meta.issueDate}</div>
        <div>{clinic.name} · 한의사 {clinic.doctorName}</div>
      </div>

      <div style={{ position: "absolute", right: 24, bottom: 12, fontSize: 8.5, color: "var(--ink-400)" }}>210mm×297mm[백상지 80g/㎡]</div>
    </div>
  );
}

// ── Editor Panel — 진료비 세부내역서 / 세부산정내역 ──────────────
function BillingEditor({ data, onChange, patient, onChangePatient, label }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  const totalSelf = MF_FEE_ITEMS.reduce((s, i) => s + i.selfPay, 0);
  const totalIns  = MF_FEE_ITEMS.reduce((s, i) => s + i.insurancePay, 0);
  const totalNon  = MF_FEE_ITEMS.reduce((s, i) => s + i.nonCovered, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection
        title="환자 정보"
        right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
          <Icon name="arrow-left-right" size={11} /> 환자 변경
        </button>}
      >
        <div style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)" }}>
          <Avatar name={patient.name} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{patient.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{patient.rrn}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>차트번호 {patient.chartNo} · {patient.phone}</div>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="진료 기간">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniField label="시작일"><TextField type="date" value={data.startDate} onChange={set("startDate")} mono /></MiniField>
          <MiniField label="종료일"><TextField type="date" value={data.endDate} onChange={set("endDate")} mono /></MiniField>
          <MiniField label="총 내원 횟수"><TextField value={String(data.visits)} onChange={(v) => set("visits")(Number(v))} mono placeholder="8" /></MiniField>
          <MiniField label="발급일"><TextField type="date" value={data.issueDate} onChange={set("issueDate")} mono /></MiniField>
        </div>
      </PanelSection>

      <PanelSection title="항목 요약" hint="진료 기록에서 자동 산출됩니다.">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MF_FEE_ITEMS.map((item, i) => {
            const rowTotal = item.selfPay + item.insurancePay + item.nonCovered;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 11.5 }}>
                <span style={{ color: "var(--text-secondary)" }}>{item.category}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 500 }}>{rowTotal.toLocaleString("ko-KR")} 원</span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-sm)", fontSize: 12, marginTop: 4 }}>
            <span style={{ fontWeight: 600, color: "var(--text-brand)" }}>환자 납부 총액</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-brand)" }}>{(totalSelf + totalNon).toLocaleString("ko-KR")} 원</span>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="발급자" right={<span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-muted)" }}><Icon name="info" size={10} /> 기본 의료기관 정보</span>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["의료기관", MF_CLINIC.name], ["한의사 면허", `제 ${MF_CLINIC.license} 호`], ["발급의", MF_CLINIC.doctorName]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>{k}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

// ── Placeholder Preview (for other tabs) ─────────────────────────
function PlaceholderPreviewA4({ label, desc }) {
  return (
    <div style={{
      width: 794, minHeight: 1123, background: "var(--bg-surface)", color: "var(--form-border)",
      padding: 56, fontFamily: "var(--font-sans)",
      boxShadow: "var(--shadow-paper)",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%", border: "1.5px dashed var(--ink-300)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
      }}>
        <Icon name="file-text" size={26} style={{ color: "var(--ink-400)" }} />
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--text-primary)", letterSpacing: "0.4em", paddingLeft: "0.4em" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{desc}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 36, padding: "8px 16px", border: "1px solid var(--border-subtle)", borderRadius: 999, background: "var(--bg-raised)" }}>
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
        right={<button onClick={onChangePatient} style={{ background: "none", border: "none", color: "var(--text-brand)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
          <Icon name="arrow-left-right" size={11} /> 환자 변경
        </button>}
      >
        <div style={{
          display: "flex", gap: 12, padding: "10px 12px", background: "var(--brand-subtle)",
          border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)",
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
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "var(--text-brand)", background: "var(--brand-subtle)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--brand-muted)" }}>
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
        right={<button style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", color: "var(--text-brand)", padding: "3px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>의료기관</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{clinic.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>한의사 면허</span><span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>제 {clinic.license} 호</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
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
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "var(--bg-raised)", color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
  const [injuryData, setInjuryData] = useStateMF(MF_DEFAULT_INJURY);
  const [feeData, setFeeData] = useStateMF(MF_DEFAULT_FEE);
  const [referralData, setReferralData] = useStateMF(MF_DEFAULT_REFERRAL);
  const [opinionData, setOpinionData] = useStateMF(MF_DEFAULT_OPINION);
  const [treatmentProofData, setTreatmentProofData] = useStateMF(MF_DEFAULT_TREATMENT_PROOF);
  const [admissionProofData, setAdmissionProofData] = useStateMF(MF_DEFAULT_ADMISSION_PROOF);
  const [outpatientProofData, setOutpatientProofData] = useStateMF(MF_DEFAULT_OUTPATIENT_PROOF);
  const [patient, setPatient] = useStateMF(MF_PATIENT);
  const [pickerOpen, setPickerOpen] = useStateMF(false);
  const [historyOpen, setHistoryOpen] = useStateMF(false);
  const [panelWidth, setPanelWidth] = useStateMF(400);
  const stageRef = useRefMF(null);
  const isDragging = useRefMF(false);

  useEffectMF(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const bodyEl = stageRef.current?.parentElement;
      if (!bodyEl) return;
      const rect = bodyEl.getBoundingClientRect();
      const newWidth = Math.max(280, Math.min(700, rect.right - e.clientX));
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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
  const isInjury     = activeTab === "injury";
  const isFeeDetail      = activeTab === "fee_detail";
  const isCalcDetail     = activeTab === "calc_detail";
  const isReferral       = activeTab === "referral";
  const isOpinion        = activeTab === "opinion";
  const isTreatmentProof = activeTab === "treatment_proof";
  const isAdmissionProof = activeTab === "admission_proof";
  const isOutpatientProof= activeTab === "outpatient_proof";

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
                color: active ? "var(--text-brand)" : "var(--text-secondary)",
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
          background: "linear-gradient(180deg, var(--bg-raised) 0%, var(--bg-sunken) 100%)",
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
              : isInjury
              ? <InjuryPreviewA4 data={injuryData} clinic={MF_CLINIC} patient={patient} />
              : isFeeDetail
              ? <FeeDetailPreviewA4 patient={patient} clinic={MF_CLINIC} meta={feeData} />
              : isCalcDetail
              ? <CalcDetailPreviewA4 patient={patient} clinic={MF_CLINIC} meta={feeData} />
              : isReferral
              ? <ReferralPreviewA4 data={referralData} clinic={MF_CLINIC} patient={patient} />
              : isOpinion
              ? <OpinionPreviewA4 data={opinionData} clinic={MF_CLINIC} patient={patient} />
              : isTreatmentProof
              ? <TreatmentProofPreviewA4 data={treatmentProofData} clinic={MF_CLINIC} patient={patient} />
              : isAdmissionProof
              ? <AdmissionProofPreviewA4 data={admissionProofData} clinic={MF_CLINIC} patient={patient} />
              : isOutpatientProof
              ? <OutpatientProofPreviewA4 data={outpatientProofData} clinic={MF_CLINIC} patient={patient} />
              : <PlaceholderPreviewA4 label={MF_TABS.find(t => t.key === activeTab)?.label} desc={MF_TABS.find(t => t.key === activeTab)?.desc} />
            }
          </div>
        </div>

        {/* Resize divider */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            isDragging.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          style={{ width: 5, flexShrink: 0, cursor: "col-resize", position: "relative", zIndex: 10, background: "transparent" }}
        >
          <div style={{
            position: "absolute", inset: 0,
            borderLeft: "1px solid var(--border-subtle)",
            transition: "border-color 0.15s",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 3, height: 28, borderRadius: 2,
            background: "var(--border-default)", opacity: 0.6,
          }} />
        </div>

        {/* Right panel */}
        <div style={{
          width: panelWidth, background: "var(--bg-surface)",
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>서식 입력</div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>좌측 미리보기에 실시간 반영됩니다.</div>
            </div>
            {(isDiagnosis || isInjury || isFeeDetail || isCalcDetail || isReferral || isOpinion || isTreatmentProof || isAdmissionProof || isOutpatientProof) && <button onClick={() => {
              if (isDiagnosis) setData(MF_DEFAULT_DX);
              else if (isInjury) setInjuryData(MF_DEFAULT_INJURY);
              else if (isFeeDetail || isCalcDetail) setFeeData(MF_DEFAULT_FEE);
              else if (isReferral) setReferralData(MF_DEFAULT_REFERRAL);
              else if (isOpinion) setOpinionData(MF_DEFAULT_OPINION);
              else if (isTreatmentProof) setTreatmentProofData(MF_DEFAULT_TREATMENT_PROOF);
              else if (isAdmissionProof) setAdmissionProofData(MF_DEFAULT_ADMISSION_PROOF);
              else if (isOutpatientProof) setOutpatientProofData(MF_DEFAULT_OUTPATIENT_PROOF);
            }} style={{
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
            ) : isInjury ? (
              <InjuryEditor data={injuryData} onChange={setInjuryData} clinic={MF_CLINIC} patient={patient} onChangePatient={() => setPickerOpen(true)} />
            ) : (isFeeDetail || isCalcDetail) ? (
              <BillingEditor data={feeData} onChange={setFeeData} patient={patient} onChangePatient={() => setPickerOpen(true)} label={MF_TABS.find(t => t.key === activeTab)?.label} />
            ) : isReferral ? (
              <ReferralEditor data={referralData} onChange={setReferralData} clinic={MF_CLINIC} patient={patient} onChangePatient={() => setPickerOpen(true)} />
            ) : isOpinion ? (
              <OpinionEditor data={opinionData} onChange={setOpinionData} clinic={MF_CLINIC} patient={patient} onChangePatient={() => setPickerOpen(true)} />
            ) : (isTreatmentProof || isAdmissionProof || isOutpatientProof) ? (
              <CertEditor data={isTreatmentProof ? treatmentProofData : isAdmissionProof ? admissionProofData : outpatientProofData} onChange={isTreatmentProof ? setTreatmentProofData : isAdmissionProof ? setAdmissionProofData : setOutpatientProofData} patient={patient} onChangePatient={() => setPickerOpen(true)} certType={activeTab} />
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
            background: "var(--bg-raised)", fontSize: 11, color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jade-500)" }}></span>
              자동 저장됨 · 방금 전
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
              <Icon name="shield-check" size={11} /> {
                isDiagnosis      ? "의료법 별지 제5호의2서식" :
                isInjury         ? "의료법 별지 제5호의3서식" :
                isReferral       ? "의료법 별지 제12호서식" :
                isOpinion        ? "소견서" :
                isTreatmentProof ? "의료법 별지 제7호서식" :
                isAdmissionProof ? "의료법 별지 제8호서식" :
                isOutpatientProof? "통원확인서" :
                isFeeDetail      ? "의료법 시행규칙 제17조의2" :
                isCalcDetail     ? "세부산정내역서" : "서식 준비 중"
              }
            </span>
          </div>
        </div>
      </div>

      {/* Bottom history — collapsible */}
      <div style={{ background: "var(--bg-page)", flexShrink: 0, borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => setHistoryOpen(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
            borderBottom: historyOpen ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="history" size={13} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>최근 발급 이력</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{MF_HISTORY.length}건</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-brand)" }}>전체 보기</span>
            <Icon name={historyOpen ? "chevron-down" : "chevron-up"} size={14} style={{ color: "var(--text-muted)" }} />
          </div>
        </button>
        {historyOpen && (
          <div style={{ padding: "0 24px 20px" }}>
            <IssueHistory />
          </div>
        )}
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
