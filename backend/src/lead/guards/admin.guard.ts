import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard para validar que el usuario es ADMIN
 * En un proyecto real, verificarías un token JWT o sesión
 * Por ahora es un guard básico que puedes extender
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // TODO: Implementar lógica de verificación de admin
    // Por ahora, solo un ejemplo básico
    const isAdmin = request.headers['x-admin'] === 'true';

    if (!isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden realizar esta acción',
      );
    }

    return true;
  }
}
