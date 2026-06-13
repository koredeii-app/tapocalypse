/**
 * Tapocalypse - ゲームロジック
 *
 * 画面構成:
 *   title → countdown → game → result → (title or game)
 *
 * 将来の拡張ポイント:
 *   - CONFIG を変更してゲームバランス調整
 *   - STAGE_CONFIG を追加してステージ制を実現
 *   - SoundManager クラスを別ファイルに追加して効果音対応
 *   - RankingManager クラスを追加してオンラインランキング対応
 */

'use strict';

/* ============================================================
   定数・設定
   ============================================================ */

/** ゲームのチューニング定数 */
const CONFIG = Object.freeze({
  /** ゲーム時間（秒） */
  GAME_DURATION: 10,

  /** 地球タップ1回あたりのスコア */
  EARTH_TAP_SCORE: 1,

  /** ボーナスターゲットのスコア */
  BONUS_SCORE: 50,

  /** ボーナスターゲット出現間隔（ms） min〜max のランダム */
  BONUS_MIN_INTERVAL: 1000,
  BONUS_MAX_INTERVAL: 3000,

  /** ボーナスターゲットが自動消滅するまでの時間（ms） */
  BONUS_LIFETIME: 2500,

  /** フライング1回あたりのペナルティ（秒） */
  FLYING_PENALTY: 1,

  /** タイマーが残り何秒以下で警告色になるか */
  TIMER_WARNING_SECONDS: 3,

  /** カウントダウン数字ごとのメッセージ */
  COUNTDOWN_MESSAGES: {
    3: '時間は10秒！',
    2: 'さぁ！',
    1: '世界を叩け！',
  },

  /** ボーナスターゲットのエリアに対するマージン（割合 0〜0.5） */
  BONUS_MARGIN_RATIO: 0.15,

  /** ローカルストレージのキー */
  STORAGE_KEY: 'tapocalypse_high_score',
});

/* ============================================================
   ゲーム状態
   ============================================================ */

/**
 * 実行中のゲーム状態を一元管理するオブジェクト
 * ステージ制追加時は currentStage 等をここに追加する
 */
const state = {
  score: 0,           // 現在のスコア
  taps: 0,            // 総タップ数（ボーナス込み）
  highScore: 0,       // ハイスコア（localStorage から読み込む）
  timeLeft: 0,        // ゲーム残り時間（秒）
  gameStartTime: 0,   // ゲーム開始時刻 (Date.now())
  flyingPenalties: 0, // カウントダウン中のフライング回数
  gameRunning: false, // ゲームが進行中かどうか

  // アクティブなボーナスターゲットの管理リスト
  bonusTargets: [],   // [{ element, timerId }]

  // タイマーID（クリーンアップ用）
  timerIntervalId: null,
  bonusScheduleId: null,
};

/* ============================================================
   DOM 参照
   ============================================================ */

const $ = id => document.getElementById(id);

const SCREENS = {
  title:     $('screen-title'),
  countdown: $('screen-countdown'),
  game:      $('screen-game'),
  result:    $('screen-result'),
};

const EL = {
  // タイトル画面
  titleHighScore:    $('title-high-score'),
  btnStart:          $('btn-start'),

  // カウントダウン画面
  countdownNumber:   $('countdown-number'),
  countdownMessage:  $('countdown-message'),
  countdownFlying:   $('countdown-flying'),

  // ゲーム画面
  gameTimer:         $('game-timer'),
  gameScore:         $('game-score'),
  gameHighScore:     $('game-high-score'),
  earthTarget:       $('earth-target'),
  tapArea:           $('tap-area'),
  bonusContainer:    $('bonus-container'),
  effectContainer:   $('effect-container'),

  // 結果画面
  resultTaps:        $('result-taps'),
  resultScore:       $('result-score'),
  resultHighScore:   $('result-high-score'),
  newRecordBadge:    $('new-record-badge'),
  btnRetry:          $('btn-retry'),
};

/* ============================================================
   ストレージ管理
   ============================================================ */

const Storage = {
  /** ハイスコアを読み込む */
  loadHighScore() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  },

  /** ハイスコアを保存する */
  saveHighScore(score) {
    localStorage.setItem(CONFIG.STORAGE_KEY, String(score));
  },
};

/* ============================================================
   画面遷移管理
   ============================================================ */

const ScreenManager = {
  /** 指定した画面を表示し、他を非表示にする */
  show(screenName) {
    Object.entries(SCREENS).forEach(([name, el]) => {
      el.classList.toggle('active', name === screenName);
    });
  },
};

