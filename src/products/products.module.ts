import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities/index';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // la palabra imports es para importar modulos
  // Solo hay un forroot en toda la aplicacion
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    AuthModule,
  ], 
  exports: [
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
