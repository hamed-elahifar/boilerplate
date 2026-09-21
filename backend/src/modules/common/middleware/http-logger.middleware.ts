import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const getClientIp = (req: Request): string => {
  const cf = req.headers['cf-connecting-ip'];
  const ip = (Array.isArray(cf) ? cf[0] : cf)?.trim() || req.ip;
  return ip?.replace(/^::ffff:/, '') ?? 'unknown';
};

/** Logs `METHOD url [status] ms from ip` once the response finishes. */
export const createHttpLoggerMiddleware = () => {
  const logger = new Logger('HTTP');
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on('finish', () =>
      logger.debug(
        `${req.method} ${req.originalUrl} [${res.statusCode}] ${Date.now() - start}ms from ${getClientIp(req)}`,
      ),
    );
    next();
  };
};
