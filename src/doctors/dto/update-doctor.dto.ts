// src/doctors/dto/update-doctor.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
    // You can add specific validation rules for update if needed,
    // but PartialType makes all properties of CreateDoctorDto optional.
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    first_name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    last_name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    specialization?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
