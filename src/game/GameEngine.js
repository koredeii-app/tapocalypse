/**
 * Tapocalypse - ゲームエンジン
 *
 * React に依存しない純粋なタイマー管理クラス。
 * スコア・ステージ管理は useGame フック側が担当する。
 *
 * 時間持ち越しシステム:
 *   addTime(seconds) で残り時間をリアルタイムに加算できる。
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
   * 残り時間を加算する（ステージクリア時の持ち越し用）
   * @param {number} seconds
   */
  addTime(seconds) {
    this.bonusTime += seconds;
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
