import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catchGame } from '../content/content';
import { sfx } from '../lib/sound';
import { pick } from '../lib/random';
import { Heart } from '../art/Decor';
import type { LevelProps } from '.';

type Kind = 'heart' | 'gold' | 'obstacle';
interface Item {
  id: number;
  x: number; // 0..1 centre
  y: number; // 0..1 top
  speed: number;
  kind: Kind;
  emoji?: string;
  quip?: string;
  spin: number;
}

const PLAYER_W = 0.17;
const PLAYER_Y = 0.83;
const ITEM = 0.075; // item size as fraction of width
const PLAYER_SPEED = 1.15; // widths per second

function Hoop() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* net */}
      <path d="M10 12 L22 58 L78 58 L90 12" fill="#FFFCF7" fillOpacity=".55" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 12 L32 58 M42 12 L44 58 M58 12 L56 58 M74 12 L68 58 M13 24 L87 24 M17 38 L83 38 M20 50 L80 50" stroke="#fff" strokeWidth="2" opacity=".95" />
      <path d="M10 12 L22 58 L78 58 L90 12" fill="none" stroke="#C8B6B0" strokeWidth="1" opacity=".8" />
      {/* rim */}
      <ellipse cx="50" cy="12" rx="44" ry="8" fill="none" stroke="#E2572B" strokeWidth="6" />
      <ellipse cx="50" cy="11" rx="44" ry="8" fill="none" stroke="#FF8A5B" strokeWidth="1.5" opacity=".8" />
    </svg>
  );
}

