// KoMES — 경영 대시보드 chart primitives
// 외부 차트 라이브러리 없이 SVG로 직접 작도.

// ─── Sparkline ─────────────────────────────────────────────
function Sparkline({ values, width = 100, height = 28, color = "var(--brand)", fill = true }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / range) * (height - 6);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = d + ` L${(width - 1).toFixed(1)},${(height - 1).toFixed(1)} L1,${(height - 1).toFixed(1)} Z`;
  const lastX = pts[pts.length - 1][0];
  const lastY = pts[pts.length - 1][1];
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {fill && <path d={area} fill={color} opacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r={2.2} fill={color} />
    </svg>
  );
}

// ─── Line chart ────────────────────────────────────────────
// data: { months[], revenue[], prev[]? } / inProgressIdx (마지막 점 점선)
function LineChart({ data, width = 720, height = 240, showPrev = true, showMoM = false, showGrid = true, color = "var(--brand)", prevColor = "var(--ink-300)", unit = "만원", yTicks = 5 }) {
  const pad = { l: 44, r: 16, t: 14, b: 28 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const all = [...data.revenue, ...(showPrev && data.prev ? data.prev : [])];
  const maxRaw = Math.max(...all);
  const ceiling = Math.ceil(maxRaw / 500) * 500; // round up to 500
  const minV = 0;
  const x = (i) => pad.l + (i / (data.revenue.length - 1)) * W;
  const y = (v) => pad.t + H - ((v - minV) / (ceiling - minV)) * H;

  const pathFor = (arr, dashTail = false) => {
    let d = "";
    arr.forEach((v, i) => { d += (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(v).toFixed(1) + " "; });
    return d.trim();
  };
  const areaFor = (arr) => pathFor(arr) + ` L${x(arr.length - 1).toFixed(1)},${(pad.t + H).toFixed(1)} L${x(0).toFixed(1)},${(pad.t + H).toFixed(1)} Z`;

  const ticks = Array.from({ length: yTicks }, (_, i) => Math.round((ceiling / (yTicks - 1)) * i));

  // last point — in-progress styling
  const inProgress = data.inProgressIdx === data.revenue.length - 1;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* grid */}
      {showGrid && ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(t)} x2={pad.l + W} y2={y(t)} stroke="var(--border-subtle)" strokeDasharray={i === 0 ? "0" : "2 4"} />
          <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {t.toLocaleString("ko-KR")}
          </text>
        </g>
      ))}
      <text x={pad.l - 6} y={pad.t - 4} textAnchor="end" fontSize="9" fontFamily="var(--font-sans)" fill="var(--text-muted)">{unit}</text>

      {/* prev year shadow */}
      {showPrev && data.prev && (
        <>
          <path d={areaFor(data.prev)} fill={prevColor} opacity={0.06} />
          <path d={pathFor(data.prev)} fill="none" stroke={prevColor} strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      )}

      {/* current */}
      <path d={areaFor(data.revenue)} fill={color} opacity={0.10} />
      <path d={pathFor(data.revenue)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* points */}
      {data.revenue.map((v, i) => {
        const isLast = i === data.revenue.length - 1;
        return (
          <circle key={i} cx={x(i)} cy={y(v)} r={isLast ? 4 : 2.4} fill={isLast ? "var(--bg-surface)" : color}
            stroke={color} strokeWidth={isLast ? 2 : 0} />
        );
      })}
      {/* in-progress tag */}
      {inProgress && (() => {
        const i = data.revenue.length - 1;
        const cx = x(i), cy = y(data.revenue[i]);
        return (
          <g transform={`translate(${cx - 20}, ${cy - 26})`}>
            <rect width="40" height="16" rx="3" fill="var(--bg-surface)" stroke={color} />
            <text x="20" y="11" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="var(--font-sans)" fill={color}>진행중</text>
          </g>
        );
      })()}

      {/* x labels */}
      {data.months.map((m, i) => {
        const skip = data.months.length > 8 && i % 2 !== 0 && i !== data.months.length - 1;
        if (skip) return null;
        return (
          <text key={i} x={x(i)} y={pad.t + H + 14} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-secondary)">
            {m}
          </text>
        );
      })}
      {/* x year sub-labels */}
      {data.year && data.year.map((yr, i) => {
        if (i > 0 && data.year[i] === data.year[i - 1]) return null;
        return (
          <text key={`y${i}`} x={x(i)} y={pad.t + H + 24} textAnchor="start" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {yr}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Donut chart ───────────────────────────────────────────
// segs: [{ value, color, label }]   centerLabel/centerValue 옵션
function Donut({ segs, size = 160, thickness = 22, centerLabel, centerValue, centerSub }) {
  const total = segs.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - thickness / 2 - 1;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        <circle r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth={thickness} />
        {segs.map((s, i) => {
          const len = (s.value / total) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle key={i} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={dasharray} strokeDashoffset={dashoffset} />
          );
        })}
      </g>
      {(centerValue !== undefined || centerLabel) && (
        <g>
          {centerLabel && (
            <text x={size / 2} y={size / 2 - 8} textAnchor="middle"
              fontSize="10" fontWeight="600" fill="var(--text-muted)"
              fontFamily="var(--font-sans)" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {centerLabel}
            </text>
          )}
          <text x={size / 2} y={size / 2 + 10} textAnchor="middle"
            fontSize={size / 7} fontWeight="500" fill="var(--text-primary)"
            fontFamily="var(--font-serif)">
            {centerValue}
          </text>
          {centerSub && (
            <text x={size / 2} y={size / 2 + 26} textAnchor="middle"
              fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-sans)">
              {centerSub}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

// ─── Donut legend ──────────────────────────────────────────
function DonutLegend({ segs, total, compact = false, showPct = true }) {
  const sum = total ?? segs.reduce((a, s) => a + s.value, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 5 : 8 }}>
      {segs.map((s, i) => {
        const pct = sum ? (s.value / sum) * 100 : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: compact ? 11 : 12, color: "var(--text-secondary)", flex: 1 }}>{s.label}</span>
            {showPct && (
              <span style={{ fontSize: compact ? 11 : 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {pct.toFixed(0)}%
              </span>
            )}
            <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", minWidth: 36, textAlign: "right" }}>
              {s.value.toLocaleString("ko-KR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Horizontal bar (이름 + 값 + 막대) ─────────────────────
function HBar({ label, value, max, suffix = "", color = "var(--brand)", trackColor = "var(--bg-sunken)", widthClass, valueFmt, height = 8 }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-sans)" }}>
      <div style={{ width: widthClass || 80, fontSize: 12, color: "var(--text-secondary)", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height, background: trackColor, borderRadius: "var(--radius-full)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "var(--radius-full)", transition: "width 0.3s" }} />
      </div>
      <div style={{ width: 72, textAlign: "right", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 600, flexShrink: 0 }}>
        {valueFmt ? valueFmt(value) : value.toLocaleString("ko-KR")}{suffix}
      </div>
    </div>
  );
}

// ─── Stacked bar (가로 단일 줄, 청구 ok/hold/reject 같은 분포) ───
function StackedRow({ segs, width = "100%", height = 10, showLabels = false }) {
  const total = segs.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ width, height, display: "flex", borderRadius: "var(--radius-full)", overflow: "hidden", background: "var(--bg-sunken)" }}>
        {segs.map((s, i) => {
          const w = (s.value / total) * 100;
          acc += w;
          return (
            <div key={i} title={`${s.label} ${s.value}`} style={{ width: `${w}%`, height: "100%", background: s.color }} />
          );
        })}
      </div>
      {showLabels && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          {segs.map((s, i) => (
            <span key={i} style={{ color: s.color }}>● <span style={{ color: "var(--text-secondary)" }}>{s.label} {s.value}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Weekly occupancy (요일 막대) ──────────────────────────
function OccupancyBars({ days, valuesA, valuesB, labelA = "이번 주", labelB = "다음 주", colorA = "var(--brand)", colorB = "var(--ink-200)" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96, paddingTop: 4 }}>
        {days.map((d, i) => {
          const vA = valuesA[i];
          const vB = valuesB?.[i];
          const heightA = (vA / 100) * 80;
          const heightB = vB != null ? (vB / 100) * 80 : 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
                <div style={{ width: 9, height: heightA, background: colorA, borderRadius: "2px 2px 0 0", transition: "height 0.3s" }} />
                {vB != null && <div style={{ width: 9, height: heightB, background: colorB, borderRadius: "2px 2px 0 0", transition: "height 0.3s" }} />}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{d}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, background: colorA, borderRadius: 2 }} />{labelA}</span>
        {valuesB && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, background: colorB, borderRadius: 2 }} />{labelB}</span>}
      </div>
    </div>
  );
}

// ─── Vertical bar chart (가로축 카테고리, 세로 막대) ───────
function BarChart({ categories, values, width = 320, height = 180, color = "var(--brand)", valueFmt, showValues = true }) {
  const pad = { l: 12, r: 12, t: 22, b: 22 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const max = Math.max(...values);
  const bw = W / values.length;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <line x1={pad.l} y1={pad.t + H} x2={pad.l + W} y2={pad.t + H} stroke="var(--border-subtle)" />
      {values.map((v, i) => {
        const h = (v / max) * H;
        const x = pad.l + bw * i + bw * 0.18;
        const y = pad.t + H - h;
        const w = bw * 0.64;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={color} rx="2" />
            {showValues && (
              <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-secondary)">
                {valueFmt ? valueFmt(v) : v}
              </text>
            )}
            <text x={x + w / 2} y={pad.t + H + 13} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--text-secondary)">
              {categories[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 지역별 환자 분포 (지도 ↔ 막대 토글 + 구→동 드릴다운) ───
// 구 단위 choropleth에서 구를 클릭하면 해당 구의 동별 분포로 진입.
const GU_TILES = {
  "성동구": { col: 1, row: 1, short: "성동" },
  "광진구": { col: 2, row: 1, short: "광진" },
  "서초구": { col: 1, row: 2, short: "서초" },
  "강남구": { col: 2, row: 2, short: "강남" },
  "강동구": { col: 3, row: 2, short: "강동" },
  "송파구": { col: 2, row: 3, short: "송파" },
};
const DONG_TILES = {
  "강남구": {
    "신사동": { col: 1, row: 1, short: "신사" },
    "청담동": { col: 2, row: 1, short: "청담" },
    "논현동": { col: 1, row: 2, short: "논현" },
    "역삼동": { col: 2, row: 2, short: "역삼" },
    "삼성동": { col: 3, row: 2, short: "삼성" },
    "대치동": { col: 2, row: 3, short: "대치" },
  },
  "서초구": {
    "반포동": { col: 1, row: 1, short: "반포" },
    "잠원동": { col: 2, row: 1, short: "잠원" },
    "방배동": { col: 1, row: 2, short: "방배" },
    "서초동": { col: 2, row: 2, short: "서초" },
    "양재동": { col: 2, row: 3, short: "양재" },
  },
  "송파구": {
    "잠실동": { col: 1, row: 1, short: "잠실" },
    "방이동": { col: 2, row: 1, short: "방이" },
    "석촌동": { col: 1, row: 2, short: "석촌" },
    "가락동": { col: 2, row: 2, short: "가락" },
    "문정동": { col: 2, row: 3, short: "문정" },
  },
};

function RegionTileMap({ regions, tiles, onSelect, drillableSet }) {
  const mapped = regions.filter(r => tiles[r.label]);
  const other  = regions.find(r => !tiles[r.label]);
  const maxShare = Math.max(...mapped.map(r => r.share));
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: 6, maxWidth: 264, margin: "0 auto",
      }}>
        {mapped.map(r => {
          const t = tiles[r.label];
          const intensity = 0.16 + 0.84 * (r.share / maxShare);
          const onBrand = intensity >= 0.55;
          const drillable = drillableSet && drillableSet.has(r.label);
          return (
            <div key={r.label}
              onClick={drillable ? () => onSelect(r.label) : undefined}
              title={`${r.label} · ${r.value}명 (${r.share}%)${drillable ? " · 클릭하여 동별 보기" : ""}`}
              style={{
                gridColumn: t.col, gridRow: t.row,
                position: "relative", overflow: "hidden",
                aspectRatio: "1 / 1",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-raised)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: drillable ? "pointer" : "default",
              }}>
              <div style={{ position: "absolute", inset: 0, background: "var(--brand)", opacity: intensity }} />
              {drillable && (
                <div style={{
                  position: "absolute", top: 4, right: 4,
                  color: onBrand ? "var(--text-on-brand)" : "var(--text-muted)",
                  opacity: 0.8, display: "flex",
                }}>
                  <Icon name="chevron-right" size={12} />
                </div>
              )}
              <div style={{ position: "relative", textAlign: "center", lineHeight: 1.25 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, fontFamily: "var(--font-sans)",
                  color: onBrand ? "var(--text-on-brand)" : "var(--text-primary)",
                }}>{t.short}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
                  color: onBrand ? "var(--text-on-brand)" : "var(--text-secondary)",
                }}>{r.value}</div>
                <div style={{
                  fontSize: 9.5, fontFamily: "var(--font-mono)",
                  color: onBrand ? "var(--text-on-brand)" : "var(--text-muted)",
                  opacity: onBrand ? 0.85 : 1,
                }}>{r.share}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 색 농도 범례 + 기타 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>적음</span>
        <div style={{
          flex: 1, height: 8, borderRadius: "var(--radius-full)",
          background: "linear-gradient(90deg, var(--bg-raised), var(--brand))",
          border: "1px solid var(--border-subtle)",
        }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>많음</span>
        {other && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
            · 기타 <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{other.value}명</span>
          </span>
        )}
      </div>
    </div>
  );
}

function RegionDistribution({ data, defaultView = "map" }) {
  const [view, setView] = React.useState(defaultView);
  const [drill, setDrill] = React.useState(null);  // null | guLabel

  const dongMap = data.dong || {};
  const drillableSet = new Set(Object.keys(dongMap));
  const atGu = drill === null;
  const regions = atGu ? data.gu : dongMap[drill];
  const tiles = atGu ? GU_TILES : (DONG_TILES[drill] || {});

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {atGu ? (
          <span style={{
            fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-sans)",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <Icon name="mouse-pointer-click" size={12} /> 구를 클릭하면 동별 분포
          </span>
        ) : (
          <button onClick={() => setDrill(null)} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600, padding: "4px 10px 4px 7px",
            borderRadius: "var(--radius-full)",
            background: "var(--brand-subtle)", color: "var(--text-brand)",
            border: "1px solid var(--brand-muted)", cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>
            <Icon name="chevron-left" size={13} /> {drill} · 동별
          </button>
        )}
        <div style={{ flex: 1 }} />
        <div style={{
          display: "inline-flex", background: "var(--bg-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: 2,
        }}>
          {[
            { key: "map", icon: "map", label: "지도" },
            { key: "bar", icon: "bar-chart-3", label: "막대" },
          ].map(o => (
            <button key={o.key} onClick={() => setView(o.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11.5, fontWeight: 500, padding: "4px 10px",
              borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer",
              fontFamily: "var(--font-sans)",
              background: view === o.key ? "var(--bg-surface)" : "transparent",
              color: view === o.key ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: view === o.key ? "var(--shadow-sm)" : "none",
            }}>
              <Icon name={o.icon} size={12} />{o.label}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <RegionTileMap regions={regions} tiles={tiles}
          onSelect={setDrill} drillableSet={atGu ? drillableSet : null} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {regions.map((r, i) => {
            const drillable = atGu && drillableSet.has(r.label);
            const row = (
              <HBar label={r.label} value={r.value} max={regions[0].value}
                color={i === 0 ? "var(--jade-600)" : i === 1 ? "var(--jade-500)" : "var(--jade-400)"}
                widthClass={72}
                valueFmt={(v) => `${v}명 · ${r.share}%`} />
            );
            return drillable ? (
              <div key={r.label} onClick={() => setDrill(r.label)}
                title={`${r.label} 동별 보기`}
                style={{ cursor: "pointer" }}>{row}</div>
            ) : (
              <div key={r.label}>{row}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Sparkline, LineChart, Donut, DonutLegend, HBar, StackedRow, OccupancyBars, BarChart, RegionTileMap, RegionDistribution });
