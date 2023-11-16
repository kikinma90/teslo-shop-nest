import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Cuando pones * as algo es una forma ligera de hacer el patron adaptador, en este caso se puede implementar el patron adaptador
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';


@Injectable()
export class AuthService {

  // Como necesitamos acceso al repositorio para hacer cosas en la base de datos, vamos a injectar las dependencias del repositorio en el constructor
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
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

      return user;
      // TODO: Retornar JWT de acceso

    } catch (error) {

      this.handleDBErrors(error);
    }
  }

  // Never es que esta funcion nunca devuelve nada
  private handleDBErrors(error: any): never {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);
    
    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

  }

}
