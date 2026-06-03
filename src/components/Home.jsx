export default function Home({ isGuest, onNavigate }) {
  return (
    <div>
      <div className="card hero">
        <h1>Ready to play?</h1>
        <p>Outsmart the computer or challenge real opponents online. Every win fills your points wallet.</p>
        <div className="mode-grid">
          <button className="mode" onClick={() => onNavigate('vs-computer')}>
            <div className="emoji">🤖</div>
            <h3>Vs Computer</h3>
            <p>Three difficulty levels, from breezy to unbeatable.</p>
          </button>
          <button className="mode" onClick={() => onNavigate('online')}>
            <div className="emoji">🌐</div>
            <h3>Vs Players</h3>
            <p>{isGuest ? 'Sign in to match with real opponents.' : 'Create or join a live match.'}</p>
          </button>
          <button className="mode" onClick={() => onNavigate('store')}>
            <div className="emoji">🛍️</div>
            <h3>Souvenir Store</h3>
            <p>Spend points on collectible trophies and trinkets.</p>
          </button>
          <button className="mode" onClick={() => onNavigate('leaderboard')}>
            <div className="emoji">🏆</div>
            <h3>Leaderboard</h3>
            <p>See who rules the arcade.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
