// KoMES — 패키지 상세 모달 + 환자 등록 상세 모달 + 신규 패키지 모달
const { useState: useStatePkgM } = React;

// ── Package Detail Modal ────────────────────────────────────────────
function PackageDetailModal({ pkg, onClose }) {
  const cat = PACKAGE_CATEGORIES.find(c => c.key === pkg.category);
  const tone = PKG_TONES[cat.tone];
  const status = PKG_STATUS[pkg.status];
  const totalSessions = pkg.includes.reduce((s, i) => s + i.count, 0);
  const enrolled = ENROLLMENTS.filter(e => e.packageId === pkg.id);
  const activeCount    = enrolled.filter(e => e.status === "active").length;
  const completedCount = enrolled.filter(e => e.status === "completed").length;
  const expiredCount   = enrolled.filter(e => e.status === "expired").length;
  const avgProgress = enrolled.length === 0 ? 0
    : Math.round(enrolled.reduce((s, e) => s + e.sessionsUsed / e.sessionsTotal, 0) / enrolled.length * 100);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      backdropFilter: "blur(2px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 820, maxHeight: "88vh",
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "flex-start", gap: 14,
          background: `linear-gradient(180deg, ${tone.bg} 0%, var(--bg-surface) 100%)`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "var(--radius-lg)",
            background: "var(--bg-surface)", color: tone.fg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            border: `1px solid ${tone.border}`, boxShadow: "var(--shadow-sm)",
          }}>
            <Icon name={cat.icon} size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tone.fg }}>{cat.label}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>· {pkg.code}</span>
              {pkg.badge && <span style={{ fontSize: 9, fontWeight: 700, background: "var(--ink-800)", color: "var(--text-on-brand)", padding: "1px 6px", borderRadius: "var(--radius-sm)", letterSpacing: "0.06em" }}>{pkg.badge}</span>}
              <Badge variant={status.variant}><Icon name={status.icon} size={9} /> {status.label}</Badge>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)", letterSpacing: "-0.015em", lineHeight: 1.2 }}>{pkg.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{pkg.tagline}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <PkgStat label="등록 환자"   value={`${pkg.enrolled}명`} hint={`+${pkg.monthlyEnroll} 이번 달`} />
            <PkgStat label="진행 중"     value={`${activeCount}명`}  hint={`완료 ${completedCount} · 만료 ${expiredCount}`} tone="brand" />
            <PkgStat label="평균 진행률" value={`${avgProgress}%`}    hint="진행 환자 기준" />
            <PkgStat label="누적 매출"   value={KRW(pkg.revenue)}     hint={`평균 ${KRW(Math.round(pkg.revenue / Math.max(1, pkg.enrolled)))} / 명`} />
          </div>

          {/* Two columns: 구성 + 가격/정보 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            {/* Includes */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>패키지 구성</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>총 {totalSessions}회차 · {pkg.validity}일 유효</div>
              </div>
              <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {pkg.includes.map((inc, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", fontSize: 13,
                    borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                    background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-raised)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "var(--radius-sm)", background: "var(--brand-subtle)", color: "var(--text-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={iconForType(inc.type)} size={12} />
                      </div>
                      <span style={{ color: "var(--text-primary)" }}>{inc.type}</span>
                    </div>
                    <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{inc.count}{inc.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + meta */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>가격</div>
                <div style={{ padding: "14px 16px", border: `1px solid ${tone.border}`, background: tone.bg, borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>정가</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", textDecoration: "line-through" }}>{KRW(pkg.price)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>회원가</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>{KRW(pkg.memberPrice)}</span>
                  </div>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${tone.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>회차당 단가</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{KRW(Math.round(pkg.memberPrice / totalSessions))}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>메타</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, padding: "10px 14px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--bg-raised)" }}>
                  <PkgDetailRow label="패키지 코드" value={pkg.code} mono />
                  <PkgDetailRow label="등록일" value={pkg.createdAt} mono />
                  <PkgDetailRow label="총 회차" value={`${totalSessions}회`} mono />
                  <PkgDetailRow label="유효 기간" value={`${pkg.validity}일`} mono />
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled patients preview */}
          {enrolled.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>등록 환자 ({enrolled.length}명)</div>
                <button onClick={onClose} style={{ fontSize: 11, color: "var(--text-brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  전체 보기 <Icon name="arrow-right" size={11} />
                </button>
              </div>
              <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 180, overflowY: "auto" }}>
                {enrolled.slice(0, 6).map((e, idx) => {
                  const stat = ENR_STATUS[e.status];
                  const pct = Math.min(100, Math.round((e.sessionsUsed / e.sessionsTotal) * 100));
                  return (
                    <div key={e.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                      borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                      background: idx % 2 === 0 ? "var(--bg-surface)" : "var(--bg-raised)",
                      fontSize: 12,
                    }}>
                      <Avatar name={e.patient.name} size={24} />
                      <div style={{ minWidth: 90 }}>
                        <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{e.patient.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{e.patient.gender}·{e.patient.age}</div>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 5, background: "var(--bg-raised)", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: e.status === "expired" ? "var(--cinnabar-500)" : "var(--jade-400)" }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{e.sessionsUsed}/{e.sessionsTotal}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>D-{e.daysLeft}</span>
                      <Badge variant={stat.variant}><span style={{ width: 5, height: 5, borderRadius: "50%", background: stat.dot }} />{stat.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, alignItems: "center", background: "var(--bg-raised)" }}>
          <Button variant="ghost" size="md" icon="archive"
            onClick={() => showToast(pkg.status === "active" ? "패키지를 단종 처리합니다." : "패키지를 복구합니다.")}>
            {pkg.status === "active" ? "단종" : "복구"}
          </Button>
          <Button variant="ghost" size="md" icon="copy"
            onClick={() => showToast("패키지를 복제했습니다.")}>복제</Button>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" size="md" onClick={onClose}>닫기</Button>
          <Button variant="secondary" size="md" icon="edit-3"
            onClick={() => showToast("패키지 편집 모달을 엽니다.")}>편집</Button>
          <Button variant="primary" size="md" icon="user-plus"
            onClick={() => showToast("이 패키지로 환자 등록을 시작합니다.")}>환자 등록</Button>
        </div>
      </div>
    </div>
  );
}

function iconForType(type) {
  if (type.includes("침")) return "syringe";
  if (type.includes("부항") || type.includes("관법")) return "circle-dot";
  if (type.includes("한약")) return "leaf";
  if (type.includes("구") || type.includes("뜸")) return "flame";
  if (type.includes("추나")) return "hand";
  if (type.includes("상담")) return "messages-square";
  if (type.includes("인바디") || type.includes("측정") || type.includes("진단") || type.includes("사진")) return "activity";
  if (type.includes("물리") || type.includes("이학")) return "zap";
  return "circle";
}

function PkgStat({ label, value, hint, tone = "default" }) {
  const tones = {
    default: { bg: "var(--bg-surface)",  border: "var(--border-subtle)" },
    brand:   { bg: "var(--brand-subtle)", border: "var(--brand-muted)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: 2, lineHeight: 1.1 }}>{value}</div>
      {hint && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function PkgDetailRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)" }}>{value}</span>
    </div>
  );
}

// ── Enrollment Detail Modal ─────────────────────────────────────────
function EnrollmentDetailModal({ enr, onClose }) {
  const pkg = PACKAGES.find(p => p.id === enr.packageId);
  const cat = PACKAGE_CATEGORIES.find(c => c.key === enr.category);
  const tone = PKG_TONES[cat.tone];
  const stat = ENR_STATUS[enr.status];
  const pct = Math.min(100, Math.round((enr.sessionsUsed / enr.sessionsTotal) * 100));
  const sessionsLeft = enr.sessionsTotal - enr.sessionsUsed;

  // Build a synthetic visit timeline (used sessions distributed evenly)
  const start = new Date(enr.startDate);
  const last  = new Date(enr.lastVisit);
  const visits = [];
  for (let i = 0; i < enr.sessionsUsed; i++) {
    const t = i / Math.max(1, enr.sessionsUsed - 1);
    const d = new Date(start.getTime() + t * (last.getTime() - start.getTime()));
    const types = pkg.includes.map(inc => inc.type);
    visits.push({
      n: i + 1,
      date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      type: types[i % types.length],
      doctor: enr.sales,
    });
  }
  visits.reverse();

  let expLabel = `D-${enr.daysLeft}`;
  let expColor = "var(--text-primary)";
  if (enr.status === "completed") { expLabel = "완료됨"; expColor = "var(--text-muted)"; }
  else if (enr.status === "expired") { expLabel = "만료됨"; expColor = "var(--cinnabar-600)"; }
  else if (enr.daysLeft < 0) { expLabel = `${Math.abs(enr.daysLeft)}일 초과`; expColor = "var(--cinnabar-600)"; }
  else if (enr.daysLeft <= 7) { expColor = "var(--status-warning-text)"; }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      backdropFilter: "blur(2px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 780, maxHeight: "88vh",
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 14,
          background: "linear-gradient(180deg, var(--brand-subtle) 0%, var(--bg-surface) 100%)",
        }}>
          <Avatar name={enr.patient.name} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>{enr.patient.name}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{enr.patient.gender} · {enr.patient.age}세</span>
              <Badge variant={stat.variant}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: stat.dot }} /> {stat.label}
              </Badge>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="phone" size={11} /> {enr.patient.phone}
              </span>
              <span style={{ width: 1, height: 11, background: "var(--border-default)" }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="user" size={11} /> 담당 {enr.sales}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Package banner */}
          <div style={{ padding: "14px 16px", border: `1px solid ${tone.border}`, background: tone.bg, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--bg-surface)", color: tone.fg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
              <Icon name={cat.icon} size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>{enr.packageName}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{enr.packageCode}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{pkg.tagline}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>결제</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{KRW(enr.paid)}</div>
            </div>
          </div>

          {/* Big progress block */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px 16px", background: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>진행 현황</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>총 {enr.sessionsTotal}회차</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", lineHeight: 1 }}>{enr.sessionsUsed}</span>
                <span style={{ fontSize: 16, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/ {enr.sessionsTotal}회 사용</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-brand)", fontFamily: "var(--font-mono)" }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: "var(--bg-raised)", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: enr.status === "expired" ? "var(--cinnabar-500)" : pct >= 100 ? "var(--jade-500)" : "var(--jade-400)" }} />
              </div>
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)" }}>
                <span>잔여 <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{sessionsLeft}회</strong></span>
                <span>회차당 단가 <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{KRW(Math.round(enr.paid / enr.sessionsTotal))}</strong></span>
              </div>
            </div>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px 16px", background: "var(--bg-raised)", display: "flex", flexDirection: "column", gap: 8 }}>
              <PkgDetailRow label="구매일"     value={enr.startDate} mono />
              <PkgDetailRow label="만료일"     value={enr.expiryDate} mono />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>잔여 기간</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: expColor, fontFamily: "var(--font-mono)" }}>{expLabel}</span>
              </div>
              <PkgDetailRow label="최근 방문"   value={`${enr.lastVisit} (${enr.daysSinceLastVisit}일 전)`} mono />
              <PkgDetailRow label="등록 담당"   value={enr.sales} />
            </div>
          </div>

          {/* Visit timeline */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>방문 이력</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{visits.length}건</span>
            </div>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
              {visits.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>방문 이력이 없습니다.</div>
              ) : visits.map((v, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                  fontSize: 12,
                  borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                  background: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-raised)",
                }}>
                  <span style={{ width: 26, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-sm)" }}>{v.n}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", minWidth: 90 }}>{v.date}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-primary)" }}>
                    <Icon name={iconForType(v.type)} size={11} style={{ color: "var(--text-brand)" }} />
                    {v.type}
                  </span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.doctor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, alignItems: "center", background: "var(--bg-raised)" }}>
          <Button variant="ghost" size="md" icon={enr.status === "paused" ? "play" : "pause"}
            onClick={() => showToast(enr.status === "paused" ? "패키지를 재개합니다." : "패키지를 일시 중지합니다.")}>
            {enr.status === "paused" ? "재개" : "일시 중지"}
          </Button>
          <Button variant="ghost" size="md" icon="rotate-ccw"
            onClick={() => showToast("환불 처리 화면을 엽니다.")}>환불</Button>
          <Button variant="ghost" size="md" icon="message-square"
            onClick={() => showToast("환자에게 알림을 발송합니다.")}>알림 발송</Button>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" size="md" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="md" icon="plus-circle"
            onClick={() => showToast("회차를 차감했습니다.")}>회차 차감</Button>
        </div>
      </div>
    </div>
  );
}

