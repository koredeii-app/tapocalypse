/**
 * GameScreen — ゲーム画面
 *
 * レイアウト:
 *   ─ ヘッダー（ステージ・スコア・倍率・残り時間・進捗バー）
 *   ─ タップエリア（全画面）
 *   ─ ステージアップ通知（オーバーレイ）
 *   ─ 属性切替ボタン（下部固定）
 *
 * 全画面タップを実現するため、onPointerDown を最外 div に設定する。
 * 下部ボタンは stopPropagation でスコア加算をブロックする。
 */

import { useRef, useCallback } from 'react';
import StarBackground from '../ui/StarBackground';
import TapEffectLayer from '../ui/TapEffectLayer';
import styles from './GameScreen.module.css';

function GameScreen({
  visible,
  score,
  currentStage,
  stageName,
  stageEmoji,
  multiplier,
  timeLeft,
  tapMode,
  stageUpNotify,
  currentThreshold,
  nextThreshold,
  onTap,
  onModeChange,
}) {
  const tapEffectRef = useRef(null);

  // 全画面ポインターダウン → スコア加算
  const handlePointerDown = useCallback((e) => {
    const result = onTap?.();
    if (result?.isValid && tapEffectRef.current) {
      tapEffectRef.current.addEffect(e.clientX, e.clientY, tapMode);
    }
  }, [onTap, tapMode]);

  // 属性ボタン → stopPropagation でスコア加算をブロック
  const handleModePointerDown = useCallback((e, mode) => {
    e.stopPropagation();
    onModeChange?.(mode);
  }, [onModeChange]);

  const timeDisplay = Math.ceil(timeLeft);
  const progress = nextThreshold != null
    ? Math.min(100, Math.max(0, ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;

  return (
    <div
      className={`screen ${visible ? 'active' : ''} ${styles.screen}`}
      onPointerDown={handlePointerDown}
    >
      <StarBackground />

      {/* ─── ヘッダー ─── */}
      <div className={styles.header}>
        <div className={styles.stageRow}>
          <span className={styles.stageNum}>Stage {currentStage}</span>
          <span className={styles.stageName}>{stageName}</span>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>MULT</span>
            <span className={`${styles.statValue} ${styles.multiplierValue}`}>x{multiplier}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>TIME</span>
            <span className={`${styles.statValue} ${timeDisplay <= 3 ? styles.danger : ''}`}>
              {timeDisplay}
            </span>
          </div>
        </div>

        {/* 次ステージへの進捗バー */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ─── タップエリア（中央絵文字） ─── */}
      <div className={styles.tapArea}>
        <div className={`${styles.emojiWrap} ${tapMode === 'destruction' ? styles.destructMode : ''}`}>
          <div className={styles.emojiGlow} />
          <div className={styles.emoji}>{stageEmoji}</div>
        </div>
        <TapEffectLayer ref={tapEffectRef} />
      </div>

      {/* ─── ステージアップ通知 ─── */}
      {stageUpNotify && (
        <div className={styles.stageUpOverlay}>
          <div className={styles.stageUpBadge}>
            <span className={styles.stageUpLabel}>ステージアップ！</span>
            <span className={styles.stageUpName}>{stageUpNotify.name}</span>
            {stageUpNotify.bonus > 0 && (
              <span className={styles.stageUpBonus}>+{stageUpNotify.bonus} pt</span>
            )}
          </div>
        </div>
      )}

      {/* ─── 属性切替ボタン（下部） ─── */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeBtn} ${styles.modeBtnCreate} ${tapMode === 'creation' ? styles.active : ''}`}
          onPointerDown={e => handleModePointerDown(e, 'creation')}
        >
          <span className={styles.modeIcon}>✨</span>
          <span className={styles.modeLabel}>創造</span>
        </button>
        <button
          className={`${styles.modeBtn} ${styles.modeBtnDestroy} ${tapMode === 'destruction' ? styles.active : ''}`}
          onPointerDown={e => handleModePointerDown(e, 'destruction')}
        >
          <span className={styles.modeIcon}>💀</span>
          <span className={styles.modeLabel}>破壊</span>
        </button>
      </div>
    </div>
  );
}

export default GameScreen;
