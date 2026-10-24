import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clawMachine } from '../content/content';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { Duck } from '../art/Critters';
import { Sparkle } from '../art/Decor';
import type { LevelProps } from '.';

type Phase = 'idle' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'releasing';

const GLASS_H = 340;
const CLAW_H = 56;
const REST = 18;
const DUCK_SIZE = 64;
const DUCK_BOTTOM = 14;
const DROP = GLASS_H - DUCK_BOTTOM - DUCK_SIZE * 0.55 - CLAW_H;
const MIN_X = 10;
const MAX_X = 94;
const CHUTE_X = 7;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function Claw({ closed }: { closed: boolean }) {
  const a = closed ? 6 : 28;
  return (
    <svg viewBox="0 0 80 56" width="80" height={CLAW_H} aria-hidden="true" className="overflow-visible">
      <g style={{ transformOrigin: '30px 18px', transform: `rotate(${a}deg)`, transition: 'transform .3s' }}>
        <path d="M30 18 L18 40 L24 54" stroke="#7A1F3D" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g style={{ transformOrigin: '50px 18px', transform: `rotate(${-a}deg)`, transition: 'transform .3s' }}>
        <path d="M50 18 L62 40 L56 54" stroke="#7A1F3D" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="22" y="2" width="36" height="20" rx="9" fill="#E2688A" stroke="#7A1F3D" strokeWidth="3" />
      <circle cx="40" cy="12" r="4" fill="#F5CD6E" />
    </svg>
  );
}

