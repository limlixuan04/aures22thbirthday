import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modernFamily as MF } from '../content/content';
import { pick, seeded } from '../lib/random';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { Pigeon } from '../art/Critters';
import type { LevelProps } from '.';

type Stage = 0 | 1 | 2 | 3; // 0 mud, 1 pigeon, 2 photographer, 3 done

const STAGE_NAMES = ['Mud fight', 'The pigeon', 'Say cheese'];

/* ---------------- Stage 1: wipe the mud off ---------------- */
function MudLayer({ onClean }: { onClean: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pct, setPct] = useState(0);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const c = canvas.current!;
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width);
    c.height = Math.round(rect.height);
    const ctx = c.getContext('2d')!;
    const r = seeded(7);
    ctx.fillStyle = '#6B4A2E';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = ['#7A5636', '#5A3A22', '#8A6440', '#4A2E1A'][i % 4];
      ctx.beginPath();
      ctx.arc(r() * c.width, r() * c.height, 8 + r() * c.width * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,246,234,0.85)';
    ctx.font = `bold ${Math.round(c.width * 0.09)}px "Bebas Neue", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MUD FIGHT!', c.width / 2, c.height * 0.48);
    ctx.font = `600 ${Math.round(c.width * 0.035)}px "Barlow Semi Condensed", sans-serif`;
    ctx.fillText('drag to wipe it clean 🧽', c.width / 2, c.height * 0.58);
  }, []);

  const measure = useCallback(() => {
    const c = canvas.current!;
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 37) {
      n++;
      if (data[i] < 40) clear++;
    }
    const p = clear / n;
    setPct(p);
    if (p >= MF.cleanTarget && !done.current) {
      done.current = true;
      onClean();
    }
  }, [onClean]);

  const wipe = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || done.current) return;
    const c = canvas.current!;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineWidth = c.width * 0.11;
    ctx.beginPath();
    const [lx, ly] = last.current ?? [x, y];
    ctx.moveTo(lx, ly);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    last.current = [x, y];
  };

  return (
    <>
      <canvas
        ref={canvas}
        className="absolute inset-0 h-full w-full cursor-grab touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = null;
          wipe(e);
        }}
        onPointerMove={wipe}
        onPointerUp={() => {
          drawing.current = false;
          measure();
        }}
        onPointerCancel={() => (drawing.current = false)}
        data-testid="mf-mud"
      />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 font-display text-sm font-bold text-cream-50">
        🧽 {Math.min(100, Math.round((pct / MF.cleanTarget) * 100))}% clean
      </div>
    </>
  );
}

/* ---------------- Stage 2: shoo the pigeon ---------------- */
function PigeonChase({ onShooed }: { onShooed: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [taps, setTaps] = useState(0);
  const [flap, setFlap] = useState(false);
  const [gone, setGone] = useState(false);

  // It wanders around on its own, too.
  useEffect(() => {
    if (gone) return;
    const id = window.setInterval(() => setPos({ x: 12 + Math.random() * 76, y: 15 + Math.random() * 70 }), 1100);
    return () => window.clearInterval(id);
  }, [gone]);

  const tap = () => {
    if (gone) return;
    const t = taps + 1;
    setTaps(t);
    setFlap(true);
    window.setTimeout(() => setFlap(false), 250);
    sfx.pop();
    if (t >= MF.pigeonTaps) {
      setGone(true);
      sfx.whoosh();
      window.setTimeout(onShooed, 900);
      return;
    }
    setPos({ x: 12 + Math.random() * 76, y: 15 + Math.random() * 70 });
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Shoo the pigeon"
        onPointerDown={(e) => {
          e.preventDefault();
          tap();
        }}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && tap()}
        className="absolute z-10 w-[17%] -translate-x-1/2 -translate-y-1/2"
        animate={gone ? { left: '120%', top: '-20%', rotate: -20 } : { left: `${pos.x}%`, top: `${pos.y}%`, rotate: 0 }}
        transition={gone ? { duration: 0.8, ease: 'easeIn' } : { type: 'spring', stiffness: 120, damping: 14 }}
        data-testid="mf-pigeon"
      >
        <Pigeon className="h-auto w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]" flap={flap || gone} />
      </motion.button>
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 font-display text-sm font-bold text-cream-50">
        🐦 {gone ? 'Gone!' : `${MF.pigeonTaps - taps} more taps`}
      </div>
    </>
  );
}

/* ---------------- Stage 3: the photographer ---------------- */
interface Bomb {
  id: number;
  emoji: string;
  line: string;
  x: number;
  y: number;
  until: number;
}

function Photographer({ onWin }: { onWin: () => void }) {
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [shots, setShots] = useState<boolean[]>([]); // true = clean
  const [flash, setFlash] = useState(0);
  const [say, setSay] = useState<string>(MF.stageLines[2]);
  const ids = useRef(0);
  const finished = useRef(false);
  const good = shots.filter(Boolean).length;
  const ruined = shots.filter((s) => !s).length;

  useEffect(() => {
    if (finished.current) return;
    // A photobomb happens, then once everyone's gone there's a guaranteed clear window to snap.
    let nextAt = Date.now() + 1200;
    const id = window.setInterval(() => {
      const now = Date.now();
      setBombs((bs) => {
        let next = bs.filter((b) => b.until > now);
        if (!next.length && nextAt === Infinity) nextAt = now + 900 + Math.random() * 800;
        if (!next.length && now >= nextAt) {
          const p = pick(MF.photobombers);
          const many = Math.random() < 0.35 ? 2 : 1;
          for (let k = 0; k < many; k++)
            next = [...next, { id: ++ids.current, emoji: p.emoji, line: p.line, x: 12 + Math.random() * 76, y: 18 + Math.random() * 64, until: now + 1000 + Math.random() * 1400 }];
          nextAt = Infinity;
        }
        return next;
      });
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  const snap = () => {
    if (finished.current) return;
    setFlash((f) => f + 1);
    sfx.click();
    const visible = bombs.filter((b) => b.until > Date.now());
    if (visible.length) {
      sfx.bonk();
      const next = [...shots, false];
      if (next.filter((s) => !s).length >= MF.maxRuined) {
        setShots([]);
        setSay(`${MF.maxRuined} ruined photos! Everybody reset. Again! 😩`);
      } else {
        setShots(next);
        setSay(`${visible[0].line} ${pick(MF.ruinedLines)}`);
      }
      return;
    }
    const next = [...shots, true];
    setShots(next);
    sfx.good();
    if (next.filter(Boolean).length >= MF.photosNeeded) {
      finished.current = true;
      setBombs([]);
      setSay(MF.winLine);
      window.setTimeout(onWin, 600);
    } else setSay(pick(MF.cleanShotLines));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault();
        snap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      {/* viewfinder */}
      <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-white/80">
        {['left-0 top-0 border-l-4 border-t-4', 'right-0 top-0 border-r-4 border-t-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-white ${c}`} />
        ))}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 font-mono text-xs text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#E2572B]" /> REC
        </span>
      </div>
      <AnimatePresence>
        {bombs.map((b) => (
          <motion.span
            key={b.id}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[clamp(40px,11vw,84px)] leading-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            data-testid="mf-bomb"
          >
            {b.emoji === '🐦' ? <Pigeon className="h-[1em] w-[1em]" flap /> : b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}
      </AnimatePresence>
      <div className="absolute inset-x-0 -bottom-[5.5rem] flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1" aria-label={`${good} of ${MF.photosNeeded} clean photos`}>
            {Array.from({ length: MF.photosNeeded }, (_, i) => (
              <span key={i} className={`grid h-9 w-9 place-items-center rounded-md border-2 text-lg ${i < good ? 'border-sage-500 bg-sage-200' : 'border-dashed border-blush-300 bg-cream-50'}`}>
                {i < good ? '🖼️' : ''}
              </span>
            ))}
          </div>
          <button type="button" onClick={snap} className="btn-primary px-6 text-xl" data-testid="mf-snap" data-ruined={ruined}>
            📸 SNAP
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-3 w-[85%] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-center font-display text-sm font-bold text-cream-50" aria-live="polite">
        {say} {ruined > 0 && `· Ruined ${ruined}/${MF.maxRuined}`}
      </div>
    </>
  );
}

/* ---------------- The level ---------------- */
export default function Level10ModernFamily({ onComplete }: LevelProps) {
  const [stage, setStage] = useState<Stage>(0);
  const completed = useRef(false);

  const advance = (to: Stage) => {
    sfx.success();
    burst({ x: 0.5, y: 0.5 });
    setStage(to);
    if (to === 3 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Portrait stages">
        {STAGE_NAMES.map((name, i) => (
          <li
            key={name}
            className={`rounded-full border-2 px-3 py-1 font-display text-sm font-semibold ${
              i < stage ? 'border-sage-400 bg-sage-200/60 text-berry-600' : i === stage ? 'border-berry-500 bg-blush-100 text-berry-600' : 'border-blush-200 bg-cream-50 text-berry-300'
            }`}
          >
            {i < stage ? '✓ ' : `${i + 1}. `}
            {name}
          </li>
        ))}
      </ol>
      {stage < 2 && <p className="text-center font-display text-lg font-semibold text-berry-600">{MF.stageLines[stage]}</p>}

      <div className={`w-full max-w-md ${stage === 2 ? 'mb-24' : ''}`}>
        {/* the "frame" */}
        <div className="rounded-sm border-[14px] border-[#8A5A3A] bg-[#8A5A3A] p-1 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5),inset_0_0_0_3px_#C8A27A]">
          <div className="relative w-full select-none overflow-visible bg-white" style={{ aspectRatio: String(MF.aspectRatio) }}>
            <div className="absolute inset-0 overflow-hidden">
              <img src={MF.image} alt="Family portrait" className="h-full w-full object-cover" draggable={false} />
            </div>
            <div className="absolute inset-0 overflow-hidden">
              {stage === 0 && <MudLayer onClean={() => advance(1)} />}
              {stage === 1 && <PigeonChase onShooed={() => advance(2)} />}
            </div>
            {stage === 2 && <Photographer onWin={() => advance(3)} />}
            {stage === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-x-0 bottom-3 flex justify-center">
                <span className="rounded-full bg-berry-600 px-4 py-1.5 font-sport text-xl tracking-wide text-honey-300 shadow-pop">The Perfect Family Portrait ✨</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="mx-auto h-3 w-24 rounded-b-md bg-[#6B4426]" aria-hidden="true" />
      </div>
      {stage === 2 && <p className="text-center text-sm text-cocoa-500">Wait for a clear moment, then SNAP (or press Space). {MF.maxRuined} ruined photos and everyone resets!</p>}
    </div>
  );
}