// ── New Package Modal ───────────────────────────────────────────────
function NewPackageModal({ onClose }) {
  const [name, setName]         = useStatePkgM("");
  const [cat,  setCat]          = useStatePkgM("diet");
  const [code, setCode]         = useStatePkgM("");
  const [price, setPrice]       = useStatePkgM(500000);
  const [memberPct, setMember]  = useStatePkgM(10);
  const [validity, setValidity] = useStatePkgM(56);
  const [tagline, setTagline]   = useStatePkgM("");
  const [items, setItems] = useStatePkgM([
    { type: "경혈침술",   count: 8, unit: "회" },
    { type: "한약(첩약)", count: 4, unit: "주" },
  ]);

  const TYPE_OPTIONS = ["경혈침술", "약침술", "이침술", "단순추나", "복잡추나", "건식부항", "자락관법", "간접구", "한방물리요법", "한약(첩약)", "식이상담", "체질 진단", "인바디 측정", "체형 사진"];
  const memberPrice = Math.round(price * (1 - memberPct / 100) / 1000) * 1000;
  const totalSessions = items.reduce((s, i) => s + (Number(i.count) || 0), 0);

  const addItem = () => setItems([...items, { type: TYPE_OPTIONS[0], count: 4, unit: "회" }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const setItemField = (i, field, val) => setItems(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const submit = () => {
    if (!name || !code) { showToast("패키지명과 코드를 입력해주세요.", { variant: "warning" }); return; }
    onClose();
    showToast(`'${name}' 패키지가 등록되었습니다.`);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)", backdropFilter: "blur(2px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 720, maxHeight: "90vh",
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-muted)", color: "var(--text-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="package-plus" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>신규 패키지 등록</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>회차·구성·가격 설정 후 카탈로그에 추가됩니다.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Basic */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="패키지명" value={name} onChange={setName} placeholder="예: 다이어트 8주 집중" />
            <Input label="코드" value={code} onChange={setCode} placeholder="예: DT-08" />
          </div>
          <Input label="태그라인 (선택)" value={tagline} onChange={setTagline} placeholder="예: 체중·체지방 동시 관리 · 인바디 포함" />

          {/* Category */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>카테고리</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PACKAGE_CATEGORIES.map(c => {
                const t = PKG_TONES[c.tone];
                const active = cat === c.key;
                return (
                  <button key={c.key} onClick={() => setCat(c.key)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px",
                    fontSize: 12, fontFamily: "var(--font-sans)",
                    background: active ? t.bg : "var(--bg-surface)",
                    color: active ? t.fg : "var(--text-secondary)",
                    border: `1px solid ${active ? t.border : "var(--border-default)"}`,
                    borderRadius: "var(--radius-full)", cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                  }}>
                    <Icon name={c.icon} size={12} /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing + validity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Input label="정가 (원)" type="number" value={price} onChange={v => setPrice(Number(v) || 0)} />
            <Input label="회원 할인 (%)" type="number" value={memberPct} onChange={v => setMember(Number(v) || 0)} />
            <Input label="유효 기간 (일)" type="number" value={validity} onChange={v => setValidity(Number(v) || 0)} />
          </div>
          <div style={{ padding: "10px 14px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>회원가</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{KRW(memberPrice)}</div>
            </div>
            <div style={{ width: 1, height: 24, background: "var(--brand-muted)" }} />
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>총 회차</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{totalSessions}회</div>
            </div>
            <div style={{ width: 1, height: 24, background: "var(--brand-muted)" }} />
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>회차당</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{totalSessions > 0 ? KRW(Math.round(memberPrice / totalSessions)) : "—"}</div>
            </div>
          </div>

          {/* Items builder */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>패키지 구성</span>
              <button onClick={addItem} style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px",
                fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 500,
                background: "var(--bg-raised)", color: "var(--text-brand)",
                border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-sm)", cursor: "pointer",
              }}>
                <Icon name="plus" size={11} /> 항목 추가
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 10px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                  <select value={it.type} onChange={e => setItemField(i, "type", e.target.value)} style={{
                    flex: 1, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
                    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)", padding: "5px 8px", outline: "none",
                  }}>
                    {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input type="number" value={it.count} onChange={e => setItemField(i, "count", Number(e.target.value) || 0)} style={{
                    width: 64, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)",
                    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)", padding: "5px 8px", outline: "none", textAlign: "right",
                  }} />
                  <select value={it.unit} onChange={e => setItemField(i, "unit", e.target.value)} style={{
                    fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-primary)",
                    background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)", padding: "5px 8px", outline: "none",
                  }}>
                    {["회", "주", "박스", "kg"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                    <Icon name="trash-2" size={14} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)", background: "var(--bg-raised)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-md)" }}>
                  항목을 추가해 주세요.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--bg-raised)" }}>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check" onClick={submit}>등록</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PackageDetailModal, EnrollmentDetailModal, NewPackageModal });
