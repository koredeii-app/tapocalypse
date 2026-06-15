/**
 * useGame — ゲーム状態管理フック
 *
 * 10秒タップゲーム + 創造/破壊 属性システム
 * タップ属性（tapMode）により、タップが創造か破壊かに振り分けられる。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SCREENS, GAME_CONFIG } from '../game/config';
import { GameEngine } from '../game/GameEngine';
import { ProgressionEngine } from '../game/ProgressionEngine';
import { useProgression } from './useStorage';
import { SoundManager } from '../audio/SoundManager';

export function useGame() {
  // ─── 画面 ───
  const [screen, setScreen] = useState(SCREENS.TITLE);

  // ─── カウントダウン ───
  const [countdownValue, setCountdownValue] = useState(GAME_CONFIG.COUNTDOWN_START);
  const [showFlying,     setShowFlying]     = useState(false);

  // ─── ゲーム中のスコア ───
  const [tapMode,          setTapMode]          = useState('creation'); // 'creation' | 'destruction'
  const [creationPoints,   setCreationPoints]   = useState(0);
  const [destructionPoints,setDestructionPoints]= useState(0);
  const [timeLeft,         setTimeLeft]         = useState(GAME_CONFIG.GAME_DURATION);

  // ─── 結果 ───
  const [resultData, setResultData] = useState(null);

  // ─── 累計進行データ ───
  const { progression, saveProgression } = useProgression();

  // ─── refs ───
  const engineRef    = useRef(null);
  const timers       = useRef({ countdown: null, game: null, flying: null });
  const startGameRef = useRef(null);

  // セッション内カウント（ref で管理して再レンダリングを最小化）
  const sessionCreation    = useRef(0);
  const sessionDestruction = useRef(0);

  // ─── タイマークリア ───
  const clearAllTimers = useCallback(() => {
    clearInterval(timers.current.countdown);
    clearInterval(timers.current.game);
    clearTimeout(timers.current.flying);
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // ─── ゲーム終了 ───
  const endGame = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !engine.running) return;

    clearInterval(timers.current.game);
    engine.stop();

    const creation    = sessionCreation.current;
    const destruction = sessionDestruction.current;

    // 累計進行データに加算して保存
    const prog = new ProgressionEngine({
      creationPoints:    progression.creationPoints    + creation,
      destructionPoints: progression.destructionPoints + destruction,
    });
    saveProgression(prog.toSaveData());

    SoundManager.playResult();
    setResultData({
      creationPoints:    creation,
      destructionPoints: destruction,
      totalPoints:       creation + destruction,
      currentStage:      prog.currentStage,
    });
    setScreen(SCREENS.RESULT);
  }, [progression, saveProgression]);

  // ─── ゲーム開始 ───
  function startGame() {
    sessionCreation.current    = 0;
    sessionDestruction.current = 0;
    setCreationPoints(0);
    setDestructionPoints(0);
    setTapMode('creation');
    setTimeLeft(GAME_CONFIG.GAME_DURATION);
    setScreen(SCREENS.GAME);

    const engine = new GameEngine();
    engineRef.current = engine;
    engine.start();

    timers.current.game = setInterval(() => {
      const e = engineRef.current;
      if (!e) return;
      setTimeLeft(e.getTimeLeft());
      if (e.isOver()) {
        clearInterval(timers.current.game);
        endGame();
      }
    }, GAME_CONFIG.TIMER_INTERVAL_MS);
  }

  startGameRef.current = startGame;

  // ─── カウントダウン ───
  const startCountdown = useCallback(() => {
    clearAllTimers();
    setShowFlying(false);
    setScreen(SCREENS.COUNTDOWN);
    setCountdownValue(GAME_CONFIG.COUNTDOWN_START);

    let count = GAME_CONFIG.COUNTDOWN_START;

    timers.current.countdown = setInterval(() => {
      count--;
      setCountdownValue(count);

      if (count <= 1) {
        clearInterval(timers.current.countdown);
        setTimeout(() => startGameRef.current(), GAME_CONFIG.COUNTDOWN_END_DELAY_MS);
      }
    }, 1000);
  }, [clearAllTimers]);

  // ─── フライング ───
  const handleFlying = useCallback(() => {
    setShowFlying(true);
    clearTimeout(timers.current.flying);
    timers.current.flying = setTimeout(() => setShowFlying(false), 800);
  }, []);

  // ─── タップ（属性振り分け） ───
  const handleTap = useCallback(() => {
    const engine = engineRef.current;
    if (!engine?.running) return null;

    const result = engine.tap();
    if (result.isValid) {
      if (tapMode === 'creation') {
        sessionCreation.current++;
        setCreationPoints(sessionCreation.current);
      } else {
        sessionDestruction.current++;
        setDestructionPoints(sessionDestruction.current);
      }
      SoundManager.playTap();
    }
    return result;
  }, [tapMode]);

  // ─── タイトルへ ───
  const goToTitle = useCallback(() => {
    clearAllTimers();
    if (engineRef.current) engineRef.current.running = false;
    setScreen(SCREENS.TITLE);
  }, [clearAllTimers]);

  return {
    screen,
    countdownValue,
    showFlying,
    tapMode,
    setTapMode,
    creationPoints,
    destructionPoints,
    totalPoints: creationPoints + destructionPoints,
    timeLeft,
    resultData,
    currentStage: progression.currentStage,
    startCountdown,
    handleFlying,
    handleTap,
    goToTitle,
  };
}
