import { Injectable } from '@nestjs/common';
import { EventPlanners } from '../../../entities/event-planners.entity';
import { EventLegends } from '../../../entities/event-legends.entity';
import { EventLegendInstances } from '../../../entities/event-legend-instances.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Events } from '../../../entities/events.entity';

@Injectable()
export class PlannersPlanningService {
  constructor(
    @InjectRepository(EventLegendInstances)
    private readonly legendInstancesRepository: Repository<EventLegendInstances>,
    @InjectRepository(EventLegends)
    private readonly legendsRepository: Repository<EventLegends>,
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
  ) {
  }

  public async getPlanner(eventId: string): Promise<EventPlanners> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: [ 'planner', 'planner.instances', 'planner.instances.legend', 'planner.legends' ],
    });
    if (!event) throw new Error('Event not found');
    return event.planner;
  }

  public async addInstance(eventId: string, dto: Partial<EventLegendInstances>): Promise<EventLegendInstances> {
    const planner = await this.getPlanner(eventId);
    const legend = await this.legendsRepository.findOneOrFail({ where: { id: dto.legend.id } });

    const instance = this.legendInstancesRepository.create({
      ...dto,
      planner,
      legend,
    });
    return this.legendInstancesRepository.save(instance);
  }

  public async updateInstance(id: string, dto: Partial<EventLegendInstances>): Promise<EventLegendInstances> {
    await this.legendInstancesRepository.update({ id }, dto);
    return this.legendInstancesRepository.findOne({ where: { id }, relations: [ 'legend' ] });
  }

  public async removeInstance(id: string): Promise<void> {
    await this.legendInstancesRepository.delete(id);
  }

  public async addLegend(eventId: string, dto: Partial<EventLegends>): Promise<EventLegends> {
    const planner = await this.getPlanner(eventId);
    const legend = this.legendsRepository.create(dto);
    legend.planner = planner;

    return this.legendsRepository.save(legend);
  }

  public async updateLegend(id: string, dto: Partial<EventLegends>): Promise<EventLegends> {
    await this.legendsRepository.update({ id }, dto);
    return this.legendsRepository.findOne({ where: { id } });
  }

  public async removeLegend(id: string): Promise<void> {
    await this.legendsRepository.delete(id);
  }
}
