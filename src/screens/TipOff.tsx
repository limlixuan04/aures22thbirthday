import { motion } from 'framer-motion';
import { levels, scoreboard, tipOff } from '../content/content';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sound';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { Basketball, Jersey } from '../art/Decor';
import { Sentences } from '../components/Sentences';

/** The intro page before Level 1: the game plan. */
export function TipOff() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:pt-10">
      <nav className="mb-2">
        <button type="button" className="btn-ghost" onClick={() => navigate({ name: 'home' })}>
          ← Welcome
        </button>
      </nav>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Jersey className="h-28 w-24" number={String(TOTAL_LEVELS * scoreboard.pointsPerLevel)} name={scoreboard.homeTeam} />
          <motion.div className="absolute -right-8 top-0" animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}>
            <Basketball className="h-10 w-10" />
          </motion.div>
        </div>
        <h1 className="mt-3 text-5xl text-berry-600 sm:text-6xl">{tipOff.heading}</h1>
        <p className="mt-2 text-lg text-berry-500">
          <Sentences text={tipOff.intro} />
        </p>
      </div>

      <section className="card mt-8 p-5 sm:p-8">
        <h2 className="text-3xl text-berry-600">The game plan</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {tipOff.rules.map((r) => (
            <li key={r.text} className="flex items-start gap-3 rounded-2xl bg-blush-50 p-3">
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-berry-600">{r.text}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-3xl text-berry-600">The schedule</h2>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((l) => (
            <li key={l} className="flex items-center gap-2 rounded-xl border-2 border-blush-200 bg-cream-50 px-2 py-1.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-200 text-lg">{levels[l].emoji}</span>
              <span className="min-w-0 leading-tight">
                <span className="block font-display text-[11px] font-semibold text-berry-400">Level {l}</span>
                <span className="block truncate font-display text-sm font-semibold text-berry-600">{levels[l].title}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="btn-primary px-10 py-4 text-2xl"
          onClick={() => {
            sfx.success();
            navigate({ name: 'level', level: 1 });
          }}
          data-testid="tipoff-start"
        >
          <Basketball className="h-7 w-7" /> {tipOff.button}
        </button>
      </div>
    </div>
  );
}
