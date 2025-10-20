import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@chronoco/entities/users.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserResponse } from './models/user-response';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {
  }

  public async register(registerDto: RegisterDto): Promise<UserResponse> {
    const { login, password, name } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { login } });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      name,
      login,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    return { id: user.id, login, name, selectedEvent: null };
  }

  public async login(loginDto: LoginDto): Promise<{ user: UserResponse, accessToken: string }> {
    const { login, password } = loginDto;

    const user = await this.validateUser(login, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, name: user.name, login: user.login, selectedEvent: user?.selectedEvent?.id || null };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenPlain = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);
    const refreshTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    user.refreshTokenHash = refreshTokenHash;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await this.usersRepository.save(user);

    return { accessToken, user: payload };
  }

  public async validateUser(login: string, password: string): Promise<Users> {
    const user = await this.usersRepository.findOne({ where: { login }, relations: [ 'selectedEvent' ] });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  public async revokeRefreshToken(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await this.usersRepository.save(user);
  }

  public async refreshAccessToken(accessToken: string | undefined): Promise<{ user: UserResponse, accessToken: string }> {
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(accessToken, { ignoreExpiration: true, secret: process.env['JWT_SECRET'] });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.findOneById(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token not set');
    }

    if (user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload: UserResponse = {
      id: user.id,
      name: user.name,
      login: user.login,
      selectedEvent: user?.selectedEvent?.id || null,
    };
    const newAccessToken = this.jwtService.sign(payload);

    return { user: payload, accessToken: newAccessToken };
  }

  public async findOneById(id: string): Promise<Users> {
    return this.usersRepository.findOne({ where: { id }, relations: [ 'selectedEvent' ] });
  }

  public async findOneByIdWithoutPassword(userId: string): Promise<UserResponse> {
    const user = await this.findOneById(userId);
    const { password, selectedEvent, ...rest } = user;
    return { ...rest, selectedEvent: selectedEvent?.id || null };
  }
}