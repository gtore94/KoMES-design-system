// KoMES — 비급여 전용 진료 차트
// 일반 진료 차트와 다른 점:
//  - 부위 도식 (얼굴·신체 SVG 마커)
//  - 사용 자재 lot 추적
//  - 전후 사진 비교
//  - 측정 트래커 (체중·체지방·둘레)
//  - 회차별 시술 타임라인
//  - 동의서·VAS 통증 스코어

const { useState: useStNCC, useMemo: useMmNCC, useRef: useRfNCC } = React;

// ════════════════════════════════════════════════════════════════
// Seed: 차트 대상 환자 + 시술 이력 + 측정 데이터
// ════════════════════════════════════════════════════════════════
const NCC_PATIENT = {
  id: "p-1322", name: "이서연", chartNo: "C-1322",
  gender: "여", age: 33, phone: "010-3344-5566",
  birthdate: "1992-08-14",
  member: { tier: "GOLD", points: 18400, lifetime: 2_840_000 },
  cautions: ["페니실린 알레르기", "임신 가능성 없음 (확인 2026-05-09)"],
  activePackage: {
    name: "안면 매선 10회 패키지",
    code: "BT-TH-01-P10",
    used: 3, total: 10,
    expires: "2026-06-15", daysLeft: 23,
    paid: 2_520_000,
  },
  insights: [
    "안면침 6회 시점부터 매선 단계 권유 적기",
    "민감성 피부 — 약침 농도 0.5단계 낮춰 시술",
    "다음 회차 시 자가 케어(홈케어팩) 안내 권장",
  ],
};

// 시술 회차 (오늘이 11회차 · 진행중)
const NCC_VISITS = [
  { id: "v-11", session: 11, date: "2026-05-23", time: "11:00", today: true, status: "in_progress",
    procedures: ["nc-2", "nc-4"],
    staff: "김민준 원장", room: "시술실 1", duration: 65, vas: 3,
    paid: 252000 + 49500, summary: "안면 매선 + 미백 약침 · 통증 양호" },
  { id: "v-10", session: 10, date: "2026-05-16", time: "14:30", status: "done",
    procedures: ["nc-1", "nc-4"], staff: "이지영 부원장", room: "미용실 A",
    duration: 75, vas: 2, paid: 79200 + 49500, summary: "안면 미용침 정기 · 미백 약침 보조" },
  { id: "v-9", session: 9, date: "2026-05-09", time: "11:00", status: "done",
    procedures: ["nc-1"], staff: "이지영 부원장", room: "미용실 A",
    duration: 60, vas: 2, paid: 79200, summary: "안면 미용침 · V존 집중" },
  { id: "v-8", session: 8, date: "2026-05-02", time: "10:00", status: "done",
    procedures: ["nc-1", "nc-5"], staff: "이지영 부원장", room: "미용실 A",
    duration: 70, vas: 2, paid: 79200 + 40500, summary: "안면 미용침 + 다크서클 약침" },
  { id: "v-7", session: 7, date: "2026-04-25", time: "14:00", status: "done",
    procedures: ["nc-1"], staff: "이지영 부원장", room: "미용실 A",
    duration: 60, vas: 3, paid: 79200, summary: "안면 미용침 · 좌측 미간 부어 보고" },
];

// 사용 자재 (오늘 시술)
const NCC_MATERIALS_TODAY = [
  { product: "PDO 매선 (DM 2-0 · 38mm)",       spec: "30개입",  lot: "DM-26041-A", qty: 38, unit: "본", price: 3200 },
  { product: "PDO 매선 (코그 3-0 · 60mm)",       spec: "10개입",  lot: "CG-26022-B", qty: 6,  unit: "본", price: 6800 },
  { product: "마취 크림 (EMLA 30g)",             spec: "1ea",     lot: "EM-26031",    qty: 1,  unit: "ea", price: 18000 },
  { product: "자하거 약침액 (5cc · 안면용)",     spec: "1vial",   lot: "JA-26015-C", qty: 1,  unit: "vial", price: 22000 },
  { product: "소독·드레싱 키트",                  spec: "1set",    lot: "ST-26044",   qty: 1,  unit: "set", price: 4500 },
];

// 안면 매선 시술 마커 (face SVG 좌표 기준 · viewBox 100x140 — 정면)
const NCC_FACE_MARKERS = [
  { id: "m1", x: 28, y: 54, label: "좌측 광대 1", depth: "심부", thread: "PDO 코그 3-0" },
  { id: "m2", x: 72, y: 54, label: "우측 광대 1", depth: "심부", thread: "PDO 코그 3-0" },
  { id: "m3", x: 32, y: 70, label: "좌측 팔자 1", depth: "중심", thread: "PDO DM 2-0" },
  { id: "m4", x: 68, y: 70, label: "우측 팔자 1", depth: "중심", thread: "PDO DM 2-0" },
  { id: "m5", x: 50, y: 30, label: "이마 중앙",   depth: "표재", thread: "PDO DM 2-0" },
  { id: "m6", x: 40, y: 88, label: "좌측 턱선",   depth: "심부", thread: "PDO 코그 3-0" },
  { id: "m7", x: 60, y: 88, label: "우측 턱선",   depth: "심부", thread: "PDO 코그 3-0" },
];

