import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { ExtractJwt, Strategy } from "passport-jwt";
import { In, Repository } from "typeorm";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

// Todos los strategy son providers, por lo que se pueden inyectar en los controladores(Por eso se utiliza el Injectable)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    // Como nos hace falta uasar la DB para validar el usuario, vamos a inyectar el repositorio de usuarios(entidad), y para ello lo hacemos en el constructor
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
        });
    }

    // Este metodo lo vamos a llamar si el el jwt no ha expirado y si la firma del jwt hace match con el payload
    async validate(payload: JwtPayload): Promise<User> {

        const { email } = payload;

        const user = await this.userRepository.findOneBy({email});

        if (!user) 
            throw new UnauthorizedException('Token not valid');

        if (!user.isActive)
            throw new UnauthorizedException('User is inactive, talk with an admin');



        return user;
    }

}