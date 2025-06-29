// src/doctor/dto/create-doctor.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator'; // <-- ADD IsEnum HERE
import { Type } from 'class-transformer';
import { Role } from '../../auth/dto/auth-signup.dto';

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

    @IsEnum(Role) // This is where IsEnum is used
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
    @Type(() => Number)
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
