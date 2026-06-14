/**
 * I18nProvider — 多言語 Context
 *
 * main.jsx で App を包むことで、全コンポーネントが
 * useI18n() フック経由で t() / lang / setLang を使えるようになる。
 */

import { createContext, useState, useCallback, useMemo } from 'react';
import { i18n } from './i18n';

export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(i18n.getCurrentLang());

  const setLang = useCallback((newLang) => {
    i18n.setLang(newLang);
    setLangState(newLang);
  }, []);

  // lang が変わると t が再生成 → useI18n() を使う全コンポーネントが再レンダリング
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useCallback((key) => i18n.t(key), [lang]);

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
