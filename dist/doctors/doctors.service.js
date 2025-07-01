"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const doctor_entity_1 = require("./doctor.entity");
let DoctorsService = class DoctorsService {
    constructor(doctorRepo) {
        this.doctorRepo = doctorRepo;
    }
    async search(name, specialization) {
        const where = {};
        if (name)
            where.name = (0, typeorm_2.ILike)(`%${name}%`);
        if (specialization)
            where.specialization = (0, typeorm_2.ILike)(`%${specialization}%`);
        return this.doctorRepo.find({ where });
    }
    async getById(id) {
        const doctor = await this.doctorRepo.findOne({ where: { id } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        return doctor;
    }
    async create(dto) {
        const doctor = this.doctorRepo.create(dto);
        return this.doctorRepo.save(doctor);
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map