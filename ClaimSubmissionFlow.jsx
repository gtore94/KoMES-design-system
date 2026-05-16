// KoMES — 보험 청구 제출 플로우 모달
// 4단계: 청구파일 생성 → 청구파일 점검 → 사전점검 송신 → 실청구

const { useState: useStMd, useEffect: useEfMd, useRef: useRfMd } = React;

// 가짜 진행 단계
const STAGES = [
  {
    key: "build",
    label: "청구파일 생성",
    desc: "선택된 명세서를 심평원 표준 포맷(XML)으로 변환합니다",
    icon: "file-cog",
    sim: 1200,
  },
  {
    key: "validate",
    label: "청구파일 점검",
    desc: "내부 유효성 검증 — 코드·금액·자격 정합성 확인",
    icon: "shield-check",
    sim: 1800,
  },
  {
    key: "pretest",
    label: "심평원 사전점검 1차 송신",
    desc: "HIRA 사전점검 API로 송신 후 결과 수신 대기",
    icon: "satellite",
    sim: 2400,
  },
  {
    key: "submit",
    label: "실청구 진행",
    desc: "이상 없음 확인 후 본 청구를 송신합니다",
    icon: "send",
    sim: 1600,
  },
];

function ClaimSubmissionFlow({ items, type, summary, onClose, scenario }) {
  // scenario: "ok" | "errors" | "all-pass"
  const [stage, setStage] = useStMd(0);
  const [statusByKey, setStatusByKey] = useStMd({
    build: "running", validate: "pending", pretest: "pending", submit: "pending",
  });
  const [waitingApproval, setWaitingApproval] = useStMd(false);
  const [pretestResults, setPretestResults] = useStMd(null); // null | { errors: [], passed: [] }
  const [done, setDone] = useStMd(false);
  const timerRef = useRfMd(null);

  // detect errors in items
  const errorItems = items.filter(it => it.error);
  const hasErrors = errorItems.length > 0 || scenario === "errors";

  useEfMd(() => {
    const s = STAGES[stage];
    if (!s) return;
    if (statusByKey[s.key] !== "running") return;
    timerRef.current = setTimeout(() => {
      // Done with this stage
      const next = { ...statusByKey };
      if (s.key === "pretest") {
        // produce results
        const fakeResults = {
          errors: errorItems.map(it => ({
            id: it.id, patientName: it.patientName,
            chartNo: it.chartNo, seq: it.seq,
            code: it.error.code, msg: it.error.msg,
          })),
          passedCount: items.length - errorItems.length,
          totalCount: items.length,
        };
        setPretestResults(fakeResults);
        if (fakeResults.errors.length > 0) {
          next[s.key] = "warning";
          setStatusByKey(next);
          setWaitingApproval(true); // require user decision
        } else {
          next[s.key] = "success";
          setStatusByKey(next);
          // advance
          const nextStageIdx = stage + 1;
          if (nextStageIdx < STAGES.length) {
            next[STAGES[nextStageIdx].key] = "running";
            setStatusByKey(next);
            setStage(nextStageIdx);
          }
        }
      } else if (s.key === "submit") {
        next[s.key] = "success";
        setStatusByKey(next);
        setDone(true);
      } else {
        next[s.key] = "success";
        const nextStageIdx = stage + 1;
        if (nextStageIdx < STAGES.length) {
          next[STAGES[nextStageIdx].key] = "running";
          setStage(nextStageIdx);
        }
        setStatusByKey(next);
      }
    }, s.sim);
    return () => clearTimeout(timerRef.current);
  }, [stage]);

  const handleResubmitExcludingErrors = () => {
    // proceed with non-error items
    const next = { ...statusByKey };
    next.submit = "running";
    setStatusByKey(next);
    setStage(3);
    setWaitingApproval(false);
  };
  const handleFixErrors = () => {
    onClose("fix"); // back to list, pre-filter errors
  };

  const totalNonError = items.length - errorItems.length;
  const totalAmount = items.reduce((s, it) => s + it.claimAmount, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "var(--bg-overlay)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40,
    }}>
      <div style={{
        width: 720, maxHeight: "90vh", overflow: "hidden",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          background: "linear-gradient(135deg, var(--jade-700), var(--jade-800))",
          color: "#fff",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: "var(--radius-md)",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="send-horizonal" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              color: "var(--jade-200)", textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
            }}>심평원 진료비 청구 · HIRA Claim API</div>
            <div style={{
              fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500,
              letterSpacing: "-0.01em", marginTop: 2,
            }}>
              {CLAIM_TYPES.find(t => t.key === type)?.label} 청구 진행
            </div>
          </div>
          <button onClick={() => onClose("cancel")} style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)",
            background: "rgba(255,255,255,0.1)", border: "none",
            color: "rgba(255,255,255,0.8)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Summary strip */}
        <div style={{
          padding: "14px 28px",
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", gap: 28,
        }}>
          <StripStat label="청구 건수" value={`${items.length}건`} />
          <StripStat label="정상" value={`${totalNonError}건`} color="var(--jade-700)" />
          <StripStat label="오류 의심" value={`${errorItems.length}건`} color={errorItems.length > 0 ? "var(--cinnabar-700)" : "var(--text-muted)"} />
          <StripStat label="청구 합계" value={KRW2(totalAmount)} mono />
        </div>

        {/* Stages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {STAGES.map((s, idx) => (
            <StageRow
              key={s.key}
              stage={s}
              idx={idx}
              status={statusByKey[s.key]}
              isLast={idx === STAGES.length - 1}
              // Stage 3 expands to show results
              expanded={s.key === "pretest" && pretestResults}
              details={s.key === "pretest" && pretestResults ? (
                <PretestResults results={pretestResults} />
              ) : null}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-raised)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {waitingApproval && (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px",
                background: "var(--status-warning-bg)",
                border: "1px solid var(--amber-200)",
                borderRadius: "var(--radius-md)",
              }}>
                <Icon name="alert-circle" size={14} style={{ color: "var(--amber-700)" }} />
                <span style={{ fontSize: 12, color: "var(--amber-700)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                  사전점검 결과 오류가 발견되었습니다. 진행 방식을 선택하세요.
                </span>
              </div>
              <div style={{ flex: 1 }}></div>
              <button onClick={handleFixErrors} style={ftrBtnSecondary}>
                <Icon name="arrow-left" size={13} />
                오류 수정으로 돌아가기
              </button>
              <button onClick={handleResubmitExcludingErrors} style={ftrBtnPrimary}>
                <Icon name="send" size={13} />
                정상 {totalNonError}건만 실청구
              </button>
            </>
          )}
          {!waitingApproval && !done && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--jade-500)",
                  animation: "pulse 1.4s infinite",
                }}></span>
                <span style={{ fontFamily: "var(--font-sans)" }}>
                  {STAGES[stage]?.label} 진행 중…
                </span>
              </div>
              <div style={{ flex: 1 }}></div>
              <button onClick={() => onClose("cancel")} style={ftrBtnSecondary}>중단</button>
            </>
          )}
          {done && (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px",
                background: "var(--brand-subtle)",
                border: "1px solid var(--jade-200)",
                borderRadius: "var(--radius-md)",
              }}>
                <Icon name="check-circle-2" size={14} style={{ color: "var(--jade-700)" }} />
                <span style={{ fontSize: 12, color: "var(--jade-700)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                  실청구 완료 — 접수번호 HIRA-2026-{String(Math.floor(Math.random() * 90000) + 10000)}
                </span>
              </div>
              <div style={{ flex: 1 }}></div>
              <button onClick={() => onClose("done")} style={ftrBtnSecondary}>
                <Icon name="file-text" size={13} />
                접수증 출력
              </button>
              <button onClick={() => onClose("done")} style={ftrBtnPrimary}>
                <Icon name="check" size={13} />
                확인
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes barPulse { 0% { background-position: 0 0 } 100% { background-position: 24px 0 } }
      `}</style>
    </div>
  );
}

function StripStat({ label, value, color, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
        color: "var(--text-muted)", fontFamily: "var(--font-sans)",
        textTransform: "uppercase",
      }}>{label}</span>
      <span style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 16, fontWeight: 700,
        color: color || "var(--text-primary)",
        marginTop: 2,
      }}>{value}</span>
    </div>
  );
}

function StageRow({ stage, idx, status, isLast, expanded, details }) {
  const statusConfig = {
    pending: { icon: "circle", color: "var(--text-disabled)", bg: "var(--bg-raised)", label: "대기" },
    running: { icon: "loader-2", color: "var(--jade-600)", bg: "var(--brand-subtle)", label: "진행 중" },
    success: { icon: "check", color: "var(--jade-700)", bg: "var(--brand-muted)", label: "완료" },
    warning: { icon: "alert-triangle", color: "var(--amber-700)", bg: "var(--status-warning-bg)", label: "검토 필요" },
    error:   { icon: "x", color: "var(--cinnabar-700)", bg: "var(--status-danger-bg)", label: "실패" },
  };
  const s = statusConfig[status] || statusConfig.pending;
  const isActive = status === "running" || status === "warning";

  return (
    <div style={{ position: "relative" }}>
      <div style={{ padding: "16px 28px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* circle */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: s.bg,
            border: `2px solid ${s.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: s.color,
            animation: status === "running" ? "spin 1s linear infinite" : "none",
          }}>
            <Icon name={s.icon} size={16} />
          </div>
          {/* connector */}
          {!isLast && (
            <div style={{
              position: "absolute", top: 38, left: "50%", transform: "translateX(-50%)",
              width: 2, height: expanded ? "calc(100% + 12px)" : 22,
              background: status === "success" || status === "warning" ? "var(--jade-300)" : "var(--bg-raised)",
            }}></div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            }}>STEP {idx + 1}</span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: s.color, fontFamily: "var(--font-sans)",
              padding: "1px 8px", background: s.bg,
              borderRadius: "var(--radius-full)",
              border: `1px solid ${s.color}`,
              opacity: 0.85,
            }}>{s.label}</span>
          </div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
            color: "var(--text-primary)", marginTop: 4, lineHeight: 1.3,
          }}>{stage.label}</div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 12,
            color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5,
          }}>{stage.desc}</div>

          {/* Progress bar when running */}
          {status === "running" && (
            <div style={{
              marginTop: 10, height: 4, borderRadius: 2,
              background: "var(--bg-raised)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: "60%",
                background: `linear-gradient(90deg, var(--jade-300) 0%, var(--jade-500) 50%, var(--jade-300) 100%)`,
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                borderRadius: 2,
              }}></div>
            </div>
          )}
          {expanded && details && <div style={{ marginTop: 14 }}>{details}</div>}
        </div>
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}

function PretestResults({ results }) {
  const { errors, passedCount, totalCount } = results;
  return (
    <div style={{
      background: "var(--bg-raised)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)", overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "10px 14px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="clipboard-check" size={13} style={{ color: "var(--jade-700)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
          심평원 점검 결과
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          정상 {passedCount}건 · 오류 {errors.length}건
        </span>
      </div>
      {errors.length === 0 ? (
        <div style={{
          padding: "16px 14px", textAlign: "center",
          color: "var(--jade-700)", fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="check-circle-2" size={18} style={{ color: "var(--jade-600)", marginBottom: 6 }} />
          <div>모든 명세서가 사전점검을 통과했습니다.</div>
        </div>
      ) : (
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          {errors.map((e, i) => (
            <div key={i} style={{
              padding: "8px 14px",
              borderBottom: i < errors.length - 1 ? "1px solid var(--border-subtle)" : "none",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                color: "#fff", background: "var(--cinnabar-700)",
                padding: "2px 6px", borderRadius: "var(--radius-sm)",
                flexShrink: 0, marginTop: 1,
              }}>{e.code}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>
                  {e.msg}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {e.seq && `명세서 ${e.seq} · `}{e.patientName} · {e.chartNo}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ftrBtnSecondary = {
  padding: "8px 14px", fontSize: 12, fontWeight: 500,
  background: "var(--bg-surface)",
  color: "var(--text-secondary)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
  display: "inline-flex", alignItems: "center", gap: 5,
};
const ftrBtnPrimary = {
  padding: "8px 16px", fontSize: 12, fontWeight: 600,
  background: "var(--jade-500)", color: "#fff",
  border: "none",
  borderRadius: "var(--radius-md)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
  display: "inline-flex", alignItems: "center", gap: 5,
  boxShadow: "var(--shadow-sm)",
};

Object.assign(window, { ClaimSubmissionFlow });
