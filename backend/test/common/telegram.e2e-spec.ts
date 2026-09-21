import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../../src/modules/common/telegram/telegram.service';

const config = (values: Record<string, string>) =>
  ({
    get: (key: string, fallback?: string) => values[key] ?? fallback,
  }) as unknown as ConfigService;

describe('TelegramService', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });
  beforeEach(() => {
    fetchMock.mockClear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('is a no-op when unconfigured', async () => {
    const svc = new TelegramService(config({}));
    expect(await svc.sendMessage('x')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends an identical error only once per window', async () => {
    const svc = new TelegramService(
      config({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: 'c' }),
    );
    await svc.sendErrorNotification('boom');
    await svc.sendErrorNotification('boom');
    await svc.sendErrorNotification('other');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
