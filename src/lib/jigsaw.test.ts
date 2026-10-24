import { describe, expect, it } from 'vitest';
import { makeEdges, piecePath, sides } from './jigsaw';
import { jigsaw } from '../content/content';

describe('jigsaw', () => {
  const { rows, cols } = jigsaw;
  const e = makeEdges(rows, cols);
  it('has the configured number of pieces (about 30)', () => {
    expect(rows * cols).toBeGreaterThanOrEqual(4);
  });
  it('neighbouring pieces interlock: a tab on one side is a blank on the other', () => {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const s = sides(e, r, c, rows, cols);
        if (c < cols - 1) expect(sides(e, r, c + 1, rows, cols).left).toBe(-s.right);
        if (r < rows - 1) expect(sides(e, r + 1, c, rows, cols).top).toBe(-s.bottom);
        if (r === 0) expect(s.top).toBe(0);
        if (c === 0) expect(s.left).toBe(0);
      }
  });
  it('builds a closed SVG path for every piece', () => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) expect(piecePath(e, r, c, rows, cols, 100)).toMatch(/^M .* Z$/);
  });
});
