import { useEffect, useRef, useState } from 'react';
import Board from './Board.jsx';
import Modal from './Modal.jsx';
import { calculateWinner } from '../lib/game.js';
import { fetchGame, makeOnlineMove, subscribeToGame } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { playSound } from '../lib/sound.js';
import { burstConfetti } from '../lib/confetti.js';

export default function GameOnline({ game: initialGame, onExit }) {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const [game, setGame] = useState(initialGame);
  const [sending, setSending] = useState(false);
  const settledRef = useRef(false);

  const myMark = user && game.player_x === user.id ? 'X' : 'O';
  const opponentName = myMark === 'X' ? game.player_o_name : game.player_x_name;
  const board = game.board || Array(9).fill(null);
  const { line } = calculateWinner(board);

  useEffect(() => {
    const unsub = subscribeToGame(game.id, (next) => setGame(next));
    fetchGame(game.id).then(setGame).catch(() => {});
    return unsub;
  }, [game.id]);

  useEffect(() => {
    if (game.status === 'finished' && !settledRef.current) {
      settledRef.current = true;
      if (game.winner === 'draw') {
        playSound('draw');
      } else if (game.winner === myMark) {
        playSound('win');
        burstConfetti();
      } else {
        playSound('lose');
      }
      refreshProfile();
    }
  }, [game.status, game.winner, myMark, refreshProfile]);

  const myTurn = game.status === 'active' && game.current_turn === myMark;

  const play = async (i) => {
    if (!myTurn || sending || board[i]) return;
    setSending(true);
    try {
      const updated = await makeOnlineMove(game.id, i);
      playSound(myMark === 'X' ? 'place' : 'placeO');
      setGame(updated);
    } catch (err) {
      toast(/turn/i.test(err.message) ? "It's not your turn yet." : 'Move failed.', 'bad');
    } finally {
      setSending(false);
    }
  };

  let statusText;
  if (game.status === 'waiting') statusText = 'Waiting for an opponent to join…';
  else if (game.status === 'finished') {
    statusText =
      game.winner === 'draw' ? "It's a draw" : game.winner === myMark ? 'You win! 🎉' : 'You lost';
  } else statusText = myTurn ? 'Your move' : `${opponentName || 'Opponent'} is thinking…`;

  const finishedReward =
    game.status === 'finished'
      ? game.winner === 'draw'
        ? 6
        : game.winner === myMark
          ? 25
          : 2
      : 0;

  return (
    <div>
      <div className="section-head">
        <button className="btn btn-ghost btn-sm" onClick={onExit}>
          ← Leave
        </button>
        <span className="chip">
          You are <strong className={myMark === 'X' ? 'x' : 'o'}>{myMark}</strong>
        </span>
      </div>

      <div className="card board-wrap">
        <div className="status-bar">
          {game.status === 'active' && (
            <span className={`turn-dot ${game.current_turn === 'X' ? 'x' : 'o'}`} />
          )}
          <span data-testid="status">{statusText}</span>
        </div>

        {game.status === 'waiting' ? (
          <div className="stack center">
            <div className="spinner" />
            <p className="muted">Share the arcade and wait — the match starts the moment someone joins.</p>
          </div>
        ) : (
          <>
            <Board
              board={board}
              onPlay={play}
              disabled={!myTurn || sending}
              winningLine={game.status === 'finished' ? line : null}
            />
            <div className="scoreline">
              <span className="chip x">{game.player_x_name} (X)</span>
              <span className="chip o">{game.player_o_name || '…'} (O)</span>
            </div>
          </>
        )}
      </div>

      {game.status === 'finished' && (
        <Modal onClose={onExit}>
          <div className="big-emoji">
            {game.winner === 'draw' ? '🤝' : game.winner === myMark ? '🏆' : '😤'}
          </div>
          <h2>{game.winner === 'draw' ? 'Draw' : game.winner === myMark ? 'You win!' : 'You lost'}</h2>
          <p className="muted">
            You earned <strong style={{ color: 'var(--warn)' }}>+{finishedReward} points</strong>.
          </p>
          <div className="stack" style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-block" onClick={onExit}>
              Back to lobby
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
