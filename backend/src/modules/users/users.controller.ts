import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthDocument, AuthEntity } from '../auth/auth.model';
import { RolesEnum } from '../auth/enums/roles.enum';
import { BaseController } from '../common/generic/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

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
