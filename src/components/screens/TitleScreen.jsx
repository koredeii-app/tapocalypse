/**
 * TitleScreen - タイトル画面
 *
 * 表示: ゲームタイトル / サブタイトル / ハイスコア / START ボタン
 */

import StarBackground from '../ui/StarBackground';
import NeonButton from '../ui/NeonButton';
import styles from './TitleScreen.module.css';

/**
 * @param {{
 *   visible:    boolean,
 *   highScore:  number,
 *   onStart:    () => void,
 * }} props
 */
function TitleScreen({ visible, highScore, onStart }) {
  return (
    <div className={`screen ${visible ? 'active' : ''} ${styles.screen}`}>
      <StarBackground />

      <div className={styles.content}>
        <h1 className={styles.title}>Tapocalypse</h1>
        <p  className={styles.subtitle}>世界を叩け！</p>

        {/* ハイスコア表示 */}
        <div className={styles.highScoreBox}>
          <span className={styles.highScoreLabel}>BEST SCORE</span>
          <span className={styles.highScoreValue}>{highScore}</span>
        </div>

        <NeonButton onClick={onStart}>START</NeonButton>
      </div>
    </div>
  );
}

export default TitleScreen;
