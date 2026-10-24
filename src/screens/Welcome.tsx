import { motion } from 'framer-motion';
import { welcome, people, finale } from '../content/content';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { sfx } from '../lib/sound';
import { Bow, Heart, Sparkle } from '../art/Decor';
import { Bear, Duck } from '../art/Critters';

export function Welcome() {
  const { completed, nextLevel } = useProgress();
  const started = completed.length > 0;
  const allDone = completed.includes(TOTAL_LEVELS);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
        <div className="relative mx-auto mb-2 flex w-fit items-end gap-2">
          <Duck className="h-14 w-14 animate-bob" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="relative grid h-28 w-28 place-items-center rounded-full border-4 border-berry-600 bg-blush-200 shadow-pop sm:h-32 sm:w-32">
              <span className="font-display text-6xl font-bold text-berry-600 sm:text-7xl">{people.age}</span>
              <Bow className="absolute -top-6 left-1/2 h-10 w-16 -translate-x-1/2" />
            </div>
          </motion.div>
          <Bear className="h-14 w-14 animate-bob [animation-delay:-1.2s]" />
        </div>
        <Sparkle className="absolute left-4 top-6 h-8 w-8 animate-wiggle sm:left-16" />
        <Sparkle className="absolute right-6 top-20 h-6 w-6 animate-wiggle sm:right-20" color="#E2688A" />
        <h1 className="mt-6 text-4xl font-bold leading-tight text-berry-600 sm:text-6xl">
          {welcome.heading.split(' ').map((w, i) => (
            <motion.span key={i} className="inline-block" initial={{ opacity: 0, y: 20, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
              {w}&nbsp;
            </motion.span>
          ))}
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="card mt-8 p-6 sm:p-10">
        <div className="space-y-4 text-lg leading-relaxed text-berry-600">
          {welcome.message.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="mt-4 text-right font-hand text-3xl text-blush-500">{welcome.signoff}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={`${TOTAL_LEVELS} levels`}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => (
            <span
              key={i}
              className={`grid h-9 w-9 place-items-center rounded-full border-2 font-display text-sm font-bold ${
                completed.includes(i + 1) ? 'border-berry-500 bg-berry-500 text-cream-50' : 'border-blush-300 bg-blush-50 text-berry-400'
              }`}
            >
              {completed.includes(i + 1) ? '♥' : i + 1}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-cocoa-500">{TOTAL_LEVELS} levels to complete · progress saves automatically</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          className="btn-primary px-10 py-4 text-2xl"
          data-testid="start-adventure"
          onClick={() => {
            sfx.success();
            navigate({ name: 'level', level: nextLevel });
          }}
        >
          <Heart className="h-6 w-6" color="#F6B3C4" />
          {allDone ? 'Read My Letter Again' : started ? `${welcome.continueButton} (Level ${nextLevel})` : welcome.startButton}
        </button>
        {started && (
          <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'map' })}>
            🗺️ View the level map
          </button>
        )}
        {allDone && (
          <button type="button" className="btn-soft" onClick={() => navigate({ name: 'bonus' })}>
            ✨ {finale.bonusTitle}
          </button>
        )}
      </motion.div>
    </div>
  );
}
