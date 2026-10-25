import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hellsKitchen as HK } from '../content/content';
import { pick, shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import { Bao, Chef } from '../art/Critters';
import type { LevelProps } from '.';
import { Sentences } from '../components/Sentences';

type Status = 'ready' | 'cooking' | 'between' | 'won' | 'lost';
type Mood = 'neutral' | 'angry' | 'happy';

interface Ticket {
  dish: number;
  step: number;
  total: number; // seconds
  deadline: number; // ms timestamp
  num: number; // order number
}

const ALL_INGREDIENTS = HK.dishes.flatMap((d) => d.steps);

function DishPicture({ dish, className }: { dish: (typeof HK.dishes)[number]; className: string }) {
  if ('art' in dish && dish.art === 'bao') return <Bao className={className} />;
  return <span className="leading-none">{dish.emoji}</span>;
}

export default function Level06Kitchen({ onComplete }: LevelProps) {
  const [status, setStatus] = useState<Status>('ready');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [served, setServed] = useState(0);
  const [sentBack, setSentBack] = useState(0);
  const [line, setLine] = useState(HK.startLine);
  const [mood, setMood] = useState<Mood>('neutral');
  const [now, setNow] = useState(Date.now());
  const [wrongId, setWrongId] = useState<{ id: string; n: number } | null>(null);
  const [pantry, setPantry] = useState(() => shuffle(ALL_INGREDIENTS));
  const lastDish = useRef(-1);
  const won = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const say = (text: string, m: Mood) => {
    setLine(text);
    setMood(m);
  };

  const newTicket = useCallback((servedSoFar: number) => {
    let dish = Math.floor(Math.random() * HK.dishes.length);
    if (dish === lastDish.current && Math.random() < 0.7) dish = (dish + 1) % HK.dishes.length;
    lastDish.current = dish;
    const total = Math.max(HK.fastestTicketSeconds, HK.firstTicketSeconds - servedSoFar);
    setTicket((prev) => ({ dish, step: 0, total, deadline: Date.now() + total * 1000, num: (prev?.num ?? 0) + 1 }));
    setStatus('cooking');
  }, []);

  const start = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setServed(0);
    setSentBack(0);
    setTicket(null);
    setPantry(shuffle(ALL_INGREDIENTS));
    say(HK.startLine, 'neutral');
    sfx.success();
    newTicket(0);
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
          later(() => newTicket(served), 1300);
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [status, ticket, sentBack, served, newTicket]);

  const add = (id: string) => {
    if (status !== 'cooking' || !ticket) return;
    const dish = HK.dishes[ticket.dish];
    if (dish.steps[ticket.step].id !== id) {
      sfx.error();
      setWrongId((w) => ({ id, n: (w?.n ?? 0) + 1 }));
      setTicket({ ...ticket, deadline: ticket.deadline - HK.wrongPenaltySeconds * 1000 });
      say(pick(HK.wrongLines), 'angry');
      return;
    }
    sfx.pop();
    const step = ticket.step + 1;
    if (step < dish.steps.length) {
      setTicket({ ...ticket, step });
      return;
    }
    // dish complete
    const s = served + 1;
    setServed(s);
    setTicket({ ...ticket, step });
    if (s >= HK.dishesToServe) {
      setStatus('won');
      say(HK.winLine, 'happy');
      if (!won.current) {
        won.current = true;
        onComplete();
      }
      return;
    }
    sfx.good();
    setStatus('between');
    say(pick(HK.servedLines), 'happy');
    later(() => newTicket(s), 900);
  };

  const dish = ticket ? HK.dishes[ticket.dish] : null;
  const left = ticket ? Math.max(0, (ticket.deadline - now) / 1000) : 0;
  const frac = ticket ? Math.min(1, left / ticket.total) : 1;
  const hats = useMemo(() => Array.from({ length: HK.maxSentBack }, (_, i) => i < sentBack), [sentBack]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* status row */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip text-base" data-testid="hk-served">
          🍽️ Served {served} / {HK.dishesToServe}
        </span>
        <span className="chip text-base" aria-label={`Sent back ${sentBack} of ${HK.maxSentBack}`}>
          🔥 Sent back {sentBack} / {HK.maxSentBack} {hats.filter(Boolean).map((_, i) => (
            <span key={i}>❌</span>
          ))}
        </span>
      </div>

      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[1fr_1.15fr]">
        {/* chef + ticket */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <motion.div key={line} animate={mood === 'angry' ? { rotate: [0, -6, 6, -4, 4, 0] } : { y: [0, -4, 0] }} transition={{ duration: 0.45 }}>
              <Chef className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" mood={mood} />
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
          <div className="relative rounded-md border border-cocoa-300 bg-[#FFFDF5] px-4 pb-4 pt-3 font-body shadow-card" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)' }}>
            {dish && ticket ? (
              <div data-testid="hk-ticket" data-next={dish.steps[ticket.step]?.id ?? ''}>
                <div className="flex items-center justify-between border-b-2 border-dashed border-cocoa-300 pb-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-cocoa-500">Order #{ticket.num}</span>
                  <span className={`font-mono text-sm font-bold tabular-nums ${frac < 0.3 ? 'text-[#C2264B]' : 'text-berry-600'}`}>{left.toFixed(1)}s</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center text-4xl">
                    <DishPicture dish={dish} className="h-14 w-14" />
                  </span>
                  <p className="font-display text-2xl font-bold text-berry-700">{dish.name}</p>
                </div>
                <ol className="mt-2 space-y-1">
                  {dish.steps.map((st, i) => (
                    <li key={st.id} className={`flex items-center gap-2 font-mono text-sm ${i < ticket.step ? 'text-sage-500 line-through' : 'text-berry-700'}`}>
                      <span className="w-5 text-center">{i < ticket.step ? '✓' : `${i + 1}.`}</span>
                      <span>{st.emoji}</span>
                      <span>{st.label}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cocoa-300/40" aria-hidden="true">
                  <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${frac * 100}%`, background: frac < 0.3 ? '#C2264B' : frac < 0.6 ? '#E9B44C' : '#7FB685' }} />
                </div>
              </div>
            ) : (
              <p className="py-8 text-center font-mono text-sm uppercase tracking-widest text-cocoa-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* the pass / pantry */}
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

      {(status === 'ready' || status === 'lost' || status === 'won') && (
        <button type="button" className="btn-primary text-xl" onClick={start} data-testid="hk-start">
          {status === 'ready' ? 'Start service! 🔥' : status === 'lost' ? 'Back to the kitchen 🔁' : 'Cook again 🔁'}
        </button>
      )}
    </div>
  );
}
