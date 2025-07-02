// src/doctors/doctors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctors.service'; // Corrected import: Changed DoctorsService to DoctorService
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorService: DoctorService) { } // Corrected usage: Changed doctorsService to doctorService

  // 🔍 Public search with query params
  @Get()
  searchDoctors(
    @Query('name') name: string,
    @Query('specialization') specialization: string,
  ) {
    // Assuming the service method is search, if not, adjust here
    return this.doctorService.findAllDoctors(name, specialization); // Changed to match previous service method name
  }

  // 📄 Get a doctor by ID
  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    // Assuming the service method is findDoctorById, if not, adjust here
    return this.doctorService.findDoctorById(+id); // Changed to match previous service method name, converted id to number
  }

  // ➕ Create doctor (Protected with JWT)
  @UseGuards(JwtAuthGuard)
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }
}
