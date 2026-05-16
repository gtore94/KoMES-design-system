// KoMES — AI 발주 추천 조건 조정 모달
// 좌: 설정 폼 (트리거 · 발주 목표 · 그룹핑 · 알림 · 예외)
// 우: 라이브 프리뷰 (현재 설정으로 생성되는 추천 결과)

const { useState: useStRS, useMemo: useMemoRS } = React;

function RecommendationSettingsModal({ onClose, onSave, initial = REC_DEFAULTS }) {
  const [s, setS]       = useStRS({ ...initial });
  const [tab, setTab]   = useStRS("trigger"); // trigger | target | group | alert | except

  const set = (patch) => setS(prev => ({ ...prev, ...patch }));
  const toggleArr = (key, value) => {
    const arr = s[key] || [];
    const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value];
    set({ [key]: next });
  };

  // 현재 설정 기준 추천 시뮬레이션 (약재 + 소모품)
  const preview = useMemoRS(() => {
    const items = [];

    if (s.scope === "both" || s.scope === "herb") {
      HERBS.forEach(h => {
        if (s.excludeCats?.includes(h.category)) return;
        const daysLeft = projectedRunOutDays(h);
        const belowThreshold = h.stock < h.threshold * s.thresholdMultiplier;
        if (daysLeft > s.daysLeftTrigger && !belowThreshold) return;
        const need = (h.monthly / 30) * s.targetCoverDays - h.stock;
        const round = s.roundingHerb || 1;
        const qty = Math.max(h.threshold, Math.ceil(need / round) * round);
        items.push({
          kind: "herb", id: h.id, name: h.name, supplier: h.supplier,
          unit: "g", daysLeft, qty, cost: qty * h.unitPrice,
          category: h.category, urgency: daysLeft <= 7 ? "high" : daysLeft <= 14 ? "med" : "low",
        });
      });
    }
    if (s.scope === "both" || s.scope === "supply") {
      SUPPLIES.forEach(it => {
        if (s.excludeSupCats?.includes(it.category)) return;
        const daysLeft = supRunOut(it);
        const belowThreshold = it.stock < it.threshold * s.thresholdMultiplier;
        if (daysLeft > s.daysLeftTrigger && !belowThreshold) return;
        const need = (it.monthly / 30) * s.targetCoverDays - it.stock;
        const round = s.roundingSupply || 1;
        const qty = Math.max(it.threshold, Math.ceil(need / round) * round);
        items.push({
          kind: "supply", id: it.id, name: it.name, supplier: it.supplier,
          unit: it.unit, daysLeft, qty, cost: qty * it.unitPrice,
          category: it.category, urgency: daysLeft <= 7 ? "high" : daysLeft <= 14 ? "med" : "low",
        });
      });
    }

    items.sort((a, b) => a.daysLeft - b.daysLeft);

    // 공급처 그룹핑 & 최소금액 필터
    const groups = {};
    items.forEach(i => {
      const k = i.supplier;
      if (!groups[k]) groups[k] = { supplier: k, items: [], total: 0 };
      groups[k].items.push(i);
      groups[k].total += i.cost;
    });
    let groupList = Object.values(groups).sort((a, b) => b.total - a.total);
    const skipped = groupList.filter(g => g.total < s.minOrderValue);
    if (s.groupBySupplier && s.minOrderValue > 0) {
      groupList = groupList.filter(g => g.total >= s.minOrderValue);
    }

    return {
      items, groups: groupList, totalCount: items.length,
      totalValue: items.reduce((sum, i) => sum + i.cost, 0),
      skippedCount: skipped.length, skippedValue: skipped.reduce((sum, g) => sum + g.total, 0),
    };
  }, [s]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      fontFamily: "var(--font-sans)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        width: 1080, height: "88vh", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-xl)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 12,
          background: "linear-gradient(180deg, var(--jade-50) 0%, var(--bg-surface) 100%)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "var(--radius-md)",
            background: "var(--brand-muted)", color: "var(--jade-700)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="sparkles" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-serif)", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>AI 발주 추천 조건</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              트리거 임계값과 발주 정책을 조정하면 우측 프리뷰에 즉시 반영됩니다
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          {/* Left — settings */}
          <div style={{ flex: "1 1 56%", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-subtle)", minWidth: 0 }}>
            {/* Tabs */}
            <div style={{ padding: "0 24px", display: "flex", gap: 0, borderBottom: "1px solid var(--border-subtle)" }}>
              {[
                { key: "trigger", label: "발주 트리거", icon: "zap" },
                { key: "target",  label: "발주 목표",   icon: "target" },
                { key: "group",   label: "그룹핑/공급처", icon: "boxes" },
                { key: "alert",   label: "알림 / 자동화", icon: "bell" },
                { key: "except",  label: "예외",        icon: "filter-x" },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "12px 14px", fontFamily: "var(--font-sans)", fontSize: 12,
                    color: tab === t.key ? "var(--jade-700)" : "var(--text-secondary)",
                    fontWeight: tab === t.key ? 600 : 400,
                    borderBottom: `2px solid ${tab === t.key ? "var(--jade-500)" : "transparent"}`,
                    display: "inline-flex", alignItems: "center", gap: 6,
                    marginBottom: -1,
                  }}>
                  <Icon name={t.icon} size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Panels */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {tab === "trigger" && <TriggerPanel s={s} set={set} />}
              {tab === "target"  && <TargetPanel s={s} set={set} />}
              {tab === "group"   && <GroupPanel s={s} set={set} />}
              {tab === "alert"   && <AlertPanel s={s} set={set} />}
              {tab === "except"  && <ExceptionPanel s={s} set={set} toggleArr={toggleArr} />}
            </div>
          </div>

          {/* Right — live preview */}
          <RSPreviewPanel preview={preview} settings={s} />
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 10, background: "var(--bg-raised)",
        }}>
          <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={() => setS({ ...REC_DEFAULTS })}>기본값으로</Button>
          <div style={{ flex: 1 }}></div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            저장 시 모든 사용자에게 적용됩니다 · 마지막 수정 김민준 · 2일 전
          </span>
          <Button variant="secondary" size="md" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" icon="check" onClick={() => onSave && onSave(s)}>저장</Button>
        </div>
      </div>
    </div>
  );
}

