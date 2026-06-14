/**
 * MuteButton — 全画面共通ミュートボタン
 */

import styles from './MuteButton.module.css';

function MuteButton({ muted, onToggle }) {
  return (
    <button
      className={styles.button}
      onPointerDown={onToggle}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

export default MuteButton;
