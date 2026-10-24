import { useMemo } from 'react';
import { seeded } from '../lib/random';

type SvgProps = { className?: string; color?: string; style?: React.CSSProperties };

export function Heart({ className = 'w-6 h-6', color = '#E2688A', style }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2.2 0 3.6 1.2 5 3 1.4-1.8 2.8-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z"
        fill={color}
      />
      <ellipse cx="7.5" cy="8.5" rx="2" ry="1.2" fill="#fff" opacity=".55" transform="rotate(-30 7.5 8.5)" />
    </svg>
  );
}

export function Bow({ className = 'w-10 h-10', color = '#E2688A', style }: SvgProps) {
  return (
    <svg viewBox="0 0 64 40" className={className} style={style} aria-hidden="true">
      <path d="M32 20 C20 2 4 4 6 18 C8 32 22 30 32 20Z" fill={color} stroke="#7A1F3D" strokeWidth="2" />
      <path d="M32 20 C44 2 60 4 58 18 C56 32 42 30 32 20Z" fill={color} stroke="#7A1F3D" strokeWidth="2" />
      <path d="M30 22 L22 38 L28 36 L31 39Z M34 22 L42 38 L36 36 L33 39Z" fill={color} stroke="#7A1F3D" strokeWidth="1.5" />
      <ellipse cx="32" cy="20" rx="6" ry="6.5" fill={color} stroke="#7A1F3D" strokeWidth="2" />
      <path d="M12 14 C14 10 20 10 24 14" stroke="#fff" strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ className = 'w-5 h-5', color = '#F5CD6E', style }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={color} />
    </svg>
  );
}

/** Gently drifting hearts & sparkles behind everything. */
export function FloatingBackground({ count = 14 }: { count?: number }) {
  const items = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: count }, (_, i) => ({
      left: r() * 100,
      size: 12 + r() * 22,
      delay: -r() * 30,
      duration: 22 + r() * 18,
      kind: i % 3,
      color: ['#F6B3C4', '#EF8FA8', '#F5CD6E', '#FAD0DB'][i % 4],
    }));
  }, [count]);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${it.left}%`,
            bottom: '-40px',
            width: it.size,
            height: it.size,
            animation: `drift ${it.duration}s linear ${it.delay}s infinite`,
          }}
        >
          {it.kind === 2 ? <Sparkle className="h-full w-full" color={it.color} /> : <Heart className="h-full w-full" color={it.color} />}
        </div>
      ))}
    </div>
  );
}
