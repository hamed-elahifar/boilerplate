import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { t } from '../../common/utils/i18n';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Not decorated with @Roles(): any authenticated user may pass.
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<Request>() as {
      user?: { roles?: RolesEnum | RolesEnum[] };
    };

    if (!user) throw new UnauthorizedException(t('errors.userMissing'));

    const roles = [user.roles ?? []].flat();
    if (!requiredRoles.some((role) => roles.includes(role))) {
      throw new UnauthorizedException(t('errors.roleForbidden'));
    }

    return true;
  }
}
