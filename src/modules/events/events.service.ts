import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto, UpdateEventDto } from './dto/create-update-event.dto';
import { Events } from '../../entities/events.entity';
import { UserRole, Users } from '../../entities/users.entity';
import { EventPlanners } from '../../entities/event-planners.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(EventPlanners)
    private readonly plannersRepository: Repository<EventPlanners>,
  ) {
  }

  public async create(dto: CreateEventDto): Promise<Events> {
    const planner = this.plannersRepository.create();

    const event = this.eventsRepository.create({ ...dto, planner });

    return await this.eventsRepository.save(event);
  }

  public async findAll(): Promise<Events[]> {
    return await this.eventsRepository.find();
  }

  public async findOne(id: string): Promise<Events> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  public async update(id: string, dto: UpdateEventDto): Promise<Events> {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return await this.eventsRepository.save(event);
  }

  public async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  public async selectEvent(role: string, userId: string, eventId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: [ 'accessibleEvents' ] });
    if (!user) throw new NotFoundException('User not found');

    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const hasAccess = Array.isArray(user.accessibleEvents) && user.accessibleEvents.some(e => e.id === event.id) || role === UserRole.SUPERADMIN;
    if (!hasAccess) {
      throw new NotFoundException('Event not accessible for this user');
    }

    user.selectedEvent = event;
    await this.usersRepository.save(user);
  }
}