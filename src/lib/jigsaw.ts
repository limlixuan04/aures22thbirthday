/**
 * Jigsaw piece shapes for Level 5. Each inner edge gets a tab that sticks out
 * of one piece and into its neighbour; border edges are flat.
 */
import { seeded } from './random';

export interface Edges {
  /** h[r][c]: edge between row r and r+1 in column c. +1 = tab points down, -1 = up. */
  h: number[][];
  /** v[r][c]: edge between column c and c+1 in row r. +1 = tab points right, -1 = left. */
  v: number[][];
}

export function makeEdges(rows: number, cols: number, seed = 22): Edges {
  const rnd = seeded(seed);
  const flip = () => (rnd() < 0.5 ? 1 : -1);
  return {
    h: Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, flip)),
    v: Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, flip)),
  };
}

/** Outward tab direction for each side of piece (r, c): +1 tab, -1 blank, 0 flat. */
export function sides(edges: Edges, r: number, c: number, rows: number, cols: number) {
  return {
    top: r === 0 ? 0 : -edges.h[r - 1][c],
    right: c === cols - 1 ? 0 : edges.v[r][c],
    bottom: r === rows - 1 ? 0 : edges.h[r][c],
    left: c === 0 ? 0 : -edges.v[r][c - 1],
  };
}

// Classic jigsaw tab, as (t along the edge, h out from the edge) control points.
const TAB: [number, number][][] = [
  [[0.38, 0]],
  [[0.42, 0], [0.42, 0.08], [0.38, 0.13]],
  [[0.32, 0.22], [0.42, 0.28], [0.5, 0.28]],
  [[0.58, 0.28], [0.68, 0.22], [0.62, 0.13]],
  [[0.58, 0.08], [0.58, 0], [0.62, 0]],
  [[1, 0]],
];

function edgePath(x0: number, y0: number, ux: number, uy: number, len: number, sign: number): string {
  // outward normal = direction rotated -90° (y points down in SVG)
  const nx = uy;
  const ny = -ux;
  const pt = ([t, h]: [number, number]) => {
    const x = x0 + ux * t * len + nx * h * len * sign;
    const y = y0 + uy * t * len + ny * h * len * sign;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  if (sign === 0) return `L ${pt([1, 0])}`;
  return TAB.map((seg) => (seg.length === 1 ? `L ${pt(seg[0])}` : `C ${seg.map(pt).join(' ')}`)).join(' ');
}

/** SVG path for piece (r, c), in board coordinates (cell size `cell`). */
export function piecePath(edges: Edges, r: number, c: number, rows: number, cols: number, cell: number): string {
  const s = sides(edges, r, c, rows, cols);
  const x = c * cell;
  const y = r * cell;
  return [
    `M ${x} ${y}`,
    edgePath(x, y, 1, 0, cell, s.top),
    edgePath(x + cell, y, 0, 1, cell, s.right),
    edgePath(x + cell, y + cell, -1, 0, cell, s.bottom),
    edgePath(x, y + cell, 0, -1, cell, s.left),
    'Z',
  ].join(' ');
}
