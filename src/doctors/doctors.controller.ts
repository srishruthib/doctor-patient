<<<<<<< HEAD
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // 🔍 Public search with query params
  @Get()
  searchDoctors(
    @Query('name') name: string,
    @Query('specialization') specialization: string,
  ) {
    return this.doctorsService.search(name, specialization);
  }

  // 📄 Get a doctor by ID
  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getById(id);
  }

  // ➕ Create doctor (Protected with JWT)
  @UseGuards(JwtAuthGuard)
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
=======

import { Controller, Get, Query, Param } from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorService: DoctorsService) {}

  @Get()
  search(@Query('name') name: string, @Query('specialization') specialization: string) {
    return this.doctorService.search(name, specialization);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.doctorService.getById(id);
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
  }
}
