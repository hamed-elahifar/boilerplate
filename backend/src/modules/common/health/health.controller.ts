import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import { Public } from '../../auth/decorators/public.decorator';

@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check(): { status: 'ok' } {
    // readyState 1 = connected
    if (this.connection.readyState !== 1) {
      throw new ServiceUnavailableException('database is not connected');
    }
    return { status: 'ok' };
  }
}
