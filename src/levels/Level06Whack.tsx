import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { whackAMole } from '../content/content';
import { sfx } from '../lib/sound';
import { Bao, Duck, StarBuddy } from '../art/Critters';
import type { LevelProps } from '.';

type Kind = 'bao' | 'duck' | 'star';
interface Pop {
  id: number;
  hole: number;
  kind: Kind;
  until: number;
  hit?: boolean;
}

const HOLES = 9;
const POINTS: Record<Kind, number> = { bao: 1, duck: 1, star: 3 };

function Critter({ kind, hit }: { kind: Kind; hit?: boolean }) {
  const cls = 'h-full w-full drop-shadow';
  if (kind === 'star') return <StarBuddy className={cls} />;
  if (kind === 'duck') return <Duck className={cls} happy={hit} />;
  return <Bao className={cls} bonk={hit} />;
}

export default function Level06Whack({ onComplete }: LevelProps) {
  const [status, setStatus] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(whackAMole.durationSeconds);
  const [pops, setPops] = useState<Pop[]>([]);
  const [floaters, setFloaters] = useState<{ id: number; hole: number; text: string }[]>([]);
  const nextId = useRef(1);
  const won = useRef(false);
  const scoreRef = useRef(0);
  const endAt = useRef(0);

  const start = () => {
    sfx.success();
    setScore(0);
    scoreRef.current = 0;
    setPops([]);
    setTimeLeft(whackAMole.durationSeconds);
    endAt.current = Date.now() + whackAMole.durationSeconds * 1000;
    setStatus('playing');
  };

  // Game clock: spawns, expiries and countdown.
  useEffect(() => {
    if (status !== 'playing') return;
    let lastSpawn = 0;
    const tick = window.setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((endAt.current - now) / 1000));
      setTimeLeft(left);
      if (now >= endAt.current) {
        setStatus('over');
        setPops([]);
        if (scoreRef.current < whackAMole.targetScore) sfx.bonk();
        return;
      }
      setPops((ps) => {
        let next = ps.filter((p) => p.until > now);
        if (now - lastSpawn >= whackAMole.spawnEveryMs && next.length < 3) {
          lastSpawn = now;
          const busy = new Set(next.map((p) => p.hole));
          const free = Array.from({ length: HOLES }, (_, i) => i).filter((h) => !busy.has(h));
          const hole = free[Math.floor(Math.random() * free.length)];
          const roll = Math.random();
          const kind: Kind = roll < 0.12 ? 'star' : roll < 0.45 ? 'duck' : 'bao';
          next = [...next, { id: nextId.current++, hole, kind, until: now + whackAMole.visibleMs + (kind === 'star' ? -200 : 0) }];
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(tick);
  }, [status]);

  const whack = useCallback(
    (pop: Pop) => {
      if (status !== 'playing' || pop.hit) return;
      const pts = POINTS[pop.kind];
      sfx.pop();
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setPops((ps) => ps.map((p) => (p.id === pop.id ? { ...p, hit: true, until: Date.now() + 250 } : p)));
      const fid = nextId.current++;
      setFloaters((f) => [...f, { id: fid, hole: pop.hole, text: `+${pts}` }]);
      window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 700);
      if (!won.current && scoreRef.current >= whackAMole.targetScore) {
        won.current = true;
        onComplete();
      }
    },
    [status, onComplete],
  );

  const reachedTarget = score >= whackAMole.targetScore;
  const progress = Math.min(1, score / whackAMole.targetScore);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
        <span className="chip text-base">⏱️ {timeLeft}s</span>
        <span className="chip text-base" data-testid="whack-score">⭐ {score} / {whackAMole.targetScore}</span>
        <div className="h-3 w-40 overflow-hidden rounded-full bg-blush-100" aria-hidden="true">
          <div className="h-full rounded-full bg-berry-500 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="relative w-full max-w-md rounded-[32px] border-4 border-berry-600 bg-gradient-to-b from-sage-200 to-sage-300 p-4 shadow-pop sm:p-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {Array.from({ length: HOLES }, (_, h) => {
            const pop = pops.find((p) => p.hole === h);
            const fl = floaters.filter((f) => f.hole === h);
            return (
              <div key={h} className="relative aspect-square">
                {/* hole */}
                <div className="absolute inset-x-[8%] bottom-[8%] h-[30%] rounded-[50%] bg-berry-700/70 shadow-inner" />
                <div className="absolute inset-0 overflow-hidden rounded-b-[40%]">
                  <AnimatePresence>
                    {pop && (
                      <motion.button
                        key={pop.id}
                        type="button"
                        aria-label={`Whack the ${pop.kind}!`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          whack(pop);
                        }}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && whack(pop)}
                        initial={{ y: '90%' }}
                        animate={{ y: pop.hit ? '20%' : '8%', scale: pop.hit ? 0.85 : 1, rotate: pop.hit ? -12 : 0 }}
                        exit={{ y: '95%' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                        className="absolute inset-x-[12%] bottom-[12%] top-[6%] cursor-pointer"
                        data-testid="whack-target"
                      >
                        <Critter kind={pop.kind} hit={pop.hit} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                {/* hole front lip */}
                <div className="pointer-events-none absolute inset-x-[4%] bottom-[2%] h-[16%] rounded-[50%] bg-sage-400" />
                {fl.map((f) => (
                  <motion.span
                    key={f.id}
                    className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-display text-2xl font-bold text-berry-600"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    {f.text}
                  </motion.span>
                ))}
              </div>
            );
          })}
        </div>

        {status !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center rounded-[28px] bg-cream-50/80 p-4 text-center backdrop-blur-[2px]">
            <div>
              {status === 'ready' ? (
                <>
                  <p className="font-display text-2xl font-semibold text-berry-600">Get {whackAMole.targetScore} points in {whackAMole.durationSeconds} seconds!</p>
                  <p className="mt-1 text-berry-500">Bao & ducks = 1 point · Golden star = 3 points</p>
                </>
              ) : reachedTarget ? (
                <p className="font-display text-2xl font-semibold text-berry-600">Time! You scored {score} 🎉</p>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold text-berry-600">Time’s up! {score} points</p>
                  <p className="mt-1 font-hand text-2xl text-blush-500">So close! One more go? 💪</p>
                </>
              )}
              <button type="button" className="btn-primary mt-4" onClick={start} data-testid="whack-start">
                {status === 'ready' ? 'Start! 🔨' : 'Play again 🔁'}
              </button>
            </div>
          </div>
        )}
      </div>
      {status === 'playing' && reachedTarget && <p className="font-hand text-2xl text-berry-500">Target reached! Keep going for fun! ✨</p>}
    </div>
  );
}
