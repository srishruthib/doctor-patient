// src/auth/dto/auth-signin.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthSigninDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}
