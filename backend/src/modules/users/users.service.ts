import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthDocument } from '../auth/auth.model';
import { BaseService } from '../common/generic/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

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
