/**
 * i18n コアモジュール（React 非依存）
 *
 * 言語の検出・切替・テキスト取得を担当する。
 * React コンポーネントからは直接呼ばず、useI18n フック経由で使用する。
 *
 * 新言語の追加手順:
 *   1. src/locales/ に xx.json を追加（en.json と同じキーで翻訳）
 *   2. LOCALES に import して登録するだけ
 */

import en from '../locales/en.json';
import ja from '../locales/ja.json';
import { GAME_CONFIG } from '../game/config';

// ─────────────────────────────────────────────
// 対応言語登録（ここに追加するだけで新言語が有効になる）
// ─────────────────────────────────────────────

const LOCALES = { en, ja };

export const SUPPORTED_LANGS = Object.keys(LOCALES); // ['en', 'ja']

// ─────────────────────────────────────────────
// 初期言語の検出
// ─────────────────────────────────────────────

function detectLang() {
  const saved   = localStorage.getItem(GAME_CONFIG.LANG_STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : 'en';
}

// ─────────────────────────────────────────────
// モジュールスコープの状態
// ─────────────────────────────────────────────

let currentLang = detectLang();

// ─────────────────────────────────────────────
// 公開 API
// ─────────────────────────────────────────────

export const i18n = {
  getCurrentLang: () => currentLang,

  setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(GAME_CONFIG.LANG_STORAGE_KEY, lang);
  },

  /** キーに対応するテキストを返す。未定義なら英語 → キー名の順でフォールバック */
  t(key) {
    return LOCALES[currentLang]?.[key]
        ?? LOCALES['en']?.[key]
        ?? key;
  },
};
