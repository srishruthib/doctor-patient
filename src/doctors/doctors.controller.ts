
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
  }
}