/* ============================================================
   星空背景の生成
   ============================================================ */

/**
 * 指定されたコンテナに星を動的生成する
 * @param {HTMLElement} container - .stars-bg 要素
 * @param {number} count - 生成する星の数
 */
function generateStars(container, count = 70) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    // ランダムな位置
    star.style.left = `${Math.random() * 100}%`;
    star.style.top  = `${Math.random() * 100}%`;

    // ランダムなサイズ（小さい星が多め）
    const size = Math.random() > 0.85 ? (Math.random() * 2 + 2) : (Math.random() * 1.5 + 0.5);
    star.style.width  = `${size}px`;
    star.style.height = `${size}px`;

    // ランダムな明るさとアニメーション
    star.style.setProperty('--star-opacity', (0.3 + Math.random() * 0.7).toFixed(2));
    star.style.setProperty('--anim-duration', `${2 + Math.random() * 4}s`);
    star.style.setProperty('--anim-delay',    `${Math.random() * 5}s`);

    container.appendChild(star);
  }
}

/* ============================================================
   タップエフェクト
   ============================================================ */

/**
 * 指定座標に 💥 エフェクトを表示する
 * @param {number} x - タップX座標（ページ基準）
 * @param {number} y - タップY座標（ページ基準）
 */
function showTapEffect(x, y) {
  const el = document.createElement('div');
  el.className = 'tap-effect';
  el.textContent = '💥';
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  EL.effectContainer.appendChild(el);

  // アニメーション完了後に削除（CSSアニメーション時間 0.5s に合わせる）
  setTimeout(() => el.remove(), 520);
}

/**
 * ボーナス取得時のスコアポップアップを表示する
 * @param {number} x - 表示X座標（エリア内相対）
 * @param {number} y - 表示Y座標（エリア内相対）
 */
function showBonusPopup(x, y) {
  const el = document.createElement('div');
  el.className = 'bonus-score-popup';
  el.textContent = `+${CONFIG.BONUS_SCORE}`;
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  EL.tapArea.appendChild(el);

  setTimeout(() => el.remove(), 850);
}

/* ============================================================
   地球タップ処理
   ============================================================ */

/**
 * 地球のバウンスアニメーションをトリガーする
 * クラスの追加・削除でCSSアニメーションを再生
 */
function animateEarthTap() {
  EL.earthTarget.classList.remove('tapping');
  // リフローを強制してアニメーションをリセット（同じクラスの再追加を有効にする）
  void EL.earthTarget.offsetWidth;
  EL.earthTarget.classList.add('tapping');
}

/**
 * 画面全体タップ時の処理（スコア加算・エフェクト）
 * ボーナスターゲットは stopPropagation するため、ここには届かない
 * @param {Event} e - TouchEvent または MouseEvent
 */
function onTapAreaTap(e) {
  if (!state.gameRunning) return;

  e.preventDefault(); // スクロール・ズーム等のデフォルト動作を抑制

  // スコア加算
  state.score += CONFIG.EARTH_TAP_SCORE;
  state.taps++;
  updateScoreDisplay();

  // タップ位置の取得（touch / mouse 両対応）
  const point = e.touches ? e.touches[0] : e;
  showTapEffect(point.clientX, point.clientY);

  // 地球のリアクションアニメーション
  animateEarthTap();
}

/* ============================================================
   ボーナスターゲット管理
   ============================================================ */

/**
 * ボーナスターゲット（⭐）をランダム位置に出現させる
 */
