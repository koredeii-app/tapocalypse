/**
 * StarBackground → PrimordialBackground
 *
 * 原始の地球を漂う気泡・胞子・バイオルミネッセント粒子を生成する。
 * 将来フェーズが進むにつれ、パーティクルの色・挙動を時代に合わせて変化させる。
 */

import { useEffect, useRef } from 'react';
import styles from './StarBackground.module.css';

// 原始生命の色パレット（溶岩・バイオルミネッセンス・深海）
const PARTICLE_COLORS = [
  '#ff8c00',  // 琥珀・火山
  '#ff6600',  // 深いオレンジ
  '#ffaa00',  // 黄金
  '#5dff6e',  // バイオルミネッセント緑
  '#00e87a',  // エメラルド
  '#00c8a0',  // 深海ティール
];

function StarBackground({ count = 60 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      p.style.left = `${Math.random() * 100}%`;
      p.style.top  = `${Math.random() * 100}%`;

      // 気泡らしく大きめの粒子を少し多めに
      const size = Math.random() > 0.7
        ? `${(Math.random() * 4 + 3).toFixed(1)}px`
        : `${(Math.random() * 2 + 1).toFixed(1)}px`;
      p.style.width  = size;
      p.style.height = size;

      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      p.style.setProperty('--particle-color',   color);
      p.style.setProperty('--particle-opacity', (0.25 + Math.random() * 0.55).toFixed(2));
      p.style.setProperty('--anim-duration',    `${(3 + Math.random() * 6).toFixed(1)}s`);
      p.style.setProperty('--anim-delay',       `${(Math.random() * 6).toFixed(1)}s`);

      container.appendChild(p);
    }

    return () => { container.innerHTML = ''; };
  }, [count]);

  return <div ref={containerRef} className={styles.container} aria-hidden="true" />;
}

export default StarBackground;
