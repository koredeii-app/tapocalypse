/**
 * ノーマルモード 効果音定義
 *
 * 各関数は AudioContext を受け取り、Web Audio API で即座に音を生成する。
 * 音声ファイル不要・連打でも音切れしない構造。
 *
 * 将来: hardSounds.js / hellSounds.js / apocalypseSounds.js を同じ形式で追加する。
 */

/** タップ音 — 短くキレのある打音（最重要） */
function tap(ctx) {
  const t    = ctx.currentTime;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // 高めから少し落とすことで「パチッ」感を出す
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(380, t + 0.04);

  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  osc.start(t);
  osc.stop(t + 0.06);
}

/** ボーナス取得音 — 二音チャイムで通常タップと差別化 */
function bonus(ctx) {
  const t = ctx.currentTime;

  [1200, 1800].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = t + i * 0.07;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.5, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

    osc.start(start);
    osc.stop(start + 0.19);
  });
}

/** ステージアップ音 — 上昇アルペジオで達成感を演出 */
function stageUp(ctx) {
  const t     = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = t + i * 0.09;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.4, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

    osc.start(start);
    osc.stop(start + 0.23);
  });
}

/** 結果画面音 — 上昇アルペジオ＋最後の音をホールドして締める */
function result(ctx) {
  const t     = ctx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = t + i * 0.11;
    const hold  = i === notes.length - 1 ? 0.45 : 0.13;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.38, start + 0.02);
    gain.gain.setValueAtTime(0.38, start + hold);
    gain.gain.exponentialRampToValueAtTime(0.001, start + hold + 0.25);

    osc.start(start);
    osc.stop(start + hold + 0.26);
  });
}

/** ポコッ音 — Stage1 タップ時のやわらかい打音 */
function poko(ctx) {
  const t    = ctx.currentTime;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, t);
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.11);

  gain.gain.setValueAtTime(0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

  osc.start(t);
  osc.stop(t + 0.15);
}

/** 収集音 — Stage3 パーティクル取得時の短いチャイム */
function collect(ctx) {
  const t    = ctx.currentTime;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(1320, t + 0.05);

  gain.gain.setValueAtTime(0.26, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.start(t);
  osc.stop(t + 0.09);
}

export const normalSounds = { tap, bonus, stageUp, result, poko, collect };
