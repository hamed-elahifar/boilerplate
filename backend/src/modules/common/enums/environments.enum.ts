/**
 * The values `NODE_ENV` may take. These are the conventional Node spellings, and
 * they are what the PM2 deployment config sets — the env validator rejects
 * anything else at boot.
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}
