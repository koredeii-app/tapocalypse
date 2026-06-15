/**
 * GameScreen — ゲーム画面
 *
 * 元のタップUI（🌱 タップエリア）を基本とし、
 * 上部に 創造/破壊 の属性切替ボタンを追加。
 * 属性ボタンのタップは onModeChange のみ呼ばれ、ゲームタップには加算されない。
 */

import { useRef, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import StarBackground from '../ui/StarBackground';
import TapEffectLayer from '../ui/TapEffectLayer';
import styles from './GameScreen.module.css';

function GameScreen({
  visible,
  tapMode,
  creationPoints,
  destructionPoints,
  totalPoints,
  timeLeft,
  onTap,
  onModeChange,
}) {
  const { t } = useI18n();
  const tapEffectRef = useRef(null);

  // タップエリア全体の PointerDown — 属性ボタン以外で発火
  const handlePointerDown = useCallback((e) => {
    const result = onTap?.();
    if (result?.isValid && tapEffectRef.current) {
      tapEffectRef.current.addEffect(e.clientX, e.clientY, tapMode);
    }
  }, [onTap, tapMode]);

  // 属性切替ボタン — stopPropagation でタップに加算させない
  const handleModePointerDown = useCallback((e, mode) => {
    e.stopPropagation();
    onModeChange?.(mode);
  }, [onModeChange]);

  const timeDisplay = Math.ceil(timeLeft);

  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      {/* ─── 属性切替 ─── */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${styles.modeBtnCreate} ${tapMode === 'creation' ? styles.active : ''}`}
          onPointerDown={e => handleModePointerDown(e, 'creation')}
        >
          <span className={styles.modeIcon}>✨</span>
          <span className={styles.modeLabel}>{t('creation')}</span>
        </button>
        <button
          className={`${styles.modeBtn} ${styles.modeBtnDestroy} ${tapMode === 'destruction' ? styles.active : ''}`}
          onPointerDown={e => handleModePointerDown(e, 'destruction')}
        >
          <span className={styles.modeIcon}>💀</span>
          <span className={styles.modeLabel}>{t('destruction')}</span>
        </button>
      </div>

      {/* ─── ヘッダー（スコア表示） ─── */}
      <div className={styles.header}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('timeLeft')}</span>
          <span className={`${styles.statValue} ${timeDisplay <= 3 ? styles.danger : ''}`}>
            {timeDisplay}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('creation')}</span>
          <span className={`${styles.statValue} ${styles.creation}`}>
            {creationPoints}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('destruction')}</span>
          <span className={`${styles.statValue} ${styles.destruction}`}>
            {destructionPoints}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('total')}</span>
          <span className={styles.statValue}>{totalPoints}</span>
        </div>
      </div>

      {/* ─── タップエリア ─── */}
      <div className={styles.tapArea} onPointerDown={handlePointerDown}>
        <div className={`${styles.earthWrap} ${tapMode === 'destruction' ? styles.earthDestructMode : ''}`}>
          <div className={styles.earthGlow} />
          <div className={styles.earth}>🌱</div>
        </div>

        <TapEffectLayer ref={tapEffectRef} />
      </div>
    </div>
  );
}

export default GameScreen;
