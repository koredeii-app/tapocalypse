/**
 * App - ルートコンポーネント
 *
 * 画面フロー: タイトル → StageManager（Stage 1-5） → タイトル
 */

import { useState } from 'react';
import { useSound } from './hooks/useSound';

import TitleScreen  from './components/screens/TitleScreen';
import StageManager from './stages/StageManager';
import MuteButton   from './components/ui/MuteButton';
import LangButton   from './components/ui/LangButton';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const sound = useSound();

  return (
    <>
      <LangButton />
      <MuteButton muted={sound.muted} onToggle={sound.toggleMute} />

      {!gameStarted ? (
        <TitleScreen
          visible={true}
          onStart={() => setGameStarted(true)}
        />
      ) : (
        <StageManager onComplete={() => setGameStarted(false)} />
      )}
    </>
  );
}

export default App;
