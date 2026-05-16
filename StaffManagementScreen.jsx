// KoMES — Staff Management (직원 관리)
// 한의원 직원 등록부 · 필터 · 검색 · 상세 (프로필/근무/권한/인사)
const { useState: useStateStaff, useMemo: useMemoStaff, useEffect: useEffectStaff } = React;

const KO_WEEK = ["월","화","수","목","금","토","일"];

// ── Filter Sidebar ───────────────────────────────────────────────
function StaffFilterSidebar({ filter, setFilter, counts }) {
  const statusItems = [
    { key: "all",      icon: "users",       label: "전체 직원" },
    { key: "active",   icon: "user-check",  label: "재직" },
    { key: "leave",    icon: "user-minus",  label: "휴직" },
    { key: "resigned", icon: "user-x",      label: "퇴직" },
  ];
  const roleItems = ROLE_GROUPS.map(g => ({
    key: `role:${g.key}`, icon: g.icon, label: g.label, color: g.color,
  }));
  const today = [
    { key: "today:on",  icon: "circle-dot", label: "오늘 출근" },
    { key: "today:off", icon: "moon",        label: "오늘 비번" },
  ];

  const renderRow = (item) => {
    const active = filter === item.key;
    return (
      <div key={item.key} onClick={() => setFilter(item.key)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
        borderRadius: "var(--radius-md)", cursor: "pointer",
        background: active ? "var(--brand-muted)" : "transparent",
        color: active ? "var(--text-brand)" : "var(--text-secondary)",
        fontSize: 12, fontWeight: active ? 600 : 400,
        fontFamily: "var(--font-sans)", transition: "all 0.12s",
      }}>
        <Icon name={item.icon} size={13} style={item.color && !active ? { color: item.color } : undefined} />
        <span style={{ flex: 1 }}>{item.label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: active ? "var(--text-brand)" : "var(--text-muted)" }}>
          {counts[item.key] ?? 0}
        </span>
      </div>
    );
  };

  const sectionHead = (text) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 10px", margin: "16px 0 6px", fontFamily: "var(--font-sans)" }}>{text}</div>
  );

  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)", overflowY: "auto", padding: "14px 10px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 10px", marginBottom: 6, fontFamily: "var(--font-sans)" }}>상태</div>
      {statusItems.map(renderRow)}
      {sectionHead("직책")}
      {roleItems.map(renderRow)}
      {sectionHead("오늘")}
      {today.map(renderRow)}
    </div>
  );
}

// ── Avatar with role color ───────────────────────────────────────
function StaffAvatar({ staff, size = 36 }) {
  const char = staff.name ? staff.name[0] : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${staff.color}22`, color: staff.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 600, flexShrink: 0,
      fontFamily: "var(--font-sans)",
      border: `1.5px solid ${staff.color}44`,
    }}>{char}</div>
  );
}

// ── Today status pill ────────────────────────────────────────────
function TodayStatusPill({ status }) {
  const meta = TODAY_STATUS_META[status] || TODAY_STATUS_META["휴식"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 600, padding: "2px 8px",
      borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
      background: meta.bg, color: meta.color,
      fontFamily: "var(--font-sans)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot }} />
      {status}
    </span>
  );
}

// ── Staff Row ────────────────────────────────────────────────────
function StaffRow({ s, selected, onSelect }) {
  const statusMeta = STATUS_META[s.status];
  return (
    <div onClick={() => onSelect(s)} style={{
      display: "grid",
      gridTemplateColumns: "40px 1.3fr 1fr 1fr 0.85fr 0.65fr 22px",
      alignItems: "center", gap: 10,
      padding: "11px 16px",
      cursor: "pointer",
      background: selected ? "var(--brand-subtle)" : "transparent",
      borderLeft: `3px solid ${selected ? "var(--jade-500)" : "transparent"}`,
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
      transition: "background 0.1s",
      opacity: s.status === "resigned" ? 0.62 : 1,
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--bg-raised)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
      <StaffAvatar staff={s} size={36} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span>{s.name}</span>
          {s.role === "원장" && <Icon name="crown" size={11} style={{ color: "var(--amber-600)" }} />}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: s.color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
            {s.role}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.dept} · {s.specialty}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.phone}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{s.todayHours}</div>
        <div style={{ marginTop: 3 }}><TodayStatusPill status={s.todayStatus} /></div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.joinDate}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{yearsOfService(s.joinDate)}</div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: "2px 8px",
        borderRadius: "var(--radius-full)", whiteSpace: "nowrap", textAlign: "center",
        background: statusMeta.bg, color: statusMeta.color,
        border: `1px solid ${statusMeta.border}`,
        justifySelf: "start",
        fontFamily: "var(--font-sans)",
      }}>{statusMeta.label}</span>
      <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)", justifySelf: "end" }} />
    </div>
  );
}

function yearsOfService(joinDate) {
  if (!joinDate) return "—";
  const [y, m] = joinDate.split("-").map(Number);
  const now = new Date(2026, 4, 16); // 고정 기준일
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1));
  if (months < 12) return `${months}개월차`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${yrs}년 ${rem}개월차` : `${yrs}년차`;
}

