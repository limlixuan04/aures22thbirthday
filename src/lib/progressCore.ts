/** Pure progress rules — kept separate from React so they can be unit-tested. */
export const TOTAL_LEVELS = 11;

export interface ProgressState {
  completed: number[];
}

export function canAccess(state: ProgressState, level: number, devMode = false): boolean {
  if (level < 1 || level > TOTAL_LEVELS) return false;
  if (devMode) return true;
  return level === 1 || state.completed.includes(level) || state.completed.includes(level - 1);
}

export function withCompleted(state: ProgressState, level: number): ProgressState {
  if (state.completed.includes(level)) return state;
  return { completed: [...state.completed, level].sort((a, b) => a - b) };
}

/** The furthest level he is allowed to play right now. */
export function nextLevel(state: ProgressState): number {
  for (let l = 1; l <= TOTAL_LEVELS; l++) if (!state.completed.includes(l)) return l;
  return TOTAL_LEVELS;
}
