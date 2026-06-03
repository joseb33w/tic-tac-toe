import { useEffect, useState } from 'react';
import { fetchPurchases } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Inventory({ isGuest, onNavigate, onSignInPrompt }) {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (isGuest || !profile) {
      setLoading(false);
      return;
    }
    fetchPurchases(profile.user_id)
      .then((rows) => active && setItems(rows))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isGuest, profile]);

  return (
    <div>
      <div className="section-head">
        <h2>🎁 Your Collection</h2>
      </div>

      {isGuest ? (
        <div className="card empty">
          <span className="big-emoji">🔒</span>
          Sign in to start collecting souvenirs.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-accent btn-sm" onClick={onSignInPrompt}>
              Sign in
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="spinner" />
      ) : items.length === 0 ? (
        <div className="card empty">
          <span className="big-emoji">📦</span>
          No souvenirs yet. Win games to earn points, then visit the store!
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('store')}>
              Open store
            </button>
          </div>
        </div>
      ) : (
        <div className="store-grid">
          {items.map((row) => (
            <div className="souvenir" key={row.id}>
              <div className="emoji">{row.souvenir_emoji}</div>
              <h3>{row.souvenir_name}</h3>
              <p>Acquired {new Date(row.created_at).toLocaleDateString()}</p>
              <div className="price-row">
                <span className="price-tag">⭐ {row.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
