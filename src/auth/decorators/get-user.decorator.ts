import { ExecutionContext, InternalServerErrorException, createParamDecorator } from '@nestjs/common';



export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user) 
        // Error 500, es error del servidor, del backend, en este caso que no se ha encontrado el usuario, por lo tanto los guards no han funcionado
            throw new InternalServerErrorException('User not found');
        
        return (!data) 
            ? user 
            : user[data];
    }
);