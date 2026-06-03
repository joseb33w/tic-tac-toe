function Mark({ value }) {
  if (value === 'X') {
    return (
      <svg className="mark mark-x" viewBox="0 0 100 100" aria-hidden="true">
        <line className="stroke s1" x1="22" y1="22" x2="78" y2="78" />
        <line className="stroke s2" x1="78" y1="22" x2="22" y2="78" />
      </svg>
    );
  }
  if (value === 'O') {
    return (
      <svg className="mark mark-o" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="stroke" cx="50" cy="50" r="29" />
      </svg>
    );
  }
  return null;
}

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
      <Mark value={value} />
    </button>
  );
}
