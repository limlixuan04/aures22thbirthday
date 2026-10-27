/**
 * Tiny top-down pool physics for Level 9. Pure functions, no React.
 * Table units: the playing surface is W × H; (0,0) is the top-left cushion corner.
 */
export const W = 1000;
export const H = 500;
export const R = 14; // ball radius
export const POCKET_R = 32; // capture radius (generous = easier)

export const POCKETS: [number, number][] = [
  [0, 0],
  [W / 2, -8],
  [W, 0],
  [0, H],
  [W / 2, H + 8],
  [W, H],
];

export const CUE = 0;
export const EIGHT = 8;
export const NINE = 9;
export const HEAD_SPOT: [number, number] = [W * 0.25, H / 2];
export const FOOT_SPOT: [number, number] = [W * 0.72, H / 2];

const DECEL = 170; // constant rolling friction (units/s²)
const DRAG = 0.55; // speed-proportional friction (1/s)
const CUSHION = 0.8; // energy kept when bouncing off a cushion
const RESTITUTION = 0.96; // ball–ball bounciness
export const MAX_SPEED = 1700;

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  potted: boolean;
}

/** 9-ball diamond rack: the 1 at the front, the 9 in the middle, 2–8 shuffled around them. */
export function rack9(rng: () => number = Math.random): Ball[] {
  const rows = [1, 2, 3, 2, 1];
  const others = [2, 3, 4, 5, 6, 7, 8];
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const balls: Ball[] = [{ id: CUE, x: HEAD_SPOT[0], y: HEAD_SPOT[1], vx: 0, vy: 0, potted: false }];
  let k = 0;
  rows.forEach((n, ri) => {
    for (let j = 0; j < n; j++) {
      const id = ri === 0 ? 1 : ri === 2 && j === 1 ? NINE : others[k++];
      balls.push({
        id,
        x: FOOT_SPOT[0] + ri * (R * Math.sqrt(3) + 0.5),
        y: FOOT_SPOT[1] + (j - (n - 1) / 2) * (2 * R + 0.5),
        vx: 0,
        vy: 0,
        potted: false,
      });
    }
  });
  return balls;
}

/** Triangle rack: cue ball plus `colours` numbered balls and the 8-ball in the middle of the back row. */
export function rack(colours = 5): Ball[] {
  const ids = Array.from({ length: colours }, (_, i) => i + 1);
  const total = colours + 1;
  // rows 1,2,3,… until all balls fit
  const rows: number[] = [];
  for (let n = 1, left = total; left > 0; n++) {
    rows.push(Math.min(n, left));
    left -= n;
  }
  const order: number[] = [];
  const eightRow = rows.length >= 3 ? 2 : rows.length - 1;
  let k = 0;
  rows.forEach((n, ri) => {
    for (let j = 0; j < n; j++) {
      if (ri === eightRow && j === Math.floor(n / 2)) order.push(EIGHT);
      else order.push(ids[k++]);
    }
  });
  const balls: Ball[] = [{ id: CUE, x: HEAD_SPOT[0], y: HEAD_SPOT[1], vx: 0, vy: 0, potted: false }];
  let idx = 0;
  rows.forEach((n, ri) => {
    for (let j = 0; j < n; j++) {
      const id = order[idx++] ?? ids[k++];
      balls.push({
        id,
        x: FOOT_SPOT[0] + ri * (R * Math.sqrt(3) + 0.5),
        y: FOOT_SPOT[1] + (j - (n - 1) / 2) * (2 * R + 0.5),
        vx: 0,
        vy: 0,
        potted: false,
      });
    }
  });
  return balls;
}

export function isMoving(balls: Ball[]): boolean {
  return balls.some((b) => !b.potted && (b.vx !== 0 || b.vy !== 0));
}

/** Things that happened during a shot (filled in by `step`). */
export interface ShotEvents {
  /** The first ball the cue ball touched, or null if it hasn't hit one yet. */
  firstHit: number | null;
}

