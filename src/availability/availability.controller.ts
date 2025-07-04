// src/availability/availability.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { DoctorAvailability } from '../entities/DoctorAvailability'; // Assuming this path
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming this path

// --- CRITICAL IMPORTS TO CHECK ---
import { RolesGuard } from '../auth/guards/roles.guard'; // <--- CORRECTED PATH
import { Roles } from '../auth/decorators/roles.decorator'; // <--- CORRECTED PATH
import { Role } from '../common/constraints/roles.enum'; // This path seems correct based on previous info
// --- END CRITICAL IMPORTS ---

@Controller('doctors') // Base route for doctor-related operations
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) { }

    @Post(':id/availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Doctor) // Only doctors can set their availability
    @HttpCode(HttpStatus.CREATED) // Return 201 Created on success
    async setDoctorAvailability(
        @Param('id') doctorId: number,
        @Body() createAvailabilityDto: CreateAvailabilityDto,
    ): Promise<{ message: string; availability?: DoctorAvailability }> {
        // Implement logic to set availability and divide into time slots
        const availability = await this.availabilityService.setDoctorAvailability(
            +doctorId, // Convert doctorId to number
            createAvailabilityDto,
        );
        return { message: 'Doctor availability set successfully and slots generated.', availability };
    }

    @Get(':id/availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Patient) // Only patients can view doctor availability
    @HttpCode(HttpStatus.OK)
    async getDoctorAvailability(
        @Param('id') doctorId: number,
        @Query('date') date?: string, // Optional date query parameter
        @Query('page') page: number = 1, // For pagination
        @Query('limit') limit: number = 10, // For pagination
    ) {
        // Implement logic to fetch available time slots
        const { slots, total } = await this.availabilityService.getDoctorAvailability(
            +doctorId, // Convert doctorId to number
            date,
            page,
            limit,
        );
        return {
            message: 'Doctor availability retrieved successfully.',
            data: slots,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
