/**
 * 🛠 Developer testing panel — only rendered when DEV_TOOLS is true
 * (i.e. `npm run dev`). It is never shown on the deployed site.
 */
import { useState } from 'react';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { TOTAL_LEVELS } from '../lib/progressCore';
import { setChoice, useChoices } from '../lib/choices';

export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const p = useProgress();
  const choices = useChoices();
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  return (
    <div className="fixed bottom-3 left-3 z-50 font-body text-xs">
      {open ? (
        <div className="w-64 rounded-2xl border-2 border-dashed border-berry-400 bg-white/95 p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between font-bold text-berry-600">
            🛠 Dev mode (local only)
            <button onClick={() => setOpen(false)} aria-label="Close dev panel">✕</button>
          </div>
          <div className="mb-2 grid grid-cols-6 gap-1">
            {levels.map((l) => (
              <button key={l} className="rounded bg-blush-100 py-1 font-bold hover:bg-blush-200" onClick={() => navigate({ name: 'level', level: l })}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            <button className="rounded bg-blush-100 px-2 py-1 hover:bg-blush-200" onClick={() => navigate({ name: 'home' })}>Welcome</button>
            <button className="rounded bg-blush-100 px-2 py-1 hover:bg-blush-200" onClick={() => navigate({ name: 'bonus' })}>Wordle</button>
            <button className="rounded bg-blush-100 px-2 py-1 hover:bg-blush-200" onClick={() => navigate({ name: 'trophy' })}>Trophy</button>
            <button className="rounded bg-blush-100 px-2 py-1 hover:bg-blush-200" onClick={() => p.setCompleted(levels)}>Complete all 11</button>
            <button className="rounded bg-blush-100 px-2 py-1 hover:bg-blush-200" onClick={() => p.setCompleted([])}>Clear levels</button>
            <button
              className="rounded bg-berry-500 px-2 py-1 text-white"
              onClick={() => {
                p.resetAll();
                navigate({ name: 'home' });
              }}
            >
              Reset everything
            </button>
          </div>
          <div className="mt-2 space-y-1 border-t border-blush-200 pt-2">
            <p className="font-bold text-berry-600">Compare versions</p>
            <div className="flex items-center justify-between gap-1">
              <span>Memory cards</span>
              <span className="flex gap-1">
                {(['poker', 'classic'] as const).map((v) => (
                  <button key={v} onClick={() => setChoice('memoryCards', v)} className={`rounded px-2 py-0.5 ${choices.memoryCards === v ? 'bg-berry-500 text-white' : 'bg-blush-100'}`}>
                    {v === 'poker' ? 'Poker' : 'Classic'}
                  </button>
                ))}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-cocoa-500">Completed: {p.completed.join(', ') || 'none'}</p>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-full border-2 border-dashed border-berry-400 bg-white/90 px-3 py-1.5 font-bold text-berry-600 shadow">
          🛠 Dev
        </button>
      )}
    </div>
  );
}
