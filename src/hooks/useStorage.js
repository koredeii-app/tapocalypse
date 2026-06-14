/**
 * useStorage - ハイスコア永続化フック
 *
 * 現在は localStorage を使用。
 * 将来的にオンラインランキング API に差し替える際は、
 * このフックの実装だけ変えればよい（呼び出し側は変更不要）。
 */

import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../game/config';

/**
 * @returns {{
 *   highScore: number,
 *   saveHighScore: (score: number) => boolean
 * }}
 */
export function useStorage() {
  // 初回マウント時に localStorage から読み込む
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  /**
   * スコアが現在のハイスコアを超えていれば保存する
   * @param {number} score
   * @returns {boolean} 更新したかどうか
   */
  const saveHighScore = useCallback((score) => {
    if (score > highScore) {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEY, String(score));
      setHighScore(score);
      return true;
    }
    return false;
  }, [highScore]);

  return { highScore, saveHighScore };
}
