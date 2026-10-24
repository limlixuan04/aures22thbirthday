import { useRef, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spotTheBao as cfg } from '../content/content';
import { sfx } from '../lib/sound';
import { Bao } from '../art/Critters';
import type { LevelProps } from '.';

export default function Level08SpotBao({ onComplete }: LevelProps) {
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hint, setHint] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const missId = useRef(0);
  const total = cfg.baos.length;
  const done = found.length === total;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (done) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const hit = cfg.baos.findIndex((b, i) => {
      if (found.includes(i)) return false;
      const dx = ((px - b.x) / 100) * rect.width;
      const dy = ((py - b.y) / 100) * rect.height;
      return Math.hypot(dx, dy) <= (cfg.hitRadius / 100) * rect.width;
    });
    if (hit >= 0) {
      const next = [...found, hit];
      setFound(next);
      setHint(null);
      sfx.good();
      if (next.length === total) onComplete();
    } else {
      sfx.bonk();
      const id = ++missId.current;
      setMisses((m) => [...m, { id, x: px, y: py }]);
      window.setTimeout(() => setMisses((m) => m.filter((x) => x.id !== id)), 650);
    }
  };

  const showHint = () => {
    const next = cfg.baos.findIndex((_, i) => !found.includes(i));
    if (next < 0) return;
    sfx.pop();
    setHint(next);
    window.setTimeout(() => setHint((h) => (h === next ? null : h)), 2200);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip text-base" data-testid="spot-progress">
          🥟 Found {found.length} / {total}
        </span>
        <div className="flex flex-wrap gap-0.5" aria-hidden="true">
          {cfg.baos.map((_, i) => (
            <Bao key={i} className={`h-5 w-5 ${i < found.length ? '' : 'opacity-25 grayscale'}`} />
          ))}
        </div>
        <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
          {zoom ? '🔍 Zoom out' : '🔍 Zoom in'}
        </button>
      </div>

      <div className={`w-full max-w-xl overflow-auto rounded-2xl border-4 border-berry-600 shadow-pop ${zoom ? 'max-h-[75vh]' : ''}`}>
        <div
          className="relative cursor-crosshair select-none"
          style={{ width: zoom ? '220%' : '100%', aspectRatio: String(cfg.aspectRatio) }}
          onClick={onClick}
          data-testid="spot-photo"
        >
          <img src={cfg.image} alt="Group photo with tiny baos hidden in it" className="pointer-events-none block h-full w-full object-cover" draggable={false} />

          {cfg.baos.map((b, i) => (
            <div
              key={i}
              className="pointer-events-none absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${cfg.baoSize}%`, transform: `translate(-50%, -50%) rotate(${b.rot}deg)` }}
            >
              <Bao className="h-auto w-full opacity-[0.82]" />
            </div>
          ))}

          {cfg.baos.map((b, i) =>
            found.includes(i) || hint === i ? (
              <motion.div
                key={`ring-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: hint === i ? [1, 1.25, 1] : 1 }}
                transition={hint === i ? { repeat: Infinity, duration: 0.8 } : { type: 'spring', stiffness: 400, damping: 15 }}
                className={`pointer-events-none absolute rounded-full border-[3px] ${
                  found.includes(i) ? 'border-[#C2264B] shadow-[0_0_0_3px_rgba(255,255,255,0.85)]' : 'border-dashed border-honey-300 bg-honey-200/30'
                }`}
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${cfg.hitRadius * 2.2}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%' }}
              />
            ) : null,
          )}

          <AnimatePresence>
            {misses.map((m) => (
              <motion.span
                key={m.id}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                ✗
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        {done ? 'Every single bao found! 🥟✨' : found.length ? `${total - found.length} bao${total - found.length === 1 ? '' : 's'} still hiding…` : 'Look closely…'}
      </p>
      {!done && (
        <button type="button" className="btn-ghost" onClick={showHint}>
          🙈 I need a hint
        </button>
      )}
    </div>
  );
}
