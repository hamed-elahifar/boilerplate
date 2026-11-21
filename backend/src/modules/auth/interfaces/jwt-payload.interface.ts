import { RolesEnum } from '../enums/roles.enum.js';

export interface JwtPayload {
  userID: string;
  username?: string;
  roles?: RolesEnum | RolesEnum[] | undefined;
}
