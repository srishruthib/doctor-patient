// src/auth/dto/auth-signup.dto.ts
import {
    IsEmail,
    IsString,
    MinLength,
    IsEnum,
    IsOptional,
    IsNumber,
    IsPhoneNumber, // Ensure this is imported
    IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Role {
    DOCTOR = 'doctor',
    PATIENT = 'patient',
}

export class AuthSignupDto {
    @IsString()
    @IsOptional()
    first_name?: string;

    @IsString()
    @IsOptional()
    last_name?: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @IsOptional()
    password?: string;

    @IsEnum(Role)
    role: Role;

    @IsString()
    @IsOptional()
    @IsPhoneNumber() // CHANGED: Removed 'ZZ' parameter for generic international validation
    phone_number?: string;

    // Doctor specific fields
    @IsString()
    @IsOptional()
    specialization?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    experience_years?: number;

    @IsString()
    @IsOptional()
    education?: string;

    @IsString()
    @IsOptional()
    clinic_name?: string;

    @IsString()
    @IsOptional()
    clinic_address?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    available_days?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    available_time_slots?: string[];

    // Patient specific fields
    @IsString()
    @IsOptional()
    address?: string;
}
