// src/common/dto/pagination.dto.ts
import { IsOptional, IsNumberString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number) // Ensure it's transformed to a number
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number) // Ensure it's transformed to a number
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
