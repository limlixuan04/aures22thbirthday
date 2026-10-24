import { describe, expect, it } from 'vitest';
import { CUE, EIGHT, H, R, W, aimGuide, isMoving, rack, respot, shoot, step, type Ball } from './pool';

const settle = (balls: Ball[]) => {
  const potted: number[] = [];
  for (let i = 0; i < 60 * 30 && isMoving(balls); i++) potted.push(...step(balls, 1 / 60));
  return potted;
};

describe('pool physics', () => {
  it('racks the cue ball, 5 colours and the 8-ball without overlaps', () => {
    const b = rack(5);
    expect(b.map((x) => x.id).sort((a, c) => a - c)).toEqual([0, 1, 2, 3, 4, 5, 8]);
    for (let i = 0; i < b.length; i++)
      for (let j = i + 1; j < b.length; j++) expect(Math.hypot(b[i].x - b[j].x, b[i].y - b[j].y)).toBeGreaterThanOrEqual(2 * R);
  });

  it('a break shot keeps every ball on the table or in a pocket, and everything stops', () => {
    const b = rack(5);
    shoot(b, 0, 1);
    settle(b);
    expect(isMoving(b)).toBe(false);
    for (const x of b.filter((x) => !x.potted)) {
      expect(x.x).toBeGreaterThanOrEqual(R - 0.01);
      expect(x.x).toBeLessThanOrEqual(W - R + 0.01);
      expect(x.y).toBeGreaterThanOrEqual(R - 0.01);
      expect(x.y).toBeLessThanOrEqual(H - R + 0.01);
    }
  });

  it('a straight shot pots a ball sitting in front of a corner pocket', () => {
    const b: Ball[] = [
      { id: CUE, x: 300, y: 300, vx: 0, vy: 0, potted: false },
      { id: 1, x: 100, y: 100, vx: 0, vy: 0, potted: false },
    ];
    const angle = Math.atan2(100 - 300, 100 - 300);
    shoot(b, angle, 0.6);
    const potted = settle(b);
    expect(potted).toContain(1);
  });

  it('the aim guide reports the first ball in the line of fire', () => {
    const b: Ball[] = [
      { id: CUE, x: 200, y: 250, vx: 0, vy: 0, potted: false },
      { id: 3, x: 500, y: 250, vx: 0, vy: 0, potted: false },
      { id: EIGHT, x: 700, y: 250, vx: 0, vy: 0, potted: false },
    ];
    const g = aimGuide(b, 0);
    expect(g.targetId).toBe(3);
    expect(g.ghost![0]).toBeCloseTo(500 - 2 * R);
  });

  it('respots a ball onto a free space', () => {
    const b = rack(5);
    const cue = b[0];
    cue.potted = true;
    respot(b, CUE, [b[1].x, b[1].y]); // spot is occupied by ball 1
    expect(cue.potted).toBe(false);
    for (const o of b.slice(1)) expect(Math.hypot(o.x - cue.x, o.y - cue.y)).toBeGreaterThan(2 * R);
  });
});
