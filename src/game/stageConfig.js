/**
 * ステージ定義
 *
 * threshold = そのステージに到達するために必要な累積スコア
 * 調整するときはここの threshold だけ変える。
 */

export const STAGES = Object.freeze([
  { stage:  1, name: '無',          emoji: '⬛', threshold:      0 },
  { stage:  2, name: '光',          emoji: '✨', threshold:     30 },
  { stage:  3, name: '物質',        emoji: '🪨', threshold:     80 },
  { stage:  4, name: '星',          emoji: '⭐', threshold:    180 },
  { stage:  5, name: '惑星',        emoji: '🌍', threshold:    400 },
  { stage:  6, name: '海',          emoji: '🌊', threshold:    800 },
  { stage:  7, name: '生命',        emoji: '🌱', threshold:   1600 },
  { stage:  8, name: '動物',        emoji: '🦕', threshold:   3200 },
  { stage:  9, name: '人類',        emoji: '👤', threshold:   6400 },
  { stage: 10, name: '文明',        emoji: '🏛️', threshold:  12800 },
  { stage: 11, name: '戦争',        emoji: '⚔️', threshold:  25600 },
  { stage: 12, name: '宇宙・銀河', emoji: '🌌', threshold:  51200 },
  { stage: 13, name: '多元宇宙',   emoji: '🔮', threshold: 102400 },
  { stage: 14, name: '神域',        emoji: '👁️', threshold: 204800 },
  { stage: 15, name: 'タポカリプス', emoji: '💥', threshold: 409600 },
]);

export const MAX_STAGE = STAGES.length;

/** ステージ番号からステージ情報を返す（範囲外は最後のステージ） */
export function getStageInfo(stage) {
  return STAGES[stage - 1] ?? STAGES[STAGES.length - 1];
}

/** 累積スコアから現在のステージ情報を返す */
export function calcStageFromScore(score) {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (score >= s.threshold) current = s;
  }
  return current;
}

/** 現在ステージの次ステージ閾値（最終ステージなら null） */
export function getNextThreshold(stage) {
  return STAGES[stage]?.threshold ?? null;
}

/**
 * ステージごとのタップ倍率
 * Stage1-4: x1 / Stage5-7: x2 / Stage8-9: x4
 * Stage10-11: x8 / Stage12-13: x16 / Stage14-15: x32
 */
export function getTapMultiplier(stage) {
  if (stage <= 4)  return 1;
  if (stage <= 7)  return 2;
  if (stage <= 9)  return 4;
  if (stage <= 11) return 8;
  if (stage <= 13) return 16;
  return 32;
}