// ── 1. 발주 트리거 패널 ───────────────────────────────────────────
function TriggerPanel({ s, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <RSSection title="적용 범위" desc="추천 시스템이 동작할 재고 유형을 선택합니다">
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "both",   label: "약재 + 소모품", icon: "boxes" },
            { key: "herb",   label: "약재만",        icon: "leaf" },
            { key: "supply", label: "소모품만",      icon: "package" },
          ].map(o => (
            <button key={o.key} onClick={() => set({ scope: o.key })}
              style={{
                flex: 1, padding: "14px 12px", fontFamily: "var(--font-sans)", fontSize: 13,
                border: `2px solid ${s.scope === o.key ? "var(--jade-500)" : "var(--border-default)"}`,
                background: s.scope === o.key ? "var(--brand-subtle)" : "var(--bg-surface)",
                color: s.scope === o.key ? "var(--jade-700)" : "var(--text-secondary)",
                borderRadius: "var(--radius-md)", cursor: "pointer",
                fontWeight: s.scope === o.key ? 600 : 400,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}>
              <Icon name={o.icon} size={18} />
              {o.label}
            </button>
          ))}
        </div>
      </RSSection>

      <RSSection title="추천 트리거" desc="이 조건 중 하나라도 충족하면 추천 목록에 포함됩니다">
        <RSSlider label="잔여 일수 이하"
          desc="이 일수 미만 남으면 추천"
          value={s.daysLeftTrigger} min={3} max={45} step={1} unit="일"
          marks={[7, 14, 21, 30]}
          onChange={v => set({ daysLeftTrigger: v })} />

        <div style={{
          padding: "10px 14px", margin: "8px 0", background: "var(--bg-raised)",
          borderRadius: "var(--radius-md)", display: "flex", justifyContent: "center",
          fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em",
        }}>또는</div>

        <RSSlider label="안전 임계치 × 배수"
          desc="재고가 (안전 임계치 × 이 배수) 미만이면 추천"
          value={s.thresholdMultiplier} min={0.5} max={2} step={0.1} unit="x" decimals={1}
          marks={[0.8, 1.0, 1.2, 1.5]}
          onChange={v => set({ thresholdMultiplier: v })} />
      </RSSection>
    </div>
  );
}

