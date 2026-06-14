/**
 * Tapocalypse - ゲームエンジン
 *
 * React に依存しない純粋なゲームロジッククラス。
 * useGame フックから生成して使用する。
 *
 * このクラスを差し替えるだけで別のゲームルールを適用できる設計。
 * 将来的に Capacitor でネイティブ化した際も、このクラスはそのまま使える。
 */

import { GAME_CONFIG } from './config';
import normalMode from './modes/normalMode';

export class GameEngine {
  /**
   * @param {object} mode - ゲームモード（normalMode 等）
   */
  constructor(mode = normalMode) {
    this.mode = mode;
    this._reset();
  }

  // ─────────────────────────────────────────────
  // 内部状態の初期化
  // ─────────────────────────────────────────────

  _reset() {
    /** 現在のスコア */
    this.score = 0;
    /** 総タップ数 */
    this.taps = 0;
    /** ゲーム開始時刻（Date.now()） */
    this.startTime = null;
    /** ゲームが実行中かどうか */
    this.running = false;
    /** フライング回数（将来のペナルティ計算に使う） */
    this.flyingCount = 0;
  }

  // ─────────────────────────────────────────────
  // 公開メソッド
  // ─────────────────────────────────────────────

  /** ゲーム開始 */
  start() {
    this._reset();
    this.startTime = Date.now();
    this.running = true;
    this.mode.onStart();
  }

  /**
   * タップ処理
   * モードの onTap() を呼び出してスコアを計算する。
   * @returns {{ score: number, isValid: boolean }}
   */
  tap() {
    if (!this.running) return { score: 0, isValid: false };

    const result = this.mode.onTap({
      score: this.score,
      taps:  this.taps,
      timeLeft: this.getTimeLeft(),
    });

    if (result.isValid) {
      this.score += result.score;
      this.taps++;
    }

    return result;
  }

  /**
   * フライングを記録する
   * Phase 1 ではペナルティ 0 秒。将来は GAME_CONFIG.FLYING_PENALTY_SECONDS を使う。
   * @returns {{ penaltySeconds: number, count: number }}
   */
  recordFlying() {
    this.flyingCount++;
    return {
      penaltySeconds: GAME_CONFIG.FLYING_PENALTY_SECONDS,
      count: this.flyingCount,
    };
  }

  /**
   * 残り時間を返す（Date.now() 基準でドリフトなし）
   * @returns {number} 残り秒数（0 以上）
   */
  getTimeLeft() {
    if (!this.startTime) return GAME_CONFIG.GAME_DURATION;
    const elapsed = (Date.now() - this.startTime) / 1000;
    return Math.max(0, GAME_CONFIG.GAME_DURATION - elapsed);
  }

  /** 時間切れかどうか */
  isOver() {
    return this.running && this.getTimeLeft() <= 0;
  }

  /**
   * ゲームを停止して結果を返す
   * @returns {{ score: number, taps: number, flyingCount: number }}
   */
  stop() {
    this.running = false;
    const result = {
      score:       this.score,
      taps:        this.taps,
      flyingCount: this.flyingCount,
    };
    this.mode.onEnd(result);
    return result;
  }
}
