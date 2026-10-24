import { useEffect, useRef, useState } from 'react';
import { memoryCards, memoryFlipBackDelay } from '../content/content';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { Basketball } from '../art/Decor';
import { Bao, Duck } from '../art/Critters';
import { CardBack, CardFace } from '../art/PlayingCard';
import { useChoices } from '../lib/choices';
import type { LevelProps } from '.';

interface Card {
  uid: number;
  pair: number;
}

// Poker look: each pair gets its own playing-card rank and suit.
const POKER_RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
const POKER_SUITS = ['♥', '♠', '♦', '♣'];

function CardPicture({ item, className }: { item: (typeof memoryCards)[number]; className: string }) {
  if (item.art === 'bao') return <Bao className={className} />;
  if (item.art === 'duck') return <Duck className={className} />;
  if (item.art === 'basketball') return <Basketball className={className} />;
  return null;
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
  const poker = useChoices().memoryCards === 'poker';

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
                {poker ? (
                  <>
                    <div className="flip-face absolute inset-0">
                      <CardBack />
                    </div>
                    <div className={`flip-face flip-back absolute inset-0 text-sm sm:text-xl ${isMatched ? 'drop-shadow-[0_0_6px_rgba(127,182,133,0.9)]' : ''}`}>
                      <CardFace
                        label={POKER_RANKS[card.pair % POKER_RANKS.length]}
                        suit={POKER_SUITS[card.pair % POKER_SUITS.length]}
                        red={card.pair % 2 === 0}
                        className={isMatched ? 'border-[3px] border-sage-400' : ''}
                      >
                        {content.art ? <CardPicture item={content} className="h-[3.2em] w-[3.2em] drop-shadow-[0_2px_2px_rgba(122,31,61,0.35)]" /> : <span className="text-[2em] leading-none sm:text-[2.2em]">{content.emoji}</span>}
                        <span className="mt-1 text-center break-words font-display text-[0.55em] font-semibold leading-tight text-berry-600 [overflow-wrap:anywhere] sm:text-[0.65em]">{content.label}</span>
                      </CardFace>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flip-face absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-4 border-berry-600 bg-blush-300 shadow-pop">
                      <div className="absolute inset-2 rounded-xl border-2 border-dashed border-cream-50/70" />
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '14px 14px' }} />
                      <Basketball className="relative h-12 w-12 sm:h-16 sm:w-16" />
                    </div>
                    <div className={`flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-4 p-2 shadow-card ${isMatched ? 'border-sage-500 bg-sage-200' : 'border-blush-400 bg-cream-50'}`}>
                      {content.art ? <CardPicture item={content} className="h-14 w-14 drop-shadow-[0_2px_2px_rgba(122,31,61,0.35)] sm:h-20 sm:w-20" /> : <span className="text-4xl sm:text-6xl">{content.emoji}</span>}
                      <span className="text-center font-display text-xs font-semibold leading-tight text-berry-600 sm:text-base">{content.label}</span>
                    </div>
                  </>
                )}
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
