import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'john' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+989123456789' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
