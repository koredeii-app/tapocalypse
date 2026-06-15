/**
 * Tapocalypse - ゲームエンジン
 *
 * React に依存しない純粋なタイマー管理クラス。
 * スコア・ステージ管理は useGame フック側が担当する。
 *
 * タイマーシステム:
 *   各ステージ開始時に resetTimer() で 10 秒にリセットする。
 *   持ち越しなし。0 になったらゲームオーバー。
 *   Date.now() 基準で計算するためドリフトなし。
 */

import { GAME_CONFIG } from './config';

export class GameEngine {
  /**
   * @param {number} initialTime - 開始時の残り時間（秒）
   */
  constructor(initialTime = GAME_CONFIG.STAGE_DURATION) {
    this.initialTime = initialTime;
    this.startTime   = null;
    this.bonusTime   = 0;
    this.running     = false;
  }

  /** ゲーム開始 */
  start() {
    this.startTime = Date.now();
    this.bonusTime = 0;
    this.running   = true;
  }

  /**
   * ステージクリア時にタイマーをリセットする
   * 持ち越しなし。常に STAGE_DURATION 秒から再スタート。
   * @param {number} seconds
   */
  resetTimer(seconds = GAME_CONFIG.STAGE_DURATION) {
    this.initialTime = seconds;
    this.startTime   = Date.now();
    this.bonusTime   = 0;
  }

  /**
   * 残り時間を返す（0 以上）
   * @returns {number}
   */
  getTimeLeft() {
    if (!this.startTime) return this.initialTime;
    const elapsed = (Date.now() - this.startTime) / 1000;
    return Math.max(0, this.initialTime + this.bonusTime - elapsed);
  }

  /** 時間切れかどうか */
  isOver() {
    return this.running && this.getTimeLeft() <= 0;
  }

  /** ゲーム停止 */
  stop() {
    this.running = false;
  }
}
