/** Five-card poker hand evaluation for Level 6. Pure functions. */
export type Suit = 'S' | 'H' | 'D' | 'C';
export interface Card {
  rank: number; // 2–14 (11 J, 12 Q, 13 K, 14 A)
  suit: Suit;
}

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const isRed = (s: Suit) => s === 'H' || s === 'D';

export function rankLabel(rank: number): string {
  return ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' } as Record<number, string>)[rank] ?? String(rank);
}

const RANK_NAMES: Record<number, [string, string]> = {
  2: ['Two', 'Twos'], 3: ['Three', 'Threes'], 4: ['Four', 'Fours'], 5: ['Five', 'Fives'], 6: ['Six', 'Sixes'],
  7: ['Seven', 'Sevens'], 8: ['Eight', 'Eights'], 9: ['Nine', 'Nines'], 10: ['Ten', 'Tens'],
  11: ['Jack', 'Jacks'], 12: ['Queen', 'Queens'], 13: ['King', 'Kings'], 14: ['Ace', 'Aces'],
};

/** Parse "7H", "TS", "10D", "AC". */
export function parseCard(code: string): Card {
  const m = code.toUpperCase().match(/^(10|[2-9TJQKA])([SHDC])$/);
  if (!m) throw new Error(`Bad card code: ${code}`);
  const r = m[1];
  const rank = r === 'T' || r === '10' ? 10 : r === 'J' ? 11 : r === 'Q' ? 12 : r === 'K' ? 13 : r === 'A' ? 14 : Number(r);
  return { rank, suit: m[2] as Suit };
}

export const sameCard = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit;

export function fullDeck(): Card[] {
  return SUITS.flatMap((suit) => Array.from({ length: 13 }, (_, i) => ({ rank: i + 2, suit })));
}

export interface HandValue {
  category: number; // 0 high card … 8 straight flush
  tiebreak: number[];
  name: string;
}

export function evaluate(cards: Card[]): HandValue {
  if (cards.length !== 5) throw new Error('A poker hand needs 5 cards');
  const counts = new Map<number, number>();
  cards.forEach((c) => counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const ranks = groups.map(([r]) => r);
  const flush = cards.every((c) => c.suit === cards[0].suit);
  const distinct = [...counts.keys()].sort((a, b) => b - a);
  let straightHigh = 0;
  if (distinct.length === 5) {
    if (distinct[0] - distinct[4] === 4) straightHigh = distinct[0];
    else if (distinct.join() === '14,5,4,3,2') straightHigh = 5; // A-2-3-4-5
  }
  const [c1, c2] = [groups[0][1], groups[1]?.[1]];
  const one = (r: number) => RANK_NAMES[r][0];
  const many = (r: number) => RANK_NAMES[r][1];

  if (straightHigh && flush)
    return { category: 8, tiebreak: [straightHigh], name: straightHigh === 14 ? 'Royal Flush' : 'Straight Flush' };
  if (c1 === 4) return { category: 7, tiebreak: ranks, name: `Four ${many(ranks[0])}` };
  if (c1 === 3 && c2 === 2) return { category: 6, tiebreak: ranks, name: `Full House (${many(ranks[0])} over ${many(ranks[1])})` };
  if (flush) return { category: 5, tiebreak: distinct, name: 'Flush' };
  if (straightHigh) return { category: 4, tiebreak: [straightHigh], name: `Straight (${one(straightHigh)} high)` };
  if (c1 === 3) return { category: 3, tiebreak: ranks, name: `Three ${many(ranks[0])}` };
  if (c1 === 2 && c2 === 2) return { category: 2, tiebreak: ranks, name: `Two Pair (${many(ranks[0])} & ${many(ranks[1])})` };
  if (c1 === 2) return { category: 1, tiebreak: ranks, name: `Pair of ${many(ranks[0])}` };
  return { category: 0, tiebreak: distinct, name: `${one(distinct[0])} High` };
}

/** > 0 if a beats b, < 0 if b wins, 0 for a tie. */
export function compareHands(a: Card[], b: Card[]): number {
  const ea = evaluate(a);
  const eb = evaluate(b);
  if (ea.category !== eb.category) return ea.category - eb.category;
  for (let i = 0; i < Math.max(ea.tiebreak.length, eb.tiebreak.length); i++) {
    const d = (ea.tiebreak[i] ?? 0) - (eb.tiebreak[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
