import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quiz } from '../content/content';
import { sfx } from '../lib/sound';
import { hearts } from '../lib/confetti';
import type { LevelProps } from '.';

const LETTERS = ['a', 'b', 'c', 'd'];

export default function Level01Quiz({ onComplete }: LevelProps) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const q = quiz[index];

  const choose = (i: number) => {
    if (correct || wrong.includes(i)) return;
    if (i === q.correctIndex) {
      setCorrect(true);
      sfx.good();
      hearts();
    } else {
      setWrong((w) => [...w, i]);
      sfx.error();
    }
  };

  const next = () => {
    sfx.click();
    if (index + 1 >= quiz.length) {
      setFinished(true);
      onComplete();
      return;
    }
    setIndex(index + 1);
    setWrong([]);
    setCorrect(false);
  };

  const restart = () => {
    setIndex(0);
    setWrong([]);
    setCorrect(false);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="py-10 text-center">
        <div className="text-6xl">🏅</div>
        <p className="mt-3 font-display text-2xl font-semibold text-berry-600">All {quiz.length} questions answered!</p>
        <p className="mt-1 font-hand text-2xl text-blush-500">Certified Aure expert (self-certified, but still).</p>
        <button className="btn-ghost mt-4" onClick={restart}>Play the quiz again</button>
      </div>
    );
  }

  const feedback = correct ? q.correctFeedback : wrong.length ? q.wrongFeedback : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between font-display text-sm font-semibold text-berry-400">
        <span>Question {index + 1} of {quiz.length}</span>
        <div className="flex gap-1.5" aria-hidden="true">
          {quiz.map((_, i) => (
            <span key={i} className={`h-2.5 w-8 rounded-full ${i < index || (i === index && correct) ? 'bg-berry-500' : i === index ? 'bg-blush-300' : 'bg-blush-100'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h2 className="text-center text-2xl font-semibold text-berry-600 sm:text-3xl">{q.question}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isWrong = wrong.includes(i);
              const isRight = correct && i === q.correctIndex;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={isWrong || correct}
                  animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : isRight ? { scale: [1, 1.06, 1] } : {}}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg transition ${
                    isRight
                      ? 'border-sage-500 bg-sage-200 text-berry-700'
                      : isWrong
                        ? 'border-blush-200 bg-blush-50 text-berry-300 line-through'
                        : correct
                          ? 'border-blush-100 bg-cream-50 text-berry-300'
                          : 'border-blush-200 bg-white text-berry-600 hover:-translate-y-0.5 hover:border-blush-400 hover:bg-blush-50'
                  }`}
                  data-testid={`quiz-option-${i}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-bold ${isRight ? 'bg-sage-500 text-white' : 'bg-blush-100 text-berry-500'}`}>
                    {isRight ? '✓' : isWrong ? '✗' : LETTERS[i]}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 min-h-[3.5rem] text-center" aria-live="polite">
        {feedback && (
          <motion.p key={feedback + wrong.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`font-hand text-2xl sm:text-3xl ${correct ? 'text-berry-600' : 'text-blush-500'}`}>
            {feedback}
          </motion.p>
        )}
      </div>
      {correct && (
        <div className="text-center">
          <button type="button" className="btn-soft" onClick={next} data-testid="quiz-next">
            {index + 1 >= quiz.length ? 'Finish quiz 🎉' : 'Next question →'}
          </button>
        </div>
      )}
    </div>
  );
}
