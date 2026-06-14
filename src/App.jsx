/**
 * App - ルートコンポーネント
 *
 * useGame フックでゲーム状態を一元管理し、
 * 各スクリーンコンポーネントへ props として渡す。
 *
 * 将来のモード選択画面や設定画面もここに追加する。
 */

import { useGame }  from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { SCREENS }  from './game/config';

import TitleScreen     from './components/screens/TitleScreen';
import CountdownScreen from './components/screens/CountdownScreen';
import GameScreen      from './components/screens/GameScreen';
import ResultScreen    from './components/screens/ResultScreen';
import MuteButton      from './components/ui/MuteButton';

function App() {
  const game  = useGame();
  const sound = useSound();

  return (
    <>
      <MuteButton muted={sound.muted} onToggle={sound.toggleMute} />

      {/* 全画面を DOM に保持し、visible prop で表示・非表示を切り替える。
          CSS transition で滑らかにフェードイン/アウトする。 */}

      <TitleScreen
        visible={game.screen === SCREENS.TITLE}
        highScore={game.highScore}
        onStart={game.startCountdown}
      />

      <CountdownScreen
        visible={game.screen === SCREENS.COUNTDOWN}
        countdownValue={game.countdownValue}
        countdownMessage={game.countdownMessage}
        showFlying={game.showFlying}
        onTap={game.handleFlying}
      />

      <GameScreen
        visible={game.screen === SCREENS.GAME}
        score={game.score}
        timeLeft={game.timeLeft}
        highScore={game.highScore}
        onTap={game.handleTap}
      />

      <ResultScreen
        visible={game.screen === SCREENS.RESULT}
        resultData={game.resultData}
        highScore={game.highScore}
        onRetry={game.startCountdown}
        onTitle={game.goToTitle}
      />
    </>
  );
}

export default App;
