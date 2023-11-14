import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  // Importamos typeorm de nuestra entity para que se conecte a la DB y aparezca esta entidad en la DB
  imports: [
    TypeOrmModule.forFeature([User]),
  ], 

  // Exportamos TypeOrm para usarlo en el resto de la aplicacion que lo necesite y que no sea en auth, asi exportamos 
  // toda la configuracion tal cual la tenemos aqui.
  exports: [
    TypeOrmModule
  ]
})
export class AuthModule {}
