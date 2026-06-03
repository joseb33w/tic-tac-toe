import { useCallback, useEffect, useRef, useState } from 'react';
import Board from './Board.jsx';
import Modal from './Modal.jsx';
import { calculateWinner, chooseAiMove, emptyBoard, gameResult } from '../lib/game.js';
import { vsComputerReward } from '../lib/points.js';
import { awardVsComputer } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const HUMAN = 'X';
const AI = 'O';
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' }
];

export default function GameVsComputer({ isGuest, onGuestPoints, onBack }) {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const [difficulty, setDifficulty] = useState('hard');
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState(HUMAN);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ win: 0, draw: 0, loss: 0 });
  const [awarded, setAwarded] = useState(0);
  const settledRef = useRef(false);

  const { winner, line } = calculateWinner(board);

  const settle = useCallback(
    async (outcome) => {
      if (settledRef.current) return;
      settledRef.current = true;
      const key = outcome === HUMAN ? 'win' : outcome === AI ? 'loss' : 'draw';
      setScore((s) => ({ ...s, [key]: s[key] + 1 }));
      const reward = vsComputerReward(key);
      setAwarded(reward);
      if (isGuest) {
        onGuestPoints(reward);
        return;
      }
      try {
        const updated = await awardVsComputer(key);
        if (updated) setProfile(updated);
      } catch {
        toast('Could not save points — check your connection.', 'bad');
      }
    },
    [isGuest, onGuestPoints, setProfile, toast]
  );

  useEffect(() => {
    const outcome = gameResult(board);
    if (outcome && !result) {
      setResult(outcome);
      settle(outcome);
    }
  }, [board, result, settle]);

  useEffect(() => {
    if (turn !== AI || result) return;
    const id = setTimeout(() => {
      setBoard((prev) => {
        if (gameResult(prev)) return prev;
        const move = chooseAiMove(prev, AI, HUMAN, difficulty);
        if (move == null) return prev;
        const next = prev.slice();
        next[move] = AI;
        return next;
      });
      setTurn(HUMAN);
    }, 420);
    return () => clearTimeout(id);
  }, [turn, result, difficulty]);

  const play = (i) => {
    if (board[i] || result || turn !== HUMAN) return;
    const next = board.slice();
    next[i] = HUMAN;
    setBoard(next);
    if (!gameResult(next)) setTurn(AI);
  };

  const reset = () => {
    settledRef.current = false;
    setBoard(emptyBoard());
    setTurn(HUMAN);
    setResult(null);
    setAwarded(0);
  };

  const statusText = result
    ? result === HUMAN
      ? 'You win! 🎉'
      : result === AI
        ? 'Computer wins'
        : "It's a draw"
    : turn === HUMAN
      ? 'Your move'
      : 'Computer is thinking…';

  return (
    <div>
      <div className="section-head">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div className="segmented">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              className={difficulty === d.key ? 'active' : ''}
              onClick={() => setDifficulty(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card board-wrap">
        <div className="status-bar">
          {!result && <span className={`turn-dot ${turn === HUMAN ? 'x' : 'o'}`} />}
          <span data-testid="status">{statusText}</span>
        </div>
        <Board board={board} onPlay={play} disabled={result || turn !== HUMAN} winningLine={line} />
        <div className="scoreline">
          <span className="chip x">You (X) · {score.win}W</span>
          <span className="chip">Draws · {score.draw}</span>
          <span className="chip o">CPU (O) · {score.loss}W</span>
        </div>
        <button className="btn btn-primary" onClick={reset} style={{ marginTop: 4 }}>
          New game
        </button>
      </div>

      {result && (
        <Modal onClose={reset}>
          <div className="big-emoji">{result === HUMAN ? '🏆' : result === AI ? '🤖' : '🤝'}</div>
          <h2>{result === HUMAN ? 'Victory!' : result === AI ? 'Defeated' : 'Draw'}</h2>
          {awarded > 0 ? (
            <p className="muted">
              You earned <strong style={{ color: 'var(--warn)' }}>+{awarded} points</strong>
              {isGuest ? ' this round.' : '.'}
            </p>
          ) : (
            <p className="muted">No points this round — try again!</p>
          )}
          {isGuest && (
            <div className="alert info" style={{ marginTop: 8 }}>
              Playing as a guest. Sign in to bank your points and shop the store.
            </div>
          )}
          <div className="stack" style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-block" onClick={reset}>
              Play again
            </button>
            <button className="btn btn-ghost btn-block" onClick={onBack}>
              Back to menu
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
