import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { people, pokerGame } from '../content/content';
import { compareHands, evaluate, fullDeck, isRed, parseCard, rankLabel, sameCard, SUIT_SYMBOL, type Card } from '../lib/poker';
import { pick, shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { CardBack, CardFace } from '../art/PlayingCard';
import { Bear } from '../art/Critters';
import type { LevelProps } from '.';

type Phase = 'ready' | 'hold' | 'result';

const BAOZERS = pokerGame.baozersHand.map(parseCard);

function Chip({ colour, className = '' }: { colour: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill={colour} stroke="#45101F" strokeWidth="2" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x="18" y="2.5" width="4" height="7" rx="1" fill="#FFFDF8" transform={`rotate(${i * 60} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="10" fill="none" stroke="#FFFDF8" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

function PokerCard({ card }: { card: Card }) {
  return <CardFace label={rankLabel(card.rank)} suit={SUIT_SYMBOL[card.suit]} red={isRed(card.suit)} />;
}

/** Deal 5 cards from the deck that's left after Baozers' hand. A lucky deal starts with a high pair. */
function deal(lucky: boolean): { hand: Card[]; deck: Card[] } {
  let deck = shuffle(fullDeck().filter((c) => !BAOZERS.some((b) => sameCard(b, c))));
  if (lucky) {
    for (const rank of shuffle([11, 12, 13, 14])) {
      const pair = deck.filter((c) => c.rank === rank).slice(0, 2);
      if (pair.length === 2) {
        deck = deck.filter((c) => !pair.includes(c));
        return { hand: shuffle([...pair, ...deck.slice(0, 3)]), deck: deck.slice(3) };
      }
    }
  }
  return { hand: deck.slice(0, 5), deck: deck.slice(5) };
}

export default function Level06Poker({ onComplete }: LevelProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [result, setResult] = useState<{ outcome: 'win' | 'lose' | 'tie'; line: string } | null>(null);
  const [losses, setLosses] = useState(0);
  const [round, setRound] = useState(0);
  const [luckyDeal, setLuckyDeal] = useState(false);
  const deck = useRef<Card[]>([]);
  const won = useRef(false);
  const theirs = useMemo(() => evaluate(BAOZERS), []);
  const lucky = losses >= pokerGame.luckyAfterLosses && !won.current;

  const startRound = () => {
    const d = deal(lucky);
    setLuckyDeal(lucky);
    deck.current = d.deck;
    setHand(d.hand);
    setHeld([false, false, false, false, false]);
    setResult(null);
    setRound((r) => r + 1);
    setPhase('hold');
    sfx.flip();
  };

  const toggle = (i: number) => {
    if (phase !== 'hold') return;
    sfx.click();
    setHeld((h) => h.map((v, j) => (j === i ? !v : v)));
  };

  const draw = () => {
    if (phase !== 'hold') return;
    const next = hand.map((c, i) => (held[i] ? c : deck.current.shift()!));
    setHand(next);
    setPhase('result');
    sfx.flip();
    const cmp = compareHands(next, BAOZERS);
    if (cmp > 0) {
      setResult({ outcome: 'win', line: pick(pokerGame.winLines) });
      if (!won.current) {
        won.current = true;
        onComplete();
      } else sfx.success();
    } else if (cmp < 0) {
      setLosses((l) => l + 1);
      setResult({ outcome: 'lose', line: pick(pokerGame.loseLines) });
      sfx.bonk();
    } else {
      setResult({ outcome: 'tie', line: pokerGame.tieLine });
      sfx.pop();
    }
  };

  // Keyboard: 1–5 toggle HOLD, Enter draws / deals.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
      const n = Number(e.key);
      if (phase === 'hold' && n >= 1 && n <= 5) toggle(n - 1);
      else if (e.key === 'Enter') phase === 'hold' ? draw() : startRound();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const mine = phase === 'result' ? evaluate(hand) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-[32px] border-4 border-[#5E2E1C] bg-[radial-gradient(ellipse_at_center,#A8395A_0%,#7A1F3D_70%)] px-3 py-5 shadow-pop sm:px-8 sm:py-7">
        {/* Baozers' hand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Bear className="h-9 w-9" />
            <span className="font-display text-lg font-semibold text-cream-50">{people.fromNickname}{people.fromNickname.endsWith('s') ? '’' : '’s'} hand</span>
            <span className="chip bg-cream-50/90">{theirs.name}</span>
          </div>
          <div className="flex gap-1.5 text-[11px] sm:gap-2 sm:text-sm" data-testid="poker-baozers">
            {BAOZERS.map((c, i) => (
              <div key={i} className="aspect-[5/7] w-12 sm:w-16">
                <PokerCard card={c} />
              </div>
            ))}
          </div>
        </div>

        {/* chips */}
        <div className="my-4 flex items-center justify-center gap-1" aria-hidden="true">
          <Chip colour="#E2688A" className="h-8 w-8 -rotate-12" />
          <Chip colour="#F5CD6E" className="h-8 w-8 rotate-6" />
          <Chip colour="#2A1A20" className="h-8 w-8" />
          <Chip colour="#7EC8E3" className="h-8 w-8 -rotate-6" />
          <span className="ml-2 font-hand text-2xl text-blush-200">Round {Math.max(1, round)}</span>
        </div>

        {/* Aure's hand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 text-sm sm:gap-3 sm:text-lg" role="group" aria-label="Your hand">
            {(phase === 'ready' ? Array.from({ length: 5 }) : hand).map((c, i) => {
              const card = c as Card | undefined;
              return (
                <motion.button
                  key={`${round}-${i}-${card ? card.rank + card.suit : 'back'}`}
                  type="button"
                  onClick={() => toggle(i)}
                  disabled={phase !== 'hold'}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1, y: held[i] && phase === 'hold' ? -12 : 0 }}
                  transition={{ delay: phase === 'ready' ? 0 : i * 0.06, duration: 0.25 }}
                  className={`relative aspect-[5/7] w-[3.6rem] sm:w-24 ${phase === 'hold' ? 'cursor-pointer' : 'cursor-default'}`}
                  aria-pressed={phase === 'hold' ? held[i] : undefined}
                  aria-label={card ? `${rankLabel(card.rank)} of ${({ S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' })[card.suit]}${held[i] ? ', held' : ''}` : 'Face-down card'}
                  data-testid="poker-card"
                  data-card={card ? `${card.rank}${card.suit}` : ''}
                >
                  {card ? <PokerCard card={card} /> : <CardBack />}
                  {phase === 'hold' && held[i] && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-honey-300 px-2 py-0.5 font-display text-[11px] font-bold tracking-wider text-berry-700 shadow sm:text-xs">
                      HOLD
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-cream-50">Your hand</span>
            {mine && <span className="chip bg-cream-50/90">{mine.name}</span>}
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mx-auto mt-4 w-fit rounded-2xl px-5 py-2 text-center font-display text-lg font-semibold shadow ${
                result.outcome === 'win' ? 'bg-honey-200 text-berry-700' : 'bg-cream-50 text-berry-600'
              }`}
              role="status"
            >
              {result.outcome === 'win' ? '🏆 ' : result.outcome === 'lose' ? '🃏 ' : '🤝 '}
              {mine?.name} {result.outcome === 'win' ? 'beats' : result.outcome === 'lose' ? 'loses to' : 'ties with'} {theirs.name}. {result.line}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {phase === 'hold' ? (
          <button type="button" className="btn-primary text-xl" onClick={draw} data-testid="poker-draw">
            Draw {held.filter((h) => !h).length} new card{held.filter((h) => !h).length === 1 ? '' : 's'} 🃏
          </button>
        ) : (
          <button type="button" className="btn-primary text-xl" onClick={startRound} data-testid="poker-deal">
            {phase === 'ready' ? 'Deal me in! ♠️' : 'Deal again 🔁'}
          </button>
        )}
      </div>
      <p className="min-h-[1.5rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        {phase === 'ready' && 'Baozers is feeling confident…'}
        {phase === 'hold' && (luckyDeal ? pokerGame.luckyHint : 'Tap the cards you want to keep, then draw.')}
      </p>
      <details className="w-full max-w-md rounded-2xl bg-blush-50 px-4 py-2 text-sm text-berry-500">
        <summary className="cursor-pointer font-display font-semibold">Poker hands, best to worst</summary>
        <p className="mt-1">Royal Flush · Straight Flush · Four of a Kind · Full House · Flush · Straight · Three of a Kind · Two Pair · Pair · High Card</p>
        <p className="mt-1">Keyboard: 1–5 to hold cards, Enter to draw or deal.</p>
      </details>
    </div>
  );
}
