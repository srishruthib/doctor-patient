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
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/dto/auth-signup.dto';
import { Patient } from '../entities/Patient';

@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.ADMIN)
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientService.create(createPatientDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    findAll() {
        return this.patientService.findAll();
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PATIENT)
    async getProfile(@Req() req: any) {
        const user = req.user as Patient;
        const patientProfile = await this.patientService.getPatientProfile(user.id);
        return patientProfile;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.patientService.findOne(+id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PATIENT, Role.ADMIN)
    update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientService.update(+id, updatePatientDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.patientService.remove(+id);
    }
}
