import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * JSON-in-Redis repository keyed by `<prefix>:<id>`. Extend it per entity and
 * inject the client with `@Inject(REDIS_CLIENT)`; needs REDIS_URL to be set.
 */
export abstract class BaseRedisRepository<T extends object> {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly ttl: number;
  private readonly client: Redis;

  constructor(
    protected readonly prefix: string,
    redisClient: Redis | null,
    configService: ConfigService,
    defaultTTL: number = 3 * 60 * 60,
  ) {
    if (!redisClient) {
      throw new Error(`${this.constructor.name} needs REDIS_URL to be set`);
    }
    this.client = redisClient;
    this.ttl = configService.get<number>('REDIS_TTL') || defaultTTL;
  }

  protected getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async set(id: string, data: Partial<T>, ttl = this.ttl): Promise<void> {
    await this.client.set(this.getKey(id), JSON.stringify(data), 'EX', ttl);
  }

  async get(id: string): Promise<Partial<T> | null> {
    const data = await this.client.get(this.getKey(id));
    return data ? (JSON.parse(data) as Partial<T>) : null;
  }

  async delete(id: string): Promise<boolean> {
    return (await this.client.del(this.getKey(id))) === 1;
  }

  async exists(id: string): Promise<boolean> {
    return (await this.client.exists(this.getKey(id))) === 1;
  }
}
