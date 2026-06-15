/**
 * StageManager — ステージ進行の統括コンポーネント
 *
 * フロー:
 *   intro（説明表示） → playing（ゲーム中） → clear（クリア演出） → 次ステージ
 *
 * 各ステージは独立したコンポーネント。onClear を呼ぶことで次へ進む。
 * 将来のステージ追加は STAGES_MAP にエントリを追加するだけ。
 */

import { useState, useCallback } from 'react';
import { STAGE_INFO, MAX_TUTORIAL_STAGE } from './stageInfo';
import StageIntro from './StageIntro';
import Stage1Void    from './Stage1Void';
import Stage2Light   from './Stage2Light';
import Stage3Matter  from './Stage3Matter';
import Stage4Star    from './Stage4Star';
import Stage5Planet  from './Stage5Planet';
import styles from './StageManager.module.css';

const STAGES_MAP = {
  1: Stage1Void,
  2: Stage2Light,
  3: Stage3Matter,
  4: Stage4Star,
  5: Stage5Planet,
};

function StageManager({ onComplete }) {
  const [currentStage, setCurrentStage] = useState(1);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'clear'

  const handleClear = useCallback(() => {
    setPhase('clear');
    setTimeout(() => {
      if (currentStage >= MAX_TUTORIAL_STAGE) {
        onComplete?.();
      } else {
        setCurrentStage(s => s + 1);
        setPhase('intro');
      }
    }, 2000);
  }, [currentStage, onComplete]);

  const handleStart = useCallback(() => {
    setPhase('playing');
  }, []);

  const StageComponent = STAGES_MAP[currentStage];
  const info = STAGE_INFO[currentStage];

  return (
    <div className={styles.container}>
      {/* ステージ本体（常にレンダリング済み、intro 中は背後に表示） */}
      <StageComponent
        active={phase === 'playing'}
        onClear={handleClear}
      />

      {/* ステージ番号バッジ（playing 中、右上） */}
      {phase === 'playing' && (
        <div className={styles.stageBadge}>
          Stage {currentStage} — {info.title}
        </div>
      )}

      {/* イントロオーバーレイ */}
      {phase === 'intro' && (
        <StageIntro
          stageNum={currentStage}
          info={info}
          onStart={handleStart}
        />
      )}

      {/* クリア演出オーバーレイ */}
      {phase === 'clear' && (
        <div className={styles.clearOverlay}>
          <div className={styles.clearCard}>
            <div className={styles.clearEmoji}>{info.emoji}</div>
            <div className={styles.clearText}>クリア！</div>
            <div className={styles.clearStageName}>{info.title}</div>
            {currentStage < MAX_TUTORIAL_STAGE && (
              <div className={styles.nextHint}>
                次: Stage {currentStage + 1} 「{STAGE_INFO[currentStage + 1].title}」
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StageManager;
