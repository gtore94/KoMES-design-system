// 병원 관리 — 섹션 콘텐츠 컴포넌트
// 각 섹션은 perm prop ("edit" | "read" | "locked")을 받아 권한별로 그려짐.

// ──────────────────────────────────────────────────────────────
// 1) 한의원 기본 정보
// ──────────────────────────────────────────────────────────────
function IdentitySection({ perm }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <SectionCard
      title="한의원 기본 정보"
      hint="요양기관 등록과 일치해야 청구 시 반려가 발생하지 않습니다."
      icon="building-2" anchor="identity" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(true)}>편집</Button>}>
      <FieldGrid cols={3}>
        <Field label="기관명"          value={CLINIC_DATA.name} />
        <Field label="영문명"          value={CLINIC_DATA.englishName} />
        <Field label="대표자"          value={CLINIC_DATA.representative} />
        <Field label="사업자 등록번호" value={CLINIC_DATA.bizNumber} mono />
        <Field label="요양기관기호"    value={CLINIC_DATA.ykiho} mono hint="공단·심평원 청구 식별번호" />
        <Field label="개원일"          value={CLINIC_DATA.established} mono />
        <Field label="대표 전화"        value={CLINIC_DATA.phone} mono />
        <Field label="팩스"            value={CLINIC_DATA.fax} mono />
        <Field label="대표 이메일"      value={CLINIC_DATA.email} />
        <Field label="우편번호"        value={CLINIC_DATA.postcode} mono />
        <Field label="주소"            value={`${CLINIC_DATA.address} ${CLINIC_DATA.addressDetail}`} full />
      </FieldGrid>
      <IdentityEditModal open={editing} onClose={() => setEditing(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 2) 진료 시간 · 휴진일
// ──────────────────────────────────────────────────────────────
function HoursSection({ perm }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <SectionCard
      title="진료 시간 · 휴진일"
      hint="환자 예약·홈페이지·카카오톡 채널에 자동 동기화됩니다."
      icon="clock" anchor="hours" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(true)}>편집</Button>}>
      <DataTable
        cols={[
          { label: "요일", key: "day", w: "18%" },
          { label: "오픈", key: "open", mono: true, align: "center", w: "14%" },
          { label: "마감", key: "close", mono: true, align: "center", w: "14%" },
          { label: "점심", key: "lunch", mono: true, align: "center", w: "20%" },
          { label: "비고", w: "34%", render: (h) =>
            h.closed ? <Badge variant="danger">휴진</Badge> :
            h.note  ? <Badge variant="warning">{h.note}</Badge> :
            <span style={{ color: "var(--text-muted)" }}>—</span>
          },
        ]}
        rows={HOURS}
      />
      <div style={{
        padding: "14px 18px",
        background: "var(--bg-raised)",
        borderTop: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
          }}>예정된 휴진일 · {HOLIDAYS.length}건</div>
          {perm === "edit" && <Button variant="ghost" size="sm" icon="plus" onClick={() => setEditing(true)}>휴진일 추가</Button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HOLIDAYS.map((h,i)=>(
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "5px 10px", fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{h.date}</span>
              <span style={{ color: "var(--text-primary)" }}>{h.name}</span>
              {h.auto && <span style={{
                fontSize: 9, padding: "1px 6px", borderRadius: "var(--radius-full)",
                background: "var(--brand-subtle)", color: "var(--text-brand)",
                fontWeight: 600,
              }}>법정</span>}
            </div>
          ))}
        </div>
      </div>
      <HoursEditModal open={editing} onClose={() => setEditing(false)}
        hours={HOURS} holidays={HOLIDAYS} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 3) 진료실 · 베드
