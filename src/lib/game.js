export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function emptyBoard() {
  return Array(9).fill(null);
}

export function calculateWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

export function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

// Returns 'X' | 'O' | 'draw' | null
export function gameResult(board) {
  const { winner } = calculateWinner(board);
  if (winner) return winner;
  if (isBoardFull(board)) return 'draw';
  return null;
}

function minimax(board, aiMark, humanMark, isMaximizing) {
  const result = gameResult(board);
  if (result === aiMark) return { score: 10 };
  if (result === humanMark) return { score: -10 };
  if (result === 'draw') return { score: 0 };

  const mark = isMaximizing ? aiMark : humanMark;
  let best = isMaximizing ? { score: -Infinity } : { score: Infinity };

  for (const move of availableMoves(board)) {
    board[move] = mark;
    const { score } = minimax(board, aiMark, humanMark, !isMaximizing);
    board[move] = null;
    if (isMaximizing) {
      if (score > best.score) best = { score, move };
    } else if (score < best.score) {
      best = { score, move };
    }
  }
  return best;
}

function randomMove(board) {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

// difficulty: 'easy' | 'medium' | 'hard'
export function chooseAiMove(board, aiMark, humanMark, difficulty = 'hard') {
  const moves = availableMoves(board);
  if (moves.length === 0) return null;
  if (difficulty === 'easy') return randomMove(board);
  if (difficulty === 'medium' && Math.random() < 0.45) return randomMove(board);
  const { move } = minimax(board, aiMark, humanMark, true);
  return move ?? randomMove(board);
}
