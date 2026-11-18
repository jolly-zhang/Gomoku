// 禁手弹窗：黑棋点击禁手点时弹出柔和提示
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ForbiddenType } from '@/core/types';
import { Colors, Radius, Spacing } from '@/theme';

const FORBIDDEN_TEXT: Record<ForbiddenType, string> = {
  doubleThree: '三三禁手',
  doubleFour: '四四禁手',
  overline: '长连禁手',
};

interface ForbiddenNoticeProps {
  type: ForbiddenType;
  onDismiss: () => void;
}

export function ForbiddenNotice({ type, onDismiss }: ForbiddenNoticeProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🙅</Text>
        <Text style={styles.title}>禁手</Text>
        <Text style={styles.body}>黑棋不能落在此处：{FORBIDDEN_TEXT[type]}</Text>
        <Pressable style={styles.button} onPress={onDismiss}>
          <Text style={styles.buttonText}>知道了</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(120, 105, 88, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.danger,
    borderWidth: 2,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 280,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    color: Colors.danger,
    fontSize: 26,
    fontWeight: '800',
  },
  body: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
