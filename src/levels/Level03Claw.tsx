import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clawMachine } from '../content/content';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { pick } from '../lib/random';
import { Duck } from '../art/Critters';
import { Sparkle } from '../art/Decor';
import type { LevelProps } from '.';

type Phase = 'idle' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'releasing';

interface SwimmingDuck {
  id: number;
  x: number;
  v: number; // % per second, sign = direction
  rainbow: boolean;
  dropIn?: boolean;
}

const GLASS_H = 340;
const CLAW_H = 56;
const REST = 18;
const DUCK_SIZE = 64;
const DUCK_BOTTOM = 14;
const DROP = GLASS_H - DUCK_BOTTOM - DUCK_SIZE * 0.55 - CLAW_H;
const MIN_X = 10;
const MAX_X = 94;
const CHUTE_X = 7;
const SWIM_MIN = 22;
const SWIM_MAX = 92;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function freshDucks(): SwimmingDuck[] {
  return clawMachine.duckPositions.map((x, i) => {
    const rainbow = i === clawMachine.rainbowDuck;
    const speed = rainbow ? clawMachine.rainbowSpeed : clawMachine.duckSpeed * (0.75 + ((i * 37) % 10) / 20);
    return { id: i, x, v: (i % 2 ? -1 : 1) * speed, rainbow };
  });
}

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
  const [, setFrame] = useState(0);
  const [held, setHeld] = useState<SwimmingDuck | null>(null);
  const [dropping, setDropping] = useState(false);
  const [won, setWon] = useState(false);
  const [tries, setTries] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const ducks = useRef<SwimmingDuck[]>(freshDucks());
  const dir = useRef(0);
  const xRef = useRef(50);
  const phaseRef = useRef<Phase>('idle');
  const completed = useRef(false);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);

  phaseRef.current = phase;
  xRef.current = x;

  // One loop: the claw moves while a direction is held, and the ducks swim back and forth.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (dir.current && phaseRef.current === 'idle') {
        setX((v) => Math.max(MIN_X, Math.min(MAX_X, v + dir.current * clawMachine.clawSpeed * dt)));
      }
      for (const d of ducks.current) {
        d.x += d.v * dt;
        if (d.x < SWIM_MIN) {
          d.x = SWIM_MIN;
          d.v = Math.abs(d.v);
        } else if (d.x > SWIM_MAX) {
          d.x = SWIM_MAX;
          d.v = -Math.abs(d.v);
        }
      }
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drop = useCallback(async () => {
    if (phaseRef.current !== 'idle' || won) return;
    dir.current = 0;
    setTries((t) => t + 1);
    setMessage(null);

    sfx.whoosh();
    setPhase('dropping');
    setCable(DROP);
    await wait(950);
    if (!alive.current) return;
    setPhase('grabbing');
    setClosed(true);
    sfx.click();
    // Whatever is under the claw at the moment it closes gets grabbed.
    const cx = xRef.current;
    const target = ducks.current
      .map((d) => ({ d, dist: Math.abs(d.x - cx) }))
      .filter((o) => o.dist <= clawMachine.catchTolerance)
      .sort((a, b) => a.dist - b.dist)[0]?.d;
    await wait(350);
    if (!alive.current) return;
    if (target) {
      ducks.current = ducks.current.filter((d) => d !== target);
      setHeld(target);
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
      setMessage(pick(clawMachine.missMessages));
      return;
    }

    if (!target.rainbow) {
      // Wrong duck: open the claw and let it splash back in.
      setClosed(false);
      setHeld(null);
      ducks.current = [...ducks.current, { ...target, x: Math.max(SWIM_MIN, Math.min(SWIM_MAX, xRef.current)), dropIn: true }];
      sfx.bonk();
      setMessage(pick(clawMachine.wrongDuckMessages));
      setPhase('idle');
      return;
    }

    setPhase('returning');
    setX(CHUTE_X);
    await wait(1000);
    if (!alive.current) return;
    setPhase('releasing');
    setClosed(false);
    setHeld(null);
    setDropping(true);
    sfx.pop();
    await wait(600);
    if (!alive.current) return;
    setDropping(false);
    setWon(true);
    setMessage(clawMachine.winMessage);
    sfx.fanfare();
    burst({ x: 0.3, y: 0.6 });
    if (!completed.current) {
      completed.current = true;
      onComplete();
    }
    setPhase('idle');
  }, [onComplete, won]);

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

  const playAgain = () => {
    ducks.current = freshDucks();
    setWon(false);
    setMessage(null);
    setX(50);
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
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-24 -skew-x-12 bg-white/40" />
          <div className="absolute inset-x-0 top-0 h-3 bg-cocoa-400" />
          {/* chute */}
          <div className="absolute bottom-0 left-0 z-10 flex h-24 w-[14%] min-w-[56px] flex-col items-center justify-end rounded-tr-xl border-r-4 border-t-4 border-berry-600 bg-berry-500/90 pb-2">
            <span className="font-display text-[10px] font-bold tracking-wider text-honey-200 sm:text-xs">PRIZE</span>
            <span className="text-lg">⬇</span>
          </div>
          {/* water */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#9BD3EE] to-transparent" />

          {/* aim guide */}
          {phase === 'idle' && !won && (
            <div className="absolute bottom-3 border-l-2 border-dashed border-berry-300/70" style={{ left: `${x}%`, top: REST + CLAW_H }} />
          )}

          {/* swimming ducks */}
          {ducks.current.map((d) => {
            const Wrapper = d.dropIn ? motion.div : 'div';
            const anim = d.dropIn ? { initial: { y: -(DROP - 20) }, animate: { y: 0 }, transition: { type: 'spring' as const, stiffness: 220, damping: 14 } } : {};
            return (
              <Wrapper
                key={`${d.id}-${d.dropIn ? 'back' : 'swim'}`}
                className="absolute"
                style={d.dropIn ? { left: `${d.x}%`, bottom: DUCK_BOTTOM, x: '-50%' } : { left: `${d.x}%`, bottom: DUCK_BOTTOM, transform: 'translateX(-50%)' }}
                data-testid={d.rainbow ? 'rainbow-duck' : 'duck'}
                data-x={d.x.toFixed(1)}
                data-v={d.v.toFixed(2)}
                {...anim}
              >
                <div style={{ transform: `scaleX(${d.v < 0 ? 1 : -1})` }}>
                  <Duck rainbow={d.rainbow} style={{ width: DUCK_SIZE, height: DUCK_SIZE }} />
                </div>
                {d.rainbow && <Sparkle className="absolute -right-1 -top-1 h-4 w-4 animate-wiggle" />}
              </Wrapper>
            );
          })}

          {/* rainbow duck falling into the chute */}
          <AnimatePresence>
            {dropping && (
              <motion.div
                key="drop"
                className="absolute z-20"
                style={{ left: `${CHUTE_X}%`, x: '-50%' }}
                initial={{ top: REST + CLAW_H - 20 }}
                animate={{ top: GLASS_H - 50, opacity: 0.2, scale: 0.7 }}
                transition={{ duration: 0.55, ease: 'easeIn' }}
              >
                <Duck happy rainbow style={{ width: DUCK_SIZE, height: DUCK_SIZE }} />
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
              {held && (
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: CLAW_H - 30 }}>
                  <Duck happy rainbow={held.rainbow} style={{ width: DUCK_SIZE, height: DUCK_SIZE }} />
                </div>
              )}
            </div>
          </div>

          {won && phase === 'idle' && (
            <div className="absolute right-3 top-6 z-30 flex items-center gap-1 rounded-full bg-cream-50/90 px-3 py-1 font-display text-sm font-semibold text-berry-600 shadow">
              <Duck happy rainbow className="h-7 w-7" /> Caught!
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3 sm:gap-5">
          <button type="button" className="btn-soft h-16 w-16 touch-none p-0 text-3xl" aria-label="Move claw left (hold)" disabled={busy || won} {...holdProps(-1)}>
            ◀
          </button>
          <button type="button" className="btn-primary h-16 px-8 text-2xl tracking-wider" onClick={() => void drop()} disabled={busy || won} data-testid="claw-drop">
            DROP ⬇
          </button>
          <button type="button" className="btn-soft h-16 w-16 touch-none p-0 text-3xl" aria-label="Move claw right (hold)" disabled={busy || won} {...holdProps(1)}>
            ▶
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip">🎯 Tries: {tries}</span>
        <span className="chip">🌈 Rainbow duck: {won ? 'caught!' : 'still swimming'}</span>
        {won && phase === 'idle' && (
          <button type="button" className="btn-ghost" onClick={playAgain}>
            Put it back & play again 🦆
          </button>
        )}
      </div>
      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500 sm:text-3xl" aria-live="polite">
        {message ?? (busy ? 'Ooooh…' : 'Catch the RAINBOW duck! 🌈')}
      </p>
    </div>
  );
}
