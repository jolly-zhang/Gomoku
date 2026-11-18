// 对局状态的 React 封装：桥接纯函数核心层与 UI，并触发音效/触觉反馈
import { useCallback, useState } from 'react';

import type { ForbiddenType } from '@/core/types';
import type { GameState } from '@/core/game';
import { createInitialState, placeStone, restart, undoStone } from '@/core/game';
import { tapFeedback, warnFeedback } from '@/haptics';
import { playClick, playError, playWin } from '@/audio';

export function useGame() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [forbidden, setForbidden] = useState<ForbiddenType | null>(null);
  const [victoryVisible, setVictoryVisible] = useState(false);

  const place = useCallback(
    (row: number, col: number) => {
      const result = placeStone(state, row, col);
      if (result.ok) {
        setState(result.state);
        if (result.state.status === 'blackWin' || result.state.status === 'whiteWin') {
          setVictoryVisible(true);
          playWin();
        } else {
          tapFeedback();
          playClick();
        }
      } else if (result.reason === 'forbidden') {
        setForbidden(result.forbidden);
        warnFeedback();
        playError();
      } else {
        // 无效落子（已有棋子 / 越界）：轻提示音
        playError();
      }
    },
    [state],
  );

  const undo = useCallback(() => {
    setState((prev) => undoStone(prev) ?? prev);
  }, []);

  const restartGame = useCallback(() => {
    setState(restart());
    setForbidden(null);
    setVictoryVisible(false);
  }, []);

  const dismissForbidden = useCallback(() => setForbidden(null), []);
  const dismissVictory = useCallback(() => setVictoryVisible(false), []);

  return {
    state,
    forbidden,
    victoryVisible,
    place,
    undo,
    restart: restartGame,
    dismissForbidden,
    dismissVictory,
  };
}
