// src/patient/patient.controller.ts
import { Controller, Get, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
    constructor(private readonly patientService: PatientService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('patient')
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getPatientProfile(@Request() req: any) {
        const patientId = req.user.sub;
        const patientProfile = await this.patientService.getPatientProfile(patientId);
        return { message: 'Patient profile accessed successfully', profile: patientProfile };
    }
}
