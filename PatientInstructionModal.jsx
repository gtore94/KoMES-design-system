// KoMES — 환자 안내문 작성 모달 (변형 B 기반)
// 진료 차트에서 "환자 안내문 작성(AI 보조)" 클릭 시 열림.

const { useState: useStPI, useMemo: useMemoPI } = React;

function PatientInstructionModal({ patient, onClose }) {
  const [tone, setTone]             = useStPI("warm");       // warm | formal
  const [length, setLength]         = useStPI("normal");     // short | normal | detailed
  const [showHanja, setShowHanja]   = useStPI(true);
  const [previewMode, setPreviewMode] = useStPI("kakao");    // kakao | pdf
  const [sections, setSections]     = useStPI(INSTRUCTION_SECTIONS);
  const [activeId, setActiveId]     = useStPI("summary");
  const [pastOpen, setPastOpen]     = useStPI(false);
  const [sentToast, setSentToast]   = useStPI(null);

  const enabledSections = sections.filter(s => s.enabled);
  const todayDate = "2026-04-22";
  const doctor    = "김민준 원장";
  const clinic    = "솔담한의원";
  const nextAppt  = "2026-05-06 (수) 14:00";

  // 환자 진단 — 차트에서 실제 데이터를 가져온다 가정. 여기선 샘플.
  const todayDx = [
    { code: "S13.4", name: "경추의 염좌 및 긴장", primary: true },
    { code: "G47.0", name: "수면개시 및 유지장애", primary: false },
  ];

  const toggleSection = (id) => setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleSend = (channel) => {
    setSentToast(`${channel}로 ${patient?.name || "환자"}님께 전송되었습니다.`);
    setTimeout(() => setSentToast(null), 2400);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "var(--bg-overlay)",
      backdropFilter: "blur(2px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 1280, height: "100%", maxHeight: 860,
        background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "14px 22px", borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)", flexShrink: 0,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="sparkles" size={17} style={{ color: "var(--jade-600)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>환자 안내문 작성</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>AI 보조</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
              {patient && <Avatar name={patient.name} size={18} />}
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>{patient?.name || "이서연"}</strong>
                {patient && <> · {patient.gender} · {patient.age}세 · {todayDate} · {doctor}</>}
              </span>
              <span style={{ width: 1, height: 12, background: "var(--border-subtle)" }} />
              {todayDx.map(dx => (
                <span key={dx.code} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, color: dx.primary ? "var(--text-brand)" : "var(--text-secondary)",
                  background: dx.primary ? "var(--brand-subtle)" : "var(--bg-raised)",
                  border: `1px solid ${dx.primary ? "var(--brand-muted)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-full)", whiteSpace: "nowrap", padding: "1px 7px",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{dx.code}</span>
                  {dx.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <Button variant="secondary" size="sm" icon="history" onClick={() => setPastOpen(true)}>이전 안내문</Button>
            <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
            <Button variant="secondary" size="sm" icon="save">임시저장</Button>
            <Button variant="secondary" size="sm" icon="printer" onClick={() => handleSend("PDF")}>PDF</Button>
            <Button variant="secondary" size="sm" icon="mail" onClick={() => handleSend("이메일")}>이메일</Button>
            <Button variant="primary" size="sm" icon="message-circle" onClick={() => handleSend("카카오톡")}>카카오톡 전송</Button>
            <button onClick={onClose} style={{ marginLeft: 4, border: "none", background: "transparent", cursor: "pointer", padding: 6, borderRadius: "var(--radius-sm)", display: "flex", color: "var(--text-muted)" }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── 3 columns + optional slide-over ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

          {/* Past instructions slide-over */}
          {pastOpen && (
            <div style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 360, zIndex: 5,
              background: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
            }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="history" size={14} style={{ color: "var(--jade-600)" }} />
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>이전 안내문 · 비슷한 케이스</div>
                <button onClick={() => setPastOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, display: "flex", color: "var(--text-muted)" }}>
                  <Icon name="x" size={14} />
                </button>
              </div>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
                <Input icon="search" placeholder="진단·증상으로 검색..." />
              </div>
              <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {patient?.name || "환자"}님 · 본인 이력
              </div>
              <div style={{ overflowY: "auto", padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {PAST_INSTRUCTIONS.map((p, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--bg-raised)", cursor: "pointer", transition: "background 0.12s" }}
                       onMouseEnter={e => e.currentTarget.style.background = "var(--brand-subtle)"}
                       onMouseLeave={e => e.currentTarget.style.background = "var(--bg-raised)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.date}</span>
                      <Badge variant={p.similarity > 90 ? "brand" : p.similarity > 75 ? "success" : "neutral"}>유사도 {p.similarity}%</Badge>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3, color: "var(--text-primary)" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.dx}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                      <button style={{ fontSize: 10, padding: "3px 9px", border: "1px solid var(--border-default)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>본문 보기</button>
                      <button style={{ fontSize: 10, padding: "3px 9px", border: "1px solid var(--jade-300)", background: "var(--brand-subtle)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-brand)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>이 안내문으로 시작</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COL 1: Section list + style controls */}
          <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", background: "var(--bg-raised)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Style controls */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase" }}>스타일</div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>톤</div>
                <div style={{ display: "flex", gap: 3, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: 2 }}>
                  {[["warm", "친근함"], ["formal", "공식"]].map(([k, v]) => (
                    <div key={k} onClick={() => setTone(k)} style={{
                      flex: 1, textAlign: "center", padding: "4px 0", fontSize: 11,
                      borderRadius: "var(--radius-xs)", cursor: "pointer",
                      background: tone === k ? "var(--bg-surface)" : "transparent",
                      color: tone === k ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight: tone === k ? 600 : 400,
                      boxShadow: tone === k ? "var(--shadow-sm)" : "none",
                    }}>{v}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>길이</div>
                <div style={{ display: "flex", gap: 3, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: 2 }}>
                  {[["short", "간단"], ["normal", "보통"], ["detailed", "상세"]].map(([k, v]) => (
                    <div key={k} onClick={() => setLength(k)} style={{
                      flex: 1, textAlign: "center", padding: "4px 0", fontSize: 11,
                      borderRadius: "var(--radius-xs)", cursor: "pointer",
                      background: length === k ? "var(--bg-surface)" : "transparent",
                      color: length === k ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight: length === k ? 600 : 400,
                      boxShadow: length === k ? "var(--shadow-sm)" : "none",
                    }}>{v}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowHanja(s => !s)}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>한자 풀이 주석</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>의학·한방 용어 자동 설명</div>
                </div>
                <div style={{ width: 28, height: 16, borderRadius: 9, background: showHanja ? "var(--jade-500)" : "var(--stone-400)", position: "relative", flexShrink: 0, transition: "background 0.12s" }}>
                  <div style={{ position: "absolute", top: 2, left: showHanja ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "var(--bg-surface)", transition: "left 0.12s" }} />
                </div>
              </div>
            </div>

            {/* Section list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase" }}>섹션 ({enabledSections.length}/{sections.length})</div>
                <Icon name="plus" size={12} style={{ color: "var(--text-muted)", cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {sections.map((s) => (
                  <div key={s.id} onClick={() => setActiveId(s.id)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 9px", borderRadius: "var(--radius-md)",
                    background: activeId === s.id ? "var(--bg-surface)" : "transparent",
                    border: `1px solid ${activeId === s.id ? "var(--jade-300)" : "transparent"}`,
                    cursor: "pointer", opacity: s.enabled ? 1 : 0.5,
                    transition: "all 0.12s",
                  }}>
                    <Icon name="grip-vertical" size={11} style={{ color: "var(--text-muted)", cursor: "grab", flexShrink: 0 }} />
                    <Icon name={s.icon} size={12} style={{ color: s.enabled ? "var(--jade-600)" : "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1, color: s.enabled ? "var(--text-primary)" : "var(--text-muted)", textDecoration: s.enabled ? "none" : "line-through", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleSection(s.id); }} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2, display: "flex", color: "var(--text-muted)", flexShrink: 0 }}>
                      <Icon name={s.enabled ? "eye" : "eye-off"} size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COL 2: Section cards (editor) */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg-raised)" }}>
            <div style={{
              padding: "10px 22px", borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)", flexShrink: 0,
            }}>
              <Icon name="info" size={12} />
              섹션 카드를 직접 편집하거나, 각 섹션의 <Icon name="refresh-cw" size={10} /> 버튼으로 그 부분만 다시 생성할 수 있어요.
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
              {enabledSections.map((s, idx) => (
                <div key={s.id} onClick={() => setActiveId(s.id)} style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${activeId === s.id ? "var(--jade-400)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-lg)",
                  boxShadow: activeId === s.id ? "var(--shadow-md)" : "var(--shadow-sm)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  overflow: "hidden",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-raised)" }}>
                    <Icon name="grip-vertical" size={12} style={{ color: "var(--text-muted)", cursor: "grab" }} />
                    <div style={{ width: 22, height: 22, borderRadius: "var(--radius-sm)", background: "var(--brand-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={s.icon} size={12} style={{ color: "var(--text-brand)" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{idx + 1}. {s.title}</span>
                    {s.custom && <Badge variant="neutral">자유 메모</Badge>}
                    <div style={{ flex: 1 }} />
                    <button title="이 섹션만 다시 작성" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: "3px 7px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                      <Icon name="refresh-cw" size={10} /> 재생성
                    </button>
                    <button title="섹션 옵션" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: "3px 5px", cursor: "pointer", display: "flex", color: "var(--text-muted)" }}>
                      <Icon name="more-horizontal" size={11} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleSection(s.id); }} title="섹션 제외" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)", padding: "3px 5px", cursor: "pointer", display: "flex", color: "var(--text-muted)" }}>
                      <Icon name="x" size={11} />
                    </button>
                  </div>

                  <div style={{ padding: "12px 16px" }}>
                    <div key={`${s.id}-${tone}-${length}`} contentEditable suppressContentEditableWarning style={{
                      fontSize: 13, lineHeight: 1.7, color: "var(--text-primary)",
                      fontFamily: "var(--font-sans)", outline: "none",
                      minHeight: 40, padding: "4px 4px", borderRadius: "var(--radius-sm)",
                    }}>{s.body[tone][length]}</div>

                    {activeId === s.id && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border-subtle)" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase", marginRight: 6, alignSelf: "center" }}>이 섹션만</span>
                        {[
                          { icon: "scissors", label: "줄여줘" },
                          { icon: "maximize-2", label: "더 자세히" },
                          { icon: "languages", label: "쉬운 말로" },
                          { icon: "list", label: "리스트로" },
                          { icon: "shield-check", label: "주의 강조" },
                        ].map(c => (
                          <button key={c.label} style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 10, padding: "3px 8px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
                            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)",
                          }}>
                            <Icon name={c.icon} size={10} />
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {showHanja && s.hanjaTerms.length > 0 && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", borderRadius: "var(--radius-md)", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
                        <Icon name="graduation-cap" size={11} style={{ color: "var(--jade-600)", marginTop: 2, flexShrink: 0 }} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                          {s.hanjaTerms.map(t => (
                            <div key={t.term} style={{ fontSize: 10, color: "var(--text-brand)" }}>
                              <strong>{t.term}({t.hanja})</strong> <span style={{ color: "var(--jade-600)" }}>· {t.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button style={{
                padding: "16px", border: "1px dashed var(--border-default)",
                borderRadius: "var(--radius-lg)", background: "transparent",
                color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "var(--font-sans)",
              }}>
                <Icon name="plus" size={13} /> 섹션 추가 (자유 메모 또는 AI 추천)
              </button>
            </div>
          </div>

          {/* COL 3: Live preview */}
          <div style={{ width: 340, flexShrink: 0, background: "var(--bg-raised)", borderLeft: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Icon name="smartphone" size={13} style={{ color: "var(--jade-600)" }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>환자 미리보기</span>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", gap: 3, background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: 2 }}>
                {[["kakao", "카톡"], ["pdf", "PDF"]].map(([k, v]) => (
                  <div key={k} onClick={() => setPreviewMode(k)} style={{
                    padding: "3px 9px", fontSize: 10, borderRadius: "var(--radius-xs)",
                    background: previewMode === k ? "var(--bg-surface)" : "transparent",
                    color: previewMode === k ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: previewMode === k ? 600 : 400,
                    boxShadow: previewMode === k ? "var(--shadow-sm)" : "none",
                    cursor: "pointer",
                  }}>{v}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
              {previewMode === "kakao"
                ? <PIKakaoPreview sections={enabledSections} tone={tone} length={length} patient={patient} doctor={doctor} todayDate={todayDate} clinic={clinic} nextAppt={nextAppt} />
                : <PIPdfPreview   sections={enabledSections} tone={tone} length={length} patient={patient} doctor={doctor} todayDate={todayDate} clinic={clinic} />}
            </div>

            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                <span>받는 사람</span>
                <span style={{ color: "var(--text-primary)" }}>{patient?.name || "환자"} · {patient?.phone || "010-2847-3921"}</span>
              </div>
              <Button variant="primary" icon="send" onClick={() => handleSend("카카오톡")}>지금 전송</Button>
            </div>
          </div>
        </div>
      </div>

      {sentToast && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "var(--text-primary)", color: "var(--bg-raised)",
          padding: "10px 18px", borderRadius: "var(--radius-md)",
          fontSize: 13, boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 8, zIndex: 300,
        }}>
          <Icon name="check-circle" size={14} style={{ color: "var(--jade-300)" }} />
          {sentToast}
        </div>
      )}
    </div>
  );
}

// ── Kakao preview ────────────────────────────────────────────────
function PIKakaoPreview({ sections, tone, length, patient, doctor, todayDate, clinic, nextAppt }) {
  const name = patient?.name || "환자";
  return (
    <div style={{
      background: "var(--instruction-banner-bg)", borderRadius: "var(--radius-lg)", padding: "10px 8px",
      minHeight: "100%", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ textAlign: "center", fontSize: 9, color: "var(--overlay-white-85)", padding: "2px 0 6px" }}>
        오늘 오후 5:24
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--jade-500)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 11, color: "var(--text-on-brand)", fontWeight: 600 }}>솔</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, alignItems: "flex-start" }}>
          <div style={{ fontSize: 9, color: "var(--overlay-white-95)" }}>{clinic}</div>

          <div style={{ background: "var(--bg-surface)", padding: "8px 10px", borderRadius: "0 12px 12px 12px", maxWidth: "90%", fontSize: 11, lineHeight: 1.55, color: "var(--instruction-banner-text)" }}>
            {name}님, 오늘 진료해주신 {doctor}입니다 :) 오늘 진료 안내문을 보내드려요.
          </div>

          <div style={{ background: "var(--bg-surface)", borderRadius: 12, maxWidth: "100%", width: "100%", overflow: "hidden", boxShadow: "0 1px 2px var(--scrim-black-08)" }}>
            <div style={{ padding: "10px 12px", background: "linear-gradient(135deg, var(--brand) 0%, var(--jade-600) 100%)", color: "var(--text-on-brand)" }}>
              <div style={{ fontSize: 9, opacity: 0.85, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>SOLDAM CLINIC</div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-serif)" }}>{name}님 진료 안내</div>
              <div style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>{todayDate} · {doctor}</div>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {sections.slice(0, 4).map(s => (
                <div key={s.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <Icon name={s.icon} size={10} style={{ color: "var(--jade-600)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-brand)" }}>{s.title}</span>
                  </div>
                  <div style={{ fontSize: 10.5, lineHeight: 1.55, color: "var(--instruction-paper-text)" }}>
                    {s.body[tone][length].length > 100 ? s.body[tone][length].slice(0, 100) + "…" : s.body[tone][length]}
                  </div>
                </div>
              ))}
              {sections.length > 4 && (
                <div style={{ textAlign: "center", padding: "6px 0", fontSize: 10, color: "var(--text-brand)", borderTop: "1px solid var(--form-border-light)" }}>
                  ▼ 전체 안내문 열기 ({sections.length - 4}개 더)
                </div>
              )}
            </div>
            <div style={{ borderTop: "1px solid var(--form-border-light)", padding: "8px 12px", display: "flex", gap: 6 }}>
              <div style={{ flex: 1, padding: "5px 0", textAlign: "center", fontSize: 10, color: "var(--text-brand)", fontWeight: 500, border: "1px solid var(--border-subtle)", borderRadius: 6 }}>PDF 보기</div>
              <div style={{ flex: 1, padding: "5px 0", textAlign: "center", fontSize: 10, color: "var(--text-brand)", fontWeight: 500, border: "1px solid var(--border-subtle)", borderRadius: 6 }}>예약 확인</div>
            </div>
          </div>

          <div style={{ background: "var(--bg-surface)", padding: "8px 10px", borderRadius: "12px", maxWidth: "90%", fontSize: 11, lineHeight: 1.55, color: "var(--instruction-banner-text)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <Icon name="calendar-check" size={10} style={{ color: "var(--jade-600)" }} />
              <strong style={{ fontSize: 10, color: "var(--text-brand)" }}>다음 예약</strong>
            </div>
            {nextAppt}<br />
            <span style={{ color: "var(--text-muted)" }}>변경 필요 시 답장 부탁드려요.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PDF preview ──────────────────────────────────────────────────
function PIPdfPreview({ sections, tone, length, patient, doctor, todayDate }) {
  const name = patient?.name || "환자";
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: 2, padding: "16px 18px",
      boxShadow: "var(--shadow-md)", fontSize: 9, lineHeight: 1.55, color: "var(--instruction-paper-text)",
      minHeight: 480,
    }}>
      <div style={{ paddingBottom: 10, borderBottom: "1.5px solid var(--ink-800)", marginBottom: 12 }}>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "var(--jade-600)", marginBottom: 3 }}>SOLDAM CLINIC · 진료 안내문</div>
        <div style={{ fontSize: 15, fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{name}님 진료 안내</div>
        <div style={{ fontSize: 8, color: "var(--instruction-paper-muted)" }}>진료일 · {todayDate}  |  담당 · {doctor}</div>
      </div>
      {sections.map((s, idx) => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{idx + 1}. {s.title}</div>
          <div style={{ fontSize: 8.5, lineHeight: 1.6 }}>{s.body[tone][length]}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PatientInstructionModal });
