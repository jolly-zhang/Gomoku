// 对局状态机单元测试：落子 / 禁手拒绝 / 悔棋 / 重开 / 终局锁定
import { describe, expect, it } from 'vitest';

import { createEmptyBoard } from '../board';
import type { GameState } from '../game';
import { createInitialState, placeStone, restart, undoStone } from '../game';
import type { Player } from '../types';

/** 直接构造一个对局状态（用于跳过繁琐的交替落子、搭出特定局面） */
function makeState(
  black: Array<[number, number]>,
  white: Array<[number, number]> = [],
  current: Player = 'black',
): GameState {
  const board = createEmptyBoard();
  for (const [r, c] of black) board[r][c] = 'black';
  for (const [r, c] of white) board[r][c] = 'white';
  return { board, currentPlayer: current, status: 'playing', moves: [], lastMove: null };
}

describe('placeStone 落子', () => {
  it('初始黑先，落子后轮到白', () => {
    const s = createInitialState();
    const r = placeStone(s, 7, 7);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.state.board[7][7]).toBe('black');
      expect(r.state.currentPlayer).toBe('white');
      expect(r.state.lastMove).toEqual({ row: 7, col: 7 });
    }
  });

  it('已有棋子的位置拒绝落子', () => {
    const s = makeState([[7, 7]]);
    expect(placeStone(s, 7, 7).ok).toBe(false);
  });

  it('黑棋禁手位置拒绝落子', () => {
    // 双活三局面，落点 7,7 为三三禁手
    const s = makeState([
      [7, 5],
      [7, 6],
      [5, 7],
      [6, 7],
    ]);
    const r = placeStone(s, 7, 7);
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason === 'forbidden') {
      expect(r.forbidden).toBe('doubleThree');
    }
  });

  it('成五后判黑胜并锁定棋盘', () => {
    const s = makeState([
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    const p = placeStone(s, 7, 7);
    expect(p.ok).toBe(true);
    if (p.ok) {
      expect(p.state.status).toBe('blackWin');
      // 终局锁定，不能继续落子
      expect(placeStone(p.state, 10, 10).ok).toBe(false);
    }
  });
});

describe('undoStone 悔棋', () => {
  it('悔棋回退一步并回到上一步执子方', () => {
    let s = createInitialState();
    const b = placeStone(s, 7, 7);
    expect(b.ok).toBe(true);
    if (!b.ok) return;
    const w = placeStone(b.state, 7, 8);
    expect(w.ok).toBe(true);
    if (!w.ok) return;

    const undone = undoStone(w.state);
    expect(undone).not.toBe(null);
    if (undone) {
      expect(undone.board[7][8]).toBe(null);
      expect(undone.board[7][7]).toBe('black');
      expect(undone.currentPlayer).toBe('white');
    }
  });

  it('无棋可悔返回 null', () => {
    expect(undoStone(createInitialState())).toBe(null);
  });

  it('终局锁定后不可悔棋', () => {
    const s = makeState([
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    const p = placeStone(s, 7, 7);
    expect(p.ok).toBe(true);
    if (p.ok) expect(undoStone(p.state)).toBe(null);
  });
});

describe('restart 重开', () => {
  it('重开回到空棋盘黑先', () => {
    const s = restart();
    expect(s.board.every((row) => row.every((cell) => cell === null))).toBe(true);
    expect(s.currentPlayer).toBe('black');
    expect(s.status).toBe('playing');
    expect(s.moves.length).toBe(0);
  });
});
