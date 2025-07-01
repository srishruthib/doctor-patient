<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
=======
// Config serviceimport { Injectable } from '@nestjs/common';
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
<<<<<<< HEAD
  constructor(private configService: NestConfigService) {}

  get(key: string): string {
    return this.configService.get<string>(key);
  }

  getNumber(key: string): number {
    return Number(this.configService.get<string>(key));
=======
  constructor(private config: NestConfigService) {}

  get(key: string): string {
    return this.config.get<string>(key);
  }

  getNumber(key: string): number {
    return Number(this.config.get<string>(key));
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
  }
}
