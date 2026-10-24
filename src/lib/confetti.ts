import confetti from 'canvas-confetti';

const COLORS = ['#F6B3C4', '#E2688A', '#7A1F3D', '#F5CD6E', '#FFF6EA', '#A9D2A6'];

export function burst(origin = { x: 0.5, y: 0.6 }) {
  void confetti({
    particleCount: 90,
    spread: 75,
    origin,
    colors: COLORS,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

let heartShape: confetti.Shape | null = null;
function heart(): confetti.Shape | null {
  try {
    heartShape ??= confetti.shapeFromPath({
      path: 'M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2.2 0 3.6 1.2 5 3 1.4-1.8 2.8-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z',
    });
    return heartShape;
  } catch {
    return null;
  }
}

export function hearts() {
  const h = heart();
  void confetti({
    particleCount: 40,
    spread: 100,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#E2688A', '#F6B3C4', '#C25B7A'],
    shapes: h ? [h] : undefined,
    scalar: 1.6,
    disableForReducedMotion: true,
  });
}

/** Big multi-second celebration (finale, wordle win, cake). */
export function celebrate(durationMs = 2500) {
  const end = Date.now() + durationMs;
  const frame = () => {
    void confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS, disableForReducedMotion: true });
    void confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  setTimeout(hearts, 300);
}
