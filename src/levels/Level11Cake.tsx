import { useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cake, people } from '../content/content';
import { sfx } from '../lib/sound';
import { celebrate } from '../lib/confetti';
import { seeded } from '../lib/random';
import { Sentences } from '../components/Sentences';
import { Bao, Duck } from '../art/Critters';
import type { LevelProps } from '.';

/* ------------------------------------------------------------------ options */

const RAINBOW = ['#FF6B8B', '#FFB347', '#FFE066', '#7ED957', '#6EC6FF', '#B28DFF'];
const NEON = ['#FF5FA8', '#5EC8FF', '#9BEA5A', '#FFE45C', '#B28DFF', '#FF8A3C'];

const FLAVOURS = [
  { id: 'vanilla', label: 'Vanilla bean', sponge: '#F6E3B4', filling: '#FFFDF8' },
  { id: 'choc', label: 'Chocolate fudge', sponge: '#6B4128', filling: '#3E2416' },
  { id: 'redvelvet', label: 'Red velvet', sponge: '#A8293D', filling: '#FFFDF8' },
  { id: 'matcha', label: 'Matcha', sponge: '#A9C98A', filling: '#FFF6EA' },
  { id: 'ube', label: 'Ube', sponge: '#9C7BC9', filling: '#F3EAFE' },
  { id: 'strawberry', label: 'Strawberry shortcake', sponge: '#FBE9C9', filling: '#E8435E' },
  { id: 'lemon', label: 'Lemon drizzle', sponge: '#FBE38A', filling: '#FFFBEA' },
  { id: 'funfetti', label: 'Funfetti', sponge: '#FFF1D6', filling: '#FFFDF8' },
] as const;

const FROSTINGS = [
  { name: 'Strawberry', color: '#F6B3C4' },
  { name: 'Vanilla', color: '#FFF1D6' },
  { name: 'Chocolate', color: '#9A6A50' },
  { name: 'Matcha', color: '#B9D8A7' },
  { name: 'Ube', color: '#CDB4E6' },
  { name: 'Berry', color: '#B4466A' },
  { name: 'Neon pink', color: '#FF5FA8' },
  { name: 'Electric blue', color: '#5EC8FF' },
  { name: 'Lemon', color: '#FFE45C' },
  { name: 'Mint', color: '#9BE8C8' },
  { name: 'Basketball', color: '#EE8A3C' },
  { name: 'RAINBOW', color: 'rainbow' },
];
const DRIPS = [
  { name: 'No drip', color: 'none' },
  { name: 'White choc', color: '#FFFDF8' },
  { name: 'Dark choc', color: '#5A3626' },
  { name: 'Pink', color: '#E2688A' },
  { name: 'Gold glitter', color: '#E9B44C' },
  { name: 'Neon green', color: '#9BEA5A' },
  { name: 'Blue raspberry', color: '#3FA7F5' },
  { name: 'Rainbow', color: 'rainbow' },
];
const SHAPES = [
  { id: 'round', label: 'Round', emoji: '⚪' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'heart', label: 'Heart', emoji: '🤍' },
] as const;
const PATTERNS = [
  { id: 'sprinkles', label: 'Sprinkles', emoji: '🌈' },
  { id: 'glitter', label: 'Glitter', emoji: '✨' },
  { id: 'confetti', label: 'Confetti', emoji: '🎉' },
  { id: 'pearls', label: 'Pearl trim', emoji: '🤍' },
] as const;
const STICKERS = [
  { id: 'strawberry', label: 'Strawberry' },
  { id: 'cherry', label: 'Cherry' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'flower', label: 'Flower' },
  { id: 'gem', label: 'Gem' },
  { id: 'eyes', label: 'Googly eyes' },
  { id: 'ball', label: 'Basketball' },
  { id: 'crown', label: 'Crown' },
  { id: 'unicorn', label: 'Unicorn horn' },
  { id: 'disco', label: 'Disco ball' },
  { id: 'rainbow', label: 'Rainbow' },
  { id: 'duck', label: 'Duck' },
  { id: 'bao', label: 'Bao' },
] as const;
const CANDLE_STYLES = [
  { id: 'classic', label: 'Classic', emoji: '🕯️' },
  { id: 'sparkler', label: 'Sparklers', emoji: '🎇' },
  { id: 'neon', label: 'Neon', emoji: '💡' },
] as const;
const CANDLE_COLOURS = ['#7EC8E3', '#F6B3C4', '#F5CD6E', '#A9D2A6', '#CDB4E6', '#FFFDF8'];

type Shape = (typeof SHAPES)[number]['id'];
type PatternId = (typeof PATTERNS)[number]['id'];
type StickerKind = (typeof STICKERS)[number]['id'];
type CandleStyle = (typeof CANDLE_STYLES)[number]['id'];

interface Sticker {
  id: number;
  kind: StickerKind;
  x: number;
  y: number;
}
interface Candle {
  id: number;
  x: number;
  y: number;
  color: string;
}
interface Design {
  flavour: string;
  shape: Shape;
  tiers: 1 | 2 | 3;
  frosting: string;
  drip: string;
  patterns: PatternId[];
  stickers: Sticker[];
  candles: Candle[];
  candleStyle: CandleStyle;
}

