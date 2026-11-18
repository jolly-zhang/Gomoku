// 对局单页：顶部标题 + 棋盘居中 + 左侧规则小模块 + 右侧控制，横竖屏自适应
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoardView } from '@/components/BoardView';
import { Controls } from '@/components/Controls';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { RulesPanel } from '@/components/RulesPanel';
import { VictoryModal } from '@/components/VictoryModal';
import { useGame } from '@/hooks/useGame';
import { Colors, Spacing } from '@/theme';

const TITLE_H = 52; // 顶部标题栏高度
const SIDE_W = 200; // 横屏时左右面板宽度

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { state, forbidden, victoryVisible, place, undo, restart, dismissForbidden, dismissVictory } = useGame();

  const outer = Spacing.lg; // 四周留白
  // 棋盘大小：横屏居中留出两侧面板；竖屏居中留出下方面板区
  const boardSize = isLandscape
    ? Math.min(width - SIDE_W * 2 - Spacing.md * 2 - outer * 2, height - TITLE_H - outer * 2)
    : Math.min(width - outer * 2, height - TITLE_H - 240 - outer);

  const board = (
    <BoardView
      board={state.board}
      lastMove={state.lastMove}
      currentPlayer={state.currentPlayer}
      size={boardSize}
      disabled={state.status !== 'playing'}
      onPlace={place}
    />
  );

  const controls = (
    <Controls
      currentPlayer={state.currentPlayer}
      status={state.status}
      canUndo={state.status === 'playing' && state.moves.length > 0}
      onUndo={undo}
      onRestart={restart}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.titleBar, { height: TITLE_H }]}>
        <Text style={styles.title}>五子棋 - 双人对战</Text>
      </View>

      {isLandscape ? (
        <View style={styles.landscape}>
          <View style={{ width: SIDE_W }}>
            <RulesPanel />
          </View>
          <View style={styles.boardCenter}>{board}</View>
          <View style={{ width: SIDE_W }}>{controls}</View>
        </View>
      ) : (
        <View style={styles.portrait}>
          <View style={styles.boardCenter}>{board}</View>
          <View style={styles.bottomRow}>
            <View style={styles.bottomCard}>
              <RulesPanel />
            </View>
            <View style={styles.bottomCard}>{controls}</View>
          </View>
        </View>
      )}

      {victoryVisible && state.status !== 'playing' && (
        <VictoryModal
          winner={state.status === 'blackWin' ? 'black' : 'white'}
          onRestart={restart}
          onClose={dismissVictory}
        />
      )}
      {forbidden && <ForbiddenNotice type={forbidden} onDismiss={dismissForbidden} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  landscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  portrait: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  boardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomCard: {
    flex: 1,
    maxWidth: 340,
  },
});
