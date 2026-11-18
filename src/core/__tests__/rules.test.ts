// 规则层单元测试：胜负判定 + 黑棋禁手判定（三三 / 四四 / 长连）
import { describe, expect, it } from 'vitest';

import type { Board } from '../board';
import { createEmptyBoard } from '../board';
import { checkForbidden, checkWin } from '../rules';

/** 用坐标列表快速构建棋盘：black/white 为 [row, col] 数组 */
function makeBoard(black: Array<[number, number]>, white: Array<[number, number]> = []): Board {
  const board = createEmptyBoard();
  for (const [r, c] of black) board[r][c] = 'black';
  for (const [r, c] of white) board[r][c] = 'white';
  return board;
}

describe('checkWin 胜负判定', () => {
  it('横五连判胜', () => {
    const board = makeBoard([
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    expect(checkWin(board, 7, 7, 'black')).toBe(true);
  });

  it('竖五连判胜', () => {
    const board = makeBoard([
      [4, 7],
      [5, 7],
      [6, 7],
      [8, 7],
    ]);
    expect(checkWin(board, 7, 7, 'black')).toBe(true);
  });

  it('斜五连判胜', () => {
    const board = makeBoard([
      [5, 5],
      [6, 6],
      [8, 8],
      [9, 9],
    ]);
    expect(checkWin(board, 7, 7, 'black')).toBe(true);
  });

  it('四连不判胜', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    expect(checkWin(board, 7, 7, 'black')).toBe(false);
  });

  it('被白子阻断不判胜', () => {
    const board = makeBoard(
      [
        [7, 4],
        [7, 5],
        [7, 6],
        [7, 8],
      ],
      [[7, 3]], // 左端被白子挡住
    );
    // 7,7 落下后：7,4..7,8 为 5 连，仍是胜（右侧无阻挡）
    expect(checkWin(board, 7, 7, 'black')).toBe(true);
  });
});

describe('checkForbidden 禁手判定', () => {
  it('恰好成五不是禁手', () => {
    const board = makeBoard([
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });

  it('长连（6 连）判禁手', () => {
    // 落 7,7 后：7,3..7,9 共 7 连
    const board = makeBoard([
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
      [7, 9],
    ]);
    expect(checkForbidden(board, 7, 7)).toBe('overline');
  });

  it('单个活四不是禁手（活四必胜）', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
      [7, 8],
    ]);
    // 落 7,7 后：7,5..7,8 为活四
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });

  it('双活四判四四禁手', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
      [7, 8],
      [5, 7],
      [6, 7],
      [8, 7],
    ]);
    expect(checkForbidden(board, 7, 7)).toBe('doubleFour');
  });

  it('双冲四判四四禁手', () => {
    // 横、竖各形成一个被白子挡一端的冲四
    const board = makeBoard(
      [
        [7, 5],
        [7, 6],
        [7, 8],
        [5, 7],
        [6, 7],
        [8, 7],
      ],
      [
        [7, 4],
        [4, 7],
      ],
    );
    expect(checkForbidden(board, 7, 7)).toBe('doubleFour');
  });

  it('双活三判三三禁手', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
      [5, 7],
      [6, 7],
    ]);
    expect(checkForbidden(board, 7, 7)).toBe('doubleThree');
  });

  it('单个活三不是禁手', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
    ]);
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });

  it('四三（活四 + 活三）不是禁手（必胜手）', () => {
    const board = makeBoard([
      [7, 5],
      [7, 6],
      [7, 8], // 横方向活四
      [5, 5],
      [6, 6], // 斜方向活三
    ]);
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });

  it('眠三（一端被挡）不计为活三，非禁手', () => {
    const board = makeBoard(
      [
        [7, 5],
        [7, 6],
      ],
      [[7, 8]], // 右侧被白子挡住 → 眠三
    );
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });

  it('空点、无任何威胁不是禁手', () => {
    const board = makeBoard([]);
    expect(checkForbidden(board, 7, 7)).toBe(null);
  });
});
