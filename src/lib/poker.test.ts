import { describe, expect, it } from 'vitest';
import { compareHands, evaluate, fullDeck, parseCard } from './poker';
import { pokerGame } from '../content/content';

const hand = (s: string) => s.split(' ').map(parseCard);

describe('poker', () => {
  it('names every hand category', () => {
    expect(evaluate(hand('AS KS QS JS TS')).name).toBe('Royal Flush');
    expect(evaluate(hand('9H 8H 7H 6H 5H')).name).toBe('Straight Flush');
    expect(evaluate(hand('7S 7H 7D 7C 2S')).name).toBe('Four Sevens');
    expect(evaluate(hand('KS KH KD 4C 4S')).name).toBe('Full House (Kings over Fours)');
    expect(evaluate(hand('2D 7D 9D JD KD')).name).toBe('Flush');
    expect(evaluate(hand('AS 2H 3D 4C 5S')).name).toBe('Straight (Five high)');
    expect(evaluate(hand('QS QH QD 4C 2S')).name).toBe('Three Queens');
    expect(evaluate(hand('KS KH 4D 4C 2S')).name).toBe('Two Pair (Kings & Fours)');
    expect(evaluate(hand('7S 7H KD 9C 2S')).name).toBe('Pair of Sevens');
    expect(evaluate(hand('AS 9H 7D 4C 2S')).name).toBe('Ace High');
  });
  it('compares hands correctly, including kickers and ties', () => {
    expect(compareHands(hand('8S 8H 3D 4C 2S'), hand('7S 7H KD 9C 2D'))).toBeGreaterThan(0);
    expect(compareHands(hand('7D 7C AD 9H 3S'), hand('7S 7H KD 9C 2D'))).toBeGreaterThan(0); // kicker
    expect(compareHands(hand('AS 2H 3D 4C 5S'), hand('6S 2D 3H 4S 5D'))).toBeLessThan(0); // wheel is lowest straight
    expect(compareHands(hand('7D 7C KH 9H 2C'), hand('7S 7H KD 9C 2D'))).toBe(0);
  });
  it("content: Baozers' hand is 5 valid, distinct cards", () => {
    const cards = pokerGame.baozersHand.map(parseCard);
    expect(cards).toHaveLength(5);
    expect(new Set(pokerGame.baozersHand.map((c) => c.toUpperCase())).size).toBe(5);
    expect(fullDeck()).toHaveLength(52);
  });
});
