// src/patient/dto/update-patient.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { Role } from '../../auth/dto/auth-signup.dto'; // Assuming Role is here

// Extends CreatePatientDto but makes all properties optional for updates
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
    // You can add specific validation rules for update operations here if needed,
    // or override rules from CreatePatientDto.

    // Example of overriding a property if needed:
    @IsOptional()
    @IsEmail()
    email?: string; // Allow email to be optional and validated if present

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    password?: string; // Allow password to be optional for update

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
    address?: string;

    // Role should generally not be changed via update DTO unless explicit business logic allows
    // @IsOptional()
    // @IsEnum(Role)
    // role?: Role;
}
