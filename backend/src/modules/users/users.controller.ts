import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthDocument, AuthEntity } from '../auth/auth.model.js';
import { RolesEnum } from '../auth/enums/roles.enum.js';
import { BaseController } from '../common/generic/base.controller.js';
import { CreateUserDto, UpdateUserDto } from './dto/index.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Roles(RolesEnum.ADMIN)
@Controller('users')
export class UsersController extends BaseController<
  AuthDocument,
  CreateUserDto,
  UpdateUserDto
>(AuthEntity, CreateUserDto, UpdateUserDto, 'User') {
  constructor(usersService: UsersService) {
    super(usersService);
  }
}
