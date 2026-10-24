/**
 * Which version of a level to show. Comes from `gameChoices` in content.ts.
 * In dev mode (npm run dev / the preview) the 🛠 Dev panel can override it for comparing.
 */
import { useSyncExternalStore } from 'react';
import { gameChoices, levels, type LevelText } from '../content/content';
import { DEV_TOOLS } from './devmode';
import { load, save } from './storage';

export type Choices = typeof gameChoices;

let current: Choices = { ...gameChoices, ...(DEV_TOOLS ? load<Partial<Choices>>('dev-choices', {}) : {}) };
const listeners = new Set<() => void>();

export function setChoice<K extends keyof Choices>(key: K, value: Choices[K]) {
  current = { ...current, [key]: value };
  save('dev-choices', { ...current });
  listeners.forEach((l) => l());
}

export function useChoices(): Choices {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function levelTextFor(level: number, _choices: Choices): LevelText {
  return levels[level];
}
