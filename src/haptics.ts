// 触觉反馈统一入口：web（Vercel）平台无触觉能力，直接跳过。
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** 落子成功时的轻微震动 */
export function tapFeedback(): void {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** 触发禁手时的警示震动 */
export function warnFeedback(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
