import { existsSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {

    getStaticProductImage(imageName: string) {

        // COnstruimos el path con join que es propio de node
        const path = join(__dirname, `../../static/products/${imageName}`);

        if (!existsSync(path))
            throw new BadRequestException(`No product found with image ${imageName}`)

        return path;

    }
}
