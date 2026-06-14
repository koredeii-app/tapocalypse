/**
 * NeonButton - 再利用可能なネオン風ボタン
 *
 * 将来のステージ選択・モード選択画面でも使い回せるよう
 * 独立したコンポーネントとして定義する。
 */

import styles from './NeonButton.module.css';

/**
 * @param {{
 *   children: React.ReactNode,
 *   onClick: () => void,
 *   variant?: 'primary' | 'secondary'
 * }} props
 */
function NeonButton({ children, onClick, variant = 'primary' }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      // ポインタイベントのみ（タッチでもマウスでも反応する）
      onPointerDown={(e) => e.currentTarget.classList.add(styles.pressed)}
      onPointerUp={(e) => e.currentTarget.classList.remove(styles.pressed)}
      onPointerLeave={(e) => e.currentTarget.classList.remove(styles.pressed)}
    >
      {children}
    </button>
  );
}

export default NeonButton;
