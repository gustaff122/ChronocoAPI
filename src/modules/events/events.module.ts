import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Events } from '../../entities/events.entity';
import { Users } from '../../entities/users.entity';
import { EventPlanners } from '../../entities/event-planners.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Events, Users, EventPlanners ]),
  ],
  controllers: [ EventsController ],
  providers: [ EventsService ],
})
export class EventsModule {
}
