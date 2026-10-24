import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { finale, people } from '../content/content';
import { letter } from '../content/letter';
import { celebrate, hearts } from '../lib/confetti';
import { sfx } from '../lib/sound';
import { navigate } from '../lib/router';
import { Basketball, Heart, Sparkle } from '../art/Decor';
import { Bear, Duck } from '../art/Critters';

export default function Finale({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    onComplete();
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

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-4 sm:pt-6">
      <nav className="mb-2" aria-label="Level navigation">
        <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'level', level: 10 })} data-testid="back-level-top">
          ← Level 10
        </button>
      </nav>
      {/* Headline */}
      <div className="relative text-center">
        <Sparkle className="absolute left-2 top-0 h-10 w-10 animate-wiggle sm:left-10" />
        <Sparkle className="absolute right-4 top-12 h-7 w-7 animate-wiggle sm:right-16" color="#E2688A" />
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }} className="mx-auto mb-4 flex w-fit items-end gap-3">
          <Duck className="h-14 w-14 animate-bob" happy />
          <Heart className="h-20 w-20 animate-floaty" />
          <Bear className="h-14 w-14 animate-bob [animation-delay:-1s]" />
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
          {finale.subheading}
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

      {/* Gallery */}
      {open && finale.gallery.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-14">
          <h2 className="text-center text-3xl font-bold text-berry-600">{finale.galleryTitle}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {finale.gallery.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setZoom(i)}
                className="group rounded-lg bg-white p-2 pb-3 shadow-card transition hover:z-10 hover:scale-105"
                style={{ rotate: `${[-3, 2, -1.5, 3][i % 4]}deg` }}
                aria-label={`View photo: ${photo.caption}`}
              >
                <img src={photo.src} alt={photo.caption} className="aspect-square w-full rounded object-cover" loading="lazy" />
                <p className="mt-2 font-hand text-xl text-berry-600">{photo.caption}</p>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      <AnimatePresence>
        {zoom !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-berry-800/70 p-4 backdrop-blur-sm"
            onClick={() => setZoom(null)}
            role="dialog"
            aria-label="Photo"
          >
            <motion.figure initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-xl rounded-xl bg-white p-3 pb-4 shadow-2xl">
              <img src={finale.gallery[zoom].src} alt={finale.gallery[zoom].caption} className="max-h-[70vh] w-full rounded object-contain" />
              <figcaption className="mt-2 text-center font-hand text-2xl text-berry-600">{finale.gallery[zoom].caption}</figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bonus link */}
      {open && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-14">
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-[28px] border-4 border-dashed border-berry-500 bg-gradient-to-br from-honey-200 via-cream-50 to-blush-200 p-6 text-center shadow-card sm:p-8">
            <Sparkle className="absolute left-4 top-4 h-6 w-6 animate-wiggle" />
            <Sparkle className="absolute bottom-4 right-5 h-8 w-8 animate-wiggle" color="#E2688A" />
            <p className="font-display text-3xl font-bold tracking-wide text-berry-600">✨ {finale.bonusTitle} ✨</p>
            <p className="mt-2 text-berry-500">{finale.bonusText}</p>
            <button type="button" className="btn-primary mt-5" onClick={() => navigate({ name: 'bonus' })} data-testid="bonus-link">
              {finale.bonusButton}
            </button>
            <p className="mt-3 text-xs text-cocoa-500">
              Bookmark it: <span className="font-mono">{window.location.origin}{window.location.pathname}#/bonus</span>
            </p>
          </div>
        </motion.section>
      )}

      <div className="mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-soft" onClick={() => navigate({ name: 'level', level: 10 })} data-testid="back-level">
            ← Back
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'map' })}>
            🗺️ Replay any level
          </button>
        </div>
        <p className="mt-2 font-hand text-2xl text-berry-400">Happy birthday, {people.nickname}. I love you. 💞</p>
      </div>
    </div>
  );
}
