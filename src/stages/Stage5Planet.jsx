/**
 * Stage 5「惑星」 — 惑星を回転・拡大して生命の種を探すチュートリアル
 * - 1本指ドラッグ → 惑星を回転
 * - 2本指ピンチ   → ズームイン/アウト
 * - ズーム 2x 以上で「生命の種」が出現
 * - 種をタップするとクリア
 */

import { useState, useRef, useCallback } from 'react';
import styles from './Stage5Planet.module.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const SEED_VISIBLE_ZOOM = 2.0;

function Stage5Planet({ active, onClear }) {
  const [zoom, setZoom] = useState(1);
  const [bgOffset, setBgOffset] = useState(0); // 擬似回転用の背景オフセット
  const [seedFound, setSeedFound] = useState(false);
  const clearedRef = useRef(false);
  const pointers = useRef({});

  const handlePointerDown = useCallback((e) => {
    pointers.current[e.pointerId] = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!active) return;

    const prevPos = pointers.current[e.pointerId];
    if (!prevPos) return;

    const newPos = { x: e.clientX, y: e.clientY };
    const ids = Object.keys(pointers.current);

    if (ids.length >= 2) {
      // ピンチズーム
      const otherId = ids.find(id => Number(id) !== e.pointerId);
      if (otherId) {
        const otherPos = pointers.current[otherId];
        const prevDist = Math.hypot(prevPos.x - otherPos.x, prevPos.y - otherPos.y);
        const newDist  = Math.hypot(newPos.x - otherPos.x, newPos.y - otherPos.y);
        if (prevDist > 0) {
          setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (newDist / prevDist))));
        }
      }
    } else {
      // 1本指ドラッグ → 擬似回転
      const dx = newPos.x - prevPos.x;
      setBgOffset(prev => prev + dx * 0.6);
    }

    pointers.current[e.pointerId] = newPos;
  }, [active]);

  const handlePointerUp = useCallback((e) => {
    delete pointers.current[e.pointerId];
  }, []);

  const handleSeedTap = useCallback((e) => {
    e.stopPropagation();
    if (!active || clearedRef.current || zoom < SEED_VISIBLE_ZOOM) return;
    clearedRef.current = true;
    setSeedFound(true);
    setTimeout(() => onClear(), 1000);
  }, [active, zoom, onClear]);

  const seedVisible = zoom >= SEED_VISIBLE_ZOOM;
  const zoomDisplay = zoom.toFixed(1);

  return (
    <div
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 惑星コンテナ（スケール変換） */}
      <div
        className={styles.planetContainer}
        style={{ transform: `scale(${zoom})` }}
      >
        {/* 惑星本体 */}
        <div
          className={styles.planet}
          style={{ '--bg-offset': `${bgOffset % 400}px` }}
        >
          {/* 生命の種（ズーム時のみ出現） */}
          {seedVisible && (
            <div
              className={`${styles.seed} ${seedFound ? styles.seedCollected : ''}`}
              onPointerDown={handleSeedTap}
            >
              🌱
            </div>
          )}
        </div>
      </div>

      {/* ズームインジケーター */}
      <div className={styles.zoomIndicator}>
        <span className={styles.zoomIcon}>🔍</span>
        <span className={styles.zoomValue}>{zoomDisplay}x</span>
      </div>

      {/* 状態ヒント */}
      <div className={styles.statusHint}>
        {seedFound
          ? '生命の種を発見した！'
          : seedVisible
            ? '種を見つけた！タップしよう'
            : `拡大して探索しよう（目標: ${SEED_VISIBLE_ZOOM}x以上）`}
      </div>
    </div>
  );
}

export default Stage5Planet;
