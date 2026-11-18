// 棋盘组件：react-native-svg 矢量绘制，卡通圆润棋子（径向渐变 + 高光点），柔和网格。
// 触摸：整块 Pressable 覆盖层，触点吸附最近交叉点；按下时显示半透明「落子预览」，反馈柔和。
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';

import type { Board } from '@/core/board';
import { BOARD_SIZE } from '@/core/board';
import type { Player, Point } from '@/core/types';
import { Colors } from '@/theme';

interface BoardViewProps {
  board: Board;
  lastMove: Point | null;
  /** 当前执子方（用于落子预览颜色） */
  currentPlayer: Player;
  /** 棋盘边长（像素） */
  size: number;
  /** 终局锁定后禁止落子 */
  disabled: boolean;
  onPlace: (row: number, col: number) => void;
}

/** 标准 15×15 五子棋星位（天元 + 四隅） */
const STAR_POINTS: ReadonlyArray<readonly [number, number]> = [
  [3, 3],
  [3, 11],
  [11, 3],
  [11, 11],
  [7, 7],
];

export function BoardView({ board, lastMove, currentPlayer, size, disabled, onPlace }: BoardViewProps) {
  const [preview, setPreview] = useState<Point | null>(null);

  const { margin, cell, coord } = useMemo(() => {
    const m = size * 0.05;
    const c = (size - 2 * m) / (BOARD_SIZE - 1);
    return { margin: m, cell: c, coord: (i: number) => m + i * c };
  }, [size]);

  // 触点吸附到最近交叉点
  const nearestPoint = (e: GestureResponderEvent): Point | null => {
    const nativeEvent = e.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      offsetX?: number;
      offsetY?: number;
    };
    const x = nativeEvent.offsetX ?? nativeEvent.locationX;
    const y = nativeEvent.offsetY ?? nativeEvent.locationY;
    const col = Math.round((x - margin) / cell);
    const row = Math.round((y - margin) / cell);
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) return { row, col };
    return null;
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    if (disabled) return;
    const p = nearestPoint(e);
    if (p && board[p.row][p.col] === null) setPreview(p);
  };
  const handlePressOut = () => setPreview(null);
  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    const p = nearestPoint(e);
    setPreview(null);
    if (p) onPlace(p.row, p.col);
  };

  // 网格线（15 横 + 15 竖）
  const lines: ReactNode[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = coord(i);
    const start = coord(0);
    const end = coord(BOARD_SIZE - 1);
    lines.push(
      <Line key={`h${i}`} x1={start} y1={p} x2={end} y2={p} stroke={Colors.boardLine} strokeWidth={1.2} strokeLinecap="round" />,
      <Line key={`v${i}`} x1={p} y1={start} x2={p} y2={end} stroke={Colors.boardLine} strokeWidth={1.2} strokeLinecap="round" />,
    );
  }

  // 棋子（渐变 + 高光点，营造卡通光泽）
  const stoneRadius = cell * 0.42;
  const stones: ReactNode[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = board[r][c];
      if (v === null) continue;
      const cx = coord(c);
      const cy = coord(r);
      const isBlack = v === 'black';
      stones.push(
        <Circle
          key={`st-${r}-${c}`}
          cx={cx}
          cy={cy}
          r={stoneRadius}
          fill={isBlack ? 'url(#blackGrad)' : 'url(#whiteGrad)'}
          stroke={isBlack ? Colors.blackEdge : Colors.whiteEdge}
          strokeWidth={0.8}
        />,
      );
      // 左上高光点
      stones.push(
        <Circle
          key={`hl-${r}-${c}`}
          cx={cx - stoneRadius * 0.32}
          cy={cy - stoneRadius * 0.34}
          r={stoneRadius * 0.22}
          fill={isBlack ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.95)'}
        />,
      );
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.045 }]}>
      <Svg width={size} height={size} pointerEvents="none">
        <Defs>
          <RadialGradient id="blackGrad" cx="35%" cy="30%" rx="75%" ry="75%">
            <Stop offset="0%" stopColor={Colors.blackLight} />
            <Stop offset="100%" stopColor={Colors.blackEdge} />
          </RadialGradient>
          <RadialGradient id="whiteGrad" cx="35%" cy="30%" rx="75%" ry="75%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#EFE6D3" />
          </RadialGradient>
        </Defs>

        {lines}
        {STAR_POINTS.map(([r, c]) => (
          <Circle key={`star-${r}-${c}`} cx={coord(c)} cy={coord(r)} r={cell * 0.11} fill={Colors.star} />
        ))}
        {stones}

        {/* 落子预览（柔和半透明） */}
        {preview && !disabled && (
          <Circle
            cx={coord(preview.col)}
            cy={coord(preview.row)}
            r={stoneRadius}
            fill={currentPlayer === 'black' ? 'rgba(90,90,102,0.35)' : 'rgba(255,255,255,0.55)'}
          />
        )}

        {/* 最后一手标记 */}
        {lastMove && (
          <Circle cx={coord(lastMove.col)} cy={coord(lastMove.row)} r={cell * 0.15} fill={Colors.lastMove} />
        )}
      </Svg>

      <Pressable
        style={StyleSheet.absoluteFill}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.board,
    borderColor: Colors.boardEdge,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#8A7A63',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
