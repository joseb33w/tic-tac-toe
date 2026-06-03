const FLOATERS = [
  { ch: 'X', cls: 'x', style: { left: '8%', top: '18%', animationDelay: '0s' } },
  { ch: 'O', cls: 'o', style: { left: '82%', top: '12%', animationDelay: '1.1s' } },
  { ch: 'X', cls: 'x', style: { left: '70%', top: '64%', animationDelay: '2.2s' } },
  { ch: 'O', cls: 'o', style: { left: '14%', top: '70%', animationDelay: '0.6s' } }
];

const MODES = [
  { view: 'vs-computer', emoji: '🤖', title: 'Vs Computer', body: 'Three difficulty levels, from breezy to unbeatable.' },
  { view: 'online', emoji: '🌐', title: 'Vs Players', bodyGuest: 'Sign in to match with real opponents.', body: 'Create or join a live match.' },
  { view: 'store', emoji: '🛍️', title: 'Souvenir Store', body: 'Spend points on collectible trophies and trinkets.' },
  { view: 'leaderboard', emoji: '🏆', title: 'Leaderboard', body: 'See who rules the arcade.' }
];

export default function Home({ isGuest, onNavigate }) {
  return (
    <div>
      <div className="card hero">
        <div className="hero-floaters" aria-hidden="true">
          {FLOATERS.map((f, i) => (
            <span key={i} className={`floater ${f.cls}`} style={f.style}>
              {f.ch}
            </span>
          ))}
        </div>
        <h1 className="hero-title">Ready to play?</h1>
        <p>Outsmart the computer or challenge real opponents online. Every win fills your points wallet.</p>
        <div className="mode-grid">
          {MODES.map((m, i) => (
            <button
              key={m.view}
              className="mode"
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => onNavigate(m.view)}
            >
              <div className="emoji">{m.emoji}</div>
              <h3>{m.title}</h3>
              <p>{isGuest && m.bodyGuest ? m.bodyGuest : m.body}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
