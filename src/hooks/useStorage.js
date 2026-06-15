/**
 * useStorage - データ永続化フック群
 *
 * useProgression: 創造/破壊 進行データの読み書き
 * useHighScore:   旧ハイスコア（後方互換のため残存）
 */

import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../game/config';

// ─────────────────────────────────────────────
// 進行データ（メイン）
// ─────────────────────────────────────────────

const DEFAULT_PROGRESSION = {
  creationPoints:    0,
  destructionPoints: 0,
  currentStage:      1,
};

export function useProgression() {
  const [progression, setProgression] = useState(() => {
    try {
      const saved = localStorage.getItem(GAME_CONFIG.PROGRESSION_STORAGE_KEY);
      if (saved) return { ...DEFAULT_PROGRESSION, ...JSON.parse(saved) };
    } catch (_) {}
    return DEFAULT_PROGRESSION;
  });

  const saveProgression = useCallback((data) => {
    try {
      localStorage.setItem(GAME_CONFIG.PROGRESSION_STORAGE_KEY, JSON.stringify(data));
      setProgression(data);
    } catch (_) {}
  }, []);

  return { progression, saveProgression };
}

// ─────────────────────────────────────────────
// 旧ハイスコア（後方互換）
// ─────────────────────────────────────────────

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
