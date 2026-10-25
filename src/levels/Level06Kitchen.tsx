import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hellsKitchen as HK } from '../content/content';
import { pick, shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { Bao, Chef } from '../art/Critters';
import { Sentences } from '../components/Sentences';
import type { LevelProps } from '.';

type Status = 'ready' | 'cooking' | 'between' | 'roundWon' | 'lost' | 'won';
type Mood = 'neutral' | 'angry' | 'happy';
type Dish = (typeof HK.dishes)[number];

interface Ticket {
  num: number;
  dishes: number[]; // dish indexes, cooked in this order
  allergy: string | null; // ingredient id that must be left out
  steps: string[]; // the ingredient ids needed (any order)
  done: boolean[]; // which of those have been added
  total: number;
  deadline: number;
}

const ING = Object.fromEntries(HK.ingredients.map((i) => [i.id, i]));

function DishPicture({ dish, className }: { dish: Dish; className: string }) {
  if ('art' in dish && dish.art === 'bao') return <Bao className={className} />;
  return <span className="leading-none">{dish.emoji}</span>;
}

function makeTicket(kind: (typeof HK.rounds)[number]['kind'], seconds: number, num: number, lastDish: number): Ticket {
  const randomDish = (avoid: number) => {
    let d = Math.floor(Math.random() * HK.dishes.length);
    if (d === avoid) d = (d + 1 + Math.floor(Math.random() * (HK.dishes.length - 1))) % HK.dishes.length;
    return d;
  };
  const first = randomDish(lastDish);
  const dishes = kind === 'combo' ? [first, randomDish(first)] : [first];
  let allergy: string | null = null;
  if (kind === 'allergy') {
    // never ban the first ingredient (no bao without a bun!)
    allergy = pick(HK.dishes[first].steps.slice(1));
  }
  const steps = dishes.flatMap((d) => HK.dishes[d].steps).filter((id) => id !== allergy);
  return { num, dishes, allergy, steps, done: steps.map(() => false), total: seconds, deadline: Date.now() + seconds * 1000 };
}

export default function Level06Kitchen({ onComplete }: LevelProps) {
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [served, setServed] = useState(0);
  const [sentBack, setSentBack] = useState(0);
  const [line, setLine] = useState(HK.startLine);
  const [mood, setMood] = useState<Mood>('neutral');
  const [now, setNow] = useState(Date.now());
  const [wrongId, setWrongId] = useState<{ id: string; n: number } | null>(null);
  const [pantry, setPantry] = useState(() => shuffle(HK.ingredients));
  const orderNum = useRef(0);
  const lastDish = useRef(-1);
  const won = useRef(false);
  const timers = useRef<number[]>([]);
  const cfg = HK.rounds[round];

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const say = (text: string, m: Mood) => {
    setLine(text);
    setMood(m);
  };

  const newTicket = useCallback(
    (r: number) => {
      const t = makeTicket(HK.rounds[r].kind, HK.rounds[r].seconds, ++orderNum.current, lastDish.current);
      lastDish.current = t.dishes[t.dishes.length - 1];
      setTicket(t);
      setStatus('cooking');
    },
    [],
  );

  const startRound = (r = round) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setServed(0);
    setSentBack(0);
    setTicket(null);
    setPantry(shuffle(HK.ingredients));
    say(HK.rounds[r].intro, 'neutral');
    sfx.success();
    later(() => newTicket(r), 600);
    setStatus('between');
  };

  // Ticket clock
  useEffect(() => {
    if (status !== 'cooking' || !ticket) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= ticket.deadline) {
        window.clearInterval(id);
        const s = sentBack + 1;
        setSentBack(s);
        sfx.bonk();
        if (s >= HK.maxSentBack) {
          setStatus('lost');
          say(HK.loseLine, 'angry');
        } else {
          setStatus('between');
          say(pick(HK.timeoutLines), 'angry');
          later(() => newTicket(round), 1300);
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [status, ticket, sentBack, round, newTicket]);

  const add = (id: string) => {
    if (status !== 'cooking' || !ticket) return;
    if (ticket.allergy === id) {
      sfx.error();
      setWrongId((w) => ({ id, n: (w?.n ?? 0) + 1 }));
      setTicket({ ...ticket, deadline: ticket.deadline - HK.allergyPenaltySeconds * 1000 });
      say(pick(HK.allergyLines), 'angry');
      return;
    }
    const slot = ticket.steps.findIndex((s, i) => s === id && !ticket.done[i]);
    if (slot < 0) {
      sfx.error();
      setWrongId((w) => ({ id, n: (w?.n ?? 0) + 1 }));
      setTicket({ ...ticket, deadline: ticket.deadline - HK.wrongPenaltySeconds * 1000 });
      say(pick(HK.wrongLines), 'angry');
      return;
    }
    sfx.pop();
    const done = ticket.done.map((d, i) => d || i === slot);
    setTicket({ ...ticket, done });
    if (!done.every(Boolean)) return;

    // order complete
    const s = served + 1;
    setServed(s);
    if (s < cfg.orders) {
      sfx.good();
      setStatus('between');
      say(pick(HK.servedLines), 'happy');
      later(() => newTicket(round), 900);
      return;
    }
    if (round + 1 < HK.rounds.length) {
      sfx.success();
      setStatus('roundWon');
      say(HK.roundWonLine, 'happy');
      return;
    }
    setStatus('won');
    say(HK.winLine, 'happy');
    if (!won.current) {
      won.current = true;
      onComplete();
    }
  };

  const left = ticket ? Math.max(0, (ticket.deadline - now) / 1000) : 0;
  const frac = ticket ? Math.min(1, left / ticket.total) : 1;

  // Which ticket line is "current": map flat step index back to (dish, ingredient)
  const ticketLines = ticket
    ? ticket.dishes.map((d, plate) => {
        const before = ticket.dishes.slice(0, plate).flatMap((x) => HK.dishes[x].steps.filter((id) => id !== ticket.allergy)).length;
        let k = before;
        return {
          dish: HK.dishes[d],
          items: HK.dishes[d].steps.map((id) => {
            if (id === ticket.allergy) return { id, state: 'banned' as const };
            const idx = k++;
            return { id, state: ticket.done[idx] ? ('done' as const) : ('todo' as const) };
          }),
        };
      })
    : [];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* mini levels */}
      <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Services">
        {HK.rounds.map((r, i) => {
          const done = i < round || status === 'won';
          const here = i === round && status !== 'won';
          return (
            <li
              key={r.name}
              className={`rounded-full border-2 px-3 py-1 font-display text-sm font-semibold ${
                done ? 'border-sage-400 bg-sage-200/60 text-berry-600' : here ? 'border-berry-500 bg-blush-100 text-berry-600' : 'border-blush-200 bg-cream-50 text-berry-300'
              }`}
            >
              {done ? '✓ ' : `${i + 1}. `}
              {r.name}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip text-base" data-testid="hk-served">
          🍽️ Served {served} / {cfg.orders}
        </span>
        <span className="chip text-base" aria-label={`Sent back ${sentBack} of ${HK.maxSentBack}`}>
          🔥 Sent back {sentBack} / {HK.maxSentBack}
        </span>
      </div>

      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[1fr_1.15fr]">
        {/* chef + ticket */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <motion.div key={line} animate={mood === 'angry' ? { rotate: [0, -6, 6, -4, 4, 0] } : { y: [0, -4, 0] }} transition={{ duration: 0.45 }}>
              <Chef className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" mood={mood} />
              <p className="-mt-1 text-center font-sport text-sm tracking-wider text-berry-500">{HK.chefName}</p>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={line}
                initial={{ opacity: 0, scale: 0.85, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className={`relative mt-3 rounded-2xl border-2 px-4 py-3 font-display text-lg font-bold leading-snug shadow-soft ${
                  mood === 'angry' ? 'border-[#C2264B] bg-[#FFE3E8] text-[#A8293D]' : mood === 'happy' ? 'border-sage-400 bg-sage-200/60 text-berry-700' : 'border-blush-300 bg-cream-50 text-berry-600'
                }`}
                role="status"
              >
                <Sentences text={line} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ticket */}
          <div className="relative rounded-md border border-cocoa-300 bg-[#FFFDF5] px-4 pb-5 pt-3 shadow-card">
            {ticket ? (
              <div data-testid="hk-ticket" data-next={ticket.steps.find((_, i) => !ticket.done[i]) ?? ''}>
                <div className="flex items-center justify-between border-b-2 border-dashed border-cocoa-300 pb-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-cocoa-500">
                    Order #{ticket.num}
                    {ticket.dishes.length > 1 && ' · COMBO'}
                  </span>
                  <span className={`font-mono text-sm font-bold tabular-nums ${frac < 0.3 ? 'text-[#C2264B]' : 'text-berry-600'}`}>{left.toFixed(1)}s</span>
                </div>
                {ticket.allergy && (
                  <p className="mt-2 rounded bg-[#FFE3E8] px-2 py-1 font-mono text-sm font-bold uppercase text-[#C2264B]" data-testid="hk-allergy" data-allergy={ticket.allergy}>
                    ⚠️ Allergy: no {ING[ticket.allergy].label}!
                  </p>
                )}
                {ticketLines.map(({ dish, items }, plate) => (
                  <div key={plate} className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-10 w-10 place-items-center text-3xl">
                        <DishPicture dish={dish} className="h-10 w-10" />
                      </span>
                      <p className="font-display text-xl font-bold text-berry-700">
                        {ticket.dishes.length > 1 && <span className="mr-1 text-sm text-cocoa-500">{plate + 1}.</span>}
                        {dish.name}
                      </p>
                    </div>
                    <ol className="ml-2 mt-1 space-y-0.5">
                      {items.map(({ id, state }) => (
                        <li
                          key={id}
                          data-id={id}
                          data-state={state}
                          className={`flex items-center gap-2 font-mono text-sm ${
                            state === 'done' ? 'text-sage-500 line-through' : state === 'banned' ? 'text-[#C2264B] line-through' : 'text-berry-700'
                          }`}
                        >
                          <span className="w-5 text-center">{state === 'done' ? '✓' : state === 'banned' ? '🚫' : '·'}</span>
                          <span>{ING[id].emoji}</span>
                          <span>{ING[id].label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cocoa-300/40" aria-hidden="true">
                  <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${frac * 100}%`, background: frac < 0.3 ? '#C2264B' : frac < 0.6 ? '#E9B44C' : '#7FB685' }} />
                </div>
              </div>
            ) : (
              <p className="py-8 text-center font-mono text-sm uppercase tracking-widest text-cocoa-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* the pass */}
        <div className="rounded-[24px] border-4 border-[#8C8C94] bg-[linear-gradient(135deg,#E9EAEE_0%,#C9CBD3_50%,#E9EAEE_100%)] p-3 shadow-pop sm:p-4">
          <p className="mb-2 text-center font-display text-sm font-bold tracking-[0.2em] text-[#5A5A66]">THE PASS</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pantry.map((ing) => (
              <motion.button
                key={ing.id}
                type="button"
                onClick={() => add(ing.id)}
                disabled={status !== 'cooking'}
                animate={wrongId?.id === ing.id ? { x: wrongId.n % 2 ? [0, -6, 6, -4, 4, 0] : [0, 6, -6, 4, -4, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-white bg-white/90 px-1 py-2 shadow-soft transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
                data-testid="hk-ingredient"
                data-id={ing.id}
              >
                <span className="text-3xl leading-none">{ing.emoji}</span>
                <span className="text-center font-display text-[11px] font-semibold leading-tight text-berry-600 sm:text-xs">{ing.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {status === 'ready' && (
        <button type="button" className="btn-primary text-xl" onClick={() => startRound(0)} data-testid="hk-start">
          Start service! 🔥
        </button>
      )}
      {status === 'roundWon' && (
        <button
          type="button"
          className="btn-primary text-xl"
          onClick={() => {
            setRound(round + 1);
            startRound(round + 1);
          }}
          data-testid="hk-next-round"
        >
          Next service: {HK.rounds[round + 1].name} →
        </button>
      )}
      {status === 'lost' && (
        <button type="button" className="btn-primary text-xl" onClick={() => startRound()} data-testid="hk-start">
          Back to the kitchen 🔁
        </button>
      )}
      {status === 'won' && (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setRound(0);
            startRound(0);
          }}
        >
          Cook again 🔁
        </button>
      )}
    </div>
  );
}
