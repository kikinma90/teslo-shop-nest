import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./";

// Lo que hay dentro del entity es para renombrar las tablas de la base de datos
@Entity({name: 'product_images'})
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(
    () => Product,
    (product) => product.images,
    {onDelete: 'CASCADE'}
  )
  product: Product;
}