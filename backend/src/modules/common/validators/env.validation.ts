import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  validateSync,
} from 'class-validator';
import { IsNumberOrString } from './string-or-number.validator';
import { Environment } from '../enums/environments.enum';

class EnvironmentVariables {
  // APP
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  // I18N: fallback language when the request names none (src/i18n/<lang>/)
  @IsOptional()
  @IsIn(['fa', 'en'])
  DEFAULT_LANGUAGE?: string;

  // DB
  @IsString()
  MONGO_URL: string;

  @IsBoolean()
  MONGO_DEBUG: boolean;

  // JWT
  @IsDefined()
  @Validate(IsNumberOrString)
  JWT_SECRET: number | string;

  @IsString()
  JWT_AUDIENCE: string;

  @IsString()
  JWT_ISSUER: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  // OPTIONAL INTEGRATIONS: each is off unless its vars are set
  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_CHAT_ID?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_API_BASE_URL?: string;

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  S3_BUCKET_NAME?: string;

  @IsOptional()
  @IsString()
  S3_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  S3_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  S3_ALLOWED_MIME?: string;

  @IsOptional()
  @IsString()
  PUSHER_APP_ID?: string;

  @IsOptional()
  @IsString()
  PUSHER_KEY?: string;

  @IsOptional()
  @IsString()
  PUSHER_SECRET?: string;

  @IsOptional()
  @IsString()
  PUSHER_CLUSTER?: string;

  @IsOptional()
  @IsString()
  SMS_API_KEY?: string;

  @IsOptional()
  @IsNumber()
  REDIS_TTL?: number;

  @IsOptional()
  @IsNumber()
  S3_MAX_FILE_MB?: number;

  @IsOptional()
  @IsNumber()
  SMS_SENDER?: number;

  @IsOptional()
  @IsNumber()
  SMS_TEMPLATE?: number;

  @IsOptional()
  @IsIn(['console', 'smsir'])
  SMS_DRIVER?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
