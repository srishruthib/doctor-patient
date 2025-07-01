// src/auth/auth.service.ts
import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // Use bcryptjs for bcrypt operations
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthSignupDto, AuthSignInDto, Role } from './dto/auth-signup.dto';
import { Doctor } from '../entities/Doctor';
import { Patient } from '../entities/Patient';
import { RefreshToken } from '../entities/RefreshToken';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
        @InjectRepository(Patient)
        private patientsRepository: Repository<Patient>,
        @InjectRepository(RefreshToken)
        private refreshTokensRepository: Repository<RefreshToken>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async signup(signupDto: AuthSignupDto): Promise<{ message: string }> {
        const { email, password, role } = signupDto;

        // Check if user already exists
        const existingDoctor = await this.doctorsRepository.findOne({ where: { email } });
        const existingPatient = await this.patientsRepository.findOne({ where: { email } });

        if (existingDoctor || existingPatient) {
            throw new BadRequestException('User with this email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Corrected comparison for Role enum values using string literals
        if (role === 'DOCTOR') { // Explicitly compare with string literal 'DOCTOR'
            const newDoctor = this.doctorsRepository.create({
                ...signupDto,
                password: hashedPassword,
            });
            await this.doctorsRepository.save(newDoctor);
        } else if (role === 'PATIENT') { // Explicitly compare with string literal 'PATIENT'
            const newPatient = this.patientsRepository.create({
                ...signupDto,
                password: hashedPassword,
            });
            await this.patientsRepository.save(newPatient);
        } else {
            throw new BadRequestException('Invalid role specified.');
        }

        return { message: 'User registered successfully.' };
    }

    async signIn(signinDto: AuthSignInDto): Promise<{ accessToken: string; refreshToken: string; user: { id: number; email: string; role: Role; }; }> {
        const { email, password } = signinDto;

        let user: Doctor | Patient | undefined;
        let userRole: Role | undefined;

        // Try to find in Doctors
        user = await this.doctorsRepository.findOne({ where: { email } });
        if (user) {
            userRole = 'DOCTOR' as Role; // Assign uppercase string literal, cast to Role
        } else {
            // Try to find in Patients
            user = await this.patientsRepository.findOne({ where: { email } });
            if (user) {
                userRole = 'PATIENT' as Role; // Assign uppercase string literal, cast to Role
            }
        }

        if (!user || !userRole) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const accessToken = await this.generateAccessToken(user.id, userRole);
        const refreshToken = await this.generateRefreshToken(user.id, userRole);

        // Save refresh token to database
        const newRefreshToken = this.refreshTokensRepository.create({
            userId: user.id,
            token: await bcrypt.hash(refreshToken, 10), // Hash the refresh token before saving
            role: userRole as string, // Cast to string for the entity column
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        });
        await this.refreshTokensRepository.save(newRefreshToken);

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: userRole },
        };
    }

    async logout(userId: number): Promise<{ message: string }> {
        // Delete all refresh tokens for the user
        await this.refreshTokensRepository.delete({ userId });
        return { message: 'Logged out successfully.' };
    }

    async refreshTokens(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        if (!oldRefreshToken) {
            throw new BadRequestException('Refresh token is required.');
        }

        // Find the stored refresh token by comparing its hashed version
        // Consider adding a filter by userId here if possible for efficiency
        const storedTokens = await this.refreshTokensRepository.find();
        let foundTokenEntity: RefreshToken | undefined;

        for (const tokenEntity of storedTokens) {
            const isMatch = await bcrypt.compare(oldRefreshToken, tokenEntity.token);
            if (isMatch) {
                foundTokenEntity = tokenEntity;
                break;
            }
        }

        if (!foundTokenEntity || foundTokenEntity.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token.');
        }

        // Get user details from the found token entity
        const userId = foundTokenEntity.userId;
        const userRole = foundTokenEntity.role as Role; // Cast back to Role enum

        // Generate new tokens
        const newAccessToken = await this.generateAccessToken(userId, userRole);
        const newRefreshToken = await this.generateRefreshToken(userId, userRole);

        // Update the stored refresh token (or delete old and save new)
        foundTokenEntity.token = await bcrypt.hash(newRefreshToken, 10);
        foundTokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.refreshTokensRepository.save(foundTokenEntity);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async validateUserByIdAndRole(userId: number, role: Role): Promise<Doctor | Patient | undefined> {
        if (role === 'DOCTOR') { // Explicitly compare with string literal 'DOCTOR'
            return this.doctorsRepository.findOne({ where: { id: userId } });
        } else if (role === 'PATIENT') { // Explicitly compare with string literal 'PATIENT'
            return this.patientsRepository.findOne({ where: { id: userId } });
        }
        return undefined;
    }

    private async generateAccessToken(userId: number, role: Role): Promise<string> {
        const payload = { sub: userId, role };
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY') || '1h',
        });
    }

    private async generateRefreshToken(userId: number, role: Role): Promise<string> {
        const payload = { sub: userId, role };
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d',
        });
    }

    async handleGoogleAuth(googleProfile: any): Promise<{ accessToken: string; refreshToken: string; user: Doctor | Patient; isNewUser: boolean }> {
        const { email, firstName, lastName } = googleProfile; // Assuming these properties exist on the googleProfile

        let user: Doctor | Patient | undefined;
        let role: Role;
        let isNewUser = false;

        // Try to find if the user exists as a Doctor
        user = await this.doctorsRepository.findOne({ where: { email } });
        if (user) {
            role = 'DOCTOR' as Role; // Assign uppercase string literal, cast to Role
        } else {
            // Try to find if the user exists as a Patient
            user = await this.patientsRepository.findOne({ where: { email } });
            if (user) {
                role = 'PATIENT' as Role; // Assign uppercase string literal, cast to Role
            }
        }

        if (!user) {
            // If user does not exist, create a new Patient by default (or based on some logic)
            isNewUser = true;
            role = 'PATIENT' as Role; // Default to Patient if not found, cast to Role
            const newPatient = this.patientsRepository.create({
                email,
                first_name: firstName,
                last_name: lastName,
                password: '', // Google users don't have a password in your DB
                role: 'PATIENT' as string, // Use string literal, cast to string for the entity column
            });
            user = await this.patientsRepository.save(newPatient);
        }

        // Generate tokens for the user
        const accessToken = await this.generateAccessToken(user.id, role);
        const refreshToken = await this.generateRefreshToken(user.id, role);

        // Save refresh token to database (or update if existing)
        let existingRefreshToken = await this.refreshTokensRepository.findOne({ where: { userId: user.id, role: role as string } }); // Cast role to string for query
        if (existingRefreshToken) {
            existingRefreshToken.token = await bcrypt.hash(refreshToken, 10);
            existingRefreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await this.refreshTokensRepository.save(existingRefreshToken);
        } else {
            const newRefreshTokenEntity = this.refreshTokensRepository.create({
                userId: user.id,
                token: await bcrypt.hash(refreshToken, 10),
                role: role as string, // Cast to string for the entity column
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await this.refreshTokensRepository.save(newRefreshTokenEntity);
        }

        return { accessToken, refreshToken, user, isNewUser };
    }
}
