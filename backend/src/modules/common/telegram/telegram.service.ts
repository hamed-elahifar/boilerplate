import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEDUP_WINDOW_MS = 60_000;

/**
 * Sends messages to a Telegram chat. Optional: with TELEGRAM_BOT_TOKEN or
 * TELEGRAM_CHAT_ID unset every call is a no-op that returns false.
 */
@Injectable()
export class TelegramService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;
  private readonly chatId: string;
  private readonly baseUrl: string;
  private readonly lastSent = new Map<string, number>();

  constructor(config: ConfigService) {
    this.token = config.get<string>('TELEGRAM_BOT_TOKEN', '');
    this.chatId = config.get<string>('TELEGRAM_CHAT_ID', '');
    this.baseUrl = config.get<string>(
      'TELEGRAM_API_BASE_URL',
      'https://api.telegram.org',
    );
    if (!this.enabled) {
      this.logger.warn(
        'Telegram disabled: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set',
      );
    }
  }

  get enabled(): boolean {
    return !!(this.token && this.chatId);
  }

  async sendMessage(text: string): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const res = await fetch(`${this.baseUrl}/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // Telegram caps a message at 4096 characters.
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text.slice(0, 4096),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) this.logger.warn(`Telegram responded ${res.status}`);
      return res.ok;
    } catch (err) {
      // Never log through CustomLogger.error here: it would notify Telegram again.
      this.logger.warn(`Telegram send failed: ${(err as Error).message}`);
      return false;
    }
  }

  /** Same message is sent at most once per minute (guards against error loops). */
  private async sendOnce(text: string): Promise<void> {
    const now = Date.now();
    if (now - (this.lastSent.get(text) ?? 0) < DEDUP_WINDOW_MS) return;
    this.lastSent.set(text, now);
    for (const [k, at] of this.lastSent) {
      if (now - at >= DEDUP_WINDOW_MS) this.lastSent.delete(k);
    }
    await this.sendMessage(text);
  }

  sendErrorNotification(message: string, trace?: string): Promise<void> {
    return this.sendOnce(
      `🔴 Error\n${message}${trace ? `\n\n${trace.slice(0, 1500)}` : ''}`,
    );
  }

  sendWarningNotification(message: string): Promise<void> {
    return this.sendOnce(`🟡 Warning\n${message}`);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.sendMessage(`🟢 Started (${process.env.NODE_ENV})`);
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    await this.sendMessage(`⚪ Shutting down${signal ? ` (${signal})` : ''}`);
  }
}
