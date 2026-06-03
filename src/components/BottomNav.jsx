import { playSound } from '../lib/sound.js';

const ITEMS = [
  { key: 'home', label: 'Play', ico: '🎮' },
  { key: 'online', label: 'Online', ico: '🌐' },
  { key: 'store', label: 'Store', ico: '🛍️' },
  { key: 'inventory', label: 'Collection', ico: '🎁' },
  { key: 'leaderboard', label: 'Ranks', ico: '🏆' }
];

export default function BottomNav({ view, onNavigate }) {
  const active = ['vs-computer'].includes(view) ? 'home' : ['online-game'].includes(view) ? 'online' : view;
  const go = (key) => {
    if (key !== active) playSound('nav');
    onNavigate(key);
  };
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.key}
          className={`nav-btn ${active === item.key ? 'active' : ''}`}
          onClick={() => go(item.key)}
        >
          <span className="ico">{item.ico}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
