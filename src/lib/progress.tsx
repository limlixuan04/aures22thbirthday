import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { load, save, remove } from './storage';
import { DEV_TOOLS } from './devmode';
import { canAccess as canAccessCore, nextLevel, withCompleted, type ProgressState } from './progressCore';

interface ProgressApi {
  unlocked: boolean;
  unlock: () => void;
  completed: number[];
  isCompleted: (level: number) => boolean;
  canAccess: (level: number) => boolean;
  completeLevel: (level: number) => void;
  nextLevel: number;
  /** Dev helpers */
  resetAll: () => void;
  setCompleted: (levels: number[]) => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() => load('unlocked', false));
  const [state, setState] = useState<ProgressState>(() => {
    const s = load<ProgressState>('progress', { completed: [] });
    return Array.isArray(s?.completed) ? s : { completed: [] };
  });

  const persist = useCallback((next: ProgressState) => {
    save('progress', next);
    setState(next);
  }, []);

  const api = useMemo<ProgressApi>(
    () => ({
      unlocked,
      unlock: () => {
        save('unlocked', true);
        setUnlocked(true);
      },
      completed: state.completed,
      isCompleted: (l) => state.completed.includes(l),
      canAccess: (l) => canAccessCore(state, l, DEV_TOOLS),
      completeLevel: (l) => {
        setState((prev) => {
          const next = withCompleted(prev, l);
          save('progress', next);
          return next;
        });
      },
      nextLevel: nextLevel(state),
      resetAll: () => {
        remove('progress');
        remove('unlocked');
        remove('wordle');
        setUnlocked(false);
        setState({ completed: [] });
      },
      setCompleted: (levels) => persist({ completed: [...levels].sort((a, b) => a - b) }),
    }),
    [unlocked, state, persist],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress outside provider');
  return v;
}
