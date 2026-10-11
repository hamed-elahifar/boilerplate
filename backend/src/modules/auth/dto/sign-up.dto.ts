import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'john' })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[\w.-]+$/)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt ignores bytes past 72
  password: string;

  @ApiPropertyOptional({ example: '+989123456789' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
