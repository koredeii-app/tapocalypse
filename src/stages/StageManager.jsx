/**
 * StageManager — ステージ進行の統括コンポーネント
 *
 * クリア即座に次ステージへ遷移。
 * 新ステージの追加は STAGES_MAP にエントリを追加するだけ。
 */

import { useState, useCallback } from 'react';
import { STAGE_INFO, MAX_STAGE } from './stageInfo';
import Stage1Void   from './Stage1Void';
import Stage2Light  from './Stage2Light';
import Stage3Matter from './Stage3Matter';
import Stage4Star   from './Stage4Star';
import Stage5Planet from './Stage5Planet';
import Stage6Ocean  from './Stage6Ocean';
import styles from './StageManager.module.css';

const STAGES_MAP = {
  1: Stage1Void,
  2: Stage2Light,
  3: Stage3Matter,
  4: Stage4Star,
  5: Stage5Planet,
  6: Stage6Ocean,
};

function StageManager({ onComplete }) {
  const [currentStage, setCurrentStage] = useState(1);

  const handleClear = useCallback(() => {
    if (currentStage >= MAX_STAGE) {
      onComplete?.();
    } else {
      setCurrentStage(s => s + 1);
    }
  }, [currentStage, onComplete]);

  const StageComponent = STAGES_MAP[currentStage];

  return (
    <div className={styles.container}>
      <StageComponent
        active={true}
        onClear={handleClear}
      />
      <div className={styles.stageBadge}>
        Stage {currentStage}
      </div>
    </div>
  );
}

export default StageManager;
