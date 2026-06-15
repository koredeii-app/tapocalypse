/**
 * Stage 2「光」 — 長押しでゲージを満たして恒星を誕生させるチュートリアル
 * ゲージ100%でクリア。離すとゲージはゆっくり減少する
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Stage2Light.module.css';

const FILL_RATE  = 2.5;  // %/100ms（4秒で満タン）
const DRAIN_RATE = 1.0;  // %/100ms（10秒で空）

function Stage2Light({ active, onClear }) {
  const [gauge, setGauge] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [starBorn, setStarBorn] = useState(false);
  const isHoldingRef = useRef(false);
  const clearedRef = useRef(false);

  // ゲージ更新ループ
  useEffect(() => {
    const interval = setInterval(() => {
      if (!active) return;
      setGauge(prev => {
        if (prev >= 100) return 100;
        const next = isHoldingRef.current
          ? Math.min(100, prev + FILL_RATE)
          : Math.max(0, prev - DRAIN_RATE);

        if (next >= 100 && !clearedRef.current) {
          clearedRef.current = true;
          setStarBorn(true);
          setTimeout(() => onClear(), 1200);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [active, onClear]);

  const startHold = useCallback(() => {
    if (!active || clearedRef.current) return;
    isHoldingRef.current = true;
    setIsHolding(true);
  }, [active]);

  const endHold = useCallback(() => {
    isHoldingRef.current = false;
    setIsHolding(false);
  }, []);

  return (
    <div
      className={styles.stage}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
    >
      {/* 背景の浮遊光 */}
      <div className={styles.ambientGlow} />

      {/* 中央のホールドエリア */}
      <div className={`${styles.holdArea} ${isHolding ? styles.holding : ''} ${starBorn ? styles.starBorn : ''}`}>
        {starBorn ? (
          <div className={styles.starEmoji}>⭐</div>
        ) : (
          <div className={styles.holdIcon}>{isHolding ? '💫' : '✋'}</div>
        )}
      </div>

      {/* ゲージバー（垂直） */}
      <div className={styles.gaugeWrap}>
        <div className={styles.gaugeTrack}>
          <div
            className={`${styles.gaugeFill} ${isHolding ? styles.filling : ''}`}
            style={{ height: `${gauge}%` }}
          />
        </div>
        <div className={styles.gaugeLabel}>{Math.floor(gauge)}%</div>
      </div>

    </div>
  );
}

export default Stage2Light;
