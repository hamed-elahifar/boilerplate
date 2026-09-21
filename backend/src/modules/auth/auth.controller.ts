import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GetJwt } from './decorators/jwt.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorators/public.decorator';
import { AuthDocument } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('sign-in')
  async signIn(
    @Body() logInDto: LogInDto,
  ): Promise<{ accessToken: string } | string> {
    return this.authService.signIn(logInDto);
  }

  @Get('me')
  me(@GetJwt() jwt: JwtPayload): Promise<AuthDocument | null> {
    return this.authService.me(jwt.userID);
  }
}
