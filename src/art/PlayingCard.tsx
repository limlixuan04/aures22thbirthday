import type { ReactNode } from 'react';
import { Heart } from './Decor';

/** Burgundy card back with a lattice pattern and a heart in the middle. */
export function CardBack({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[10%/7%] border-[3px] border-cream-50 bg-berry-600 shadow-card ${className}`}>
      <div
        className="absolute inset-[6%] rounded-[8%/6%] border-2 border-blush-300/70"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(246,179,196,0.28) 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, rgba(246,179,196,0.28) 0 2px, transparent 2px 12px)',
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid aspect-square w-[42%] place-items-center rounded-full border-2 border-blush-300 bg-berry-700">
          <Heart className="h-[60%] w-[60%]" color="#F6B3C4" />
        </div>
      </div>
    </div>
  );
}

interface FaceProps {
  /** Corner label, e.g. "A", "10", "K". */
  label: string;
  /** Suit symbol, e.g. "♥". */
  suit: string;
  red: boolean;
  /** What goes in the middle (big suit symbol by default). */
  children?: ReactNode;
  className?: string;
}

/** Playing-card face with rank/suit in two corners. */
export function CardFace({ label, suit, red, children, className = '' }: FaceProps) {
  const colour = red ? 'text-[#C2264B]' : 'text-[#2A1A20]';
  const corner = (
    <span className="flex flex-col items-center font-display font-bold leading-[0.95]">
      <span className="text-[1em]">{label}</span>
      <span className="text-[0.85em]">{suit}</span>
    </span>
  );
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[10%/7%] border-2 border-cocoa-300 bg-[#FFFDF8] shadow-card ${colour} ${className}`}>
      <div className="absolute left-[7%] top-[5%]">{corner}</div>
      <div className="absolute bottom-[5%] right-[7%] rotate-180">{corner}</div>
      <div className="absolute inset-[18%_12%] flex flex-col items-center justify-center">{children ?? <span className="text-[2.6em] leading-none">{suit}</span>}</div>
    </div>
  );
}
