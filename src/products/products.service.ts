import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid';
import { ProductImage, Product } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  

  private readonly logger = new Logger('ProductsService');

  // Se aconseja usar el patron repositorio, que es el que se va a encargar 
  // de hacer las iteraciones con la base de datos

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly datasource: DataSource,

  ) {}
  
  // Se pone async ya que todo lo que se maneje con la base de datos es asincrono
  async create(createProductDto: CreateProductDto, user: User) {
    
    try {

      const {images = [], ...productDtetails} = createProductDto

      // Crea nuestra instancia del producto con sus propiedades,
      // no lo insertamos en la DB aun
      const product = this.productRepository.create({
        ...productDtetails,
        images: images.map(image => this.productImageRepository.create({url: image})),
        user,
      });

      // Insertamos el producto en la DB
      await this.productRepository.save(product);

      return {...product, images};

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(({images, ...rest}) => ({
      ...rest,
      images: images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)){
      product = await this.productRepository.findOneBy({id:term}); 
    } else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`,{
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne();
    }
    
    if (!product) 
      throw new NotFoundException (`Product with id: ${term} not found`)

    return product;
  }
  
  async findOnePlain (term:string){
    const {images = [], ...rest} = await this.findOne(term);

    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({id, ...toUpdate});

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    // Create query runner
    // Utilizamos el query runner para realizar transaciones
    // Entendiendose transaciones como una serie de querys que pueden impactar la base de datos: como actualizar, eliminar, insertar
    // Pero hasta que no le hacen un commit no se va a impactar la base de datos.
    const queryRunner = this.datasource.createQueryRunner();
    // Primero nos conectamos al query runner
    await queryRunner.connect();
    // Despues iniciamos la transacion
    await queryRunner.startTransaction();
  


    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        
        product.images = images.map(image => this.productImageRepository.create({url: image}));
      } else {

      }

      product.user = user;

      await queryRunner.manager.save(product);

      //await this.productRepository.save(product);

      await queryRunner.commitTransaction();
      // Si todo sale bien, liberamos el query runner
      await queryRunner.release();

      return this.findOnePlain(id);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {

    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any){
    if (error.code === '23505') 
        throw new BadRequestException(error.detail);
      
      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

}
