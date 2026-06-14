/**
 * StarBackground - 宇宙の星空を描画するコンポーネント
 *
 * 親要素の全面を覆うように配置する。
 * 星は useEffect で DOM 要素として動的生成し、CSS アニメーションで瞬く。
 *
 * pointer-events: none なので、ゲームのタップを妨げない。
 */

import { useEffect, useRef } from 'react';
import styles from './StarBackground.module.css';

/**
 * @param {{ count?: number }} props
 *   count - 生成する星の数（デフォルト 70）
 */
function StarBackground({ count = 70 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 星を生成して追加
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star'; // globals.css のグローバルクラス

      // ランダムな位置
      star.style.left = `${Math.random() * 100}%`;
      star.style.top  = `${Math.random() * 100}%`;

      // サイズ（大きい星は少なめ）
      const size = Math.random() > 0.85
        ? `${(Math.random() * 2 + 2).toFixed(1)}px`
        : `${(Math.random() * 1.5 + 0.5).toFixed(1)}px`;
      star.style.width  = size;
      star.style.height = size;

      // CSS カスタムプロパティでアニメーションをランダム化
      star.style.setProperty('--star-opacity',   (0.3 + Math.random() * 0.7).toFixed(2));
      star.style.setProperty('--anim-duration',  `${(2 + Math.random() * 4).toFixed(1)}s`);
      star.style.setProperty('--anim-delay',     `${(Math.random() * 5).toFixed(1)}s`);

      container.appendChild(star);
    }

    // アンマウント時に星を削除
    return () => {
      container.innerHTML = '';
    };
  }, [count]);

  return <div ref={containerRef} className={styles.container} aria-hidden="true" />;
}

export default StarBackground;
