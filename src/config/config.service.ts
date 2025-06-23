// Config serviceimport { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private config: NestConfigService) {}

  get(key: string): string {
    return this.config.get<string>(key);
  }

  getNumber(key: string): number {
    return Number(this.config.get<string>(key));
  }
}
