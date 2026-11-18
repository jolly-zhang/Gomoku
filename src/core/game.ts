// 对局状态机：落子 / 悔棋 / 重开（不可变更新，便于 React 状态管理）

import type { Board } from './board';
import type { ForbiddenType, GameStatus, Move, Player, Point } from './types';
import { cloneBoard, createEmptyBoard, inBounds, isBoardFull } from './board';
import { checkForbidden, checkWin } from './rules';

/** 完整对局状态 */
export interface GameState {
  board: Board;
  /** 当前轮到谁 */
  currentPlayer: Player;
  status: GameStatus;
  /** 落子历史（按顺序，用于悔棋回退） */
  moves: Move[];
  /** 最后一手（用于棋盘高亮标记） */
  lastMove: Point | null;
}

/** 落子结果：成功返回新状态，失败返回原因 */
export type PlaceResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'occupied' | 'gameOver' | 'outOfBounds' }
  | { ok: false; reason: 'forbidden'; forbidden: ForbiddenType };

/** 初始对局：黑先，空棋盘 */
export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'black',
    status: 'playing',
    moves: [],
    lastMove: null,
  };
}

/** 落子（不可变：返回新状态，不修改入参） */
export function placeStone(state: GameState, row: number, col: number): PlaceResult {
  if (state.status !== 'playing') return { ok: false, reason: 'gameOver' };
  if (!inBounds(row, col)) return { ok: false, reason: 'outOfBounds' };
  if (state.board[row][col] !== null) return { ok: false, reason: 'occupied' };

  const player = state.currentPlayer;

  // 黑棋禁手判定：在真正落子前用虚拟落子判断，禁手则拒绝并返回禁手类型
  if (player === 'black') {
    const forbidden = checkForbidden(state.board, row, col);
    if (forbidden) return { ok: false, reason: 'forbidden', forbidden };
  }

  const board = cloneBoard(state.board);
  board[row][col] = player;

  const moves: Move[] = [...state.moves, { player, point: { row, col } }];
  const lastMove: Point = { row, col };

  let status: GameStatus = 'playing';
  let currentPlayer: Player = player === 'black' ? 'white' : 'black';

  if (checkWin(board, row, col, player)) {
    status = player === 'black' ? 'blackWin' : 'whiteWin';
  } else if (isBoardFull(board)) {
    status = 'draw';
  }

  return { ok: true, state: { board, currentPlayer, status, moves, lastMove } };
}

/** 单步悔棋：终局锁定后不可悔棋；无棋可悔返回 null */
export function undoStone(state: GameState): GameState | null {
  if (state.status !== 'playing' || state.moves.length === 0) return null;

  const last = state.moves[state.moves.length - 1];
  const moves = state.moves.slice(0, -1);
  const board = cloneBoard(state.board);
  board[last.point.row][last.point.col] = null;

  return {
    board,
    currentPlayer: last.player, // 回退到被撤销那一步的执子方
    status: 'playing',
    moves,
    lastMove: moves.length > 0 ? moves[moves.length - 1].point : null,
  };
}

/** 重新开始：返回全新初始状态 */
export function restart(): GameState {
  return createInitialState();
}
