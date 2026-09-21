# backend/src/modules/common

## Purpose

Cross-cutting building blocks shared by every module: generic REST layers, filter, interceptor, logger, validators, and optional external integrations.

## Ownership

Owns everything under `common/`. Feature modules (`auth`, `users`) consume it; nothing here imports them.

## Local Contracts

- Every integration is optional and env-driven; unset vars must never stop boot (`docs/adr/0003-optional-integrations.md`). All its vars are `@IsOptional()` in `validators/env.validation.ts` and commented in `backend/env.example`
- Integrations are `@Global()` modules registered in `app.module.ts`:
  - `telegram/`: `TelegramService` (`sendMessage`, error/warning helpers, startup/shutdown pings). `TELEGRAM_API_BASE_URL` defaults to the official API. Error/warning alerts are de-duplicated for 60 s in memory. `CustomLogger.error` forwards to it; the service must not log through `CustomLogger.error` (would loop)
  - `redis/`: `REDIS_CLIENT` token, `null` without `REDIS_URL`. Throttler storage switches to Redis when present. Entity caches extend `generic/base.redis-repository.ts`
  - `s3/`: `S3Service` (S3-compatible, path-style) and `POST /upload?folder=` (JWT-guarded, folder whitelist in `upload.controller.ts`, size `S3_MAX_FILE_MB`, types `S3_ALLOWED_MIME`)
  - `sms/`: `SmsService.sendVerify` over an `SmsDriver`; drivers `console` (default) and `smsir` (`SMS_DRIVER=smsir`, production only)
  - `push/`: `PusherService` trigger helpers only; no controller, no auth endpoint
- Rate limiting: global `ThrottlerGuard` (100 req/min per IP, skipped when `NODE_ENV=test`); `POST /auth/sign-in` is limited to 10/min
- `middleware/http-logger.middleware.ts` is attached in `main.ts` (skipped in test); guards, filter, interceptor and pipes stay in `app.module.ts`
- Language resolution order: `?lang=`, `x-lang` header, body `language`, `Accept-Language`

## Work Guidance

- Add a new integration as its own folder with a `@Global()` module, optional env vars, and a no-op or 503 fallback
- Add an SMS provider as another `SmsDriver` class selected in `SmsService`

## Verification

- `cd backend && NODE_ENV=test node_modules/.bin/jest --config ./test/jest-e2e.json --runInBand` (includes `test/common/telegram.e2e-spec.ts`)
- `node_modules/.bin/tsc --noEmit -p tsconfig.json`

## Child DOX Index

None.
