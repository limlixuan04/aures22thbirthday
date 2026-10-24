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

/** A cartoon basketball. */
export function Basketball({ className = 'w-10 h-10', style }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#EE8A3C" stroke="#5A2A12" strokeWidth="2.5" />
      <path d="M24 3 V45 M3 24 H45" stroke="#5A2A12" strokeWidth="2.2" fill="none" />
      <path d="M9.5 8.5 C17 15 17 33 9.5 39.5 M38.5 8.5 C31 15 31 33 38.5 39.5" stroke="#5A2A12" strokeWidth="2.2" fill="none" />
      <ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-35 15 13)" />
    </svg>
  );
}

/** A little basketball jersey with a number on it. */
export function Jersey({ className = 'w-32 h-36', number = '22', name = '' }: SvgProps & { number?: string; name?: string }) {
  return (
    <svg viewBox="0 0 120 136" className={className} aria-hidden="true">
      <path
        d="M34 4 C40 18 80 18 86 4 L104 10 C100 28 104 40 114 46 L114 130 Q114 134 110 134 L10 134 Q6 134 6 130 L6 46 C16 40 20 28 16 10Z"
        fill="#7A1F3D"
        stroke="#45101F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M34 4 C40 18 80 18 86 4" stroke="#F5CD6E" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M16 10 C20 28 16 40 6 46 M104 10 C100 28 104 40 114 46" stroke="#F5CD6E" strokeWidth="5" fill="none" strokeLinecap="round" />
      {name && (
        <text x="60" y="48" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="15" letterSpacing="2" fill="#FDE6EC">
          {name}
        </text>
      )}
      <text x="60" y="106" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="58" fill="#FDE6EC" stroke="#EE8A3C" strokeWidth="2.5" paintOrder="stroke">
        {number}
      </text>
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
      color: ['#C25B7A', '#E0995C', '#F5CD6E', '#A8395A'][i % 4],
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
          {it.kind === 0 ? <Heart className="h-full w-full opacity-70" color={it.color} /> : <Basketball className="h-full w-full opacity-50" />}
        </div>
      ))}
    </div>
  );
}

/** Gold championship trophy with a basketball on top. */
export function Trophy({ className = 'w-40 h-48', label = 'MVP' }: SvgProps & { label?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="trophy-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C8901A" />
          <stop offset="0.35" stopColor="#FBE3A6" />
          <stop offset="0.6" stopColor="#F5CD6E" />
          <stop offset="1" stopColor="#B07A12" />
        </linearGradient>
      </defs>
      {/* ball */}
      <g transform="translate(56 2)">
        <circle cx="24" cy="24" r="22" fill="#EE8A3C" stroke="#5A2A12" strokeWidth="2.5" />
        <path d="M24 2 V46 M2 24 H46 M9 8.5 C17 15 17 33 9 39.5 M39 8.5 C31 15 31 33 39 39.5" stroke="#5A2A12" strokeWidth="2.2" fill="none" />
        <ellipse cx="15" cy="13" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-35 15 13)" />
      </g>
      {/* cup */}
      <path d="M38 52 H122 C122 96 104 118 80 120 C56 118 38 96 38 52Z" fill="url(#trophy-gold)" stroke="#8C5A0A" strokeWidth="3" />
      <path d="M38 60 C18 60 14 92 46 100 M122 60 C142 60 146 92 114 100" stroke="#C8901A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M58 62 C58 88 66 104 74 110" stroke="#FFF6C9" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7" />
      {/* stem + base */}
      <rect x="70" y="118" width="20" height="22" fill="url(#trophy-gold)" stroke="#8C5A0A" strokeWidth="3" />
      <path d="M52 140 H108 L114 158 H46Z" fill="url(#trophy-gold)" stroke="#8C5A0A" strokeWidth="3" strokeLinejoin="round" />
      <rect x="38" y="158" width="84" height="30" rx="5" fill="#7A1F3D" stroke="#45101F" strokeWidth="3" />
      <text x="80" y="181" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="22" letterSpacing="2" fill="#F5CD6E">
        {label}
      </text>
      <text x="80" y="92" textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="30" fill="#8C5A0A" opacity=".85">
        22
      </text>
    </svg>
  );
}
