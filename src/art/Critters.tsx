/** Original cartoon critters used across the games. */
type Props = { className?: string; style?: React.CSSProperties };

export function Duck({ className = 'w-14 h-14', style, happy = false }: Props & { happy?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <ellipse cx="32" cy="58" rx="20" ry="3" fill="#7A1F3D" opacity=".12" />
      <path d="M10 38 C10 26 22 24 30 30 C34 22 54 22 54 38 C54 52 42 56 32 56 C18 56 10 50 10 38Z" fill="#FFD84D" stroke="#C8901A" strokeWidth="2" />
      <circle cx="22" cy="24" r="13" fill="#FFD84D" stroke="#C8901A" strokeWidth="2" />
      <path d="M8 26 C2 26 2 30 8 31 L14 30 Z" fill="#FF9A3C" stroke="#C86A1A" strokeWidth="1.5" />
      {happy ? (
        <path d="M17 21 q3 -3 6 0" stroke="#45101F" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="19" cy="21" r="2.4" fill="#45101F" />
      )}
      <circle cx="19.8" cy="20.2" r=".8" fill="#fff" />
      <ellipse cx="26" cy="28" rx="3" ry="2" fill="#F6A0B4" opacity=".8" />
      <path d="M34 38 C40 34 48 36 48 42 C44 44 38 44 34 38Z" fill="#FFC928" stroke="#C8901A" strokeWidth="1.5" />
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
