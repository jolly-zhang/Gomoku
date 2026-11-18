// 规则面板（左侧小模块，简洁列出对局规则）
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/theme';

export function RulesPanel() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>规则</Text>
      <Text style={styles.item}>· 15×15 棋盘</Text>
      <Text style={styles.item}>· 黑棋先行</Text>
      <Text style={styles.item}>· 先连成五子者胜</Text>
      <Text style={styles.item}>· 黑棋禁手</Text>
      <Text style={styles.sub}>三三 · 四四 · 长连</Text>
      <Text style={styles.item}>· 双人轮流落子</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: Colors.panel,
    borderColor: Colors.panelBorder,
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  item: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 22,
  },
  sub: {
    color: Colors.textDim,
    fontSize: 12,
    lineHeight: 20,
    paddingLeft: Spacing.md,
  },
});
