export type LetterState = 'correct' | 'present' | 'absent';

/** Standard Wordle scoring with correct handling of repeated letters. */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  const result: LetterState[] = Array(a.length).fill('absent');
  const remaining: Record<string, number> = {};
  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) result[i] = 'correct';
    else remaining[a[i]] = (remaining[a[i]] ?? 0) + 1;
  }
  for (let i = 0; i < a.length; i++) {
    if (result[i] === 'correct') continue;
    const ch = g[i];
    if (remaining[ch]) {
      result[i] = 'present';
      remaining[ch]--;
    }
  }
  return result;
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best-known state per letter, for colouring the keyboard. */
export function keyboardStates(guesses: string[], answer: string): Record<string, LetterState> {
  const out: Record<string, LetterState> = {};
  for (const guess of guesses) {
    scoreGuess(guess, answer).forEach((st, i) => {
      const ch = guess[i].toUpperCase();
      if (!out[ch] || RANK[st] > RANK[out[ch]]) out[ch] = st;
    });
  }
  return out;
}

/** Strip spaces/punctuation; returns uppercase letters only. */
export function normaliseGuess(input: string): string {
  return input.toUpperCase().replace(/[^A-Z]/g, '');
}

export function isValidGuess(guess: string, length: number): boolean {
  return new RegExp(`^[A-Z]{${length}}$`).test(guess);
}
