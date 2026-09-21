import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthEntity, AuthEntitySchema } from './auth.model';
import type { StringValue } from 'ms';

const normalizeJwtExpiresIn = (
  rawExpiresIn: string | number | undefined,
): number | StringValue => {
  if (typeof rawExpiresIn === 'number') {
    return rawExpiresIn;
  }

  if (typeof rawExpiresIn !== 'string') {
    return '1y';
  }

  const trimmedExpiresIn = rawExpiresIn.trim();

  if (/^\d+$/.test(trimmedExpiresIn)) {
    return Number(trimmedExpiresIn);
  }

  return trimmedExpiresIn as StringValue;
};

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: AuthEntity.name,
        schema: AuthEntitySchema,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: normalizeJwtExpiresIn(
            configService.get<string>('JWT_EXPIRES_IN', '1y'),
          ),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule, MongooseModule],
})
export class AuthModule {}
