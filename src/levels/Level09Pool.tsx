import { useCallback, useEffect, useRef, useState } from 'react';
import { poolGame } from '../content/content';
import { sfx } from '../lib/sound';
import { pick } from '../lib/random';
import { CUE, EIGHT, FOOT_SPOT, H, HEAD_SPOT, POCKETS, POCKET_R, R, W, aimGuide, isMoving, rack, respot, shoot, step, type Ball } from '../lib/pool';
import type { LevelProps } from '.';
import { Sentences } from '../components/Sentences';

const RAIL = 46;
const TW = W + RAIL * 2;
const TH = H + RAIL * 2;
const PULL = 260; // drag distance (table units) for full power

const BALL_COLOURS: Record<number, string> = {
  1: '#F2C14E',
  2: '#4A7FC1',
  3: '#D9534F',
  4: '#8E5BB5',
  5: '#EE8A3C',
  6: '#3E9A6B',
  7: '#8E2A4A',
  8: '#1E1A1C',
};

const colourIds = Array.from({ length: poolGame.colouredBalls }, (_, i) => i + 1);
/** The order balls must be potted in: 1, 2, 3 … then the 8-ball. */
const ORDER = [...colourIds, EIGHT];

function drawBall(ctx: CanvasRenderingContext2D, b: Ball, x = b.x, y = b.y, r = R) {
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(3, 4, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = b.id === CUE ? '#FFFCF7' : BALL_COLOURS[b.id] ?? '#999';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  if (b.id === CUE) {
    // a tiny heart on the cue ball
    ctx.fillStyle = '#E2688A';
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-7, -1, -4, -7, 0, -3);
    ctx.bezierCurveTo(4, -7, 7, -1, 0, 4);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFFCF7';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1A1C';
    ctx.font = `700 ${Math.round(r * 0.8)}px Fredoka, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(b.id), 0, 1);
  }
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.32, r * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function Level09Pool({ onComplete }: LevelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>(rack(poolGame.colouredBalls));
  const aim = useRef({ angle: 0, power: 0.55 });
  const dragging = useRef(false);
  const shotPotted = useRef<number[]>([]);
  const won = useRef(false);
  const expected = useRef(0);
  const shotsRef = useRef(0);
  const [nextBall, setNextBall] = useState(ORDER[0]);
  const [moving, setMoving] = useState(false);
  const [shots, setShots] = useState(0);
  const [potted, setPotted] = useState<number[]>([]);
  const [message, setMessage] = useState<string>(poolGame.startMessage);
  const [, setTick] = useState(0); // re-render for the power meter
  const [finished, setFinished] = useState(false);

  const syncTestData = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.dataset.balls = JSON.stringify(balls.current.map(({ id, x, y, potted }) => ({ id, x: Math.round(x), y: Math.round(y), potted })));
    c.dataset.moving = String(isMoving(balls.current));
  };

  // Called once all balls have stopped after a shot.
  const resetTable = (msg: string) => {
    balls.current = rack(poolGame.colouredBalls);
    expected.current = 0;
    shotsRef.current = 0;
    shotPotted.current = [];
    setNextBall(ORDER[0]);
    setPotted([]);
    setMessage(msg);
  };

  const settle = useCallback(() => {
    const b = balls.current;
    const sunk = shotPotted.current;
    shotPotted.current = [];
    const isBreak = shotsRef.current === 1;
    const msgs: string[] = [];
    const wrong: number[] = [];
    let goodPots = 0;
    for (const id of sunk) {
      if (id === CUE) continue;
      if (!wrong.length && id === ORDER[expected.current]) {
        expected.current += 1;
        goodPots += 1;
      } else wrong.push(id);
    }

    if (wrong.length && !isBreak) {
      sfx.bonk();
      resetTable(poolGame.wrongOrder.replace('{ball}', String(wrong[0])).replace('{next}', String(ORDER[expected.current])));
      setMoving(false);
      syncTestData();
      return;
    }
    if (wrong.length) {
      wrong.forEach((id) => respot(b, id, FOOT_SPOT));
      msgs.push(poolGame.breakRespot);
    }
    if (sunk.includes(CUE)) {
      respot(b, CUE, HEAD_SPOT);
      msgs.push(poolGame.scratchMessage);
      sfx.bonk();
    }
    if (expected.current >= ORDER.length) {
      setFinished(true);
      msgs.length = 0;
      msgs.push(poolGame.winMessage);
      if (!won.current) {
        won.current = true;
        onComplete();
      }
    } else if (goodPots) {
      msgs.unshift(ORDER[expected.current] === EIGHT ? poolGame.nowTheEight : pick(poolGame.potMessages));
    }
    if (!sunk.length) msgs.push(pick(poolGame.missMessages));
    if (msgs.length) setMessage(msgs.join(' '));
    setNextBall(ORDER[Math.min(expected.current, ORDER.length - 1)]);
    setPotted(b.filter((x) => x.potted && x.id !== CUE).map((x) => x.id));
    setMoving(false);
    syncTestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete]);

  // Main loop: physics while moving, redraw every frame.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let wasMoving = false;
    const loop = (t: number) => {
      const dt = Math.min(1 / 30, (t - last) / 1000);
      last = t;
      const b = balls.current;
      if (isMoving(b)) {
        const sunk = step(b, dt);
        if (sunk.length) {
          shotPotted.current.push(...sunk);
          sunk.forEach(() => sfx.pop());
        }
        wasMoving = true;
      } else if (wasMoving) {
        wasMoving = false;
        settle();
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    syncTestData();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settle]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = (cssW * TH) / TW;
    if (canvas.width !== Math.round(cssW * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = (cssW / TW) * dpr;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, TW, TH);

    // rails
    const wood = ctx.createLinearGradient(0, 0, 0, TH);
    wood.addColorStop(0, '#8A4A2E');
    wood.addColorStop(1, '#5E2E1C');
    ctx.fillStyle = wood;
    ctx.beginPath();
    ctx.roundRect(0, 0, TW, TH, 34);
    ctx.fill();
    // diamonds
    ctx.fillStyle = '#FBE3A6';
    for (let i = 1; i < 8; i++) {
      if (i === 4) continue;
      const x = RAIL + (W * i) / 8;
      [RAIL / 2, TH - RAIL / 2].forEach((y) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    for (let i = 1; i < 4; i++) {
      const y = RAIL + (H * i) / 4;
      [RAIL / 2, TW - RAIL / 2].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.save();
    ctx.translate(RAIL, RAIL);
    // felt
    const felt = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.65);
    felt.addColorStop(0, '#4FA477');
    felt.addColorStop(1, '#3A8460');
    ctx.fillStyle = felt;
    ctx.fillRect(-6, -6, W + 12, H + 12);
    // head string + spot
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(HEAD_SPOT[0], 0);
    ctx.lineTo(HEAD_SPOT[0], H);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(FOOT_SPOT[0], FOOT_SPOT[1], 3, 0, Math.PI * 2);
    ctx.fill();
    // pockets
    POCKETS.forEach(([px, py]) => {
      ctx.fillStyle = '#1A1012';
      ctx.beginPath();
      ctx.arc(px, py, POCKET_R - 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3B2418';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    const b = balls.current;
    const cue = b.find((x) => x.id === CUE)!;
    const idle = !isMoving(b) && !won.current;

    // aim guide
    if (idle) {
      const g = aimGuide(b, aim.current.angle);
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(g.end[0], g.end[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (g.ghost && g.targetDir) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(g.ghost[0], g.ghost[1], R, 0, Math.PI * 2);
        ctx.stroke();
        const t = b.find((x) => x.id === g.targetId)!;
        ctx.strokeStyle = 'rgba(251,227,166,0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + g.targetDir[0] * 90, t.y + g.targetDir[1] * 90);
        ctx.stroke();
      }
    }

    // glow around the ball that must go next
    const target = b.find((x) => x.id === ORDER[expected.current] && !x.potted);
    if (target && !won.current) {
      const pulse = 4 + Math.sin(performance.now() / 180) * 2;
      ctx.strokeStyle = 'rgba(251,227,166,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(target.x, target.y, R + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    // balls
    b.filter((x) => !x.potted).forEach((x) => drawBall(ctx, x));

    // cue stick
    if (idle) {
      const a = aim.current.angle;
      const back = R + 10 + aim.current.power * 70;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const x1 = cue.x - ux * back;
      const y1 = cue.y - uy * back;
      const x2 = x1 - ux * 420;
      const y2 = y1 - uy * 420;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(x1 + 4, y1 + 6);
      ctx.lineTo(x2 + 4, y2 + 6);
      ctx.stroke();
      ctx.strokeStyle = '#E8C48E';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = '#7A1F3D';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(x1 - ux * 260, y1 - uy * 260);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = '#7EC8E3';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - ux * 6, y1 - uy * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  const toTable = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * TW - RAIL, ((e.clientY - rect.top) / rect.height) * TH - RAIL] as const;
  };

  const updateAimFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cue = balls.current.find((x) => x.id === CUE)!;
    const [px, py] = toTable(e);
    const dx = cue.x - px;
    const dy = cue.y - py;
    const len = Math.hypot(dx, dy);
    if (len < 12) return;
    aim.current.angle = Math.atan2(dy, dx);
    aim.current.power = Math.min(1, len / PULL);
    setTick((t) => t + 1);
  };

  const fire = () => {
    if (isMoving(balls.current) || won.current) return;
    if (aim.current.power < 0.06) {
      setMessage(poolGame.tooSoft);
      return;
    }
    shoot(balls.current, aim.current.angle, aim.current.power);
    sfx.click();
    setShots((n) => n + 1);
    shotsRef.current += 1;
    setMoving(true);
    syncTestData();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won.current) return;
      const fine = e.shiftKey ? 0.2 : 1.5;
      if (e.key === 'ArrowLeft') aim.current.angle -= (fine * Math.PI) / 180;
      else if (e.key === 'ArrowRight') aim.current.angle += (fine * Math.PI) / 180;
      else if (e.key === 'ArrowUp') aim.current.power = Math.min(1, aim.current.power + 0.05);
      else if (e.key === 'ArrowDown') aim.current.power = Math.max(0.05, aim.current.power - 0.05);
      else if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        fire();
      } else return;
      e.preventDefault();
      setTick((t) => t + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const rerack = () => {
    resetTable(poolGame.startMessage);
    aim.current = { angle: 0, power: 0.55 };
    setShots(0);
    setFinished(false);
    setMoving(false);
    sfx.whoosh();
    syncTestData();
  };


  const coloursDown = potted.filter((id) => colourIds.includes(id)).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="chip text-base" data-testid="pool-progress">
          🎱 {coloursDown} / {poolGame.colouredBalls} balls, then the 8
        </span>
        {!finished && (
          <span className="chip text-base" data-testid="pool-next">
            Next:
            <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white" style={{ background: BALL_COLOURS[nextBall] }}>
              {nextBall}
            </span>
          </span>
        )}
        <span className="chip">Shots: {shots}</span>
        <button type="button" className="btn-ghost" onClick={rerack}>
          ↺ Re-rack
        </button>
      </div>

      <div className="w-full max-w-3xl">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none select-none rounded-[26px] shadow-pop"
          style={{ aspectRatio: `${TW} / ${TH}` }}
          aria-label="Pool table. Drag back from the white ball to aim and set power, then let go to shoot. Keyboard: left and right arrows aim, up and down arrows set power, Space shoots."
          role="img"
          data-testid="pool-table"
          onPointerDown={(e) => {
            if (moving || won.current) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            updateAimFromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && updateAimFromPointer(e)}
          onPointerUp={() => {
            if (!dragging.current) return;
            dragging.current = false;
            fire();
          }}
          onPointerCancel={() => (dragging.current = false)}
        />
      </div>

      <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" aria-label="Potted balls">
          <span className="text-sm text-cocoa-500">Potted:</span>
          {[...colourIds, EIGHT].map((id) => (
            <span
              key={id}
              className={`grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${potted.includes(id) ? 'border-transparent text-white' : 'border-dashed border-blush-300 text-blush-300'}`}
              style={potted.includes(id) ? { background: BALL_COLOURS[id] } : undefined}
            >
              {id}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-cocoa-500">Power</span>
          <div className="h-3 w-32 overflow-hidden rounded-full bg-blush-100" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-honey-300 via-ball-400 to-berry-500" style={{ width: `${aim.current.power * 100}%` }} />
          </div>
          <button type="button" className="btn-soft px-4 py-1.5 text-base" onClick={fire} disabled={moving || finished}>
            Shoot
          </button>
        </div>
      </div>

      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        <Sentences text={message} />
      </p>
      <p className="text-center text-sm text-cocoa-500">
        Drag back from the white ball like a slingshot, then let go · Keyboard: ← → aim (hold Shift for fine), ↑ ↓ power, Space to shoot
      </p>
    </div>
  );
}
