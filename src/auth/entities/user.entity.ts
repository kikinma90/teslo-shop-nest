
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities";

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

    @Column('text',{
        // Sirve para que cuando hagamos un find este campo no se devuelva y por lo tanto no se muestre
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    // Relacion un usuario muchos productos
    @OneToMany(
        // Se va a relacionar con la entidad Product
        () => Product,
          // El User sabe que se tiene que relacionar con product a traves de product.user
        (product) => product.user
    )
    product: Product;

    @BeforeInsert()
    checkFieldBeforeInsert(){
        this.email = this.email.toLocaleLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldBeforeInsert();
    }

}
