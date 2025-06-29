// src/doctor/dto/create-doctor.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../auth/dto/auth-signup.dto'; // Correct relative path to Role enum

export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50)
    password: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role; // Should be 'doctor' for doctor creation

    @IsOptional()
    @IsString()
    phone_number?: string;

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
}
