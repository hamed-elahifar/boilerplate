import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule], // exports the AuthEntity model
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
