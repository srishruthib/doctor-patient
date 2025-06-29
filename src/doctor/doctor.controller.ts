// src/doctor/doctor.controller.ts
import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe, // KEEP THIS IMPORT, as it's used by findOne and setAvailability
    Req,
    ForbiddenException,
    BadRequestException, // <--- MAKE SURE THIS IS IMPORTED!
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/dto/auth-signup.dto';
import * as express from 'express';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
    constructor(private readonly doctorService: DoctorService) { }

    @Get()
    @Roles(Role.DOCTOR, Role.PATIENT)
    async findAll(@Query('name') name?: string, @Query('specialization') specialization?: string) {
        return this.doctorService.findAllDoctors(name, specialization);
    }

    @Get(':id')
    @Roles(Role.DOCTOR, Role.PATIENT)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.doctorService.findDoctorById(id);
    }

    @Post(':id/availability')
    @Roles(Role.DOCTOR)
    async setAvailability(
        @Param('id', ParseIntPipe) id: number,
        @Body() createAvailabilityDto: CreateAvailabilityDto,
        @Req() req: express.Request,
    ) {
        const user = req.user as any;
        if (user.role !== Role.DOCTOR || user.sub !== id) {
            throw new ForbiddenException('You can only set availability for your own doctor profile.');
        }
        return this.doctorService.setDoctorAvailability(id, createAvailabilityDto);
    }

    /**
     * GET /doctors/:id/availability
     * Allows patients to view a doctor’s availability (time slots).
     * Access: Patient only
     * Supports date filtering and pagination.
     *
     * IMPORTANT: Manually parsing parameters to bypass ParseIntPipe issue.
     */
    @Get(':id/availability')
    @Roles(Role.PATIENT)
    async getAvailability(
        @Param('id') idString: string, // Changed to string for manual parsing
        @Query('date') date?: string,
        @Query('page') pageString?: string, // Changed to string for manual parsing
        @Query('limit') limitString?: string, // Changed to string for manual parsing
    ) {
        // Manually parse 'id' from path and validate
        const id = parseInt(idString, 10);
        if (isNaN(id)) {
            throw new BadRequestException('Doctor ID in path must be a valid number.');
        }

        // Manually parse 'page' from query and validate
        let page: number = 1; // Default value
        if (pageString !== undefined) {
            const parsedPage = parseInt(pageString, 10);
            if (isNaN(parsedPage) || parsedPage < 1) {
                throw new BadRequestException('Page must be a positive number.');
            }
            page = parsedPage;
        }

        // Manually parse 'limit' from query and validate
        let limit: number = 10; // Default value
        if (limitString !== undefined) {
            const parsedLimit = parseInt(limitString, 10);
            if (isNaN(parsedLimit) || parsedLimit < 1) {
                throw new BadRequestException('Limit must be a positive number.');
            }
            limit = parsedLimit;
        }

        // Call the service with the correctly parsed numeric values
        return this.doctorService.getDoctorAvailableTimeSlots(id, date, page, limit);
    }
}
