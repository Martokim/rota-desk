import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { MemberRole } from '../../members/schemas/member.schema';

interface AuthenticatedRequest {
  user?: {
    sub: string;
    role: MemberRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the roles allowed on this route.
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles were specified, don't impose a role restriction.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the authenticated user attached by JwtAuthGuard.
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Reject requests without an authenticated user or permitted role.
    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}