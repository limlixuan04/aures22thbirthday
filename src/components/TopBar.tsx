import { siteTitle } from '../content/content';
import { useProgress } from '../lib/progress';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { navigate } from '../lib/router';
import { Bow } from '../art/Decor';
import { MuteButton } from './MuteButton';

export function TopBar({ currentLevel }: { currentLevel?: number }) {
  const { completed, unlocked } = useProgress();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-blush-200 bg-cream-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          className="flex shrink-0 items-center gap-1.5 rounded-xl font-display text-lg font-semibold text-berry-600"
          disabled={!unlocked}
        >
          <Bow className="h-6 w-9" />
          <span className="hidden md:inline">{siteTitle}</span>
        </button>

        {unlocked && (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="font-display text-sm font-semibold text-berry-500" aria-live="polite">
              {currentLevel ? `Level ${currentLevel} of ${TOTAL_LEVELS}` : `${completed.length} of ${TOTAL_LEVELS} levels complete`}
            </div>
            <ol className="flex items-center gap-1" aria-label="Level progress">
              {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l) => {
                const done = completed.includes(l);
                const here = l === currentLevel;
                return (
                  <li
                    key={l}
                    aria-label={`Level ${l}${done ? ' complete' : ''}${here ? ' (current)' : ''}`}
                    className={`h-2.5 rounded-full transition-all sm:h-3 ${here ? 'w-6 sm:w-8' : 'w-2.5 sm:w-3'} ${
                      done ? 'bg-berry-500' : here ? 'bg-blush-400' : 'bg-blush-200'
                    }`}
                  />
                );
              })}
            </ol>
          </div>
        )}
        {!unlocked && <div className="flex-1" />}

        <div className="flex shrink-0 items-center gap-2">
          {unlocked && (
            <button type="button" onClick={() => navigate({ name: 'map' })} className="chip border-2 border-blush-300 bg-cream-50 py-1.5 text-base hover:bg-blush-100">
              <span aria-hidden="true">🗺️</span>
              <span className="hidden sm:inline">Map</span>
            </button>
          )}
          <MuteButton />
        </div>
      </div>
    </header>
  );
}
