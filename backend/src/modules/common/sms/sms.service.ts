import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Smsir } from 'sms-typescript';
import { isProduction } from '../utils/is-production';

/** A delivery backend. Add a driver here (and to `SmsService`) per provider. */
export interface SmsDriver {
  sendVerify(receptor: string, token: string): Promise<void>;
}

class ConsoleSmsDriver implements SmsDriver {
  private readonly logger = new Logger('SmsService');

  sendVerify(receptor: string, token: string): Promise<void> {
    this.logger.log(`SMS to ${receptor}: verification code ${token}`);
    return Promise.resolve();
  }
}

class SmsirDriver implements SmsDriver {
  private readonly client: Smsir;

  constructor(
    apiKey: string,
    sender: number,
    private readonly templateId: number,
  ) {
    this.client = new Smsir(apiKey, sender);
  }

  async sendVerify(receptor: string, token: string): Promise<void> {
    await this.client.SendVerifyCode(receptor, this.templateId, [
      { name: 'CODE', value: token },
    ]);
  }
}

/**
 * SMS_DRIVER=smsir sends through sms.ir, but only in production; every other
 * case uses the console driver, which just logs, so nothing needs configuring.
 */
@Injectable()
export class SmsService {
  private readonly driver: SmsDriver;

  constructor(config: ConfigService) {
    this.driver =
      config.get('SMS_DRIVER') === 'smsir' && isProduction()
        ? new SmsirDriver(
            config.getOrThrow<string>('SMS_API_KEY'),
            config.getOrThrow<number>('SMS_SENDER'),
            config.getOrThrow<number>('SMS_TEMPLATE'),
          )
        : new ConsoleSmsDriver();
  }

  sendVerify(receptor: string, token: string): Promise<void> {
    return this.driver.sendVerify(receptor, token);
  }
}
