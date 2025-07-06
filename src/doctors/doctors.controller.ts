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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Get()
  searchDoctors(
    @Query('name') name: string,
    @Query('specialization') specialization: string,
  ) {
    return this.doctorsService.search(name, specialization);
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/availability')
  getAvailability(
    @Param('id') id: string,
    @Query('date') date?: string,
    @Query('start_time') start_time?: string,
  ) {
    return this.doctorsService.getAvailability(id, date, start_time);
  }
}
