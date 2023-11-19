import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class LoginUserDto {

    // Para que esto luzca como un DTO  a su vez haga las validaciones hay que establecer que tipo de informacion es
    // No extendemos de PartialType porque haríamos todo opcional y necesitamos que estos dos campos vengan informados
    @IsString()
    @IsEmail()
    email: string;

    // Matches es para validar que el password tenga una mayuscula, minuscula y un numero (Se ponen aqui expresiones regulares)
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

}