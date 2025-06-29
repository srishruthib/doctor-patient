// src/auth/auth.service.ts
import {
    ConflictException,
    Injectable,
    UnauthorizedException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { RefreshToken } from '../entities/RefreshToken'; // Ensure this is the updated entity
import { AuthSignupDto } from './dto/auth-signup.dto';
import { AuthSigninDto } from './dto/auth-signin.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    private parseJwtExpiryToMs(expiry: string): number {
        const value = parseInt(expiry);
        const unit = expiry.replace(value.toString(), '');

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return value * 60 * 60 * 1000;
        }
    }

    public async generateTokens(userId: number, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY') || '1h',
        });

        const refreshTokenId = uuidv4();
        const rawRefreshToken = this.jwtService.sign(
            { ...payload, jti: refreshTokenId },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d',
            },
        );

        const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);
        const refreshTokenExpiry = new Date(
            Date.now() +
            this.parseJwtExpiryToMs(
                this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d',
            ),
        );

        // No need to fetch doctor/patient explicitly for refresh token saving anymore
        const newRefreshToken = this.refreshTokenRepository.create({
            id: refreshTokenId,
            token: hashedRefreshToken,
            expiresAt: refreshTokenExpiry,
            revoked: false,
            user_id: userId, // Use new user_id column
            user_role: role, // Use new user_role column
        });

        await this.refreshTokenRepository.save(newRefreshToken);

        return {
            accessToken,
            refreshToken: rawRefreshToken,
            role,
        };
    }

    async signup(dto: AuthSignupDto) {
        const { email, password, role } = dto;

        const existingDoctor = await this.doctorRepository.findOne({ where: { email } });
        const existingPatient = await this.patientRepository.findOne({ where: { email } });

        if (existingDoctor || existingPatient) {
            throw new ConflictException('Email already registered');
        }

        let hashedPassword: string | null = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        if (role === 'doctor') {
            const doctor = this.doctorRepository.create({
                ...dto,
                password: hashedPassword,
                googleId: null,
                provider: 'local',
                available_days: dto.available_days || [],
                available_time_slots: dto.available_time_slots || []
            } as Partial<Doctor>);
            const savedDoctor = await this.doctorRepository.save(doctor);
            const tokens = await this.generateTokens(savedDoctor.doctor_id, savedDoctor.email, 'doctor');
            return {
                message: 'Doctor registered successfully',
                role: 'doctor',
                user: { id: savedDoctor.doctor_id, email: savedDoctor.email, first_name: savedDoctor.first_name, role: 'doctor' },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }

        if (role === 'patient') {
            const patient = this.patientRepository.create({
                ...dto,
                password: hashedPassword,
                googleId: null,
                provider: 'local',
            } as Partial<Patient>);
            const savedPatient = await this.patientRepository.save(patient);
            const tokens = await this.generateTokens(savedPatient.patient_id, savedPatient.email, 'patient');
            return {
                message: 'Patient registered successfully',
                role: 'patient',
                user: { id: savedPatient.patient_id, email: savedPatient.email, first_name: savedPatient.first_name, role: 'patient' },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }

        throw new BadRequestException('Invalid role');
    }

    async signin(dto: AuthSigninDto) {
        const { email, password } = dto;

        const doctor = await this.doctorRepository.findOne({ where: { email } });
        const patient = await this.patientRepository.findOne({ where: { email } });

        if (doctor && doctor.provider === 'google') {
            throw new BadRequestException('Account is registered via Google. Please login with Google.');
        }
        if (patient && patient.provider === 'google') {
            throw new BadRequestException('Account is registered via Google. Please login with Google.');
        }

        if (!doctor && !patient) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const user: Doctor | Patient = doctor || patient!;
        const role = user.role;

        if (user.password === null) {
            throw new BadRequestException('Account is registered via Google. Please login with Google.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // We no longer update previous refresh tokens by relations, but by userId and userRole directly
        await this.refreshTokenRepository.update(
            { user_id: user.role === 'doctor' ? (user as Doctor).doctor_id : (user as Patient).patient_id, revoked: false },
            { revoked: true }
        );

        const userId = user.role === 'doctor' ? (user as Doctor).doctor_id : (user as Patient).patient_id;
        const tokens = await this.generateTokens(userId, user.email, role);

        const userIdentifier = role === 'doctor' ? 'doctor_id' : 'patient_id';

        return {
            message: 'Signin successful',
            role,
            user: { id: user[userIdentifier], email: user.email, role },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async signout(refreshToken: string) {
        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const decoded: any = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Fetch token using its ID, no relations needed now
            const tokenInDb = await this.refreshTokenRepository.findOne({
                where: { id: decoded.jti, revoked: false },
                // relations: ['doctor', 'patient'], // REMOVED
            });

            if (!tokenInDb) {
                throw new UnauthorizedException('Token not found or already revoked');
            }

            // Check if token belongs to the authenticated user using new user_id and user_role
            if (tokenInDb.user_id !== decoded.sub || tokenInDb.user_role !== decoded.role) {
                throw new UnauthorizedException('Token does not belong to the authenticated user.');
            }

            const isTokenValid = await bcrypt.compare(refreshToken, tokenInDb.token);
            if (!isTokenValid) {
                tokenInDb.revoked = true;
                await this.refreshTokenRepository.save(tokenInDb);
                throw new UnauthorizedException('Invalid token');
            }

            tokenInDb.revoked = true;
            await this.refreshTokenRepository.save(tokenInDb);

            return { message: 'Signed out successfully' };
        } catch (error: any) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid or expired token.');
            }
            throw new InternalServerErrorException('An unexpected error occurred during signout.');
        }
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const decoded: any = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Fetch token using its ID, no relations needed now
            const tokenInDb = await this.refreshTokenRepository.findOne({
                where: { id: decoded.jti, revoked: false },
                // relations: ['doctor', 'patient'], // REMOVED
            });

            if (!tokenInDb || tokenInDb.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            // Check if token belongs to the authenticated user using new user_id and user_role
            if (tokenInDb.user_id !== decoded.sub || tokenInDb.user_role !== decoded.role) {
                throw new UnauthorizedException('Token does not belong to the authenticated user or user not found.');
            }

            // Fetch the user (Doctor/Patient) based on userId and userRole stored in the refresh token
            let userFromDb: Doctor | Patient | null = null;
            if (tokenInDb.user_role === 'doctor') {
                userFromDb = await this.doctorRepository.findOne({ where: { doctor_id: tokenInDb.user_id } });
            } else if (tokenInDb.user_role === 'patient') {
                userFromDb = await this.patientRepository.findOne({ where: { patient_id: tokenInDb.user_id } });
            }

            if (!userFromDb) {
                throw new UnauthorizedException('User associated with token not found.');
            }

            const isTokenValid = await bcrypt.compare(refreshToken, tokenInDb.token);
            if (!isTokenValid) {
                tokenInDb.revoked = true;
                await this.refreshTokenRepository.save(tokenInDb);
                throw new UnauthorizedException('Invalid token');
            }

            tokenInDb.revoked = true;
            await this.refreshTokenRepository.save(tokenInDb);

            const newTokens = await this.generateTokens(
                userFromDb.role === 'doctor' ? (userFromDb as Doctor).doctor_id : (userFromDb as Patient).patient_id,
                userFromDb.email,
                userFromDb.role
            );

            return {
                message: 'New access token issued',
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                role: newTokens.role,
            };
        } catch (error: any) {
            console.error('AuthService Refresh Error:', error.message);
            console.error('AuthService Refresh Error Stack:', error.stack);
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid or expired token.');
            }
            throw new InternalServerErrorException('An unexpected error occurred during token refresh.');
        }
    }

    // --- Google OAuth Specific Methods ---

    // Find a user by email or Google ID
    async findDoctorByEmailOrGoogleId(email: string, googleId: string): Promise<Doctor | null> {
        try {
            console.log(`AuthService: Finding doctor by email (${email}) or googleId (${googleId})...`);
            const doctor = await this.doctorRepository.findOne({
                where: [{ email: email }, { googleId: googleId }],
            });
            console.log('AuthService: Doctor found:', doctor);
            return doctor;
        } catch (error: any) {
            console.error('AuthService Find Doctor Error:', error.message);
            console.error('AuthService Find Doctor Error Stack:', error.stack);
            throw error;
        }
    }

    async findPatientByEmailOrGoogleId(email: string, googleId: string): Promise<Patient | null> {
        try {
            console.log(`AuthService: Finding patient by email (${email}) or googleId (${googleId})...`);
            const patient = await this.patientRepository.findOne({
                where: [{ email: email }, { googleId: googleId }],
            });
            console.log('AuthService: Patient found:', patient);
            return patient;
        } catch (error: any) {
            console.error('AuthService Find Patient Error:', error.message);
            console.error('AuthService Find Patient Error Stack:', error.stack);
            throw error;
        }
    }

    // Create a new doctor linked to Google OAuth
    async createDoctorWithGoogle(
        email: string,
        firstName: string,
        lastName: string,
        googleId: string,
        role: 'doctor',
    ): Promise<Doctor> {
        try {
            console.log(`AuthService: Creating new doctor with Google: ${email}`);
            const doctor = new Doctor();
            doctor.first_name = firstName || null;
            doctor.last_name = lastName || null;
            doctor.email = email;
            doctor.googleId = googleId;
            doctor.provider = 'google';
            doctor.role = role;
            doctor.password = null;
            doctor.phone_number = null;
            doctor.specialization = null;
            doctor.experience_years = null;
            doctor.education = null;
            doctor.clinic_name = null;
            doctor.clinic_address = null;
            doctor.available_days = [];
            doctor.available_time_slots = [];
            console.log('AuthService: Doctor object prepared for save:', doctor);
            const savedDoctor = await this.doctorRepository.save(doctor);
            console.log('AuthService: Doctor saved:', savedDoctor);
            return savedDoctor;
        } catch (error: any) {
            console.error('AuthService Create Doctor with Google Error:', error.message);
            console.error('AuthService Create Doctor with Google Error Stack:', error.stack);
            throw error;
        }
    }

    // Create a new patient linked to Google OAuth
    async createPatientWithGoogle(
        email: string,
        firstName: string,
        lastName: string,
        googleId: string,
        role: 'patient',
    ): Promise<Patient> {
        try {
            console.log(`AuthService: Creating new patient with Google: ${email}`);
            const patient = new Patient();
            patient.first_name = firstName || null;
            patient.last_name = lastName || null;
            patient.email = email;
            patient.googleId = googleId;
            patient.provider = 'google';
            patient.role = role;
            patient.password = null;
            patient.phone_number = null;
            patient.address = null;
            console.log('AuthService: Patient object prepared for save:', patient);
            const savedPatient = await this.patientRepository.save(patient);
            console.log('AuthService: Patient saved:', savedPatient);
            return savedPatient;
        } catch (error: any) {
            console.error('AuthService Create Patient with Google Error:', error.message);
            console.error('AuthService Create Patient with Google Error Stack:', error.stack);
            throw error;
        }
    }

    // Update googleId for an existing local doctor account
    async updateDoctorGoogleId(doctorId: number, googleId: string): Promise<void> {
        try {
            console.log(`AuthService: Updating Doctor ${doctorId} with GoogleId: ${googleId}`);
            await this.doctorRepository.update(doctorId, { googleId, provider: 'google' });
            console.log('AuthService: Doctor GoogleId update complete.');
        } catch (error: any) {
            console.error('AuthService Update Doctor GoogleId Error:', error.message);
            console.error('AuthService Update Doctor GoogleId Error Stack:', error.stack);
            throw error;
        }
    }

    // Update googleId for an existing local patient account
    async updatePatientGoogleId(patientId: number, googleId: string): Promise<void> {
        try {
            console.log(`AuthService: Updating Patient ${patientId} with GoogleId: ${googleId}`);
            await this.patientRepository.update(patientId, { googleId, provider: 'google' });
            console.log('AuthService: Patient GoogleId update complete.');
        } catch (error: any) {
            console.error('AuthService Update Patient GoogleId Error:', error.message);
            console.error('AuthService Update Patient GoogleId Error Stack:', error.stack);
            throw error;
        }
    }

    async validateUserByIdAndRole(userId: number, role: string): Promise<Doctor | Patient | null> {
        try {
            if (role === 'doctor') {
                const user = await this.doctorRepository.findOne({ where: { doctor_id: userId } });
                console.log('AuthService: Validated Doctor by ID and role:', user);
                return user;
            } else if (role === 'patient') {
                const user = await this.patientRepository.findOne({ where: { patient_id: userId } });
                console.log('AuthService: Validated Patient by ID and role:', user);
                return user;
            }
            console.log('AuthService: Validation failed - invalid role or user not found.');
            return null;
        } catch (error: any) {
            console.error('AuthService Validate User by ID and Role Error:', error.message);
            console.error('AuthService Validate User by ID and Role Error Stack:', error.stack);
            throw error;
        }
    }
}
