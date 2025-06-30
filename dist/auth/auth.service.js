"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async signup(data) {
        const userExists = await this.usersService.findByEmail(data.email);
        if (userExists)
            throw new common_1.BadRequestException('User already exists');
        if (!data.password || !data.role)
            throw new common_1.BadRequestException('Missing data');
        const hashed = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create(Object.assign(Object.assign({}, data), { password: hashed, provider: 'local' }));
        return this.generateToken(user);
    }
    async signin(data) {
        const user = await this.usersService.findByEmail(data.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.provider === 'google')
            throw new common_1.BadRequestException('Account registered with Google. Login with Google.');
        const match = await bcrypt.compare(data.password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.generateToken(user);
    }
    async googleLogin(profile) {
        let user = await this.usersService.findByEmail(profile.email);
        if (!user) {
            user = await this.usersService.create({
                email: profile.email,
                name: profile.name,
                provider: 'google',
                password: null,
                role: profile.role || 'patient',
            });
        }
        return this.generateToken(user);
    }
    generateToken(user) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map