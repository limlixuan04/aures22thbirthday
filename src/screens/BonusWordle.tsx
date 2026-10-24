import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wordle } from '../content/content';
import { keyboardStates, scoreGuess, type LetterState } from '../lib/wordle';
import { load, save } from '../lib/storage';
import { sfx } from '../lib/sound';
import { celebrate } from '../lib/confetti';
import { navigate } from '../lib/router';
import { Sparkle } from '../art/Decor';

const ANSWER = wordle.answer.toUpperCase();
const LEN = ANSWER.length;

interface Saved {
  guesses: string[];
  cluesShown: number;
  solved: boolean;
  rounds: number;
}

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const TILE_COLOURS: Record<LetterState | 'empty' | 'typing', string> = {
  correct: 'bg-sage-400 border-sage-500 text-white',
  present: 'bg-honey-300 border-honey-400 text-berry-700',
  absent: 'bg-cocoa-300 border-cocoa-400 text-white',
  empty: 'bg-cream-50 border-blush-200 text-berry-600',
  typing: 'bg-white border-berry-300 text-berry-600 scale-105',
};

function splitGroups<T>(items: T[]): T[][] {
  const out: T[][] = [];
  let i = 0;
  for (const g of wordle.groups) {
    out.push(items.slice(i, i + g));
    i += g;
  }
  return out;
}