export default function Level03Claw({ onComplete }: LevelProps) {
  const [x, setX] = useState(50);
  const [phase, setPhase] = useState<Phase>('idle');
  const [cable, setCable] = useState(REST);
  const [closed, setClosed] = useState(false);
  const [ducks, setDucks] = useState(() => clawMachine.duckPositions.map((p, id) => ({ id, x: p })));
  const [held, setHeld] = useState<number | null>(null); // duck id in the claw
  const [dropping, setDropping] = useState<number | null>(null); // duck falling into the chute
  const [prizes, setPrizes] = useState(0);
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const dir = useRef(0);
  const xRef = useRef(50);
  const phaseRef = useRef<Phase>('idle');
  const won = useRef(false);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);

  phaseRef.current = phase;
  xRef.current = x;

  // Smooth movement while a direction is held.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (dir.current && phaseRef.current === 'idle') {
        setX((v) => Math.max(MIN_X, Math.min(MAX_X, v + dir.current * clawMachine.clawSpeed * dt)));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drop = useCallback(async () => {
    if (phaseRef.current !== 'idle') return;
    dir.current = 0;
    setTries((t) => t + 1);
    setMessage(null);
    const cx = xRef.current;
    const target = ducks
      .map((d) => ({ d, dist: Math.abs(d.x - cx) }))
      .filter((o) => o.dist <= clawMachine.catchTolerance)
      .sort((a, b) => a.dist - b.dist)[0]?.d;

    sfx.whoosh();
    setPhase('dropping');
    setCable(DROP);
    await wait(950);
    if (!alive.current) return;
    setPhase('grabbing');
    setClosed(true);
    sfx.click();
    await wait(350);
    if (!alive.current) return;
    if (target) {
      setHeld(target.id);
      setDucks((ds) => ds.filter((d) => d.id !== target.id));
      sfx.good();
    }
    setPhase('rising');
    setCable(REST);
    await wait(950);
    if (!alive.current) return;

    if (!target) {
      setClosed(false);
      setPhase('idle');
      sfx.bonk();
      setMessage(clawMachine.missMessages[tries % clawMachine.missMessages.length]);
      return;
    }

    setPhase('returning');
    setX(CHUTE_X);
    await wait(1000);
    if (!alive.current) return;
    setPhase('releasing');
    setClosed(false);
    setHeld(null);
    setDropping(target.id);
    sfx.pop();
    await wait(600);
    if (!alive.current) return;
    setDropping(null);
    setPrizes((p) => p + 1);
    setMessage(clawMachine.winMessage);
    sfx.fanfare();
    burst({ x: 0.3, y: 0.6 });
    if (!won.current) {
      won.current = true;
      onComplete();
    }
    setPhase('idle');
  }, [ducks, onComplete, tries]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') dir.current = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dir.current = 1;
      else if (e.key === ' ' || e.key === 'ArrowDown') void drop();
      else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.current === -1) dir.current = 0;
      if ((e.key === 'ArrowRight' || e.key === 'd') && dir.current === 1) dir.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [drop]);

  const refill = () => {
    setDucks(clawMachine.duckPositions.map((p, id) => ({ id: id + 100 * (prizes + 1), x: p })));
    setMessage(null);
  };

  const holdProps = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      dir.current = d;
    },
    onPointerUp: () => (dir.current = 0),
    onPointerLeave: () => (dir.current = 0),
    onPointerCancel: () => (dir.current = 0),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') setX((v) => Math.max(MIN_X, Math.min(MAX_X, v + d * 4)));
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const busy = phase !== 'idle';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Machine */}
      <div className="w-full max-w-2xl select-none rounded-[32px] border-4 border-berry-600 bg-blush-300 p-3 shadow-pop sm:p-4">
        <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border-4 border-berry-600 bg-berry-600 py-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 animate-pulse rounded-full bg-honey-300" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
          <span className="px-2 font-display text-xl font-bold tracking-widest text-honey-200 sm:text-2xl">DUCK CATCHER 3000</span>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 animate-pulse rounded-full bg-honey-300" style={{ animationDelay: `${0.9 - i * 0.3}s` }} />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border-4 border-berry-600 bg-gradient-to-b from-[#E8F6FF] to-[#CFEAF7]" style={{ height: GLASS_H }} data-testid="claw-glass">
          {/* glass shine */}
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-24 -skew-x-12 bg-white/40" />
          {/* rail */}
          <div className="absolute inset-x-0 top-0 h-3 bg-cocoa-400" />
          {/* chute */}
          <div className="absolute bottom-0 left-0 z-10 flex h-24 w-[14%] min-w-[56px] flex-col items-center justify-end rounded-tr-xl border-r-4 border-t-4 border-berry-600 bg-berry-500/90 pb-2">
            <span className="font-display text-[10px] font-bold tracking-wider text-honey-200 sm:text-xs">PRIZE</span>
            <span className="text-lg">⬇</span>
          </div>
          {/* floor */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#9BD3EE] to-transparent" />

          {/* aim guide */}
          {phase === 'idle' && (
            <div className="absolute bottom-3 border-l-2 border-dashed border-berry-300/70" style={{ left: `${x}%`, top: REST + CLAW_H }} />
          )}

          {/* ducks */}
          {ducks.map((d, i) => (
            <div key={d.id} className="absolute" style={{ left: `${d.x}%`, bottom: DUCK_BOTTOM, transform: 'translateX(-50%)' }}>
              <Duck className="animate-bob" style={{ width: DUCK_SIZE, height: DUCK_SIZE, animationDelay: `${-i * 0.5}s` }} />
            </div>
          ))}

          {/* duck falling into chute */}
          <AnimatePresence>
            {dropping !== null && (
              <motion.div
                key="drop"
                className="absolute z-20"
                style={{ left: `${CHUTE_X}%`, x: '-50%' }}
                initial={{ top: REST + CLAW_H - 20 }}
                animate={{ top: GLASS_H - 50, opacity: 0.2, scale: 0.7 }}
                transition={{ duration: 0.55, ease: 'easeIn' }}
              >
                <Duck happy style={{ width: DUCK_SIZE, height: DUCK_SIZE }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* claw */}
          <div
            className="absolute top-0 z-20 flex flex-col items-center"
            style={{ left: `${x}%`, transform: 'translateX(-50%)', transition: phase === 'returning' ? 'left 0.9s ease-in-out' : 'none' }}
            data-testid="claw"
            data-x={x.toFixed(1)}
          >
            <div className="w-1.5 bg-cocoa-500" style={{ height: cable, transition: 'height 0.9s ease-in-out' }} />
            <div className="relative">
              <Claw closed={closed} />
              {held !== null && (
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: CLAW_H - 30 }}>
                  <Duck happy style={{ width: DUCK_SIZE, height: DUCK_SIZE }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3 sm:gap-5">
          <button type="button" className="btn-soft h-16 w-16 touch-none p-0 text-3xl" aria-label="Move claw left (hold)" disabled={busy} {...holdProps(-1)}>
            ◀
          </button>
          <button type="button" className="btn-primary h-16 px-8 text-2xl tracking-wider" onClick={() => void drop()} disabled={busy} data-testid="claw-drop">
            DROP ⬇
          </button>
          <button type="button" className="btn-soft h-16 w-16 touch-none p-0 text-3xl" aria-label="Move claw right (hold)" disabled={busy} {...holdProps(1)}>
            ▶
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip">🎯 Tries: {tries}</span>
        <span className="chip">
          🦆 Ducks won: {prizes}
          {prizes > 0 && <Sparkle className="h-4 w-4" />}
        </span>
        {ducks.length === 0 && phase === 'idle' && (
          <button type="button" className="btn-ghost" onClick={refill}>
            Refill the machine 🦆
          </button>
        )}
      </div>
      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500 sm:text-3xl" aria-live="polite">
        {message ?? (busy ? 'Ooooh…' : 'Hold ◀ ▶ (or arrow keys), then DROP!')}
      </p>
    </div>
  );
}
