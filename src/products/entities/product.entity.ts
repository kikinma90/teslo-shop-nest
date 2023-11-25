import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './';
import { User } from "../../auth/entities/user.entity";

//Un Entity es como una tabla de la base de datos
// Lo que hay dentro del entity es para renombrar las tablas de la base de datos
@Entity({name: 'products'})

export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text',{
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    // Relacion muchos productos un usuario
    @ManyToOne(
        // Se va a relacionar con la entidad User
        () => User,
        // El usuario sabe que se tiene que relacionar con user a traves de user.product
        (user) => user.product,
        // Cuando se cargue un producto cargue automaticamente esta relacion 
        {eager: true}
    )
    user: User;

    @BeforeInsert()
    checkSlug(){

        if (!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');

    }

    @BeforeUpdate()
    checkSlugUpUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');
    }


    

}
