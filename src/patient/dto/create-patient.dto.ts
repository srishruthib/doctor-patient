// src/patient/dto/create-patient.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../auth/dto/auth-signup.dto'; // Assuming Role enum is here

export class CreatePatientDto {
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
    role: Role; // Should be 'patient' for patient creation

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
