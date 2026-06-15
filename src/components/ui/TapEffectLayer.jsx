/**
 * TapEffectLayer - タップエフェクトを表示するレイヤー
 *
 * React の state を使わず、DOM を直接操作してエフェクトを生成する。
 * 高速連打時でも state 更新によるレンダリングコストが発生しない。
 *
 * 使い方:
 *   const tapEffectRef = useRef(null);
 *   <TapEffectLayer ref={tapEffectRef} />
 *   tapEffectRef.current.addEffect(clientX, clientY, mode);
 *
 *   mode: 'creation'（💧） | 'destruction'（💥）
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import styles from './TapEffectLayer.module.css';

const EFFECT_EMOJI = {
  creation:    '💧',
  destruction: '💥',
};

const TapEffectLayer = forwardRef(function TapEffectLayer(_, ref) {
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    /**
     * 指定座標にエフェクトを表示する
     * @param {number} x    - clientX（ビューポート基準）
     * @param {number} y    - clientY（ビューポート基準）
     * @param {string} mode - 'creation' | 'destruction'
     */
    addEffect(x, y, mode = 'creation') {
      const container = containerRef.current;
      if (!container) return;

      const el = document.createElement('div');
      el.className  = styles.tapEffect;
      el.textContent = EFFECT_EMOJI[mode] ?? '💧';
      el.style.left  = `${x}px`;
      el.style.top   = `${y}px`;
      container.appendChild(el);

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
