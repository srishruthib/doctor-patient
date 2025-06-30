<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
=======
// JWT Auth Guardimport { Injectable } from '@nestjs/common';
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
