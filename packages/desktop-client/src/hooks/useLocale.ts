import { getLocale } from '@actual-app/core/shared/locale';

import { useGlobalPref } from './useGlobalPref';

/** The chosen language; new installations of this edition default to Chinese. */
export function useLanguage() {
  const [language] = useGlobalPref('language');
  return language === undefined || language === null
    ? 'zh-Hans'
    : language || navigator.language || 'en-US';
}

export function useLocale() {
  return getLocale(useLanguage());
}
