// 五子棋核心领域类型定义（纯 TypeScript，无 UI / React Native 依赖）

/** 执子方：黑 / 白 */
export type Player = 'black' | 'white';

/** 棋盘格子的内容：空或某方棋子 */
export type Cell = Player | null;

/** 棋盘交叉点坐标（行、列，均从 0 开始，范围 0..BOARD_SIZE-1） */
export interface Point {
  row: number;
  col: number;
}

/** 黑棋禁手类型（仅黑棋需要判禁手） */
export type ForbiddenType = 'doubleThree' | 'doubleFour' | 'overline';

/** 对局状态 */
export type GameStatus = 'playing' | 'blackWin' | 'whiteWin' | 'draw';

/** 一步落子记录（用于悔棋回退） */
export interface Move {
  player: Player;
  point: Point;
}
