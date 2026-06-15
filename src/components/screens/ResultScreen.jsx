/**
 * ResultScreen - ゲーム結果画面
 *
 * 表示: 到達ステージ / 到達スコア / プレイ時間
 */

import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './ResultScreen.module.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

function ResultScreen({ visible, resultData, onRetry, onTitle }) {
  if (!resultData) return null;

  const { score, stage, stageName, playTime } = resultData;

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>GAME OVER</h1>

        <div className={styles.statsBox}>
          <div className={`${styles.statRow} ${styles.stageRow}`}>
            <span className={styles.statLabel}>到達ステージ</span>
            <span className={`${styles.statValue} ${styles.stageValue}`}>
              Stage {stage}
              <span className={styles.stageName}>{stageName}</span>
            </span>
          </div>

          <div className={`${styles.statRow} ${styles.scoreRow}`}>
            <span className={styles.statLabel}>スコア</span>
            <span className={`${styles.statValue} ${styles.scoreValue}`}>
              {score.toLocaleString()}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>プレイ時間</span>
            <span className={styles.statValue}>
              {formatTime(playTime)}
            </span>
          </div>
        </div>

        <div className={styles.buttons}>
          <NeonButton onClick={onRetry}>もう一度！</NeonButton>
          <NeonButton onClick={onTitle} variant="secondary">タイトルへ</NeonButton>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
