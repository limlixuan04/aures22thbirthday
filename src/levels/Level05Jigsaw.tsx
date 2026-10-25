import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { jigsaw } from '../content/content';
import { makeEdges, piecePath } from '../lib/jigsaw';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sound';
import type { LevelProps } from '.';
import { Sentences } from '../components/Sentences';

const { cols: COLS, rows: ROWS, image: IMG } = jigsaw;
const CELL = 100;
const M = 30; // room around a piece for its tabs
const W = COLS * CELL;
const H = ROWS * CELL;
const TOTAL = COLS * ROWS;

const EDGES = makeEdges(ROWS, COLS);
const PATHS = Array.from({ length: TOTAL }, (_, i) => piecePath(EDGES, Math.floor(i / COLS), i % COLS, ROWS, COLS, CELL));

/** One piece drawn on its own (for the pile). */
function LoosePiece({ i }: { i: number }) {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const id = `jig-loose-${i}`;
  return (
    <svg viewBox={`${c * CELL - M} ${r * CELL - M} ${CELL + 2 * M} ${CELL + 2 * M}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d={PATHS[i]} />
        </clipPath>
      </defs>
      <image href={IMG} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
      <path d={PATHS[i]} fill="none" stroke="#7A1F3D" strokeOpacity="0.55" strokeWidth="2" />
      <path d={PATHS[i]} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" transform="translate(-1 -1)" />
    </svg>
  );
}

export default function Level05Jigsaw({ onComplete }: LevelProps) {
  const [pile, setPile] = useState<number[]>(() => shuffle(Array.from({ length: TOTAL }, (_, i) => i)));
  const tilts = useMemo(() => Array.from({ length: TOTAL }, () => Math.round((Math.random() - 0.5) * 12)), []);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const [hintSlot, setHintSlot] = useState<number | null>(null);
  const [ghost, setGhost] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [message, setMessage] = useState('Pick a piece from the pile to start.');
  const done = placed.size === TOTAL;

  const pickUp = (i: number) => {
    if (done) return;
    sfx.click();
    setSelected((s) => (s === i ? null : i));
    setHintSlot(null);
    setMessage('Now click where it goes on the board.');
  };

  const tryPlace = (slot: number) => {
    if (done || placed.has(slot)) return;
    if (selected === null) {
      setMessage('Pick a piece from the pile first! 🧩');
      return;
    }
    if (selected !== slot) {
      sfx.bonk();
      setShake((n) => n + 1);
      setMessage('Hmm, doesn’t fit there! 🤔');
      return;
    }
    const next = new Set(placed).add(slot);
    setPlaced(next);
    setPile((p) => p.filter((x) => x !== slot));
    setSelected(null);
    setHintSlot(null);
    sfx.pop();
    if (next.size === TOTAL) {
      setMessage('There we are! 💞');
      onComplete();
    } else {
      setMessage(next.size % 5 === 0 ? `${next.size} down, ${TOTAL - next.size} to go! 💪` : 'Click! It fits. ✨');
    }
  };

  const hint = () => {
    if (selected === null) {
      setMessage('Pick a piece first, then I’ll show you where it goes. 😉');
      return;
    }
    sfx.pop();
    setHintSlot(selected);
    window.setTimeout(() => setHintSlot((h) => (h === selected ? null : h)), 1500);
  };

  const restart = () => {
    sfx.whoosh();
    setPile(shuffle(Array.from({ length: TOTAL }, (_, i) => i)));
    setPlaced(new Set());
    setSelected(null);
    setMessage('Pick a piece from the pile to start.');
  };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-center">
      {/* Board */}
      <div className="w-full lg:max-w-[560px]">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <span className="chip text-base" data-testid="jigsaw-progress">
            🧩 {placed.size} / {TOTAL}
          </span>
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setShowRef((v) => !v)} aria-pressed={showRef}>
            {showRef ? 'Hide' : 'Show'} the box picture
          </button>
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setGhost((v) => !v)} aria-pressed={ghost}>
            {ghost ? 'Hide' : 'Show'} faint guide
          </button>
        </div>
        <div className="relative w-full select-none rounded-[24px] border-4 border-berry-600 bg-cream-200 p-1 shadow-pop">
          <div className="relative w-full" style={{ aspectRatio: `${W + 2 * M} / ${H + 2 * M}` }}>
            <svg viewBox={`${-M} ${-M} ${W + 2 * M} ${H + 2 * M}`} className="absolute inset-0 h-full w-full" data-testid="jigsaw-board">
              <rect x={0} y={0} width={W} height={H} rx={6} fill="#FFF6EA" stroke="#C25B7A" strokeOpacity="0.4" strokeWidth="2" />
              {ghost && <image href={IMG} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice" opacity={0.18} />}
              {!done &&
                PATHS.map((d, i) => (placed.has(i) ? null : <path key={`slot-${i}`} d={d} fill="none" stroke="#C25B7A" strokeOpacity="0.22" strokeDasharray="5 5" strokeWidth="1.5" />))}
              {[...placed].map((i) => (
                <g key={i}>
                  <defs>
                    <clipPath id={`jig-board-${i}`}>
                      <path d={PATHS[i]} />
                    </clipPath>
                  </defs>
                  <image href={IMG} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice" clipPath={`url(#jig-board-${i})`} />
                  <path d={PATHS[i]} fill="none" stroke="#7A1F3D" strokeOpacity={done ? 0 : 0.35} strokeWidth="1.5" style={{ transition: 'stroke-opacity 1.2s' }} />
                </g>
              ))}
              {hintSlot !== null && (
                <motion.path d={PATHS[hintSlot]} fill="#F5CD6E" fillOpacity={0.45} stroke="#E9B44C" strokeWidth="4" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
              )}
            </svg>
            {/* click targets, one per slot */}
            {!done &&
              Array.from({ length: TOTAL }, (_, i) => {
                if (placed.has(i)) return null;
                const r = Math.floor(i / COLS);
                const c = i % COLS;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => tryPlace(i)}
                    className={`absolute rounded-md transition ${selected !== null ? 'hover:bg-blush-300/30' : ''}`}
                    style={{ left: pct(M + c * CELL, W + 2 * M), top: pct(M + r * CELL, H + 2 * M), width: pct(CELL, W + 2 * M), height: pct(CELL, H + 2 * M) }}
                    aria-label={`Board space: row ${r + 1}, column ${c + 1}`}
                    data-testid={`jigsaw-slot-${i}`}
                  />
                );
              })}
          </div>
        </div>
        <p className="mt-3 min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
          <Sentences text={message} />
        </p>
        {showRef && (
          <div className="mx-auto mt-1 w-44 overflow-hidden rounded-xl border-4 border-blush-300 shadow-card" style={{ aspectRatio: `${W} / ${H}` }}>
            <img src={IMG} alt="The finished picture" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Pile */}
      {!done && (
        <div className="w-full lg:w-[424px]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display font-semibold text-berry-600">The pile ({pile.length})</p>
            <div className="flex gap-1">
              <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={hint}>
                💡 Where does it go?
              </button>
              <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={restart}>
                ↺
              </button>
            </div>
          </div>
          <div
            className="flex gap-1 overflow-x-auto rounded-2xl bg-blush-100/70 p-2 lg:grid lg:max-h-[560px] lg:grid-cols-5 lg:overflow-y-auto lg:overflow-x-visible"
            role="listbox"
            aria-label="Puzzle pieces"
          >
            {pile.map((i) => {
              const isSel = selected === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  aria-label={`Puzzle piece ${pile.indexOf(i) + 1}`}
                  onClick={() => pickUp(i)}
                  animate={isSel && shake ? { x: shake % 2 ? [0, -6, 6, -4, 4, 0] : [0, 6, -6, 4, -4, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`relative h-[76px] w-[76px] shrink-0 rounded-xl p-0.5 transition ${
                    isSel ? 'z-10 -translate-y-1 scale-110 bg-honey-200 ring-4 ring-honey-400' : 'hover:scale-105 hover:bg-cream-50'
                  }`}
                  style={{ rotate: isSel ? '0deg' : `${tilts[i]}deg` }}
                  data-testid="jigsaw-piece"
                  data-piece={i}
                >
                  <div className="h-full w-full drop-shadow-[0_3px_2px_rgba(94,22,48,0.35)]">
                    <LoosePiece i={i} />
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-cocoa-500 lg:text-left">Tip: pieces with a flat side go around the edge. Start with the corners!</p>
        </div>
      )}
    </div>
  );
}
