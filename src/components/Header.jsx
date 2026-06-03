export default function Header({ profile, isGuest, guestPoints, onSignOut }) {
  const points = isGuest ? guestPoints : profile?.points ?? 0;
  const name = isGuest ? 'Guest' : profile?.username || 'Player';
  const initial = name.charAt(0).toUpperCase();

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
        <span className="points-pill" title="Your points">
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
