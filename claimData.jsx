// KoMES — 보험 청구 Mock Data
// 세 가지 보험 유형(건강보험 / 첩약 시범사업 / 자동차보험)별 명세서

const CLAIM_DOCTORS = [
  { id: "dr_kim", name: "김민준", rrn: "911226-1", visitDays: 21 },
  { id: "dr_lee", name: "이지영", rrn: "850314-2", visitDays: 18 },
];

// 진료의 / 차트번호 등 풀
const PATIENT_POOL = [
  { chartNo: "C-00231", name: "강경구", rrn: "960411-1", gender: "남", age: 29 },
  { chartNo: "C-00187", name: "강대훈", rrn: "850315-1", gender: "남", age: 40 },
  { chartNo: "C-00099", name: "강상중", rrn: "521008-1", gender: "남", age: 73 },
  { chartNo: "C-00302", name: "강순천", rrn: "700530-2", gender: "여", age: 55 },
  { chartNo: "C-00211", name: "강영애", rrn: "640723-2", gender: "여", age: 61 },
  { chartNo: "C-00345", name: "강은주", rrn: "700530-2", gender: "여", age: 55 },
  { chartNo: "C-00412", name: "강현교", rrn: "710522-1", gender: "남", age: 54 },
  { chartNo: "C-00501", name: "강현우", rrn: "890817-1", gender: "남", age: 36 },
  { chartNo: "C-00478", name: "강혜은", rrn: "830610-2", gender: "여", age: 42 },
  { chartNo: "C-00567", name: "강혜주", rrn: "000221-4", gender: "여", age: 25 },
  { chartNo: "C-00611", name: "박서연", rrn: "880509-2", gender: "여", age: 37 },
  { chartNo: "C-00622", name: "정유미", rrn: "950318-2", gender: "여", age: 30 },
  { chartNo: "C-00701", name: "오세훈", rrn: "790620-1", gender: "남", age: 46 },
  { chartNo: "C-00742", name: "이재현", rrn: "911226-1", gender: "남", age: 34 },
  { chartNo: "C-00819", name: "최민호", rrn: "650412-1", gender: "남", age: 60 },
  { chartNo: "C-00822", name: "한지민", rrn: "920901-2", gender: "여", age: 33 },
  { chartNo: "C-00901", name: "노태우", rrn: "490810-1", gender: "남", age: 76 },
  { chartNo: "C-00922", name: "윤석민", rrn: "871104-1", gender: "남", age: 38 },
];

// 진료 카테고리
const VISIT_KINDS_HEALTH = ["보험", "의료급여"];
const VISIT_KINDS_HERBAL = ["시범사업"];
const VISIT_KINDS_AUTO = ["자동차"];

const AUTO_INSURERS = ["한화손해보험", "현대해상", "DB손해보험", "삼성화재", "KB손해보험", "메리츠화재"];

// ── 건강보험 명세서 시드 ─────────────────────────────────────
function makeHealthClaims() {
  const list = [];
  let n = 1;
  // base 30 normal claims
  PATIENT_POOL.forEach((pt, i) => {
    const visits = (i % 5) + 1;
    const kind = i % 9 === 0 ? "의료급여" : "보험";
    const base = 18900 + (i % 4) * 1500;
    const total = base + (i % 3) * 4200;
    const copayRate = kind === "의료급여" ? 0.15 : 0.30;
    const copay = Math.round(total * copayRate / 10) * 10;
    const insurer = total - copay;
    list.push({
      id: `H${String(n).padStart(5, "0")}`,
      seq: String(n).padStart(5, "0"),
      type: "health",
      visitDate: `2026-04-${String(((i * 3) % 28) + 1).padStart(2, "0")}`,
      patientName: pt.name,
      chartNo: pt.chartNo,
      rrn: pt.rrn,
      doctor: i % 2 === 0 ? "이재현" : "이지영",
      kind: kind, // 보험 / 의료급여
      visitCount: visits,
      claimAmount: total,
      disabilityFee: 0,
      supportFund: 0,
      copay: copay,
      coveredTotal: total,
      excluded: false,
      error: null,
    });
    n++;
  });
  // inject errors on a few
  list[3].error = { code: "E0102", msg: "주민등록번호 자격 확인 실패 (자격 상실)" };
  list[7].error = { code: "E0214", msg: "상병코드 누락 — M54.5 등 진료의 상병 미입력" };
  list[11].error = { code: "E0308", msg: "본인부담금 산정 오류 — 차등수가 적용 미반영" };
  list[15].error = { code: "E0102", msg: "주민등록번호 자격 확인 실패 (피부양자 등록 누락)" };
  return list;
}

