import { AppConfig } from './AppConfig';
import { getI18nPath } from './Helpers';

describe('Helpers', () => {
  describe('getI18nPath function', () => {
    it('should prepend the locale to the path for default language when localePrefix is always', () => {
      const url = '/dashboard';
      const locale = AppConfig.defaultLocale; // 'en'

      expect(getI18nPath(url, locale)).toBe('/en/dashboard');
    });

    it('should prepend the locale to the path for French non-default language', () => {
      const url = '/dashboard';
      const locale = 'fr';

      expect(getI18nPath(url, locale)).toBe('/fr/dashboard');
    });

    it('should fallback to default locale when locale is empty', () => {
      const url = '/sign-in';

      expect(getI18nPath(url, '')).toBe('/en/sign-in');
    });
  });
});
