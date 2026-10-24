import type { ComponentType } from 'react';
import Level01Quiz from './Level01Quiz';
import Level02Sudoku from './Level02Sudoku';
import Level03Claw from './Level03Claw';
import Level04Memory from './Level04Memory';
import Level05Jigsaw from './Level05Jigsaw';
import Level06Whack from './Level06Whack';
import Level07Timeline from './Level07Timeline';
import Level08SpotDiff from './Level08SpotDiff';
import Level09Pool from './Level09Pool';
import Level10Cake from './Level10Cake';

export interface LevelProps {
  /** Call once when the level's goal is achieved. */
  onComplete: () => void;
}

export const LEVEL_COMPONENTS: Record<number, ComponentType<LevelProps>> = {
  1: Level01Quiz,
  2: Level02Sudoku,
  3: Level03Claw,
  4: Level04Memory,
  5: Level05Jigsaw,
  6: Level06Whack,
  7: Level07Timeline,
  8: Level08SpotDiff,
  9: Level09Pool,
  10: Level10Cake,
};
