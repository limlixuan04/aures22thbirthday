import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sudoku } from '../content/content';
import { boxDims, findConflicts, isSolved, type Grid } from '../lib/sudoku';
import { sfx } from '../lib/sound';
import type { LevelProps } from '.';

const clone = (g: Grid) => g.map((r) => r.slice());

export default function Level02Sudoku({ onComplete }: LevelProps) {
  const size = sudoku.size;
  const [br, bc] = boxDims(size);
  const [grid, setGrid] = useState<Grid>(() => clone(sudoku.puzzle));
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const given = useCallback((r: number, c: number) => sudoku.puzzle[r][c] !== 0, []);
  const conflicts = useMemo(() => findConflicts(grid), [grid]);

  const setCell = useCallback(
    (v: number) => {
      if (!sel || solved) return;
      const [r, c] = sel;
      if (given(r, c)) {
        sfx.bonk();
        setMessage('That one’s pre-filled — it can’t be changed! 🔒');
        return;
      }
      const next = clone(grid);
      next[r][c] = v;
      setGrid(next);
      if (v === 0) {
        sfx.click();
        setMessage(null);
        return;
      }
      const clash = findConflicts(next).has(`${r},${c}`);
      if (clash) {
        sfx.error();
        setMistakes((m) => m + 1);
        setMessage(`Oops! There’s already a ${v} in that row, column or box. 🙈`);
      } else {
        sfx.pop();
        setMessage(null);
      }
      if (isSolved(next)) {
        setSolved(true);
        setSel(null);
        onComplete();
      }
    },
    [sel, solved, grid, given, onComplete],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solved) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= size) {
        setCell(n);
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        setCell(0);
        e.preventDefault();
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        setSel((s) => {
          const [r, c] = s ?? [0, 0];
          if (!s) return [0, 0];
          if (e.key === 'ArrowUp') return [(r + size - 1) % size, c];
          if (e.key === 'ArrowDown') return [(r + 1) % size, c];
          if (e.key === 'ArrowLeft') return [r, (c + size - 1) % size];
          return [r, (c + 1) % size];
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCell, size, solved]);

  const reset = () => {
    sfx.whoosh();
    setGrid(clone(sudoku.puzzle));
    setSel(null);
    setMistakes(0);
    setSolved(false);
    setMessage(null);
  };

  const cellPx = size <= 4 ? 'h-16 w-16 text-3xl sm:h-20 sm:w-20 sm:text-4xl' : size <= 6 ? 'h-12 w-12 text-2xl sm:h-14 sm:w-14' : 'h-9 w-9 text-lg sm:h-12 sm:w-12 sm:text-2xl';

  return (
    <div className="flex flex-col items-center gap-5 md:flex-row md:items-start md:justify-center md:gap-10">
      <motion.div
        animate={solved ? { rotate: [0, -2, 2, 0], scale: [1, 1.04, 1] } : {}}
        className="rounded-3xl border-4 border-berry-600 bg-berry-600 p-1 shadow-pop"
        role="grid"
        aria-label={`${size} by ${size} sudoku`}
      >
        {grid.map((row, r) => (
          <div key={r} role="row" className={`flex ${r % br === br - 1 && r !== size - 1 ? 'mb-1' : 'mb-px'} last:mb-0`}>
            {row.map((v, c) => {
              const isGiven = given(r, c);
              const isSel = sel?.[0] === r && sel?.[1] === c;
              const related = sel && (sel[0] === r || sel[1] === c || (Math.floor(sel[0] / br) === Math.floor(r / br) && Math.floor(sel[1] / bc) === Math.floor(c / bc)));
              const bad = conflicts.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  type="button"
                  role="gridcell"
                  aria-label={`Row ${r + 1}, column ${c + 1}: ${v || 'empty'}${isGiven ? ' (given)' : ''}${bad ? ' (conflict)' : ''}`}
                  aria-selected={isSel}
                  onClick={() => {
                    sfx.click();
                    setSel([r, c]);
                  }}
                  data-testid={`sudoku-cell-${r}-${c}`}
                  className={`${cellPx} grid place-items-center font-display font-bold transition ${c % bc === bc - 1 && c !== size - 1 ? 'mr-1' : 'mr-px'} last:mr-0 ${
                    r === 0 && c === 0 ? 'rounded-tl-2xl' : ''
                  } ${r === 0 && c === size - 1 ? 'rounded-tr-2xl' : ''} ${r === size - 1 && c === 0 ? 'rounded-bl-2xl' : ''} ${r === size - 1 && c === size - 1 ? 'rounded-br-2xl' : ''} ${
                    solved ? 'bg-sage-200 text-berry-600' : isSel ? 'bg-blush-300 text-berry-700' : bad ? 'bg-blush-100 text-blush-500' : related ? 'bg-blush-50' : 'bg-cream-50'
                  } ${isGiven ? 'text-berry-700' : bad ? '' : 'text-blush-500'}`}
                >
                  {v ? <span className={bad && !isSel ? 'animate-shake' : ''}>{v}</span> : ''}
                  {isGiven && <span className="sr-only">given</span>}
                </button>
              );
            })}
          </div>
        ))}
      </motion.div>

      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <div className="grid w-full grid-cols-5 gap-2">
          {Array.from({ length: size }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" className="btn-soft aspect-square p-0 text-2xl" onClick={() => setCell(n)} disabled={!sel || solved} aria-label={`Enter ${n}`}>
              {n}
            </button>
          ))}
          <button type="button" className="btn-soft aspect-square p-0 text-xl" onClick={() => setCell(0)} disabled={!sel || solved} aria-label="Erase">
            ⌫
          </button>
        </div>
        <p className="text-center text-sm text-cocoa-500">{sel ? `Selected: row ${sel[0] + 1}, column ${sel[1] + 1}` : 'Tap an empty cell to begin.'}</p>
        <div className="flex items-center gap-3">
          <span className="chip">❌ Mistakes: {mistakes}</span>
          <button type="button" className="btn-ghost" onClick={reset}>↺ Reset</button>
        </div>
        <p className="min-h-[3rem] text-center font-display text-blush-500" aria-live="polite">
          {solved ? 'Solved! 🎉 You and me, the ultimate puzzle duo.' : message}
        </p>
        <p className="text-center text-xs text-cocoa-500">Dark numbers are pre-filled. Keyboard: arrows to move, 1–{size} to fill, Backspace to erase.</p>
      </div>
    </div>
  );
}
