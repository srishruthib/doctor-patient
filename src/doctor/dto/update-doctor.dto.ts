// src/doctor/dto/update-doctor.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../auth/dto/auth-signup.dto'; // Ensure Role enum is imported

// Extends CreateDoctorDto but makes all properties optional for updates
export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    password?: string;

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

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
