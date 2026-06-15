/**
 * useGame — ゲーム状態管理フック
 *
 * ゲームループ:
 *   タップ → スコア += 倍率 → ステージ閾値チェック → ステージアップ → 時間持ち越し
 *
 * スコア管理:
 *   累積管理（リセットしない）。セーブデータに永続化。
 *
 * 時間管理:
 *   初期 10 秒。ステージクリアで残り時間 + STAGE_DURATION 秒を加算。
 *   0 になったらゲームオーバー。
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { SCREENS, GAME_CONFIG } from '../game/config';
import { GameEngine } from '../game/GameEngine';
import {
  calcStageFromScore,
  getStageInfo,
  getNextThreshold,
  getTapMultiplier,
} from '../game/stageConfig';
import { loadSave, persistSave } from './useStorage';
import { SoundManager } from '../audio/SoundManager';

export function useGame() {
  // ─── 画面 ───
  const [screen, setScreen] = useState(SCREENS.TITLE);

  // ─── カウントダウン ───
  const [countdownValue, setCountdownValue] = useState(GAME_CONFIG.COUNTDOWN_START);
  const [showFlying,     setShowFlying]     = useState(false);

  // ─── ゲーム表示用 state ───
  const [score,         setScore]         = useState(() => loadSave().score);
  const [currentStage,  setCurrentStage]  = useState(() => loadSave().currentStage);
  const [timeLeft,      setTimeLeft]      = useState(GAME_CONFIG.STAGE_DURATION);
  const [tapMode,       setTapMode]       = useState('creation');
  const [stageUpNotify, setStageUpNotify] = useState(null); // { stage, name }
  const [resultData,    setResultData]    = useState(null);

  // ─── ゲームループ用 refs ───
  const engineRef       = useRef(null);
  const scoreRef        = useRef(0);   // インターバル内から参照するためref管理
  const stageRef        = useRef(1);
  const sessionStartRef = useRef(null);
  const nextGameRef     = useRef(null); // { score, stage, time }
  const timers          = useRef({ countdown: null, game: null, notify: null, flying: null });

  // ─── アンマウント時のクリーンアップ ───
  useEffect(() => () => {
    clearInterval(timers.current.countdown);
    clearInterval(timers.current.game);
    clearTimeout(timers.current.notify);
    clearTimeout(timers.current.flying);
  }, []);

  // ─── ゲーム終了（タイムアウト） ───
  const endGame = useCallback(() => {
    clearInterval(timers.current.game);
    engineRef.current?.stop();
    engineRef.current = null;

    const finalScore = scoreRef.current;
    const finalStage = stageRef.current;
    const playTime   = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

    // セーブ（remainingTime=0 でゲームオーバー済みを示す）
    persistSave({ score: finalScore, currentStage: finalStage, remainingTime: 0 });

    SoundManager.playResult();
    setResultData({
      score:     finalScore,
      stage:     finalStage,
      stageName: getStageInfo(finalStage).name,
      playTime,
    });
    setScreen(SCREENS.RESULT);
  }, []);

  // ─── ゲーム開始本体（カウントダウン終了後に呼ばれる） ───
  // ref を通じて呼ぶことでカウントダウンの stale closure を回避
  const startGameCallback = useRef(null);
  startGameCallback.current = () => {
    const { score: s, stage: st, time: t } = nextGameRef.current ?? {
      score: 0, stage: 1, time: GAME_CONFIG.STAGE_DURATION,
    };

    // ref 同期
    scoreRef.current = s;
    stageRef.current = st;

    // state 同期
    setScore(s);
    setCurrentStage(st);
    setTimeLeft(t);
    setTapMode('creation');
    setStageUpNotify(null);
    setScreen(SCREENS.GAME);

    sessionStartRef.current = Date.now();

    const engine = new GameEngine(t);
    engineRef.current = engine;
    engine.start();

    timers.current.game = setInterval(() => {
      const e = engineRef.current;
      if (!e?.running) return;
      setTimeLeft(e.getTimeLeft());
      if (e.isOver()) {
        clearInterval(timers.current.game);
        endGame();
      }
    }, GAME_CONFIG.TIMER_INTERVAL_MS);
  };

  // ─── カウントダウン ───
  const startCountdown = useCallback(() => {
    clearInterval(timers.current.countdown);
    clearInterval(timers.current.game);
    setShowFlying(false);
    setScreen(SCREENS.COUNTDOWN);
    setCountdownValue(GAME_CONFIG.COUNTDOWN_START);

    let count = GAME_CONFIG.COUNTDOWN_START;
    timers.current.countdown = setInterval(() => {
      count--;
      setCountdownValue(count);
      if (count <= 1) {
        clearInterval(timers.current.countdown);
        setTimeout(() => startGameCallback.current(), GAME_CONFIG.COUNTDOWN_END_DELAY_MS);
      }
    }, 1000);
  }, []);

  // ─── タイトルから開始（セーブデータを引き継ぐ） ───
  const startFromTitle = useCallback(() => {
    const save = loadSave();
    nextGameRef.current = {
      score: save.score,
      stage: save.currentStage,
      time:  save.remainingTime > 0 ? save.remainingTime : GAME_CONFIG.STAGE_DURATION,
    };
    startCountdown();
  }, [startCountdown]);

  // ─── リトライ（スコアリセット・新規ゲーム） ───
  const retryGame = useCallback(() => {
    persistSave({ score: 0, currentStage: 1, remainingTime: GAME_CONFIG.STAGE_DURATION });
    scoreRef.current = 0;
    stageRef.current = 1;
    setScore(0);
    setCurrentStage(1);
    nextGameRef.current = { score: 0, stage: 1, time: GAME_CONFIG.STAGE_DURATION };
    startCountdown();
  }, [startCountdown]);

  // ─── フライング（カウントダウン中のタップ） ───
  const handleFlying = useCallback(() => {
    setShowFlying(true);
    clearTimeout(timers.current.flying);
    timers.current.flying = setTimeout(() => setShowFlying(false), 800);
  }, []);

  // ─── タップ ───
  const handleTap = useCallback(() => {
    const engine = engineRef.current;
    if (!engine?.running) return null;

    const multiplier = getTapMultiplier(stageRef.current);
    const newScore   = scoreRef.current + multiplier;
    scoreRef.current = newScore;
    setScore(newScore);

    // ステージアップ判定
    const newStageInfo = calcStageFromScore(newScore);
    if (newStageInfo.stage > stageRef.current) {
      stageRef.current = newStageInfo.stage;
      setCurrentStage(newStageInfo.stage);

      // 残り時間持ち越し（現在の残り時間をそのまま加算 = 残り × 2）
      engine.addTime(engine.getTimeLeft());

      // ステージアップ通知
      setStageUpNotify({ stage: newStageInfo.stage, name: newStageInfo.name });
      clearTimeout(timers.current.notify);
      timers.current.notify = setTimeout(() => setStageUpNotify(null), 1000);

      // 中間セーブ
      persistSave({
        score:         newScore,
        currentStage:  newStageInfo.stage,
        remainingTime: engine.getTimeLeft(),
      });
    }

    SoundManager.playTap();
    return { isValid: true, multiplier };
  }, []);

  // ─── タイトルへ ───
  const goToTitle = useCallback(() => {
    clearInterval(timers.current.game);
    engineRef.current?.stop();
    engineRef.current = null;

    // タイトル画面用にセーブデータから表示を復元
    const save = loadSave();
    scoreRef.current = save.score;
    stageRef.current = save.currentStage;
    setScore(save.score);
    setCurrentStage(save.currentStage);
    setScreen(SCREENS.TITLE);
  }, []);

  // ─── 派生値 ───
  const stageInfo       = getStageInfo(currentStage);
  const multiplier      = getTapMultiplier(currentStage);
  const currentThreshold = stageInfo.threshold;
  const nextThreshold   = getNextThreshold(currentStage);

  return {
    screen,
    countdownValue,
    showFlying,
    score,
    currentStage,
    stageName:        stageInfo.name,
    stageEmoji:       stageInfo.emoji,
    multiplier,
    timeLeft,
    tapMode,
    setTapMode,
    stageUpNotify,
    resultData,
    currentThreshold,
    nextThreshold,
    startCountdown:   startFromTitle,
    retryGame,
    handleFlying,
    handleTap,
    goToTitle,
  };
}
