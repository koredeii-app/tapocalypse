/**
 * CountdownScreen - カウントダウン画面
 */

import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import styles from './CountdownScreen.module.css';

function CountdownScreen({ visible, countdownValue, showFlying, onTap }) {
  const { t } = useI18n();

  return (
    <div
      className={`screen ${visible ? 'active' : ''} ${styles.screen}`}
      onPointerDown={onTap}
    >
      <StarBackground />

      <div className={styles.content}>
        <div className={styles.number} key={countdownValue}>
          {countdownValue}
        </div>

        <div className={styles.message}>
          {t(`countdown${countdownValue}`)}
        </div>

        {showFlying && (
          <div className={styles.flyingAlert}>
            <span>{t('flying')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountdownScreen;
