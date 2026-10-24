import { useEffect, useRef, useState } from 'react';
import { memoryCards, memoryFlipBackDelay } from '../content/content';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { Bow } from '../art/Decor';
import type { LevelProps } from '.';

interface Card {
  uid: number;
  pair: number;
}

const deal = (): Card[] => shuffle(memoryCards.flatMap((_, pair) => [{ uid: pair * 2, pair }, { uid: pair * 2 + 1, pair }]));

export default function Level04Memory({ onComplete }: LevelProps) {
  const [cards, setCards] = useState<Card[]>(deal);
  const [flipped, setFlipped] = useState<number[]>([]); // uids face-up this turn
  const [matched, setMatched] = useState<Set<number>>(new Set()); // pair ids
  const [attempts, setAttempts] = useState(0);
  const [lastMatch, setLastMatch] = useState<string | null>(null);
  const timer = useRef<number>();
  const done = matched.size === memoryCards.length;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flip = (card: Card) => {
    if (flipped.length >= 2 || flipped.includes(card.uid) || matched.has(card.pair)) return;
    sfx.flip();
    const next = [...flipped, card.uid];
    setFlipped(next);
    if (next.length < 2) return;
    setAttempts((a) => a + 1);
    const [a, b] = next.map((uid) => cards.find((c) => c.uid === uid)!);
    if (a.pair === b.pair) {
      const m = new Set(matched).add(a.pair);
      setMatched(m);
      setFlipped([]);
      setLastMatch(memoryCards[a.pair].label);
      sfx.good();
      if (m.size === memoryCards.length) onComplete();
    } else {
      timer.current = window.setTimeout(() => {
        setFlipped([]);
        sfx.flip();
      }, memoryFlipBackDelay);
    }
  };

  const restart = () => {
    window.clearTimeout(timer.current);
    setCards(deal());
    setFlipped([]);
    setMatched(new Set());
    setAttempts(0);
    setLastMatch(null);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip">🔁 Attempts: {attempts}</span>
        <span className="chip">💞 Pairs: {matched.size} / {memoryCards.length}</span>
        <button type="button" className="btn-ghost" onClick={restart}>↺ Shuffle & restart</button>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
        {cards.map((card) => {
          const isMatched = matched.has(card.pair);
          const up = isMatched || flipped.includes(card.uid);
          const content = memoryCards[card.pair];
          return (
            <button
              key={card.uid}
              type="button"
              className="flip-card aspect-[3/4] w-full"
              data-flipped={up}
              onClick={() => flip(card)}
              aria-label={up ? `${content.label}${isMatched ? ' (matched)' : ''}` : 'Face-down card'}
              aria-pressed={up}
              data-testid="memory-card"
              data-pair={card.pair}
            >
              <div className="flip-inner relative h-full w-full">
                <div className="flip-face absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-4 border-berry-600 bg-blush-300 shadow-pop">
                  <div className="absolute inset-2 rounded-xl border-2 border-dashed border-cream-50/70" />
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '14px 14px' }} />
                  <Bow className="relative h-10 w-16 sm:h-12 sm:w-20" color="#FDE6EC" />
                </div>
                <div className={`flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-4 p-2 shadow-card ${isMatched ? 'border-sage-500 bg-sage-200' : 'border-blush-400 bg-cream-50'}`}>
                  <span className="text-4xl sm:text-6xl">{content.emoji}</span>
                  <span className="text-center font-display text-xs font-semibold leading-tight text-berry-600 sm:text-base">{content.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="min-h-[2rem] font-hand text-2xl text-berry-500" aria-live="polite">
        {done ? `All matched in ${attempts} attempts! 🎉` : lastMatch ? `Match! ${lastMatch} 💗` : 'Find the pairs!'}
      </p>
    </div>
  );
}
