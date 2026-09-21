import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import {
  I18nContext,
  I18nValidationError,
  I18nValidationException,
} from 'nestjs-i18n';
import { t } from '../utils/i18n';

// Nest's own default texts ("Unauthorized", "Cannot GET /") are replaced by a
// translated message per status; anything else was written by us and passes through.
const NEST_DEFAULT =
  /^(Cannot (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) |(Unauthorized|Forbidden|Not Found|Bad Request|Conflict|Internal Server Error)$)/;
const KNOWN_STATUS = [400, 401, 403, 404, 409];

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(thrown: unknown, host: ArgumentsHost): void {
    // A failed schema check is the caller's mistake, not a crash.
    const exception =
      thrown instanceof MongooseError.ValidationError
        ? new BadRequestException(
            Object.values(thrown.errors)
              .map(
                (e) =>
                  `${e.path} ${t(e.kind === 'required' ? 'errors.required' : 'errors.invalid')}`,
              )
              .join(', '),
          )
        : thrown;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;
    let code: string | undefined;

    if (exception instanceof I18nValidationException) {
      status = exception.getStatus();
      error = exception.name;
      message = this.formatI18nValidationErrors(exception.errors ?? []);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exception.message;
        error = exception.name;
      }
    } else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      if (exception.code === 11000) {
        message = t('errors.duplicateKey');
        code = 'DUPLICATE_KEY_ERROR';
      } else {
        message = t('errors.dbFailed');
        code = 'DATABASE_ERROR';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'Internal Server Error';
      code = 'INTERNAL_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '';
      error = 'Internal Server Error';
      code = 'UNKNOWN_ERROR';
    }

    // Unexpected errors keep their raw text in the log only, never in the response.
    const ours =
      exception instanceof HttpException ||
      exception instanceof MongoError ||
      exception instanceof I18nValidationException;
    const localize = (m: string) =>
      ours && m && !NEST_DEFAULT.test(m)
        ? m
        : t(`errors.status.${KNOWN_STATUS.includes(status) ? status : 500}`);
    message = Array.isArray(message)
      ? message.map(localize)
      : localize(message);

    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      ...(code && { code }),
      timestamp: new Date().toISOString(),
    };

    // Only log and notify for server errors (5xx) - these are unexpected errors
    // Client errors (4xx) like 404, 400, 401, etc. are expected and should not clutter logs
    if (status >= 500) {
      // Log the error for debugging
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${error}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorResponse);
  }

  private formatI18nValidationErrors(errors: I18nValidationError[]): string[] {
    const translatedErrors = this.translateI18nValidationErrors(errors);
    return this.collectConstraintMessages(translatedErrors);
  }

  private translateI18nValidationErrors(
    errors: I18nValidationError[],
  ): I18nValidationError[] {
    const i18n = I18nContext.current();

    return errors.map((error) => {
      const children = this.translateI18nValidationErrors(error.children ?? []);
      const constraints = this.translateI18nConstraints(
        error,
        error.constraints ?? {},
        i18n,
      );

      return {
        ...error,
        children,
        constraints,
      };
    });
  }

  private translateI18nConstraints(
    error: I18nValidationError,
    constraints: Record<string, string>,
    i18n?: I18nContext,
  ): Record<string, string> {
    if (!i18n) return constraints;

    return Object.keys(constraints).reduce(
      (result, key) => {
        const rawValue = constraints[key];
        const [translationKey, argsString] = rawValue.split('|');
        if (!argsString) {
          result[key] = rawValue;
          return result;
        }

        try {
          const parsedArgs = this.safeParseArgs(argsString);
          const constraintsArgs = this.normalizeConstraintsArgs(
            parsedArgs?.constraints,
            constraints,
          );
          const translationArgs: Record<string, unknown> = {
            property: error.property,
            value: error.value as unknown,
            target: error.target as unknown,
            contexts: error.contexts as unknown,
            ...(parsedArgs ? parsedArgs.args : {}),
            constraints: constraintsArgs,
          };

          result[key] = i18n.service.translate(translationKey, {
            lang: i18n.lang,
            args: translationArgs,
          });
        } catch {
          result[key] = rawValue;
        }

        return result;
      },
      {} as Record<string, string>,
    );
  }

  private collectConstraintMessages(errors: I18nValidationError[]): string[] {
    const messages: string[] = [];

    const service = I18nContext.current()?.service;

    // The DTOs carry class-validator's default English text, so the template
    // for the request language is looked up by constraint name (`isInt`,
    // `min`, ...). A missing key falls back to the raw message.
    const localized = (item: I18nValidationError, key: string, raw: string) => {
      const template = service?.translate(`validation.${key}`, {
        lang: I18nContext.current()?.lang,
        args: { property: item.property },
      });
      return typeof template === 'string' && template !== `validation.${key}`
        ? template
        : raw;
    };

    const walk = (items: I18nValidationError[]) => {
      for (const item of items) {
        if (item.constraints) {
          messages.push(
            ...Object.entries(item.constraints).map(([key, raw]) =>
              localized(item, key, raw),
            ),
          );
        }
        if (item.children?.length) {
          walk(item.children);
        }
      }
    };

    walk(errors);
    return messages;
  }

  private safeParseArgs(
    raw: string,
  ): { args: Record<string, unknown>; constraints?: unknown } | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const record = parsed as Record<string, unknown>;
      const { constraints, ...rest } = record;
      return { args: rest, constraints };
    } catch {
      return null;
    }
  }

  private normalizeConstraintsArgs(
    rawConstraints: unknown,
    fallback: Record<string, string>,
  ): Record<string, string> {
    if (Array.isArray(rawConstraints)) {
      const normalized: Record<string, string> = {};
      rawConstraints.forEach((value, index) => {
        normalized[index.toString()] = String(value);
      });
      return normalized;
    }

    if (rawConstraints && typeof rawConstraints === 'object') {
      return Object.entries(rawConstraints as Record<string, unknown>).reduce(
        (acc: Record<string, string>, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {},
      );
    }

    return fallback;
  }
}
