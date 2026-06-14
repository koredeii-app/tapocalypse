/**
 * Tapocalypse - ノーマルモード定義
 *
 * Phase 1 の基本モード。画面全体タップ可能、ペナルティなし。
 *
 * ─────────────────────────────────────────────
 * 全モードが実装すべきインターフェース:
 *
 *   id        {string}   - モード識別子
 *   name      {string}   - 表示名
 *   config    {object}   - モード固有の設定値
 *   onTap(gameState)     - タップ時の処理。{ score, isValid } を返す
 *   onStart()            - ゲーム開始時フック
 *   onEnd(result)        - ゲーム終了時フック
 *
 * 将来のモードもこの形を守る。
 * ─────────────────────────────────────────────
 */

const normalMode = {
  id: 'normal',
  name: 'Normal',

  config: {
    /** タップ 1 回あたりのスコア */
    TAP_SCORE: 1,
    /** 画面全体をタップ可能にするか */
    FULL_SCREEN_TAP: true,
  },

  /**
   * タップ時の処理
   * @param {{ score: number, taps: number, timeLeft: number }} gameState
   * @returns {{ score: number, isValid: boolean }}
   */
  onTap(gameState) {
    return {
      score: normalMode.config.TAP_SCORE,
      isValid: true,
    };
  },

  /** ゲーム開始時フック（将来の演出・初期化に使う） */
  onStart() {},

  /** ゲーム終了時フック（将来の集計・ボーナス計算に使う） */
  onEnd(result) {},
};

export default normalMode;
