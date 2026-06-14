/**
 * SoundManager — 効果音管理シングルトン
 *
 * - Web Audio API を使用（音声ファイル不要・低遅延）
 * - React コンポーネントから直接呼ばず、必ずここ経由で再生する
 * - ミュート・モード切替は外部から setMuted / setMode で制御する
 *
 * 将来のモード追加手順:
 *   1. src/audio/sounds/ に xxxSounds.js を追加
 *   2. SOUND_SETS に [MODES.XXX]: xxxSounds を追記
 *   3. setMode('xxx') を呼ぶだけで切り替わる
 */

import { MODES } from '../game/config';
import { normalSounds } from './sounds/normalSounds';

// ─────────────────────────────────────────────
// モード別サウンドセット
// ─────────────────────────────────────────────

const SOUND_SETS = {
  [MODES.NORMAL]:     normalSounds,
  // 将来追加:
  // [MODES.HARD]:       hardSounds,
  // [MODES.HELL]:       hellSounds,
  // [MODES.APOCALYPSE]: apocalypseSounds,
};

// ─────────────────────────────────────────────
// モジュールスコープの内部状態
// ─────────────────────────────────────────────

let audioCtx      = null;
let muted         = false;
let currentSounds = normalSounds;

/** AudioContext を遅延初期化（ユーザー操作後に生成してブラウザポリシーに対応） */
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // バックグラウンド復帰後などで suspended になることがある
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** 音を再生する内部関数（ミュート・エラー処理を一元管理） */
function play(soundFn) {
  if (muted) return;
  try {
    soundFn(getCtx());
  } catch (_) {
    // 音声エラーはゲームプレイに影響させない
  }
}

// ─────────────────────────────────────────────
// 公開 API
// ─────────────────────────────────────────────

export const SoundManager = {
  /** ミュート状態を設定する */
  setMuted(value) {
    muted = Boolean(value);
  },

  /** モードを切り替える（MODES 定数を渡す） */
  setMode(mode) {
    currentSounds = SOUND_SETS[mode] ?? normalSounds;
  },

  playTap()     { play(currentSounds.tap); },
  playBonus()   { play(currentSounds.bonus); },
  playStageUp() { play(currentSounds.stageUp); },
  playResult()  { play(currentSounds.result); },
};
