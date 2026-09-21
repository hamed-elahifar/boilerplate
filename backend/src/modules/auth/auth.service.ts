import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { t } from '../common/utils/i18n';
import { AuthDocument, AuthEntity } from './auth.model';
import { LogInDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthEntity.name)
    private readonly authModel: Model<AuthDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<string> {
    const taken = await this.authModel.exists({
      $or: [
        { username: dto.username.toLowerCase() },
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });
    if (taken) throw new ConflictException(t('errors.userExists'));

    await this.authModel.create({
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
    const user = await this.authModel
      .findOne({ username: username.toLowerCase() })
      .select('+password');

    if (!user?.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(t('errors.invalidCredentials'));
    }

    await this.authModel.updateOne(
      { _id: user._id },
      { lastLoginAt: new Date() },
    );
    const payload: JwtPayload = {
      userID: String(user._id),
      username: user.username,
      roles: user.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  me(userID: string): Promise<AuthDocument | null> {
    return this.authModel.findById(userID).exec();
  }
}
