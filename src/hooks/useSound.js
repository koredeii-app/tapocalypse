/**
 * useSound — ミュート状態管理フック
 *
 * - ミュートの ON/OFF を React state で管理し、localStorage に永続化する
 * - SoundManager.setMuted() と同期させることで、
 *   コンポーネント側は SoundManager を直接触らずに済む
 */

import { useState, useCallback, useEffect } from 'react';
import { SoundManager } from '../audio/SoundManager';
import { GAME_CONFIG } from '../game/config';

export function useSound() {
  const [muted, setMuted] = useState(() =>
    localStorage.getItem(GAME_CONFIG.SOUND_STORAGE_KEY) === 'true'
  );

  // マウント時に SoundManager へ初期値を反映
  useEffect(() => {
    SoundManager.setMuted(muted);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem(GAME_CONFIG.SOUND_STORAGE_KEY, String(next));
      SoundManager.setMuted(next);
      return next;
    });
  }, []);

  return { muted, toggleMute };
}
