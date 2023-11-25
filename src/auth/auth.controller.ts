import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/';
import { Auth, GetUser, RawHeaders } from './decorators/index';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  
  @Post('login')
  loginuser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,

  ){
    return this.authService.checkAuthStatus(user);
  }

  // Todo son rutas publicas, para hacerlas privadas usamos el decorador @UseGuards, que va a verificar en este caso el jwt
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // Esto se llama decorador de parametros o de properties, y lo que hace es que le decimos que queremos que nos inyecte el usuario en este parametro
    // Utilizamos nuestro custom decorator para obtener el usuario
    // Detras de email se le puede añadir los pipes que queramos
    @Req() request: Express.Request,
    @GetUser() user: User, 
    @GetUser('email') userEmail: String, 
    @RawHeaders() rawHeaders: String[],
  ) {
    return {
      ok: true,
      message: 'This route is private',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  // Usamos los roles para que solo puedan acceder quien tenga esos roles
  //@SetMetadata('roles', ['admin','super-user'])
  // para tener en cuenta los roles nescesitamos crear un guard para que se encargue de verificar los roles
  // al ser tus guards personalizados se llaman sin parentesis, el autguard de passport si los lleva porque devulve una isntancia de la clase
  @RoleProtected(ValidRoles.superUser, ValidRoles.superUser,)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  // Si en Auth no pasamos ningun parametro, el decorador de roles no se ejecuta, por lo que no se verifica el rol y con que tenga 
  // el token activo es suficiente
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      user,
    };
  }
}


