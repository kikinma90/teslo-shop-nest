import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // Para poder utilizar el Auth en otros modulos como aqui en seed, tenemos que exportarlo y exponer ese auth de manera visible
  //@Auth(ValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }

}
