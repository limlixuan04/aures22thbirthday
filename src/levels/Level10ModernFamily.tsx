/**
 * 🚧 UNFINISHED — Level 10 (Modern Family) is waiting on a game choice and a photo.
 * Until then this placeholder is shown. The skip button only exists in dev mode.
 */
import { DEV_TOOLS } from '../lib/devmode';
import type { LevelProps } from '.';

export default function Level10ModernFamily({ onComplete }: LevelProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-6xl">🚧📸</span>
      <p className="font-sport text-3xl tracking-wide text-berry-600">Level 10 is still being built</p>
      <p className="max-w-md text-berry-500">The Modern Family level is coming soon.</p>
      {DEV_TOOLS && (
        <button type="button" className="btn-soft mt-2" onClick={onComplete} data-testid="dev-skip-level">
          🛠 Skip for testing (dev preview only)
        </button>
      )}
    </div>
  );
}
