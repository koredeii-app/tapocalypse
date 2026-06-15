/**
 * ステージイントロ情報
 * 各ステージの名前・説明・ヒント・クリア条件ラベル
 */

export const STAGE_INFO = {
  1: {
    title: '無',
    emoji: '⬛',
    description: '何もない虚空に、最初の光を生み出せ。',
    hint: '画面をタップしよう',
    clearCondition: '光を20個生み出す',
    bg: '#000000',
  },
  2: {
    title: '光',
    emoji: '✨',
    description: '光を集め続け、恒星を誕生させよ。',
    hint: '画面を長押しして光を集める',
    clearCondition: 'ゲージを100%まで満たす',
    bg: '#050510',
  },
  3: {
    title: '物質',
    emoji: '🪨',
    description: '宇宙に漂う物質のかけらを集めよ。',
    hint: '指でスワイプして物質を回収する',
    clearCondition: '30個の物質を集める',
    bg: '#030818',
  },
  4: {
    title: '星',
    emoji: '⭐',
    description: '惑星を正しい軌道に乗せよ。',
    hint: '惑星をドラッグして軌道リングへ運ぶ',
    clearCondition: '惑星を軌道に乗せる',
    bg: '#020512',
  },
  5: {
    title: '惑星',
    emoji: '🌍',
    description: '惑星の表面に隠された生命の種を探せ。',
    hint: 'ドラッグで回転・ピンチで拡大して探索する',
    clearCondition: '生命の種を見つけてタップする',
    bg: '#010a08',
  },
};

export const MAX_TUTORIAL_STAGE = 5;
