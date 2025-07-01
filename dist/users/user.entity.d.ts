export declare class User {
    id: string;
    email: string;
    name: string;
    password: string;
    provider: 'local' | 'google';
    role: 'doctor' | 'patient';
}