/** Advance the simulation by dt seconds. Returns ids of balls potted during this step. */
export function step(balls: Ball[], dt: number, substeps = 8, events?: ShotEvents): number[] {
  const potted: number[] = [];
  const h = dt / substeps;
  for (let s = 0; s < substeps; s++) {
    for (const b of balls) {
      if (b.potted) continue;
      b.x += b.vx * h;
      b.y += b.vy * h;
      const speed = Math.hypot(b.vx, b.vy);
      if (speed > 0) {
        const next = Math.max(0, speed - (DECEL + speed * DRAG) * h);
        if (next < 4) {
          b.vx = 0;
          b.vy = 0;
        } else {
          b.vx *= next / speed;
          b.vy *= next / speed;
        }
      }
      // pockets first, so balls near a pocket drop instead of bouncing
      if (POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)) {
        b.potted = true;
        b.vx = 0;
        b.vy = 0;
        potted.push(b.id);
        continue;
      }
      if (b.x < R) {
        b.x = R;
        b.vx = Math.abs(b.vx) * CUSHION;
      } else if (b.x > W - R) {
        b.x = W - R;
        b.vx = -Math.abs(b.vx) * CUSHION;
      }
      if (b.y < R) {
        b.y = R;
        b.vy = Math.abs(b.vy) * CUSHION;
      } else if (b.y > H - R) {
        b.y = H - R;
        b.vy = -Math.abs(b.vy) * CUSHION;
      }
    }
    // ball–ball collisions (equal mass)
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      if (a.potted) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j];
        if (b.potted) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d === 0 || d >= 2 * R) continue;
        if (events && events.firstHit === null && (a.id === CUE || b.id === CUE)) events.firstHit = a.id === CUE ? b.id : a.id;
        const nx = dx / d;
        const ny = dy / d;
        const overlap = 2 * R - d;
        a.x -= (nx * overlap) / 2;
        a.y -= (ny * overlap) / 2;
        b.x += (nx * overlap) / 2;
        b.y += (ny * overlap) / 2;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel <= 0) continue;
        const j2 = ((1 + RESTITUTION) / 2) * rel;
        a.vx -= j2 * nx;
        a.vy -= j2 * ny;
        b.vx += j2 * nx;
        b.vy += j2 * ny;
      }
    }
  }
  return potted;
}

export function shoot(balls: Ball[], angle: number, power: number): void {
  const cue = balls.find((b) => b.id === CUE)!;
  const p = Math.max(0, Math.min(1, power));
  cue.vx = Math.cos(angle) * p * MAX_SPEED;
  cue.vy = Math.sin(angle) * p * MAX_SPEED;
}

/** Put a ball back on (or as near as possible to) a spot without overlapping others. */
export function respot(balls: Ball[], id: number, spot: [number, number]): void {
  const ball = balls.find((b) => b.id === id)!;
  const free = (x: number, y: number) => balls.every((o) => o === ball || o.potted || Math.hypot(o.x - x, o.y - y) > 2 * R + 1);
  for (let ring = 0; ring < 40; ring++) {
    for (let k = 0; k < Math.max(1, ring * 6); k++) {
      const a = (k / Math.max(1, ring * 6)) * Math.PI * 2;
      const x = Math.min(W - R, Math.max(R, spot[0] + Math.cos(a) * ring * R));
      const y = Math.min(H - R, Math.max(R, spot[1] + Math.sin(a) * ring * R));
      if (free(x, y)) {
        Object.assign(ball, { x, y, vx: 0, vy: 0, potted: false });
        return;
      }
    }
  }
}

export interface Guide {
  end: [number, number];
  ghost: [number, number] | null;
  targetId: number | null;
  targetDir: [number, number] | null;
}

/** Where the cue ball would travel in a straight line, and what it would hit first. */
export function aimGuide(balls: Ball[], angle: number): Guide {
  const cue = balls.find((b) => b.id === CUE)!;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  let best = Infinity;
  let target: Ball | null = null;
  for (const b of balls) {
    if (b.id === CUE || b.potted) continue;
    const ox = b.x - cue.x;
    const oy = b.y - cue.y;
    const proj = ox * ux + oy * uy;
    if (proj <= 0) continue;
    const perp2 = ox * ox + oy * oy - proj * proj;
    if (perp2 >= 4 * R * R) continue;
    const t = proj - Math.sqrt(4 * R * R - perp2);
    if (t < best) {
      best = t;
      target = b;
    }
  }
  // distance to the cushion line
  const tx = ux > 0 ? (W - R - cue.x) / ux : ux < 0 ? (R - cue.x) / ux : Infinity;
  const ty = uy > 0 ? (H - R - cue.y) / uy : uy < 0 ? (R - cue.y) / uy : Infinity;
  const wall = Math.min(tx, ty);
  if (target && best < wall) {
    const gx = cue.x + ux * best;
    const gy = cue.y + uy * best;
    const dx = target.x - gx;
    const dy = target.y - gy;
    const d = Math.hypot(dx, dy) || 1;
    return { end: [gx, gy], ghost: [gx, gy], targetId: target.id, targetDir: [dx / d, dy / d] };
  }
  return { end: [cue.x + ux * wall, cue.y + uy * wall], ghost: null, targetId: null, targetDir: null };
}
