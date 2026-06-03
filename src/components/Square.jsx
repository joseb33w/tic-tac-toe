export default function Square({ value, onClick, disabled, highlight }) {
  const cls = ['square'];
  if (value === 'X') cls.push('x');
  if (value === 'O') cls.push('o');
  if (value) cls.push('filled');
  if (highlight) cls.push('win');
  return (
    <button
      className={cls.join(' ')}
      onClick={onClick}
      disabled={disabled || Boolean(value)}
      aria-label={value ? `Square ${value}` : 'Empty square'}
    >
      {value}
    </button>
  );
}
