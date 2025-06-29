// src/auth/auth.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { AuthSignupDto, AuthSignInDto, Role } from './dto/auth-signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from '../entities/RefreshToken';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

        if (googleClientId && googleClientSecret) {
            this.googleClient = new OAuth2Client(
                googleClientId,
                googleClientSecret,
            );
        } else {
            console.warn('Google Client ID or Secret not provided. Google OAuth will not function.');
        }
    }

    // Helper to hash passwords
    private async hashData(data: string): Promise<string> {
        return bcrypt.hash(data, 10);
    }

    // Helper to generate access and refresh tokens
    async generateTokens(
        userId: number,
        email: string,
        role: Role,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            // FIX: Use JWT_ACCESS_SECRET and ACCESS_TOKEN_EXPIRY from .env
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY'),
            }),
            // FIX: Use JWT_REFRESH_SECRET and REFRESH_TOKEN_EXPIRY from .env
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY'),
            }),
        ]);
        return { accessToken, refreshToken };
    }

    // Helper to update or create refresh token in DB
    async updateRefreshToken(userId: number, refreshToken: string, role: Role): Promise<void> {
        const hashedRefreshToken = await this.hashData(refreshToken);
        const existingToken = await this.refreshTokenRepository.findOne({ where: { user_id: userId } });

        if (existingToken) {
            existingToken.token = hashedRefreshToken;
            existingToken.revoked = false;
            await this.refreshTokenRepository.save(existingToken);
        } else {
            await this.refreshTokenRepository.save({
                user_id: userId,
                token: hashedRefreshToken,
                role: role,
            });
        }
    }

    // Helper to revoke a refresh token
    async revokeRefreshToken(userId: number): Promise<void> {
        const token = await this.refreshTokenRepository.findOne({ where: { user_id: userId } });
        if (token) {
            token.revoked = true;
            await this.refreshTokenRepository.save(token);
        }
    }

    /**
     * Signup for a new user (Doctor or Patient).
     * @param dto AuthSignupDto
     * @returns Access token, refresh token, and user details
     */
    async signup(dto: AuthSignupDto) {
        const { email, password, role } = dto;

        let existingUser: Doctor | Patient | null;
        if (role === Role.DOCTOR) {
            existingUser = await this.doctorRepository.findOne({ where: { email } });
        } else {
            existingUser = await this.patientRepository.findOne({ where: { email } });
        }

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        const hashedPassword = await this.hashData(password);

        if (role === Role.DOCTOR) {
            const doctor = this.doctorRepository.create({
                ...dto,
                email,
                password: hashedPassword,
                provider: 'local',
                googleId: undefined,
            } as Partial<Doctor>);

            const savedDoctor = await this.doctorRepository.save(doctor);
            const tokens = await this.generateTokens(savedDoctor.id, savedDoctor.email, Role.DOCTOR);
            await this.updateRefreshToken(savedDoctor.id, tokens.refreshToken, Role.DOCTOR);

            return {
                accessToken: tokens.accessToken,
                user: { id: savedDoctor.id, email: savedDoctor.email, first_name: savedDoctor.first_name, role: Role.DOCTOR },
            };
        } else {
            const patient = this.patientRepository.create({
                ...dto,
                email,
                password: hashedPassword,
                provider: 'local',
                googleId: undefined,
            } as Partial<Patient>);

            const savedPatient = await this.patientRepository.save(patient);
            const tokens = await this.generateTokens(savedPatient.id, savedPatient.email, Role.PATIENT);
            await this.updateRefreshToken(savedPatient.id, tokens.refreshToken, Role.PATIENT);

            return {
                accessToken: tokens.accessToken,
                user: { id: savedPatient.id, email: savedPatient.email, first_name: savedPatient.first_name, role: Role.PATIENT },
            };
        }
    }

    /**
     * Sign in an existing user (Doctor or Patient).
     * @param dto AuthSignInDto
     * @returns Access token, refresh token, and user details
     */
    async signIn(dto: AuthSignInDto) {
        const { email, password } = dto;

        let user: Doctor | Patient | null;
        user = await this.doctorRepository.findOne({ where: { email } });

        if (!user) {
            user = await this.patientRepository.findOne({ where: { email } });
        }

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const userId = user.role === 'doctor' ? (user as Doctor).id : (user as Patient).id;
        const tokens = await this.generateTokens(userId, user.email, user.role as Role);
        await this.updateRefreshToken(userId, tokens.refreshToken, user.role as Role);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: { id: userId, email: user.email, first_name: user.first_name, role: user.role },
        };
    }

    /**
     * Logs out a user by revoking their refresh token.
     * @param userId The ID of the user logging out.
     */
    async logout(userId: number) {
        await this.revokeRefreshToken(userId);
    }

    /**
     * Refreshes access and refresh tokens using an existing refresh token.
     * @param refreshToken The expired refresh token.
     * @returns New access token, new refresh token, and user details.
     */
    async refreshTokens(oldRefreshToken: string) {
        const tokenInDb = await this.refreshTokenRepository.findOne({ where: { token: oldRefreshToken, revoked: false } });

        if (!tokenInDb) {
            throw new ForbiddenException('Invalid or revoked refresh token');
        }

        let userFromDb: Doctor | Patient | null;
        if (tokenInDb.role === Role.DOCTOR) {
            userFromDb = await this.doctorRepository.findOne({ where: { id: tokenInDb.user_id } });
        } else if (tokenInDb.role === Role.PATIENT) {
            userFromDb = await this.patientRepository.findOne({ where: { id: tokenInDb.user_id } });
        } else {
            throw new ForbiddenException('Invalid role in refresh token');
        }

        if (!userFromDb) {
            throw new ForbiddenException('User associated with refresh token not found');
        }

        const newTokens = await this.generateTokens(
            userFromDb.role === 'doctor' ? (userFromDb as Doctor).id : (userFromDb as Patient).id,
            userFromDb.email,
            userFromDb.role as Role,
        );

        await this.updateRefreshToken(
            userFromDb.role === 'doctor' ? (userFromDb as Doctor).id : (userFromDb as Patient).id,
            newTokens.refreshToken,
            userFromDb.role as Role,
        );

        return { accessToken: newTokens.accessToken, newRefreshToken: newTokens.refreshToken, user: userFromDb };
    }

    /**
     * Handles Google OAuth authentication flow.
     * @param user Google profile data.
     * @returns JWT tokens and user details.
     */
    async handleGoogleAuth(user: any): Promise<{ accessToken: string; refreshToken: string; user: Doctor | Patient }> {
        const { email, firstName, lastName, googleId, role } = user;

        let existingUser: Doctor | Patient | null;
        if (role === Role.DOCTOR) {
            existingUser = await this.doctorRepository.findOne({ where: { email } });
        } else if (role === Role.PATIENT) {
            existingUser = await this.patientRepository.findOne({ where: { email } });
        } else {
            throw new BadRequestException('Google authentication failed: Invalid role.');
        }


        if (existingUser) {
            if (!existingUser.googleId) {
                if (role === Role.DOCTOR) {
                    await this.updateDoctorGoogleId(existingUser.id, googleId);
                } else if (role === Role.PATIENT) {
                    await this.updatePatientGoogleId(existingUser.id, googleId);
                }
            }
            const tokens = await this.generateTokens(existingUser.id, existingUser.email, existingUser.role as Role);
            await this.updateRefreshToken(existingUser.id, tokens.refreshToken, existingUser.role as Role);
            return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: existingUser };
        } else {
            const hashedPassword = await this.hashData(Math.random().toString(36).slice(-8));

            if (role === Role.DOCTOR) {
                const doctor = this.doctorRepository.create({
                    email,
                    first_name: firstName || null,
                    last_name: lastName || null,
                    password: hashedPassword,
                    googleId,
                    provider: 'google',
                    role: Role.DOCTOR,
                    phone_number: null,
                    specialization: null,
                    experience_years: null,
                    education: null,
                    clinic_name: null,
                    clinic_address: null,
                } as Partial<Doctor>);
                const savedDoctor = await this.doctorRepository.save(doctor);
                const tokens = await this.generateTokens(savedDoctor.id, savedDoctor.email, Role.DOCTOR);
                await this.updateRefreshToken(savedDoctor.id, tokens.refreshToken, Role.DOCTOR);
                return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: savedDoctor };
            } else if (role === Role.PATIENT) {
                const patient = this.patientRepository.create({
                    email,
                    first_name: firstName || null,
                    last_name: lastName || null,
                    password: hashedPassword,
                    googleId,
                    provider: 'google',
                    role: Role.PATIENT,
                    phone_number: null,
                    address: null,
                } as Partial<Patient>);
                const savedPatient = await this.patientRepository.save(patient);
                const tokens = await this.generateTokens(savedPatient.id, savedPatient.email, Role.PATIENT);
                await this.updateRefreshToken(savedPatient.id, tokens.refreshToken, Role.PATIENT);
                return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: savedPatient };
            }
        }
        throw new BadRequestException('Google authentication failed: Role not specified or unknown.');
    }

    /**
     * Validates a user by ID and role. Used by JwtStrategy.
     * @param userId The ID of the user.
     * @param role The role of the user ('doctor' or 'patient').
     * @returns The Doctor or Patient object if found, otherwise null.
     */
    async validateUserByIdAndRole(userId: number, role: Role): Promise<Doctor | Patient | null> {
        if (role === Role.DOCTOR) {
            return this.doctorRepository.findOne({ where: { id: userId } });
        } else if (role === Role.PATIENT) {
            return this.patientRepository.findOne({ where: { id: userId } });
        }
        return null; // Invalid role
    }

    // Update Google ID for Doctor
    async updateDoctorGoogleId(doctorId: number, googleId: string) {
        const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
        if (doctor) {
            doctor.googleId = googleId;
            await this.doctorRepository.save(doctor);
        }
    }

    // Update Google ID for Patient
    async updatePatientGoogleId(patientId: number, googleId: string) {
        const patient = await this.patientRepository.findOne({ where: { id: patientId } });
        if (patient) {
            patient.googleId = googleId;
            await this.patientRepository.save(patient);
        }
    }
}
