import { getLocale } from './locale';

describe('Chinese date locales', () => {
  test.each(['zh-Hans', 'zh-CN', 'zh-SG', 'zh-Hans-CN', 'zh'])(
    '%s formats calendar labels in Simplified Chinese',
    language => {
      expect(getLocale(language).code).toBe('zh-CN');
      expect(getLocale(language).localize.month(0)).toBe('一月');
    },
  );

  test('preserves traditional Chinese and unrelated locales', () => {
    expect(getLocale('zh-Hant').code).toBe('zh-TW');
    expect(getLocale('en-US').code).toBe('en-US');
    expect(getLocale('fr').code).toBe('fr');
  });
});
