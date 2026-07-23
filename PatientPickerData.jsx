// KoMES — Patient Picker Modal (환자 변경)
// 서식 발급 화면에서 환자 변경을 위해 사용
const { useState: useStatePP, useMemo: useMemoPP, useEffect: useEffectPP, useRef: useRefPP } = React;

// ── Sample patient pool ──────────────────────────────────────────
const PP_PATIENTS = [
  { id: 1,  name: "박지영", gender: "여", age: 39, rrn: "850523-2******", rrnFull: "850523-2123456", phone: "010-3421-9087", address: "서울특별시 강남구 테헤란로 123, 405동 1502호", chartNo: "00012483", lastVisit: "2026-05-16", tags: ["VIP","자보"],     chief: "경추 염좌 (경혈침술·부항술 중)" },
  { id: 2,  name: "홍길동", gender: "남", age: 40, rrn: "850412-1******", rrnFull: "850412-1234567", phone: "010-1234-5678", address: "서울 마포구 합정동 22-3",                           chartNo: "00010012", lastVisit: "2026-05-16", tags: ["VIP"],            chief: "두통, 어지러움" },
  { id: 3,  name: "김수진", gender: "여", age: 53, rrn: "721130-2******", rrnFull: "721130-2345678", phone: "010-9876-5432", address: "서울 마포구 합정동 22-3",                           chartNo: "00010013", lastVisit: "2026-05-16", tags: ["VIP","갱년기"],   chief: "요통, 피로감" },
  { id: 4,  name: "송재호", gender: "남", age: 49, rrn: "760518-1******", rrnFull: "760518-1456789", phone: "010-3322-7755", address: "서울 강동구 천호동 405-1",                         chartNo: "00012501", lastVisit: "2026-05-15", tags: ["자보"],          chief: "교통사고 후 경항통" },
  { id: 5,  name: "이민호", gender: "남", age: 34, rrn: "900722-1******", rrnFull: "900722-1567890", phone: "010-5555-1234", address: "서울 강남구 역삼동 11-22",                         chartNo: "00011455", lastVisit: "2026-05-14", tags: ["초진"],          chief: "소화불량, 복통" },
  { id: 6,  name: "박지현", gender: "여", age: 57, rrn: "680214-2******", rrnFull: "680214-2678901", phone: "010-3344-7788", address: "경기 고양시 일산동 99-7",                          chartNo: "00009881", lastVisit: "2026-05-13", tags: ["불면증"],       chief: "불면증, 심계항진" },
  { id: 7,  name: "정유미", gender: "여", age: 30, rrn: "950318-2******", rrnFull: "950318-2789012", phone: "010-6611-2233", address: "서울 송파구 잠실동 88-12",                         chartNo: "00012600", lastVisit: "2026-05-13", tags: ["초진","산정특례"], chief: "생리통, 빈혈" },
  { id: 8,  name: "오세훈", gender: "남", age: 46, rrn: "790620-1******", rrnFull: "790620-1890123", phone: "010-8800-4411", address: "서울 강서구 화곡동 33-4",                          chartNo: "00010998", lastVisit: "2026-05-12", tags: [],               chief: "어깨 통증" },
  { id: 9,  name: "한지민", gender: "여", age: 34, rrn: "910814-2******", rrnFull: "910814-2901234", phone: "010-4455-1100", address: "경기 성남시 분당구 정자동",                         chartNo: "00012220", lastVisit: "2026-05-11", tags: ["VIP"],          chief: "어지러움" },
  { id: 10, name: "장우성", gender: "남", age: 42, rrn: "831202-1******", rrnFull: "831202-1012345", phone: "010-7711-9922", address: "인천 연수구 송도동 5-8",                           chartNo: "00012612", lastVisit: "2026-05-11", tags: ["초진","자보"],    chief: "허리 통증 (교통사고)" },
  { id: 11, name: "안세영", gender: "여", age: 30, rrn: "950923-2******", rrnFull: "950923-2123450", phone: "010-6677-2244", address: "서울 동작구 사당동 14-2",                          chartNo: "00012345", lastVisit: "2026-05-08", tags: ["자보"],          chief: "교통사고 후 요통" },
  { id: 12, name: "강민재", gender: "남", age: 37, rrn: "881103-1******", rrnFull: "881103-1234500", phone: "010-1122-5566", address: "서울 마포구 망원동 7-19",                          chartNo: "00011220", lastVisit: "2026-05-02", tags: [],               chief: "무릎 통증" },
];

const PP_TAG_COLORS = {
  "VIP":      { bg: "var(--status-warning-bg)",   color: "var(--status-warning-text)" },
  "자보":     { bg: "var(--status-danger-bg)", color: "var(--status-danger-text)" },
  "초진":     { bg: "var(--brand-subtle)",     color: "var(--text-brand)" },
  "갱년기":   { bg: "var(--status-warning-bg)",   color: "var(--status-warning-text)" },
  "불면증":   { bg: "var(--bg-raised)",   color: "var(--text-secondary)" },
  "산정특례": { bg: "var(--brand-muted)",    color: "var(--text-brand)" },
};

const TODAY_STR = "2026-05-16";

window.PP_PATIENTS = PP_PATIENTS;
window.PP_TAG_COLORS = PP_TAG_COLORS;
window.PP_TODAY_STR = TODAY_STR;
