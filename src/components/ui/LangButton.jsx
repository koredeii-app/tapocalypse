/**
 * LangButton — 言語切替ボタン（全画面共通）
 *
 * 現在の言語を表示し、タップで次の言語へ切り替える。
 * 対応言語が増えた場合は SUPPORTED_LANGS の順に循環する。
 */

import { useI18n } from '../../hooks/useI18n';
import { SUPPORTED_LANGS } from '../../i18n/i18n';
import styles from './LangButton.module.css';

function LangButton() {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    const idx  = SUPPORTED_LANGS.indexOf(lang);
    const next = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
    setLang(next);
  };

  return (
    <button
      className={styles.button}
      onPointerDown={toggle}
      aria-label="Switch language"
    >
      {lang.toUpperCase()}
    </button>
  );
}

export default LangButton;