// ── 첩약 시범사업 명세서 시드 ─────────────────────────────────
function makeHerbalClaims() {
  const list = [];
  const samples = PATIENT_POOL.slice(0, 12);
  let n = 1;
  samples.forEach((pt, i) => {
    const days = [10, 20, 30][i % 3]; // 첩약 일수
    const ingredientCost = days * 14500;
    const consultFee = 38000;
    const total = ingredientCost + consultFee;
    const copay = Math.round(total * 0.30 / 10) * 10;
    list.push({
      id: `B${String(n).padStart(5, "0")}`,
      seq: String(n).padStart(5, "0"),
      type: "herbal",
      visitDate: `2026-04-${String(((i * 2) % 28) + 1).padStart(2, "0")}`,
      patientName: pt.name,
      chartNo: pt.chartNo,
      rrn: pt.rrn,
      doctor: i % 2 === 0 ? "이재현" : "이지영",
      kind: "시범사업",
      condition: ["요추통", "월경통", "안면신경마비", "뇌혈관질환후유증"][i % 4],
      herbalDays: days, // 10/20/30
      formula: ["당귀수산", "오적산", "쌍화탕", "보중익기탕"][i % 4],
      claimAmount: total,
      ingredientCost: ingredientCost,
      consultFee: consultFee,
      copay: copay,
      coveredTotal: total - copay,
      excluded: false,
      error: null,
    });
    n++;
  });
  list[2].error = { code: "E0421", msg: "첩약 처방내역 누락 — 처방전 PDF 첨부 필요" };
  list[6].error = { code: "E0425", msg: "대상 질환코드 불일치 — 시범사업 적용 대상 외" };
  return list;
}

// ── 자동차보험 명세서 시드 ─────────────────────────────────
function makeAutoClaims() {
  const list = [];
  const samples = PATIENT_POOL.slice(2, 14);
  let n = 1;
  samples.forEach((pt, i) => {
    const insurer = AUTO_INSURERS[i % AUTO_INSURERS.length];
    const visits = (i % 7) + 2;
    const perVisit = 42000 + (i % 4) * 6500;
    const total = perVisit * Math.ceil(visits / 2);
    list.push({
      id: `A${String(n).padStart(5, "0")}`,
      seq: String(n).padStart(5, "0"),
      claimDocNo: `2026-04-${String(1000 + n)}`,
      type: "auto",
      visitDate: `2026-04-${String(((i * 4) % 28) + 1).padStart(2, "0")}`,
      patientName: pt.name,
      chartNo: pt.chartNo,
      rrn: pt.rrn,
      doctor: i % 2 === 0 ? "이재현" : "이지영",
      kind: "자동차",
      autoInsurer: insurer,
      accidentNo: `${insurer.slice(0, 2)}-26-${String(10000 + i * 17).padStart(5, "0")}`,
      claimAmount: total,
      copay: 0,
      coveredTotal: total,
      excluded: false,
      error: null,
    });
    n++;
  });
  list[4].error = { code: "E0517", msg: "사고접수번호 미확인 — 보험사 회신 대기" };
  list[8].error = { code: "E0521", msg: "수가 적용 오류 — 자보 수가기준표 미반영" };
  return list;
}

const CLAIM_TYPES = [
  {
    key: "health",
    label: "건강보험",
    sublabel: "원외 처방·진료 명세서",
    icon: "shield-plus",
    pillColor: "var(--jade-500)",
  },
  {
    key: "herbal",
    label: "첩약 건강보험 시범사업",
    sublabel: "한약 첩약 시범사업 대상자",
    icon: "leaf",
    pillColor: "var(--claim-herbal-pill)",
  },
  {
    key: "auto",
    label: "자동차보험",
    sublabel: "교통사고 진료비 청구",
    icon: "car",
    pillColor: "var(--claim-auto-pill)",
  },
];

const HEALTH_CLAIMS_SEED = makeHealthClaims();
const HERBAL_CLAIMS_SEED = makeHerbalClaims();
const AUTO_CLAIMS_SEED = makeAutoClaims();

Object.assign(window, {
  CLAIM_TYPES, CLAIM_DOCTORS,
  HEALTH_CLAIMS_SEED, HERBAL_CLAIMS_SEED, AUTO_CLAIMS_SEED,
  AUTO_INSURERS,
});
