import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AuthDocument, AuthEntity } from '../auth/auth.model.js';
import { BaseRepository } from '../common/generic/base.repository.js';

@Injectable()
export class UsersRepository extends BaseRepository<AuthDocument> {
  constructor(@InjectModel(AuthEntity.name) model: Model<AuthDocument>) {
    super(model);
  }
}
