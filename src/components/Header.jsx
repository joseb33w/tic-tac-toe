import { useEffect, useRef, useState } from 'react';
import { isMuted, toggleMute, onMuteChange, playSound } from '../lib/sound.js';

export default function Header({ profile, isGuest, guestPoints, onSignOut }) {
  const points = isGuest ? guestPoints : profile?.points ?? 0;
  const name = isGuest ? 'Guest' : profile?.username || 'Player';
  const initial = name.charAt(0).toUpperCase();

  const [muted, setMuted] = useState(isMuted());
  const [bump, setBump] = useState(false);
  const prevPoints = useRef(points);

  useEffect(() => onMuteChange(setMuted), []);

  useEffect(() => {
    if (points > prevPoints.current) {
      setBump(true);
      const id = setTimeout(() => setBump(false), 520);
      prevPoints.current = points;
      return () => clearTimeout(id);
    }
    prevPoints.current = points;
  }, [points]);

  const handleMute = () => {
    const nowMuted = toggleMute();
    if (!nowMuted) playSound('nav');
  };

  return (
    <header className="header">
      <div className="brand">
        <span className="marks">
          <span className="x">X</span>
          <span className="o">O</span>
        </span>
        <span>Arcade</span>
      </div>
      <div className="header-right">
        <button
          className="icon-btn"
          onClick={handleMute}
          aria-pressed={!muted}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <span className={`points-pill${bump ? ' bump' : ''}`} title="Your points">
          ⭐ {points}
        </span>
        {isGuest ? (
          <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
            Sign in
          </button>
        ) : (
          <>
            <div className="avatar" title={name}>
              {initial}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
