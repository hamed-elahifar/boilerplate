# External integrations are opt-in and no-op when unconfigured

Telegram, Redis, S3, SMS and Pusher are always registered as global modules, but each reads its own optional env vars and degrades instead of failing: Telegram and Pusher no-op, S3 answers 503, the Redis client is `null` (throttling falls back to memory), and SMS uses a console driver. The alternative, the source projects' `getOrThrow` on every credential, would make a fresh clone need five external services just to boot. Consumers of a `null` integration (e.g. `BaseRedisRepository`) fail loudly at construction. SMS delivery goes through an `SmsDriver` interface so a second provider is one class; sms.ir is the only real driver and sends only in production.

Numbered 0003 because `0001` and `0002` are referenced from the root AGENTS.md but are not in the repo.
