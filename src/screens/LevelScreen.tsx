import { useCallback, useEffect, useState } from 'react';
import { useChoices, levelTextFor } from '../lib/choices';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { LevelShell } from '../components/LevelShell';
import { LEVEL_COMPONENTS } from '../levels';

export function LevelScreen({ level }: { level: number }) {
  const { canAccess, isCompleted, completeLevel } = useProgress();
  const choices = useChoices();
  const [done, setDone] = useState(false);
  const allowed = canAccess(level);
  const alreadyBeaten = isCompleted(level);

  useEffect(() => {
    if (!allowed) navigate({ name: 'map' });
  }, [allowed]);

  const onComplete = useCallback(() => {
    setDone(true);
    completeLevel(level);
    sfx.success();
    burst();
  }, [completeLevel, level]);

  if (!allowed) return null;

  const Game = LEVEL_COMPONENTS[level];
  const text = levelTextFor(level, choices);
  return (
    <LevelShell
      level={level}
      text={text}
      done={done}
      alreadyBeaten={alreadyBeaten}
      onNext={() => {
        sfx.whoosh();
        navigate(level >= 11 ? { name: 'trophy' } : { name: 'level', level: level + 1 });
      }}
      onBack={() => {
        sfx.click();
        navigate(level === 1 ? { name: 'home' } : { name: 'level', level: level - 1 });
      }}
    >
      <Game key={choices.memoryCards} onComplete={onComplete} />
    </LevelShell>
  );
}
