import { useCallback, useEffect, useState } from 'react';
import { createOnlineGame, fetchOpenGames, joinOnlineGame, subscribeToLobby } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Lobby({ isGuest, onSignInPrompt, onEnterGame }) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const refresh = useCallback(() => {
    if (!user) return;
    fetchOpenGames(user.id)
      .then((rows) => setGames(rows || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (isGuest || !user) {
      setLoading(false);
      return;
    }
    refresh();
    const unsub = subscribeToLobby(refresh);
    return unsub;
  }, [isGuest, user, refresh]);

  const create = async () => {
    setWorking(true);
    try {
      const game = await createOnlineGame();
      onEnterGame(game);
    } catch {
      toast('Could not create a game. Check your connection.', 'bad');
    } finally {
      setWorking(false);
    }
  };

  const join = async (id) => {
    setWorking(true);
    try {
      const game = await joinOnlineGame(id);
      onEnterGame(game);
    } catch (err) {
      toast(/not found|active/i.test(err.message) ? 'That game is no longer open.' : 'Could not join.', 'bad');
      refresh();
    } finally {
      setWorking(false);
    }
  };

  if (isGuest) {
    return (
      <div>
        <div className="section-head">
          <h2>🌐 Play Online</h2>
        </div>
        <div className="card empty">
          <span className="big-emoji">🔒</span>
          Sign in to challenge real players and earn bonus points for online wins.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-accent btn-sm" onClick={onSignInPrompt}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <h2>🌐 Play Online</h2>
        <button className="btn btn-primary btn-sm" onClick={create} disabled={working}>
          + New match
        </button>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="spread row">
          <div>
            <strong>Host a match</strong>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Create a game and share the moment a rival joins.
            </p>
          </div>
          <button className="btn btn-accent" onClick={create} disabled={working}>
            Create
          </button>
        </div>
      </div>

      <h3 style={{ margin: '0 2px 10px', fontSize: '1.05rem' }}>Open games</h3>
      {loading ? (
        <div className="spinner" />
      ) : games.length === 0 ? (
        <div className="card empty">
          <span className="big-emoji">🫥</span>
          No open games right now. Create one and wait for a challenger!
        </div>
      ) : (
        games.map((g) => (
          <div className="game-row" key={g.id}>
            <span className="who">
              <span className="avatar">{(g.player_x_name || '?').charAt(0).toUpperCase()}</span>
              {g.player_x_name || 'Player'}
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => join(g.id)} disabled={working}>
              Join
            </button>
          </div>
        ))
      )}
      {profile && (
        <p className="muted center" style={{ marginTop: 14, fontSize: '0.82rem' }}>
          Online win +25 · draw +6 · loss +2 points
        </p>
      )}
    </div>
  );
}
