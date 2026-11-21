import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthDocument } from '../auth/auth.model.js';
import { BaseService } from '../common/generic/base.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/index.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService extends BaseService<
  AuthDocument,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(repository: UsersRepository) {
    super(repository, 'User');
  }

  // The generic service stores what it is given; passwords must be hashed first.
  async create(dto: CreateUserDto): Promise<AuthDocument> {
    return super.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<AuthDocument> {
    return super.update(id, {
      ...dto,
      ...(dto.password && { password: await bcrypt.hash(dto.password, 10) }),
    });
  }
}
