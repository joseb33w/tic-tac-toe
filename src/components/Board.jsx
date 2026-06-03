import Square from './Square.jsx';

export default function Board({ board, onPlay, disabled, winningLine }) {
  const wins = winningLine || [];
  return (
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
  );
}
