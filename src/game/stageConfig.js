/**
 * ステージ定義
 *
 * 閾値 = creationPoints + destructionPoints の合計値
 * 将来: 各ステージに背景・BGM・演出などを追加する
 *
 * 調整するときはここの threshold だけ変える。
 */

export const STAGES = Object.freeze([
  { stage:  1, threshold:     0 },
  { stage:  2, threshold:   100 },
  { stage:  3, threshold:   300 },
  { stage:  4, threshold:   600 },
  { stage:  5, threshold:  1000 },
  { stage:  6, threshold:  1500 },
  { stage:  7, threshold:  2200 },
  { stage:  8, threshold:  3000 },
  { stage:  9, threshold:  4200 },
  { stage: 10, threshold:  5800 },
  { stage: 11, threshold:  8000 },
  { stage: 12, threshold: 11000 },
  { stage: 13, threshold: 15000 },
  { stage: 14, threshold: 20000 },
  { stage: 15, threshold: 27000 },
]);

export const MAX_STAGE = STAGES[STAGES.length - 1].stage;

/** 合計値からステージ番号を返す */
export function calcStage(total) {
  let current = STAGES[0].stage;
  for (const s of STAGES) {
    if (total >= s.threshold) current = s.stage;
  }
  return current;
}
