// 全局主题：卡通清新治愈风，低饱和度柔和配色

export const Colors = {
  background: '#F6EFE3', // 米色背景
  board: '#F0E4CF', // 棋盘浅米色
  boardEdge: '#E3D3B9', // 棋盘边缘描边
  boardLine: '#CDB58F', // 柔和网格线
  star: '#C2A87E', // 星位
  black: '#5A5A66', // 黑子：柔和深灰蓝
  blackLight: '#8E8E9A', // 黑子高光
  blackEdge: '#3E3E48', // 黑子暗部
  white: '#FFFEF9', // 白子：奶油白
  whiteEdge: '#D8CDB8', // 白子描边
  lastMove: '#F09A9A', // 最后一手标记：柔和珊瑚粉
  panel: '#FFFBF1',
  panelBorder: '#EADFC9',
  text: '#5C5245', // 主文字：暖棕
  textDim: '#A29481', // 次要文字
  accent: '#F4C57E', // 强调：杏黄
  accentText: '#5C4326',
  primary: '#A9CBB8', // 治愈绿
  primaryText: '#33503F',
  danger: '#E88B82', // 珊瑚红
  dangerBg: '#FCEBE6',
  overlay: 'rgba(90, 80, 66, 0.38)',
} as const;

/** 彩屑颜色 */
export const ConfettiColors = [
  '#F4C57E',
  '#F09A9A',
  '#A9CBB8',
  '#F7D9A0',
  '#C4A6E8',
  '#8FC3D9',
] as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
