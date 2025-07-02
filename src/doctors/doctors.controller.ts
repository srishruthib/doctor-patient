import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorService: DoctorService) { }

  // ✅ Get current doctor profile (Protected)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getDoctorProfile(@Req() req: Request) {
    return this.doctorService.findDoctorById(req.user['sub']); // safer: use service to fetch full profile
  }

  // 🔍 Public search with query params
  @Get()
  searchDoctors(
    @Query('name') name: string,
    @Query('specialization') specialization: string,
  ) {
    return this.doctorService.findAllDoctors(name, specialization);
  }

  // 📄 Get a doctor by ID
  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    const doctorId = Number(id);
    if (isNaN(doctorId)) {
      throw new BadRequestException('Invalid doctor ID');
    }
    return this.doctorService.findDoctorById(doctorId);
  }

  // ➕ Create doctor (Protected with JWT)
  @UseGuards(JwtAuthGuard)
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }
}
