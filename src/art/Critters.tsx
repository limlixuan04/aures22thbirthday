/** Original cartoon critters used across the games. */
type Props = { className?: string; style?: React.CSSProperties };

export function Duck({ className = 'w-14 h-14', style, happy = false, rainbow = false }: Props & { happy?: boolean; rainbow?: boolean }) {
  const body = rainbow ? 'url(#duck-rainbow)' : '#FFD84D';
  const line = rainbow ? '#8A5BB5' : '#C8901A';
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      {rainbow && (
        <defs>
          <linearGradient id="duck-rainbow" x1="0" y1="10" x2="0" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6B8B" />
            <stop offset=".25" stopColor="#FFB347" />
            <stop offset=".45" stopColor="#FFE066" />
            <stop offset=".65" stopColor="#7ED957" />
            <stop offset=".82" stopColor="#6EC6FF" />
            <stop offset="1" stopColor="#B28DFF" />
          </linearGradient>
        </defs>
      )}
      <ellipse cx="32" cy="58" rx="20" ry="3" fill="#7A1F3D" opacity=".12" />
      <path d="M10 38 C10 26 22 24 30 30 C34 22 54 22 54 38 C54 52 42 56 32 56 C18 56 10 50 10 38Z" fill={body} stroke={line} strokeWidth="2" />
      <circle cx="22" cy="24" r="13" fill={body} stroke={line} strokeWidth="2" />
      <path d="M8 26 C2 26 2 30 8 31 L14 30 Z" fill="#FF9A3C" stroke="#C86A1A" strokeWidth="1.5" />
      {happy ? (
        <path d="M17 21 q3 -3 6 0" stroke="#45101F" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="19" cy="21" r="2.4" fill="#45101F" />
      )}
      <circle cx="19.8" cy="20.2" r=".8" fill="#fff" />
      <ellipse cx="26" cy="28" rx="3" ry="2" fill="#F6A0B4" opacity=".8" />
      <path d="M34 38 C40 34 48 36 48 42 C44 44 38 44 34 38Z" fill={rainbow ? '#FFFFFF' : '#FFC928'} fillOpacity={rainbow ? 0.5 : 1} stroke={line} strokeWidth="1.5" />
    </svg>
  );
}

export function Bao({ className = 'w-14 h-14', style, bonk = false }: Props & { bonk?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <path d="M6 44 C6 22 18 12 32 12 C46 12 58 22 58 44 C58 52 50 56 32 56 C14 56 6 52 6 44Z" fill="#FFF8EE" stroke="#D9C3B0" strokeWidth="2" />
      <path d="M26 14 q6 6 12 0 M30 13 q2 5 4 0" stroke="#D9C3B0" strokeWidth="2" fill="none" strokeLinecap="round" />
      {bonk ? (
        <>
          <path d="M20 34 l6 4 M26 34 l-6 4 M38 34 l6 4 M44 34 l-6 4" stroke="#45101F" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="23" cy="36" r="3" fill="#45101F" />
          <circle cx="41" cy="36" r="3" fill="#45101F" />
          <circle cx="24" cy="35" r="1" fill="#fff" />
          <circle cx="42" cy="35" r="1" fill="#fff" />
        </>
      )}
      <path d="M29 41 q3 3 6 0" stroke="#45101F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="42" rx="4" ry="2.5" fill="#F6A0B4" />
      <ellipse cx="48" cy="42" rx="4" ry="2.5" fill="#F6A0B4" />
    </svg>
  );
}

export function StarBuddy({ className = 'w-14 h-14', style }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <path d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23Z" fill="#F5CD6E" stroke="#C8901A" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="26" cy="31" r="2.5" fill="#45101F" />
      <circle cx="38" cy="31" r="2.5" fill="#45101F" />
      <path d="M28 37 q4 4 8 0" stroke="#45101F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="21" cy="36" rx="3" ry="2" fill="#F6A0B4" />
      <ellipse cx="43" cy="36" rx="3" ry="2" fill="#F6A0B4" />
    </svg>
  );
}

