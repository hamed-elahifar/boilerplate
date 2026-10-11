import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/generic/base.repository';
import { AuthDocument, AuthEntity } from './auth.model';

@Injectable()
export class AuthRepository extends BaseRepository<AuthDocument> {
  constructor(@InjectModel(AuthEntity.name) model: Model<AuthDocument>) {
    super(model);
  }

  /** The password is `select: false` on the schema; sign-in needs it. */
  withPassword(username: string) {
    return this.entityModel.findOne({ username }).select('+password');
  }

  touchLogin(id: unknown) {
    return this.entityModel.updateOne({ _id: id }, { lastLoginAt: new Date() });
  }
}