function spawnBonusStar() {
  if (!state.gameRunning) return;

  const rect = EL.tapArea.getBoundingClientRect();
  const marginX = rect.width  * CONFIG.BONUS_MARGIN_RATIO;
  const marginY = rect.height * CONFIG.BONUS_MARGIN_RATIO;

  // ランダムな配置位置（エリア内マージンを確保）
  const x = marginX + Math.random() * (rect.width  - marginX * 2);
  const y = marginY + Math.random() * (rect.height - marginY * 2);

  const star = document.createElement('div');
  star.className = 'bonus-star';
  star.textContent = '⭐';
  // transform-origin の基点を中央に置くため、translate でオフセット
  star.style.left = `${x}px`;
  star.style.top  = `${y}px`;
  star.style.transform = 'translate(-50%, -50%)';

  // タップイベント
  const onTap = (e) => {
    e.stopPropagation();
    if (!state.gameRunning) return;

    // スコア加算
    state.score += CONFIG.BONUS_SCORE;
    state.taps++;
    updateScoreDisplay();

    // ポップアップ表示
    showBonusPopup(x, y - 30);

    // 取得アニメーションして削除
    star.classList.add('collected');
    removeBonusStar(star, timerId);
  };

  star.addEventListener('touchstart', onTap, { passive: false });
  star.addEventListener('click', onTap);
  EL.bonusContainer.appendChild(star);

  // ライフタイム後に自動消滅
  const timerId = setTimeout(() => {
    if (star.parentNode) {
      star.classList.add('collected');
      setTimeout(() => star.remove(), 400);
    }
    // stateリストからも除去
    state.bonusTargets = state.bonusTargets.filter(t => t.timerId !== timerId);
  }, CONFIG.BONUS_LIFETIME);

  state.bonusTargets.push({ element: star, timerId });

  // 次のボーナスをスケジュール
  scheduleNextBonus();
}

/**
 * ボーナスターゲットを即座に除去し、state リストを更新する
 * @param {HTMLElement} el
 * @param {number} timerId
 */
function removeBonusStar(el, timerId) {
  clearTimeout(timerId);
  state.bonusTargets = state.bonusTargets.filter(t => t.timerId !== timerId);
  setTimeout(() => el.remove(), 420); // collect アニメーション後に削除
}

/**
 * 次のボーナス出現をランダム時間後にスケジュールする
 */
function scheduleNextBonus() {
  if (!state.gameRunning) return;

  const delay = CONFIG.BONUS_MIN_INTERVAL +
    Math.random() * (CONFIG.BONUS_MAX_INTERVAL - CONFIG.BONUS_MIN_INTERVAL);

  state.bonusScheduleId = setTimeout(spawnBonusStar, delay);
}

/**
 * 全ボーナスターゲットを削除し、スケジュールをクリアする
 */
function clearAllBonusTargets() {
  clearTimeout(state.bonusScheduleId);
  state.bonusTargets.forEach(({ element, timerId }) => {
    clearTimeout(timerId);
    element.remove();
  });
  state.bonusTargets = [];
}

/* ============================================================
   ゲームタイマー
   ============================================================ */

/**
 * タイマー表示を更新する（100ms ごとに呼ばれる）
 * Date.now() 基準で計算するためドリフトが発生しない
 */
function updateTimer() {
  const elapsed = (Date.now() - state.gameStartTime) / 1000;
  const remaining = Math.max(0, CONFIG.GAME_DURATION - state.flyingPenalties - elapsed);

  state.timeLeft = remaining;

  const displaySec = Math.ceil(remaining);
  EL.gameTimer.textContent = displaySec;

  // 警告表示（残り3秒以下）
  EL.gameTimer.classList.toggle('warning', displaySec <= CONFIG.TIMER_WARNING_SECONDS);

  // ゲーム終了判定
  if (remaining <= 0) {
    endGame();
  }
}

/* ============================================================
   スコア表示更新
   ============================================================ */

function updateScoreDisplay() {
  EL.gameScore.textContent = state.score;
}

/* ============================================================
   カウントダウン
   ============================================================ */

/**
 * カウントダウン画面を表示してゲーム開始準備を行う
 */
function startCountdown() {
  state.flyingPenalties = 0;

  ScreenManager.show('countdown');

  let count = 3;
  updateCountdownDisplay(count);

  const intervalId = setInterval(() => {
    count--;

    if (count <= 0) {
      clearInterval(intervalId);
      // 「1」は前のティックで表示済みなので、そのまま少し待ってゲーム開始
      setTimeout(startGame, 600);
      return;
    }

    updateCountdownDisplay(count);
  }, 1000);

  // カウントダウン中のフライング検知
  const onFlying = (e) => {
    e.preventDefault();
    state.flyingPenalties = Math.min(state.flyingPenalties + 1, CONFIG.GAME_DURATION - 1);

    // フライング表示
    EL.countdownFlying.classList.remove('hidden');
    // 短時間で非表示（再度タップされたときにもアニメーションするためリセット）
    void EL.countdownFlying.offsetWidth;
    EL.countdownFlying.style.animation = 'none';
    void EL.countdownFlying.offsetWidth;
    EL.countdownFlying.style.animation = '';
  };

  SCREENS.countdown.addEventListener('touchstart', onFlying, { passive: false, once: false });
  SCREENS.countdown.addEventListener('click',      onFlying, { once: false });

  // ゲーム開始時にフライング検知を解除するためのクリーンアップ
  state._countdownCleanup = () => {
    SCREENS.countdown.removeEventListener('touchstart', onFlying);
    SCREENS.countdown.removeEventListener('click',      onFlying);
  };
}