export function BonusWordle() {
  const [state, setState] = useState<Saved>(() => {
    const s = load<Saved | null>('wordle', null);
    const valid = s && Array.isArray(s.guesses) && s.guesses.every((g) => g.length === LEN);
    return valid ? s : { guesses: [], cluesShown: 0, solved: false, rounds: 0 };
  });
  const [current, setCurrent] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(0);
  const [revealRow, setRevealRow] = useState<number | null>(null);

  useEffect(() => save('wordle', state), [state]);

  const outOfGuesses = !state.solved && state.guesses.length >= wordle.maxGuesses;
  const keyStates = useMemo(() => keyboardStates(state.guesses, ANSWER), [state.guesses]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  };

  const submit = useCallback(() => {
    if (state.solved || outOfGuesses) return;
    if (current.length !== LEN) {
      sfx.error();
      setShakeRow((n) => n + 1);
      flash(`Your guess needs ${LEN} letters${wordle.groups.length > 1 ? ` (${wordle.groups.join(' + ')})` : ''} ✍️`);
      return;
    }
    const guesses = [...state.guesses, current];
    const solved = current === ANSWER;
    setRevealRow(guesses.length - 1);
    setState((s) => ({ ...s, guesses, solved }));
    setCurrent('');
    sfx.flip();
    if (solved) {
      window.setTimeout(() => {
        sfx.fanfare();
        celebrate(3500);
      }, LEN * 120 + 400);
    } else if (guesses.length >= wordle.maxGuesses) {
      window.setTimeout(() => sfx.bonk(), LEN * 120 + 300);
    }
  }, [current, state, outOfGuesses]);

  const press = useCallback(
    (key: string) => {
      if (state.solved || outOfGuesses) return;
      if (key === 'ENTER') return submit();
      if (key === 'BACK') return setCurrent((c) => c.slice(0, -1));
      if (/^[A-Z]$/.test(key)) {
        setCurrent((c) => {
          if (c.length >= LEN) return c;
          sfx.click();
          return c + key;
        });
      }
    },
    [state.solved, outOfGuesses, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' '))) return; // let focused buttons work
      if (e.key === 'Enter') press('ENTER');
      else if (e.key === 'Backspace') press('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const showClue = () => {
    sfx.pop();
    setState((s) => ({ ...s, cluesShown: Math.min(s.cluesShown + 1, wordle.clues.length) }));
  };

  const retry = () => {
    sfx.whoosh();
    setRevealRow(null);
    setState((s) => ({ ...s, guesses: [], rounds: s.rounds + 1 }));
  };

  const rows = Array.from({ length: wordle.maxGuesses }, (_, r) => {
    const guess = state.guesses[r];
    if (guess) {
      const sc = scoreGuess(guess, ANSWER);
      return guess.split('').map((ch, i) => ({ ch, st: sc[i] as LetterState | 'empty' | 'typing' }));
    }
    if (r === state.guesses.length && !state.solved) {
      return Array.from({ length: LEN }, (_, i) => ({ ch: current[i] ?? '', st: (current[i] ? 'typing' : 'empty') as LetterState | 'empty' | 'typing' }));
    }
    return Array.from({ length: LEN }, () => ({ ch: '', st: 'empty' as LetterState | 'empty' | 'typing' }));
  });

  return (
    <div className="mx-auto max-w-3xl px-3 pb-16 pt-6 sm:px-4 sm:pt-10">
      <div className="text-center">
        <span className="chip mb-3">✨ Bonus round</span>
        <h1 className="text-4xl font-bold text-berry-600 sm:text-5xl">{wordle.title}</h1>
        <p className="mx-auto mt-2 max-w-xl text-berry-500">{wordle.intro}</p>
      </div>

      <div className="card mt-6 p-4 sm:p-8">
        {/* Board */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2" role="grid" aria-label="Wordle board">
          {rows.map((cells, r) => {
            const isCurrent = r === state.guesses.length && !state.solved;
            return (
              <motion.div
                key={`${r}-${isCurrent ? shakeRow : 0}-${state.rounds}`}
                role="row"
                animate={isCurrent && shakeRow ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="flex gap-3 sm:gap-5"
                aria-label={state.guesses[r] ? `Guess ${r + 1}: ${state.guesses[r]}` : `Row ${r + 1}`}
              >
                {splitGroups(cells.map((c, i) => ({ ...c, i }))).map((group, gi) => (
                  <div key={gi} className="flex gap-1 sm:gap-1.5">
                    {group.map(({ ch, st, i }) => {
                      const revealing = revealRow === r && st !== 'typing' && st !== 'empty';
                      return (
                        <div
                          key={i}
                          role="gridcell"
                          aria-label={ch ? `${ch} ${st === 'typing' || st === 'empty' ? '' : st}` : 'empty'}
                          data-reveal={revealing}
                          style={revealing ? { animationDelay: `${i * 120}ms`, transitionDelay: `${i * 120 + 250}ms` } : undefined}
                          className={`wordle-tile grid h-14 w-14 place-items-center rounded-xl border-2 font-sport text-3xl transition-colors duration-100 sm:h-16 sm:w-16 sm:text-4xl ${TILE_COLOURS[st]}`}
                        >
                          {ch}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 min-h-[1.75rem] text-center font-display text-blush-500" role="status" aria-live="polite">
          {toast}
        </div>

        {/* Success */}
        <AnimatePresence>
          {state.solved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: revealRow !== null ? LEN * 0.12 + 0.4 : 0, type: 'spring' }}
              className="relative mx-auto mt-4 max-w-lg overflow-hidden rounded-[28px] border-4 border-berry-600 bg-gradient-to-br from-blush-100 via-cream-50 to-honey-200 px-6 py-8 text-center shadow-pop"
              data-testid="wordle-success"
            >
              <Sparkle className="absolute left-4 top-4 h-8 w-8 animate-wiggle" />
              <Sparkle className="absolute bottom-5 right-6 h-6 w-6 animate-wiggle" color="#E2688A" />
              <p className="font-display text-lg font-semibold text-berry-400">
                You solved it! The word is <span className="font-bold text-berry-600">{wordle.display}</span>.
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (revealRow !== null ? LEN * 0.12 + 0.6 : 0.2) + 0.4 }}
                className="mt-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-ball-500"
              >
                Now remember these words
              </motion.p>
              <p className="my-2 font-sport text-7xl leading-none tracking-wide text-berry-600 sm:text-8xl" aria-label={wordle.phrase} data-testid="wordle-phrase">
                {wordle.phrase.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ y: 40, opacity: 0, scale: 1.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: (revealRow !== null ? LEN * 0.12 + 0.6 : 0.2) + 0.9 + i * 0.12, type: 'spring', stiffness: 380, damping: 18 }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </motion.span>
                ))}
              </p>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (revealRow !== null ? LEN * 0.12 + 0.6 : 0.2) + 2.2 }} className="font-hand text-3xl leading-snug text-berry-500">{wordle.successMessage}</motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {outOfGuesses && (
          <div className="mx-auto mt-2 max-w-md text-center">
            <p className="text-berry-500">{wordle.outOfGuesses}</p>
            <button type="button" className="btn-primary mt-3" onClick={retry}>
              Try again 🔁
            </button>
          </div>
        )}

        {/* Keyboard */}
        {!state.solved && !outOfGuesses && (
          <div className="mx-auto mt-2 flex max-w-xl flex-col gap-1.5" aria-label="On-screen keyboard">
            {KEY_ROWS.map((row, ri) => (
              <div key={row} className="flex justify-center gap-1 sm:gap-1.5">
                {ri === 2 && (
                  <button type="button" onClick={() => press('ENTER')} className="h-12 rounded-lg bg-berry-600 px-2 font-display text-xs font-bold text-cream-50 sm:h-14 sm:px-4 sm:text-sm">
                    ENTER
                  </button>
                )}
                {row.split('').map((k) => {
                  const st = keyStates[k];
                  const cls = st === 'correct' ? 'bg-sage-400 text-white' : st === 'present' ? 'bg-honey-300 text-berry-700' : st === 'absent' ? 'bg-cocoa-300 text-white/90' : 'bg-blush-100 text-berry-600 hover:bg-blush-200';
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => press(k)}
                      className={`h-12 min-w-0 flex-1 rounded-lg font-display text-base font-bold sm:h-14 sm:max-w-[48px] sm:text-lg ${cls}`}
                      aria-label={`${k}${st ? `, ${st}` : ''}`}
                    >
                      {k}
                    </button>
                  );
                })}
                {ri === 2 && (
                  <button type="button" onClick={() => press('BACK')} className="h-12 rounded-lg bg-blush-300 px-2 font-display text-lg font-bold text-berry-700 sm:h-14 sm:px-4" aria-label="Backspace">
                    ⌫
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Clues */}
        {!state.solved && (
          <div className="mx-auto mt-6 max-w-lg rounded-3xl border-2 border-dashed border-blush-300 bg-blush-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display font-semibold text-berry-600">💡 Stuck? Clues: {state.cluesShown}/{wordle.clues.length}</p>
              <button type="button" className="btn-soft px-4 py-1.5 text-base" onClick={showClue} disabled={state.cluesShown >= wordle.clues.length}>
                Give me a clue
              </button>
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-6 text-berry-500">
              {wordle.clues.slice(0, state.cluesShown).map((c, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  {c}
                </motion.li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-cocoa-500">
          <span>🟩 right spot</span>
          <span>🟨 wrong spot</span>
          <span>⬜ not in the answer</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'home' })}>
          ← Back to the start
        </button>
      </div>
    </div>
  );
}
