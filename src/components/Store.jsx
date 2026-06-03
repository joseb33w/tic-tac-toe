import { useEffect, useState } from 'react';
import { SOUVENIRS } from '../lib/store.js';
import { buySouvenir, fetchPurchases } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from './Modal.jsx';

export default function Store({ isGuest, onSignInPrompt }) {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [owned, setOwned] = useState(new Set());
  const [buying, setBuying] = useState(null);
  const [justBought, setJustBought] = useState(null);

  useEffect(() => {
    let active = true;
    if (isGuest || !profile) return;
    fetchPurchases(profile.user_id)
      .then((rows) => active && setOwned(new Set(rows.map((r) => r.souvenir_id))))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isGuest, profile]);

  const points = profile?.points ?? 0;

  const handleBuy = async (item) => {
    if (isGuest) {
      onSignInPrompt();
      return;
    }
    setBuying(item.id);
    try {
      const updated = await buySouvenir(item.id);
      if (updated) {
        setOwned((prev) => new Set(prev).add(item.id));
        setJustBought(item);
        await refreshProfile();
      }
    } catch (err) {
      const msg = /insufficient/i.test(err.message)
        ? 'Not enough points yet — win a few more games!'
        : /already/i.test(err.message)
          ? 'You already own this souvenir.'
          : 'Purchase failed. Please try again.';
      toast(msg, 'bad');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h2>🛍️ Souvenir Store</h2>
        {!isGuest && <span className="points-pill">⭐ {points}</span>}
      </div>

      {isGuest && (
        <div className="guest-banner">
          <span>Sign in to spend your points on collectibles.</span>
          <button className="btn btn-accent btn-sm" onClick={onSignInPrompt}>
            Sign in
          </button>
        </div>
      )}

      <div className="store-grid">
        {SOUVENIRS.map((item) => {
          const isOwned = owned.has(item.id);
          const affordable = points >= item.price;
          return (
            <div className="souvenir" key={item.id}>
              {isOwned && <span className="owned-badge">OWNED</span>}
              <div className="emoji">{item.emoji}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="price-row">
                <span className="price-tag">⭐ {item.price}</span>
                <button
                  className={`btn btn-sm ${isOwned ? 'btn-ghost' : 'btn-primary'}`}
                  disabled={isOwned || buying === item.id || (!isGuest && !affordable)}
                  onClick={() => handleBuy(item)}
                >
                  {isOwned
                    ? 'Owned'
                    : buying === item.id
                      ? 'Buying…'
                      : isGuest
                        ? 'Sign in'
                        : affordable
                          ? 'Buy'
                          : 'Need more'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {justBought && (
        <Modal onClose={() => setJustBought(null)}>
          <div className="big-emoji">{justBought.emoji}</div>
          <h2>Unlocked!</h2>
          <p className="muted">
            {justBought.name} is now in your collection.
          </p>
          <button className="btn btn-primary btn-block" onClick={() => setJustBought(null)} style={{ marginTop: 12 }}>
            Nice!
          </button>
        </Modal>
      )}
    </div>
  );
}
