<<<<<<< HEAD
import { SetMetadata } from '@nestjs/common';
import { Role } from '../constraints/roles.enum'; // ❌ wrong spelling

=======
// Custom Roles decoratorimport { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles.enum';
>>>>>>> upstream/Implement-backend-APIs-for-listing-doctors

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
