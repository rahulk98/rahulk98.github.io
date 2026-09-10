// thesis-teaser.jsx — 30s JoLT teaser on the animations-v3 engine.
const { Easing, animate, clamp, useComposition, Shot, Captions, CompositionStage,
        useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakText, TweakColor } = window;

const SERIF = '"Libre Baskerville", Georgia, serif';
const MONO = '"IBM Plex Mono", Menlo, monospace';
const INK = '#1c1b18', MUTED = '#6f6b62', RULE = '#d8d3c8', BG = '#f7f5f0', HOT = '#a6483a';

const P = (T, s, d, e) => (e || Easing.easeOutCubic)(clamp((T - s) / d, 0, 1));
const MOTION = {
  enter(T, s, d = 0.7, dy = 26, until) {
    const p = P(T, s, d), q = until == null ? 0 : P(T, until, 0.45, Easing.easeInCubic);
    return { opacity: p * (1 - q), transform: `translateY(${(1 - p) * dy - q * dy}px)` };
  },
  draw(T, s, d) { return P(T, s, d, Easing.easeInOutCubic); },
  pop(T, s, d = 0.6) {
    const p = P(T, s, d, Easing.easeOutBack);
    return { opacity: P(T, s, 0.25), transform: `scale(${0.92 + 0.08 * p})` };
  },
};
const lerp = (a, b, p) => a + (b - a) * p;
const abs = (x, y, w, h, extra) => Object.assign({ position: 'absolute', left: x, top: y, width: w, height: h }, extra);

function Title({ T, at, until, text }) {
  return <div style={abs(160, 120, 1600, 'auto', Object.assign({
    fontFamily: SERIF, fontSize: 54, color: INK, letterSpacing: -0.5, textWrap: 'pretty' }, MOTION.enter(T, at, 0.8, 26, until)))}>{text}</div>;
}

// ── Scene 1: the cache grows ────────────────────────────────────────────
function CacheScene({ T, C, accent }) {
  const s = C.Cache, end = C.Tensor - 0.5;
  const g = MOTION.draw(T, s + 0.9, 3.8);
  const tokens = Math.round(65536 * g);
  const cells = Math.floor(64 * g + 1e-6);
  const kvGB = 8 * g;
  const kvW = 1200 * (kvGB / 16);
  const out = 1 - P(T, end, 0.45, Easing.easeInCubic);
  return (
    <div style={{ opacity: out }}>
      <Title T={T} at={s + 0.15} until={end} text="The KV cache grows with every token." />
      <div style={abs(160, 300, 1600, 'auto', Object.assign({ fontFamily: MONO, fontSize: 22, color: MUTED }, MOTION.enter(T, s + 0.6, 0.6, 14)))}>
        context · <span style={{ color: INK }}>{tokens.toLocaleString()}</span> tokens
      </div>
      <div style={abs(160, 348, 1600, 44, Object.assign({ display: 'flex', gap: 3 }, MOTION.enter(T, s + 0.6, 0.6, 14)))}>
        {Array.from({ length: 64 }, (_, i) => (
          <div key={i} style={{ flex: 1, background: i < cells ? INK : 'transparent', border: `1px solid ${i < cells ? INK : RULE}`, transition: 'none' }} />
        ))}
      </div>
      <div style={abs(160, 500, 1600, 'auto', MOTION.enter(T, s + 1.0, 0.7, 18))}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: MUTED, marginBottom: 12 }}>model weights · bf16</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 1200, height: 56, background: RULE }} />
          <div style={{ fontFamily: SERIF, fontSize: 34, color: INK }}>≈16 GB</div>
        </div>
      </div>
      <div style={abs(160, 640, 1600, 'auto', MOTION.enter(T, s + 1.2, 0.7, 18))}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: accent, marginBottom: 12 }}>KV cache · bf16 · batch 1</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 1200, height: 56, position: 'relative' }}>
            <div style={abs(0, 0, 1200, 56, { border: `1px solid ${RULE}`, boxSizing: 'border-box' })} />
            <div style={abs(0, 0, Math.max(2, kvW), 56, { background: accent })} />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 34, color: accent, minWidth: 140 }}>{kvGB.toFixed(1)} GB</div>
        </div>
      </div>
      <div style={abs(160, 790, 1600, 'auto', Object.assign({ fontFamily: MONO, fontSize: 22, color: MUTED }, MOTION.enter(T, s + 4.4, 0.7, 14)))}>
        LLaMA-3.1-8B · 32 layers × 8 KV heads × 128 dims × 2 bytes × (K, V) = 128 KiB per token · 8 GiB at 65,536 tokens
      </div>
    </div>
  );
}

