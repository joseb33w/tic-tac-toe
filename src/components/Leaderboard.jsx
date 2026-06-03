import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Leaderboard({ isGuest, onSignInPrompt }) {
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (isGuest) {
      setLoading(false);
      return;
    }
    fetchLeaderboard(15)
      .then((data) => active && setRows(data || []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isGuest]);

  const medal = (i) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <div>
      <div className="section-head">
        <h2>🏆 Leaderboard</h2>
      </div>

      {!isGuest && profile && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="spread row">
            <strong>{profile.username}</strong>
            <span className="lb-pts">⭐ {profile.points}</span>
          </div>
          <div className="stats-grid">
            <div className="stat">
              <div className="num">{profile.wins}</div>
              <div className="lbl">Wins</div>
            </div>
            <div className="stat">
              <div className="num">{profile.draws}</div>
              <div className="lbl">Draws</div>
            </div>
            <div className="stat">
              <div className="num">{profile.losses}</div>
              <div className="lbl">Losses</div>
            </div>
          </div>
        </div>
      )}

      {isGuest ? (
        <div className="card empty">
          <span className="big-emoji">🔒</span>
          Sign in to climb the global rankings.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-accent btn-sm" onClick={onSignInPrompt}>
              Sign in
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="spinner" />
      ) : rows.length === 0 ? (
        <div className="card empty">
          <span className="big-emoji">📊</span>
          No ranked players yet. Be the first to score!
        </div>
      ) : (
        <div>
          {rows.map((r, i) => (
            <div className={`lb-row ${profile && r.username === profile.username ? 'me' : ''}`} key={`${r.username}-${i}`}>
              <span className="lb-rank">{medal(i)}</span>
              <span>{r.username}</span>
              <span className="lb-pts">⭐ {r.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
