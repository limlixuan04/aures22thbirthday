import { motion } from 'framer-motion';
import { levels, finale } from '../content/content';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { sfx } from '../lib/sound';

export function MapScreen() {
  const { isCompleted, canAccess, nextLevel, completed } = useProgress();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <h1 className="text-center text-4xl font-bold text-berry-600 sm:text-5xl">The Adventure Map 🗺️</h1>
      <p className="mt-2 text-center text-berry-500">
        {completed.length} of {TOTAL_LEVELS} complete. Revisit any level you’ve beaten!
      </p>

      <ol className="relative mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l, i) => {
          const done = isCompleted(l);
          const open = canAccess(l);
          const current = l === nextLevel && !done;
          const t = levels[l];
          return (
            <motion.li key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={l === 11 ? 'col-span-2 sm:col-span-3 lg:col-span-1' : ''}>
              <button
                type="button"
                disabled={!open}
                onClick={() => {
                  sfx.click();
                  navigate({ name: 'level', level: l });
                }}
                className={`group relative flex h-full w-full flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition ${
                  done
                    ? 'border-berry-400 bg-blush-100 hover:-translate-y-1'
                    : current
                      ? 'border-berry-500 bg-cream-50 shadow-card ring-4 ring-blush-200 hover:-translate-y-1'
                      : 'cursor-not-allowed border-dashed border-blush-300 bg-cream-50/60 opacity-70'
                }`}
                aria-label={`Level ${l}: ${t.title}${done ? ' (complete)' : open ? '' : ' (locked)'}`}
              >
                <span className={`grid h-14 w-14 place-items-center rounded-full text-3xl ${done ? 'bg-berry-500' : 'bg-blush-200'} ${current ? 'animate-bob' : ''}`}>
                  {open ? t.emoji : '🔒'}
                </span>
                <span className="font-display text-sm font-semibold text-berry-400">Level {l}</span>
                <span className="font-display text-base font-semibold leading-tight text-berry-600">{open ? t.title : '???'}</span>
                {done && <span className="chip bg-berry-500 text-cream-50">♥ Done</span>}
                {current && <span className="chip">▶ Play now</span>}
              </button>
            </motion.li>
          );
        })}
      </ol>

      {isCompleted(11) && (
        <div className="mt-10 text-center">
          <button type="button" className="btn-soft" onClick={() => navigate({ name: 'bonus' })}>
            ✨ {finale.bonusTitle}
          </button>
        </div>
      )}
    </div>
  );
}
