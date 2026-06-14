/**
 * App - ルートコンポーネント
 */

import { useGame }  from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { SCREENS }  from './game/config';

import TitleScreen     from './components/screens/TitleScreen';
import CountdownScreen from './components/screens/CountdownScreen';
import GameScreen      from './components/screens/GameScreen';
import ResultScreen    from './components/screens/ResultScreen';
import MuteButton      from './components/ui/MuteButton';
import LangButton      from './components/ui/LangButton';

function App() {
  const game  = useGame();
  const sound = useSound();

  return (
    <>
      <LangButton />
      <MuteButton muted={sound.muted} onToggle={sound.toggleMute} />

      <TitleScreen
        visible={game.screen === SCREENS.TITLE}
        highScore={game.highScore}
        onStart={game.startCountdown}
      />

      <CountdownScreen
        visible={game.screen === SCREENS.COUNTDOWN}
        countdownValue={game.countdownValue}
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
