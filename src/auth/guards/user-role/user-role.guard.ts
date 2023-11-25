import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  // Para que un guard funcione, tiene que implementar la interfaz CanActivate, que tiene un metodo canActivate
  // Este metodo recibe un contexto, que es el contexto de ejecucion de la peticion
  // Este metodo tiene que devolver un booleano, una promesa de un booleano o un observable que emita un valor booleano, 
  // devuelve true que lo deja pasar o false que no

  constructor (
    // reflector me ayuda a ver informacion de los decoradores y de otra informacion de los metadatos
    private readonly reflector: Reflector,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]]`
    )
  }
}
