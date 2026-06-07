import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../common/enum/estado.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolUsuario[]): MethodDecorator => {
  return (target: Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor!.value);
    return descriptor;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = () => requiredRoles.some((role) => user.rol === role);

    if (!hasRole()) {
      throw new ForbiddenException(`Se requieren los siguientes roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
