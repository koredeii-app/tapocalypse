/**
 * GameScreen — 創造/破壊 選択画面
 */

import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import styles from './GameScreen.module.css';

function GameScreen({ visible, gameState, onCreate, onDestroy }) {
  const { t } = useI18n();
  const { creationPoints, destructionPoints, currentStage } = gameState;

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      {/* ─── ステータス ─── */}
      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>{t('creation')}</span>
          <span className={`${styles.statValue} ${styles.creation}`}>
            {creationPoints.toLocaleString()}
          </span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>{t('destruction')}</span>
          <span className={`${styles.statValue} ${styles.destruction}`}>
            {destructionPoints.toLocaleString()}
          </span>
        </div>
        <div className={`${styles.statRow} ${styles.stageRow}`}>
          <span className={styles.statLabel}>{t('stage')}</span>
          <span className={`${styles.statValue} ${styles.stage}`}>
            {currentStage}
          </span>
        </div>
      </div>

      {/* ─── 選択ボタン ─── */}
      <div className={styles.buttons}>
        <button
          className={`${styles.btn} ${styles.btnCreate}`}
          onPointerDown={onCreate}
        >
          <span className={styles.btnIcon}>✨</span>
          <span className={styles.btnLabel}>{t('create')}</span>
        </button>

        <button
          className={`${styles.btn} ${styles.btnDestroy}`}
          onPointerDown={onDestroy}
        >
          <span className={styles.btnIcon}>💀</span>
          <span className={styles.btnLabel}>{t('destroy')}</span>
        </button>
      </div>
    </div>
  );
}

export default GameScreen;
