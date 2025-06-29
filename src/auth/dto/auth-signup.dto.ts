// src/auth/dto/auth-signup.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum Role {
    DOCTOR = 'doctor',
    PATIENT = 'patient',
}

// Re-using common properties for signup and signin
export class AuthBaseDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50)
    password: string;
}

// DTO for user registration (signup)
export class AuthSignupDto extends AuthBaseDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @IsOptional()
    @IsString()
    phone_number?: string;

    // Doctor specific fields (optional for patients, required for doctors)
    @IsOptional()
    @IsString()
    specialization?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number) // Ensure it's transformed to a number
    experience_years?: number;

    @IsOptional()
    @IsString()
    education?: string;

    @IsOptional()
    @IsString()
    clinic_name?: string;

    @IsOptional()
    @IsString()
    clinic_address?: string;

    // Patient specific fields (optional for doctors, required for patients)
    @IsOptional()
    @IsString()
    address?: string;
}

// DTO for user signin (login) - THIS WAS THE MISSING/INCORRECTLY DEFINED PART
export class AuthSignInDto extends AuthBaseDto { }

