import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config'; // ✅ from @nestjs/config
import { ConfigModule } from './config/config.module'; // ✅ still use your wrapper
 

 
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // Corrected import path
import { DoctorsModule } from './doctors/doctors.module'; // Corrected import path

import { User } from './users/user.entity';
import { Doctor } from './doctors/doctor.entity';

@Module({
  imports: [
    ConfigModule,
 TypeOrmModule.forRootAsync({
  imports: [ConfigModule], // ✅ Must import the real config module here
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [User, Doctor],
    synchronize: true,
  }),
}),

    AuthModule,
    UsersModule,
    DoctorsModule,
  ],
})
export class AppModule {}
