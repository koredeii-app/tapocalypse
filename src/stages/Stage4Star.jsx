/**
 * Stage 4「星」 — 惑星をドラッグして軌道リングに乗せるチュートリアル
 * 軌道リング（中央から ORBIT_RADIUS px の円）に乗せたらクリア
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Stage4Star.module.css';

const ORBIT_RADIUS = 110; // px
const SNAP_TOLERANCE = 45; // px

function Stage4Star({ active, onClear }) {
  // 惑星の初期位置（左上付近）
  const [planetPos, setPlanetPos] = useState({ x: 70, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedAngle, setPlacedAngle] = useState(0);
  const clearedRef = useRef(false);
  const startPosRef = useRef({ x: 70, y: 120 });

  // 軌道アニメーション（配置後）
  useEffect(() => {
    if (!isPlaced) return;

    let angle = placedAngle;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const interval = setInterval(() => {
      angle += 0.04;
      setPlanetPos({
        x: cx + ORBIT_RADIUS * Math.cos(angle),
        y: cy + ORBIT_RADIUS * Math.sin(angle),
      });
    }, 30);

    const timer = setTimeout(() => {
      clearInterval(interval);
      if (!clearedRef.current) {
        clearedRef.current = true;
        onClear();
      }
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isPlaced, placedAngle, onClear]);

  const handlePlanetPointerDown = useCallback((e) => {
    e.stopPropagation();
    if (!active || isPlaced) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [active, isPlaced]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isPlaced) return;
    setPlanetPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, isPlaced]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

    if (Math.abs(dist - ORBIT_RADIUS) < SNAP_TOLERANCE) {
      // 軌道にスナップ
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      setPlacedAngle(angle);
      setPlanetPos({
        x: cx + ORBIT_RADIUS * Math.cos(angle),
        y: cy + ORBIT_RADIUS * Math.sin(angle),
      });
      setIsPlaced(true);
    } else {
      // 軌道外 → 元の位置へ戻す
      setPlanetPos(startPosRef.current);
    }
  }, [isDragging]);

  return (
    <div
      className={styles.stage}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 軌道リング */}
      <div
        className={styles.orbitRing}
        style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
      />

      {/* 恒星（中央固定） */}
      <div className={styles.star}>☀️</div>

      {/* 惑星（ドラッグ可能） */}
      <div
        className={`${styles.planet} ${isDragging ? styles.dragging : ''} ${isPlaced ? styles.orbiting : ''}`}
        style={{ left: planetPos.x, top: planetPos.y }}
        onPointerDown={handlePlanetPointerDown}
      >
        🌍
      </div>

      {/* ヒント */}
      {!isPlaced && !isDragging && (
        <div className={styles.hint}>惑星をドラッグして<br />点線の軌道へ運ぼう</div>
      )}
    </div>
  );
}

export default Stage4Star;
