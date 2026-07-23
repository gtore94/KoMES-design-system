// 병원 관리 — 알림 자동 생성 규칙 / 히스토리 / 처리 로그 시드 데이터

// ──────────────────────────────────────────────────────────────
// 자동 생성 규칙
// ──────────────────────────────────────────────────────────────
const ALERT_RULES = [
  {
    id: "r-ins-missing",
    category: "보험",
    severity: "critical",
    enabled: true,
    title: "보험기관 미연동 감지",
    desc: "미연동 기관에서 청구 가능한 환자가 {n}건 누적되면 알림",
    threshold: 3, min: 1, max: 30, unit: "건",
    receivers: ["원장"],
    channels: ["인앱"],
    lastFired: "2026-05-17 06:12",
  },
  {
    id: "r-cert",
    category: "보험",
    severity: "warning",
    enabled: true,
    title: "공인인증서 만료 임박",
    desc: "공단·심평원 인증서가 {n}일 이내 만료되면 알림",
    threshold: 30, min: 7, max: 90, unit: "일",
    receivers: ["원장"],
    channels: ["인앱", "이메일"],
    lastFired: "2026-05-15 04:00",
  },
  {
    id: "r-backup-fail",
    category: "백업",
    severity: "critical",
    enabled: true,
    title: "백업 연속 실패",
    desc: "백업이 연속 {n}회 경고/실패 상태로 종료되면 알림",
    threshold: 2, min: 1, max: 5, unit: "회",
    receivers: ["원장"],
    channels: ["인앱", "이메일", "SMS"],
    lastFired: "—",
  },
  {
    id: "r-backup-size",
    category: "백업",
    severity: "warning",
    enabled: true,
    title: "백업 용량 급변",
    desc: "백업 크기가 직전 대비 {n}% 이상 증감하면 알림",
    threshold: 25, min: 10, max: 100, unit: "%",
    receivers: ["원장"],
    channels: ["인앱"],
    lastFired: "—",
  },
  {
    id: "r-license",
    category: "법적 정보",
    severity: "warning",
    enabled: true,
    title: "한의사 면허 만료 임박",
    desc: "면허 갱신/보수교육 만료가 {n}일 이내인 경우 알림",
    threshold: 60, min: 14, max: 180, unit: "일",
    receivers: ["원장", "데스크"],
    channels: ["인앱"],
    lastFired: "—",
  },
  {
    id: "r-room-maintenance",
    category: "운영",
    severity: "info",
    enabled: true,
    title: "진료실 점검 중 안내",
    desc: "공간 상태가 점검 중으로 {n}일 이상 유지되면 안내",
    threshold: 3, min: 1, max: 30, unit: "일",
    receivers: ["원장", "데스크"],
    channels: ["인앱"],
    lastFired: "2026-05-14 09:30",
  },
  {
    id: "r-holiday",
    category: "운영",
    severity: "info",
    enabled: true,
    title: "법정공휴일 자동 등록",
    desc: "공휴일이 휴진일에 자동 추가될 때 안내",
    threshold: null,
    receivers: ["원장", "데스크"],
    channels: ["인앱"],
    lastFired: "2026-05-01 00:00",
  },
  {
    id: "r-patient-volume",
    category: "운영",
    severity: "info",
    enabled: false,
    title: "이상 환자 수 감지",
    desc: "일일 환자 수가 평균 대비 {n}% 이상 벗어나면 알림",
    threshold: 40, min: 10, max: 100, unit: "%",
    receivers: ["원장"],
    channels: ["인앱"],
    lastFired: "—",
  },
];

