/**
 * CountdownScreen - カウントダウン画面
 *
 * 3 → 2 → 1 の順にカウント表示。
 * 画面タップで「フライング！」を表示する（Phase 1 はペナルティなし）。
 */

import StarBackground from '../ui/StarBackground';
import styles from './CountdownScreen.module.css';
import { COUNTDOWN_MESSAGES } from '../../game/config';

/**
 * @param {{
 *   visible:          boolean,
 *   countdownValue:   number,
 *   countdownMessage: string,
 *   showFlying:       boolean,
 *   onTap:            () => void,
 * }} props
 */
function CountdownScreen({ visible, countdownValue, countdownMessage, showFlying, onTap }) {
  return (
    <div
      className={`screen ${visible ? 'active' : ''} ${styles.screen}`}
      /* カウントダウン中のタップでフライング検知 */
      onPointerDown={onTap}
    >
      <StarBackground />

      <div className={styles.content}>
        {/* カウントダウン数字 */}
        <div
          className={styles.number}
          /* key を変えることで数字が変わるたびにアニメーションを再生 */
          key={countdownValue}
        >
          {countdownValue}
        </div>

        {/* メッセージ */}
        <div className={styles.message}>
          {countdownMessage}
        </div>

        {/* フライング警告 */}
        {showFlying && (
          <div className={styles.flyingAlert}>
            <span>フライング！</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountdownScreen;
