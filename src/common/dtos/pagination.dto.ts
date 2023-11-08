import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    // Transformar
    @Type(() => Number)// Esto se puede sustituir por: enableImplicitConversions: true => transforma el string en number
    limit?: number;
    
    
    @IsOptional()
    @Min(0)
    @Type(() => Number)// Esto se puede sustituir por: enableImplicitConversions: true => transforma el string en number
    offset?: number;
}