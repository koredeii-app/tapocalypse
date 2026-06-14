/**
 * TapEffectLayer - タップエフェクト（💥）を表示するレイヤー
 *
 * React の state を使わず、DOM を直接操作してエフェクトを生成する。
 * これにより、高速連打時でも state 更新によるレンダリングコストが発生しない。
 *
 * 使い方:
 *   const tapEffectRef = useRef(null);
 *   <TapEffectLayer ref={tapEffectRef} />
 *   tapEffectRef.current.addEffect(clientX, clientY);
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import styles from './TapEffectLayer.module.css';

const TapEffectLayer = forwardRef(function TapEffectLayer(_, ref) {
  const containerRef = useRef(null);

  // 親コンポーネントから addEffect() を呼べるようにする
  useImperativeHandle(ref, () => ({
    /**
     * 指定座標に 💥 を表示する
     * @param {number} x - clientX（ビューポート基準）
     * @param {number} y - clientY（ビューポート基準）
     */
    addEffect(x, y) {
      const container = containerRef.current;
      if (!container) return;

      const el = document.createElement('div');
      // CSS Modules のクラス名（ハッシュ付き）を設定
      el.className = styles.tapEffect;
      el.textContent = '💥';
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      container.appendChild(el);

      // CSS アニメーション（0.5s）終了後に DOM から削除
      setTimeout(() => el.remove(), 520);
    },
  }));

  return (
    <div
      ref={containerRef}
      className={styles.container}
      aria-hidden="true"
    />
  );
});

export default TapEffectLayer;