/** A little bear (Baozers' mascot). */
export function Bear({ className = 'w-16 h-16', style }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <circle cx="16" cy="16" r="9" fill="#D9A47C" stroke="#7A4A2E" strokeWidth="2" />
      <circle cx="48" cy="16" r="9" fill="#D9A47C" stroke="#7A4A2E" strokeWidth="2" />
      <circle cx="16" cy="16" r="4.5" fill="#F6B3C4" />
      <circle cx="48" cy="16" r="4.5" fill="#F6B3C4" />
      <circle cx="32" cy="36" r="24" fill="#E8B892" stroke="#7A4A2E" strokeWidth="2" />
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="#FBE3CE" />
      <circle cx="23" cy="33" r="3" fill="#45101F" />
      <circle cx="41" cy="33" r="3" fill="#45101F" />
      <ellipse cx="32" cy="40" rx="3.5" ry="2.5" fill="#45101F" />
      <path d="M28 46 q4 3 8 0" stroke="#45101F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="42" rx="4" ry="2.5" fill="#F6A0B4" />
      <ellipse cx="49" cy="42" rx="4" ry="2.5" fill="#F6A0B4" />
      <path d="M48 9 s-5 -3 -6.5 -6 c-1.3 -3 2.5 -5.5 6.5 -2 c4 -3.5 7.8 -1 6.5 2 c-1.5 3 -6.5 6 -6.5 6z" fill="#E2688A" stroke="#7A1F3D" strokeWidth="1.2" />
    </svg>
  );
}

/** A shouty cartoon chef for Hell's Kitchen. */
export function Chef({ className = 'w-24 h-24', mood = 'neutral' }: Props & { mood?: 'neutral' | 'angry' | 'happy' }) {
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      {/* toque */}
      <path d="M26 42 C14 40 12 22 26 20 C28 8 44 4 52 12 C60 4 78 8 76 22 C90 22 88 42 74 42 Z" fill="#FFFDF8" stroke="#C8B6B0" strokeWidth="2.5" />
      <rect x="27" y="38" width="46" height="12" rx="3" fill="#FFFDF8" stroke="#C8B6B0" strokeWidth="2.5" />
      {/* face */}
      <ellipse cx="50" cy="70" rx="28" ry="30" fill={mood === 'angry' ? '#F4B39C' : '#F6D2B8'} stroke="#C8956E" strokeWidth="2.5" />
      {/* brows */}
      {mood === 'angry' ? (
        <path d="M30 56 L44 62 M70 56 L56 62" stroke="#6B4A2E" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M32 58 Q38 54 44 58 M56 58 Q62 54 68 58" stroke="#6B4A2E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
      {/* eyes */}
      <circle cx="39" cy="66" r="3.2" fill="#2E1A16" />
      <circle cx="61" cy="66" r="3.2" fill="#2E1A16" />
      {/* mouth */}
      {mood === 'angry' ? (
        <ellipse cx="50" cy="86" rx="9" ry="7" fill="#7A1F3D" stroke="#45101F" strokeWidth="2" />
      ) : mood === 'happy' ? (
        <path d="M38 82 Q50 94 62 82" stroke="#45101F" strokeWidth="3" fill="#fff" strokeLinecap="round" />
      ) : (
        <path d="M42 86 L58 86" stroke="#45101F" strokeWidth="3" strokeLinecap="round" />
      )}
      <ellipse cx="30" cy="78" rx="5" ry="3" fill="#EF8FA8" opacity=".7" />
      <ellipse cx="70" cy="78" rx="5" ry="3" fill="#EF8FA8" opacity=".7" />
      {mood === 'angry' && <path d="M80 44 l6 -6 M84 52 l8 -2 M78 36 l2 -8" stroke="#E2572B" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}

/** A slightly smug pigeon. */
export function Pigeon({ className = 'w-16 h-16', flap = false }: Props & { flap?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M8 40 C8 28 20 22 34 24 C46 26 54 34 52 44 C44 50 18 52 8 40Z" fill="#9AA0AE" stroke="#4A4F5C" strokeWidth="2" />
      <path
        d={flap ? 'M22 30 C20 12 34 6 40 10 C38 20 34 28 28 34Z' : 'M20 34 C26 26 40 26 46 34 C38 40 28 40 20 34Z'}
        fill="#7D8392"
        stroke="#4A4F5C"
        strokeWidth="2"
      />
      <circle cx="48" cy="22" r="10" fill="#9AA0AE" stroke="#4A4F5C" strokeWidth="2" />
      <path d="M40 28 C44 32 52 32 56 28" stroke="#6FBF9A" strokeWidth="3" fill="none" />
      <path d="M57 21 L63 23 L57 25Z" fill="#E9B44C" stroke="#8C5A0A" strokeWidth="1" />
      <circle cx="50" cy="19" r="2.6" fill="#E2572B" />
      <circle cx="50" cy="19" r="1.2" fill="#1E1A1C" />
      <path d="M8 40 L1 36 L4 44Z" fill="#7D8392" stroke="#4A4F5C" strokeWidth="1.5" />
      <path d="M28 49 L26 58 M36 49 L36 58" stroke="#E2688A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
