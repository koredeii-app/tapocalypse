/**
 * Stage 1「無」 — タップで光を生み出すチュートリアル
 * 20個の光をタップで生成したらクリア
 */

import { useState, useRef, useCallback } from 'react';
import styles from './Stage1Void.module.css';

const TARGET = 20;

function Stage1Void({ active, onClear }) {
  const [particles, setParticles] = useState([]);
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const clearedRef = useRef(false);

  const handlePointerDown = useCallback((e) => {
    if (!active || clearedRef.current) return;

    countRef.current++;
    const newCount = countRef.current;
    setCount(newCount);

    const id = Date.now() + Math.random();
    const particle = { id, x: e.clientX, y: e.clientY };
    setParticles(prev => [...prev, particle]);

    // アニメーション後に削除
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1600);

    if (newCount >= TARGET) {
      clearedRef.current = true;
      setTimeout(() => onClear(), 700);
    }
  }, [active, onClear]);

  const pct = Math.min(100, (count / TARGET) * 100);

  return (
    <div className={styles.stage} onPointerDown={handlePointerDown}>
      {/* パーティクル */}
      {particles.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{ left: p.x, top: p.y }}
        />
      ))}

      {/* 進捗カウンター */}
      <div className={styles.counter}>
        <span className={styles.countNum}>{count}</span>
        <span className={styles.countSep}> / </span>
        <span className={styles.countTotal}>{TARGET}</span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

    </div>
  );
}

export default Stage1Void;