/**
 * カウントダウン画面の数字とメッセージを更新する
 * @param {number} n - 表示する数字
 */
function updateCountdownDisplay(n) {
  // 数字を更新（アニメーション再生のためクラスをリセット）
  EL.countdownNumber.textContent = n;
  EL.countdownNumber.style.animation = 'none';
  void EL.countdownNumber.offsetWidth;
  EL.countdownNumber.style.animation = '';

  EL.countdownMessage.textContent = CONFIG.COUNTDOWN_MESSAGES[n] || '';
  EL.countdownFlying.classList.add('hidden');
}

/* ============================================================
   ゲーム開始・終了
   ============================================================ */

/**
 * ゲームを開始する
 */
function startGame() {
  // フライング検知イベントのクリーンアップ
  if (state._countdownCleanup) {
    state._countdownCleanup();
    state._countdownCleanup = null;
  }

  // 状態リセット
  state.score = 0;
  state.taps  = 0;
  state.gameRunning = true;
  state.gameStartTime = Date.now();

  // ゲーム画面を表示
  ScreenManager.show('game');

  // 表示初期化
  EL.gameHighScore.textContent = state.highScore;
  updateScoreDisplay();
  EL.gameTimer.textContent = CONFIG.GAME_DURATION;
  EL.gameTimer.classList.remove('warning');

  // ゲームタイマー（100ms ごとに更新してスムーズな表示を実現）
  state.timerIntervalId = setInterval(updateTimer, 100);

  // ボーナスターゲットの初回スケジュール
  scheduleNextBonus();
}

/**
 * ゲームを終了してリザルト画面に遷移する
 */
function endGame() {
  if (!state.gameRunning) return; // 二重呼び出し防止
  state.gameRunning = false;

  // タイマー類を全停止
  clearInterval(state.timerIntervalId);
  clearAllBonusTargets();

  // ハイスコア更新チェック
  const isNewRecord = state.score > state.highScore;
  if (isNewRecord) {
    state.highScore = state.score;
    Storage.saveHighScore(state.highScore);
  }

  // リザルト画面に遷移
  showResult(isNewRecord);
}

/* ============================================================
   リザルト画面
   ============================================================ */

/**
 * リザルト画面を表示する
 * @param {boolean} isNewRecord - ハイスコアを更新したか
 */
function showResult(isNewRecord) {
  EL.resultTaps.textContent      = state.taps;
  EL.resultScore.textContent     = state.score;
  EL.resultHighScore.textContent = state.highScore;

  EL.newRecordBadge.classList.toggle('hidden', !isNewRecord);

  ScreenManager.show('result');
}

/* ============================================================
   初期化
   ============================================================ */

/**
 * ゲーム全体の初期化
 */
function init() {
  // ハイスコア読み込み
  state.highScore = Storage.loadHighScore();
  EL.titleHighScore.textContent = state.highScore;

  // 星空を各画面に生成
  document.querySelectorAll('.stars-bg').forEach(bg => generateStars(bg));

  // ======================================
  // イベントリスナー登録
  // ======================================

  // タイトル：START ボタン
  EL.btnStart.addEventListener('click', () => {
    startCountdown();
  });

  // ゲーム画面：画面全体タップでスコア加算
  // ボーナスターゲットは stopPropagation するため二重加算にならない
  EL.tapArea.addEventListener('touchstart', onTapAreaTap, { passive: false });
  EL.tapArea.addEventListener('click',      onTapAreaTap);

  // リザルト：もう一度ボタン
  EL.btnRetry.addEventListener('click', () => {
    startCountdown();
  });

  // 地球タップアニメーション終了時のみクラスを削除
  // earth-float は infinite なので animationend が発火しないが、念のため名前で判定する
  EL.earthTarget.addEventListener('animationend', (e) => {
    if (e.animationName === 'earth-tap-anim') {
      EL.earthTarget.classList.remove('tapping');
    }
  });

  // タイトル画面を表示
  ScreenManager.show('title');
}

/* ============================================================
   エントリーポイント
   ============================================================ */
document.addEventListener('DOMContentLoaded', init);
