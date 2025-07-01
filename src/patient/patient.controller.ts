// src/patient/patient.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/dto/auth-signup.dto'; // No longer needed if using string literals directly for @Roles
import { Patient } from '../entities/Patient';

@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment if you want to protect this endpoint
    // @Roles('ADMIN') // Use the string literal 'ADMIN' if this endpoint should be admin-only
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientService.create(createPatientDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN') // Use the string literal 'ADMIN'
    findAll() {
        return this.patientService.findAll();
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('PATIENT') // Use the string literal 'PATIENT'
    async getProfile(@Req() req: any) {
        // Assuming req.user is populated by JwtAuthGuard and contains the patient's ID
        const patientId = parseInt(req.user?.sub, 10);

        if (isNaN(patientId) || !patientId) {
            throw new BadRequestException('Invalid Patient ID in token payload.');
        }

        const patientProfile = await this.patientService.getPatientProfile(patientId);
        return patientProfile;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN') // Use the string literal 'ADMIN'
    findOne(@Param('id') id: string) {
        return this.patientService.findOne(+id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('PATIENT', 'ADMIN') // Use the string literals 'PATIENT' and 'ADMIN'
    update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientService.update(+id, updatePatientDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN') // Use the string literal 'ADMIN'
    remove(@Param('id') id: string) {
        return this.patientService.remove(+id);
    }
}