// ── Scene 2: the tensor and its factorization ───────────────────────────
function Grid({ style, accent, alpha = 0.35 }) {
  return <div style={Object.assign({
    backgroundColor: BG,
    backgroundImage: `linear-gradient(${INK}${Math.round(alpha * 255).toString(16).padStart(2, '0')} 1px, transparent 1px), linear-gradient(90deg, ${INK}${Math.round(alpha * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`,
    backgroundSize: '20px 20px', border: `1.5px solid ${INK}`, boxSizing: 'border-box' }, style)} />;
}
function Hatch({ style, accent }) {
  return <div style={Object.assign({
    backgroundImage: `repeating-linear-gradient(135deg, ${accent} 0 1px, transparent 1px 12px)`,
    border: `1.5px dashed ${accent}`, boxSizing: 'border-box' }, style)} />;
}
function TensorScene({ T, C, accent }) {
  const s = C.Tensor, end = C.Allocate - 0.5;
  const inn = P(T, s, 0.9);
  const split = MOTION.draw(T, s + 2.8, 1.3);
  const out = 1 - P(T, end, 0.45, Easing.easeInCubic);
  // front face: whole block → core
  const bx = lerp(760, 640, split), by = lerp(400, 490, split), bw = lerp(400, 120, split), bh = lerp(300, 120, split);
  const lab = (x, y, w, text, color, at) => (
    <div style={abs(x, y, w, 'auto', Object.assign({ fontFamily: MONO, fontSize: 20, color: color || MUTED, textAlign: 'center' }, MOTION.enter(T, at, 0.5, 10)))}>{text}</div>
  );
  return (
    <div style={{ opacity: out * inn }}>
      <Title T={T} at={s + 0.15} until={end} text="JoLT factors only the two large modes." />
      {/* depth slabs = heads · layers, kept intact */}
      {[3, 2, 1].map(k => (
        <Grid key={k} accent={accent} alpha={0.12} style={abs(760 - 18 * k, 400 - 18 * k, 400, 300, {
          opacity: (1 - split) * P(T, s + 0.4 + 0.12 * k, 0.5), background: BG })} />
      ))}
      <div style={abs(560, 260, 500, 'auto', { fontFamily: MONO, fontSize: 20, color: MUTED, opacity: (1 - split) * P(T, s + 1.2, 0.5), textAlign: 'right' })}>
        heads n<sub>h</sub> · layers |g| — kept intact (pinned)
      </div>
      {/* axis labels on the block */}
      <div style={abs(700, 400, 44, 300, { fontFamily: MONO, fontSize: 20, color: accent, opacity: (1 - split) * P(T, s + 1.5, 0.5), writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center' })}>tokens T</div>
      <div style={abs(760, 712, 400, 'auto', { fontFamily: MONO, fontSize: 20, color: accent, opacity: (1 - split) * P(T, s + 1.7, 0.5), textAlign: 'center' })}>features d<sub>h</sub></div>
      {/* factors */}
      <Grid accent={accent} alpha={0.3} style={abs(lerp(760, 520, split), 400, lerp(400, 60, split), 300, { opacity: split, backgroundColor: `${accent}22` })} />
      <Grid accent={accent} alpha={0.3} style={abs(lerp(760, 820, split), lerp(400, 520, split), lerp(400, 300, split), lerp(300, 60, split), { opacity: split, backgroundColor: `${accent}22` })} />
      <Grid accent={accent} alpha={0.45} style={abs(bx, by, bw, bh)} />
      <div style={abs(1150, 500, 40, 'auto', { fontFamily: SERIF, fontSize: 48, color: INK, opacity: P(T, s + 3.6, 0.4), textAlign: 'center' })}>+</div>
      <Hatch accent={accent} style={abs(1220, 400, 400, 300, MOTION.pop(T, s + 3.7, 0.7))} />
      {lab(450, 720, 200, 'token basis U_T', INK, s + 3.9)}
      {lab(600, 630, 200, 'core 𝒢', INK, s + 4.0)}
      {lab(820, 600, 300, 'feature basis U_dᵀ', INK, s + 4.1)}
      {lab(1220, 720, 400, 'rotated low-bit residual · b ∈ {0, 2, 4, 8}', accent, s + 4.2)}
      <div style={abs(160, 830, 1600, 'auto', Object.assign({ fontFamily: SERIF, fontSize: 40, color: INK, textAlign: 'center', fontStyle: 'italic' }, MOTION.enter(T, s + 4.4, 0.7, 16)))}>
        X ≈ 𝒢 ×<sub style={{ fontSize: 24 }}>2</sub> U<sub style={{ fontSize: 24 }}>T</sub> ×<sub style={{ fontSize: 24 }}>3</sub> U<sub style={{ fontSize: 24 }}>d</sub> + Θ<sup style={{ fontSize: 24 }}>⊤</sup> Q<sub style={{ fontSize: 24 }}>b</sub>(Θ R),&nbsp;&nbsp; R = X − X̃(r<sub style={{ fontSize: 24 }}>T</sub>, r<sub style={{ fontSize: 24 }}>d</sub>)
      </div>
    </div>
  );
}

// ── Scene 3: the Lagrangian allocation ──────────────────────────────────
const BASE = [0.55, 0.72, 0.48, 0.86, 0.6, 0.76, 0.44, 0.66];
const LAMBDAS = [1.0, 0.5, 0.75, 0.625, 0.6875, 0.656];
function AllocateScene({ T, C, accent }) {
  const s = C.Allocate, end = C.FreeZone - 0.5;
  const inn = P(T, s, 0.8), out = 1 - P(T, end, 0.45, Easing.easeInCubic);
  const t0 = s + 1.4, step = 0.55;
  let lam = LAMBDAS[0];
  for (let i = 1; i < LAMBDAS.length; i++) lam = lerp(lam, LAMBDAS[i], P(T, t0 + (i - 1) * step, step * 0.8, Easing.easeInOutCubic));
  const f = l => 1.25 - 0.55 * l;
  const heights = BASE.map(b => 300 * b * f(lam));
  const maxSum = BASE.reduce((a, b) => a + 300 * b * f(0), 0);
  const fill = heights.reduce((a, b) => a + b, 0) / maxSum;
  const B = BASE.reduce((a, b) => a + 300 * b * f(LAMBDAS[LAMBDAS.length - 1]), 0) / maxSum;
  const bits = BASE.map(b => b * f(lam) > 0.58 ? 4 : 2);
  return (
    <div style={{ opacity: out * inn }}>
      <Title T={T} at={s + 0.15} until={end} text="One Lagrangian dual sets ranks and bit-widths together." />
      <div style={abs(160, 235, 1600, 'auto', Object.assign({ fontFamily: SERIF, fontSize: 32, fontStyle: 'italic', color: INK }, MOTION.enter(T, s + 0.6, 0.7, 14)))}>
        min Σ<sub style={{ fontSize: 20 }}>g,t</sub> e<sub style={{ fontSize: 20 }}>g,t</sub>(r<sub style={{ fontSize: 20 }}>T</sub>, r<sub style={{ fontSize: 20 }}>d</sub>, b)&nbsp;&nbsp; s.t. &nbsp;Σ<sub style={{ fontSize: 20 }}>g,t</sub> s<sub style={{ fontSize: 20 }}>g,t</sub>(r<sub style={{ fontSize: 20 }}>T</sub>, r<sub style={{ fontSize: 20 }}>d</sub>, b) ≤ B
        <span style={{ color: MUTED, margin: '0 28px' }}>→</span>
        𝓛(λ) = Σ<sub style={{ fontSize: 20 }}>g,t</sub> [ e<sub style={{ fontSize: 20 }}>g,t</sub> + λ s<sub style={{ fontSize: 20 }}>g,t</sub> ]
      </div>
      <div style={abs(160, 296, 1600, 'auto', Object.assign({ fontFamily: MONO, fontSize: 19, color: MUTED }, MOTION.enter(T, s + 0.8, 0.6, 10)))}>e ≈ ε²(b) · τ(r_T, r_d): bits shrink the residual factor, ranks shrink the truncation tail</div>
      <div style={abs(160, 345, 1280, 'auto', Object.assign({ fontFamily: MONO, fontSize: 20, color: MUTED }, MOTION.enter(T, s + 1.0, 0.6, 10)))}>layer groups g · ranks (r_T, r_d) as bar · residual bits b</div>
      <div style={abs(160, 380, 1280, 330, MOTION.enter(T, s + 1.0, 0.7, 20))}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTop: `1px solid ${RULE}` }} />
        {BASE.map((b, i) => (
          <div key={i} style={abs(i * 160, 0, 120, 330)}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: heights[i], background: accent }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: heights[i] + 10, fontFamily: MONO, fontSize: 20, color: INK, textAlign: 'center' }}>b={bits[i]}</div>
          </div>
        ))}
      </div>
      <div style={abs(160, 722, 1280, 'auto', Object.assign({ display: 'flex', fontFamily: MONO, fontSize: 18, color: MUTED }, MOTION.enter(T, s + 1.0, 0.7, 20)))}>
        {BASE.map((_, i) => <div key={i} style={{ width: 160, textAlign: 'left' }}><span style={{ display: 'inline-block', width: 120, textAlign: 'center' }}>g{i + 1}</span></div>)}
      </div>
      {/* lambda readout */}
      <div style={abs(1480, 380, 320, 'auto', MOTION.enter(T, s + 1.2, 0.6, 14))}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>bisection on λ</div>
        <div style={{ fontFamily: SERIF, fontSize: 56, color: INK, marginTop: 6, whiteSpace: 'nowrap' }}>λ = {lam.toFixed(3)}</div>
      </div>
      {/* budget gauge */}
      <div style={abs(160, 800, 1600, 'auto', MOTION.enter(T, s + 1.2, 0.6, 14))}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED, marginBottom: 10 }}>Σ bytes against budget B · persistent serialized prefill-KV bytes per token</div>
        <div style={{ position: 'relative', height: 28, border: `1px solid ${RULE}`, boxSizing: 'border-box' }}>
          <div style={abs(0, 0, `${fill * 100}%`, 26, { background: fill > B + 0.004 ? HOT : INK })} />
          <div style={abs(`${B * 100}%`, -10, 2, 46, { background: accent })} />
          <div style={abs(`${B * 100}%`, -44, 60, 'auto', { fontFamily: MONO, fontSize: 20, color: accent, transform: 'translateX(-50%)' })}>B</div>
        </div>
      </div>
    </div>
  );
}

