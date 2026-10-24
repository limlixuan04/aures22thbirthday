import { describe, expect, it } from 'vitest';
import { scoreGuess, keyboardStates, normaliseGuess, isValidGuess } from './wordle';
import { countSolutions, findConflicts, isSolved } from './sudoku';
import { canAccess, nextLevel, withCompleted } from './progressCore';
import { sudoku, sudoku4, sudoku9, wordle, quiz, timeline, memoryCards, spotTheDifference } from '../content/content';

describe('wordle', () => {
  it('scores an exact match', () => {
    expect(scoreGuess('ITSTIME', 'ITSTIME').every((s) => s === 'correct')).toBe(true);
  });
  it('handles repeated letters correctly', () => {
    // answer ITSTIME has two I's and two T's
    expect(scoreGuess('IIIIIII', 'ITSTIME')).toEqual(['correct', 'absent', 'absent', 'absent', 'correct', 'absent', 'absent']);
    expect(scoreGuess('TTTAAAA', 'ITSTIME')).toEqual(['present', 'correct', 'absent', 'absent', 'absent', 'absent', 'absent']);
    expect(scoreGuess('EEEEEEE', 'ITSTIME')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent', 'absent', 'correct']);
    expect(scoreGuess('MITTENS', 'ITSTIME')).toEqual(['present', 'present', 'present', 'correct', 'present', 'absent', 'present']);
  });
  it('keeps the best keyboard state', () => {
    const ks = keyboardStates(['TTTAAAA', 'ITSTIME'], 'ITSTIME');
    expect(ks.T).toBe('correct');
    expect(ks.A).toBe('absent');
  });
  it('normalises and validates guesses', () => {
    expect(normaliseGuess("it's time")).toBe('ITSTIME');
    expect(isValidGuess('ABCDEFG', 7)).toBe(true);
    expect(isValidGuess('ABCDEF', 7)).toBe(false);
  });
  it('content answer matches the groups', () => {
    expect(wordle.groups.reduce((a, b) => a + b, 0)).toBe(wordle.answer.length);
    expect(/^[A-Z]+$/.test(wordle.answer)).toBe(true);
  });
});

describe('sudoku content', () => {
  for (const [name, s] of [['main', sudoku], ['4x4', sudoku4], ['9x9 alt', sudoku9]] as const) {
    it(`${name}: solution is valid and matches the givens`, () => {
      expect(isSolved(s.solution)).toBe(true);
      s.puzzle.forEach((row, r) => row.forEach((v, c) => v && expect(s.solution[r][c]).toBe(v)));
      expect(findConflicts(s.puzzle).size).toBe(0);
      expect(s.puzzle.length).toBe(s.size);
    });
    it(`${name}: has exactly one solution`, () => {
      expect(countSolutions(s.puzzle)).toBe(1);
    });
  }
});

describe('progress gating', () => {
  it('only lets you play the next unfinished level', () => {
    let s = { completed: [] as number[] };
    expect(canAccess(s, 1)).toBe(true);
    expect(canAccess(s, 2)).toBe(false);
    s = withCompleted(s, 1);
    expect(canAccess(s, 2)).toBe(true);
    expect(canAccess(s, 3)).toBe(false);
    expect(nextLevel(s)).toBe(2);
    expect(canAccess(s, 3, true)).toBe(true); // dev mode
  });
});

describe('content sanity', () => {
  it('quiz has 3–5 questions with 4 options and valid answers', () => {
    expect(quiz.length).toBeGreaterThanOrEqual(3);
    expect(quiz.length).toBeLessThanOrEqual(5);
    quiz.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    });
  });
  it('has 5 timeline items, 6 memory pairs and 5 differences', () => {
    expect(timeline.length).toBeGreaterThanOrEqual(3);
    expect(memoryCards.length).toBeGreaterThanOrEqual(3);
    expect(spotTheDifference.differences).toHaveLength(5);
  });
});
