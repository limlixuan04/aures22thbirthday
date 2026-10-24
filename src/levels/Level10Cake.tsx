import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cake, people } from '../content/content';
import { sfx } from '../lib/sound';
import { celebrate } from '../lib/confetti';
import { seeded } from '../lib/random';
import type { LevelProps } from '.';

const FROSTINGS = [
  { name: 'Strawberry', color: '#F6B3C4' },
  { name: 'Vanilla', color: '#FFF1D6' },
  { name: 'Chocolate', color: '#9A6A50' },
  { name: 'Matcha', color: '#B9D8A7' },
  { name: 'Ube', color: '#CDB4E6' },
  { name: 'Berry', color: '#B4466A' },
];
const DRIPS = [
  { name: 'White choc', color: '#FFFDF8' },
  { name: 'Dark choc', color: '#5A3626' },
  { name: 'Pink', color: '#E2688A' },
  { name: 'Honey', color: '#F5CD6E' },
];
const TOPPINGS = [
  { id: 'sprinkles', label: 'Sprinkles', emoji: '🌈' },
  { id: 'strawberries', label: 'Strawberries', emoji: '🍓' },
  { id: 'hearts', label: 'Hearts', emoji: '💗' },
  { id: 'pearls', label: 'Pearls', emoji: '🤍' },
  { id: 'stars', label: 'Stars', emoji: '⭐' },
  { id: 'ball', label: 'Basketball', emoji: '🏀' },
] as const;
type ToppingId = (typeof TOPPINGS)[number]['id'];
const CANDLE_COLOURS = ['#7EC8E3', '#F6B3C4', '#F5CD6E', '#A9D2A6', '#CDB4E6', '#FFFDF8'];

// Top surface of the top tier, where candles go.
const TOP = { cx: 200, cy: 120, rx: 86, ry: 17 };

interface Candle {
  id: number;
  x: number;
  y: number;
  color: string;
  lit: boolean;
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  const r = f(n >> 16);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function dripPath(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const r = seeded(seed);
  let d = `M${cx - rx} ${cy}`;
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = cx - rx + t * rx * 2;
    const base = cy + Math.sin(Math.PI * t) * ry;
    const len = 10 + r() * 22;
    d += ` L${x - 6} ${base} Q${x - 6} ${base + len} ${x} ${base + len} Q${x + 6} ${base + len} ${x + 6} ${base}`;
  }
  d += ` L${cx + rx} ${cy} A${rx} ${ry} 0 0 0 ${cx - rx} ${cy}Z`;
  return d;
}

