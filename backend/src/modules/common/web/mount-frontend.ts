import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { static as serveStatic } from 'express';

const FRONTEND_DIR = resolve(__dirname, '../../../../../frontend');

/**
 * One process, one port: the API lives under the global `/api` prefix (set in main.ts),
 * `/api-doc` is Swagger, everything else is the Vue app. With `SERVE_VITE=1` the app
 * comes from a Vite dev server running inside this process (HMR on the same port);
 * otherwise from `frontend/dist` with an SPA fallback. Without a build the server is
 * API only.
 */
export async function mountFrontend(app: NestExpressApplication) {
  const web = await createWebHandler(app, new Logger('Frontend'));
  if (!web) return;

  app.use((req: Request, res: Response, next: NextFunction) => {
    const isPage = req.method === 'GET' || req.method === 'HEAD';
    if (!isPage || /^\/api(-doc|\/|\?|$)/.test(req.url)) return next();
    web(req, res, next);
  });
}

async function createWebHandler(
  app: NestExpressApplication,
  logger: Logger,
): Promise<RequestHandler | undefined> {
  if (process.env.SERVE_VITE === '1') {
    // Resolved from the frontend's own node_modules (the backend does not depend on Vite);
    // vite is ESM-only, which require() loads on Node >= 22.12.
    const { createServer } = createRequire(`${FRONTEND_DIR}/`)('vite') as {
      createServer: (
        config: object,
      ) => Promise<{ middlewares: RequestHandler }>;
    };
    const vite = await createServer({
      root: FRONTEND_DIR,
      server: { middlewareMode: true, hmr: { server: app.getHttpServer() } },
    });
    logger.log('Serving the frontend through Vite (dev)');
    return vite.middlewares;
  }

  const dist = resolve(FRONTEND_DIR, 'dist');
  const index = resolve(dist, 'index.html');
  if (!existsSync(index)) {
    logger.warn(`No frontend build at ${dist}: API only`);
    return undefined;
  }
  const files = serveStatic(dist, {
    index: false,
    setHeaders: (res, path) => {
      if (!path.includes('/assets/'))
        res.setHeader('Cache-Control', 'no-cache');
      else
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });
  return (req, res, next) => {
    files(req, res, (err?: unknown) => {
      // a missing file (stale chunk, typo) is a 404, not the app shell
      const isFile = /\.[a-z0-9]+$/i.test(req.path);
      if (err || isFile || (req.method !== 'GET' && req.method !== 'HEAD'))
        return next(err);
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(index);
    });
  };
}
