import { useRef, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spotTheDifference as cfg } from '../content/content';
import { sfx } from '../lib/sound';
import { PicnicScene } from '../art/PicnicScene';
import type { LevelProps } from '.';

export default function Level08SpotDiff({ onComplete }: LevelProps) {
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState<{ id: number; x: number; y: number; side: 'a' | 'b' }[]>([]);
  const [hint, setHint] = useState<number | null>(null);
  const missId = useRef(0);
  const total = cfg.differences.length;
  const done = found.length === total;

  const onClick = (side: 'a' | 'b') => (e: MouseEvent<HTMLDivElement>) => {
    if (done) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const hit = cfg.differences.findIndex((d, i) => {
      if (found.includes(i)) return false;
      const dx = ((px - d.x) / 100) * rect.width;
      const dy = ((py - d.y) / 100) * rect.height;
      return Math.hypot(dx, dy) <= (d.r / 100) * rect.width;
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
      setMisses((m) => [...m, { id, x: px, y: py, side }]);
      window.setTimeout(() => setMisses((m) => m.filter((x) => x.id !== id)), 650);
    }
  };

  // Keyboard-accessible alternative: choose a difference from a list isn't fair,
  // so keyboard users get the hint button, which highlights one spot to click.
  const showHint = () => {
    const next = cfg.differences.findIndex((_, i) => !found.includes(i));
    if (next < 0) return;
    sfx.pop();
    setHint(next);
    window.setTimeout(() => setHint((h) => (h === next ? null : h)), 2000);
  };

  const panel = (side: 'a' | 'b') => (
    <div className="w-full">
      <p className="mb-2 text-center font-display text-sm font-semibold text-berry-400">{side === 'a' ? 'Picture 1' : 'Picture 2'}</p>
      <div
        className="relative w-full cursor-crosshair select-none overflow-hidden rounded-2xl border-4 border-berry-600 bg-white shadow-pop"
        style={{ aspectRatio: String(cfg.aspectRatio) }}
        onClick={onClick(side)}
        data-testid={`spot-${side}`}
      >
        {cfg.imageA && cfg.imageB ? (
          <img src={side === 'a' ? cfg.imageA : cfg.imageB} alt={`Picture ${side === 'a' ? 1 : 2}`} className="pointer-events-none block h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="pointer-events-none h-full w-full">
            <PicnicScene variant={side} />
          </div>
        )}

        {cfg.differences.map((d, i) =>
          found.includes(i) || hint === i ? (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: hint === i ? [1, 1.15, 1] : 1 }}
              transition={hint === i ? { repeat: Infinity, duration: 0.8 } : { type: 'spring', stiffness: 400, damping: 15 }}
              className={`pointer-events-none absolute rounded-full border-[3px] ${found.includes(i) ? 'border-berry-600 bg-blush-300/20 shadow-[0_0_0_3px_rgba(255,255,255,0.8)]' : 'border-dashed border-honey-400 bg-honey-200/30'}`}
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.r * 2}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%' }}
            />
          ) : null,
        )}

        <AnimatePresence>
          {misses
            .filter((m) => m.side === side)
            .map((m) => (
              <motion.span
                key={m.id}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-bold text-cocoa-500"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                ✗
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3">
        <span className="chip text-base" data-testid="spot-progress">🔍 Found {found.length} / {total}</span>
        <div className="flex gap-1" aria-hidden="true">
          {cfg.differences.map((_, i) => (
            <span key={i} className={`h-3 w-3 rounded-full ${i < found.length ? 'bg-berry-500' : 'bg-blush-200'}`} />
          ))}
        </div>
      </div>
      <div className="grid w-full gap-4 md:grid-cols-2 md:gap-6">
        {panel('a')}
        {panel('b')}
      </div>
      <ul className="flex flex-wrap justify-center gap-2" aria-live="polite">
        {found.map((i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="chip bg-sage-200">
            ✓ {cfg.differences[i].label}
          </motion.li>
        ))}
      </ul>
      {!done && (
        <button type="button" className="btn-ghost" onClick={showHint}>
          🙈 I need a hint
        </button>
      )}
    </div>
  );
}
