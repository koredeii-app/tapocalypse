/**
 * TitleScreen - タイトル画面
 */

import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './TitleScreen.module.css';

function TitleScreen({ visible, highScore, onStart }) {
  const { t } = useI18n();

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>{t('appName')}</h1>
        <p  className={styles.subtitle}>{t('tagline')}</p>

        <div className={styles.highScoreBox}>
          <span className={styles.highScoreLabel}>{t('bestScore')}</span>
          <span className={styles.highScoreValue}>{highScore}</span>
        </div>

        <NeonButton onClick={onStart}>{t('start')}</NeonButton>
      </div>
    </div>
  );
}

export default TitleScreen;
