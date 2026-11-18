// 棋盘表示与基础操作（纯函数）

import type { Cell } from './types';

/** 标准五子棋棋盘 15×15 */
export const BOARD_SIZE = 15;

/** 棋盘：二维数组，board[row][col] 表示第 row 行第 col 列的交叉点 */
export type Board = Cell[][];

/** 生成一个空棋盘 */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(null));
}

/** 坐标是否落在棋盘内 */
export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/** 深拷贝棋盘（规则判定时用于虚拟落子，避免改动原棋盘） */
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

/** 棋盘是否已下满（用于平局判定） */
export function isBoardFull(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}
