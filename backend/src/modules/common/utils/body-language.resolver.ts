import { ExecutionContext } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

/** Picks the language from a `language` field in the request body. */
export class BodyLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string | undefined {
    const req = context
      .switchToHttp()
      .getRequest<{ body?: { language?: unknown } }>();
    const lang = req?.body?.language;
    return typeof lang === 'string' && lang ? lang : undefined;
  }
}
