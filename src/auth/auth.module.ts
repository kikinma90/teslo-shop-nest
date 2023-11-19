import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Importamos typeorm de nuestra entity para que se conecte a la DB y aparezca esta entidad en la DB
  imports: [

    ConfigModule,

    TypeOrmModule.forFeature([User]),

    PassportModule.register({defaultStrategy: 'jwt'}),

    JwtModule.registerAsync({
      // Para importar modulos
      imports: [ConfigModule],
      // Para injeccion de dependencias, por si necesitamos algun servicio en el modulo, primero se inyecta el m'odulo y luego el servicio, si el
      // servicio no existe en el modulo que se inyecta entonces va a dar error
      inject: [ConfigService],
      // Funcion a la que vamos a llamar cuando se intente registar de manera asincrona el módulo
      // Se puede retornar el objeto direcatamente simplemente haciendo () => ({})
      // La inyeccion de dependecia se hace en los parentesis de la funcion
      useFactory: (configService: ConfigService) => {
        // Las dos formas son validas para obtener el valor de una variable de entorno, pero con configService puedes tener validaciones
        // console.log('JWT Secret', configService.get('JWT_SECRET'));
        // console.log('JWT SECRET', process.env.JWT_SECRET);
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2H'
          }
        }
      }
    })
    
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2H'
    //   }
    // })

  ], 

  // Exportamos TypeOrm para usarlo en el resto de la aplicacion que lo necesite y que no sea en auth, asi exportamos 
  // toda la configuracion tal cual la tenemos aqui.
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
