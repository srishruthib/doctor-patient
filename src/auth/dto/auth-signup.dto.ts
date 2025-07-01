// src/auth/dto/auth-signup.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

// Define the Role enum with uppercase string values as suggested by the error
export enum Role {
    Doctor = 'DOCTOR',
    Patient = 'PATIENT',
}

export class AuthSignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEnum(Role, { message: 'Role must be either DOCTOR or PATIENT' })
    @IsNotEmpty()
    role: Role;

    // Optional fields for Doctor
    @IsOptional()
    @IsString()
    specialization?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    address?: string;
}

export class AuthSignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
