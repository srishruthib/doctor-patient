import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsString()
  @IsNotEmpty()
  available_from: string;

  @IsString()
  @IsNotEmpty()
  available_to: string;

  @IsString()
  @IsNotEmpty()
  bio: string; // ✅ Add this
}