export default function Level09Catch({ onComplete }: LevelProps) {
  const [status, setStatus] = useState<'ready' | 'playing' | 'won'>('ready');
  const [, setFrame] = useState(0);
  const [score, setScore] = useState(0);
  const [quip, setQuip] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const [wobble, setWobble] = useState(0);

  const field = useRef<HTMLDivElement>(null);
  const items = useRef<Item[]>([]);
  const playerX = useRef(0.5);
  const target = useRef<number | null>(null);
  const dir = useRef(0);
  const scoreRef = useRef(0);
  const spawnIn = useRef(0);
  const ids = useRef(0);
  const won = useRef(false);

  const reset = useCallback(() => {
    items.current = [];
    playerX.current = 0.5;
    target.current = null;
    scoreRef.current = 0;
    spawnIn.current = 0.3;
    setScore(0);
    setQuip(null);
  }, []);

  const start = () => {
    reset();
    sfx.success();
    setStatus('playing');
    field.current?.focus();
  };

  useEffect(() => {
    if (status !== 'playing') return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      // move player
      if (dir.current) {
        target.current = null;
        playerX.current += dir.current * PLAYER_SPEED * dt;
      } else if (target.current !== null) {
        const d = target.current - playerX.current;
        playerX.current += Math.sign(d) * Math.min(Math.abs(d), PLAYER_SPEED * 1.6 * dt);
      }
      playerX.current = Math.max(PLAYER_W / 2, Math.min(1 - PLAYER_W / 2, playerX.current));

      // spawn
      spawnIn.current -= dt;
      if (spawnIn.current <= 0) {
        const progress = scoreRef.current / catchGame.targetScore;
        spawnIn.current = 0.75 - Math.min(0.3, progress * 0.3) + Math.random() * 0.2;
        const roll = Math.random();
        const kind: Kind = roll < catchGame.obstacleChance ? 'obstacle' : roll > 0.93 ? 'gold' : 'heart';
        const ob = kind === 'obstacle' ? pick(catchGame.obstacles) : undefined;
        items.current.push({
          id: ++ids.current,
          x: ITEM / 2 + Math.random() * (1 - ITEM),
          y: -0.1,
          speed: catchGame.baseSpeed * (1 + progress * 0.6) * (0.85 + Math.random() * 0.3),
          kind,
          emoji: ob?.emoji,
          quip: ob?.quip,
          spin: (Math.random() - 0.5) * 120,
        });
      }

      // fall + collide
      const keep: Item[] = [];
      for (const it of items.current) {
        it.y += it.speed * dt;
        const inBand = it.y + ITEM * 0.8 >= PLAYER_Y && it.y <= PLAYER_Y + 0.06;
        const overlap = Math.abs(it.x - playerX.current) < PLAYER_W / 2 + ITEM * 0.3;
        if (inBand && overlap) {
          if (it.kind === 'obstacle') {
            scoreRef.current = Math.max(0, scoreRef.current - catchGame.obstaclePenalty);
            sfx.bonk();
            setWobble((w) => w + 1);
            setQuip({ id: it.id, text: `${it.quip} −${catchGame.obstaclePenalty}`, good: false });
          } else {
            const pts = it.kind === 'gold' ? 3 : 1;
            scoreRef.current += pts;
            sfx.pop();
            if (it.kind === 'gold') setQuip({ id: it.id, text: 'Golden heart! +3 💛', good: true });
          }
          setScore(scoreRef.current);
          continue;
        }
        if (it.y < 1.05) keep.push(it);
      }
      items.current = keep;

      if (scoreRef.current >= catchGame.targetScore) {
        setStatus('won');
        if (!won.current) {
          won.current = true;
          onComplete();
        }
        return;
      }
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, onComplete]);

  useEffect(() => {
    if (!quip) return;
    const t = window.setTimeout(() => setQuip(null), 1100);
    return () => window.clearTimeout(t);
  }, [quip]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) dir.current = -1;
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) dir.current = 1;
      else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key) && dir.current === -1) dir.current = 0;
      if (['ArrowRight', 'd', 'D'].includes(e.key) && dir.current === 1) dir.current = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== 'playing' || (e.pointerType === 'mouse' && e.buttons === 0 && e.type !== 'pointermove')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    target.current = (e.clientX - rect.left) / rect.width;
  };

  const hold = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      dir.current = d;
    },
    onPointerUp: () => (dir.current = 0),
    onPointerLeave: () => (dir.current = 0),
    onPointerCancel: () => (dir.current = 0),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip text-base" data-testid="catch-score">💗 {score} / {catchGame.targetScore}</span>
        <div className="h-3 w-40 overflow-hidden rounded-full bg-blush-100" aria-hidden="true">
          <div className="h-full rounded-full bg-berry-500 transition-all" style={{ width: `${Math.min(100, (score / catchGame.targetScore) * 100)}%` }} />
        </div>
        {status === 'playing' && (
          <button type="button" className="btn-ghost" onClick={start}>↺ Restart</button>
        )}
      </div>

      <div
        ref={field}
        tabIndex={0}
        aria-label="Catch game play area. Use left and right arrow keys to move."
        className="relative h-[420px] w-full max-w-2xl touch-none select-none overflow-hidden rounded-[28px] border-4 border-berry-600 bg-gradient-to-b from-[#FDE6EC] via-[#FFF6EA] to-[#FBEAD6] shadow-pop sm:h-[460px]"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        data-testid="catch-field"
      >
        {/* decorative stars */}
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#F6B3C4 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-x-0 bottom-0 h-[10%] border-t-4 border-cream-50/80 bg-[repeating-linear-gradient(90deg,#E9B97A_0,#E9B97A_38px,#DFAD6C_38px,#DFAD6C_40px)]" />

        {items.current.map((it) => (
          <div
            key={it.id}
            className="pointer-events-none absolute"
            style={{
              left: `${it.x * 100}%`,
              top: `${it.y * 100}%`,
              width: `${ITEM * 100}%`,
              aspectRatio: '1',
              transform: `translateX(-50%) rotate(${it.y * it.spin}deg)`,
            }}
          >
            {it.kind === 'obstacle' ? (
              <span className="flex h-full w-full items-center justify-center text-[clamp(22px,5vw,38px)] leading-none">{it.emoji}</span>
            ) : (
              <Heart className="h-full w-full drop-shadow" color={it.kind === 'gold' ? '#F5CD6E' : '#E2688A'} />
            )}
          </div>
        ))}

        <motion.div
          key={wobble}
          animate={wobble ? { rotate: [0, -10, 10, -6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="absolute"
          style={{ left: `${playerX.current * 100}%`, top: `${PLAYER_Y * 100}%`, width: `${PLAYER_W * 100}%`, aspectRatio: '100 / 60', translateX: '-50%' }}
        >
          <Hoop />
        </motion.div>

        <AnimatePresence>
          {quip && (
            <motion.div
              key={quip.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 font-display font-semibold shadow ${quip.good ? 'bg-honey-200 text-berry-600' : 'bg-berry-600 text-cream-50'}`}
            >
              {quip.text}
            </motion.div>
          )}
        </AnimatePresence>

        {status !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center bg-cream-50/75 p-6 text-center backdrop-blur-[2px]">
            <div>
              {status === 'won' ? (
                <>
                  <Heart className="mx-auto h-16 w-16 animate-bob" />
                  <p className="mt-2 font-display text-2xl font-semibold text-berry-600">You caught {score} hearts! 💘</p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold text-berry-600">Catch {catchGame.targetScore} points of love!</p>
                  <p className="mt-1 text-berry-500">💗 = 1 · 💛 = 3 · {catchGame.obstacles.map((o) => o.emoji).join(' ')} = −{catchGame.obstaclePenalty}</p>
                </>
              )}
              <button type="button" className="btn-primary mt-4" onClick={start} data-testid="catch-start">
                {status === 'won' ? 'Play again 🔁' : 'Start catching! 🏀'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="btn-soft h-16 w-24 touch-none p-0 text-3xl" aria-label="Move left (hold)" {...hold(-1)}>
          ◀
        </button>
        <button type="button" className="btn-soft h-16 w-24 touch-none p-0 text-3xl" aria-label="Move right (hold)" {...hold(1)}>
          ▶
        </button>
      </div>
      <p className="text-center text-sm text-cocoa-500">Keyboard: ← → or A / D · Touch: hold the buttons or drag on the game</p>
    </div>
  );
}
