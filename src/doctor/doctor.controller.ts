// src/doctor/doctor.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Req, // Make sure Req is imported
} from '@nestjs/common';
// ====> CRITICAL FIX: CHANGE THIS LINE <====
import { DoctorService } from './doctor.service'; // REVERTED from 'require' to 'from'
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/dto/auth-signup.dto';
import { Doctor } from '../entities/Doctor'; // Make sure Doctor entity is imported

@Controller('doctors')
export class DoctorController {
    constructor(private readonly doctorService: DoctorService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() createDoctorDto: CreateDoctorDto) {
        return this.doctorService.create(createDoctorDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    // @UseGuards(JwtAuthGuard)
    findAll(@Query('name') name?: string, @Query('specialization') specialization?: string) {
        return this.doctorService.findAllDoctors(name, specialization);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    // @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.doctorService.findDoctorById(+id);
    }

    /**
     * @route GET /doctors/profile
     * @description Retrieves the profile of the authenticated doctor.
     * @access Doctor (login required)
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    async getProfile(@Req() req: any) {
        const doctorId = parseInt(req.user?.sub, 10);

        if (isNaN(doctorId) || !doctorId) {
            throw new BadRequestException('Invalid Doctor ID in token payload.');
        }

        const doctorProfile = await this.doctorService.getDoctorProfile(doctorId);
        return doctorProfile;
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR, Role.ADMIN)
    update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
        return this.doctorService.update(+id, updateDoctorDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.doctorService.remove(+id);
    }

    @Post(':id/availability')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    setAvailability(
        @Param('id') id: string,
        @Body() createAvailabilityDto: CreateDoctorAvailabilityDto,
    ) {
        return this.doctorService.setDoctorAvailability(+id, createAvailabilityDto);
    }

    @Get(':id/availability/slots')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    getAvailableTimeSlots(
        @Param('id') id: string,
        @Query('date') date: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        if (!date) {
            throw new BadRequestException('Date query parameter is required.');
        }
        return this.doctorService.getDoctorAvailableTimeSlots(+id, date, +page, +limit);
    }
}
