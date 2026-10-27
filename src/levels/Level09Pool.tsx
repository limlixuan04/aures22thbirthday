import { useCallback, useEffect, useRef, useState } from 'react';
import { poolGame } from '../content/content';
import { sfx } from '../lib/sound';
import { pick } from '../lib/random';
import { CUE, EIGHT, FOOT_SPOT, H, HEAD_SPOT, POCKETS, POCKET_R, R, W, aimGuide, isMoving, rack, respot, shoot, step, type Ball, type ShotEvents } from '../lib/pool';
import type { LevelProps } from '.';
import { Sentences } from '../components/Sentences';

const RAIL = 46;
const TW = W + RAIL * 2;
const TH = H + RAIL * 2;

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
  const aim = useRef({ angle: 0, power: 0 });
  const dragging = useRef(false);
  const shotPotted = useRef<number[]>([]);
  const won = useRef(false);
  const expected = useRef(0);
  const shotTarget = useRef<number>(1);
  const shotEvents = useRef<ShotEvents>({ firstHit: null });
  const foulsRef = useRef(0);
  const [fouls, setFouls] = useState(0);
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
    foulsRef.current = 0;
    setFouls(0);
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
    const target = shotTarget.current;
    const firstHit = shotEvents.current.firstHit;
    const cueIn = sunk.includes(CUE);
    const finish = (msg: string) => {
      setMessage(msg);
      setNextBall(ORDER[Math.min(expected.current, ORDER.length - 1)]);
      setPotted(b.filter((x) => x.potted && x.id !== CUE).map((x) => x.id));
      setMoving(false);
      syncTestData();
    };

    // --- the 8-ball: instant game over if it's early or goes in with the white
    if (sunk.includes(EIGHT)) {
      if (target === EIGHT && !cueIn) {
        expected.current = ORDER.length;
        setFinished(true);
        if (!won.current) {
          won.current = true;
          onComplete();
        }
        return finish(poolGame.winMessage);
      }
      if (isBreak && !cueIn) {
        respot(b, EIGHT, FOOT_SPOT); // a break is forgiven
      } else {
        sfx.bonk();
        resetTable(cueIn ? poolGame.eightScratch : poolGame.eightEarly);
        setMoving(false);
        syncTestData();
        return;
      }
    }

    // --- coloured balls in order; out-of-order ones go back
    const fouls: string[] = [];
    let goodPots = 0;
    let respotted = false;
    for (const id of sunk) {
      if (id === CUE || id === EIGHT) continue;
      if (id === ORDER[expected.current]) {
        expected.current += 1;
        goodPots += 1;
      } else {
        respot(b, id, FOOT_SPOT);
        if (isBreak) respotted = true;
        else fouls.push(poolGame.foulWrongPot.replace('{ball}', String(id)));
      }
    }

    // --- other fouls
    if (cueIn) {
      respot(b, CUE, HEAD_SPOT);
      fouls.unshift(poolGame.foulScratch);
    }
    if (firstHit === null) fouls.unshift(poolGame.foulNoHit);
    else if (!isBreak && firstHit !== target) fouls.unshift(poolGame.foulWrongFirst.replace('{hit}', String(firstHit)).replace('{next}', String(target)));

    if (fouls.length) {
      sfx.bonk();
      const n = foulsRef.current + 1;
      if (n >= poolGame.maxFouls) {
        resetTable(`${fouls[0]} ${poolGame.threeFouls}`);
        setMoving(false);
        syncTestData();
        return;
      }
      foulsRef.current = n;
      setFouls(n);
      return finish(`${fouls[0]} (Foul ${n}/${poolGame.maxFouls})`);
    }

    const msgs: string[] = [];
    if (respotted) msgs.push(poolGame.breakRespot);
    if (goodPots) msgs.unshift(ORDER[expected.current] === EIGHT ? poolGame.nowTheEight : pick(poolGame.potMessages));
    else if (!sunk.length) msgs.push(pick(poolGame.missMessages));
    finish(msgs.join(' ') || pick(poolGame.missMessages));
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
        const sunk = step(b, dt, 8, shotEvents.current);
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

  /** Step 1 — aim: the cue points from the white ball towards your finger / mouse. */
  const updateAimFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cue = balls.current.find((x) => x.id === CUE)!;
    const [px, py] = toTable(e);
    if (Math.hypot(px - cue.x, py - cue.y) < 8) return;
    aim.current.angle = Math.atan2(py - cue.y, px - cue.x);
    setTick((t) => t + 1);
  };

  const nudge = (deg: number) => {
    aim.current.angle += (deg * Math.PI) / 180;
    setTick((t) => t + 1);
  };

  /** Step 2 — power: pull the stick down, let go to shoot. */
  const pullTrack = useRef<HTMLDivElement>(null);
  const pulling = useRef<number | null>(null);
  const updatePull = (clientY: number) => {
    const rect = pullTrack.current!.getBoundingClientRect();
    const start = pulling.current ?? rect.top;
    aim.current.power = Math.max(0, Math.min(1, (clientY - start) / (rect.height * 0.8)));
    setTick((t) => t + 1);
  };

  const fire = () => {
    if (isMoving(balls.current) || won.current) return;
    if (aim.current.power < 0.06) {
      setMessage(poolGame.tooSoft);
      return;
    }
    shotTarget.current = ORDER[Math.min(expected.current, ORDER.length - 1)];
    shotEvents.current = { firstHit: null };
    shoot(balls.current, aim.current.angle, aim.current.power);
    aim.current.power = 0;
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
    aim.current = { angle: 0, power: 0 };
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
        <span className={`chip ${fouls ? 'bg-[#FFE3E8] text-[#C2264B]' : ''}`} data-testid="pool-fouls">
          Fouls: {fouls} / {poolGame.maxFouls}
        </span>
        <button type="button" className="btn-ghost" onClick={rerack}>
          ↺ Re-rack
        </button>
      </div>

      <div className="flex w-full max-w-3xl items-stretch gap-2 sm:gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center gap-1 sm:w-14">
          <span className="font-display text-[10px] font-bold uppercase tracking-widest text-cocoa-500">Power</span>
          <div
            ref={pullTrack}
            className={`relative w-full flex-1 touch-none select-none overflow-hidden rounded-full border-4 border-[#5E2E1C] bg-gradient-to-b from-sage-300 via-honey-300 to-[#C2264B] ${moving || finished ? 'opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
            onPointerDown={(e) => {
              if (moving || won.current) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pulling.current = e.clientY;
              updatePull(e.clientY);
            }}
            onPointerMove={(e) => pulling.current !== null && updatePull(e.clientY)}
            onPointerUp={() => {
              if (pulling.current === null) return;
              pulling.current = null;
              fire();
            }}
            onPointerCancel={() => {
              pulling.current = null;
              aim.current.power = 0;
              setTick((t) => t + 1);
            }}
            role="slider"
            aria-label="Power: pull down and let go to shoot"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(aim.current.power * 100)}
            data-testid="pool-power"
          >
            <div className="absolute inset-x-0 top-0 bg-[#2A1A20]/70" style={{ height: `${100 - aim.current.power * 100}%` }} />
            {/* the cue stick handle */}
            <div className="absolute left-1/2 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#7EC8E3] via-[#E8C48E] to-berry-600 shadow" style={{ top: `${aim.current.power * 80}%`, height: '60%' }} />
          </div>
          <span className="font-display text-xs font-bold tabular-nums text-berry-600">{Math.round(aim.current.power * 100)}%</span>
        </div>
        <div className="min-w-0 flex-1">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none select-none rounded-[26px] shadow-pop"
          style={{ aspectRatio: `${TW} / ${TH}` }}
          aria-label="Pool table. Drag on the table to aim. Then pull the power stick down and let go to shoot. Keyboard: left and right arrows aim, up and down arrows set power, Space shoots."
          role="img"
          data-testid="pool-table"
          onPointerDown={(e) => {
            if (moving || won.current) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            updateAimFromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && updateAimFromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        />
        <div className="mt-2 flex items-center justify-center gap-2">
          <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={() => nudge(-0.4)} disabled={moving || finished} aria-label="Fine-tune aim left">
            ⟲ fine
          </button>
          <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={() => nudge(0.4)} disabled={moving || finished} aria-label="Fine-tune aim right">
            fine ⟳
          </button>
        </div>
        </div>
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
      </div>

      <p className="min-h-[2rem] text-center font-hand text-2xl text-berry-500" aria-live="polite">
        <Sentences text={message} />
      </p>
      <p className="text-center text-sm text-cocoa-500">
        <span className="block">1. Drag on the table to aim.</span>
        <span className="block">2. Pull the power stick down, then let go to shoot.</span>
      </p>
    </div>
  );
}
