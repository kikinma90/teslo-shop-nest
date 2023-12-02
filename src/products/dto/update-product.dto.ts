// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Si importas PartialType desde mapped-types no tienes los decoradores para el swagger, por eso 
// Nest te deja importarlo desde swagger que si tiene estos decoradores para la documentacion
export class UpdateProductDto extends PartialType(CreateProductDto) {}
