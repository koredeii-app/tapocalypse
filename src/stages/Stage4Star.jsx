/**
 * Stage 4「星」 — 惑星をドラッグして軌道リングに乗せる
 * 惑星の初期位置は毎回ランダム。
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Stage4Star.module.css';

const ORBIT_RADIUS   = 110;
const SNAP_TOLERANCE = 45;

/** 惑星の初期位置をランダムに決定（軌道圏外、画面内に収める） */
function randomStartPos() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = ORBIT_RADIUS + 80 + Math.random() * 100;
    const x     = cx + dist * Math.cos(angle);
    const y     = cy + dist * Math.sin(angle);
    if (x > 50 && x < window.innerWidth - 50 && y > 80 && y < window.innerHeight - 80) {
      return { x: Math.round(x), y: Math.round(y) };
    }
  }
  return { x: 70, y: 120 }; // フォールバック
}

function Stage4Star({ active, onClear }) {
  // 初期位置を一度だけ計算してrefとstateに保持
  const initPos = useRef(null);
  if (!initPos.current) initPos.current = randomStartPos();

  const [planetPos,  setPlanetPos]  = useState(initPos.current);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaced,   setIsPlaced]   = useState(false);
  const [placedAngle, setPlacedAngle] = useState(0);
  const clearedRef = useRef(false);

  // 軌道アニメーション（配置後）
  useEffect(() => {
    if (!isPlaced) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    let angle = placedAngle;

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

    return () => { clearInterval(interval); clearTimeout(timer); };
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

    const cx   = window.innerWidth  / 2;
    const cy   = window.innerHeight / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

    if (Math.abs(dist - ORBIT_RADIUS) < SNAP_TOLERANCE) {
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      setPlacedAngle(angle);
      setPlanetPos({
        x: cx + ORBIT_RADIUS * Math.cos(angle),
        y: cy + ORBIT_RADIUS * Math.sin(angle),
      });
      setIsPlaced(true);
    } else {
      setPlanetPos(initPos.current); // 失敗 → 元の位置へ戻す
    }
  }, [isDragging]);

  return (
    <div
      className={styles.stage}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={styles.orbitRing}
        style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
      />
      <div className={styles.star}>☀️</div>
      <div
        className={`${styles.planet} ${isDragging ? styles.dragging : ''} ${isPlaced ? styles.orbiting : ''}`}
        style={{ left: planetPos.x, top: planetPos.y }}
        onPointerDown={handlePlanetPointerDown}
      >
        🌍
      </div>
    </div>
  );
}

export default Stage4Star;
