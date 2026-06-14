/**
 * useI18n — 多言語フック
 *
 * 使用例:
 *   const { t, lang, setLang } = useI18n();
 *   <h1>{t('appName')}</h1>
 */

import { useContext } from 'react';
import { I18nContext } from '../i18n/I18nProvider';

export function useI18n() {
  return useContext(I18nContext);
}
