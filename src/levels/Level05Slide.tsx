import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { slidingPuzzle } from '../content/content';
import { isSolvedTiles, moveTile, neighbours, shuffleTiles } from '../lib/slidePuzzle';
import { sfx } from '../lib/sound';
import type { LevelProps } from '.';

const N = 3;

export default function Level05Slide({ onComplete }: LevelProps) {
  const [tiles, setTiles] = useState(() => shuffleTiles(N, slidingPuzzle.shuffleMoves));
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  const tryMove = useCallback(
    (index: number) => {
      if (solved) return;
      const next = moveTile(tiles, index, N);
      if (!next) {
        sfx.bonk();
        return;
      }
      sfx.slide();
      setTiles(next);
      setMoves((m) => m + 1);
      if (isSolvedTiles(next)) {
        setSolved(true);
        onComplete();
      }
    },
    [tiles, solved, onComplete],
  );

  // Arrow keys slide the tile that's next to the gap in that direction.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const empty = tiles.indexOf(0);
      const r = Math.floor(empty / N);
      const c = empty % N;
      let from = -1;
      if (e.key === 'ArrowUp' && r < N - 1) from = empty + N;
      else if (e.key === 'ArrowDown' && r > 0) from = empty - N;
      else if (e.key === 'ArrowLeft' && c < N - 1) from = empty + 1;
      else if (e.key === 'ArrowRight' && c > 0) from = empty - 1;
      else if (!e.key.startsWith('Arrow')) return;
      e.preventDefault();
      if (from >= 0) tryMove(from);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tiles, tryMove]);

  const reshuffle = () => {
    sfx.whoosh();
    setTiles(shuffleTiles(N, slidingPuzzle.shuffleMoves));
    setMoves(0);
    setSolved(false);
  };

  const movable = neighbours(tiles.indexOf(0), N);
  const pct = 100 / N;

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
      <div className="relative w-full max-w-[420px]">
        <motion.div
          className="relative aspect-square w-full overflow-hidden rounded-3xl border-4 border-berry-600 bg-berry-600 shadow-pop"
          animate={solved ? { scale: [1, 1.03, 1] } : {}}
          data-testid="slide-board"
        >
          {tiles.map((tile, pos) => {
            if (tile === 0 && !solved) return null;
            const home = (tile === 0 ? N * N : tile) - 1;
            const hr = Math.floor(home / N);
            const hc = home % N;
            const r = Math.floor(pos / N);
            const c = pos % N;
            const canMove = movable.includes(pos) && !solved;
            return (
              <motion.button
                key={tile}
                type="button"
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                onClick={() => tryMove(pos)}
                disabled={solved}
                aria-label={`Tile ${tile || N * N}${canMove ? ', can slide' : ''}`}
                className={`absolute overflow-hidden ${solved ? '' : 'rounded-xl border-2 border-cream-50'} ${canMove ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
                style={{
                  width: `${pct}%`,
                  height: `${pct}%`,
                  top: `${r * pct}%`,
                  left: `${c * pct}%`,
                  backgroundImage: `url("${slidingPuzzle.image}")`,
                  backgroundSize: `${N * 100}% ${N * 100}%`,
                  backgroundPosition: `${(hc / (N - 1)) * 100}% ${(hr / (N - 1)) * 100}%`,
                  opacity: tile === 0 ? 1 : 1,
                }}
                data-testid={`slide-tile-${tile}`}
              >
                {showNumbers && !solved && (
                  <span className="absolute left-1.5 top-1 rounded-full bg-berry-600/80 px-2 font-display text-sm font-bold text-cream-50">{tile}</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
        {solved && <p className="mt-3 text-center font-hand text-3xl text-berry-500">There we are! 💞</p>}
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="chip">👣 Moves: {moves}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-soft px-4 py-2 text-base" onClick={() => setShowRef((s) => !s)} aria-pressed={showRef}>
            {showRef ? 'Hide' : 'Show'} the original 🖼️
          </button>
          <button type="button" className="btn-ghost" onClick={() => setShowNumbers((s) => !s)} aria-pressed={showNumbers}>
            {showNumbers ? 'Hide' : 'Show'} numbers
          </button>
          <button type="button" className="btn-ghost" onClick={reshuffle}>↺ Reshuffle</button>
        </div>
        {showRef && (
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={slidingPuzzle.image}
            alt="The original picture"
            className="w-48 rounded-2xl border-4 border-blush-300 shadow-card"
          />
        )}
        <p className="text-center text-sm text-cocoa-500">Tip: tiles next to the gap can move. Arrow keys work too!</p>
      </div>
    </div>
  );
}