// ── 2. 발주 목표 패널 ────────────────────────────────────────────
function TargetPanel({ s, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <RSSection title="발주 후 보유 목표" desc="발주가 입고된 후 며칠치 재고를 보유할지">
        <RSSlider label="보유 목표 일수"
          desc="월 평균 소비량 × 이 일수가 1회 발주의 기준 수량이 됩니다"
          value={s.targetCoverDays} min={14} max={120} step={1} unit="일"
          marks={[30, 60, 90]}
          onChange={v => set({ targetCoverDays: v })} />
      </RSSection>

      <RSSection title="수량 라운딩" desc="추천 수량을 보기 좋은 단위로 올림합니다">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <RSField label="약재 (g)">
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 50, 100, 500, 1000].map(v => (
                <button key={v} onClick={() => set({ roundingHerb: v })}
                  style={chip(s.roundingHerb === v)}>
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontFamily: "var(--font-sans)" }}>
              {s.roundingHerb === 1 ? "라운딩 없음" : `${s.roundingHerb}g 단위로 올림`}
            </div>
          </RSField>
          <RSField label="소모품 (단위)">
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 5, 10, 50].map(v => (
                <button key={v} onClick={() => set({ roundingSupply: v })}
                  style={chip(s.roundingSupply === v)}>
                  {v}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              {s.roundingSupply === 1 ? "라운딩 없음" : `${s.roundingSupply}단위 올림`}
            </div>
          </RSField>
        </div>
      </RSSection>

      <RSSection title="리드타임 여유" desc="공급처 배송 기간에 추가로 두는 안전 기간">
        <RSSlider label="추가 여유 일수"
          desc="잔여 일수 계산 시 이 일수만큼 일찍 트리거"
          value={s.leadTimeBuffer} min={0} max={14} step={1} unit="일"
          marks={[3, 7, 10]}
          onChange={v => set({ leadTimeBuffer: v })} />
      </RSSection>
    </div>
  );
}

