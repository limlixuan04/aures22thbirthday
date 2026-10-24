/**
 * Original illustrated picnic scene for "Spot the Difference".
 * variant 'a' is the original, variant 'b' has five changes.
 * Hotspot coordinates for the changes live in content.ts (spotTheDifference).
 * ViewBox is 400 × 300 → a hotspot at x%, y% is (x*4, y*3) in here.
 */
export function PicnicScene({ variant }: { variant: 'a' | 'b' }) {
  const b = variant === 'b';
  return (
    <svg viewBox="0 0 400 300" className="block h-full w-full" role="img" aria-label={`Picnic picture ${variant === 'a' ? 'one' : 'two'}`}>
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CDEBFA" />
          <stop offset="1" stopColor="#FFF4E6" />
        </linearGradient>
        <pattern id={`check-${variant}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#FDE6EC" />
          <rect width="8" height="8" fill="#EF8FA8" />
          <rect x="8" y="8" width="8" height="8" fill="#EF8FA8" />
        </pattern>
      </defs>

      {/* sky */}
      <rect width="400" height="300" fill={`url(#sky-${variant})`} />

      {/* sun (diff 1: sunglasses) */}
      <g transform="translate(340 48)">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1="0" y1="-32" x2="0" y2="-42" stroke="#F5CD6E" strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 36})`} />
        ))}
        <circle r="26" fill="#F5CD6E" stroke="#E9B44C" strokeWidth="3" />
        {b ? (
          <g>
            <rect x="-19" y="-9" width="16" height="11" rx="4" fill="#45101F" />
            <rect x="3" y="-9" width="16" height="11" rx="4" fill="#45101F" />
            <line x1="-3" y1="-5" x2="3" y2="-5" stroke="#45101F" strokeWidth="3" />
            <rect x="-16" y="-7" width="5" height="3" rx="1" fill="#fff" opacity=".6" />
          </g>
        ) : (
          <g fill="#45101F">
            <circle cx="-9" cy="-4" r="3" />
            <circle cx="9" cy="-4" r="3" />
          </g>
        )}
        <path d="M-9 8 q9 8 18 0" stroke="#45101F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="-16" cy="6" rx="4" ry="2.5" fill="#EF8FA8" />
        <ellipse cx="16" cy="6" rx="4" ry="2.5" fill="#EF8FA8" />
      </g>

      {/* cloud (diff 3: heart-shaped cloud) */}
      <g transform="translate(196 42)">
        {b ? (
          <path d="M0 26 C-30 8 -38 -6 -28 -16 C-20 -24 -8 -20 0 -10 C8 -20 20 -24 28 -16 C38 -6 30 8 0 26Z" fill="#fff" stroke="#E6EEF3" strokeWidth="3" />
        ) : (
          <g fill="#fff" stroke="#E6EEF3" strokeWidth="3">
            <ellipse cx="0" cy="4" rx="36" ry="16" />
            <circle cx="-14" cy="-4" r="14" />
            <circle cx="8" cy="-10" r="17" />
          </g>
        )}
      </g>
      {/* small cloud (same in both) */}
      <g transform="translate(286 102)" fill="#fff" opacity=".9">
        <ellipse cx="0" cy="0" rx="22" ry="9" />
        <circle cx="-6" cy="-6" r="9" />
        <circle cx="8" cy="-5" r="8" />
      </g>

      {/* hills */}
      <path d="M0 180 C60 150 120 160 200 172 C270 182 330 150 400 165 L400 300 L0 300Z" fill="#A9D2A6" />
      <path d="M0 210 C80 190 160 200 240 205 C300 210 360 195 400 200 L400 300 L0 300Z" fill="#8FC48E" />

      {/* tree (same in both) */}
      <g>
        <rect x="350" y="120" width="14" height="70" rx="5" fill="#B07A54" />
        <circle cx="357" cy="110" r="30" fill="#7FB685" />
        <circle cx="336" cy="128" r="20" fill="#7FB685" />
        <circle cx="378" cy="126" r="20" fill="#7FB685" />
        <circle cx="345" cy="104" r="5" fill="#E2688A" />
        <circle cx="368" cy="118" r="5" fill="#E2688A" />
        <circle cx="352" cy="132" r="5" fill="#E2688A" />
      </g>

      {/* balloon (diff 2: colour) + basket */}
      <path d="M64 92 C70 120 52 150 60 200" stroke="#7A1F3D" strokeWidth="1.5" fill="none" />
      <g transform="translate(64 63)">
        <ellipse rx="22" ry="27" fill={b ? '#7EC8E3' : '#E2688A'} stroke={b ? '#3C8FB0' : '#7A1F3D'} strokeWidth="2.5" />
        <ellipse cx="-8" cy="-10" rx="5" ry="8" fill="#fff" opacity=".5" />
        <path d="M-4 27 L4 27 L0 32Z" fill={b ? '#3C8FB0' : '#7A1F3D'} />
      </g>
      <g transform="translate(42 196)">
        <path d="M0 0 L40 0 L34 26 L6 26Z" fill="#D9A47C" stroke="#7A4A2E" strokeWidth="2" />
        <path d="M6 0 C10 -18 30 -18 34 0" stroke="#7A4A2E" strokeWidth="3" fill="none" />
        <path d="M4 9 L36 9 M5 17 L35 17" stroke="#7A4A2E" strokeWidth="1.5" />
      </g>

      {/* pond (diff 4: duck missing) */}
      <ellipse cx="90" cy="262" rx="74" ry="24" fill="#9FD3EC" stroke="#7FBEDC" strokeWidth="3" />
      <path d="M50 262 q10 -4 20 0 M110 270 q10 -4 20 0" stroke="#fff" strokeWidth="2" fill="none" opacity=".7" />
      {!b && (
        <g transform="translate(66 230) scale(0.6)">
          <path d="M10 38 C10 26 22 24 30 30 C34 22 54 22 54 38 C54 52 42 56 32 56 C18 56 10 50 10 38Z" fill="#FFD84D" stroke="#C8901A" strokeWidth="3" />
          <circle cx="22" cy="24" r="13" fill="#FFD84D" stroke="#C8901A" strokeWidth="3" />
          <path d="M8 26 C2 26 2 30 8 31 L14 30 Z" fill="#FF9A3C" />
          <circle cx="19" cy="21" r="2.6" fill="#45101F" />
        </g>
      )}

      {/* blanket */}
      <path d="M128 212 L300 206 L318 262 L114 270Z" fill={`url(#check-${variant})`} stroke="#E2688A" strokeWidth="2" />

      {/* Aure (diff 5: party hat) */}
      <g>
        <path d="M138 218 C138 192 150 184 162 184 C174 184 186 192 186 218Z" fill="#7A1F3D" />
        <circle cx="162" cy="168" r="19" fill="#F6D2B8" stroke="#C8956E" strokeWidth="2" />
        <path d="M143 166 C142 148 182 146 181 166 C176 156 160 154 150 160 Z" fill="#2E1A16" />
        <circle cx="155" cy="170" r="2.4" fill="#2E1A16" />
        <circle cx="169" cy="170" r="2.4" fill="#2E1A16" />
        <path d="M156 178 q6 5 12 0" stroke="#2E1A16" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="150" cy="177" rx="3.5" ry="2" fill="#EF8FA8" />
        <ellipse cx="174" cy="177" rx="3.5" ry="2" fill="#EF8FA8" />
        {!b && (
          <g>
            <path d="M148 152 L176 152 L163 120Z" fill="#F5CD6E" stroke="#C8901A" strokeWidth="2" strokeLinejoin="round" />
            <path d="M152 143 L172 143 M156 133 L169 133" stroke="#E2688A" strokeWidth="3" />
            <circle cx="163" cy="119" r="4.5" fill="#E2688A" />
          </g>
        )}
      </g>

      {/* Baozers */}
      <g>
        <path d="M216 186 C214 164 220 146 240 146 C260 146 266 164 264 192 Z" fill="#4A2C22" />
        <path d="M216 218 C216 194 228 186 240 186 C252 186 264 194 264 218Z" fill="#F6B3C4" />
        <circle cx="240" cy="168" r="19" fill="#F6D2B8" stroke="#C8956E" strokeWidth="2" />
        <path d="M221 166 C220 146 260 146 259 166 C254 154 236 152 224 162Z" fill="#4A2C22" />
        <circle cx="233" cy="170" r="2.4" fill="#2E1A16" />
        <circle cx="247" cy="170" r="2.4" fill="#2E1A16" />
        <path d="M234 178 q6 5 12 0" stroke="#2E1A16" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="228" cy="177" rx="3.5" ry="2" fill="#EF8FA8" />
        <ellipse cx="252" cy="177" rx="3.5" ry="2" fill="#EF8FA8" />
        <g transform="translate(252 148) scale(0.45)">
          <path d="M32 20 C20 2 4 4 6 18 C8 32 22 30 32 20Z M32 20 C44 2 60 4 58 18 C56 32 42 30 32 20Z" fill="#E2688A" stroke="#7A1F3D" strokeWidth="3" />
          <circle cx="32" cy="20" r="6" fill="#E2688A" stroke="#7A1F3D" strokeWidth="3" />
        </g>
      </g>

      {/* little heart between them (same in both) */}
      <path d="M201 160 s-8 -5 -10 -10 c-2 -5 4 -9 10 -3 c6 -6 12 -2 10 3 c-2 5 -10 10 -10 10z" fill="#E2688A" />

      {/* cake (same in both) */}
      <g transform="translate(200 232)">
        <ellipse cx="0" cy="14" rx="26" ry="6" fill="#fff" stroke="#E6D7CF" strokeWidth="2" />
        <rect x="-20" y="-6" width="40" height="20" rx="4" fill="#FAD0DB" stroke="#C25B7A" strokeWidth="2" />
        <path d="M-20 -2 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0" fill="#fff" />
        <rect x="-2" y="-18" width="4" height="12" fill="#7EC8E3" />
        <path d="M0 -26 C4 -22 3 -19 0 -18 C-3 -19 -4 -22 0 -26Z" fill="#F5CD6E" />
      </g>

      {/* flowers (same in both) */}
      {[300, 326, 352, 378].map((x, i) => (
        <g key={x} transform={`translate(${x} ${278 - (i % 2) * 8})`}>
          <line x1="0" y1="0" x2="0" y2="16" stroke="#5E9A66" strokeWidth="2.5" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="0" cy="-6" r="4.5" fill={i % 2 ? '#FFF6EA' : '#F6B3C4'} transform={`rotate(${a})`} />
          ))}
          <circle r="3.5" fill="#F5CD6E" />
        </g>
      ))}
    </svg>
  );
}
