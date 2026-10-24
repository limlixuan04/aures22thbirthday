import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import type { LevelText } from '../content/content';
import { Sparkle } from '../art/Decor';

interface Props {
  level: number;
  text: LevelText;
  done: boolean;
  alreadyBeaten: boolean;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode;
}

export function LevelShell({ level, text, done, alreadyBeaten, onNext, onBack, children }: Props) {
  const canGoForward = done || alreadyBeaten;
  const backLabel = level === 1 ? 'Welcome' : `Level ${level - 1}`;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:pt-6">
      <nav className="mb-2 flex items-center justify-between" aria-label="Level navigation">
        <button type="button" className="btn-ghost" onClick={onBack} data-testid="back-level-top">
          ← {backLabel}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onNext}
          disabled={!canGoForward}
          title={canGoForward ? undefined : 'Finish this level to unlock the next one'}
        >
          {canGoForward ? `Level ${level + 1} →` : `🔒 Level ${level + 1}`}
        </button>
      </nav>
      <div className="mb-6 text-center">
        <span className="chip mb-3">
          <span aria-hidden="true">{text.emoji}</span> Level {level}
        </span>
        <h1 className="text-3xl font-bold text-berry-600 sm:text-5xl">{text.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-berry-500 sm:text-lg">{text.instructions}</p>
        {alreadyBeaten && !done && (
          <p className="mt-2 font-hand text-xl text-blush-500">You’ve already beaten this one — play again just for fun! ✨</p>
        )}
      </div>

      <section className="card relative p-4 sm:p-8" aria-label={`Level ${level} game`}>
        {children}
      </section>

      <div className="mt-6 flex flex-col items-center gap-4">
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative rounded-3xl border-2 border-sage-300 bg-sage-200/60 px-6 py-4 text-center"
              role="status"
            >
              <Sparkle className="absolute -left-3 -top-3 h-7 w-7 animate-wiggle" />
              <Sparkle className="absolute -bottom-2 -right-3 h-5 w-5 animate-wiggle" color="#E2688A" />
              <p className="font-display text-xl font-semibold text-berry-600">Level complete! 🎉</p>
              <p className="mt-1 text-berry-500">{text.success}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" className="btn-soft" onClick={onBack} data-testid="back-level">
            ← Back
          </button>
          <button type="button" className="btn-primary min-w-[220px] text-xl" disabled={!canGoForward} onClick={onNext} data-testid="next-level">
            {level === 10 ? 'Open Level 11 💌' : 'Next Level →'}
          </button>
        </div>
        {!canGoForward && <p className="text-sm text-cocoa-500">🔒 The next level unlocks when you finish this one.</p>}
      </div>
    </div>
  );
}