// ──────────────────────────────────────────────────────────────
function RoomsSection({ perm }) {
  const [adding, setAdding] = React.useState(false);
  return (
    <SectionCard
      title="진료실 · 베드"
      hint="예약 캘린더와 액팅 오더 시스템에서 사용되는 공간 단위입니다."
      icon="door-open" anchor="rooms" perm={perm}
      actions={perm === "edit" && <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>공간 추가</Button>}>
      <DataTable
        cols={[
          { label: "코드", key: "code", mono: true, w: "10%" },
          { label: "이름", key: "name", w: "20%" },
          { label: "유형", w: "12%", render: (r) => <Badge variant={
            r.type === "진료" ? "brand" :
            r.type === "치료" ? "neutral" :
            r.type === "조제" ? "success" :
            "warning"
          }>{r.type}</Badge> },
          { label: "담당", key: "staff", w: "28%" },
          { label: "베드", key: "beds", mono: true, align: "center", w: "10%" },
          { label: "상태", w: "20%", render: (r) =>
            r.status === "운영" ? <Badge variant="success">운영</Badge> : <Badge variant="warning">{r.status}</Badge>
          },
        ]}
        rows={ROOMS}
      />
      <RoomAddModal open={adding} onClose={() => setAdding(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 3-1) 장비 관리
// ──────────────────────────────────────────────────────────────
function EquipmentSection({ perm }) {
  const [adding, setAdding] = React.useState(false);
  const today = new Date("2026-05-17");
  const daysUntil = (d) => {
    if (!d || d === "—") return null;
    return Math.round((new Date(d) - today) / 86400000);
  };

  const total = EQUIPMENT.length;
  const inUse = EQUIPMENT.filter(e => e.status === "운영").length;
  const due   = EQUIPMENT.filter(e => {
    const n = daysUntil(e.nextCheck); return n != null && n <= 30;
  }).length;
  const repair = EQUIPMENT.filter(e => e.status === "수리 중").length;

  const catVariant = (c) =>
    c === "진단" ? "brand"  :
    c === "조제" ? "success":
    c === "IT"   ? "neutral":
                   "warning";

  return (
    <SectionCard
      title="장비 관리"
      hint="진료·조제·IT 장비의 위치, 점검 일정, 보증을 관리합니다."
      icon="cpu" anchor="equipment" perm={perm}
      actions={perm === "edit" && <>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("장비 목록 내보내는 중…", `장비 ${EQUIPMENT.length}건을 CSV로 내보냈습니다`)}>CSV</Button>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>장비 등록</Button>
      </>}>
      {/* 요약 KPI */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
        padding: 14, borderBottom: "1px solid var(--border-subtle)",
      }}>
        {[
          { l: "총 장비",     v: total,  hint: "등록된 자산"  },
          { l: "운영 중",     v: inUse,  hint: `${total - inUse}대 비운영`, tone: "ok" },
          { l: "점검 임박",   v: due,    hint: "30일 이내",                tone: due ? "warn" : "ok" },
          { l: "수리 중",     v: repair, hint: "원인 추적 필요",            tone: repair ? "warn" : "ok" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "10px 12px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--text-muted)",
              fontFamily: "var(--font-sans)", marginBottom: 4,
            }}>{s.l}</div>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500,
              color: s.tone === "warn" ? "var(--text-warning)" : "var(--text-primary)",
              letterSpacing: "-0.015em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
            }}>{s.v}</div>
            <div style={{
              fontSize: 11, color: "var(--text-muted)",
              fontFamily: "var(--font-sans)", marginTop: 2,
            }}>{s.hint}</div>
          </div>
        ))}
      </div>

      <DataTable
        cols={[
          { label: "자산코드", key: "code", mono: true, w: "10%" },
          { label: "장비명",    w: "30%", render: (e) =>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                제조사 {e.maker}
              </div>
            </div>
          },
          { label: "분류", w: "9%", render: (e) =>
            <Badge variant={catVariant(e.cat)}>{e.cat}</Badge>
          },
          { label: "위치", key: "room", mono: true, align: "center", w: "8%" },
          { label: "다음 점검", w: "16%", mono: true, render: (e) => {
            if (e.nextCheck === "—") return <span style={{ color: "var(--text-muted)" }}>—</span>;
            const n = daysUntil(e.nextCheck);
            const urgent = n != null && n <= 14;
            return (
              <span style={{
                color: urgent ? "var(--text-warning)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
              }}>
                {e.nextCheck}
                {n != null && (
                  <span style={{ marginLeft: 6, fontSize: 10.5, color: "var(--text-muted)" }}>
                    D{n >= 0 ? "-" : "+"}{Math.abs(n)}
                  </span>
                )}
              </span>
            );
          }},
          { label: "보증", w: "12%", mono: true, render: (e) => {
            if (e.warranty === "—") return <span style={{ color: "var(--text-muted)" }}>—</span>;
            const expired = new Date(e.warranty) < today;
            return (
              <span style={{
                color: expired ? "var(--text-muted)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                textDecoration: expired ? "line-through" : "none",
              }}>{e.warranty}</span>
            );
          }},
          { label: "상태", w: "15%", render: (e) =>
            e.status === "운영"      ? <Badge variant="success">{e.status}</Badge> :
            e.status === "수리 중"    ? <Badge variant="danger">{e.status}</Badge>  :
            e.status === "점검 예정"  ? <Badge variant="warning">{e.status}</Badge> :
                                        <Badge variant="neutral">{e.status}</Badge>
          },
        ]}
        rows={EQUIPMENT}
      />
      <EquipmentAddModal open={adding} onClose={() => setAdding(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 3-2) 치료재 관리 (보험 치료재 카탈로그)
// ──────────────────────────────────────────────────────────────
function MaterialsSection({ perm }) {
  const [query, setQuery] = React.useState("");
  const [editRow, setEditRow] = React.useState(null);  // null | "new" | row

  const q = query.trim().toLowerCase();
  const rows = q
    ? MATERIALS.filter(m => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    : MATERIALS;

  const remove = (m) => showToast(`${m.code} ${m.name} · 삭제되었습니다`, { variant: "warning", icon: "trash-2" });

  return (
    <SectionCard
      title="치료재 관리"
      hint="보험 치료재 카탈로그 — 상한금액·판매자·적용기간·선별급여 구분을 관리합니다."
      icon="syringe" anchor="materials" perm={perm}
      actions={perm === "edit" && <>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("치료재 목록 내보내는 중…", `치료재 ${MATERIALS.length}건을 CSV로 내보냈습니다`)}>CSV</Button>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setEditRow("new")}>새 오더 등록</Button>
      </>}>
      {/* 검색 */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ position: "relative", width: 320, maxWidth: "100%" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
            <Icon name="search" size={14} />
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="코드 or 명칭 입력"
            style={{
              fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
              background: "var(--bg-surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)", padding: "7px 10px 7px 30px",
              outline: "none", width: "100%", boxSizing: "border-box",
            }} />
        </div>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {rows.length}건
        </span>
      </div>

      <DataTable
        cols={[
          { label: "코드", key: "code", mono: true, w: "10%" },
          { label: "명칭", w: "20%", render: (m) =>
            <span style={{ color: "var(--text-brand)", fontWeight: 600 }}>{m.name}</span>
          },
          { label: "상한금액", w: "9%", mono: true, align: "right", render: (m) =>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{m.limit.toLocaleString()}</span>
          },
          { label: "판매자", key: "vendor", w: "18%" },
          { label: "적용시작일", key: "start", mono: true, align: "center", w: "11%" },
          { label: "적용종료일", w: "11%", mono: true, align: "center", render: (m) =>
            m.end && m.end !== "—"
              ? <span style={{ fontFamily: "var(--font-mono)" }}>{m.end}</span>
              : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
          { label: "선별급여", key: "benefit", w: "11%" },
          { label: "사용여부", w: "8%", align: "center", render: (m) =>
            m.inUse ? <Badge variant="success">사용</Badge> : <Badge variant="neutral">사용안함</Badge>
          },
          { label: "수정 및 삭제", w: "12%", align: "center", render: (m) =>
            perm === "edit" ? (
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant="secondary" size="sm" onClick={() => setEditRow(m)}>수정</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(m)}>삭제</Button>
              </div>
            ) : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
        ]}
        rows={rows}
      />
      <MaterialAddModal open={editRow !== null}
        initial={editRow && editRow !== "new" ? editRow : undefined}
        onClose={() => setEditRow(null)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 3-3) 보험 임의처방
// ──────────────────────────────────────────────────────────────
function PrescriptionSection({ perm }) {
  const [query, setQuery] = React.useState("");
  const [editRow, setEditRow] = React.useState(null);  // null | "new" | row

  const q = query.trim().toLowerCase();
  const rows = q
    ? INSURANCE_RX.filter(r => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
    : INSURANCE_RX;

  const remove = (r) => showToast(`${r.code} ${r.name} · 삭제되었습니다`, { variant: "warning", icon: "trash-2" });

  return (
    <SectionCard
      title="보험 임의처방"
      hint="원내 조제용 보험 한약 처방을 약재 조합으로 직접 등록·관리합니다."
      icon="pill" anchor="rx" perm={perm}
      actions={perm === "edit" && <>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("임의처방 목록 내보내는 중…", `임의처방 ${INSURANCE_RX.length}건을 CSV로 내보냈습니다`)}>CSV</Button>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setEditRow("new")}>새 임의처방 등록</Button>
      </>}>
      {/* 검색 */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ position: "relative", width: 320, maxWidth: "100%" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
            <Icon name="search" size={14} />
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="임의처방 조회 (코드 · 처방명)"
            style={{
              fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
              background: "var(--bg-surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)", padding: "7px 10px 7px 30px",
              outline: "none", width: "100%", boxSizing: "border-box",
            }} />
        </div>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {rows.length}건
        </span>
      </div>

      <DataTable
        cols={[
          { label: "코드", key: "code", mono: true, w: "12%" },
          { label: "처방명", w: "26%", render: (r) =>
            <div>
              <span style={{ color: "var(--text-brand)", fontWeight: 600 }}>{r.name}</span>
              {r.herbs && r.herbs.length > 0 && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>약재 {r.herbs.length}종</span>
              )}
            </div>
          },
          { label: "단가", w: "12%", mono: true, align: "right", render: (r) =>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.price.toLocaleString()}</span>
          },
          { label: "비고", w: "34%", render: (r) =>
            r.note ? <span style={{ color: "var(--text-secondary)" }}>{r.note}</span>
                   : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
          { label: "수정 및 삭제", w: "16%", align: "center", render: (r) =>
            perm === "edit" ? (
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant="secondary" size="sm" onClick={() => setEditRow(r)}>수정</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(r)}>삭제</Button>
              </div>
            ) : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
        ]}
        rows={rows}
      />
      <PrescriptionRxModal open={editRow !== null}
        initial={editRow && editRow !== "new" ? editRow : undefined}
        onClose={() => setEditRow(null)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 3-4) 기타 비급여 오더
// ──────────────────────────────────────────────────────────────
function NonBenefitSection({ perm }) {
  const [cat, setCat] = React.useState("전체");
  const [query, setQuery] = React.useState("");
  const [editRow, setEditRow] = React.useState(null);  // null | "new" | row

  const q = query.trim().toLowerCase();
  const rows = NONBENEFIT_ORDERS.filter(o => {
    if (cat !== "전체" && o.cat !== cat) return false;
    if (q && !(o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))) return false;
    return true;
  });

  const remove = (o) => showToast(`${o.code} ${o.name} · 삭제되었습니다`, { variant: "warning", icon: "trash-2" });

  return (
    <SectionCard
      title="기타 비급여"
      hint="비급여 시술·투약·검사·제증명 등 오더를 분류별로 관리합니다."
      icon="tag" anchor="nonbenefit" perm={perm}
      actions={perm === "edit" && <>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("비급여 오더 내보내는 중…", `비급여 오더 ${NONBENEFIT_ORDERS.length}건을 CSV로 내보냈습니다`)}>CSV</Button>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setEditRow("new")}>새 오더 등록</Button>
      </>}>
      {/* 분류 탭 + 검색 */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {NONBENEFIT_CATS.map(c => {
            const on = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "4px 11px", fontSize: 11.5, fontWeight: on ? 600 : 500,
                borderRadius: "var(--radius-full)",
                background: on ? "var(--brand-subtle)" : "var(--bg-surface)",
                color: on ? "var(--text-brand)" : "var(--text-secondary)",
                border: `1px solid ${on ? "var(--brand)" : "var(--border-default)"}`,
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>{c}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 320, maxWidth: "100%" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
              <Icon name="search" size={14} />
            </span>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="비급여오더 조회 (코드 · 오더명칭)"
              style={{
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", padding: "7px 10px 7px 30px",
                outline: "none", width: "100%", boxSizing: "border-box",
              }} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
            {rows.length}건
          </span>
        </div>
      </div>

      <DataTable
        cols={[
          { label: "코드", key: "code", mono: true, w: "10%" },
          { label: "오더명칭", w: "26%", render: (o) =>
            <span style={{ color: "var(--text-brand)", fontWeight: 600 }}>{o.name}</span>
          },
          { label: "단가", w: "11%", mono: true, align: "right", render: (o) =>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{o.price.toLocaleString()}</span>
          },
          { label: "VAT", w: "8%", mono: true, align: "right", render: (o) =>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>{o.vat.toLocaleString()}</span>
          },
          { label: "구분", w: "12%", render: (o) =>
            o.cat ? <Badge variant="neutral">{o.cat}</Badge> : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
          { label: "보고대상", w: "10%", align: "center", render: (o) =>
            o.report === "Y" ? <Badge variant="success">Y</Badge>
                             : <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>미확인</span>
          },
          { label: "과세", w: "7%", align: "center", render: (o) =>
            o.taxable ? <Badge variant="warning">VAT</Badge> : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
          { label: "수정 및 삭제", w: "16%", align: "center", render: (o) =>
            perm === "edit" ? (
              <div style={{ display: "inline-flex", gap: 6 }}>
                <Button variant="secondary" size="sm" onClick={() => setEditRow(o)}>수정</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(o)}>삭제</Button>
              </div>
            ) : <span style={{ color: "var(--text-muted)" }}>—</span>
          },
        ]}
        rows={rows}
      />
      <NonBenefitOrderModal open={editRow !== null}
        initial={editRow && editRow !== "new" ? editRow : undefined}
        onClose={() => setEditRow(null)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 4) 진료 과목 · 수가표
// ──────────────────────────────────────────────────────────────
function MenuSection({ perm }) {
  const [adding, setAdding] = React.useState(false);
  return (
    <SectionCard
      title="진료 과목 · 수가표"
      hint="청구 시 자동 매핑되는 EDI 코드와 가격을 관리합니다."
      icon="list-checks" anchor="menu" perm={perm}
      actions={<>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("수가표 내보내는 중…", `수가 항목 ${PRICE_LIST.length}건을 CSV로 내보냈습니다`)}>CSV 내보내기</Button>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>항목 추가</Button>
      </>}>
      <DataTable
        cols={[
          { label: "EDI 코드", key: "code", mono: true, w: "13%" },
          { label: "항목", key: "name", w: "35%" },
          { label: "분류", w: "12%", render: (r) => <Badge variant="neutral">{r.cat}</Badge> },
          { label: "단가", mono: true, align: "right", w: "20%", render: (r) =>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>₩ {r.price.toLocaleString()}</span>
          },
          { label: "급여 구분", w: "20%", render: (r) =>
            r.ins === "급여" ? <Badge variant="success">{r.ins}</Badge> : <Badge variant="warning">{r.ins}</Badge>
          },
        ]}
        rows={PRICE_LIST}
      />
      <MenuItemAddModal open={adding} onClose={() => setAdding(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 5) 면허 · 자격
// ──────────────────────────────────────────────────────────────
function LicenseSection({ perm }) {
  const [adding, setAdding] = React.useState(false);
  return (
    <SectionCard
      title="면허 · 자격"
      hint="개설자 및 한의사 면허 정보. 보건소 신고 양식에 자동 채워집니다."
      icon="shield-check" anchor="license" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>자격 추가</Button>}>
      <div style={{ padding: "8px 18px 18px" }}>
        {LICENSES.map((l,i)=>(
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 14, alignItems: "center",
            padding: "14px 0",
            borderBottom: i < LICENSES.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "var(--radius-full)",
              background: "var(--brand-subtle)", color: "var(--text-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600,
            }}>{l.name[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                display: "flex", gap: 8, alignItems: "baseline", marginBottom: 2,
              }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
                  color: "var(--text-primary)",
                }}>{l.name}</span>
                <span style={{
                  fontSize: 11, color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}>{l.role}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12,
                color: "var(--text-secondary)",
              }}>{l.license} · 발급 {l.issued}</div>
              {l.spec !== "—" && (
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: 11.5,
                  color: "var(--text-muted)", marginTop: 3,
                }}>{l.spec}</div>
              )}
            </div>
            <Badge variant="success">{l.status}</Badge>
          </div>
        ))}
      </div>
      <LicenseAddModal open={adding} onClose={() => setAdding(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 6) 보험 연동
// ──────────────────────────────────────────────────────────────
function InsuranceSection({ perm }) {
  return (
    <SectionCard
      title="보험 연동"
      hint="공인인증서 기반 EDI 연동. 매일 새벽 자동 동기화."
      icon="file-badge" anchor="insurance" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="refresh-cw" onClick={() => toastProgress("EDI 연동 동기화 중…", "보험 연동 동기화가 완료되었습니다", 1600)}>지금 동기화</Button>}>
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {INSURANCE.map((ins,i)=>(
          <div key={i} style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: 12,
            background: ins.connected ? "var(--bg-surface)" : "var(--bg-raised)",
            opacity: ins.connected ? 1 : 0.7,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "var(--radius-full)",
                  background: ins.connected ? "var(--brand)" : "var(--text-muted)",
                }} />
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                  color: "var(--text-primary)",
                }}>{ins.name}</span>
              </div>
              {ins.connected
                ? <Badge variant="success">연동</Badge>
                : <Badge variant="neutral">미연동</Badge>}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px",
              fontFamily: "var(--font-sans)", fontSize: 11.5,
            }}>
              <span style={{ color: "var(--text-muted)" }}>마지막 동기화</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{ins.lastSync}</span>
              <span style={{ color: "var(--text-muted)" }}>인증서 만료</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                color: ins.certExpires !== "—" && ins.certExpires < "2026-07-01"
                  ? "var(--text-warning)" : "var(--text-secondary)",
              }}>{ins.certExpires}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 7) 결제 · 세금
// ──────────────────────────────────────────────────────────────
function BillingSection({ perm }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <SectionCard
      title="결제 · 세금"
      hint="수납 화면 결제 옵션과 세금계산서 자동 발행 설정."
      icon="receipt" anchor="billing" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(true)}>편집</Button>}>
      <FieldGrid cols={2}>
        <Field label="부가세율"          value={BILLING.vatRate} mono badge={<Badge variant="brand">표시가 부가세 포함</Badge>} />
        <Field label="카드 결제 대행사"   value={BILLING.cardProcessor} hint={BILLING.cardFee} />
        <Field label="현금영수증 자동발행" value={BILLING.cashReceiptAuto ? "활성" : "비활성"} badge={<Badge variant={BILLING.cashReceiptAuto ? "success" : "neutral"}>{BILLING.cashReceiptAuto ? "ON" : "OFF"}</Badge>} />
        <Field label="세금계산서 자동발행" value={BILLING.taxInvoiceAuto ? "활성" : "비활성"} badge={<Badge variant={BILLING.taxInvoiceAuto ? "success" : "neutral"}>{BILLING.taxInvoiceAuto ? "ON" : "OFF"}</Badge>} />
        <Field label="대표 계좌"          value={BILLING.bankAccount} mono full />
      </FieldGrid>
      <BillingEditModal open={editing} onClose={() => setEditing(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 8) 분원 관리
// ──────────────────────────────────────────────────────────────
function BranchSection({ perm }) {
  const [adding, setAdding] = React.useState(false);
  return (
    <SectionCard
      title="분원 관리"
      hint="본점·분원 간 환자 차트 공유 범위 및 처방 동기화 설정."
      icon="git-branch" anchor="branch" perm={perm}
      actions={perm === "edit" && <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(true)}>분원 추가</Button>}>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {BRANCHES.map((b,i)=>(
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 14, alignItems: "center",
            padding: "12px 14px",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            background: b.role === "본점" ? "var(--brand-tint)" : "var(--bg-surface)",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "var(--radius-md)",
              background: "var(--brand-muted)", color: "var(--text-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600,
            }}>{b.loc[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2,
              }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
                  color: "var(--text-primary)",
                }}>{b.name}</span>
                <Badge variant={b.role === "본점" ? "brand" : "neutral"}>{b.role}</Badge>
                <span style={{
                  fontSize: 11, color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}>개원 {b.since}</span>
              </div>
              <div style={{
                fontSize: 12, color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}>{b.address}</div>
            </div>
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "flex-end", gap: 4,
              fontFamily: "var(--font-sans)", fontSize: 11,
            }}>
              {b.status === "운영"
                ? <Badge variant="success">{b.status}</Badge>
                : <Badge variant="warning">{b.status}</Badge>}
              <span style={{ color: "var(--text-muted)" }}>
                직원 <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{b.staff}</span>
                {" · "}
                이달 환자 <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{b.patients.toLocaleString()}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <BranchAddModal open={adding} onClose={() => setAdding(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 9) 로고 · 서식 브랜딩
// ──────────────────────────────────────────────────────────────
function BrandSection({ perm }) {
  const [uploading, setUploading] = React.useState(false);
  return (
    <SectionCard
      title="로고 · 서식 브랜딩"
      hint="처방전·진단서·접수증·문자/카톡 발신에 사용되는 시각 정체성."
      icon="image" anchor="brand" perm={perm}
      actions={<Button variant="secondary" size="sm" icon="upload" onClick={() => setUploading(true)}>로고 업로드</Button>}>
      <div style={{ padding: 18, display: "grid", gridTemplateColumns: "260px 1fr", gap: 22 }}>
        {/* Logo preview */}
        <div style={{
          aspectRatio: "1 / 1",
          border: "1px dashed var(--border-default)",
          borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 10,
          background: `repeating-linear-gradient(45deg, var(--bg-raised) 0 8px, var(--bg-surface) 8px 16px)`,
        }}>
          <div style={{
            width: 86, height: 86, borderRadius: "var(--radius-full)",
            background: "var(--brand)", color: "var(--text-on-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 300,
          }}>松</div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 11,
            color: "var(--text-muted)",
          }}>로고 — 1:1 PNG · SVG</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="처방전 표기명"  value="솔잎한의원 · 원장 김민준" />
          <Field label="처방전 푸터"    value="환자 안내 · 솔잎한의원 솔샘 챗봇  ☎ 02-555-7700" />
          <Field label="문자 발신번호"  value="0507-1234-7700" mono />
          <Field label="카카오 채널"    value="@솔잎한의원" />
          <div style={{
            display: "flex", gap: 8, alignItems: "center",
            paddingTop: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--text-muted)",
            }}>색상 테마</span>
            {["Jade","Navy","Pink"].map((c, i) => (
              <span key={c} style={{
                fontSize: 11, padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                background: i === 0 ? "var(--brand-muted)" : "var(--bg-raised)",
                color: i === 0 ? "var(--text-brand)" : "var(--text-secondary)",
                border: `1px solid ${i === 0 ? "var(--brand)" : "var(--border-default)"}`,
                fontFamily: "var(--font-sans)",
                fontWeight: i === 0 ? 600 : 400,
              }}>{c}{i === 0 && " ✓"}</span>
            ))}
          </div>
        </div>
      </div>
      <LogoUploadModal open={uploading} onClose={() => setUploading(false)} />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 10) 백업 · 데이터
// ──────────────────────────────────────────────────────────────
function BackupSection({ perm }) {
  return (
    <SectionCard
      title="백업 · 데이터"
      hint="환자 차트·처방·청구 데이터의 암호화 백업과 복원."
      icon="database" anchor="backup" perm={perm}
      actions={<>
        <Button variant="ghost" size="sm" icon="download" onClick={() => toastProgress("최신 백업 준비 중…", "백업 파일 다운로드를 시작했습니다")}>백업 다운로드</Button>
        <Button variant="secondary" size="sm" icon="play" onClick={() => toastProgress("백업을 생성하는 중…", "백업이 완료되었습니다 · 암호화 저장됨", 1800)}>지금 백업</Button>
      </>}>
      <div style={{
        padding: "16px 18px",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        {[
          { label: "백업 스케줄",   value: "매일 04:00",       sub: "원격 — Amazon S3 서울 리전" },
          { label: "암호화",        value: "AES-256",          sub: "조직 키로 자동 관리" },
          { label: "복원 보존 기간", value: "30 일",            sub: "이전 시점 데이터 복원 가능" },
        ].map((s,i)=>(
          <div key={i} style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
          }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--text-muted)",
              fontFamily: "var(--font-sans)", marginBottom: 4,
            }}>{s.label}</div>
            <div style={{
              fontSize: 16, fontWeight: 600, color: "var(--text-primary)",
              fontFamily: "var(--font-serif)", marginBottom: 2,
            }}>{s.value}</div>
            <div style={{
              fontSize: 11, color: "var(--text-muted)",
              fontFamily: "var(--font-sans)",
            }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <DataTable
        cols={[
          { label: "시점",   key: "ts",     mono: true, w: "30%" },
          { label: "범위",   key: "scope",  w: "22%" },
          { label: "크기",   key: "size",   mono: true, align: "right", w: "20%" },
          { label: "상태",   w: "28%", render: (b) =>
            b.status === "성공" ? <Badge variant="success">{b.status}</Badge> : <Badge variant="warning">{b.status}</Badge>
          },
        ]}
        rows={BACKUPS}
      />
    </SectionCard>
  );
}

// ──────────────────────────────────────────────────────────────
// 섹션 라우터
// ──────────────────────────────────────────────────────────────
const SECTION_COMPONENTS = {
  identity:  IdentitySection,
  hours:     HoursSection,
  rooms:     RoomsSection,
  equipment: EquipmentSection,
  materials: MaterialsSection,
  rx:        PrescriptionSection,
  nonbenefit: NonBenefitSection,
  menu:      MenuSection,
  license:   LicenseSection,
  insurance: InsuranceSection,
  billing:   BillingSection,
  branch:    BranchSection,
  brand:     BrandSection,
  backup:    BackupSection,
};

function renderSection(id, role) {
  const Cmp = SECTION_COMPONENTS[id];
  if (!Cmp) return null;
  return <Cmp perm={permFor(role, id)} />;
}

Object.assign(window, {
  IdentitySection, HoursSection, RoomsSection, EquipmentSection, MaterialsSection, PrescriptionSection, NonBenefitSection, MenuSection,
  LicenseSection, InsuranceSection, BillingSection,
  BranchSection, BrandSection, BackupSection,
  SECTION_COMPONENTS, renderSection,
});