// ── 3. 그룹핑 / 공급처 ───────────────────────────────────────────
function GroupPanel({ s, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <RSSection title="공급처별 그룹핑" desc="같은 공급처로 보내는 품목을 하나의 발주서로 묶어 생성합니다">
        <RSToggle
          label="공급처별 자동 그룹핑"
          desc="동일 공급처 품목을 하나의 발주서로 묶어 배송비/처리 시간 절약"
          value={s.groupBySupplier} onChange={v => set({ groupBySupplier: v })} />
      </RSSection>

      <RSSection title="최소 발주 금액" desc="공급처당 합계가 이 금액 미만이면 추천에서 보류 (다음 회차로 이월)">
        <RSField label="공급처당 최소 금액">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={s.minOrderValue}
              onChange={e => set({ minOrderValue: Number(e.target.value) || 0 })}
              style={{
                width: 180, fontFamily: "var(--font-mono)", fontSize: 14,
                padding: "8px 12px", textAlign: "right",
                border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
                outline: "none",
              }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>원</span>
            <div style={{ flex: 1 }}></div>
            {[0, 100000, 200000, 500000].map(v => (
              <button key={v} onClick={() => set({ minOrderValue: v })}
                style={chip(s.minOrderValue === v)}>
                {v === 0 ? "없음" : `₩${(v/10000)}만`}
              </button>
            ))}
          </div>
        </RSField>
      </RSSection>
    </div>
  );
}

// ── 4. 알림 / 자동화 ─────────────────────────────────────────────
function AlertPanel({ s, set }) {
  const ch = s.channels || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <RSSection title="알림 채널" desc="추천이 발생했을 때 알림을 보낼 경로">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <RSToggle label="대시보드 카드" desc="재고 화면 상단에 추천 카드 표시"
            value={ch.dashboard} onChange={v => set({ channels: { ...ch, dashboard: v } })} />
          <RSToggle label="이메일 알림" desc="원장님 이메일로 매일 오전 9시 요약 발송"
            value={ch.email} onChange={v => set({ channels: { ...ch, email: v } })} />
          <RSToggle label="SMS 알림" desc="잔여 7일 이하 긴급 품목에 한해 즉시 발송"
            value={ch.sms} onChange={v => set({ channels: { ...ch, sms: v } })} />
        </div>
      </RSSection>

      <RSSection title="자동 발주" desc="신뢰할 수 있는 공급처에 한해 사람 개입 없이 자동 발주합니다">
        <RSToggle
          label="자동 발주 활성화"
          desc="아래 조건을 모두 만족하면 발주서가 자동 전송됩니다"
          value={s.autoApprove} onChange={v => set({ autoApprove: v })} />
        {s.autoApprove && (
          <div style={{
            marginTop: 14, padding: "14px 16px", background: "var(--status-warning-bg)",
            border: "1px solid var(--amber-200)", borderRadius: "var(--radius-md)",
          }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Icon name="alert-triangle" size={13} style={{ color: "var(--amber-700)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: "var(--amber-700)", lineHeight: 1.5 }}>
                자동 발주는 회계 기록 책임을 발생시킬 수 있습니다. 한도와 공급처를 신중히 설정하세요.
              </div>
            </div>
            <RSField label="공급처당 자동 발주 최대 금액">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" value={s.autoApproveLimit}
                  onChange={e => set({ autoApproveLimit: Number(e.target.value) || 0 })}
                  style={{
                    width: 180, fontFamily: "var(--font-mono)", fontSize: 14,
                    padding: "8px 12px", textAlign: "right",
                    border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
                    outline: "none", background: "var(--bg-surface)",
                  }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>원 이하</span>
              </div>
            </RSField>
          </div>
        )}
      </RSSection>
    </div>
  );
}

// ── 5. 예외 (제외 분류) ──────────────────────────────────────────
function ExceptionPanel({ s, set, toggleArr }) {
  const herbCats = HERB_CATEGORIES.filter(c => c.key !== "all");
  const supCats  = SUP_CATEGORIES.filter(c => c.key !== "all");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <RSSection title="추천에서 제외할 분류" desc="아래 분류에 속한 품목은 자동 추천 대상에서 제외됩니다">
        <RSField label="약재 효능 분류">
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {herbCats.map(c => {
              const sel = s.excludeCats?.includes(c.label);
              return (
                <button key={c.key} onClick={() => toggleArr("excludeCats", c.label)}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 11px",
                    border: `1px solid ${sel ? "var(--cinnabar-400)" : "var(--border-default)"}`,
                    background: sel ? "var(--status-danger-bg)" : "var(--bg-surface)",
                    color: sel ? "var(--cinnabar-700)" : "var(--text-secondary)",
                    borderRadius: "var(--radius-full)", cursor: "pointer",
                    fontWeight: sel ? 600 : 400,
                    textDecoration: sel ? "line-through" : "none",
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            제외된 분류: {s.excludeCats?.length ? s.excludeCats.join(", ") : "없음"}
          </div>
        </RSField>

        <div style={{ marginTop: 16 }}>
          <RSField label="소모품 분류">
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {supCats.map(c => {
                const sel = s.excludeSupCats?.includes(c.label);
                return (
                  <button key={c.key} onClick={() => toggleArr("excludeSupCats", c.label)}
                    style={{
                      fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 11px",
                      border: `1px solid ${sel ? "var(--cinnabar-400)" : "var(--border-default)"}`,
                      background: sel ? "var(--status-danger-bg)" : "var(--bg-surface)",
                      color: sel ? "var(--cinnabar-700)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-full)", cursor: "pointer",
                      fontWeight: sel ? 600 : 400,
                      textDecoration: sel ? "line-through" : "none",
                    }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              제외된 분류: {s.excludeSupCats?.length ? s.excludeSupCats.join(", ") : "없음"}
            </div>
          </RSField>
        </div>
      </RSSection>

      <RSSection title="추후 추가될 기능" desc="다음 업데이트에서 지원 예정">
        <div style={{
          padding: "12px 14px", background: "var(--bg-raised)",
          border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {[
            "특정 품목 단위 임계치 오버라이드",
            "공급처별 리드타임 학습",
            "계절성 보정 (한약 처방 트렌드 반영)",
            "월별 예산 한도 적용",
          ].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <Icon name="circle" size={6} />
              {t}
            </div>
          ))}
        </div>
      </RSSection>
    </div>
  );
}

// ── 우측 라이브 프리뷰 ────────────────────────────────────────────
function RSPreviewPanel({ preview, settings }) {
  return (
    <div style={{ flex: "1 1 44%", background: "var(--bg-raised)", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="eye" size={14} style={{ color: "var(--jade-700)" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>실시간 미리보기</span>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>지금 적용하면 이렇게 나옵니다</span>
      </div>

      {/* Summary cards */}
      <div style={{ padding: "16px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <RSStatCard label="추천 품목" value={`${preview.totalCount}건`} icon="list" />
        <RSStatCard label="예상 발주액" value={won(preview.totalValue)} icon="banknote" tone="brand" />
        <RSStatCard label="공급처 수" value={`${preview.groups.length}곳`} icon="building" small />
        <RSStatCard label="보류 (최소금액 미달)"
          value={`${preview.skippedCount}곳`} icon="clock-alert"
          sub={preview.skippedValue ? won(preview.skippedValue) : null}
          small tone={preview.skippedCount ? "warning" : null} />
      </div>

      {/* Group preview */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
        {preview.groups.length === 0 ? (
          <div style={{
            padding: "32px 20px", textAlign: "center",
            background: "var(--bg-surface)", border: "1px dashed var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}>
            <Icon name="check-check" size={24} style={{ color: "var(--jade-500)", marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>현재 추천할 품목이 없습니다</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              현재 설정 기준 모든 품목이 안정적인 재고 수준입니다
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {preview.groups.map(g => (
              <div key={g.supplier} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)", overflow: "hidden",
              }}>
                <div style={{
                  padding: "10px 14px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", background: "var(--brand-subtle)",
                  borderBottom: "1px solid var(--jade-200)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="building" size={13} style={{ color: "var(--jade-700)" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--jade-800)" }}>{g.supplier}</span>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--jade-700)", background: "var(--brand-muted)", padding: "1px 6px", borderRadius: "var(--radius-full)" }}>
                      {g.items.length}품목
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--jade-800)" }}>{won(g.total)}</span>
                </div>
                <div>
                  {g.items.map((i, idx) => (
                    <div key={i.id} style={{
                      padding: "7px 14px",
                      borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)",
                      display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 8,
                      alignItems: "center",
                    }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 18, height: 18, borderRadius: "var(--radius-sm)",
                        background: i.kind === "herb" ? "var(--brand-muted)" : "var(--bg-raised)",
                        color: i.kind === "herb" ? "var(--jade-700)" : "var(--ink-600)",
                      }}>
                        <Icon name={i.kind === "herb" ? "leaf" : "package"} size={10} />
                      </span>
                      <div style={{ overflow: "hidden", minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                          잔여 {i.daysLeft}일 · {i.category}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                        {i.qty.toLocaleString("ko-KR")} {i.unit}
                      </div>
                      <span style={{
                        fontSize: 9, padding: "2px 6px", borderRadius: "var(--radius-full)",
                        background: i.urgency === "high" ? "var(--status-danger-bg)" :
                                    i.urgency === "med"  ? "var(--status-warning-bg)" : "var(--bg-raised)",
                        color:      i.urgency === "high" ? "var(--cinnabar-700)" :
                                    i.urgency === "med"  ? "var(--amber-700)" : "var(--text-muted)",
                        fontWeight: 600, fontFamily: "var(--font-sans)",
                      }}>
                        {i.urgency === "high" ? "긴급" : i.urgency === "med" ? "주의" : "정상"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 작은 도우미 ─────────────────────────────────────────────────
function RSSection({ title, desc, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{title}</div>
      {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, marginBottom: 12 }}>{desc}</div>}
      {!desc && <div style={{ marginBottom: 12 }}></div>}
      {children}
    </div>
  );
}

function RSField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

function RSSlider({ label, desc, value, min, max, step, unit, decimals = 0, marks, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--jade-700)" }}>
          {decimals ? value.toFixed(decimals) : value} <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>{desc}</div>}
      <div style={{ position: "relative", padding: "10px 0" }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: "100%", accentColor: "var(--jade-500)", cursor: "pointer",
          }} />
        {marks && (
          <div style={{ position: "relative", marginTop: -4, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {marks.map(m => {
              const p = ((m - min) / (max - min)) * 100;
              return (
                <span key={m} style={{
                  position: "absolute", left: `${p}%`, transform: "translateX(-50%)",
                  cursor: "pointer",
                }} onClick={() => onChange(m)}>{decimals ? m.toFixed(decimals) : m}</span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RSToggle({ label, desc, value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px",
      border: `1px solid ${value ? "var(--jade-300)" : "var(--border-subtle)"}`,
      background: value ? "var(--brand-subtle)" : "var(--bg-surface)",
      borderRadius: "var(--radius-md)", cursor: "pointer",
      transition: "all 0.12s ease",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{desc}</div>}
      </div>
      <div style={{
        width: 36, height: 20, borderRadius: 12,
        background: value ? "var(--jade-500)" : "var(--stone-300)",
        position: "relative", transition: "background 0.12s ease", flexShrink: 0, marginLeft: 12,
      }}>
        <div style={{
          position: "absolute", top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%", background: "white",
          transition: "left 0.12s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}></div>
      </div>
    </div>
  );
}

function RSStatCard({ label, value, sub, icon, tone, small }) {
  const tones = {
    brand:   { bg: "var(--brand-subtle)",     border: "var(--jade-200)",     fg: "var(--jade-700)" },
    warning: { bg: "var(--status-warning-bg)",   border: "var(--amber-200)",    fg: "var(--amber-700)" },
    default: { bg: "var(--bg-surface)",  border: "var(--border-subtle)", fg: "var(--text-primary)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: "var(--radius-md)",
      padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ color: t.fg }}><Icon name={icon} size={small ? 14 : 16} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: small ? 14 : 17, fontWeight: 600, fontFamily: "var(--font-mono)", color: t.fg, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

const chip = (sel) => ({
  fontFamily: "var(--font-sans)", fontSize: 12, padding: "5px 11px",
  border: `1px solid ${sel ? "var(--jade-500)" : "var(--border-default)"}`,
  background: sel ? "var(--brand-subtle)" : "var(--bg-surface)",
  color: sel ? "var(--jade-700)" : "var(--text-secondary)",
  borderRadius: "var(--radius-md)", cursor: "pointer",
  fontWeight: sel ? 600 : 400,
});

Object.assign(window, { RecommendationSettingsModal });
