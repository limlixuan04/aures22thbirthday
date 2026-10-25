import { motion } from 'framer-motion';
import { finale, tipOff } from '../content/content';
import { levelTextFor, useChoices } from '../lib/choices';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { sfx } from '../lib/sound';

export function MapScreen() {
  const { isCompleted, canAccess, nextLevel, completed } = useProgress();
  const choices = useChoices();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <h1 className="text-center text-4xl font-bold text-berry-600 sm:text-5xl">Road to the Championship 🏆</h1>
      <p className="mt-2 text-center text-berry-500">
        {completed.length} of {TOTAL_LEVELS} challenges won · {completed.length * 2} points. Revisit any level you’ve beaten!
      </p>

      <ol className="relative mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <motion.li initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button
            type="button"
            onClick={() => {
              sfx.click();
              navigate({ name: 'tipoff' });
            }}
            className={`group relative flex h-full w-full flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition hover:-translate-y-1 ${
              completed.length ? 'border-berry-400 bg-blush-100' : 'border-berry-500 bg-cream-50 shadow-card ring-4 ring-blush-200'
            }`}
            aria-label={`${tipOff.title}: the game plan`}
            data-testid="tipoff-node"
          >
            <span className={`grid h-14 w-14 place-items-center rounded-full text-3xl ${completed.length ? 'bg-ball-300' : 'bg-blush-200 animate-bob'}`}>{tipOff.emoji}</span>
            <span className="font-display text-sm font-semibold text-berry-400">Intro</span>
            <span className="font-display text-base font-semibold leading-tight text-berry-600">{tipOff.title}</span>
            {completed.length ? <span className="chip bg-ball-400 text-white">🏀 Swish!</span> : <span className="chip">▶ Start here</span>}
          </button>
        </motion.li>
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l, i) => {
          const done = isCompleted(l);
          const open = canAccess(l);
          const current = l === nextLevel && !done;
          const t = levelTextFor(l, choices);
          return (
            <motion.li key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.04 }} >
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
                <span className={`grid h-14 w-14 place-items-center rounded-full text-3xl ${done ? 'bg-ball-300' : 'bg-blush-200'} ${current ? 'animate-bob' : ''}`}>
                  {open ? t.emoji : '🔒'}
                </span>
                <span className="font-display text-sm font-semibold text-berry-400">Level {l}</span>
                <span className="font-display text-base font-semibold leading-tight text-berry-600">{open ? t.title : '???'}</span>
                {done && <span className="chip bg-ball-400 text-white">🏀 Swish!</span>}
                {current && <span className="chip">▶ Play now</span>}
              </button>
            </motion.li>
          );
        })}
      </ol>

      <button
        type="button"
        disabled={!isCompleted(TOTAL_LEVELS)}
        onClick={() => navigate({ name: 'trophy' })}
        className={`mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-4 rounded-3xl border-4 p-4 transition ${
          isCompleted(TOTAL_LEVELS) ? 'border-honey-400 bg-gradient-to-br from-honey-200 to-cream-50 shadow-card hover:-translate-y-1' : 'cursor-not-allowed border-dashed border-blush-300 bg-cream-50/60 opacity-70'
        }`}
        data-testid="trophy-node"
      >
        <span className="text-5xl">{isCompleted(TOTAL_LEVELS) ? '🏆' : '🔒'}</span>
        <span className="text-left">
          <span className="block font-sport text-2xl tracking-wide text-berry-600">The Championship Trophy</span>
          <span className="block text-sm text-berry-400">{isCompleted(TOTAL_LEVELS) ? 'You won it! Tap to see your trophy & letter.' : 'Win all 11 challenges to claim it.'}</span>
        </span>
      </button>

      {isCompleted(TOTAL_LEVELS) && (
        <div className="mt-6 text-center">
          <button type="button" className="btn-soft" onClick={() => navigate({ name: 'bonus' })}>
            ✨ {finale.bonusTitle}
          </button>
        </div>
      )}
    </div>
  );
}
