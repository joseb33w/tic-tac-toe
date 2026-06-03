import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWinner,
  gameResult,
  isBoardFull,
  availableMoves,
  chooseAiMove,
  emptyBoard
} from './game.js';

test('detects a row win', () => {
  const { winner, line } = calculateWinner(['X', 'X', 'X', null, 'O', null, 'O', null, null]);
  assert.equal(winner, 'X');
  assert.deepEqual(line, [0, 1, 2]);
});

test('detects a diagonal win', () => {
  const { winner } = calculateWinner(['O', 'X', 'X', null, 'O', null, null, 'X', 'O']);
  assert.equal(winner, 'O');
});

test('no winner on empty board', () => {
  assert.equal(calculateWinner(emptyBoard()).winner, null);
});

test('gameResult reports draw on a full board with no winner', () => {
  const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(isBoardFull(board), true);
  assert.equal(gameResult(board), 'draw');
});

test('availableMoves lists only empty squares', () => {
  assert.deepEqual(availableMoves(['X', null, 'O', null, null, null, null, null, null]), [1, 3, 4, 5, 6, 7, 8]);
});

test('hard AI takes the immediate winning move', () => {
  const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
  assert.equal(chooseAiMove(board, 'O', 'X', 'hard'), 2);
});

test('hard AI blocks the opponent winning move', () => {
  const board = ['X', 'X', null, null, 'O', null, null, null, null];
  assert.equal(chooseAiMove(board, 'O', 'X', 'hard'), 2);
});

test('hard AI never loses across self-play (it should at worst draw)', () => {
  for (let trial = 0; trial < 20; trial++) {
    const board = emptyBoard();
    let turn = 'X';
    while (gameResult(board) === null) {
      const move =
        turn === 'X'
          ? chooseAiMove(board, 'X', 'O', 'hard')
          : chooseAiMove(board, 'O', 'X', 'hard');
      board[move] = turn;
      turn = turn === 'X' ? 'O' : 'X';
    }
    assert.equal(gameResult(board), 'draw');
  }
});
