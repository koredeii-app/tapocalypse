/**
 * Stage 5「惑星」 — 惑星を縦横に回転させて生命の芽を探す
 * - 1本指ドラッグ → 水平・垂直に回転
 * - 🌱 が正面に来たらタップしてクリア
 */

import { useState, useRef, useCallback } from 'react';
import { SoundManager } from '../audio/SoundManager';
import styles from './Stage5Planet.module.css';

const PLANET_RADIUS = 100; // px（wrapper は 200×200）
const DRAG_SENS     = Math.PI / PLANET_RADIUS; // 1px ≈ 0.0314 rad

/** 初期正面（0,0）から十分離れたランダム角度を返す */
function randomBudAngles() {
  let h, v;
  do {
    h = (Math.random() * 2 - 1) * Math.PI;           // -π ～ π
    v = (Math.random() * 2 - 1) * (Math.PI * 0.45);  // ±0.45π
  } while (Math.abs(h) < 1.4 && Math.abs(v) < 0.7);  // 正面付近は除外
  return { h, v };
}

function Stage5Planet({ active, onClear }) {
  const [hRad,     setHRad]     = useState(0);
  const [vRad,     setVRad]     = useState(0);
  const [budFound, setBudFound] = useState(false);
  const hRadRef    = useRef(0);
  const vRadRef    = useRef(0);
  const clearedRef = useRef(false);
  const activePtr  = useRef(null);

  // 生命の芽の 3D 角度（マウント時一度だけ決定）
  const budRef = useRef(null);
  if (!budRef.current) budRef.current = randomBudAngles();

  // ── 3D 球面投影: 芽の画面座標と可視判定 ─────────────────────────────
  const dH   = budRef.current.h - hRad;
  const dV   = budRef.current.v - vRad;
  const cosH = Math.cos(dH);
  const cosV = Math.cos(dV);
  const budX = PLANET_RADIUS * Math.sin(dH) * cosV;
  const budY = PLANET_RADIUS * Math.sin(dV);
  const budVisible =
    cosH > 0.08 &&
    cosV > 0.08 &&
    Math.hypot(budX, budY) < PLANET_RADIUS * 0.88;

  // ── ドラッグ → 水平・垂直回転 ────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (!active || clearedRef.current) return;
    activePtr.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [active]);

  const handlePointerMove = useCallback((e) => {
    if (!activePtr.current || activePtr.current.id !== e.pointerId) return;
    const dx   = e.clientX - activePtr.current.x;
    const dy   = e.clientY - activePtr.current.y;
    const newH = hRadRef.current + dx * DRAG_SENS;
    const newV = vRadRef.current + dy * DRAG_SENS;
    hRadRef.current = newH;
    vRadRef.current = newV;
    setHRad(newH);
    setVRad(newV);
    activePtr.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (activePtr.current?.id === e.pointerId) activePtr.current = null;
  }, []);

  // ── 🌱 タップ → クリア ─────────────────────────────────────────────
  const handleBudTap = useCallback((e) => {
    e.stopPropagation();
    if (!budVisible || budFound || clearedRef.current || !active) return;
    clearedRef.current = true;
    setBudFound(true);
    SoundManager.playCollect();
    setTimeout(() => onClear(), 900);
  }, [budVisible, budFound, active, onClear]);

  // テクスチャオフセット（表面が回転して見える演出）
  const bgX = -(hRad * (400 / (Math.PI * 2)));
  const bgY = -(vRad * (200 / Math.PI));

  return (
    <div
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={styles.planetWrapper}>
        {/* 惑星テクスチャ（回転でスクロール） */}
        <div
          className={styles.planet}
          style={{ '--bgX': `${bgX}px`, '--bgY': `${bgY}px` }}
        />
        {/* 固定の光源シェーディング（3D 球体感） */}
        <div className={styles.planetShading} />

        {/* 生命の芽（正面に来たときのみ表示） */}
        {budVisible && (
          <div
            className={`${styles.bud} ${budFound ? styles.budFound : ''}`}
            style={{
              left: `${PLANET_RADIUS + budX}px`,
              top:  `${PLANET_RADIUS + budY}px`,
            }}
            onPointerDown={handleBudTap}
          >
            🌱
          </div>
        )}
      </div>
    </div>
  );
}

export default Stage5Planet;
