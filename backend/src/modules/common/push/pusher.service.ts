import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

/**
 * Realtime events over Pusher Channels. Optional: without the PUSHER_* vars
 * every trigger is a no-op.
 */
@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private readonly pusher: Pusher | null;

  constructor(config: ConfigService) {
    const appId = config.get<string>('PUSHER_APP_ID');
    const key = config.get<string>('PUSHER_KEY');
    const secret = config.get<string>('PUSHER_SECRET');
    const cluster = config.get<string>('PUSHER_CLUSTER');
    this.pusher =
      appId && key && secret && cluster
        ? new Pusher({ appId, key, secret, cluster, useTLS: true })
        : null;
    if (!this.pusher) this.logger.warn('Pusher disabled: PUSHER_* not set');
  }

  async trigger(channel: string, event: string, data: unknown): Promise<void> {
    await this.pusher?.trigger(channel, event, data);
  }

  triggerToUser(userId: string, event: string, data: unknown): Promise<void> {
    return this.trigger(`private-user-${userId}`, event, data);
  }
}
