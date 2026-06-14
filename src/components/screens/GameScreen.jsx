/**
 * GameScreen - ゲームプレイ画面
 */

import { useRef, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import TapEffectLayer from '../ui/TapEffectLayer';
import { GAME_CONFIG } from '../../game/config';
import styles from './GameScreen.module.css';

function GameScreen({ visible, score, timeLeft, highScore, onTap }) {
  const { t } = useI18n();
  const tapEffectRef  = useRef(null);
  const earthRef      = useRef(null);
  const earthTimerRef = useRef(null);

  const displayTime = Math.ceil(timeLeft);
  const isWarning   = displayTime <= GAME_CONFIG.TIMER_WARNING_THRESHOLD;

  const animateEarth = useCallback(() => {
    const earth = earthRef.current;
    if (!earth) return;
    earth.classList.remove(styles.earthTapping);
    void earth.offsetWidth;
    earth.classList.add(styles.earthTapping);
    clearTimeout(earthTimerRef.current);
    earthTimerRef.current = setTimeout(() => {
      earth?.classList.remove(styles.earthTapping);
    }, 220);
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const result = onTap();
    if (!result?.isValid) return;
    tapEffectRef.current?.addEffect(e.clientX, e.clientY);
    animateEarth();
  }, [onTap, animateEarth]);

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <header className={`${styles.header} safe-top`}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>{t('timeLeft')}</span>
          <span className={`${styles.statValue} ${isWarning ? styles.warning : ''}`}>
            {displayTime}
          </span>
        </div>

        <div className={`${styles.statBox} ${styles.statBoxCenter}`}>
          <span className={styles.statLabel}>{t('score')}</span>
          <span className={`${styles.statValue} ${styles.scoreValue}`}>{score}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>{t('best')}</span>
          <span className={styles.statValue}>{highScore}</span>
        </div>
      </header>

      <main
        className={styles.tapArea}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        <div ref={earthRef} className={styles.earth} aria-label="タップターゲット">
          🌍
        </div>

        <div key={visible} className={styles.tapBanner}>TAP!!</div>
      </main>

      <TapEffectLayer ref={tapEffectRef} />
    </div>
  );
}

export default GameScreen;
