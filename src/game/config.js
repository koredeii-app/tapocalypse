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

  /** ミュート設定を保存する localStorage のキー */
  SOUND_STORAGE_KEY: 'tapocalypse_muted',

  /** 創造/破壊 進行データを保存する localStorage のキー */
  PROGRESSION_STORAGE_KEY: 'tapocalypse_progression',

  /** 言語設定を保存する localStorage のキー */
  LANG_STORAGE_KEY: 'tapocalypse_lang',

  /** タイマー更新間隔（ms）。小さいほど滑らか */
  TIMER_INTERVAL_MS: 100,

  /** カウントダウン完了後、ゲーム開始までの待機時間（ms） */
  COUNTDOWN_END_DELAY_MS: 1000,
});

// カウントダウンメッセージは src/locales/ で管理（countdown3 / countdown2 / countdown1 キー）
