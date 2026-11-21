// 棋盘基础操作单元测试：createEmptyBoard / inBounds / cloneBoard / isBoardFull
import { describe, expect, it } from 'vitest';

import { BOARD_SIZE, cloneBoard, createEmptyBoard, inBounds, isBoardFull } from '../board';

describe('createEmptyBoard 空棋盘', () => {
  it('生成 15×15 且全为空', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(BOARD_SIZE);
    expect(board.every((row) => row.length === BOARD_SIZE)).toBe(true);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });
});

describe('inBounds 边界判断', () => {
  it('四角均在棋盘内', () => {
    expect(inBounds(0, 0)).toBe(true);
    expect(inBounds(0, BOARD_SIZE - 1)).toBe(true);
    expect(inBounds(BOARD_SIZE - 1, 0)).toBe(true);
    expect(inBounds(BOARD_SIZE - 1, BOARD_SIZE - 1)).toBe(true);
  });

  it('越界坐标返回 false', () => {
    expect(inBounds(-1, 0)).toBe(false);
    expect(inBounds(0, -1)).toBe(false);
    expect(inBounds(BOARD_SIZE, 0)).toBe(false);
    expect(inBounds(0, BOARD_SIZE)).toBe(false);
  });
});

describe('cloneBoard 深拷贝', () => {
  it('内容一致', () => {
    const board = createEmptyBoard();
    board[7][7] = 'black';
    const copy = cloneBoard(board);
    expect(copy[7][7]).toBe('black');
  });

  it('修改副本不影响原棋盘', () => {
    const board = createEmptyBoard();
    board[7][7] = 'black';
    const copy = cloneBoard(board);
    copy[7][7] = 'white';
    copy[8][8] = 'black';
    expect(board[7][7]).toBe('black');
    expect(board[8][8]).toBe(null);
  });
});

describe('isBoardFull 满盘判断', () => {
  it('空棋盘未满', () => {
    expect(isBoardFull(createEmptyBoard())).toBe(false);
  });

  it('部分落子未满', () => {
    const board = createEmptyBoard();
    board[0][0] = 'black';
    expect(isBoardFull(board)).toBe(false);
  });

  it('全部填满返回 true', () => {
    const board = createEmptyBoard();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = (r + c) % 2 === 0 ? 'black' : 'white';
      }
    }
    expect(isBoardFull(board)).toBe(true);
  });
});
