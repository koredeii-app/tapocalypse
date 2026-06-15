/**
 * ResultScreen - ゲーム結果画面
 *
 * セッションの 創造/破壊/合計 と累計ステージを表示する。
 */

import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './ResultScreen.module.css';

function ResultScreen({ visible, resultData, onRetry, onTitle }) {
  const { t } = useI18n();

  if (!resultData) return null;

  const { creationPoints, destructionPoints, totalPoints, currentStage } = resultData;

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>{t('appName')}</h1>

        <div className={styles.statsBox}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('creation')}</span>
            <span className={`${styles.statValue} ${styles.creation}`}>
              {creationPoints}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('destruction')}</span>
            <span className={`${styles.statValue} ${styles.destruction}`}>
              {destructionPoints}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={`${styles.statRow} ${styles.totalRow}`}>
            <span className={styles.statLabel}>{t('total')}</span>
            <span className={`${styles.statValue} ${styles.total}`}>
              {totalPoints}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={`${styles.statRow} ${styles.stageRow}`}>
            <span className={styles.statLabel}>{t('stage')}</span>
            <span className={`${styles.statValue} ${styles.stage}`}>
              {currentStage}
            </span>
          </div>
        </div>

        <div className={styles.buttons}>
          <NeonButton onClick={onRetry}>{t('playAgain')}</NeonButton>
          <NeonButton onClick={onTitle} variant="secondary">{t('backToTitle')}</NeonButton>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
