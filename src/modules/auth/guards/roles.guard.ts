import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, Users } from '@chronoco/entities/users.entity';

export const ROLES_KEY = 'roles';
export function Roles(...roles: UserRole[]) {
  return SetMetadata(ROLES_KEY, roles);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: Users }>();
    const user = request?.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return requiredRoles.includes(user.role);
  }
}


