import Square from './Square.jsx';

// Cell centres on a 0-100 grid (3x3 with gaps), used to draw the winning strike.
const CENTERS = [
  [16.5, 16.5], [50, 16.5], [83.5, 16.5],
  [16.5, 50], [50, 50], [83.5, 50],
  [16.5, 83.5], [50, 83.5], [83.5, 83.5]
];

export default function Board({ board, onPlay, disabled, winningLine }) {
  const wins = winningLine || [];
  const strike = wins.length === 3 ? [CENTERS[wins[0]], CENTERS[wins[2]]] : null;

  return (
    <div className="board-stage">
      <div className="board" role="grid" aria-label="Tic-tac-toe board">
        {board.map((value, i) => (
          <Square
            key={i}
            value={value}
            highlight={wins.includes(i)}
            disabled={disabled}
            onClick={() => onPlay(i)}
          />
        ))}
      </div>
      {strike && (
        <svg className="strike" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
          <line x1={strike[0][0]} y1={strike[0][1]} x2={strike[1][0]} y2={strike[1][1]} />
        </svg>
      )}
    </div>
  );
}