const START: Design = {
  flavour: 'vanilla',
  shape: 'round',
  tiers: 2,
  frosting: '#F6B3C4',
  drip: '#FFFDF8',
  patterns: ['sprinkles'],
  stickers: [],
  candles: [],
  candleStyle: 'classic',
};

/* ---------------------------------------------------------------- geometry */

const CX = 200;
const PLATE_Y = 362;

interface Tier {
  w: number;
  h: number;
  top: number; // y of the top face centre line
  bottom: number;
  ry: number; // depth of the top face
}

function tiersFor(n: number): Tier[] {
  const widths = n === 1 ? [270] : n === 2 ? [270, 180] : [280, 205, 135];
  const heights = n === 1 ? [130] : n === 2 ? [100, 80] : [82, 70, 60];
  let bottom = PLATE_Y - 10;
  return widths.map((w, i) => {
    const h = heights[i];
    const t = { w, h, top: bottom - h, bottom, ry: w * 0.1 };
    bottom = bottom - h + 2;
    return t;
  });
}

function shade(hex: string, amt: number) {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  return `#${((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
}

/** Heart outline centred on (cx, cy), width w, squashed vertically by k. */
function heartPath(cx: number, cy: number, w: number, k: number) {
  const s = w / 2;
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s * k).toFixed(1)}`;
  return `M${p(0, 0.75)} C${p(-0.55, 0.35)} ${p(-1.05, 0.05)} ${p(-0.95, -0.35)} C${p(-0.85, -0.8)} ${p(-0.25, -0.85)} ${p(0, -0.45)} C${p(0.25, -0.85)} ${p(0.85, -0.8)} ${p(0.95, -0.35)} C${p(1.05, 0.05)} ${p(0.55, 0.35)} ${p(0, 0.75)}Z`;
}

/** Y of the front edge of the top face at x (where drips hang from). */
function frontEdge(shape: Shape, t: Tier, x: number) {
  const dx = (x - CX) / (t.w / 2);
  if (shape === 'square') return t.top + t.ry;
  if (shape === 'heart') return t.top + t.ry * (0.75 - 0.4 * dx * dx);
  return t.top + t.ry * Math.sqrt(Math.max(0, 1 - dx * dx));
}

function dripPath(shape: Shape, t: Tier, seed: number) {
  const r = seeded(seed);
  const x0 = CX - t.w / 2 + (shape === 'heart' ? t.w * 0.06 : 0);
  const x1 = CX + t.w / 2 - (shape === 'heart' ? t.w * 0.06 : 0);
  const n = Math.max(6, Math.round(t.w / 30));
  let d = `M${x0} ${frontEdge(shape, t, x0) - 4}`;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const base = frontEdge(shape, t, x);
    const len = 8 + r() * Math.min(26, t.h * 0.45);
    d += ` L${x - 5} ${base} Q${x - 5} ${base + len} ${x} ${base + len} Q${x + 5} ${base + len} ${x + 5} ${base}`;
  }
  d += ` L${x1} ${frontEdge(shape, t, x1) - 4} Z`;
  return d;
}

/** Is a point on (roughly) the top face of tier t? */
function onTop(shape: Shape, t: Tier, x: number, y: number) {
  const dx = (x - CX) / (t.w / 2);
  const dy = (y - t.top) / t.ry;
  if (shape === 'square') return Math.abs(dx) <= 0.95 && Math.abs(dy) <= 1;
  return dx * dx + dy * dy <= 1.1;
}

/* ------------------------------------------------------------------ artwork */

