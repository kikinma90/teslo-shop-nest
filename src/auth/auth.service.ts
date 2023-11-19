import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';

// Cuando pones * as algo es una forma ligera de hacer el patron adaptador, en este caso se puede implementar el patron adaptador
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto/';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

  // Como necesitamos acceso al repositorio para hacer cosas en la base de datos, vamos a injectar las dependencias del repositorio en el constructor
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Este servicio es proveido por NestJS y a su vez por JwtModule
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {

      const {password, ...userData} = createUserDto;

      // Al create se le pasa algo que luzca como un usuario, es decir, que tenga las propiedades de un usuario
      const user = this.userRepository.create({
        ...userData,
        // Lo que hace es generar una pass cada vez, el 10 es como el nunmero de veces que se va a ejecutar el algoritmo
        password: await bcrypt.hash(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

     
      // Generar el JWT que autentifica a este usuario
      return {
        // Exparcimos todas las propiedades del usuario
        ...user,
        // Llamamos a nuestra funcion para generar el JWT, que hay que enviarle un objeto que yo tenga el email del usuario, para que cumpla JwtPayload.
        token: this.getJwtToken({email: user.email})
      };

    } catch (error) {

      this.handleDBErrors(error);
    }
  }

  async login(LoginUserDto: LoginUserDto){
    const {email, password} = LoginUserDto;

    const user = await this.userRepository.findOne({
      // Campo por el que se busca
      where: {email},
      // Campos que devuelve
      select: {email: true, password: true}
    });

    if (!user) 
      throw new BadRequestException('Credentials are not valid (email)');
    
    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('Credentials are not valid (password)');

    return {
      ...user,
      // Llamamos a nuestra funcion para generar el JWT, que hay que enviarle un objeto que yo tenga el email del usuario, para que cumpla JwtPayload.
      token: this.getJwtToken({email: user.email})
    };
    // JWT es un string que está cifrado y por lo cual va a saber mi backend si el string ha sido manipulado o no

  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  // Never es que esta funcion nunca devuelve nada
  private handleDBErrors(error: any): never {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);
    
    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

  }

}
