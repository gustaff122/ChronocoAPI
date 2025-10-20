import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, UserRole } from '../../entities/users.entity';
import { Events } from '../../entities/events.entity';
import { CreateUserDto } from './dto/create-user.dto';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
    @InjectRepository(Events) private readonly eventsRepository: Repository<Events>,
  ) {}

  public async listUsers() {
    const users = await this.usersRepository.find({ relations: [ 'selectedEvent', 'accessibleEvents' ] });
    return users.map(u => ({
      id: u.id,
      login: u.login,
      name: u.name,
      role: u.role,
      selectedEvent: u.selectedEvent?.id || null,
      accessibleEvents: (u.accessibleEvents || []).map(e => e.id),
    }));
  }

  public async createUser(dto: CreateUserDto) {
    const exists = await this.usersRepository.findOne({ where: { login: dto.login } });
    if (exists) {
      throw new ConflictException('User with this login already exists');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const role: UserRole = dto.role || UserRole.USER;
    const user = this.usersRepository.create({ login: dto.login, name: dto.name, password, role });
    await this.usersRepository.save(user);
    return { id: user.id, login: user.login, name: user.name, role: user.role };
  }

  public async grantAccess(userId: string, eventId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: [ 'accessibleEvents' ] });
    if (!user) throw new NotFoundException('User not found');
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    user.accessibleEvents = Array.isArray(user.accessibleEvents) ? user.accessibleEvents : [];
    if (!user.accessibleEvents.some(e => e.id === event.id)) {
      user.accessibleEvents.push(event);
      await this.usersRepository.save(user);
    }
    return { id: user.id, accessibleEvents: user.accessibleEvents.map(e => e.id) };
  }

  public async revokeAccess(userId: string, eventId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: [ 'accessibleEvents' ] });
    if (!user) throw new NotFoundException('User not found');
    user.accessibleEvents = (user.accessibleEvents || []).filter(e => e.id !== eventId);
    await this.usersRepository.save(user);
    return { id: user.id, accessibleEvents: user.accessibleEvents.map(e => e.id) };
  }
}