function StickerArt({ kind }: { kind: StickerKind }): ReactNode {
  switch (kind) {
    case 'strawberry':
      return (
        <g>
          <path d="M0 14 C-12 6 -11 -6 0 -4 C11 -6 12 6 0 14Z" fill="#E8435E" stroke="#A8293D" strokeWidth="1.5" />
          <path d="M-6 -5 L0 -10 L6 -5 L0 -3Z" fill="#5E9A66" />
          <circle cx="-3" cy="2" r=".9" fill="#FFE9A8" />
          <circle cx="3" cy="5" r=".9" fill="#FFE9A8" />
        </g>
      );
    case 'cherry':
      return (
        <g>
          <path d="M0 -4 Q3 -14 9 -16" stroke="#5E9A66" strokeWidth="1.8" fill="none" />
          <circle r="7" fill="#D7263D" stroke="#8E1428" strokeWidth="1.2" />
          <circle cx="-2.5" cy="-2.5" r="1.8" fill="#fff" opacity=".7" />
        </g>
      );
    case 'heart':
      return <path transform="translate(-10 -10) scale(.85)" d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2.2 0 3.6 1.2 5 3 1.4-1.8 2.8-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" fill="#E2688A" stroke="#7A1F3D" strokeWidth="1.5" />;
    case 'star':
      return <path transform="translate(-11 -11) scale(.92)" d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="#F5CD6E" stroke="#C8901A" strokeWidth="1" />;
    case 'flower':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="4.5" ry="6.5" fill="#FF5FA8" stroke="#00000022" transform={`rotate(${a})`} />
          ))}
          <circle r="3.8" fill="#F5CD6E" />
        </g>
      );
    case 'gem':
      return (
        <g>
          <path d="M0 -8 L7 -2 L0 9 L-7 -2Z" fill="#5EC8FF" stroke="#fff" strokeWidth="1" />
          <path d="M-7 -2 L7 -2 M0 -8 L-2 -2 L0 9 M0 -8 L2 -2" stroke="#fff" strokeWidth=".7" opacity=".8" />
        </g>
      );
    case 'eyes':
      return (
        <g>
          {[-11, 11].map((x) => (
            <g key={x}>
              <circle cx={x} cy="0" r="9" fill="#fff" stroke="#2A1A20" strokeWidth="1.8" />
              <circle cx={x + 2} cy="3" r="4" fill="#2A1A20" />
            </g>
          ))}
        </g>
      );
    case 'ball':
      return (
        <g transform="translate(-16 -16) scale(.68)">
          <circle cx="24" cy="24" r="21" fill="#EE8A3C" stroke="#5A2A12" strokeWidth="2.5" />
          <path d="M24 3 V45 M3 24 H45 M9.5 8.5 C17 15 17 33 9.5 39.5 M38.5 8.5 C31 15 31 33 38.5 39.5" stroke="#5A2A12" strokeWidth="2.2" fill="none" />
        </g>
      );
    case 'crown':
      return (
        <g transform="translate(-36 -30) scale(1)">
          <path d="M4 50 L0 10 L20 30 L36 0 L52 30 L72 10 L68 50Z" fill="#F5CD6E" stroke="#C8901A" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="20" cy="40" r="4.5" fill="#D7263D" stroke="#fff" />
          <circle cx="36" cy="38" r="4.5" fill="#5EC8FF" stroke="#fff" />
          <circle cx="52" cy="40" r="4.5" fill="#9BEA5A" stroke="#fff" />
        </g>
      );
    case 'unicorn':
      return (
        <g>
          <path d="M-12 30 L0 -40 L12 30Z" fill="#FBE3A6" stroke="#C8901A" strokeWidth="2" strokeLinejoin="round" />
          <path d="M-9 12 L9 6 M-6 -6 L6 -11 M-3 -22 L3 -26" stroke="#E9B44C" strokeWidth="2.5" />
        </g>
      );
    case 'disco':
      return (
        <g>
          <circle r="22" fill="#C9CBD3" stroke="#5A5A66" strokeWidth="2" />
          {[5, 11, 17].map((ry) => (
            <ellipse key={ry} rx="22" ry={ry} fill="none" stroke="#5A5A66" strokeOpacity=".35" />
          ))}
          {[6, 13].map((rx) => (
            <ellipse key={rx} rx={rx} ry="22" fill="none" stroke="#5A5A66" strokeOpacity=".35" />
          ))}
          <circle cx="-8" cy="-8" r="5" fill="#fff" opacity=".8" />
        </g>
      );
    case 'rainbow':
      return (
        <g>
          {RAINBOW.map((c, i) => (
            <path key={c} d={`M${-(40 - i * 5)} 10 A${40 - i * 5} ${40 - i * 5} 0 0 1 ${40 - i * 5} 10`} stroke={c} strokeWidth="5" fill="none" />
          ))}
        </g>
      );
    case 'duck':
      return (
        <g transform="translate(-18 -20)">
          <Duck className="" width={36} height={36} />
        </g>
      );
    case 'bao':
      return (
        <g transform="translate(-18 -20)">
          <Bao className="" width={36} height={36} />
        </g>
      );
  }
}

function StickerIcon({ kind }: { kind: StickerKind }) {
  const big = ['crown', 'unicorn', 'disco', 'rainbow'].includes(kind);
  return (
    <svg viewBox={big ? '-45 -45 90 90' : '-20 -20 40 40'} className="h-9 w-9" aria-hidden="true">
      <StickerArt kind={kind} />
    </svg>
  );
}

/* -------------------------------------------------------------------- level */

