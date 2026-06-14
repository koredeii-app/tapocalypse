/**
 * ResultScreen - ゲーム結果画面
 *
 * 表示: タイトル / 総スコア / ハイスコア更新有無 / もう一度 / タイトルへ戻る
 */

import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './ResultScreen.module.css';

/**
 * @param {{
 *   visible:    boolean,
 *   resultData: { score: number, taps: number, isNewRecord: boolean } | null,
 *   highScore:  number,
 *   onRetry:    () => void,
 *   onTitle:    () => void,
 * }} props
 */
function ResultScreen({ visible, resultData, highScore, onRetry, onTitle }) {
  // resultData が null のうちは何も表示しない
  if (!resultData) return null;

  const { score, isNewRecord } = resultData;

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>Tapocalypse</h1>

        {/* ハイスコア更新バッジ */}
        {isNewRecord && (
          <div className={styles.newRecord}>🏆 NEW RECORD!</div>
        )}

        {/* スコア表示 */}
        <div className={styles.statsBox}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>総スコア</span>
            <span className={`${styles.statValue} ${styles.scoreValue}`}>
              {score}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>BEST SCORE</span>
            <span className={styles.statValue}>
              {highScore}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className={styles.buttons}>
          <NeonButton onClick={onRetry}>もう一度！</NeonButton>
          <NeonButton onClick={onTitle} variant="secondary">タイトルへ</NeonButton>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