// ── Scene 4: the free-zone table ────────────────────────────────────────
const ROWS = [
  ['Mistral-7B', 'GQA', '6.28', ['6.28', '−0.02%'], ['6.29', '+0.04%'], ['6.64', '+5.58%'], ['7.01', '+11.56%']],
  ['LLaMA-2-13B', 'MHA', '5.39', ['5.39', '−0.02%'], ['5.39', '−0.01%'], ['6.86', '+27.28%'], ['9.07', '+68.30%']],
  ['OLMoE-1B-7B', 'MoE', '7.26', ['7.27', '+0.02%'], ['7.27', '+0.11%'], ['7.48', '+3.00%'], ['n/a', '']],
  ['LLaMA-3.1-8B', 'GQA', '7.28', ['7.28', '−0.01%'], ['7.29', '+0.12%'], ['7.96', '+9.33%'], ['11.02', '+51.27%']],
  ['Qwen2.5-14B', 'GQA', '6.65', ['6.65', '+0.02%'], ['6.66', '+0.17%'], ['7.96', '+19.63%'], ['9.55', '+43.52%']],
];
const COLX = [160, 700, 940, 1160, 1380, 1600];
function FreeZoneScene({ T, C, accent }) {
  const s = C.FreeZone, end = C.LongContext - 0.3;
  const inn = P(T, s, 0.8), out = 1 - P(T, end, 0.5, Easing.easeInCubic);
  const band = MOTION.draw(T, s + 3.2, 0.9);
  const dim = P(T, s + 5.6, 0.8);
  const zoom = 1 + 0.035 * MOTION.draw(T, s, C.LongContext - s);
  const rowY = i => 400 + i * 96;
  return (
    <div style={{ opacity: out * inn, transform: `scale(${zoom})`, transformOrigin: '1150px 620px' }}>
      <Title T={T} at={s + 0.15} until={end} text="Near-lossless through 3× on five models." />
      {/* free-zone band */}
      <div style={abs(930, 362, 440, 0, { height: 507 * band, background: `${accent}18`, borderLeft: `1.5px solid ${accent}`, borderRight: `1.5px solid ${accent}`, boxSizing: 'border-box' })} />
      <div style={abs(930, 280, 440, 'auto', { fontFamily: MONO, fontSize: 20, color: accent, textAlign: 'center', opacity: P(T, s + 3.9, 0.5) })}>near-lossless free zone</div>
      {/* header */}
      <div style={abs(0, 320, 1920, 'auto', Object.assign({ fontFamily: MONO, fontSize: 20, color: MUTED }, MOTION.enter(T, s + 0.5, 0.6, 12)))}>
        <div style={abs(COLX[0], 0, 500, 'auto')}>model · PPL at T=1024</div>
        <div style={abs(COLX[1], 0, 200, 'auto', { textAlign: 'center' })}>baseline</div>
        {['2×', '3×', '4×', '5×'].map((h, i) => <div key={h} style={abs(COLX[2 + i], 0, 200, 'auto', { textAlign: 'center', color: i < 2 ? accent : MUTED, opacity: i >= 2 ? 1 - 0.5 * dim : 1 })}>{h}</div>)}
        <div style={abs(160, 42, 1640, 1, { background: RULE })} />
      </div>
      {ROWS.map((r, i) => {
        const e = MOTION.enter(T, s + 0.9 + i * 0.32, 0.6, 16);
        return (
          <div key={r[0]} style={abs(0, rowY(i), 1920, 84, e)}>
            <div style={abs(COLX[0], 6, 520, 'auto', { fontFamily: SERIF, fontSize: 30, color: INK })}>{r[0]} <span style={{ fontFamily: MONO, fontSize: 18, color: MUTED, marginLeft: 8 }}>{r[1]}</span></div>
            <div style={abs(COLX[1], 6, 200, 'auto', { fontFamily: SERIF, fontSize: 30, color: INK, textAlign: 'center' })}>{r[2]}</div>
            {r.slice(3).map((c, j) => (
              <div key={j} style={abs(COLX[2 + j], 0, 200, 'auto', { textAlign: 'center', opacity: j >= 2 ? 1 - 0.55 * dim : 1 })}>
                <div style={{ fontFamily: SERIF, fontSize: 30, color: INK }}>{c[0]}</div>
                <div style={{ fontFamily: MONO, fontSize: 18, color: j < 2 ? accent : (c[1] ? HOT : MUTED), marginTop: 2 }}>{c[1]}</div>
              </div>
            ))}
            <div style={abs(160, 84, 1640, 1, { background: RULE })} />
          </div>
        );
      })}
      <div style={abs(160, 900, 1640, 'auto', Object.assign({ fontFamily: MONO, fontSize: 17, color: MUTED }, MOTION.enter(T, s + 2.8, 0.6, 10)))}>exact backbone · mean over seeds 0–2 · OLMoE evaluated at 2–4× only · Qwen2.5 single seed</div>
    </div>
  );
}