export default function Level10Cake({ onComplete }: LevelProps) {
  const [frosting, setFrosting] = useState(FROSTINGS[0].color);
  const [drip, setDrip] = useState(DRIPS[0].color);
  const [toppings, setToppings] = useState<Set<ToppingId>>(new Set(['sprinkles']));
  const [candles, setCandles] = useState<Candle[]>([]);
  const [phase, setPhase] = useState<'decorate' | 'lit' | 'blown'>('decorate');
  const [tip, setTip] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ids = useRef(0);
  const completed = useRef(false);

  const sprinkles = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 46 }, () => {
      const lower = r() > 0.4;
      return {
        x: lower ? 76 + r() * 248 : 116 + r() * 168,
        y: lower ? 222 + r() * 92 : 132 + r() * 72,
        rot: r() * 180,
        c: ['#E2688A', '#F5CD6E', '#7EC8E3', '#A9D2A6', '#fff', '#CDB4E6'][Math.floor(r() * 6)],
      };
    });
  }, []);

  const has = (t: ToppingId) => toppings.has(t);
  const toggle = (t: ToppingId) => {
    sfx.pop();
    setToppings((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  };

  const addCandle = (x: number, y: number) => {
    if (candles.length >= cake.maxCandles) {
      setTip(`That’s ${cake.maxCandles} candles — one for every year! 🕯️`);
      sfx.bonk();
      return;
    }
    sfx.pop();
    setTip(null);
    setCandles((cs) => [...cs, { id: ++ids.current, x, y, color: CANDLE_COLOURS[ids.current % CANDLE_COLOURS.length], lit: false }]);
  };

  const randomSpot = (rng: () => number = Math.random) => {
    const a = rng() * Math.PI * 2;
    const rad = Math.sqrt(rng()) * 0.85;
    return { x: TOP.cx + Math.cos(a) * TOP.rx * rad, y: TOP.cy + Math.sin(a) * TOP.ry * rad };
  };

  const onCakeClick = (e: MouseEvent<SVGSVGElement>) => {
    if (phase !== 'decorate') return;
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const inside = ((p.x - TOP.cx) / TOP.rx) ** 2 + ((p.y - TOP.cy) / TOP.ry) ** 2 <= 1.15;
    if (inside) addCandle(p.x, Math.min(p.y, TOP.cy + TOP.ry - 2));
    else setTip('Tap the very top of the cake to place a candle! ⬆️');
  };

  const fill22 = () => {
    sfx.success();
    const r = seeded(Date.now());
    const extra = Array.from({ length: cake.maxCandles - candles.length }, (_, i) => {
      const s = randomSpot(r);
      return { id: ++ids.current, ...s, color: CANDLE_COLOURS[(candles.length + i) % CANDLE_COLOURS.length], lit: false };
    });
    setCandles((cs) => [...cs, ...extra]);
  };

  const light = () => {
    if (!candles.length) {
      setTip('Add at least one candle first! 🕯️');
      sfx.bonk();
      return;
    }
    sfx.whoosh();
    setTip(null);
    setCandles((cs) => cs.map((c) => ({ ...c, lit: true })));
    setPhase('lit');
  };

  const finish = () => {
    setPhase('blown');
    sfx.fanfare();
    celebrate(3000);
    if (!completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const blowOne = (id: number) => {
    if (phase !== 'lit') return;
    sfx.whoosh();
    const next = candles.map((c) => (c.id === id ? { ...c, lit: false } : c));
    setCandles(next);
    if (next.every((c) => !c.lit)) finish();
  };

  const blowAll = () => {
    sfx.whoosh();
    setCandles((cs) => cs.map((c) => ({ ...c, lit: false })));
    finish();
  };

  const redo = () => {
    setPhase('decorate');
    setCandles((cs) => cs.map((c) => ({ ...c, lit: false })));
  };

  const side = shade(frosting, -0.12);
  const sorted = [...candles].sort((a, b) => a.y - b.y);

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      {/* Cake */}
      <div className="w-full max-w-[460px]">
        <div className={`relative rounded-[28px] border-4 border-berry-600 p-2 shadow-pop transition-colors duration-700 ${phase === 'lit' ? 'bg-berry-800' : 'bg-blush-100'}`}>
          <svg
            ref={svgRef}
            viewBox="0 0 400 380"
            className={`block w-full ${phase === 'decorate' ? 'cursor-copy' : ''}`}
            onClick={onCakeClick}
            role="img"
            aria-label={`Your birthday cake with ${candles.length} candles`}
            data-testid="cake-svg"
          >
            {/* glow when lit */}
            <defs>
              <radialGradient id="candle-glow">
                <stop offset="0" stopColor="#FFD98A" stopOpacity=".55" />
                <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
              </radialGradient>
            </defs>
            {phase === 'lit' && <ellipse cx="200" cy="110" rx="190" ry="140" fill="url(#candle-glow)" />}
            {/* plate */}
            <ellipse cx="200" cy="334" rx="172" ry="28" fill="#fff" stroke="#E6D7CF" strokeWidth="3" />
            {/* bottom tier */}
            <path d="M70 212 L70 318 A130 24 0 0 0 330 318 L330 212Z" fill={side} />
            <ellipse cx="200" cy="212" rx="130" ry="26" fill={frosting} />
            <path d={dripPath(200, 212, 130, 26, 3)} fill={drip} />
            {/* plaque */}
            <rect x="110" y="252" width="180" height="40" rx="14" fill="#FFFDF8" stroke="#C25B7A" strokeWidth="2.5" />
            <text x="200" y="279" textAnchor="middle" fontFamily="Caveat, cursive" fontWeight="700" fontSize="23" fill="#7A1F3D">
              {cake.plaque}
            </text>
            {/* top tier */}
            <path d="M114 122 L114 206 A86 18 0 0 0 286 206 L286 122Z" fill={side} />
            <ellipse cx="200" cy="122" rx="86" ry="18" fill={frosting} />
            <path d={dripPath(200, 122, 86, 18, 8)} fill={drip} />

            {has('sprinkles') &&
              sprinkles
                .filter((s) => !(s.x > 112 && s.x < 288 && s.y > 246 && s.y < 298))
                .map((s, i) => <rect key={i} x={s.x} y={s.y} width="7" height="2.6" rx="1.3" fill={s.c} transform={`rotate(${s.rot} ${s.x} ${s.y})`} />)}
            {has('pearls') &&
              [...Array.from({ length: 15 }, (_, i) => ({ x: 78 + i * 17.5, y: 320 + Math.sin((Math.PI * i) / 14) * 22 })), ...Array.from({ length: 11 }, (_, i) => ({ x: 118 + i * 16.4, y: 207 + Math.sin((Math.PI * i) / 10) * 15 }))].map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="5" fill="#FFFDF8" stroke="#E6D7CF" />
              ))}
            {has('hearts') &&
              [
                [92, 300],
                [308, 300],
                [134, 180],
                [266, 180],
                [100, 240],
                [300, 240],
              ].map(([x, y], i) => (
                <path key={i} transform={`translate(${x - 9} ${y - 9}) scale(.75)`} d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2.2 0 3.6 1.2 5 3 1.4-1.8 2.8-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" fill="#E2688A" stroke="#7A1F3D" strokeWidth="1.5" />
              ))}
            {has('stars') &&
              [
                [150, 160],
                [250, 150],
                [86, 270],
                [314, 268],
                [200, 196],
              ].map(([x, y], i) => (
                <path key={i} transform={`translate(${x - 10} ${y - 10}) scale(.85)`} d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="#F5CD6E" stroke="#C8901A" strokeWidth="1" />
              ))}
            {has('strawberries') &&
              [
                [92, 214],
                [130, 228],
                [170, 236],
                [230, 236],
                [270, 228],
                [308, 214],
              ].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <path d="M0 14 C-12 6 -11 -6 0 -4 C11 -6 12 6 0 14Z" fill="#E8435E" stroke="#A8293D" strokeWidth="1.5" />
                  <path d="M-6 -5 L0 -10 L6 -5 L0 -3Z" fill="#5E9A66" />
                  <circle cx="-3" cy="2" r=".9" fill="#FFE9A8" />
                  <circle cx="3" cy="5" r=".9" fill="#FFE9A8" />
                  <circle cx="0" cy="0" r=".9" fill="#FFE9A8" />
                </g>
              ))}
            {has('ball') && (
              <g transform="translate(176 160)">
                <circle cx="24" cy="24" r="21" fill="#EE8A3C" stroke="#5A2A12" strokeWidth="2.5" />
                <path d="M24 3 V45 M3 24 H45 M9.5 8.5 C17 15 17 33 9.5 39.5 M38.5 8.5 C31 15 31 33 38.5 39.5" stroke="#5A2A12" strokeWidth="2.2" fill="none" />
                <ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-35 15 13)" />
              </g>
            )}

            {/* candles */}
            {sorted.map((c) => (
              <g key={c.id} onClick={(e) => (phase === 'lit' ? (e.stopPropagation(), blowOne(c.id)) : undefined)} style={{ cursor: phase === 'lit' ? 'pointer' : undefined }}>
                <rect x={c.x - 4} y={c.y - 38} width="8" height="38" rx="3" fill={c.color} stroke={shade(c.color, -0.3)} strokeWidth="1.2" />
                <path d={`M${c.x - 4} ${c.y - 30} l8 -5 M${c.x - 4} ${c.y - 18} l8 -5 M${c.x - 4} ${c.y - 6} l8 -5`} stroke="#fff" strokeWidth="1.8" opacity=".7" />
                <line x1={c.x} y1={c.y - 38} x2={c.x} y2={c.y - 43} stroke="#45101F" strokeWidth="1.5" />
                {c.lit && (
                  <g className="animate-flicker" style={{ transformOrigin: `${c.x}px ${c.y - 42}px`, transformBox: 'view-box' } as React.CSSProperties}>
                    <ellipse cx={c.x} cy={c.y - 52} rx="9" ry="13" fill="#F5CD6E" opacity=".35" />
                    <path d={`M${c.x} ${c.y - 64} C${c.x + 7} ${c.y - 54} ${c.x + 5} ${c.y - 44} ${c.x} ${c.y - 43} C${c.x - 5} ${c.y - 44} ${c.x - 7} ${c.y - 54} ${c.x} ${c.y - 64}Z`} fill="#FFB43C" />
                    <path d={`M${c.x} ${c.y - 56} C${c.x + 3} ${c.y - 51} ${c.x + 2} ${c.y - 46} ${c.x} ${c.y - 45} C${c.x - 2} ${c.y - 46} ${c.x - 3} ${c.y - 51} ${c.x} ${c.y - 56}Z`} fill="#FFF6C9" />
                  </g>
                )}
                {!c.lit && phase !== 'decorate' && (
                  <motion.path
                    d={`M${c.x} ${c.y - 44} q-6 -8 0 -16 q6 -8 0 -16`}
                    stroke="#C8B6B0"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ opacity: 0.9, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    transition={{ duration: 1.6 }}
                  />
                )}
              </g>
            ))}
            {phase === 'decorate' && candles.length === 0 && (
              <ellipse cx={TOP.cx} cy={TOP.cy} rx={TOP.rx - 6} ry={TOP.ry - 4} fill="none" stroke="#7A1F3D" strokeWidth="2" strokeDasharray="6 6" opacity=".45" className="animate-pulse" />
            )}
          </svg>
        </div>
        <p className="mt-3 min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
          {phase === 'lit' ? cake.wishPrompt : phase === 'blown' ? cake.afterBlow : (tip ?? `🕯️ ${candles.length} / ${cake.maxCandles} candles — tap the top of the cake!`)}
        </p>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {phase === 'decorate' ? (
            <motion.div key="deco" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
              <fieldset>
                <legend className="mb-2 font-display font-semibold text-berry-600">Frosting</legend>
                <div className="flex flex-wrap gap-2">
                  {FROSTINGS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        sfx.click();
                        setFrosting(f.color);
                      }}
                      aria-pressed={frosting === f.color}
                      aria-label={`${f.name} frosting`}
                      title={f.name}
                      className={`h-11 w-11 rounded-full border-4 transition hover:scale-110 ${frosting === f.color ? 'scale-110 border-berry-600' : 'border-white shadow'}`}
                      style={{ background: f.color }}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-display font-semibold text-berry-600">Drip</legend>
                <div className="flex flex-wrap gap-2">
                  {DRIPS.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        sfx.click();
                        setDrip(d.color);
                      }}
                      aria-pressed={drip === d.color}
                      aria-label={`${d.name} drip`}
                      title={d.name}
                      className={`h-11 w-11 rounded-full border-4 transition hover:scale-110 ${drip === d.color ? 'scale-110 border-berry-600' : 'border-white shadow'}`}
                      style={{ background: d.color }}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-display font-semibold text-berry-600">Toppings</legend>
                <div className="grid grid-cols-2 gap-2">
                  {TOPPINGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggle(t.id)}
                      aria-pressed={has(t.id)}
                      className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left font-display font-medium transition ${has(t.id) ? 'border-berry-500 bg-blush-200 text-berry-700' : 'border-blush-200 bg-white text-berry-500 hover:bg-blush-50'}`}
                    >
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-display font-semibold text-berry-600">Candles ({candles.length})</legend>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-soft px-4 py-2 text-base" onClick={() => {
                    const s = randomSpot();
                    addCandle(s.x, s.y);
                  }} data-testid="add-candle">
                    + Add one
                  </button>
                  <button type="button" className="btn-soft px-4 py-2 text-base" onClick={fill22} disabled={candles.length >= cake.maxCandles}>
                    All {cake.maxCandles}!
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setCandles([])} disabled={!candles.length}>
                    Clear
                  </button>
                </div>
              </fieldset>
              <button type="button" className="btn-primary text-xl" onClick={light} data-testid="light-candles">
                🔥 Done! Light the candles
              </button>
            </motion.div>
          ) : (
            <motion.div key="blow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-4 pt-4 text-center lg:pt-24">
              {phase === 'lit' ? (
                <>
                  <p className="font-display text-2xl font-semibold text-berry-600">Close your eyes… make a wish… ✨</p>
                  <button type="button" className="btn-primary px-10 py-4 text-2xl" onClick={blowAll} data-testid="blow">
                    🌬️ Blow!
                  </button>
                  <p className="text-sm text-cocoa-500">(Or tap the flames one by one.)</p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-bold text-berry-600">Happy birthday, {people.nickname}! 🎂</p>
                  <button type="button" className="btn-ghost" onClick={redo}>
                    Decorate again
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
