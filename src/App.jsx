/**
 * App - ルートコンポーネント
 */

import { useGame }  from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { SCREENS }  from './game/config';

import TitleScreen from './components/screens/TitleScreen';
import GameScreen  from './components/screens/GameScreen';
import MuteButton  from './components/ui/MuteButton';
import LangButton  from './components/ui/LangButton';

function App() {
  const game  = useGame();
  const sound = useSound();

  return (
    <>
      <LangButton />
      <MuteButton muted={sound.muted} onToggle={sound.toggleMute} />

      <TitleScreen
        visible={game.screen === SCREENS.TITLE}
        currentStage={game.gameState.currentStage}
        onStart={game.goToGame}
      />

      <GameScreen
        visible={game.screen === SCREENS.GAME}
        gameState={game.gameState}
        onCreate={game.handleCreate}
        onDestroy={game.handleDestroy}
      />
    </>
  );
}

export default App;
