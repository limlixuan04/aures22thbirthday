import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { passwordGate } from '../content/content';
import { useProgress } from '../lib/progress';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { Bow, Heart, Sparkle } from '../art/Decor';

export function checkPassword(input: string): boolean {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean(input) === clean(passwordGate.answer);
}

export function PasswordGate() {
  const { unlock } = useProgress();
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [opening, setOpening] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (opening) return;
    if (checkPassword(value)) {
      setOpening(true);
      sfx.fanfare();
      burst({ x: 0.5, y: 0.45 });
      setTimeout(unlock, 1600);
    } else {
      sfx.error();
      setErrors((n) => n + 1);
      setShakeKey((k) => k + 1);
    }
  };

  const error = errors > 0 ? passwordGate.errorMessages[(errors - 1) % passwordGate.errorMessages.length] : null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-lg">
        <Sparkle className="absolute -left-6 -top-6 h-10 w-10 animate-wiggle" />
        <Sparkle className="absolute -right-4 top-10 h-6 w-6 animate-wiggle" color="#E2688A" />

        <motion.div
          key={shakeKey}
          animate={shakeKey ? { x: [0, -10, 10, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="card relative overflow-hidden px-6 pb-8 pt-12 text-center sm:px-10"
        >
          {/* Envelope flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-6 bg-blush-200"
            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
            animate={opening ? { scaleY: -1, y: -12 } : {}}
          />
          <div className="absolute left-1/2 top-2 -translate-x-1/2">
            <Bow className="h-10 w-16" />
          </div>

          <AnimatePresence mode="wait">
            {!opening ? (
              <motion.div key="form" exit={{ opacity: 0, scale: 0.9 }}>
                <h1 className="text-3xl font-bold text-berry-600 sm:text-4xl">{passwordGate.heading}</h1>
                <p className="mt-3 text-berry-500">{passwordGate.prompt}</p>
                <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
                  <label htmlFor="pw" className="sr-only">Secret password</label>
                  <input
                    id="pw"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={passwordGate.placeholder}
                    className="w-full rounded-2xl border-2 border-blush-300 bg-white px-5 py-4 text-center font-display text-xl tracking-[0.2em] text-berry-600 placeholder:tracking-normal placeholder:text-blush-400 focus:border-berry-400 focus:outline-none"
                    aria-describedby="pw-hint pw-error"
                  />
                  <button type="submit" className="btn-primary">{passwordGate.button}</button>
                </form>
                <p id="pw-error" role="alert" className="mt-4 min-h-[1.5rem] font-display text-blush-500">
                  {error}
                </p>
                <p id="pw-hint" className="mt-2 font-hand text-2xl text-berry-400">{passwordGate.hint}</p>
              </motion.div>
            ) : (
              <motion.div key="yay" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} className="mx-auto w-fit">
                  <Heart className="h-24 w-24" />
                </motion.div>
                <p className="mt-4 font-display text-3xl font-bold text-berry-600">{passwordGate.successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
