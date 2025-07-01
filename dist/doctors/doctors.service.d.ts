import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
export declare class DoctorsService {
    private readonly doctorRepo;
    constructor(doctorRepo: Repository<Doctor>);
    search(name?: string, specialization?: string): Promise<Doctor[]>;
    getById(id: string): Promise<Doctor>;
    create(dto: CreateDoctorDto): Promise<Doctor>;
}
