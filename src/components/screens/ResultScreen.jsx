/**
 * ResultScreen - ゲーム結果画面
 */

import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './ResultScreen.module.css';

function ResultScreen({ visible, resultData, highScore, onRetry, onTitle }) {
  const { t } = useI18n();

  if (!resultData) return null;

  const { score, isNewRecord } = resultData;

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>{t('appName')}</h1>

        {isNewRecord && (
          <div className={styles.newRecord}>{t('newRecord')}</div>
        )}

        <div className={styles.statsBox}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('totalScore')}</span>
            <span className={`${styles.statValue} ${styles.scoreValue}`}>
              {score}
              <span className={styles.statUnit}>pt</span>
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('bestScore')}</span>
            <span className={styles.statValue}>
              {highScore}
              <span className={styles.statUnit}>pt</span>
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