const iconBtnStaff = {
  width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-muted)",
};

// ── Schedule mini-grid ───────────────────────────────────────────
function ScheduleGrid({ schedule }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
      {KO_WEEK.map(d => {
        const v = schedule[d] || "—";
        const off = v === "휴진" || v === "휴무" || v === "—";
        return (
          <div key={d} style={{
            padding: "6px 4px", borderRadius: "var(--radius-sm)",
            background: off ? "var(--bg-raised)" : "var(--brand-subtle)",
            border: `1px solid ${off ? "var(--border-subtle)" : "var(--brand-muted)"}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", color: off ? "var(--text-muted)" : "var(--text-brand)", fontFamily: "var(--font-sans)" }}>{d}</div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: off ? "var(--text-muted)" : "var(--text-brand)", marginTop: 2 }}>{v}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────
function StaffDetailPanel({ staff, onClose, onEdit }) {
  const [tab, setTab] = useStateStaff("profile"); // profile | schedule | permissions | hr
  const [permState, setPermState] = useStateStaff([...staff.permissions]);
  useEffectStaff(() => { setTab("profile"); setPermState([...staff.permissions]); }, [staff.id]);
  const statusMeta = STATUS_META[staff.status];
  const leaveRemaining = (staff.leaveBalance?.annual ?? 0) - (staff.leaveBalance?.used ?? 0);

  return (
    <div style={{ width: 380, flexShrink: 0, borderLeft: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <StaffAvatar staff={staff} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)", letterSpacing: "-0.01em" }}>{staff.name}</span>
              {staff.role === "원장" && <Icon name="crown" size={13} style={{ color: "var(--amber-600)" }} />}
            </div>
            <div style={{ fontSize: 12, color: staff.color, fontWeight: 600, fontFamily: "var(--font-sans)", marginTop: 2 }}>{staff.role}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{staff.dept} · {staff.specialty}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}`, fontFamily: "var(--font-sans)" }}>
                {statusMeta.label}
              </span>
              <TodayStatusPill status={staff.todayStatus} />
            </div>
          </div>
          <button onClick={onClose} style={iconBtnStaff}>
            <Icon name="x" size={13} />
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "근속", value: yearsOfService(staff.joinDate) },
            { label: "오늘 환자", value: staff.todayPatients == null ? "—" : `${staff.todayPatients}명` },
            { label: "잔여 연차", value: `${leaveRemaining}일` },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "7px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <button onClick={() => onEdit && onEdit(staff)} style={{ flex: 1, padding: "7px 10px", background: "var(--jade-500)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Icon name="pencil" size={12} />정보 수정
          </button>
          <button style={{ padding: "7px 10px", background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="message-square" size={12} />메시지
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border-subtle)", padding: "0 12px", flexShrink: 0 }}>
        {[
          { k: "profile",     l: "프로필",  i: "user" },
          { k: "schedule",    l: "근무",    i: "calendar" },
          { k: "permissions", l: "권한",    i: "shield-check", count: permState.length },
          { k: "hr",          l: "인사",    i: "briefcase" },
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
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-brand)", background: "var(--brand-muted)", padding: "0 5px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "연락처",   value: staff.phone, mono: true, icon: "phone" },
              { label: "이메일",   value: staff.email, mono: true, icon: "mail" },
              { label: "면허·자격", value: staff.licenses.length ? staff.licenses.join("\n") : "없음", icon: "scroll-text", multi: true },
              { label: "전문 분야", value: staff.specialty, icon: "sparkles" },
              { label: "입사일",   value: `${staff.joinDate} (${yearsOfService(staff.joinDate)})`, mono: true, icon: "calendar-plus" },
              { label: "고용 형태", value: staff.workType, icon: "id-card" },
              { label: "메모",     value: staff.note || "—", icon: "notebook-pen" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 4 }}>
                  <Icon name={f.icon} size={10} />{f.label}
                </div>
                <div style={{
                  fontSize: 13, color: "var(--text-primary)",
                  fontFamily: f.mono ? "var(--font-mono)" : "var(--font-sans)",
                  lineHeight: 1.5, whiteSpace: f.multi ? "pre-line" : "normal",
                }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                <Icon name="calendar" size={10} />주간 근무
              </div>
              <ScheduleGrid schedule={staff.schedule} />
            </div>

            <div style={{ background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="clock" size={18} style={{ color: "var(--jade-600)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-sans)" }}>오늘 근무</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{staff.todayHours}</div>
              </div>
              <TodayStatusPill status={staff.todayStatus} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                <Icon name="calendar-off" size={10} />다가오는 휴가
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { date: "2026-05-20", type: "연차", days: 1, note: "개인 사유" },
                  { date: "2026-06-08 ~ 06-10", type: "여름휴가", days: 3, note: "" },
                ].map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", minWidth: 130 }}>{l.date}</span>
                    <Badge variant="warning">{l.type} {l.days}일</Badge>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{l.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              이 직원이 KoMES에서 접근할 수 있는 기능입니다.
            </div>

            {/* 권한 세트 프리셋 */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 7 }}>권한 세트</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {PERMISSION_PRESETS.map(preset => {
                  const active = preset.perms.length === permState.length &&
                    preset.perms.every(p => permState.includes(p));
                  return (
                    <button key={preset.key} onClick={() => setPermState([...preset.perms])} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                      border: `1px solid ${active ? "var(--jade-300)" : "var(--border-default)"}`,
                      background: active ? "var(--brand-muted)" : "var(--bg-surface)",
                      color: active ? "var(--text-brand)" : "var(--text-secondary)",
                      fontSize: 11, fontWeight: active ? 600 : 400, cursor: "pointer",
                      fontFamily: "var(--font-sans)", transition: "all 0.12s",
                    }}>
                      <Icon name={preset.icon} size={10} />{preset.label}
                    </button>
                  );
                })}
                <button onClick={() => setPermState([])} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                  border: "1px solid var(--border-subtle)", background: "transparent",
                  color: "var(--text-muted)", fontSize: 11, cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>
                  <Icon name="x" size={10} />전체 해제
                </button>
              </div>
            </div>

            {[
              {
                section: "시스템",
                icon: "shield",
                items: [
                  { key: "원장", label: "원장 권한", desc: "모든 기능 및 직원 관리 접근" },
                ],
              },
              {
                section: "진료",
                icon: "stethoscope",
                items: [
                  { key: "차트 작성", label: "차트 작성", desc: "환자 차트 신규 작성 및 수정" },
                  { key: "차트 보조 작성", label: "차트 보조", desc: "차트 보조 입력 (생체 신호, V/S)" },
                  { key: "처방 권한", label: "처방 권한", desc: "한약·침구 처방 발급" },
                ],
              },
              {
                section: "예약·수납",
                icon: "calendar-check",
                items: [
                  { key: "예약 관리", label: "예약 관리", desc: "예약 신규/변경/취소" },
                  { key: "수납", label: "수납", desc: "결제 및 환불 처리" },
                  { key: "보험 청구", label: "보험 청구", desc: "심평원·자보 청구 작성 및 전송" },
                ],
              },
              {
                section: "약재·재고",
                icon: "flask-conical",
                items: [
                  { key: "조제 권한", label: "조제 권한", desc: "탕전·조제 및 출고" },
                  { key: "약재 재고 관리", label: "약재 재고", desc: "약재 입고/출고/폐기 관리" },
                  { key: "재고 조정", label: "재고 조정", desc: "약재·소모품 재고 수정" },
                  { key: "발주", label: "발주 권한", desc: "거래처 발주서 생성 및 승인 요청" },
                ],
              },
              {
                section: "경영·인사",
                icon: "briefcase",
                items: [
                  { key: "통계 열람", label: "통계 열람", desc: "매출·환자 통계 대시보드" },
                  { key: "급여 관리", label: "급여 관리", desc: "급여 명세서 조회 및 작성" },
                  { key: "직원 관리", label: "직원 관리", desc: "직원 정보 및 권한 수정" },
                  { key: "직원 일정 관리", label: "직원 일정", desc: "근무표·휴가 승인" },
                ],
              },
            ].map(group => (
              <div key={group.section}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)", marginBottom: 6,
                }}>
                  <Icon name={group.icon} size={10} />{group.section}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {group.items.map(p => {
                    const granted = permState.includes(p.key);
                    return (
                      <div key={p.key} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        border: `1px solid ${granted ? "var(--brand-muted)" : "var(--border-subtle)"}`,
                        background: granted ? "var(--brand-subtle)" : "var(--bg-surface)",
                        borderRadius: "var(--radius-md)",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{p.label}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginTop: 1 }}>{p.desc}</div>
                        </div>
                        <Toggle on={granted} onChange={() =>
                          setPermState(prev => prev.includes(p.key) ? prev.filter(x => x !== p.key) : [...prev, p.key])
                        } />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "hr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 연차 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                <Icon name="palmtree" size={10} />연차 사용 현황
              </div>
              {(() => {
                const total = staff.leaveBalance.annual;
                const used = staff.leaveBalance.used;
                const pct = total === 0 ? 0 : (used / total) * 100;
                return (
                  <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                        <span style={{ fontFamily: "var(--font-mono)" }}>{used}</span> / {total}일 사용
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>잔여 <span style={{ color: "var(--text-brand)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{total - used}일</span></span>
                    </div>
                    <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--jade-500)", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 급여 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                <Icon name="banknote" size={10} />급여
              </div>
              <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="lock" size={16} style={{ color: "var(--text-muted)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{staff.salary.type}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>금액은 원장 권한으로만 조회 가능</div>
                </div>
                <button style={{ fontSize: 11, color: "var(--text-brand)", background: "transparent", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-sm)", padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>조회</button>
              </div>
            </div>

            {/* 인사 기록 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
                <Icon name="history" size={10} />인사 기록
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { date: staff.joinDate, type: "입사", note: `${staff.role} · ${staff.dept}` },
                  ...(staff.status === "leave" ? [{ date: "2026-03-04", type: "휴직", note: staff.note || "휴직 시작" }] : []),
                  ...(staff.status === "resigned" ? [{ date: "2026-02-28", type: "퇴사", note: staff.note || "퇴사" }] : []),
                  { date: "2025-12-15", type: "교육", note: "개인정보보호 의무 교육 이수" },
                  { date: "2025-01-01", type: "연봉 조정", note: "정기 연봉 협상" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", minWidth: 88 }}>{r.date}</span>
                    <Badge variant={r.type === "입사" ? "brand" : r.type === "퇴사" ? "danger" : r.type === "휴직" ? "warning" : "neutral"}>{r.type}</Badge>
                    <span style={{ flex: 1, fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{r.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  const [val, setVal] = useStateStaff(on);
  useEffectStaff(() => setVal(on), [on]);
  return (
    <button onClick={() => { const next = !val; setVal(next); onChange && onChange(next); }} style={{
      width: 32, height: 18, borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
      background: val ? "var(--jade-500)" : "var(--stone-300)",
      border: "none", position: "relative", cursor: "pointer",
      transition: "background 0.12s",
      flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: val ? 16 : 2,
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left 0.12s",
      }} />
    </button>
  );
}

// ── Summary tiles (top of list) ─────────────────────────────────
function SummaryTiles({ staff }) {
  const active = staff.filter(s => s.status === "active");
  const onToday = active.filter(s => s.todayStatus === "진료중" || s.todayStatus === "진료대기").length;
  const onLeave = staff.filter(s => s.status === "leave").length;
  const newThisYear = staff.filter(s => s.joinDate >= "2025-01-01" && s.status !== "resigned").length;

  const tiles = [
    { label: "전체 직원",   value: staff.length, sub: `재직 ${active.length}명`, icon: "users",       tone: "neutral" },
    { label: "오늘 출근",   value: onToday,       sub: `재직 ${active.length}명 중`, icon: "circle-dot",   tone: "brand" },
    { label: "휴직",       value: onLeave,       sub: "현재 휴직 중",          icon: "user-minus",   tone: "warning" },
    { label: "신규 (1년내)", value: newThisYear,  sub: "2025년 이후 입사",        icon: "user-plus",    tone: "info" },
  ];

  const toneColor = (t) => ({
    neutral: { bg: "var(--bg-raised)",   icon: "var(--ink-500)",      val: "var(--text-primary)" },
    brand:   { bg: "var(--brand-muted)",    icon: "var(--text-brand)",     val: "var(--text-brand)" },
    warning: { bg: "var(--status-warning-bg)",   icon: "var(--status-warning-text)",    val: "var(--status-warning-text)" },
    info:    { bg: "var(--status-danger-bg)", icon: "var(--status-danger-text)", val: "var(--status-danger-text)" },
  })[t];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "12px 16px", background: "var(--bg-page)" }}>
      {tiles.map(t => {
        const c = toneColor(t.tone);
        return (
          <div key={t.label} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "var(--radius-md)",
              background: c.bg, color: c.icon,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name={t.icon} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{t.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: c.val, fontFamily: "var(--font-serif)", lineHeight: 1, letterSpacing: "-0.02em" }}>{t.value}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{t.sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
function StaffManagementScreen() {
  const [staff] = useStateStaff(STAFF_MASTER);
  const [filter, setFilter] = useStateStaff("all");
  const [search, setSearch] = useStateStaff("");
  const [sort, setSort] = useStateStaff("role"); // role | join | name | tenure
  const [view, setView] = useStateStaff("list"); // list | cards
  const [selectedId, setSelectedId] = useStateStaff(staff[0]?.id);
  const [showNewStaff, setShowNewStaff] = useStateStaff(false);
  const [editStaff, setEditStaff] = useStateStaff(null);

  const counts = useMemoStaff(() => {
    const c = {
      "all":      staff.length,
      "active":   staff.filter(s => s.status === "active").length,
      "leave":    staff.filter(s => s.status === "leave").length,
      "resigned": staff.filter(s => s.status === "resigned").length,
      "today:on":  staff.filter(s => s.todayHours !== "—" && s.status === "active").length,
      "today:off": staff.filter(s => s.todayHours === "—" || s.status !== "active").length,
    };
    ROLE_GROUPS.forEach(g => {
      c[`role:${g.key}`] = staff.filter(s => s.roleKey === g.key).length;
    });
    return c;
  }, [staff]);

  const filtered = useMemoStaff(() => {
    let list = staff;
    if (filter === "active")        list = list.filter(s => s.status === "active");
    else if (filter === "leave")    list = list.filter(s => s.status === "leave");
    else if (filter === "resigned") list = list.filter(s => s.status === "resigned");
    else if (filter === "today:on") list = list.filter(s => s.todayHours !== "—" && s.status === "active");
    else if (filter === "today:off") list = list.filter(s => s.todayHours === "—" || s.status !== "active");
    else if (filter.startsWith("role:")) {
      const r = filter.slice(5);
      list = list.filter(s => s.roleKey === r);
    }

    if (search.trim()) {
      const q = search.trim();
      list = list.filter(s => s.name.includes(q) || s.role.includes(q) || s.dept.includes(q) || s.phone.includes(q) || s.specialty.includes(q));
    }

    const roleOrder = { doctor: 0, nurse: 1, pharmacist: 2, therapist: 3, admin: 4 };
    return [...list].sort((a, b) => {
      if (sort === "role")   return (roleOrder[a.roleKey] - roleOrder[b.roleKey]) || a.name.localeCompare(b.name, "ko");
      if (sort === "join")   return a.joinDate.localeCompare(b.joinDate);
      if (sort === "tenure") return a.joinDate.localeCompare(b.joinDate);
      if (sort === "name")   return a.name.localeCompare(b.name, "ko");
      return 0;
    });
  }, [staff, filter, search, sort]);

  const selected = staff.find(s => s.id === selectedId) || filtered[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-page)" }}>
      <TopBar
        title="직원 관리"
        subtitle={`전체 ${staff.length}명 · 재직 ${counts.active}명 · 휴직 ${counts.leave}명`}
        actions={<>
          <div style={{ width: 240 }}>
            <Input placeholder="이름·직책·부서·연락처 검색…" value={search} onChange={setSearch} icon="search" />
          </div>
          <Button variant="secondary" size="sm" icon="calendar-days">근무표</Button>
          <Button variant="secondary" size="sm" icon="download">내보내기</Button>
          <Button variant="primary" icon="user-plus" onClick={() => setShowNewStaff(true)}>직원 등록</Button>
        </>}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <StaffFilterSidebar filter={filter} setFilter={setFilter} counts={counts} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Sort/toolbar */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface)" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{filtered.length}</span>명
            </span>
            <div style={{ width: 1, height: 16, background: "var(--border-subtle)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>정렬</span>
            <div style={{ display: "flex", gap: 2, background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: 2 }}>
              {[
                { k: "role", l: "직책순" },
                { k: "join", l: "입사일순" },
                { k: "name", l: "가나다순" },
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

            <div style={{ marginLeft: "auto", display: "flex", gap: 2, background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: 2 }}>
              {[{ k: "list", i: "list" }, { k: "cards", i: "layout-grid" }].map(o => (
                <button key={o.k} onClick={() => setView(o.k)} title={o.k === "list" ? "리스트" : "카드"} style={{
                  width: 26, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                  background: view === o.k ? "var(--bg-surface)" : "transparent",
                  color: view === o.k ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: view === o.k ? "var(--shadow-sm)" : "none",
                }}>
                  <Icon name={o.i} size={13} />
                </button>
              ))}
            </div>
          </div>

          {view === "list" && (
            <>
              {/* Column headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "40px 1.3fr 1fr 1fr 0.85fr 0.65fr 22px",
                alignItems: "center", gap: 10,
                padding: "8px 16px", background: "var(--bg-raised)",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--text-muted)",
                fontFamily: "var(--font-sans)",
              }}>
                <span></span>
                <span>직원 · 직책</span>
                <span>연락처</span>
                <span>오늘 근무</span>
                <span>입사일</span>
                <span>상태</span>
                <span></span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-surface)" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
                    <Icon name="users" size={32} style={{ color: "var(--stone-300)", marginBottom: 10 }} />
                    <div>조건에 맞는 직원이 없습니다.</div>
                  </div>
                ) : filtered.map(s => (
                  <StaffRow key={s.id} s={s} selected={selected?.id === s.id} onSelect={() => setSelectedId(s.id)} />
                ))}
              </div>
            </>
          )}

          {view === "cards" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", background: "var(--bg-page)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {filtered.map(s => {
                  const sel = selected?.id === s.id;
                  return (
                    <div key={s.id} onClick={() => setSelectedId(s.id)} style={{
                      background: "var(--bg-surface)",
                      border: `1px solid ${sel ? "var(--jade-500)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: 14, cursor: "pointer",
                      boxShadow: sel ? "0 0 0 3px var(--jade-100)" : "var(--shadow-sm)",
                      transition: "all 0.12s",
                      opacity: s.status === "resigned" ? 0.65 : 1,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <StaffAvatar staff={s} size={44} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 5 }}>
                            {s.name}
                            {s.role === "원장" && <Icon name="crown" size={11} style={{ color: "var(--amber-600)" }} />}
                          </div>
                          <div style={{ fontSize: 11, color: s.color, fontWeight: 600, fontFamily: "var(--font-sans)" }}>{s.role}</div>
                        </div>
                        <TodayStatusPill status={s.todayStatus} />
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                        {s.dept} · {s.specialty}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
                        <div>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>오늘</div>
                          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{s.todayHours}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>근속</div>
                          <div style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{yearsOfService(s.joinDate)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <StaffDetailPanel
            staff={selected}
            onClose={() => setSelectedId(null)}
            onEdit={s => setEditStaff(s)}
          />
        )}
      </div>

      {showNewStaff && (
        <NewStaffModal
          onClose={() => setShowNewStaff(false)}
          onSubmit={() => setShowNewStaff(false)}
        />
      )}
      {editStaff && (
        <NewStaffModal
          initialData={editStaff}
          onClose={() => setEditStaff(null)}
          onSubmit={() => setEditStaff(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { StaffManagementScreen });
