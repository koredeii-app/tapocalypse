/**
 * Stage 3「物質」 — スワイプで散らばった物質パーティクルを集めるチュートリアル
 * 30個集めたらクリア
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import styles from './Stage3Matter.module.css';

const TOTAL_PARTICLES = 50;
const TARGET          = 30;
const COLLECT_RADIUS  = 28; // px

/** 初期パーティクルを画面全体にランダム配置 */
function generateParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const margin = 40;
  return Array.from({ length: TOTAL_PARTICLES }, (_, i) => ({
    id: i,
    x: margin + Math.random() * (w - margin * 2),
    y: margin + Math.random() * (h - margin * 2),
    collected: false,
  }));
}

function Stage3Matter({ active, onClear }) {
  const initialParticles = useMemo(() => generateParticles(), []);
  const particlesRef = useRef(initialParticles);
  const [renderParticles, setRenderParticles] = useState(initialParticles);
  const [collectedCount, setCollectedCount] = useState(0);
  const collectedRef = useRef(0);
  const clearedRef = useRef(false);
  const isPointerDown = useRef(false);

  const collectNear = useCallback((cx, cy) => {
    if (!active || clearedRef.current) return;

    let changed = false;
    let added = 0;

    particlesRef.current = particlesRef.current.map(p => {
      if (p.collected) return p;
      const dist = Math.hypot(p.x - cx, p.y - cy);
      if (dist < COLLECT_RADIUS) {
        added++;
        changed = true;
        return { ...p, collected: true };
      }
      return p;
    });

    if (changed) {
      collectedRef.current += added;
      setRenderParticles([...particlesRef.current]);
      setCollectedCount(collectedRef.current);

      if (collectedRef.current >= TARGET) {
        clearedRef.current = true;
        setTimeout(() => onClear(), 600);
      }
    }
  }, [active, onClear]);

  const handlePointerDown = useCallback((e) => {
    isPointerDown.current = true;
    collectNear(e.clientX, e.clientY);
  }, [collectNear]);

  const handlePointerMove = useCallback((e) => {
    if (!isPointerDown.current) return;
    collectNear(e.clientX, e.clientY);
  }, [collectNear]);

  const handlePointerUp = useCallback(() => {
    isPointerDown.current = false;
  }, []);

  const pct = Math.min(100, (collectedCount / TARGET) * 100);

  return (
    <div
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 物質パーティクル */}
      {renderParticles.map(p => (
        <div
          key={p.id}
          className={`${styles.particle} ${p.collected ? styles.collected : ''}`}
          style={{ left: p.x, top: p.y }}
        />
      ))}

      {/* 収集カウンター */}
      <div className={styles.counter}>
        <span className={styles.countNum}>{collectedCount}</span>
        <span className={styles.countDivider}>/</span>
        <span className={styles.countTotal}>{TARGET}</span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* ヒント */}
      {collectedCount === 0 && (
        <div className={styles.hint}>スワイプして集める</div>
      )}
    </div>
  );
}

export default Stage3Matter;
