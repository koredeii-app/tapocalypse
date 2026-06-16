/**
 * Stage 1「無」 — タップで光を生み出す
 * 20回タップでクリア。カウントは非表示。
 */

import { useState, useRef, useCallback } from 'react';
import { SoundManager } from '../audio/SoundManager';
import styles from './Stage1Void.module.css';

const TARGET = 20;

function Stage1Void({ active, onClear }) {
  const [particles, setParticles] = useState([]);
  const countRef   = useRef(0);
  const clearedRef = useRef(false);

  const handlePointerDown = useCallback((e) => {
    if (!active || clearedRef.current) return;

    SoundManager.playPoko();

    countRef.current++;
    const newCount = countRef.current;

    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1600);

    if (newCount >= TARGET) {
      clearedRef.current = true;
      setTimeout(() => onClear(), 700);
    }
  }, [active, onClear]);

  return (
    <div className={styles.stage} onPointerDown={handlePointerDown}>
      {particles.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{ left: p.x, top: p.y }}
        />
      ))}
    </div>
  );
}

export default Stage1Void;
