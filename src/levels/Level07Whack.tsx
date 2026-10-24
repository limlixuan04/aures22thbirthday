import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { whackAMole as WM } from '../content/content';
import { pick } from '../lib/random';
import { sfx } from '../lib/sound';
import type { LevelProps } from '.';

interface Pop {
  id: number;
  hole: number;
  until: number;
  hit?: boolean;
}

const HOLES = WM.gridSize * WM.gridSize;

function FriendFace({ photo, name, hit }: { photo: string; name: string; hit?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <img
        src={photo}
        alt={name}
        draggable={false}
        className={`h-full w-full rounded-full border-[3px] object-cover shadow-md ${hit ? 'border-[#C2264B] brightness-110 saturate-150' : 'border-cream-50'}`}
      />
      {hit && <span className="absolute -right-1 -top-2 text-2xl">💥</span>}
    </div>
  );
}

export default function Level07Whack({ onComplete }: LevelProps) {
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState<'ready' | 'playing' | 'roundWon' | 'over' | 'done'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WM.rounds[0].seconds);
  const [pops, setPops] = useState<Pop[]>([]);
  const [floaters, setFloaters] = useState<{ id: number; hole: number; text: string }[]>([]);
  const nextId = useRef(1);
  const scoreRef = useRef(0);
  const endAt = useRef(0);
  const completed = useRef(false);

  const cfg = WM.rounds[round];
  const friend = WM.friends[round % WM.friends.length];

  const start = () => {
    sfx.success();
    setScore(0);
    scoreRef.current = 0;
    setPops([]);
    setTimeLeft(cfg.seconds);
    endAt.current = Date.now() + cfg.seconds * 1000;
    setStatus('playing');
  };

  // Game clock: spawns, expiries and countdown.
  useEffect(() => {
    if (status !== 'playing') return;
    let lastSpawn = 0;
    const tick = window.setInterval(() => {
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.ceil((endAt.current - now) / 1000)));
      if (now >= endAt.current) {
        setStatus('over');
        setPops([]);
        sfx.bonk();
        return;
      }
      setPops((ps) => {
        let next = ps.filter((p) => p.until > now);
        if (now - lastSpawn >= cfg.spawnEveryMs && next.filter((p) => !p.hit).length < cfg.maxUp) {
          lastSpawn = now;
          const busy = new Set(next.map((p) => p.hole));
          const free = Array.from({ length: HOLES }, (_, i) => i).filter((h) => !busy.has(h));
          if (free.length) {
            const hole = free[Math.floor(Math.random() * free.length)];
            next = [...next, { id: nextId.current++, hole, until: now + cfg.visibleMs * (0.85 + Math.random() * 0.3) }];
          }
        }
        return next;
      });
    }, 60);
    return () => window.clearInterval(tick);
  }, [status, cfg]);

  const whack = useCallback(
    (pop: Pop) => {
      if (status !== 'playing' || pop.hit) return;
      sfx.pop();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setPops((ps) => ps.map((p) => (p.id === pop.id ? { ...p, hit: true, until: Date.now() + 260 } : p)));
      const fid = nextId.current++;
      setFloaters((f) => [...f, { id: fid, hole: pop.hole, text: Math.random() < 0.3 ? pick(WM.hitLines) : '+1' }]);
      window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 700);
      if (scoreRef.current >= cfg.targetScore) {
        setPops([]);
        if (round + 1 >= WM.rounds.length) {
          setStatus('done');
          if (!completed.current) {
            completed.current = true;
            onComplete();
          }
        } else {
          setStatus('roundWon');
          sfx.good();
        }
      }
    },
    [status, cfg, round, onComplete],
  );

  const nextRound = () => {
    setRound((r) => r + 1);
    setStatus('ready');
    setScore(0);
    scoreRef.current = 0;
  };

  const playAgain = () => {
    setRound(0);
    setStatus('ready');
    setScore(0);
    scoreRef.current = 0;
  };

  const progress = Math.min(1, score / cfg.targetScore);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* mini level tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Mini levels">
        {WM.rounds.map((_, i) => {
          const f = WM.friends[i % WM.friends.length];
          const done = i < round || status === 'done';
          const here = i === round && status !== 'done';
          return (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 font-display text-sm font-semibold ${
                done ? 'border-sage-400 bg-sage-200/60 text-berry-600' : here ? 'border-berry-500 bg-blush-100 text-berry-600' : 'border-blush-200 bg-cream-50 text-berry-300'
              }`}
            >
              <img src={f.photo} alt="" className={`h-7 w-7 rounded-full object-cover ${!done && !here ? 'opacity-50 grayscale' : ''}`} />
              Mini level {i + 1}
              {done && ' ✓'}
            </div>
          );
        })}
      </div>

      <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
        <span className="chip text-base">⏱️ {timeLeft}s</span>
        <span className="chip text-base" data-testid="whack-score">
          ⭐ {score} / {cfg.targetScore}
        </span>
        <div className="h-3 w-40 overflow-hidden rounded-full bg-blush-100" aria-hidden="true">
          <div className="h-full rounded-full bg-berry-500 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="relative w-full max-w-lg rounded-[32px] border-4 border-berry-600 bg-gradient-to-b from-sage-200 to-sage-300 p-3 shadow-pop sm:p-5">
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${WM.gridSize}, minmax(0, 1fr))` }}>
          {Array.from({ length: HOLES }, (_, h) => {
            const pop = pops.find((p) => p.hole === h);
            const fl = floaters.filter((f) => f.hole === h);
            return (
              <div key={h} className="relative aspect-square">
                <div className="absolute inset-x-[6%] bottom-[6%] h-[30%] rounded-[50%] bg-berry-700/70 shadow-inner" />
                <div className="absolute inset-0 overflow-hidden rounded-b-[40%]">
                  <AnimatePresence>
                    {pop && (
                      <motion.button
                        key={pop.id}
                        type="button"
                        aria-label="Whack!"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          whack(pop);
                        }}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && whack(pop)}
                        initial={{ y: '95%' }}
                        animate={{ y: pop.hit ? '30%' : '6%', scale: pop.hit ? 0.8 : 1, rotate: pop.hit ? -15 : 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                        className="absolute inset-x-[10%] bottom-[10%] top-[8%] cursor-pointer"
                        data-testid="whack-target"
                      >
                        <FriendFace photo={friend.photo} name={friend.name} hit={pop.hit} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="pointer-events-none absolute inset-x-[2%] bottom-0 h-[16%] rounded-[50%] bg-sage-400" />
                {fl.map((f) => (
                  <motion.span
                    key={f.id}
                    className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap font-display text-base font-bold text-berry-600 sm:text-lg"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -26, opacity: 0 }}
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
          <div className="absolute inset-0 grid place-items-center rounded-[28px] bg-cream-50/85 p-4 text-center backdrop-blur-[2px]">
            <div className="flex flex-col items-center">
              {status === 'done' ? (
                <>
                  <div className="flex -space-x-3">
                    {WM.friends.map((f) => (
                      <img key={f.photo} src={f.photo} alt={f.name} className="h-14 w-14 rounded-full border-4 border-cream-50 object-cover" />
                    ))}
                  </div>
                  <p className="mt-2 font-display text-2xl font-semibold text-berry-600">All 3 friends whacked! 🔨</p>
                  <button type="button" className="btn-ghost mt-2" onClick={playAgain}>
                    Play again
                  </button>
                </>
              ) : status === 'roundWon' ? (
                <>
                  <p className="font-display text-2xl font-semibold text-berry-600">Mini level {round + 1} cleared! 🎉</p>
                  <p className="mt-1 text-berry-500">Someone else wants to crash the party…</p>
                  <button type="button" className="btn-primary mt-4" onClick={nextRound} data-testid="whack-next">
                    Mini level {round + 2} →
                  </button>
                </>
              ) : (
                <>
                  <img src={friend.photo} alt={friend.name} className="h-20 w-20 rounded-full border-4 border-berry-500 object-cover shadow-card" />
                  <p className="mt-2 font-display text-sm font-semibold uppercase tracking-widest text-berry-400">Mini level {round + 1} of {WM.rounds.length}</p>
                  {status === 'over' ? (
                    <p className="mt-1 font-hand text-2xl text-blush-500">Time’s up! {score} points. One more go? 💪</p>
                  ) : (
                    <p className="mt-1 text-berry-500">
                      {cfg.targetScore} points in {cfg.seconds} seconds{round > 0 ? '. Faster this time!' : ''}
                    </p>
                  )}
                  <button type="button" className="btn-primary mt-4" onClick={start} data-testid="whack-start">
                    {status === 'over' ? 'Try again 🔁' : 'Start! 🔨'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
