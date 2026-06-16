/**
 * Stage 3「物質」 — スワイプで散らばったパーティクルを集める
 * 30個集めたらクリア。カウントは非表示。粒子取得時に音が鳴る。
 */

import { useRef, useCallback, useMemo, useState } from 'react';
import { SoundManager } from '../audio/SoundManager';
import styles from './Stage3Matter.module.css';

const TOTAL_PARTICLES = 50;
const TARGET          = 30;
const COLLECT_RADIUS  = 28;

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
  const particlesRef   = useRef(initialParticles);
  const [renderParticles, setRenderParticles] = useState(initialParticles);
  const collectedRef   = useRef(0);
  const clearedRef     = useRef(false);
  const isPointerDown  = useRef(false);

  const collectNear = useCallback((cx, cy) => {
    if (!active || clearedRef.current) return;

    let changed = false;
    let added   = 0;

    particlesRef.current = particlesRef.current.map(p => {
      if (p.collected) return p;
      if (Math.hypot(p.x - cx, p.y - cy) < COLLECT_RADIUS) {
        added++;
        changed = true;
        return { ...p, collected: true };
      }
      return p;
    });

    if (changed) {
      collectedRef.current += added;
      setRenderParticles([...particlesRef.current]);
      SoundManager.playCollect();

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

  return (
    <div
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {renderParticles.map(p => (
        <div
          key={p.id}
          className={`${styles.particle} ${p.collected ? styles.collected : ''}`}
          style={{ left: p.x, top: p.y }}
        />
      ))}
    </div>
  );
}

export default Stage3Matter;
