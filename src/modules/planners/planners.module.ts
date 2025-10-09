import { Module } from '@nestjs/common';
import { PlannersPresenceService } from './services/planners-presence.service';
import { PlannersGateway } from './planners.gateway';
import { PlannersPlanningService } from './services/planners-planning.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventPlanners } from '../../entities/event-planners.entity';
import { EventLegendInstances } from '../../entities/event-legend-instances.entity';
import { EventLegends } from '../../entities/event-legends.entity';
import { Events } from '../../entities/events.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ EventPlanners, EventLegendInstances, EventLegends, Events ]),
  ],
  providers: [ PlannersPresenceService, PlannersGateway, PlannersPlanningService ],
})
export class PlannersModule {
}
