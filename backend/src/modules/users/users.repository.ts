import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDocument, AuthEntity } from '../auth/auth.model';
import { BaseRepository } from '../common/generic/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<AuthDocument> {
  constructor(@InjectModel(AuthEntity.name) model: Model<AuthDocument>) {
    super(model);
  }
}
