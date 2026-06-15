/**
 * useGame — ゲーム状態管理フック（創造/破壊 システム）
 *
 * 画面遷移・創造/破壊 ポイント・ステージ進行を管理する。
 * ProgressionEngine（純粋ロジック）と React の状態をつなぐ橋渡し役。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SCREENS } from '../game/config';
import { ProgressionEngine } from '../game/ProgressionEngine';
import { useProgression } from './useStorage';
import { SoundManager } from '../audio/SoundManager';

export function useGame() {
  const [screen, setScreen] = useState(SCREENS.TITLE);

  // ─── 進行データ（localStorage 連携） ───
  const { progression, saveProgression } = useProgression();

  // ─── ProgressionEngine（ミュータブルな進行状態） ───
  const engineRef = useRef(null);

  // 初回のみセーブデータからエンジンを復元
  useEffect(() => {
    engineRef.current = new ProgressionEngine({
      creationPoints:    progression.creationPoints,
      destructionPoints: progression.destructionPoints,
    });
    setGameState(engineRef.current._state());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 表示用 state ───
  const [gameState, setGameState] = useState({
    creationPoints:    progression.creationPoints,
    destructionPoints: progression.destructionPoints,
    totalPoints:       progression.creationPoints + progression.destructionPoints,
    currentStage:      progression.currentStage,
  });

  // ─── 画面遷移 ───
  const goToGame = useCallback(() => {
    setScreen(SCREENS.GAME);
  }, []);

  const goToTitle = useCallback(() => {
    setScreen(SCREENS.TITLE);
  }, []);

  // ─── 創造ボタン ───
  const handleCreate = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const state = engine.create();
    setGameState(state);
    saveProgression(engine.toSaveData());
    SoundManager.playTap();
  }, [saveProgression]);

  // ─── 破壊ボタン ───
  const handleDestroy = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const state = engine.destroy();
    setGameState(state);
    saveProgression(engine.toSaveData());
    SoundManager.playTap();
  }, [saveProgression]);

  return {
    screen,
    gameState,
    goToGame,
    goToTitle,
    handleCreate,
    handleDestroy,
  };
}
