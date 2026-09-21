import { Environment } from '../enums/environments.enum';

/**
 * Whether the process is running in production. Gates the developer-facing
 * surfaces (the Swagger documentation) so that they are never switched on in
 * a real deployment.
 */
export const isProduction = (): boolean =>
  process.env.NODE_ENV === Environment.PRODUCTION;
