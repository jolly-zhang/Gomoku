// 音效播放：基于 expo-audio（原生 iPad 与 web/Vercel 共用一条代码路径）。
// 播放器惰性创建（首次点击时才创建），规避网页自动播放策略。
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import clickWav from '../assets/sounds/click.wav';
import winWav from '../assets/sounds/win.wav';
import errorWav from '../assets/sounds/error.wav';

type SoundKind = 'click' | 'win' | 'error';

const SOURCES: Record<SoundKind, number | string> = {
  click: clickWav,
  win: winWav,
  error: errorWav,
};

const players: Partial<Record<SoundKind, AudioPlayer>> = {};

function playSound(kind: SoundKind): void {
  void (async () => {
    try {
      let player = players[kind];
      if (!player) {
        player = createAudioPlayer(SOURCES[kind]);
        players[kind] = player;
      }
      // 回到开头再播放（尽力而为），保证重复触发时每次都从头响
      try {
        await player.seekTo(0);
      } catch {
        // 忽略 seek 失败（例如首次加载尚未就绪）
      }
      player.play();
    } catch {
      // 音效异常不影响对局
    }
  })();
}

/** 落子成功音效 */
export const playClick = (): void => playSound('click');

/** 胜利音效 */
export const playWin = (): void => playSound('win');

/** 禁手 / 无效落子轻提示音 */
export const playError = (): void => playSound('error');
