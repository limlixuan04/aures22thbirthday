export type Grid = number[][];

export function boxDims(size: number): [rows: number, cols: number] {
  if (size === 4) return [2, 2];
  if (size === 6) return [2, 3];
  if (size === 9) return [3, 3];
  throw new Error(`Unsupported sudoku size ${size}`);
}

/** Set of "r,c" keys for cells whose value clashes with another in its row, column or box. */
export function findConflicts(grid: Grid): Set<string> {
  const size = grid.length;
  const [br, bc] = boxDims(size);
  const out = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (!v) continue;
      for (let i = 0; i < size; i++) {
        if (i !== c && grid[r][i] === v) out.add(`${r},${c}`);
        if (i !== r && grid[i][c] === v) out.add(`${r},${c}`);
      }
      const r0 = Math.floor(r / br) * br;
      const c0 = Math.floor(c / bc) * bc;
      for (let rr = r0; rr < r0 + br; rr++)
        for (let cc = c0; cc < c0 + bc; cc++)
          if ((rr !== r || cc !== c) && grid[rr][cc] === v) out.add(`${r},${c}`);
    }
  }
  return out;
}

export function isSolved(grid: Grid): boolean {
  return grid.every((row) => row.every((v) => v > 0)) && findConflicts(grid).size === 0;
}

/** Counts solutions up to `limit` (used by tests to verify the puzzle is unique). */
export function countSolutions(puzzle: Grid, limit = 2): number {
  const g = puzzle.map((r) => r.slice());
  const size = g.length;
  let count = 0;
  const valid = (r: number, c: number, v: number) => {
    const [br, bc] = boxDims(size);
    for (let i = 0; i < size; i++) if (g[r][i] === v || g[i][c] === v) return false;
    const r0 = Math.floor(r / br) * br;
    const c0 = Math.floor(c / bc) * bc;
    for (let rr = r0; rr < r0 + br; rr++) for (let cc = c0; cc < c0 + bc; cc++) if (g[rr][cc] === v) return false;
    return true;
  };
  const solve = (): void => {
    if (count >= limit) return;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!g[r][c]) {
          for (let v = 1; v <= size; v++)
            if (valid(r, c, v)) {
              g[r][c] = v;
              solve();
              g[r][c] = 0;
            }
          return;
        }
    count++;
  };
  solve();
  return count;
}
