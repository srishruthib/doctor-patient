import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private repo;
    constructor(repo: Repository<User>);
    findByEmail(email: string): Promise<User>;
    create(data: Partial<User>): Promise<User>;
}
