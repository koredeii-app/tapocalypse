/**
 * Stage 2「光」 — 長押しで円の中心から光が広がり、満たしたらクリア
 * ゲージはキャンバス上の放射グラデーションで表現。
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Stage2Light.module.css';

const FILL_RATE  = 2.5;  // %/100ms（4秒で満タン）
const DRAIN_RATE = 1.0;  // %/100ms（10秒で空）
const CANVAS_SIZE = 200;

function Stage2Light({ active, onClear }) {
  const [starBorn,   setStarBorn]   = useState(false);
  const [isHolding,  setIsHolding]  = useState(false);
  const isHoldingRef = useRef(false);
  const gaugeRef     = useRef(0);
  const clearedRef   = useRef(false);
  const canvasRef    = useRef(null);

  // ── キャンバスに放射グラデーションを描画 ──────────────────────────────
  const drawGauge = useCallback((g) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx  = CANVAS_SIZE / 2;
    const cy  = CANVAS_SIZE / 2;
    const maxR = CANVAS_SIZE / 2;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (g <= 0) return;

    const r      = maxR * (g / 100);
    const glowR  = Math.min(r * 1.25, maxR); // 外縁のソフトグロー

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    grad.addColorStop(0,    'rgba(240, 248, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(180, 205, 255, 0.96)');
    grad.addColorStop(0.55, 'rgba(100, 130, 255, 0.80)');
    grad.addColorStop(0.82, 'rgba(55,  80,  240, 0.45)');
    grad.addColorStop(1.0,  'rgba(30,  55,  220, 0.0)');

    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }, []);

  // ── ゲージ更新ループ ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (!active || clearedRef.current) return;

      const next = isHoldingRef.current
        ? Math.min(100, gaugeRef.current + FILL_RATE)
        : Math.max(0,   gaugeRef.current - DRAIN_RATE);

      gaugeRef.current = next;
      drawGauge(next);

      if (next >= 100 && !clearedRef.current) {
        clearedRef.current = true;
        setStarBorn(true);
        setTimeout(() => onClear(), 1200);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [active, onClear, drawGauge]);

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
      <div className={styles.ambientGlow} />

      <div className={`${styles.holdArea} ${isHolding ? styles.holding : ''} ${starBorn ? styles.starBorn : ''}`}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={styles.gaugeCanvas}
        />
        {starBorn && (
          <div className={styles.starEmoji}>⭐</div>
        )}
      </div>
    </div>
  );
}

export default Stage2Light;
