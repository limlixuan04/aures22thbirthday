import { motion, AnimatePresence } from 'framer-motion';
import { scoreboard, siteTitle } from '../content/content';
import { useProgress } from '../lib/progress';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { navigate } from '../lib/router';
import { Basketball } from '../art/Decor';
import { MuteButton } from './MuteButton';

/** Arena-style scoreboard: AURE [points] : 0 THE WORLD. */
function Scoreboard({ points, currentLevel, completed }: { points: number; currentLevel?: number; completed: number[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center gap-2 rounded-xl border-2 border-[#45101F] bg-[#2A1A20] px-2.5 py-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] sm:gap-3 sm:px-4"
        role="status"
        aria-label={`Score: ${scoreboard.homeTeam} ${points}, ${scoreboard.awayTeam} 0`}
        data-testid="scoreboard"
        data-points={points}
      >
        <span className="font-display text-[11px] font-bold tracking-[0.15em] text-cream-100 sm:text-sm">{scoreboard.homeTeam}</span>
        <span className="relative grid h-8 w-11 place-items-center overflow-hidden rounded-md bg-black/50 sm:h-9 sm:w-14">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={points}
              initial={{ y: 18, opacity: 0, scale: 1.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="font-display text-2xl font-bold tabular-nums text-ball-400 [text-shadow:0_0_8px_rgba(238,138,60,0.85)] sm:text-[1.7rem]"
            >
              {points}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="font-display text-xl font-bold text-honey-300">:</span>
        <span className="grid h-8 w-11 place-items-center rounded-md bg-black/50 sm:h-9 sm:w-14">
          <span className="font-display text-2xl font-bold tabular-nums text-ball-400/80 [text-shadow:0_0_8px_rgba(238,138,60,0.6)] sm:text-[1.7rem]">0</span>
        </span>
        <span className="font-display text-[11px] font-bold tracking-[0.15em] text-cream-100 sm:text-sm">{scoreboard.awayTeam}</span>
      </div>
      <ol className="flex items-center gap-1" aria-label="Level progress">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l) => {
          const done = completed.includes(l);
          const here = l === currentLevel;
          return (
            <li
              key={l}
              aria-label={`Level ${l}${done ? ' complete' : ''}${here ? ' (current)' : ''}`}
              className={`h-1.5 rounded-full transition-all ${here ? 'w-5' : 'w-1.5 sm:w-2'} ${done ? 'bg-ball-400' : here ? 'bg-blush-400' : 'bg-blush-200'}`}
            />
          );
        })}
      </ol>
    </div>
  );
}

export function TopBar({ currentLevel }: { currentLevel?: number }) {
  const { completed, unlocked } = useProgress();
  const points = completed.length * scoreboard.pointsPerLevel;
  return (
    <header className="sticky top-0 z-30 border-b-2 border-blush-200 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-xl text-left md:w-60"
          disabled={!unlocked}
          aria-label="Back to the start"
        >
          <Basketball className="h-8 w-8 shrink-0" />
          {unlocked ? (
            <span className="hidden flex-col leading-tight md:flex">
              <span className="font-display text-[10px] font-bold tracking-[0.2em] text-ball-500">{scoreboard.eyebrow}</span>
              <span className="font-display text-base font-bold text-berry-600">{scoreboard.title}</span>
              <span className="text-[11px] text-berry-400">{scoreboard.tagline}</span>
            </span>
          ) : (
            <span className="hidden font-display text-lg font-semibold text-berry-600 md:inline">{siteTitle}</span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 justify-center">{unlocked && <Scoreboard points={points} currentLevel={currentLevel} completed={completed} />}</div>

        <div className="flex shrink-0 items-center gap-2 md:w-60 md:justify-end">
          {unlocked && (
            <button type="button" onClick={() => navigate({ name: 'map' })} className="chip border-2 border-blush-300 bg-cream-50 py-1.5 text-base hover:bg-blush-100">
              <span aria-hidden="true">🏆</span>
              <span className="hidden sm:inline">The Road</span>
            </button>
          )}
          <MuteButton />
        </div>
      </div>
      {unlocked && (
        <p className="pb-1.5 text-center font-display text-[10px] font-bold tracking-[0.18em] text-ball-500 md:hidden">
          {scoreboard.eyebrow} · {scoreboard.title}
        </p>
      )}
    </header>
  );
}