// ──────────────────────────────────────────────────────────────
// 알림 히스토리 — 시계열 (최근→과거)
//   status: "active" | "resolved" | "dismissed" | "snoozed"
// ──────────────────────────────────────────────────────────────
const ALERT_HISTORY = [
  { id: "h-001", ts: "2026-05-17 06:12", ruleId: "r-ins-missing",  severity: "critical", title: "보훈복지공단 EDI 미연동",     status: "active",    actor: "시스템", target: "insurance" },
  { id: "h-002", ts: "2026-05-15 04:00", ruleId: "r-cert",         severity: "warning",  title: "공인인증서 만료 D-227",        status: "active",    actor: "시스템", target: "insurance" },
  { id: "h-003", ts: "2026-05-14 04:12", ruleId: "r-backup-fail",  severity: "warning",  title: "2026-05-13 백업 경고",         status: "resolved",  actor: "김민준", target: "backup",    resolution: "다음 백업 정상 확인 후 종료" },
  { id: "h-004", ts: "2026-05-14 09:30", ruleId: "r-room-maintenance", severity: "info", title: "리커버리룸 점검 3일째",        status: "active",    actor: "시스템", target: "rooms" },
  { id: "h-005", ts: "2026-05-12 04:00", ruleId: "r-cert",         severity: "warning",  title: "공인인증서 만료 D-230",        status: "snoozed",   actor: "김민준", target: "insurance", resolution: "7일 미루기" },
  { id: "h-006", ts: "2026-05-10 14:22", ruleId: "r-ins-missing",  severity: "critical", title: "DB자보 청구 인증서 갱신 필요", status: "resolved",  actor: "이서연", target: "insurance", resolution: "신규 인증서 등록 완료" },
  { id: "h-007", ts: "2026-05-08 11:08", ruleId: "r-holiday",      severity: "info",     title: "어버이날 자동 등록",            status: "dismissed", actor: "박지훈", target: "hours" },
  { id: "h-008", ts: "2026-05-07 18:40", ruleId: "r-room-maintenance", severity: "info", title: "침구실 B 점검 등록",            status: "resolved",  actor: "박지훈", target: "rooms",     resolution: "점검 완료 · 운영 복귀" },
  { id: "h-009", ts: "2026-05-05 03:58", ruleId: "r-backup-size",  severity: "warning",  title: "백업 크기 +31% 급증",          status: "dismissed", actor: "김민준", target: "backup",    resolution: "신규 처방 차트 반영으로 확인" },
  { id: "h-010", ts: "2026-05-03 09:14", ruleId: "r-ins-missing",  severity: "critical", title: "근로복지공단 인증서 만료",     status: "resolved",  actor: "김민준", target: "insurance", resolution: "갱신 후 재연동 완료" },
  { id: "h-011", ts: "2026-05-01 00:00", ruleId: "r-holiday",      severity: "info",     title: "5월 법정공휴일 일괄 등록",     status: "dismissed", actor: "시스템", target: "hours" },
  { id: "h-012", ts: "2026-04-29 16:30", ruleId: "r-cert",         severity: "warning",  title: "공인인증서 만료 D-245",        status: "resolved",  actor: "이서연", target: "insurance", resolution: "갱신 일정 캘린더 등록" },
];

// ──────────────────────────────────────────────────────────────
// 처리 로그 — 알림에 대한 액션(미루기/해제/배정/해결/규칙수정)의 시계열
//   action: "created" | "snoozed" | "dismissed" | "resolved" | "assigned" | "rule-edit" | "rule-toggle"
// ──────────────────────────────────────────────────────────────
const ALERT_LOG = [
  { id: "l-001", ts: "2026-05-17 08:14", actor: "김민준", role: "원장",   action: "assigned",   targetTitle: "보훈복지공단 EDI 미연동",   detail: "담당자: 이서연 배정" },
  { id: "l-002", ts: "2026-05-15 09:02", actor: "김민준", role: "원장",   action: "snoozed",    targetTitle: "공인인증서 만료 D-227",     detail: "7일 미루기 — 다음 표시: 2026-05-22" },
  { id: "l-003", ts: "2026-05-14 10:18", actor: "김민준", role: "원장",   action: "resolved",   targetTitle: "2026-05-13 백업 경고",      detail: "다음 백업 정상 확인 후 종료" },
  { id: "l-004", ts: "2026-05-13 17:42", actor: "이서연", role: "부원장", action: "rule-edit",  targetTitle: "공인인증서 만료 임박",       detail: "임계값 14일 → 30일" },
  { id: "l-005", ts: "2026-05-11 11:00", actor: "박지훈", role: "한의사", action: "dismissed",  targetTitle: "어버이날 자동 등록",         detail: "—" },
  { id: "l-006", ts: "2026-05-10 14:55", actor: "이서연", role: "부원장", action: "resolved",   targetTitle: "DB자보 청구 인증서 갱신",   detail: "신규 인증서 등록 완료" },
  { id: "l-007", ts: "2026-05-09 08:30", actor: "김민준", role: "원장",   action: "rule-toggle",targetTitle: "이상 환자 수 감지",         detail: "비활성화" },
  { id: "l-008", ts: "2026-05-05 04:08", actor: "시스템", role: "—",      action: "created",    targetTitle: "백업 크기 +31% 급증",       detail: "규칙: 백업 용량 급변 (25%↑)" },
  { id: "l-009", ts: "2026-05-03 11:20", actor: "김민준", role: "원장",   action: "resolved",   targetTitle: "근로복지공단 인증서 만료",  detail: "갱신 후 재연동 완료" },
  { id: "l-010", ts: "2026-05-01 09:15", actor: "박지훈", role: "한의사", action: "dismissed",  targetTitle: "5월 법정공휴일 일괄 등록",  detail: "—" },
];

Object.assign(window, { ALERT_RULES, ALERT_HISTORY, ALERT_LOG });
