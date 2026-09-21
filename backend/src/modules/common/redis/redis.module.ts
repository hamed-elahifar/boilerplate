import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/** Provides the ioredis client, or `null` when REDIS_URL is unset. */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis | null => {
        const url = config.get<string>('REDIS_URL');
        return url ? new IORedis(url) : null;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis | null) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client?.quit();
  }
}
