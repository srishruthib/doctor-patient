import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DoctorService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorService: DoctorService) { }

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
    return this.doctorService.findDoctorById(+id);
  }

  // ➕ Create doctor (Protected with JWT)
  @UseGuards(JwtAuthGuard)
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }

  // ✅ Get current doctor profile (Protected)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getDoctorProfile(@Req() req: Request) {
    return req.user; // Returns user data from decoded JWT
  }
}
