/**
 * ProgressionEngine — 創造/破壊 進行管理（React 非依存）
 *
 * 責務:
 *   - creationPoints / destructionPoints の加算
 *   - ステージ計算
 *   - セーブデータの生成
 *
 * 将来拡張:
 *   - create() / destroy() の返り値に「イベント発生フラグ」を追加
 *   - 創造寄り / 破壊寄り / 均衡 の世界分岐判定をここに追加
 *   - モード別ボーナス倍率をここで管理
 */

import { calcStage } from './stageConfig';

export class ProgressionEngine {
  /**
   * @param {{ creationPoints?: number, destructionPoints?: number }} init
   */
  constructor({ creationPoints = 0, destructionPoints = 0 } = {}) {
    this.creationPoints    = creationPoints;
    this.destructionPoints = destructionPoints;
  }

  get totalPoints()  { return this.creationPoints + this.destructionPoints; }
  get currentStage() { return calcStage(this.totalPoints); }

  /** 創造ボタン押下 */
  create() {
    this.creationPoints++;
    return this._state();
  }

  /** 破壊ボタン押下 */
  destroy() {
    this.destructionPoints++;
    return this._state();
  }

  /** React state 更新用のスナップショット */
  _state() {
    return {
      creationPoints:    this.creationPoints,
      destructionPoints: this.destructionPoints,
      totalPoints:       this.totalPoints,
      currentStage:      this.currentStage,
    };
  }

  /** localStorage 保存用データ */
  toSaveData() {
    return {
      creationPoints:    this.creationPoints,
      destructionPoints: this.destructionPoints,
      currentStage:      this.currentStage,
    };
  }
}
