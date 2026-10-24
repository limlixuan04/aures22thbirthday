/**
 * Sliding puzzle: `tiles[i]` is the tile number at position i (1..n²-1), 0 = empty.
 * Solved = [1, 2, …, n²-1, 0].
 */
export function solvedTiles(n: number): number[] {
  return [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), 0];
}

export function isSolvedTiles(tiles: number[]): boolean {
  return tiles.every((t, i) => (i === tiles.length - 1 ? t === 0 : t === i + 1));
}

export function neighbours(index: number, n: number): number[] {
  const r = Math.floor(index / n);
  const c = index % n;
  const out: number[] = [];
  if (r > 0) out.push(index - n);
  if (r < n - 1) out.push(index + n);
  if (c > 0) out.push(index - 1);
  if (c < n - 1) out.push(index + 1);
  return out;
}

/** Moves the tile at `index` into the empty space if adjacent. Returns null for an illegal move. */
export function moveTile(tiles: number[], index: number, n: number): number[] | null {
  const empty = tiles.indexOf(0);
  if (!neighbours(empty, n).includes(index)) return null;
  const next = tiles.slice();
  [next[empty], next[index]] = [next[index], next[empty]];
  return next;
}

/** Shuffle by making random LEGAL moves from solved — always solvable. */
export function shuffleTiles(n: number, moves: number, rng: () => number = Math.random): number[] {
  let tiles = solvedTiles(n);
  let prevEmpty = -1;
  for (let i = 0; i < moves || isSolvedTiles(tiles); i++) {
    const empty = tiles.indexOf(0);
    const options = neighbours(empty, n).filter((x) => x !== prevEmpty);
    const choice = options[Math.floor(rng() * options.length)];
    prevEmpty = empty;
    tiles = moveTile(tiles, choice, n)!;
  }
  return tiles;
}

/** Parity check (odd grid widths): solvable iff inversion count is even. */
export function isSolvable(tiles: number[], n: number): boolean {
  const arr = tiles.filter((t) => t !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++;
  if (n % 2 === 1) return inv % 2 === 0;
  const emptyRowFromBottom = n - Math.floor(tiles.indexOf(0) / n);
  return (inv + emptyRowFromBottom) % 2 === 1;
}
