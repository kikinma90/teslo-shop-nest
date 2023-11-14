
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// El objetivo de las entidades es tener una realcion entre la base de datos y el codigo, es decir 
// entre las tablas de nuestra base de datos y nuestra aplicacion 
@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text')
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        unique: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

}
