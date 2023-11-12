import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { fileFilter, fileNamer } from './helpers/index';
import { diskStorage } from 'multer';
import { Response } from 'express';

import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    // al poner el decorador res la aplicacion se queda pillada esperando una respuesta, al utilizar este decorador rompen la funcionalidad de nest en este metodo, 
    // sl poner este decorador lo que se le dice a nest es no emitas tu la respuesta, me encargo yo de emitir mi respuesta manualmente.
    // al hacerlo de este manera se saltan interceptores que se tengan definidos, se saltan restricciones, se saltan ciertos pasos del ciclo de vida de nest
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
    // res.status(201).json({
    //   ok: true,
    //   path: path
    // })

  }

  // Para cargar ficheros lo tienes que hacer como post, tambien puede seer como put o patch, pero se suele hacer como post siempre
  // recuerda un @ es un decorador
  @Post('product')
  // Ahora utilizamos un interceptor para que nos devuelva el fichero
  // FileInterceptor es solo si estas usando express, si estas usando fastify tienes que buscar otro
    @UseInterceptors(FileInterceptor('file', {
      // Mando solo la referencia no lo ejecuto, quien se encarga de ejecutarlo es el interceptor
      fileFilter: fileFilter,
      // limites de tamaño
      //limits: {fileSize: 1000},
      // storage es donde lo queremos guardar, 
      // no es aconsejable guardarlo en el pryecto, lo mejor es guardarlo en un servidor externo como aws o google cloud o azure.
      storage: diskStorage({
        // destination es donde lo queremos guardar
        destination: './static/products',
        // filename es el nombre que le vamos a poner
        filename: fileNamer,
      })

    }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ){

    if (!file) { 
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {secureUrl};
  };

}
