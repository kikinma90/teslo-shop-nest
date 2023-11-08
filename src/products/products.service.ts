import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid';
import { ProductImage, Product } from './entities';

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
  ) {}
  
  // Se pone async ya que todo lo que se maneje con la base de datos es asincrono
  async create(createProductDto: CreateProductDto) {
    
    try {

      const {images = [], ...productDtetails} = createProductDto

      // Crea nuestra instancia del producto con sus propiedades,
      // no lo insertamos en la DB aun
      const product = this.productRepository.create({
        ...productDtetails,
        images: images.map(image => this.productImageRepository.create({url: image}))
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

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save(product);
      return product;
      
    } catch (error) {
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
}
