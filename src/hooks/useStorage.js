/**
 * useStorage - データ永続化ユーティリティ
 *
 * loadSave / persistSave: ゲームセーブデータの読み書き（フック非依存）
 */

import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../game/config';

// ─────────────────────────────────────────────
// ゲームセーブデータ（フック非依存のピュア関数）
// ─────────────────────────────────────────────

const DEFAULT_SAVE = {
  score:         0,
  currentStage:  1,
  remainingTime: GAME_CONFIG.STAGE_DURATION,
};

/** localStorage からセーブデータを読み込む */
export function loadSave() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
    if (raw) return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_SAVE };
}

/** localStorage にセーブデータを書き込む */
export function persistSave(data) {
  try {
    localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 旧 API（後方互換）
// ─────────────────────────────────────────────

export function useProgression() {
  return {
    progression: loadSave(),
    saveProgression: persistSave,
  };
}

export function useStorage() {
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

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
