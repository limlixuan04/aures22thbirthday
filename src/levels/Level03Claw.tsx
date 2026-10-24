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
  dir: 1 | -1;
  base: number; // normal speed, % per second
  mult: number; // current speed multiplier
  target: number; // multiplier it's easing towards
  timer: number; // seconds until it changes its mind
  hop: number; // seconds left in a bounce hop
  rainbow: boolean;
  dropIn?: boolean;
}

const GLASS_H = 340;
const CLAW_H = 56;
const REST = 18;
const DUCK_SIZE = 54;
const DUCK_BOTTOM = 14;
const DROP = GLASS_H - DUCK_BOTTOM - DUCK_SIZE * 0.55 - CLAW_H;
const MIN_X = 10;
const MAX_X = 94;
const CHUTE_X = 7;
const SWIM_MIN = 20;
const SWIM_MAX = 94;
const HOP_TIME = 0.45;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function freshDucks(): SwimmingDuck[] {
  return clawMachine.duckPositions.map((x, i) => {
    const rainbow = clawMachine.rainbowDucks.includes(i);
    const base = rainbow ? clawMachine.rainbowSpeed : clawMachine.duckSpeed * (0.8 + ((i * 37) % 10) / 25);
    return { id: i, x, dir: i % 2 ? -1 : 1, base, mult: 1, target: 1, timer: 0.5 + Math.random() * 2, hop: 0, rainbow };
  });
}

/** Ducks change their minds: sometimes dawdle, sometimes zoom, occasionally turn around. */
function newMood(d: SwimmingDuck) {
  const roll = Math.random();
  const { slowest, fastest } = clawMachine;
  d.target = roll < 0.3 ? slowest + Math.random() * 0.25 : roll < 0.75 ? 0.8 + Math.random() * 0.4 : fastest * (0.75 + Math.random() * 0.25);
  d.timer = 0.8 + Math.random() * 1.8;
  if (Math.random() < 0.15) d.dir = d.dir === 1 ? -1 : 1;
}

const velocity = (d: SwimmingDuck) => d.dir * d.base * d.mult;
/** Little hop when a duck bounces off the wall. */
const hopPx = (d: SwimmingDuck) => (d.hop > 0 ? Math.sin(Math.PI * (1 - d.hop / HOP_TIME)) * 22 : 0);

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
  const [rainbowsCaught, setRainbowsCaught] = useState(0);
  const rainbowsRef = useRef(0);
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
        d.timer -= dt;
        if (d.timer <= 0) newMood(d);
        d.mult += (d.target - d.mult) * Math.min(1, dt * 3);
        d.x += velocity(d) * dt;
        d.hop = Math.max(0, d.hop - dt);
        if (d.x < SWIM_MIN || d.x > SWIM_MAX) {
          d.x = Math.max(SWIM_MIN, Math.min(SWIM_MAX, d.x));
          d.dir = d.x <= SWIM_MIN ? 1 : -1;
          d.hop = HOP_TIME;
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
    rainbowsRef.current += 1;
    setRainbowsCaught(rainbowsRef.current);
    if (rainbowsRef.current < Math.min(clawMachine.rainbowToCatch, clawMachine.rainbowDucks.length)) {
      setMessage(clawMachine.oneMoreMessage);
      sfx.success();
      setX(50);
      setPhase('idle');
      return;
    }
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
    rainbowsRef.current = 0;
    setRainbowsCaught(0);
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
          <span className="px-2 font-display text-xl font-bold tracking-widest text-honey-200 sm:text-2xl">DUCK CATCHER 2004</span>
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
                style={d.dropIn ? { left: `${d.x}%`, bottom: DUCK_BOTTOM + hopPx(d), x: '-50%', zIndex: d.rainbow ? 2 : 1 } : { left: `${d.x}%`, bottom: DUCK_BOTTOM + hopPx(d), transform: 'translateX(-50%)', zIndex: d.rainbow ? 2 : 1 }}
                data-testid={d.rainbow ? 'rainbow-duck' : 'duck'}
                data-x={d.x.toFixed(1)}
                data-v={velocity(d).toFixed(2)}
                {...anim}
              >
                <div style={{ transform: `scaleX(${d.dir < 0 ? 1 : -1})` }}>
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
              <Duck happy rainbow className="h-7 w-7" /> Both caught!
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
        <span className="chip">
          🌈 Rainbow ducks: {rainbowsCaught} / {Math.min(clawMachine.rainbowToCatch, clawMachine.rainbowDucks.length)}
        </span>
        {won && phase === 'idle' && (
          <button type="button" className="btn-ghost" onClick={playAgain}>
            Put it back & play again 🦆
          </button>
        )}
      </div>
      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500 sm:text-3xl" aria-live="polite">
        {message ?? (busy ? 'Ooooh…' : 'Catch the RAINBOW ducks! 🌈')}
      </p>
    </div>
  );
}
