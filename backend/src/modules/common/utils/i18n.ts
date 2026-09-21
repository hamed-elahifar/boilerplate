import { I18nContext } from 'nestjs-i18n';

/**
 * Translates `key` for the current request's language (see `src/i18n/`).
 * Outside a request there is no language, so the key itself comes back.
 */
export const t = (key: string, args?: Record<string, unknown>): string =>
  I18nContext.current()?.t(key, { args }) ?? key;
