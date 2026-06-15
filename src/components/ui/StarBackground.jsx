/**
 * StarBackground → NatureBackground
 *
 * 大地に漂う水滴・胞子・花粉をイメージしたパーティクルを生成する。
 * フェーズが進むにつれ色・挙動を時代に合わせて変化させる想定。
 */

import { useEffect, useRef } from 'react';
import styles from './StarBackground.module.css';

// 水・大地・新芽のカラーパレット
const PARTICLE_COLORS = [
  '#4fc3f7',  // 水の青
  '#81d4fa',  // 淡い水色
  '#6dcc5e',  // 新芽の緑
  '#a8e06d',  // 若葉の黄緑
  '#c8f0a0',  // 淡い若葉
  '#ffffff',  // 花粉・白
];

function StarBackground({ count = 65 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      p.style.left = `${Math.random() * 100}%`;
      p.style.top  = `${Math.random() * 100}%`;

      // 水滴・胞子らしく丸くふっくらした粒子
      const size = Math.random() > 0.75
        ? `${(Math.random() * 5 + 3).toFixed(1)}px`
        : `${(Math.random() * 2 + 1).toFixed(1)}px`;
      p.style.width  = size;
      p.style.height = size;

      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      p.style.setProperty('--particle-color',   color);
      p.style.setProperty('--particle-opacity', (0.2 + Math.random() * 0.5).toFixed(2));
      p.style.setProperty('--anim-duration',    `${(4 + Math.random() * 7).toFixed(1)}s`);
      p.style.setProperty('--anim-delay',       `${(Math.random() * 7).toFixed(1)}s`);

      container.appendChild(p);
    }

    return () => { container.innerHTML = ''; };
  }, [count]);

  return <div ref={containerRef} className={styles.container} aria-hidden="true" />;
}

export default StarBackground;
