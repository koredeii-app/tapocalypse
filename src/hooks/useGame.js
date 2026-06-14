/**
 * useGame - ゲーム状態管理メインフック
 *
 * 画面遷移・カウントダウン・ゲームタイマー・スコアをまとめて管理する。
 * GameEngine（純粋ロジック）と React の状態をつなぐ橋渡し役。
 *
 * 返り値をそのまま各スクリーンコンポーネントに props として渡す。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SCREENS, GAME_CONFIG, COUNTDOWN_MESSAGES } from '../game/config';
import { GameEngine } from '../game/GameEngine';
import { useStorage } from './useStorage';

export function useGame() {
  // ─────────────────────────────────────────────
  // 表示用 state（再レンダリングが必要なもの）
  // ─────────────────────────────────────────────

  const [screen,         setScreen]         = useState(SCREENS.TITLE);
  const [countdownValue, setCountdownValue] = useState(GAME_CONFIG.COUNTDOWN_START);
  const [showFlying,     setShowFlying]     = useState(false);
  const [score,          setScore]          = useState(0);
  const [timeLeft,       setTimeLeft]       = useState(GAME_CONFIG.GAME_DURATION);
  const [resultData,     setResultData]     = useState(null);

  const { highScore, saveHighScore } = useStorage();

  // ─────────────────────────────────────────────
  // refs（レンダリングをトリガーしない内部状態）
  // ─────────────────────────────────────────────

  /** GameEngine インスタンス */
  const engineRef = useRef(null);

  /** タイマー ID をまとめて管理するオブジェクト */
  const timers = useRef({ countdown: null, game: null, flying: null });

  /**
   * startGame を ref で保持。
   * setInterval コールバック内から常に最新版を呼ぶためのパターン。
   */
  const startGameRef = useRef(null);

  // ─────────────────────────────────────────────
  // ユーティリティ
  // ─────────────────────────────────────────────

  /** 全タイマーを安全にクリアする */
  const clearAllTimers = useCallback(() => {
    clearInterval(timers.current.countdown);
    clearInterval(timers.current.game);
    clearTimeout(timers.current.flying);
  }, []);

  // コンポーネントのアンマウント時にタイマーを確実に止める
  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // ─────────────────────────────────────────────
  // ゲーム終了
  // ─────────────────────────────────────────────

  const endGame = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !engine.running) return; // 二重呼び出し防止

    clearInterval(timers.current.game);

    const result    = engine.stop();
    const newRecord = saveHighScore(result.score);

    setResultData({ ...result, isNewRecord: newRecord });
    setScreen(SCREENS.RESULT);
  }, [saveHighScore]);

  // ─────────────────────────────────────────────
  // ゲーム開始
  // ─────────────────────────────────────────────

  function startGame() {
    const engine = new GameEngine();
    engineRef.current = engine;
    engine.start();

    setScore(0);
    setTimeLeft(GAME_CONFIG.GAME_DURATION);
    setScreen(SCREENS.GAME);

    // 100ms ごとに残り時間を更新（Date.now() 基準なのでドリフトなし）
    timers.current.game = setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;

      const remaining = engine.getTimeLeft();
      setTimeLeft(remaining);

      if (engine.isOver()) {
        clearInterval(timers.current.game);
        endGame();
      }
    }, GAME_CONFIG.TIMER_INTERVAL_MS);
  }

  // 常に最新の startGame を ref に保持
  startGameRef.current = startGame;

  // ─────────────────────────────────────────────
  // カウントダウン開始
  // ─────────────────────────────────────────────

  const startCountdown = useCallback(() => {
    clearAllTimers();

    setShowFlying(false);
    setScreen(SCREENS.COUNTDOWN);

    // カウントダウンの初期値を表示
    let count = GAME_CONFIG.COUNTDOWN_START;
    setCountdownValue(count);

    timers.current.countdown = setInterval(() => {
      count--;
      setCountdownValue(count);

      if (count <= 1) {
        // 「1 / 世界を叩け！」を少し見せてからゲーム開始
        clearInterval(timers.current.countdown);
        setTimeout(() => startGameRef.current(), GAME_CONFIG.COUNTDOWN_END_DELAY_MS);
      }
    }, 1000);
  }, [clearAllTimers]);

  // ─────────────────────────────────────────────
  // フライング処理
  // ─────────────────────────────────────────────

  /**
   * カウントダウン中のタップ（フライング）
   * Phase 1 では表示のみ。将来は engine.recordFlying() でペナルティを適用する。
   */
  const handleFlying = useCallback(() => {
    setShowFlying(true);

    // 表示を一定時間後に消す（連打されても延長しないように clearTimeout する）
    clearTimeout(timers.current.flying);
    timers.current.flying = setTimeout(() => setShowFlying(false), 800);
  }, []);

  // ─────────────────────────────────────────────
  // タップ処理
  // ─────────────────────────────────────────────

  /**
   * ゲーム中のタップ
   * @returns {{ score: number, isValid: boolean } | null}
   */
  const handleTap = useCallback(() => {
    const engine = engineRef.current;
    if (!engine?.running) return null;

    const result = engine.tap();
    if (result.isValid) {
      // React の state 更新（レンダリングをトリガー）
      setScore(engine.score);
    }
    return result;
  }, []);

  // ─────────────────────────────────────────────
  // タイトルへ戻る
  // ─────────────────────────────────────────────

  const goToTitle = useCallback(() => {
    clearAllTimers();
    if (engineRef.current) engineRef.current.running = false;
    setScreen(SCREENS.TITLE);
  }, [clearAllTimers]);

  // ─────────────────────────────────────────────
  // 返り値
  // ─────────────────────────────────────────────

  return {
    // 状態
    screen,
    countdownValue,
    countdownMessage: COUNTDOWN_MESSAGES[countdownValue] ?? '',
    showFlying,
    score,
    timeLeft,
    highScore,
    resultData,
    // アクション
    startCountdown,
    handleFlying,
    handleTap,
    goToTitle,
  };
}
