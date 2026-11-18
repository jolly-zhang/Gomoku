// 规则层：胜负判定 + 黑棋禁手判定（三三 / 四四 / 长连）
// 本文件为纯函数，不修改传入棋盘；禁手判定内部用克隆棋盘做虚拟落子。
//
// 禁手判定采用「威胁点」的递归定义，可天然覆盖跳四、跳三、眠三等复杂形态：
//   - 四（冲四/活四）：存在 ≥1 个空点，黑再落一子即可成五（且该五连经过本落点）。
//   - 活四：成五点 ≥2；冲四：成五点 =1。
//   - 活三：存在 1 个空点，黑落子后使本落点成为「活四」。
//   - 眠三：只能变成冲四，不是活三。

import type { Board } from './board';
import type { ForbiddenType, Player } from './types';
import { BOARD_SIZE, cloneBoard } from './board';

/** 四个方向：横、竖、斜 ↘、斜 ↙ */
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * 以 (row, col) 为中心（虚拟视为 player 色），沿 (dr, dc) 方向统计连续同色棋子数（含自身）。
 * 中心点是否真的已落子不影响结果——用于「若在此落子能连多长」。
 */
function countLine(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: Player,
): number {
  let count = 1;
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  r = row - dr;
  c = col - dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  return count;
}

/** 若在 (row, col) 落 player 子，是否形成五连或以上（≥5） */
export function checkWin(board: Board, row: number, col: number, player: Player): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    if (countLine(board, row, col, dr, dc, player) >= 5) return true;
  }
  return false;
}

/** 若在 (row, col) 落 player 子，是否存在 ≥6 连（长连） */
function checkOverline(board: Board, row: number, col: number, player: Player): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    if (countLine(board, row, col, dr, dc, player) >= 6) return true;
  }
  return false;
}

/**
 * (r, c) 必须已落子。统计沿 (dr, dc) 方向连续同色棋子数（含自身）。
 * 与 countLine 的区别：这里读取 board[r][c] 的真实颜色，用于已落子后的连续统计。
 */
function lineLength(board: Board, r: number, c: number, dr: number, dc: number): number {
  const player = board[r][c]!;
  let n = 1;
  let rr = r + dr;
  let cc = c + dc;
  while (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE && board[rr][cc] === player) {
    n++;
    rr += dr;
    cc += dc;
  }
  rr = r - dr;
  cc = c - dc;
  while (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE && board[rr][cc] === player) {
    n++;
    rr -= dr;
    cc -= dc;
  }
  return n;
}

/**
 * 统计沿 (dr, dc) 方向、距中心点 (r, c) 不超过 4 格的「成五点」数量：
 * 即有多少个空点，黑棋下一子即可形成五连（且该五连经过中心点）。
 * 数量 ≥2 视为「活四」，=1 视为「冲四」，≥1 视为「四」。
 */
function countWinningPoints(board: Board, r: number, c: number, dr: number, dc: number): number {
  let count = 0;
  for (let k = -4; k <= 4; k++) {
    if (k === 0) continue;
    const er = r + dr * k;
    const ec = c + dc * k;
    if (er < 0 || er >= BOARD_SIZE || ec < 0 || ec >= BOARD_SIZE) continue;
    if (board[er][ec] !== null) continue;
    board[er][ec] = 'black';
    if (lineLength(board, er, ec, dr, dc) >= 5) count++;
    board[er][ec] = null;
  }
  return count;
}

/** 沿 (dr, dc) 方向，中心点 (r, c) 是否构成「四」（活四或冲四） */
function isFour(board: Board, r: number, c: number, dr: number, dc: number): boolean {
  return countWinningPoints(board, r, c, dr, dc) >= 1;
}

/**
 * 沿 (dr, dc) 方向，中心点 (r, c) 是否构成「活三」：
 * 存在一个空点 Q，黑棋落在 Q 后使中心点成为「活四」（成五点 ≥2）。
 * 眠三（只能变冲四）不满足，返回 false。
 */
function isOpenThree(board: Board, r: number, c: number, dr: number, dc: number): boolean {
  for (let k = -4; k <= 4; k++) {
    if (k === 0) continue;
    const qr = r + dr * k;
    const qc = c + dc * k;
    if (qr < 0 || qr >= BOARD_SIZE || qc < 0 || qc >= BOARD_SIZE) continue;
    if (board[qr][qc] !== null) continue;
    board[qr][qc] = 'black';
    const winning = countWinningPoints(board, r, c, dr, dc);
    board[qr][qc] = null;
    if (winning >= 2) return true;
  }
  return false;
}

/**
 * 判断黑棋在 (row, col) 落子是否构成禁手。
 * 调用前提：该点为空、当前为黑方。函数内部克隆棋盘做虚拟落子，不改动原棋盘。
 *
 * 判定优先级（遵循连珠规则）：
 *   1. 长连（≥6）→ 禁手
 *   2. 成五（恰好 5）→ 胜，不是禁手
 *   3. 双四（四数量 ≥2）→ 四四禁手（含「四四三」）
 *   4. 四三（恰一个四 + 至少一个活三）→ 胜，不是禁手
 *   5. 双三（活三数量 ≥2）→ 三三禁手
 */
export function checkForbidden(board: Board, row: number, col: number): ForbiddenType | null {
  const b = cloneBoard(board);
  b[row][col] = 'black';

  if (checkOverline(b, row, col, 'black')) return 'overline';
  if (checkWin(b, row, col, 'black')) return null;

  let fours = 0;
  let threes = 0;
  for (const [dr, dc] of DIRECTIONS) {
    // 每个方向至多计一种威胁，四优先于三
    if (isFour(b, row, col, dr, dc)) fours++;
    else if (isOpenThree(b, row, col, dr, dc)) threes++;
  }

  if (fours >= 2) return 'doubleFour';
  if (fours === 1 && threes >= 1) return null;
  if (threes >= 2) return 'doubleThree';

  return null;
}
