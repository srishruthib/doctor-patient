// src/doctors/doctors.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateScheduleTypeDto } from './dto/update-schedule-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/constraints/roles.enum';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getDoctorById(+id); // <--- CORRECTED METHOD NAME AND TYPE CONVERSION
  }

  @Get('search') // Added this based on your previous screenshot, if it's new
  searchDoctors(
    @Query('name') name: string,
    @Query('specialization') specialization: string,
  ) {
    return this.doctorsService.search(name, specialization);
  }

  // New endpoint to update doctor's schedule_Type
  @Patch(':id/schedule_Type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor)
  @HttpCode(HttpStatus.OK)
  async patchScheduleType(
    @Param('id') id: string,
    @Body() updateScheduleTypeDto: UpdateScheduleTypeDto,
  ) {
    const doctor = await this.doctorsService.updateScheduleType(+id, updateScheduleTypeDto.schedule_Type);
    return { message: 'Doctor schedule type updated successfully.', doctor };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateScheduleTypeDto) {
    return this.doctorsService.update(+id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }

  // This is the getAvailability method from your screenshot
  @UseGuards(JwtAuthGuard) // Assuming this is correct from your screenshot
  @Get(':id/availability')
  getAvailability(
    @Param('id') id: string,
    @Query('date') date?: string,
    @Query('start_time') start_time?: string,
  ) {
    return this.doctorsService.getAvailability(+id, date, start_time); // <--- CORRECTED TYPE CONVERSION
  }
}
