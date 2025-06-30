<<<<<<< HEAD
import { Module } from '@nestjs/common';
=======
// Configuration module for env variablesimport { Module } from '@nestjs/common';
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class ConfigModule {}
