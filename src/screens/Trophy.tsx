import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { finale, people } from '../content/content';
import { letter } from '../content/letter';
import { celebrate, hearts } from '../lib/confetti';
import { sfx } from '../lib/sound';
import { navigate } from '../lib/router';
import { Basketball, Heart, Sparkle, Trophy as TrophyArt } from '../art/Decor';
import { useProgress } from '../lib/progress';
import { DEV_TOOLS } from '../lib/devmode';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { Sentences } from '../components/Sentences';

export default function Trophy() {
  const { isCompleted } = useProgress();
  const earned = isCompleted(TOTAL_LEVELS) || DEV_TOOLS;
  useEffect(() => {
    if (!earned) navigate({ name: 'map' });
  }, [earned]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      celebrate(3500);
      sfx.fanfare();
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLetter = () => {
    setOpen(true);
    sfx.success();
    hearts();
  };

  if (!earned) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-4 sm:pt-6">
      <nav className="mb-2" aria-label="Level navigation">
        <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'level', level: 11 })} data-testid="back-level-top">
          ← Level 11
        </button>
      </nav>
      {/* Headline */}
      <div className="relative text-center">
        <Sparkle className="absolute left-2 top-0 h-10 w-10 animate-wiggle sm:left-10" />
        <Sparkle className="absolute right-4 top-12 h-7 w-7 animate-wiggle sm:right-16" color="#E2688A" />
        <motion.div initial={{ scale: 0, rotate: -20, y: 40 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="mx-auto mb-2 flex w-fit flex-col items-center">
          <TrophyArt className="h-48 w-40 drop-shadow-[0_10px_12px_rgba(94,22,48,0.35)] sm:h-56 sm:w-48" />
          <span className="mt-2 rounded-full bg-berry-600 px-4 py-1 font-sport text-xl tracking-[0.2em] text-honey-300">{finale.trophyTitle}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="bg-gradient-to-r from-berry-600 via-blush-500 to-berry-600 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl"
        >
          {finale.heading}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-3 font-hand text-3xl text-berry-500">
          <Sentences text={finale.subheading} />
        </motion.p>
      </div>

      {/* Envelope / Letter */}
      <div className="mt-10">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="envelope"
              type="button"
              onClick={openLetter}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              whileHover={{ scale: 1.03, rotate: -1 }}
              className="group relative mx-auto block aspect-[3/2] w-full max-w-md"
              aria-label="Open the letter"
              data-testid="open-letter"
            >
              <div className="absolute inset-0 rounded-3xl border-4 border-berry-600 bg-blush-200 shadow-pop" />
              <div className="absolute inset-x-1 top-1 h-[58%] rounded-t-[20px] bg-blush-300" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
              <div className="absolute inset-x-1 bottom-1 h-[60%] rounded-b-[20px] bg-blush-100" style={{ clipPath: 'polygon(0 100%, 50% 15%, 100% 100%)' }} />
              <div className="absolute left-1/2 top-[48%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-berry-700 bg-berry-500 shadow-lg transition group-hover:scale-110">
                <Heart className="h-8 w-8" color="#FDE6EC" />
              </div>
              <span className="absolute inset-x-0 bottom-5 text-center font-hand text-2xl font-bold text-berry-600 sm:text-3xl">{finale.envelopeLabel}</span>
            </motion.button>
          ) : (
            <motion.article
              key="letter"
              initial={{ opacity: 0, y: 40, rotateX: -25 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="letter-paper relative mx-auto max-w-2xl rounded-[24px] border-2 border-blush-200 px-6 py-10 shadow-card sm:px-14 sm:py-14"
              data-testid="letter"
            >
              <Basketball className="absolute -top-6 left-1/2 h-12 w-12 -translate-x-1/2" />
              <div className="absolute bottom-0 left-8 top-0 w-px bg-blush-300/60 sm:left-10" aria-hidden="true" />
              <p className="font-hand text-4xl font-bold text-berry-600">{letter.greeting}</p>
              <div className="mt-4 space-y-5 font-hand text-[1.7rem] leading-[36px] text-berry-700">
                {letter.paragraphs.map((p, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.35 }} className="whitespace-pre-line">
                    {p}
                  </motion.p>
                ))}
              </div>
              <div className="mt-8 text-right font-hand text-3xl text-berry-600">
                <p>{letter.closing}</p>
                <p className="mt-1 text-5xl font-bold text-blush-500">{letter.signature} 💗</p>
              </div>
              {letter.postscript && <p className="mt-6 font-hand text-2xl text-berry-400">{letter.postscript}</p>}
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {/* Bonus link */}
      {open && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-14">
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-[28px] border-4 border-dashed border-berry-500 bg-gradient-to-br from-honey-200 via-cream-50 to-blush-200 p-6 text-center shadow-card sm:p-8">
            <Sparkle className="absolute left-4 top-4 h-6 w-6 animate-wiggle" />
            <Sparkle className="absolute bottom-4 right-5 h-8 w-8 animate-wiggle" color="#E2688A" />
            <p className="font-display text-3xl font-bold tracking-wide text-berry-600">✨ {finale.bonusTitle} ✨</p>
            <p className="mt-2 text-berry-500"><Sentences text={finale.bonusText} /></p>
            <button type="button" className="btn-primary mt-5" onClick={() => navigate({ name: 'bonus' })} data-testid="bonus-link">
              {finale.bonusButton}
            </button>
          </div>
        </motion.section>
      )}

      <div className="mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-soft" onClick={() => navigate({ name: 'level', level: 11 })} data-testid="back-level">
            ← Back
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'map' })}>
            🏆 Replay any level
          </button>
        </div>
        <p className="mt-2 font-hand text-2xl text-berry-400">Happy birthday, {people.nickname}. I love you. 💞</p>
      </div>
    </div>
  );
}
