import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { ProductImage } from './';
import { User } from "../../auth/entities/user.entity";

//Un Entity es como una tabla de la base de datos
// Lo que hay dentro del entity es para renombrar las tablas de la base de datos
@Entity({name: 'products'})

export class Product {

    @ApiProperty({
        example: '98f3bbe4-9081-4c00-9212-a092e307e304',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Ullamco id nostrud sint qui.',
        description: 'Product description',
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product Slug - for SEO',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['S','L'],
        description: 'Product Sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Men',
        description: 'Product Gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['98f3bbe4-9081-4c00-9212-a092e307e304'],
        description: 'Product tags',
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty({
        example: '',
        description: 'Product Images',
    })
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
