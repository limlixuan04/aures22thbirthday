import { setMuted, useMuted } from '../lib/sound';

export function MuteButton() {
  const muted = useMuted();
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off'}
      className="chip border-2 border-blush-300 bg-cream-50 py-1.5 text-base hover:bg-blush-100"
    >
      <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
      <span className="hidden sm:inline">{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  );
}
