/**
 * GameScreen - ゲームプレイ画面
 *
 * - 上部ヘッダー: 残り時間 / スコア / ハイスコア
 * - 中央: 地球ターゲット 🌍
 * - 画面全体タップで +1
 * - タップ位置に 💥 エフェクト（DOM 直操作でパフォーマンスを確保）
 *
 * 将来のモード拡張:
 *   - ターゲット要素の差し替え（Earth → 別の絵文字やスプライト）
 *   - ヘッダーに属性インジケーターを追加
 *   - 移動ターゲットは別コンポーネントとして overlay 追加
 */

import { useRef, useCallback } from 'react';
import StarBackground from '../ui/StarBackground';
import TapEffectLayer from '../ui/TapEffectLayer';
import { GAME_CONFIG } from '../../game/config';
import styles from './GameScreen.module.css';

/**
 * @param {{
 *   visible:   boolean,
 *   score:     number,
 *   timeLeft:  number,
 *   highScore: number,
 *   onTap:     () => { isValid: boolean } | null,
 * }} props
 */
function GameScreen({ visible, score, timeLeft, highScore, onTap }) {
  const tapEffectRef = useRef(null);
  const earthRef     = useRef(null);
  const earthTimerRef = useRef(null);

  // 残り時間の表示（小数点以下切り上げ、0 は 0 で表示）
  const displayTime = Math.ceil(timeLeft);

  // 残り TIMER_WARNING_THRESHOLD 秒以下で警告色
  const isWarning = displayTime <= GAME_CONFIG.TIMER_WARNING_THRESHOLD;

  // ─────────────────────────────────────────────
  // 地球のバウンスアニメーション
  // ─────────────────────────────────────────────

  const animateEarth = useCallback(() => {
    const earth = earthRef.current;
    if (!earth) return;

    // 同じクラスを追加しても再生されないため、一度外してから付け直す
    earth.classList.remove(styles.earthTapping);
    void earth.offsetWidth; // リフローを強制してアニメーションをリセット
    earth.classList.add(styles.earthTapping);

    // アニメーション終了後にクラスを外す（次のタップで再発火できるように）
    clearTimeout(earthTimerRef.current);
    earthTimerRef.current = setTimeout(() => {
      earth?.classList.remove(styles.earthTapping);
    }, 220); // CSS アニメーション 0.2s に少しバッファ
  }, []);

  // ─────────────────────────────────────────────
  // タップハンドラ
  // ─────────────────────────────────────────────

  const handlePointerDown = useCallback((e) => {
    e.preventDefault(); // スクロール等のデフォルト動作を抑制

    // ゲームロジック（スコア加算）
    const result = onTap();
    if (!result?.isValid) return;

    // 💥 エフェクト（DOM 直操作）
    tapEffectRef.current?.addEffect(e.clientX, e.clientY);

    // 地球アニメーション
    animateEarth();
  }, [onTap, animateEarth]);

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      {/* ─── ヘッダー ─── */}
      <header className={`${styles.header} safe-top`}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>残り時間</span>
          <span className={`${styles.statValue} ${isWarning ? styles.warning : ''}`}>
            {displayTime}
          </span>
        </div>

        <div className={`${styles.statBox} ${styles.statBoxCenter}`}>
          <span className={styles.statLabel}>スコア</span>
          <span className={`${styles.statValue} ${styles.scoreValue}`}>{score}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>BEST</span>
          <span className={styles.statValue}>{highScore}</span>
        </div>
      </header>

      {/* ─── タップエリア（画面全体） ─── */}
      <main
        className={styles.tapArea}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        {/* 地球ターゲット（中央に固定） */}
        <div
          ref={earthRef}
          className={styles.earth}
          aria-label="タップターゲット"
        >
          🌍
        </div>
      </main>

      {/* 💥 エフェクトレイヤー（pointer-events: none） */}
      <TapEffectLayer ref={tapEffectRef} />
    </div>
  );
}

export default GameScreen;
