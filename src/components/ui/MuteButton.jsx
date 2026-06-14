/**
 * MuteButton — 全画面共通ミュートボタン
 *
 * 画面右上に固定表示。タップで ON/OFF を切り替える。
 */

import styles from './MuteButton.module.css';

function MuteButton({ muted, onToggle }) {
  return (
    <button
      className={styles.button}
      onPointerDown={onToggle}
      aria-label={muted ? '音をONにする' : '音をOFFにする'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

export default MuteButton;
