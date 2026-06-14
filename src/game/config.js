/**
 * Tapocalypse - ゲーム定数・設定
 *
 * ゲームの数値を変えたいときはここだけ編集する。
 * UIやロジックのコードに数値を直接書かない。
 *
 * 将来の拡張:
 *  - MODES にモードを追加する
 *  - 各モード専用の設定は src/game/modes/ に追加する
 */

// ─────────────────────────────────────────────
// 画面識別子
// ─────────────────────────────────────────────

/** アプリの画面名を定数として管理 */
export const SCREENS = Object.freeze({
  TITLE:     'title',
  COUNTDOWN: 'countdown',
  GAME:      'game',
  RESULT:    'result',
});

// ─────────────────────────────────────────────
// ゲームモード識別子（Phase 2 以降で実装）
// ─────────────────────────────────────────────

/**
 * ゲームモード一覧
 * Phase 1 では NORMAL のみ実装。
 * HARD 以降はモードファイルを src/game/modes/ に追加して対応する。
 */
export const MODES = Object.freeze({
  NORMAL:     'normal',     // 画面全体タップ可。ペナルティなし
  HARD:       'hard',       // 属性判断が必要（Phase 2）
  HELL:       'hell',       // 属性 + 長押しゾーン（Phase 3）
  APOCALYPSE: 'apocalypse', // 属性 + 長押し + 移動ターゲット（Phase 4）
});

// ─────────────────────────────────────────────
// ゲーム共通設定
// ─────────────────────────────────────────────

export const GAME_CONFIG = Object.freeze({
  /** ゲーム制限時間（秒） */
  GAME_DURATION: 10,

  /** カウントダウンの開始値 */
  COUNTDOWN_START: 3,

  /**
   * フライングペナルティ（秒）
   * Phase 1 では 0（表示のみ）。将来ここを変えるだけで有効になる。
   */
  FLYING_PENALTY_SECONDS: 0,

  /** タイマーが残り何秒以下で警告色に変わるか */
  TIMER_WARNING_THRESHOLD: 3,

  /** ハイスコアを保存する localStorage のキー */
  STORAGE_KEY: 'tapocalypse_high_score',

  /** タイマー更新間隔（ms）。小さいほど滑らか */
  TIMER_INTERVAL_MS: 100,

  /** カウントダウン完了後、ゲーム開始までの待機時間（ms） */
  COUNTDOWN_END_DELAY_MS: 600,
});

// ─────────────────────────────────────────────
// カウントダウンメッセージ
// ─────────────────────────────────────────────

/** カウントダウン数字に対応する表示メッセージ */
export const COUNTDOWN_MESSAGES = Object.freeze({
  3: '時間は10秒！',
  2: 'さぁ！',
  1: '世界を叩け！',
});
