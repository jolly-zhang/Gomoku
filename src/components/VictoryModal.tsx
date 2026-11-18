// 胜利弹窗：动画入场 + 彩屑/星光特效 + 放大获胜文字，可「再来一局」或「关闭」
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Player } from '@/core/types';
import { Colors, ConfettiColors, Radius, Spacing } from '@/theme';

interface VictoryModalProps {
  winner: Player;
  onRestart: () => void;
  onClose: () => void;
}

interface ParticleConfig {
  id: number;
  color: string;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  fall: number;
  rotate: string;
  round: boolean;
}

function Particle({ color, left, size, delay, duration, drift, fall, rotate, round }: Omit<ParticleConfig, 'id'>) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, fall] });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, drift] });
  const opacity = progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
  const rotation = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', rotate] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -24,
        left: `${left}%`,
        width: size,
        height: size,
        borderRadius: round ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rotation }],
      }}
    />
  );
}

function Confetti() {
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        id: i,
        color: ConfettiColors[Math.floor(Math.random() * ConfettiColors.length)],
        left: Math.random() * 100,
        size: 6 + Math.random() * 9,
        delay: Math.random() * 400,
        duration: 900 + Math.random() * 1200,
        drift: (Math.random() - 0.5) * 180,
        fall: 200 + Math.random() * 260,
        rotate: `${Math.floor(Math.random() * 720) - 360}deg`,
        round: Math.random() < 0.5,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}

export function VictoryModal({ winner, onRestart, onClose }: VictoryModalProps) {
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(120),
      Animated.spring(titleScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [cardScale, cardOpacity, titleScale]);

  const isBlack = winner === 'black';

  return (
    <View style={styles.overlay}>
      <Confetti />

      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
        <Text style={styles.celebrate}>🎉</Text>

        <Animated.Text style={[styles.title, { transform: [{ scale: titleScale }] }]}>
          {isBlack ? '黑方获胜！' : '白方获胜！'}
        </Animated.Text>

        <View
          style={[
            styles.stone,
            { backgroundColor: isBlack ? Colors.black : Colors.white, borderColor: isBlack ? Colors.blackEdge : Colors.whiteEdge },
          ]}
        >
          <View style={[styles.stoneHighlight, { backgroundColor: isBlack ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)' }]} />
        </View>

        <View style={styles.buttons}>
          <Pressable style={[styles.button, styles.primary]} onPress={onRestart}>
            <Text style={styles.primaryText}>再来一局</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondary]} onPress={onClose}>
            <Text style={styles.secondaryText}>关闭</Text>
          </Pressable>
        </View>
      </Animated.View>
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
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.panel,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.panelBorder,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    minWidth: 300,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  celebrate: {
    fontSize: 44,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  stone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoneHighlight: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  primaryText: {
    color: Colors.accentText,
    fontSize: 17,
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: Colors.panelBorder,
  },
  secondaryText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
});
