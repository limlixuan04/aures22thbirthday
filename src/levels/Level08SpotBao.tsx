import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spotTheBao as cfg } from '../content/content';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { Bao } from '../art/Critters';
import type { LevelProps } from '.';
import { Sentences } from '../components/Sentences';

interface Hidden {
  x: number;
  y: number;
  rot: number;
  decoy: boolean;
}

/** A dumpling: looks like a bao at a glance, but it's a trap. */
function Dumpling({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M6 44 C6 26 20 16 32 16 C44 16 58 26 58 44 C50 50 14 50 6 44Z" fill="#FFF8EE" stroke="#D9C3B0" strokeWidth="2" />
      <path d="M14 30 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" stroke="#D9C3B0" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** Pick spots for the baos and decoys, keeping them apart, with a little jitter. */
function hide(): Hidden[] {
  const picked: [number, number][] = [];
  for (const [x, y] of shuffle(cfg.spots)) {
    if (picked.every(([px, py]) => Math.hypot(px - x, (py - y) * 0.9) > 6)) picked.push([x, y]);
    if (picked.length >= cfg.count + cfg.decoys) break;
  }
  return picked.map(([x, y], i) => ({
    x: x + (Math.random() - 0.5) * 3,
    y: y + (Math.random() - 0.5) * 3,
    rot: Math.round((Math.random() - 0.5) * 70),
    decoy: i >= cfg.count,
  }));
}

export default function Level08SpotBao({ onComplete }: LevelProps) {
  const [attempt, setAttempt] = useState(0);
  const hidden = useMemo(() => hide(), [attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  const baos = hidden.filter((h) => !h.decoy);
  const [found, setFound] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [hint, setHint] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [deadline, setDeadline] = useState(() => Date.now() + cfg.seconds * 1000);
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState('Look closely… they’re tiny, and some of them are dumplings.');
  const flashId = useRef(0);
  const won = useRef(false);
  const total = baos.length;
  const done = found.length === total;
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= deadline) {
        sfx.bonk();
        setAttempt((a) => a + 1);
        setFound([]);
        setHint(null);
        setDeadline(Date.now() + cfg.seconds * 1000);
        setMessage('Time’s up! The baos scattered to new hiding spots. 🏃‍♂️🥟');
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [deadline, done]);

  const penalty = (seconds: number) => setDeadline((d) => d - seconds * 1000);

  const pop = (x: number, y: number, text: string) => {
    const id = ++flashId.current;
    setFlash((f) => [...f, { id, x, y, text }]);
    window.setTimeout(() => setFlash((f) => f.filter((v) => v.id !== id)), 800);
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (done) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const near = (h: Hidden) => Math.hypot(((px - h.x) / 100) * rect.width, ((py - h.y) / 100) * rect.height) <= (cfg.hitRadius / 100) * rect.width;
    const hit = baos.findIndex((b, i) => !found.includes(i) && near(b));
    if (hit >= 0) {
      const next = [...found, hit];
      setFound(next);
      setHint(null);
      sfx.good();
      pop(px, py, '🥟 +1');
      if (next.length === total) {
        setMessage('Every single bao found! 🥟✨');
        if (!won.current) {
          won.current = true;
          onComplete();
        }
      } else setMessage(`${total - next.length} bao${total - next.length === 1 ? '' : 's'} still hiding…`);
      return;
    }
    if (hidden.some((h) => h.decoy && near(h))) {
      sfx.error();
      penalty(cfg.decoyPenalty);
      pop(px, py, `−${cfg.decoyPenalty}s`);
      setMessage('That’s a DUMPLING, not a bao! 🙄');
      return;
    }
    sfx.bonk();
    penalty(cfg.missPenalty);
    pop(px, py, `✗ −${cfg.missPenalty}s`);
  };

  const showHint = () => {
    const next = baos.findIndex((_, i) => !found.includes(i));
    if (next < 0) return;
    sfx.pop();
    penalty(cfg.hintPenalty);
    setHint(next);
    window.setTimeout(() => setHint((h) => (h === next ? null : h)), 1800);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className={`chip text-base tabular-nums ${left <= 15 && !done ? 'bg-[#FFE3E8] text-[#C2264B]' : ''}`}>⏱️ {done ? 'Done!' : `${left}s`}</span>
        <span className="chip text-base" data-testid="spot-progress">
          🥟 Found {found.length} / {total}
        </span>
        <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
          {zoom ? '🔍 Zoom out' : '🔍 Zoom in'}
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-0.5" aria-hidden="true">
        {baos.map((_, i) => (
          <Bao key={i} className={`h-5 w-5 ${i < found.length ? '' : 'opacity-25 grayscale'}`} />
        ))}
      </div>

      <div className={`w-full max-w-2xl overflow-auto rounded-2xl border-4 border-berry-600 shadow-pop ${zoom ? 'max-h-[78vh]' : ''}`}>
        <div
          className="relative cursor-crosshair select-none"
          style={{ width: zoom ? '240%' : '100%', aspectRatio: String(cfg.aspectRatio) }}
          onClick={onClick}
          data-testid="spot-photo"
        >
          <img src={cfg.image} alt="Group photo with tiny baos hidden in it" className="pointer-events-none block h-full w-full object-cover" draggable={false} />

          {hidden.map((h, i) => (
            <div
              key={`${attempt}-${i}`}
              className="pointer-events-none absolute"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${cfg.baoSize}%`,
                transform: `translate(-50%, -50%) rotate(${h.rot}deg)`,
                opacity: cfg.baoOpacity,
                mixBlendMode: 'soft-light',
              }}
              data-testid={h.decoy ? 'decoy' : 'hidden-bao'}
              data-x={h.x.toFixed(2)}
              data-y={h.y.toFixed(2)}
            >
              {h.decoy ? <Dumpling className="h-auto w-full" /> : <Bao className="h-auto w-full" />}
            </div>
          ))}

          {baos.map((b, i) =>
            found.includes(i) || hint === i ? (
              <motion.div
                key={`ring-${attempt}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: hint === i ? [1, 1.3, 1] : 1 }}
                transition={hint === i ? { repeat: Infinity, duration: 0.7 } : { type: 'spring', stiffness: 400, damping: 15 }}
                className={`pointer-events-none absolute rounded-full border-[3px] ${
                  found.includes(i) ? 'border-[#C2264B] shadow-[0_0_0_2px_rgba(255,255,255,0.85)]' : 'border-dashed border-honey-300 bg-honey-200/30'
                }`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${cfg.hitRadius * 2.4}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%' }}
              />
            ) : null,
          )}

          <AnimatePresence>
            {flash.map((m) => (
              <motion.span
                key={m.id}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-lg font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                {m.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        <Sentences text={message} />
      </p>
      {!done && (
        <div className="flex flex-col items-center gap-1">
          <button type="button" className="btn-ghost" onClick={showHint}>
            🙈 Hint (costs {cfg.hintPenalty}s)
          </button>
          <p className="text-xs text-cocoa-500">
            Wrong tap −{cfg.missPenalty}s · Dumpling −{cfg.decoyPenalty}s · When time runs out, the baos move!
          </p>
        </div>
      )}
    </div>
  );
}
