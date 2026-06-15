/**
 * StageIntro - ステージ開始前のイントロオーバーレイ
 * ステージ名・説明・クリア条件を表示し、タップで開始する
 */

import NeonButton from '../components/ui/NeonButton';
import styles from './StageIntro.module.css';

function StageIntro({ stageNum, info, onStart }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.stageLabel}>Stage {stageNum}</div>
        <div className={styles.emoji}>{info.emoji}</div>
        <div className={styles.title}>{info.title}</div>
        <p className={styles.description}>{info.description}</p>
        <div className={styles.hintBox}>
          <span className={styles.hintLabel}>操作</span>
          <span className={styles.hintText}>{info.hint}</span>
        </div>
        <div className={styles.conditionBox}>
          <span className={styles.conditionLabel}>クリア条件</span>
          <span className={styles.conditionText}>{info.clearCondition}</span>
        </div>
        <NeonButton onClick={onStart}>始める</NeonButton>
      </div>
    </div>
  );
}

export default StageIntro;