// 측정 트래커 (8주 추이)
const NCC_MEASUREMENTS = [
  { date: "03/28", weight: 58.2, bodyFat: 27.4, muscle: 22.1, bmi: 21.3, waist: 74, hip: 96 },
  { date: "04/04", weight: 57.8, bodyFat: 27.0, muscle: 22.3, bmi: 21.2, waist: 73, hip: 95 },
  { date: "04/11", weight: 57.4, bodyFat: 26.5, muscle: 22.4, bmi: 21.1, waist: 72.5, hip: 95 },
  { date: "04/18", weight: 57.1, bodyFat: 26.1, muscle: 22.6, bmi: 21.0, waist: 72, hip: 94 },
  { date: "04/25", weight: 56.8, bodyFat: 25.7, muscle: 22.7, bmi: 20.8, waist: 71.5, hip: 94 },
  { date: "05/02", weight: 56.5, bodyFat: 25.3, muscle: 22.8, bmi: 20.7, waist: 71, hip: 93.5 },
  { date: "05/09", weight: 56.3, bodyFat: 24.9, muscle: 22.9, bmi: 20.6, waist: 70.5, hip: 93 },
  { date: "05/16", weight: 56.0, bodyFat: 24.5, muscle: 23.0, bmi: 20.5, waist: 70, hip: 92.5 },
];

// 동의서
const NCC_CONSENTS = [
  { name: "비급여 진료 동의서", required: true,  signed: "2026-04-25", expires: "2027-04-25" },
  { name: "매선요법 시술 동의서", required: true, signed: "2026-05-23", expires: null },
  { name: "약침 시술 동의서",     required: true, signed: "2026-04-25", expires: "2027-04-25" },
  { name: "사진 촬영·활용 동의서", required: false, signed: "2026-04-25", expires: null },
  { name: "개인정보 마케팅 활용 동의", required: false, signed: null, expires: null },
];