// ── Scene 4b: the free zone widens with context ─────────────────────────
const STAGES = [
  { ctx: '4K', model: 'Mistral-7B', v: [0, 0, -6.10, null] },
  { ctx: '8K', model: 'Mistral-7B', v: [-0.20, -0.70, -0.60, null] },
  { ctx: '16K', model: 'Mistral-7B', v: [-0.20, -0.25, -0.30, null] },
  { ctx: '32K', model: 'Mistral-7B', v: [-0.70, -0.20, -0.20, null] },
  { ctx: '64K', model: 'LLaMA-3.1-8B', v: [0.23, -0.10, -0.90, -2.40] },
];
const RX = [465, 795, 1125, 1455], PLOT_Y = 340, PLOT_H = 480, VMAX = 1, VMIN = -7;
const yOf = v => PLOT_Y + (VMAX - v) / (VMAX - VMIN) * PLOT_H;
function LongContextScene({ T, C, accent }) {
  const s = C.LongContext, end = C.Credit - 0.3;
  const inn = P(T, s, 0.8), out = 1 - P(T, end, 0.5, Easing.easeInCubic);
  const t0 = s + 1.6, step = 0.95;
  // stage index as a continuous value
  let k = 0;
  for (let i = 1; i < STAGES.length; i++) k += P(T, t0 + (i - 1) * step, 0.55, Easing.easeInOutCubic);
  const i0 = Math.min(STAGES.length - 1, Math.floor(k)), i1 = Math.min(STAGES.length - 1, i0 + 1), f = k - i0;
  const vals = [0, 1, 2, 3].map(j => {
    const a = STAGES[i0].v[j], b = STAGES[i1].v[j];
    if (a == null && b == null) return null;
    if (a == null) return b; if (b == null) return a;
    return lerp(a, b, f);
  });
  const stage = f < 0.5 ? STAGES[i0] : STAGES[i1];
  const grow = MOTION.draw(T, s + 0.6, 0.8);
  const fiveIn = P(T, t0 + 3 * step, 0.55);
  const bandRight = lerp(960, 1290, P(T, t0, 0.55, Easing.easeInOutCubic));
  const y0 = yOf(0), yBar = yOf(-2);
  return (
    <div style={{ opacity: out * inn }}>
      <Title T={T} at={s + 0.15} until={end} text="The free zone widens as context grows." />
      {/* context readout */}
      <div style={abs(1180, 130, 580, 'auto', Object.assign({ textAlign: 'right' }, MOTION.enter(T, s + 0.6, 0.6, 12)))}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: MUTED }}>context · {stage.model}</div>
        <div style={{ fontFamily: SERIF, fontSize: 72, color: INK, lineHeight: 1.1 }}>{stage.ctx}</div>
      </div>
      {/* free-zone band */}
      <div style={abs(300, PLOT_Y - 30, (bandRight - 300) * grow, PLOT_H + 60, { background: `${accent}18`, borderRight: `1.5px solid ${accent}`, boxSizing: 'border-box' })} />
      <div style={abs(1290, PLOT_Y - 30, 330, PLOT_H + 60, { border: `1.5px dashed ${accent}`, borderLeft: 'none', boxSizing: 'border-box', opacity: fiveIn * 0.7 })} />
      <div style={abs(300, PLOT_Y - 62, (bandRight - 300), 'auto', { fontFamily: MONO, fontSize: 20, color: accent, textAlign: 'center', opacity: grow })}>near-lossless free zone</div>
      <div style={abs(1290, PLOT_Y - 62, 330, 'auto', { fontFamily: MONO, fontSize: 20, color: accent, textAlign: 'center', opacity: fiveIn })}>within 2.4 pp</div>
      {/* axes */}
      <div style={abs(300, y0, 1320, 1, { background: INK, opacity: grow })} />
      <div style={abs(300, yBar, 1320, 0, { borderTop: `1.5px dashed ${MUTED}`, opacity: grow })} />
      <div style={abs(1630, y0 - 12, 200, 'auto', { fontFamily: MONO, fontSize: 18, color: MUTED, opacity: grow })}>Δ = 0 pp</div>
      <div style={abs(1630, yBar - 12, 220, 'auto', { fontFamily: MONO, fontSize: 18, color: MUTED, opacity: grow })}>−2 pp bar</div>
      <div style={abs(160, PLOT_Y + 20, 120, 'auto', { fontFamily: MONO, fontSize: 18, color: MUTED, opacity: grow, lineHeight: 1.5 })}>Δ accuracy<br />vs full KV</div>
      {/* bars */}
      {vals.map((v, j) => {
        if (v == null) return null;
        const vis = j === 3 ? fiveIn : grow;
        const top = Math.min(y0, yOf(v)), h = Math.abs(yOf(v) - y0);
        const ok = v >= -2;
        return (
          <div key={j} style={{ opacity: vis }}>
            <div style={abs(RX[j] - 60, top, 120, Math.max(2, h), { background: ok ? accent : HOT })} />
            <div style={abs(RX[j] - 100, (v >= 0 ? top - 34 : top + h + 8), 200, 'auto', { fontFamily: MONO, fontSize: 22, color: ok ? INK : HOT, textAlign: 'center' })}>{(v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2)} pp</div>
            <div style={abs(RX[j] - 100, PLOT_Y + PLOT_H + 44, 200, 'auto', { fontFamily: SERIF, fontSize: 30, color: INK, textAlign: 'center' })}>{['2×', '3×', '4×', '5×'][j]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Scene 5: credit ─────────────────────────────────────────────────────
function CreditScene({ T, C, accent, author, total }) {
  const s = C.Credit;
  const out = 1 - P(T, total - 0.6, 0.5, Easing.easeInCubic);
  return (
    <div style={{ opacity: out }}>
      <div style={abs(0, 300, 1920, 'auto', Object.assign({ fontFamily: SERIF, fontSize: 150, color: INK, textAlign: 'center', letterSpacing: -3 }, MOTION.enter(T, s + 0.2, 0.9, 30)))}>JoLT</div>
      <div style={abs(0, 500, 1920, 'auto', Object.assign({ fontFamily: SERIF, fontSize: 34, fontStyle: 'italic', color: INK, textAlign: 'center' }, MOTION.enter(T, s + 0.6, 0.8, 20)))}>Joint Lagrangian Tucker · near-lossless KV-cache compression</div>
      <div style={abs(0, 580, 1920, 'auto', Object.assign({ fontFamily: MONO, fontSize: 22, color: accent, textAlign: 'center' }, MOTION.enter(T, s + 1.1, 0.8, 16)))}>FlashJoLT fused decode kernel · 3.61× lower peak decode memory than dense bf16 · Mistral-7B, 5× point, context 8192</div>
      <div style={abs(0, 760, 1920, 'auto', Object.assign({ fontFamily: MONO, fontSize: 20, color: MUTED, textAlign: 'center', lineHeight: 1.7 }, MOTION.enter(T, s + 1.6, 0.8, 14)))}>
        {author} · M.Sc. Data Science, Universität Trier · Supervisor Prof. Dr. Volker Schulz<br />arXiv 2607.12550
      </div>
    </div>
  );
}

function Piece({ accent, author, captions }) {
  const { T, CUES: C, authoredTotal } = useComposition();
  const items = [
    { at: C.Cache + 1.0, until: C.Tensor - 0.5, text: 'At 64K context the KV cache of one LLaMA-3.1-8B sequence is 8 GiB in bf16, about half the model\u2019s own 16 GB of weights.' },
    { at: C.Tensor + 0.8, until: C.Allocate - 0.5, text: 'Heads and layers are index-like, so they stay intact. Tokens and features are factored; a rotated low-bit residual recovers the truncated energy.' },
    { at: C.Allocate + 0.8, until: C.FreeZone - 0.5, text: 'Ranks and residual bit-widths are chosen jointly under one byte budget by bisection on a single multiplier.' },
    { at: C.LongContext + 0.8, until: C.Credit - 0.3, text: 'RULER retrieval, FlashJoLT. At 4K context, 4\u00d7 costs 6.1 pp; by 32K only 0.2 pp. At 64K on LLaMA-3.1-8B, 4\u00d7 costs under a point and 5\u00d7 sits at 2.4 pp.' },
    { at: C.FreeZone + 0.8, until: C.LongContext - 0.3, text: 'Perplexity at T=1024. Δ% against each model\u2019s own uncompressed baseline. Five models, four architecture families.' },
  ];
  return (
    <div data-screen-label={`t=${T.toFixed(1)}s`} style={{ position: 'absolute', inset: 0, background: BG, overflow: 'hidden', color: INK }}>
      <CacheScene T={T} C={C} accent={accent} />
      <TensorScene T={T} C={C} accent={accent} />
      <AllocateScene T={T} C={C} accent={accent} />
      <FreeZoneScene T={T} C={C} accent={accent} />
      <LongContextScene T={T} C={C} accent={accent} />
      <CreditScene T={T} C={C} accent={accent} author={author} total={authoredTotal} />
      {captions && <Captions items={items} style={{ font: `italic 26px ${SERIF}`, color: MUTED, textShadow: 'none', bottom: '5.5%', left: '12%', right: '12%', lineHeight: 1.45, textWrap: 'pretty' }} />}
    </div>
  );
}

function ThesisTeaser() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#ebe8e1' }}>
      <CompositionStage width={1920} height={1080} bg={BG} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <Piece accent={t.accent} author={t.authorName} captions={t.captions} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Content" />
        <TweakText label="Author name" value={t.authorName} onChange={v => setTweak('authorName', v)} />
        <TweakToggle label="Narration captions" value={t.captions} onChange={v => setTweak('captions', v)} />
        <TweakSection label="Look" />
        <TweakColor label="Accent" value={t.accent} options={['#1f8a5b', '#2f6fdf', '#b5562b', '#6d4fc4']} onChange={v => setTweak('accent', v)} />
        <TweakSection label="Editor" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.ThesisTeaser = ThesisTeaser;
