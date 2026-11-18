// 控制面板：当前回合指示 + 悔棋 / 重新开始（右侧模块，卡通柔和风）
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameStatus, Player } from '@/core/types';
import { Colors, Radius, Spacing } from '@/theme';

interface ControlsProps {
  currentPlayer: Player;
  status: GameStatus;
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
}

function statusText(status: GameStatus): string {
  switch (status) {
    case 'blackWin':
      return '黑方获胜';
    case 'whiteWin':
      return '白方获胜';
    case 'draw':
      return '平局';
    default:
      return '对局中';
  }
}

export function Controls({ currentPlayer, status, canUndo, onUndo, onRestart }: ControlsProps) {
  const isOver = status !== 'playing';
  const turnLabel = isOver ? statusText(status) : currentPlayer === 'black' ? '轮到黑方' : '轮到白方';

  return (
    <View style={styles.panel}>
      <View style={styles.turnRow}>
        <View
          style={[
            styles.stone,
            { backgroundColor: currentPlayer === 'black' ? Colors.black : Colors.white, borderColor: currentPlayer === 'black' ? Colors.blackEdge : Colors.whiteEdge },
          ]}
        >
          <View style={[styles.stoneHighlight, { backgroundColor: currentPlayer === 'black' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)' }]} />
        </View>
        <Text style={styles.turnText}>{turnLabel}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.undo, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
        >
          <Text style={styles.undoText}>悔棋</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.restart]} onPress={onRestart}>
          <Text style={styles.restartText}>重新开始</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: 'stretch',
    backgroundColor: Colors.panel,
    borderColor: Colors.panelBorder,
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoneHighlight: {
    position: 'absolute',
    top: 4,
    left: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  turnText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  undo: {
    backgroundColor: Colors.panel,
    borderColor: Colors.panelBorder,
  },
  undoText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  restart: {
    backgroundColor: Colors.primary,
    borderColor: 'transparent',
  },
  restartText: {
    color: Colors.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