export default function Level11Cake({ onComplete }: LevelProps) {
  const [design, setDesign] = useState<Design>(START);
  const [history, setHistory] = useState<Design[]>([]);
  const [phase, setPhase] = useState<'decorate' | 'lit' | 'blown'>('decorate');
  const [lit, setLit] = useState<number[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ sticker: Sticker; isNew: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ids = useRef(1);
  const completed = useRef(false);

  const tiers = useMemo(() => tiersFor(design.tiers), [design.tiers]);
  const topTier = tiers[tiers.length - 1];
  const flavour = FLAVOURS.find((f) => f.id === design.flavour)!;

  /** Every change goes through here so it can be undone. */
  // A ref keeps the latest design so drag handlers (attached to window) never use a stale copy.
  const designRef = useRef(design);
  designRef.current = design;
  const change = (fn: (d: Design) => Design) => {
    const prev = designRef.current;
    const next = fn(prev);
    designRef.current = next;
    setHistory((h) => [...h.slice(-60), prev]);
    setDesign(next);
  };
  const undo = () => {
    if (!history.length || phase !== 'decorate') return;
    sfx.click();
    setDesign(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const toSvg = (clientX: number, clientY: number) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };
  const onCake = (x: number, y: number) => {
    const bottom = tiers[0];
    return x > CX - bottom.w / 2 - 10 && x < CX + bottom.w / 2 + 10 && y > topTier.top - topTier.ry - 50 && y < PLATE_Y + 10;
  };

  // patterns are generated per tier so they follow shape / tier changes
  const patternDots = useMemo(() => {
    const r = seeded(11 + design.tiers * 7);
    return tiers.flatMap((t, ti) =>
      Array.from({ length: Math.round(t.w / 9) }, () => {
        const x = CX - t.w / 2 + 10 + r() * (t.w - 20);
        const y = frontEdge(design.shape, t, x) + 6 + r() * (t.h - 12);
        return { x, y, rot: r() * 180, c: RAINBOW[Math.floor(r() * RAINBOW.length)], ti, s: 0.35 + r() * 0.4 };
      }),
    );
  }, [tiers, design.shape, design.tiers]);

  /* -------- candles -------- */
  const addCandleAt = (x: number, y: number) => {
    if (design.candles.length >= cake.maxCandles) {
      setTip(`That’s ${cake.maxCandles} candles, one for every year! 🕯️`);
      sfx.bonk();
      return;
    }
    sfx.pop();
    setTip(null);
    change((d) => ({ ...d, candles: [...d.candles, { id: ids.current++, x, y, color: CANDLE_COLOURS[ids.current % CANDLE_COLOURS.length] }] }));
  };
  const randomTopSpot = (r: () => number = Math.random) => {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 0.75;
    return { x: CX + Math.cos(a) * (topTier.w / 2) * rad, y: topTier.top + Math.sin(a) * topTier.ry * rad };
  };
  const fill22 = () => {
    sfx.success();
    const r = seeded(Date.now());
    change((d) => ({
      ...d,
      candles: [...d.candles, ...Array.from({ length: cake.maxCandles - d.candles.length }, (_, i) => ({ id: ids.current++, ...randomTopSpot(r), color: CANDLE_COLOURS[i % CANDLE_COLOURS.length] }))],
    }));
  };

  /* -------- stickers (drag & drop) -------- */
  const startNewSticker = (kind: StickerKind, e: React.PointerEvent) => {
    if (phase !== 'decorate') return;
    e.preventDefault();
    const p = toSvg(e.clientX, e.clientY);
    const nd = { sticker: { id: ids.current++, kind, x: p.x, y: p.y }, isNew: true };
    dragRef.current = nd;
    setDrag(nd);
    beginWindowDrag();
    dragMeta.current = { moved: false, sx: e.clientX, sy: e.clientY, kind };
  };
  const startMoveSticker = (s: Sticker, e: React.PointerEvent) => {
    if (phase !== 'decorate') return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { sticker: s, isNew: false };
    setDrag({ sticker: s, isNew: false });
    beginWindowDrag();
    dragMeta.current = { moved: false, sx: e.clientX, sy: e.clientY, kind: s.kind };
  };
  const dragMeta = useRef<{ moved: boolean; sx: number; sy: number; kind: StickerKind }>({ moved: false, sx: 0, sy: 0, kind: 'heart' });
  const dragRef = useRef(drag);
  dragRef.current = drag;

  const handlers = useRef({ move: (_e: PointerEvent) => {}, up: (_e: PointerEvent) => {} });
  const beginWindowDrag = () => {
    const move = (e: PointerEvent) => handlers.current.move(e);
    const up = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      handlers.current.up(e);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  };
  const onWindowMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.hypot(e.clientX - dragMeta.current.sx, e.clientY - dragMeta.current.sy) > 5) dragMeta.current.moved = true;
    const p = toSvg(e.clientX, e.clientY);
    const next = { ...d, sticker: { ...d.sticker, x: p.x, y: p.y } };
    dragRef.current = next;
    setDrag(next);
  };
  const onWindowUp = (e: PointerEvent) => {
    const d = dragRef.current;
    setDrag(null);
    if (!d) return;
    const p = toSvg(e.clientX, e.clientY);
    if (d.isNew && !dragMeta.current.moved) {
      // a tap on the palette: drop it somewhere on the front of the cake
      const t = tiers[Math.floor(Math.random() * tiers.length)];
      const x = CX + (Math.random() - 0.5) * t.w * 0.7;
      const y = frontEdge(designRef.current.shape, t, x) + 10 + Math.random() * (t.h - 24);
      sfx.pop();
      change((dd) => ({ ...dd, stickers: [...dd.stickers, { ...d.sticker, x, y }] }));
      return;
    }
    if (!onCake(p.x, p.y)) {
      if (!d.isNew) {
        sfx.whoosh();
        change((dd) => ({ ...dd, stickers: dd.stickers.filter((s) => s.id !== d.sticker.id) }));
        setTip('Topping removed. (Drag it off the cake to bin it.)');
      }
      return;
    }
    sfx.pop();
    change((dd) => ({
      ...dd,
      stickers: d.isNew ? [...dd.stickers, { ...d.sticker, x: p.x, y: p.y }] : dd.stickers.map((s) => (s.id === d.sticker.id ? { ...s, x: p.x, y: p.y } : s)),
    }));
  };

  handlers.current = { move: onWindowMove, up: onWindowUp };

  const onCakeClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (phase !== 'decorate') return;
    const p = toSvg(e.clientX, e.clientY);
    if (onTop(design.shape, topTier, p.x, p.y)) addCandleAt(p.x, Math.min(p.y, topTier.top + topTier.ry - 2));
    else setTip('Tap the very top of the cake to add a candle. Drag toppings anywhere! ⬆️');
  };

  /* -------- lighting & blowing -------- */
  const light = () => {
    if (!design.candles.length) {
      setTip('Add at least one candle first! 🕯️');
      sfx.bonk();
      return;
    }
    sfx.whoosh();
    setTip(null);
    setLit(design.candles.map((c) => c.id));
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
    const next = lit.filter((x) => x !== id);
    setLit(next);
    if (!next.length) finish();
  };
  const blowAll = () => {
    sfx.whoosh();
    setLit([]);
    finish();
  };
  const redo = () => {
    setPhase('decorate');
    setLit([]);
  };

  /* -------- render helpers -------- */
  const isRainbow = design.frosting === 'rainbow';
  const sideFill = isRainbow ? 'url(#cake-rainbow)' : shade(design.frosting, -0.12);
  const topFill = isRainbow ? 'url(#cake-rainbow-top)' : design.frosting;
  const dripFill = design.drip === 'rainbow' ? 'url(#drip-rainbow)' : design.drip;
  const swatch = (c: string) =>
    c === 'rainbow'
      ? { background: `linear-gradient(135deg, ${RAINBOW.join(', ')})` }
      : c === 'none'
        ? { background: 'repeating-linear-gradient(45deg, #fff 0 4px, #E8D5B8 4px 8px)' }
        : { background: c };
  const has = (p: PatternId) => design.patterns.includes(p);

  const tierShapes = (t: Tier, i: number) => {
    const x0 = CX - t.w / 2;
    if (design.shape === 'square') {
      return (
        <g key={i}>
          <rect x={x0} y={t.top} width={t.w} height={t.h} rx="6" fill={sideFill} />
          <rect x={x0} y={t.top - t.ry} width={t.w} height={t.ry * 2} rx="6" fill={topFill} />
        </g>
      );
    }
    if (design.shape === 'heart') {
      const steps = Math.ceil(t.h / 2);
      return (
        <g key={i}>
          {Array.from({ length: steps + 1 }, (_, k) => (
            <path key={k} d={heartPath(CX, t.bottom - (t.h * k) / steps - t.ry * 0.1, t.w, 0.42)} fill={sideFill} />
          ))}
          <path d={heartPath(CX, t.top - t.ry * 0.1, t.w, 0.42)} fill={topFill} />
        </g>
      );
    }
    return (
      <g key={i}>
        <path d={`M${x0} ${t.top} L${x0} ${t.bottom} A${t.w / 2} ${t.ry} 0 0 0 ${x0 + t.w} ${t.bottom} L${x0 + t.w} ${t.top}Z`} fill={sideFill} />
        <ellipse cx={CX} cy={t.top} rx={t.w / 2} ry={t.ry} fill={topFill} />
      </g>
    );
  };

  const sorted = [...design.candles].sort((a, b) => a.y - b.y);
  const showStickers = drag && !drag.isNew ? design.stickers.filter((s) => s.id !== drag.sticker.id) : design.stickers;

  return (
    <div className="flex select-none flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center" onMouseDown={(e) => drag && e.preventDefault()}>
      {/* Cake */}
      <div className="w-full max-w-[460px] lg:sticky lg:top-24">
        <div className={`relative rounded-[28px] border-4 border-berry-600 p-2 shadow-pop transition-colors duration-700 ${phase === 'lit' ? 'bg-berry-800' : 'bg-blush-100'}`}>
          <svg
            ref={svgRef}
            viewBox="0 0 400 400"
            className={`block w-full touch-none ${phase === 'decorate' ? 'cursor-copy' : ''}`}
            onClick={onCakeClick}
            role="img"
            aria-label={`Your ${design.tiers}-tier ${design.shape} ${flavour.label} cake with ${design.candles.length} candles`}
            data-testid="cake-svg"
          >
            <defs>
              <radialGradient id="candle-glow">
                <stop offset="0" stopColor="#FFD98A" stopOpacity=".55" />
                <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cake-rainbow" gradientUnits="userSpaceOnUse" x1="0" y1={topTier.top} x2="0" y2={tiers[0].bottom + tiers[0].ry}>
                {RAINBOW.map((c, i) => [
                  <stop key={`a${i}`} offset={i / RAINBOW.length} stopColor={c} />,
                  <stop key={`b${i}`} offset={(i + 1) / RAINBOW.length} stopColor={c} />,
                ])}
              </linearGradient>
              <linearGradient id="cake-rainbow-top" x1="0" y1="0" x2="1" y2="0">
                {RAINBOW.map((c, i) => (
                  <stop key={i} offset={i / (RAINBOW.length - 1)} stopColor={c} stopOpacity=".8" />
                ))}
              </linearGradient>
              <linearGradient id="drip-rainbow" x1="0" y1="0" x2="1" y2="0">
                {RAINBOW.map((c, i) => (
                  <stop key={i} offset={i / (RAINBOW.length - 1)} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
            {phase === 'lit' && <ellipse cx="200" cy="140" rx="200" ry="160" fill="url(#candle-glow)" />}

            {/* plate */}
            <ellipse cx="200" cy={PLATE_Y} rx="182" ry="26" fill="#fff" stroke="#E6D7CF" strokeWidth="3" />

            {/* tiers, bottom first, each followed by its own drip and decorations */}
            {tiers.map((t, i) => (
              <g key={`tier-${i}`}>
                {tierShapes(t, i)}
                {design.drip !== 'none' && <path d={dripPath(design.shape, t, 3 + i * 5)} fill={dripFill} />}
                {has('pearls') &&
                  Array.from({ length: Math.round(t.w / 17) }, (_, k) => {
                    const x = CX - t.w / 2 + 8 + ((t.w - 16) * k) / (Math.round(t.w / 17) - 1);
                    const y = design.shape === 'square' ? t.bottom - 3 : design.shape === 'heart' ? t.bottom - t.ry * 0.3 : t.bottom + t.ry * Math.sqrt(Math.max(0, 1 - ((x - CX) / (t.w / 2)) ** 2)) - 3;
                    return <circle key={k} cx={x} cy={y} r="4.5" fill="#FFFDF8" stroke="#E6D7CF" />;
                  })}
                {patternDots
                  .filter((d) => d.ti === i)
                  .map((d, k) =>
                    has('sprinkles') && k % 2 === 0 ? (
                      <rect key={`s${k}`} x={d.x} y={d.y} width="7" height="2.6" rx="1.3" fill={d.c} transform={`rotate(${d.rot} ${d.x} ${d.y})`} />
                    ) : has('confetti') && k % 2 === 1 ? (
                      <circle key={`c${k}`} cx={d.x} cy={d.y} r="2.6" fill={d.c} />
                    ) : has('glitter') && k % 3 === 0 ? (
                      <path
                        key={`g${k}`}
                        transform={`translate(${d.x} ${d.y}) scale(${d.s}) translate(-12 -12)`}
                        d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z"
                        fill="#FFF6C9"
                        className="animate-pulse"
                      />
                    ) : null,
                  )}
              </g>
            ))}

            {/* plaque on the bottom tier */}
            <g>
              <rect x={CX - 88} y={tiers[0].bottom - 46} width="176" height="34" rx="12" fill="#FFFDF8" stroke="#C25B7A" strokeWidth="2.5" />
              <text x={CX} y={tiers[0].bottom - 23} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight="700" fontSize="22" fill="#7A1F3D">
                {cake.plaque}
              </text>
            </g>

            {/* stickers */}
            {showStickers.map((s) => (
              <g
                key={s.id}
                transform={`translate(${s.x} ${s.y})`}
                onPointerDown={(e) => startMoveSticker(s, e)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: phase === 'decorate' ? 'grab' : undefined }}
                data-testid="cake-sticker"
              >
                <StickerArt kind={s.kind} />
              </g>
            ))}

            {/* candles */}
            {sorted.map((c) => {
              const isLit = lit.includes(c.id);
              return (
                <g key={c.id} onClick={(e) => (phase === 'lit' ? (e.stopPropagation(), blowOne(c.id)) : undefined)} style={{ cursor: phase === 'lit' ? 'pointer' : undefined }}>
                  {design.candleStyle === 'sparkler' ? (
                    <>
                      <line x1={c.x} y1={c.y} x2={c.x} y2={c.y - 46} stroke="#8C8C94" strokeWidth="2.5" strokeLinecap="round" />
                      {isLit && (
                        <g className="animate-spin" style={{ transformOrigin: `${c.x}px ${c.y - 48}px`, transformBox: 'view-box', animationDuration: '0.6s' } as React.CSSProperties}>
                          <circle cx={c.x} cy={c.y - 48} r="9" fill="#FFF6C9" opacity=".55" />
                          {Array.from({ length: 10 }, (_, k) => (
                            <line key={k} x1={c.x} y1={c.y - 48} x2={c.x + Math.cos((k * Math.PI) / 5) * (10 + (k % 3) * 5)} y2={c.y - 48 + Math.sin((k * Math.PI) / 5) * (10 + (k % 3) * 5)} stroke={k % 2 ? '#F5CD6E' : '#FFFFFF'} strokeWidth="1.6" strokeLinecap="round" />
                          ))}
                        </g>
                      )}
                    </>
                  ) : (
                    <>
                      <rect
                        x={c.x - 4}
                        y={c.y - 38}
                        width="8"
                        height="38"
                        rx="3"
                        fill={design.candleStyle === 'neon' ? NEON[c.id % NEON.length] : c.color}
                        stroke={design.candleStyle === 'neon' ? '#fff' : shade(c.color, -0.3)}
                        strokeWidth="1.2"
                        style={design.candleStyle === 'neon' ? { filter: `drop-shadow(0 0 4px ${NEON[c.id % NEON.length]})` } : undefined}
                      />
                      {design.candleStyle === 'classic' && <path d={`M${c.x - 4} ${c.y - 30} l8 -5 M${c.x - 4} ${c.y - 18} l8 -5 M${c.x - 4} ${c.y - 6} l8 -5`} stroke="#fff" strokeWidth="1.8" opacity=".7" />}
                      <line x1={c.x} y1={c.y - 38} x2={c.x} y2={c.y - 43} stroke="#45101F" strokeWidth="1.5" />
                      {isLit && (
                        <g className="animate-flicker" style={{ transformOrigin: `${c.x}px ${c.y - 42}px`, transformBox: 'view-box' } as React.CSSProperties}>
                          <ellipse cx={c.x} cy={c.y - 52} rx="9" ry="13" fill="#F5CD6E" opacity=".35" />
                          <path d={`M${c.x} ${c.y - 64} C${c.x + 7} ${c.y - 54} ${c.x + 5} ${c.y - 44} ${c.x} ${c.y - 43} C${c.x - 5} ${c.y - 44} ${c.x - 7} ${c.y - 54} ${c.x} ${c.y - 64}Z`} fill="#FFB43C" />
                          <path d={`M${c.x} ${c.y - 56} C${c.x + 3} ${c.y - 51} ${c.x + 2} ${c.y - 46} ${c.x} ${c.y - 45} C${c.x - 2} ${c.y - 46} ${c.x - 3} ${c.y - 51} ${c.x} ${c.y - 56}Z`} fill="#FFF6C9" />
                        </g>
                      )}
                    </>
                  )}
                  {!isLit && phase !== 'decorate' && (
                    <motion.path d={`M${c.x} ${c.y - 44} q-6 -8 0 -16 q6 -8 0 -16`} stroke="#C8B6B0" strokeWidth="2.5" fill="none" strokeLinecap="round" initial={{ opacity: 0.9, y: 0 }} animate={{ opacity: 0, y: -20 }} transition={{ duration: 1.6 }} />
                  )}
                </g>
              );
            })}

            {/* sticker being dragged */}
            {drag && (
              <g transform={`translate(${drag.sticker.x} ${drag.sticker.y}) scale(1.15)`} opacity=".9" pointerEvents="none">
                <StickerArt kind={drag.sticker.kind} />
              </g>
            )}

            {phase === 'decorate' && design.candles.length === 0 && (
              <ellipse cx={CX} cy={topTier.top} rx={topTier.w / 2 - 10} ry={topTier.ry - 4} fill="none" stroke="#7A1F3D" strokeWidth="2" strokeDasharray="6 6" opacity=".45" className="animate-pulse" pointerEvents="none" />
            )}
          </svg>

          {/* flavour slice */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-cream-50/90 py-1 pl-1 pr-3 shadow" title="Flavour">
            <svg viewBox="0 0 40 30" className="h-6 w-8" aria-hidden="true">
              <path d="M2 10 L38 4 L38 26 L2 26Z" fill={flavour.sponge} stroke="#00000033" />
              <path d="M2 16 L38 13 L38 16 L2 19Z" fill={flavour.filling} />
              <path d="M2 10 L38 4 L38 7 L2 13Z" fill={isRainbow ? RAINBOW[0] : design.frosting} />
              {flavour.id === 'funfetti' && [6, 14, 22, 30].map((x, i) => <rect key={x} x={x} y={20 - (i % 2) * 2} width="3" height="1.5" fill={RAINBOW[i]} />)}
            </svg>
            <span className="font-display text-xs font-semibold text-berry-600">{flavour.label}</span>
          </div>
        </div>
        <p className="mt-3 min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
          <Sentences text={phase === 'lit' ? cake.wishPrompt : phase === 'blown' ? cake.afterBlow : (tip ?? `🕯️ ${design.candles.length} / ${cake.maxCandles} candles`)} />
        </p>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {phase === 'decorate' ? (
            <motion.div key="deco" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
              <div className="flex justify-end">
                <button type="button" className="btn-soft px-4 py-1.5 text-base" onClick={undo} disabled={!history.length} data-testid="cake-undo">
                  ↶ Undo
                </button>
              </div>

              <Section title="Flavour">
                <div className="grid grid-cols-2 gap-2">
                  {FLAVOURS.map((f) => (
                    <Chip key={f.id} active={design.flavour === f.id} onClick={() => change((d) => ({ ...d, flavour: f.id }))}>
                      <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: f.sponge }} /> {f.label}
                    </Chip>
                  ))}
                </div>
              </Section>

              <div className="grid grid-cols-2 gap-4">
                <Section title="Shape">
                  <div className="flex flex-wrap gap-2">
                    {SHAPES.map((sh) => (
                      <Chip key={sh.id} active={design.shape === sh.id} onClick={() => change((d) => ({ ...d, shape: sh.id, candles: [] }))}>
                        {sh.emoji} {sh.label}
                      </Chip>
                    ))}
                  </div>
                </Section>
                <Section title="Tiers">
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((n) => (
                      <Chip key={n} active={design.tiers === n} onClick={() => change((d) => ({ ...d, tiers: n, candles: [] }))}>
                        {n}
                      </Chip>
                    ))}
                  </div>
                </Section>
              </div>

              <Section title="Frosting">
                <div className="flex flex-wrap gap-2">
                  {FROSTINGS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        sfx.click();
                        change((d) => ({ ...d, frosting: f.color }));
                      }}
                      aria-pressed={design.frosting === f.color}
                      aria-label={`${f.name} frosting`}
                      title={f.name}
                      className={`h-9 w-9 rounded-full border-4 transition hover:scale-110 ${design.frosting === f.color ? 'scale-110 border-berry-600' : 'border-white shadow'}`}
                      style={swatch(f.color)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Drip">
                <div className="flex flex-wrap gap-2">
                  {DRIPS.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        sfx.click();
                        change((dd) => ({ ...dd, drip: d.color }));
                      }}
                      aria-pressed={design.drip === d.color}
                      aria-label={`${d.name}`}
                      title={d.name}
                      className={`h-9 w-9 rounded-full border-4 transition hover:scale-110 ${design.drip === d.color ? 'scale-110 border-berry-600' : 'border-white shadow'}`}
                      style={swatch(d.color)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Finish">
                <div className="grid grid-cols-2 gap-2">
                  {PATTERNS.map((p) => (
                    <Chip
                      key={p.id}
                      active={has(p.id)}
                      onClick={() => change((d) => ({ ...d, patterns: d.patterns.includes(p.id) ? d.patterns.filter((x) => x !== p.id) : [...d.patterns, p.id] }))}
                    >
                      {p.emoji} {p.label}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section title="Toppings: drag them onto the cake">
                <div className="grid grid-cols-7 gap-1.5">
                  {STICKERS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onPointerDown={(e) => startNewSticker(st.id, e)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="grid aspect-square cursor-grab touch-none place-items-center rounded-xl border-2 border-blush-200 bg-white transition hover:-translate-y-0.5 hover:border-blush-400 active:cursor-grabbing"
                      aria-label={`${st.label}: drag onto the cake, or tap to add`}
                      title={st.label}
                      data-testid={`sticker-${st.id}`}
                    >
                      <StickerIcon kind={st.id} />
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-cocoa-500">Tap one to add it. Drag a topping off the cake to remove it.</p>
              </Section>

              <Section title={`Candles (${design.candles.length})`}>
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {CANDLE_STYLES.map((c) => (
                    <Chip key={c.id} active={design.candleStyle === c.id} onClick={() => change((d) => ({ ...d, candleStyle: c.id }))}>
                      {c.emoji} {c.label}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-soft px-4 py-2 text-base"
                    onClick={() => {
                      const s = randomTopSpot();
                      addCandleAt(s.x, s.y);
                    }}
                    data-testid="add-candle"
                  >
                    + Add one
                  </button>
                  <button type="button" className="btn-soft px-4 py-2 text-base" onClick={fill22} disabled={design.candles.length >= cake.maxCandles}>
                    All {cake.maxCandles}!
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => change((d) => ({ ...d, candles: [] }))} disabled={!design.candles.length}>
                    Clear
                  </button>
                </div>
              </Section>

              <button type="button" className="btn-primary text-xl" onClick={light} data-testid="light-candles">
                🔥 Done! Light the candles
              </button>
            </motion.div>
          ) : (
            <motion.div key="blow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-4 pt-4 text-center lg:pt-24">
              {phase === 'lit' ? (
                <>
                  <button type="button" className="btn-primary px-10 py-4 text-2xl" onClick={blowAll} data-testid="blow">
                    🌬️ Blow!
                  </button>
                  <p className="text-sm text-cocoa-500">(Or tap the flames one by one.)</p>
                </>
              ) : (
                <>
                  <p className="font-sport text-4xl tracking-wide text-berry-600">Happy birthday, {people.nickname}! 🎂</p>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-display font-semibold text-berry-600">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.pop();
        onClick();
      }}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-2xl border-2 px-2.5 py-1.5 text-left font-display text-sm font-medium transition ${
        active ? 'border-berry-500 bg-blush-200 text-berry-700' : 'border-blush-200 bg-white text-berry-500 hover:bg-blush-50'
      }`}
    >
      {children}
    </button>
  );
}
