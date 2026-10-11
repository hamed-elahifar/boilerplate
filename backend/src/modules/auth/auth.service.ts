import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { t } from '../common/utils/i18n';
import { AuthDocument } from './auth.model';
import { AuthRepository } from './auth.repository';
import { LogInDto, SignUpDto } from './dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<string> {
    const taken = await this.repository.exists({
      $or: [
        { username: dto.username.toLowerCase() },
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });
    if (taken) throw new ConflictException(t('errors.userExists'));

    await this.repository.create({
      username: dto.username,
      phone: dto.phone,
      password: await bcrypt.hash(dto.password, 10),
    });
    return t('errors.signedUp');
  }

  async signIn({
    username,
    password,
  }: LogInDto): Promise<{ accessToken: string }> {
    const user = await this.repository.withPassword(username.toLowerCase());

    if (!user?.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(t('errors.invalidCredentials'));
    }

    await this.repository.touchLogin(user._id);
    const payload: JwtPayload = {
      userID: String(user._id),
      username: user.username,
      roles: user.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  me(userID: string): Promise<AuthDocument | null> {
    return this.repository.findById(userID);
  }
}
