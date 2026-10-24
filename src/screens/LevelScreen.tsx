import { useCallback, useEffect, useState } from 'react';
import { levels as levelText } from '../content/content';
import { useProgress } from '../lib/progress';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { LevelShell } from '../components/LevelShell';
import { LEVEL_COMPONENTS } from '../levels';
import Finale from '../levels/Level11Finale';

export function LevelScreen({ level }: { level: number }) {
  const { canAccess, isCompleted, completeLevel } = useProgress();
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

  if (level === 11) return <Finale onComplete={() => completeLevel(11)} />;

  const Game = LEVEL_COMPONENTS[level];
  const text = levelText[level];
  return (
    <LevelShell
      level={level}
      text={text}
      done={done}
      alreadyBeaten={alreadyBeaten}
      onNext={() => {
        sfx.whoosh();
        navigate({ name: 'level', level: level + 1 });
      }}
      onBack={() => {
        sfx.click();
        navigate(level === 1 ? { name: 'home' } : { name: 'level', level: level - 1 });
      }}
    >
      <Game onComplete={onComplete} />
    </LevelShell>
  );
}