// ════════════════════════════════════════════════════════════════
// 유틸 — 미니 라인 차트 (인라인 SVG)
// ════════════════════════════════════════════════════════════════
function NCCMiniChart({ data, color = "var(--jade-500)", height = 48 }) {
  const w = 220, h = height, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });
  const path = `M ${points.join(" L ")}`;
  const areaPath = `${path} L ${pad + ((data.length - 1) * (w - pad * 2)) / (data.length - 1)},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h }}>
      <path d={areaPath} fill={color} opacity={0.12} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={1.8} fill={color} />;
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// Face Diagram (얼굴 도식 + 마커)
// ════════════════════════════════════════════════════════════════
function NCCFaceDiagram({ markers, activeId, onSelect, side = "front" }) {
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 100 140" style={{ width: "100%", height: 260, display: "block" }}>
        {/* face outline */}
        <ellipse cx="50" cy="55" rx="32" ry="40"
          fill="var(--stone-50)" stroke="var(--ink-300)" strokeWidth="0.4" />
        {/* hairline */}
        <path d="M 22 30 Q 50 14 78 30" fill="none" stroke="var(--ink-300)" strokeWidth="0.4" strokeDasharray="0.8 0.8" />
        {/* jaw line */}
        <path d="M 22 70 Q 50 100 78 70" fill="none" stroke="var(--ink-300)" strokeWidth="0.4" strokeDasharray="0.8 0.8" />
        {/* eyes */}
        <ellipse cx="38" cy="50" rx="4" ry="2" fill="var(--ink-100)" stroke="var(--ink-300)" strokeWidth="0.3" />
        <ellipse cx="62" cy="50" rx="4" ry="2" fill="var(--ink-100)" stroke="var(--ink-300)" strokeWidth="0.3" />
        <circle cx="38" cy="50" r="1.1" fill="var(--ink-700)" />
        <circle cx="62" cy="50" r="1.1" fill="var(--ink-700)" />
        {/* nose */}
        <path d="M 50 53 L 47 65 Q 50 67 53 65 Z" fill="none" stroke="var(--ink-300)" strokeWidth="0.4" />
        {/* mouth */}
        <path d="M 43 78 Q 50 81 57 78" fill="none" stroke="var(--ink-300)" strokeWidth="0.5" />
        {/* neck */}
        <line x1="40" y1="93" x2="40" y2="105" stroke="var(--ink-300)" strokeWidth="0.3" />
        <line x1="60" y1="93" x2="60" y2="105" stroke="var(--ink-300)" strokeWidth="0.3" />
        {/* markers */}
        {markers.map((m, i) => {
          const isActive = activeId === m.id;
          return (
            <g key={m.id} onClick={() => onSelect && onSelect(m.id)} style={{ cursor: "pointer" }}>
              <circle cx={m.x} cy={m.y} r={isActive ? 3 : 2.2}
                fill="var(--cinnabar-600)" stroke="#fff" strokeWidth="0.6"
                opacity={isActive ? 1 : 0.85} />
              <text x={m.x} y={m.y + 0.6} fontSize="2.4" fontWeight="700"
                textAnchor="middle" fill="#fff" style={{ pointerEvents: "none" }}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{
        position: "absolute", top: 8, right: 8,
        padding: "3px 8px", borderRadius: "var(--radius-sm)",
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
      }}>
        {side === "front" ? "정면" : "측면"} · 시술점 {markers.length}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 환자 정보 헤더 (TopBar 아래 sticky strip)
// ════════════════════════════════════════════════════════════════
function NCCPatientStrip({ patient, onBack }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "12px 24px",
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", fontSize: 12,
        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)", cursor: "pointer",
        color: "var(--text-secondary)", fontFamily: "var(--font-sans)",
      }}>
        <Icon name="arrow-left" size={13} /> 비급여 화면
      </button>

      <Avatar name={patient.name} size={44} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {patient.name}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            {patient.gender} · {patient.age}세
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: "var(--radius-full)",
            background: "linear-gradient(135deg, var(--amber-500), var(--amber-700))",
            color: "#fff", fontSize: 10, fontWeight: 700,
            fontFamily: "var(--font-sans)", letterSpacing: "0.04em",
          }}>
            <Icon name="crown" size={10} /> {patient.member.tier}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3, fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{patient.chartNo}</span>
          <span style={{ color: "var(--border-default)" }}>·</span>
          <span>{patient.birthdate}</span>
          <span style={{ color: "var(--border-default)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{patient.phone}</span>
        </div>
      </div>

      {/* 진행중인 패키지 */}
      <div style={{
        marginLeft: "auto",
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 14px",
        background: "var(--brand-subtle)",
        border: "1px solid var(--brand-muted)",
        borderRadius: "var(--radius-md)",
      }}>
        <Icon name="package" size={16} style={{ color: "var(--text-brand)" }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>진행 패키지</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{patient.activePackage.name}</div>
        </div>
        <div style={{ width: 1, height: 28, background: "var(--brand-muted)" }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>회차</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{patient.activePackage.used}/{patient.activePackage.total}</div>
        </div>
        <div style={{ width: 1, height: 28, background: "var(--brand-muted)" }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>만료</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--status-warning-text)" }}>D-{patient.activePackage.daysLeft}</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Left rail — 회차 타임라인
// ════════════════════════════════════════════════════════════════
function NCCVisitTimeline({ visits, activeId, onSelect }) {
  return (
    <div style={{
      width: 260, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <Icon name="history" size={13} style={{ color: "var(--text-brand)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>회차 타임라인</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-muted)", padding: "1px 7px", borderRadius: "var(--radius-full)" }}>
          {visits.length}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {visits.map(v => {
          const isActive = v.id === activeId;
          const procs = v.procedures.map(pid => NCProcedureOf(pid));
          return (
            <div key={v.id} onClick={() => onSelect(v.id)} style={{
              padding: "11px 14px",
              borderBottom: "1px solid var(--bg-raised)",
              borderLeft: `3px solid ${isActive ? "var(--jade-500)" : "transparent"}`,
              background: isActive ? "var(--brand-subtle)" : "var(--bg-surface)",
              cursor: "pointer",
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: v.today ? "var(--jade-500)" : "var(--bg-raised)",
                  color: v.today ? "var(--text-on-brand)" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                  border: v.today ? "none" : "1px solid var(--border-subtle)",
                }}>{v.session}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>
                  {v.date}
                </div>
                {v.today && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: "1px 6px", borderRadius: "var(--radius-full)",
                    background: "var(--status-warning-bg)", color: "var(--status-warning-text)",
                    border: "1px solid var(--status-warning-border)",
                    fontFamily: "var(--font-sans)",
                  }}>오늘</span>
                )}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 500, color: "var(--text-primary)",
                fontFamily: "var(--font-sans)", lineHeight: 1.35, marginBottom: 4,
              }}>
                {procs.map(p => p.name).join(" + ")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Icon name="user" size={9} /> {v.staff.split(" ")[0]}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)" }}>
                  <Icon name="clock" size={9} /> {v.duration}분
                </span>
                {v.vas != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)" }}>
                    <Icon name="activity" size={9} /> VAS {v.vas}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ padding: 12 }}>
          <button onClick={() => showToast("신규 회차 시술을 추가합니다.")} style={{
            width: "100%", padding: "9px 12px",
            background: "var(--bg-surface)", border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12, fontWeight: 500,
          }}>
            <Icon name="plus" size={13} /> 신규 회차 추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Right rail — 결제 / 다음 예약 / 주의사항 / AI 인사이트
// ════════════════════════════════════════════════════════════════
function NCCRightRail({ patient, visits }) {
  const todayVisit = visits[0];
  const total = visits.reduce((s, v) => s + v.paid, 0);

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 결제 요약 */}
        <NCCSidePanel title="결제 요약" icon="wallet">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <NCCMiniStat label="누적 결제" value={NC_KRW(patient.member.lifetime)} mono />
            <NCCMiniStat label="포인트" value={`${patient.member.points.toLocaleString()}P`} mono />
          </div>
          <div style={{ padding: "8px 10px", background: "var(--brand-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-muted)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>오늘 시술 합계</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--text-brand)", marginTop: 2 }}>{NC_KRW(todayVisit.paid)}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>
              회원 10% 할인 적용 · 매선 패키지 차감
            </div>
          </div>
          <Button variant="primary" size="sm" icon="receipt"
            onClick={() => showToast("수납 화면으로 이동합니다.")}>
            수납 처리
          </Button>
        </NCCSidePanel>

        {/* 다음 예약 */}
        <NCCSidePanel title="다음 예약" icon="calendar-plus">
          <div style={{
            padding: "10px 12px", borderRadius: "var(--radius-md)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              2026-05-30 (토) 14:00
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, fontFamily: "var(--font-sans)" }}>
              안면 미용침 · 미백 약침 · 60분
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1, fontFamily: "var(--font-sans)" }}>
              담당 이지영 부원장 · 미용실 A
            </div>
          </div>
          <Button variant="secondary" size="sm" icon="message-circle"
            onClick={() => showToast("카카오톡 리마인더가 예약되었습니다.")}>
            리마인더 발송
          </Button>
        </NCCSidePanel>

        {/* 알레르기 / 주의사항 */}
        <NCCSidePanel title="알레르기·주의" icon="alert-triangle" accent="warning">
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {patient.cautions.map((c, i) => (
              <div key={i} style={{
                fontSize: 11, color: "var(--status-danger-text)",
                fontFamily: "var(--font-sans)", lineHeight: 1.45,
                padding: "5px 8px", background: "var(--status-danger-bg)",
                borderRadius: "var(--radius-sm)", border: "1px solid var(--status-danger-border)",
              }}>
                <Icon name="alert-circle" size={11} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                {c}
              </div>
            ))}
          </div>
        </NCCSidePanel>

        {/* AI 인사이트 */}
        <NCCSidePanel title="AI 인사이트" icon="sparkles" accent="brand">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {patient.insights.map((ins, i) => (
              <div key={i} style={{
                fontSize: 11, color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)", lineHeight: 1.5,
                display: "flex", gap: 6, alignItems: "flex-start",
              }}>
                <Icon name="lightbulb" size={11} style={{ color: "var(--jade-600)", flexShrink: 0, marginTop: 2 }} />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </NCCSidePanel>
      </div>
    </div>
  );
}
function NCCSidePanel({ title, icon, accent, children }) {
  const bg = accent === "warning" ? "var(--status-warning-bg)" :
             accent === "brand" ? "var(--brand-subtle)" : "var(--bg-raised)";
  const fg = accent === "warning" ? "var(--status-warning-text)" :
             accent === "brand" ? "var(--text-brand)" : "var(--text-secondary)";
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "8px 12px",
        background: bg,
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <Icon name={icon} size={12} style={{ color: fg }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: fg, fontFamily: "var(--font-sans)", letterSpacing: "0.02em" }}>{title}</span>
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}
function NCCMiniStat({ label, value, mono }) {
  return (
    <div style={{
      padding: "6px 9px", borderRadius: "var(--radius-sm)",
      background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 차트 본문 — 시술 기록 탭
// ════════════════════════════════════════════════════════════════
function NCCTreatmentView({ visit }) {
  const [activeMarker, setActiveMarker] = useStNCC(null);
  const [vas, setVas] = useStNCC(visit.vas || 3);
  const [editFields, setEditFields] = useStNCC({
    cc: "안면 비대칭(좌측 광대 처짐) · 팔자주름 깊어짐. 다음달 결혼식 D-30 · 즉각적 리프팅 효과 희망.",
    plan: "PDO 매선 7점(코그 3-0 심부 4점 + DM 2-0 4점) · 자하거 약침 안면 4혈 보조 시술.",
    progress: "마취 크림 30분 도포 후 시술 · 출혈·통증 양호 · 시술 후 즉각 리프팅 확인. 좌측 광대 강한 텐션 감지.",
    aftercare: "48시간 세안 금지 · 7일간 격렬운동 자제 · 멍 부위 냉찜질 4회/일. 다음 회차 시 미용침 위주 권장.",
  });
  const procs = visit.procedures.map(pid => NCProcedureOf(pid));
  const materialTotal = NCC_MATERIALS_TODAY.reduce((s, m) => s + m.price * m.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 시술 메타 */}
      <div style={{
        padding: "12px 16px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12,
      }}>
        <NCCMetaField label="일시" value={`${visit.date} ${visit.time}`} mono />
        <NCCMetaField label="담당" value={visit.staff} />
        <NCCMetaField label="시술실" value={visit.room} />
        <NCCMetaField label="소요" value={`${visit.duration}분`} mono />
        <NCCMetaField label="상태" value={visit.status === "in_progress" ? "진행중" : "완료"} tone={visit.status === "in_progress" ? "warning" : "brand"} />
      </div>

      {/* 시술 항목 */}
      <NCCBlock title="시술 항목" icon="list-checks">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {procs.map(p => {
            const cat = NCCategoryOf(p.category);
            const t = NCToneStyle(cat.tone);
            return (
              <div key={p.id} style={{
                display: "grid", gridTemplateColumns: "20px 90px 1fr 90px 90px", gap: 10,
                alignItems: "center", padding: "8px 10px",
                background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "var(--radius-sm)",
                  background: "var(--jade-500)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="check" size={11} style={{ color: "#fff" }} />
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                  color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
                  padding: "2px 7px", borderRadius: "var(--radius-sm)",
                  letterSpacing: "0.04em", textAlign: "center",
                }}>{p.code}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{p.tagline}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>{p.duration}분</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textAlign: "right" }}>{NC_KRW(p.memberPrice)}</span>
              </div>
            );
          })}
          <button onClick={() => showToast("시술 항목 추가")} style={{
            padding: "8px 10px",
            background: "var(--bg-surface)", border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 11,
          }}>
            <Icon name="plus" size={12} /> 시술 항목 추가
          </button>
        </div>
      </NCCBlock>

      {/* 부위 도식 + 마커 정보 */}
      <NCCBlock title="시술 부위 도식" icon="target"
        actions={<span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>마커 클릭하여 상세 보기</span>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
          <div style={{
            background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)", padding: 8,
          }}>
            <NCCFaceDiagram markers={NCC_FACE_MARKERS} activeId={activeMarker} onSelect={setActiveMarker} />
          </div>
          <div style={{
            background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)", overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "30px 1fr 70px 100px",
              padding: "8px 12px", background: "var(--bg-raised)",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--text-muted)", fontFamily: "var(--font-sans)",
              borderBottom: "1px solid var(--border-subtle)",
            }}>
              <span>#</span><span>부위</span><span>깊이</span><span>매선</span>
            </div>
            {NCC_FACE_MARKERS.map((m, i) => {
              const isActive = activeMarker === m.id;
              return (
                <div key={m.id} onClick={() => setActiveMarker(m.id)} style={{
                  display: "grid", gridTemplateColumns: "30px 1fr 70px 100px",
                  padding: "7px 12px", cursor: "pointer",
                  borderBottom: "1px solid var(--bg-raised)",
                  background: isActive ? "var(--brand-subtle)" : "var(--bg-surface)",
                  alignItems: "center",
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "var(--cinnabar-600)", color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{m.label}</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-sans)", color: m.depth === "심부" ? "var(--cinnabar-700)" : m.depth === "중심" ? "var(--amber-700)" : "var(--accent-marine)" }}>{m.depth}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{m.thread}</span>
                </div>
              );
            })}
          </div>
        </div>
      </NCCBlock>

      {/* 사용 자재 */}
      <NCCBlock title="사용 자재 (lot 추적)" icon="package"
        actions={<span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-brand)",
        }}>자재비 {NC_KRW(materialTotal)}</span>}
      >
        <div style={{
          background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)", overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.6fr 80px 110px 60px 90px",
            padding: "8px 12px", background: "var(--bg-raised)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <span>제품</span><span>규격</span><span>Lot</span><span style={{ textAlign: "right" }}>수량</span><span style={{ textAlign: "right" }}>단가</span>
          </div>
          {NCC_MATERIALS_TODAY.map((m, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1.6fr 80px 110px 60px 90px",
              padding: "8px 12px", borderBottom: "1px solid var(--bg-raised)",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{m.product}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{m.spec}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>{m.lot}</span>
              <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)" }}>{m.qty}{m.unit}</span>
              <span style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{NC_KRW(m.price)}</span>
            </div>
          ))}
        </div>
      </NCCBlock>

      {/* VAS + SOAP-like fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NCCBlock title="통증 VAS" icon="activity">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="range" min="0" max="10" value={vas} onChange={e => setVas(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: "var(--jade-500)" }} />
            <div style={{
              minWidth: 60, padding: "4px 10px",
              fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
              color: vas <= 3 ? "var(--text-brand)" : vas <= 6 ? "var(--amber-700)" : "var(--status-danger-text)",
              background: vas <= 3 ? "var(--brand-subtle)" : vas <= 6 ? "var(--status-warning-bg)" : "var(--status-danger-bg)",
              border: `1px solid ${vas <= 3 ? "var(--brand-muted)" : vas <= 6 ? "var(--status-warning-border)" : "var(--status-danger-border)"}`,
              borderRadius: "var(--radius-md)", textAlign: "center",
            }}>{vas}/10</div>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 4,
          }}>
            <span>0 무통</span><span>3 약함</span><span>6 보통</span><span>10 격심</span>
          </div>
        </NCCBlock>

        <NCCBlock title="시술 후 부작용 모니터링" icon="shield">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {["출혈", "멍", "부종", "통증", "감염 의심", "이상감각"].map((k, i) => (
              <label key={k} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 9px",
                background: i < 3 ? "var(--bg-raised)" : "var(--bg-surface)",
                border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                fontSize: 11, fontFamily: "var(--font-sans)",
                cursor: "pointer", color: "var(--text-primary)",
              }}>
                <input type="checkbox" defaultChecked={i < 3 ? false : false} style={{ accentColor: "var(--jade-500)" }} />
                {k}
              </label>
            ))}
          </div>
        </NCCBlock>
      </div>

      {/* SOAP-like 텍스트 필드들 */}
      <NCCBlock title="시술 기록" icon="file-text">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NCCTextField label="환자 호소 / 목표" value={editFields.cc} onChange={v => setEditFields({ ...editFields, cc: v })} />
          <NCCTextField label="시술 계획" value={editFields.plan} onChange={v => setEditFields({ ...editFields, plan: v })} />
          <NCCTextField label="시술 경과" value={editFields.progress} onChange={v => setEditFields({ ...editFields, progress: v })} />
          <NCCTextField label="관리 안내·다음 회차" value={editFields.aftercare} onChange={v => setEditFields({ ...editFields, aftercare: v })} />
        </div>
      </NCCBlock>
    </div>
  );
}

function NCCBlock({ title, icon, actions, children }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        padding: "9px 14px", background: "var(--bg-raised)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <Icon name={icon} size={13} style={{ color: "var(--text-secondary)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", flex: 1 }}>{title}</span>
        {actions}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}
function NCCMetaField({ label, value, mono, tone }) {
  const colors = {
    warning: "var(--status-warning-text)",
    brand: "var(--text-brand)",
  };
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors[tone] || "var(--text-primary)", fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", marginTop: 2 }}>{value}</div>
    </div>
  );
}
function NCCTextField({ label, value, onChange }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
        letterSpacing: "0.06em", textTransform: "uppercase",
        fontFamily: "var(--font-sans)", marginBottom: 5,
      }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        style={{
          width: "100%", padding: "8px 10px",
          fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5,
          color: "var(--text-primary)",
          background: "var(--bg-surface)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)", outline: "none", boxSizing: "border-box",
          resize: "vertical",
        }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 본문 — 전후 사진 탭
// ════════════════════════════════════════════════════════════════
function NCCPhotosView() {
  const photoSlots = [
    { session: "1회 (2026-03-28)", angle: "정면", isBaseline: true },
    { session: "5회 (2026-04-25)", angle: "정면" },
    { session: "10회 (2026-05-16)", angle: "정면" },
    { session: "오늘 (2026-05-23)", angle: "정면", isToday: true },
    { session: "1회 (2026-03-28)", angle: "좌측", isBaseline: true },
    { session: "5회 (2026-04-25)", angle: "좌측" },
    { session: "10회 (2026-05-16)", angle: "좌측" },
    { session: "오늘 (2026-05-23)", angle: "좌측", isToday: true },
    { session: "1회 (2026-03-28)", angle: "우측", isBaseline: true },
    { session: "5회 (2026-04-25)", angle: "우측" },
    { session: "10회 (2026-05-16)", angle: "우측" },
    { session: "오늘 (2026-05-23)", angle: "우측", isToday: true },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        padding: "10px 14px",
        background: "var(--brand-subtle)",
        border: "1px solid var(--brand-muted)",
        borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="info" size={14} style={{ color: "var(--text-brand)" }} />
        <span style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
          시술 회차별 동일 조명·각도로 촬영 · 정면/좌측/우측 3컷이 권장됩니다.
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" icon="camera"
          onClick={() => showToast("카메라 연결 화면을 엽니다.")}>오늘 사진 촬영</Button>
        <Button variant="ghost" size="sm" icon="upload"
          onClick={() => showToast("파일 선택 창을 엽니다.")}>업로드</Button>
      </div>

      {["정면", "좌측", "우측"].map(angle => (
        <NCCBlock key={angle} title={`${angle} 시점 비교`} icon="camera">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {photoSlots.filter(p => p.angle === angle).map((slot, i) => (
              <div key={i} style={{
                aspectRatio: "3 / 4",
                background: slot.isToday ? "var(--brand-subtle)" : "var(--stone-100)",
                border: slot.isToday ? "2px dashed var(--jade-500)" :
                       slot.isBaseline ? "1px solid var(--amber-500)" : "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                position: "relative", overflow: "hidden",
                backgroundImage: `repeating-linear-gradient(135deg, transparent 0 12px, var(--stone-200) 12px 13px)`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Icon name={slot.isToday ? "camera-off" : "image"} size={28} style={{ color: "var(--text-muted)", opacity: 0.55 }} />
                <div style={{
                  fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
                  textAlign: "center", padding: "0 8px",
                }}>
                  {slot.isToday ? "촬영 대기" : "사진 자리"}
                </div>
                <div style={{
                  position: "absolute", top: 6, left: 6,
                  padding: "1px 7px", fontSize: 9, fontWeight: 700,
                  background: slot.isToday ? "var(--jade-500)" : slot.isBaseline ? "var(--amber-500)" : "var(--ink-700)",
                  color: "#fff", borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-sans)",
                }}>
                  {slot.isToday ? "오늘" : slot.isBaseline ? "BASELINE" : ""}
                </div>
                <div style={{
                  position: "absolute", bottom: 6, right: 6,
                  padding: "1px 7px", fontSize: 9, fontWeight: 600,
                  background: "rgba(0,0,0,0.55)", color: "#fff",
                  borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)",
                }}>{slot.session.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </NCCBlock>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 본문 — 측정 트래커
// ════════════════════════════════════════════════════════════════
function NCCMeasurementsView() {
  const series = NCC_MEASUREMENTS;
  const last = series[series.length - 1];
  const first = series[0];
  const delta = (key) => (last[key] - first[key]).toFixed(1);
  const cards = [
    { key: "weight",  label: "체중",   unit: "kg",   color: "var(--jade-500)",      icon: "scale" },
    { key: "bodyFat", label: "체지방", unit: "%",    color: "var(--cinnabar-600)",  icon: "droplet" },
    { key: "muscle",  label: "근육량", unit: "kg",   color: "var(--accent-pine)",   icon: "dumbbell" },
    { key: "bmi",     label: "BMI",    unit: "",     color: "var(--accent-marine)", icon: "activity" },
    { key: "waist",   label: "복부 둘레", unit: "cm", color: "var(--amber-600)",    icon: "minimize-2" },
    { key: "hip",     label: "골반 둘레", unit: "cm", color: "var(--pink-600)",     icon: "circle" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        padding: "10px 14px", background: "var(--brand-subtle)",
        border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="trending-down" size={14} style={{ color: "var(--text-brand)" }} />
        <span style={{ fontSize: 12, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>
          8주차 추이 · 체중 -2.2kg · 체지방 -2.9% · 복부 둘레 -4cm
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" icon="plus"
          onClick={() => showToast("오늘 측정값을 기록합니다.")}>오늘 측정 기록</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {cards.map(c => {
          const d = parseFloat(delta(c.key));
          const isGood = (c.key === "muscle") ? d >= 0 : d <= 0;
          return (
            <div key={c.key} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: 14, boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Icon name={c.icon} size={13} style={{ color: c.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{c.label}</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: isGood ? "var(--text-brand)" : "var(--status-danger-text)" }}>
                  <Icon name={d <= 0 ? "trending-down" : "trending-up"} size={11} />
                  {d > 0 ? "+" : ""}{d}{c.unit}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{last[c.key]}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{c.unit}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginLeft: "auto" }}>
                  시작 {first[c.key]}{c.unit}
                </span>
              </div>
              <NCCMiniChart data={series.map(s => s[c.key])} color={c.color} />
            </div>
          );
        })}
      </div>

      {/* 측정 테이블 */}
      <NCCBlock title="측정 이력" icon="table">
        <div style={{
          background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)", overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)",
            padding: "8px 12px", background: "var(--bg-raised)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <span>날짜</span><span>체중</span><span>체지방</span><span>근육량</span><span>BMI</span><span>복부</span><span>골반</span>
          </div>
          {series.map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "70px repeat(6, 1fr)",
              padding: "8px 12px", borderBottom: "1px solid var(--bg-raised)",
              alignItems: "center",
              background: i === series.length - 1 ? "var(--brand-subtle)" : "var(--bg-surface)",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)", fontWeight: i === series.length - 1 ? 700 : 400 }}>{r.date}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.weight}kg</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.bodyFat}%</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.muscle}kg</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.bmi}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.waist}cm</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{r.hip}cm</span>
            </div>
          ))}
        </div>
      </NCCBlock>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 본문 — 동의서
// ════════════════════════════════════════════════════════════════
function NCCConsentsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        padding: "10px 14px", background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="file-signature" size={14} style={{ color: "var(--text-secondary)" }} />
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
          비급여 시술별 동의서 · 회차마다 별도 서명이 필요한 경우 만료 표시
        </span>
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" icon="pen-tool"
          onClick={() => showToast("태블릿 서명 모드를 엽니다.")}>태블릿 서명</Button>
      </div>

      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 90px 110px 110px 110px",
          padding: "10px 16px", background: "var(--bg-raised)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--text-muted)", fontFamily: "var(--font-sans)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <span>동의서</span><span>필수</span><span>서명일</span><span>만료</span><span style={{ textAlign: "right" }}>액션</span>
        </div>
        {NCC_CONSENTS.map((c, i) => {
          const isSigned = !!c.signed;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1.4fr 90px 110px 110px 110px",
              padding: "11px 16px", borderBottom: "1px solid var(--bg-raised)",
              alignItems: "center", background: "var(--bg-surface)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "var(--radius-sm)",
                  background: isSigned ? "var(--jade-500)" : "transparent",
                  border: `1.5px solid ${isSigned ? "var(--jade-500)" : "var(--border-default)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSigned && <Icon name="check" size={11} style={{ color: "#fff" }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{c.name}</span>
              </div>
              <span>
                {c.required ? (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--status-danger-bg)", color: "var(--status-danger-text)",
                    border: "1px solid var(--status-danger-border)",
                    fontFamily: "var(--font-sans)",
                  }}>필수</span>
                ) : (
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 7px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-raised)", color: "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "var(--font-sans)",
                  }}>선택</span>
                )}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isSigned ? "var(--text-secondary)" : "var(--text-muted)" }}>{c.signed || "—"}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{c.expires || "—"}</span>
              <span style={{ textAlign: "right" }}>
                {isSigned ? (
                  <Button variant="ghost" size="sm" icon="eye"
                    onClick={() => showToast(`${c.name} 보기`)}>보기</Button>
                ) : (
                  <Button variant="primary" size="sm" icon="pen-tool"
                    onClick={() => showToast(`${c.name} 서명 화면을 엽니다.`)}>서명</Button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 메인 차트 화면
// ════════════════════════════════════════════════════════════════
function NonCoveredChartScreen({ onBack }) {
  const [activeVisitId, setActiveVisitId] = useStNCC(NCC_VISITS[0].id);
  const [tab, setTab] = useStNCC("treatment");

  const activeVisit = NCC_VISITS.find(v => v.id === activeVisitId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="비급여 진료 차트"
        subtitle="미용·다이어트 시술 전용"
        actions={<>
          <Button variant="ghost" size="sm" icon="message-circle"
            onClick={() => toastProgress("카카오톡 안내 전송 중…", "환자에게 시술 안내가 전송되었습니다")}>SMS·카톡</Button>
          <Button variant="secondary" size="sm" icon="printer"
            onClick={() => toastProgress("프린터로 전송 중…", "비급여 차트 1매가 인쇄되었습니다")}>인쇄</Button>
          <Button variant="primary" size="sm" icon="save"
            onClick={() => toastProgress("차트 저장 중…", "비급여 차트가 저장되었습니다")}>저장</Button>
        </>}
      />

      <NCCPatientStrip patient={NCC_PATIENT} onBack={onBack} />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Left rail */}
        <NCCVisitTimeline visits={NCC_VISITS} activeId={activeVisitId} onSelect={setActiveVisitId} />

        {/* Center */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{
            display: "flex", alignItems: "center", padding: "10px 22px 0", gap: 4,
            background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
          }}>
            {[
              { k: "treatment",    icon: "clipboard-list", label: "시술 기록" },
              { k: "photos",       icon: "camera",         label: "전후 사진" },
              { k: "measurements", icon: "line-chart",     label: "측정 트래커" },
              { k: "consents",     icon: "file-signature", label: "동의서" },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "8px 14px 10px", fontSize: 13, fontFamily: "var(--font-sans)",
                background: "transparent", border: "none", cursor: "pointer",
                color: tab === t.k ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: tab === t.k ? 600 : 400,
                borderBottom: `2px solid ${tab === t.k ? "var(--brand)" : "transparent"}`,
                marginBottom: -1,
              }}>
                <Icon name={t.icon} size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px 22px 22px" }}>
            {tab === "treatment"    && <NCCTreatmentView visit={activeVisit} />}
            {tab === "photos"       && <NCCPhotosView />}
            {tab === "measurements" && <NCCMeasurementsView />}
            {tab === "consents"     && <NCCConsentsView />}
          </div>
        </div>

        {/* Right rail */}
        <NCCRightRail patient={NCC_PATIENT} visits={NCC_VISITS} />
      </div>
    </div>
  );
}

Object.assign(window, { NonCoveredChartScreen });
