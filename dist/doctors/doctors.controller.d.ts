import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    searchDoctors(name: string, specialization: string): Promise<import("./doctor.entity").Doctor[]>;
    getDoctorById(id: string): Promise<import("./doctor.entity").Doctor>;
    createDoctor(dto: CreateDoctorDto): Promise<import("./doctor.entity").Doctor>;
}
