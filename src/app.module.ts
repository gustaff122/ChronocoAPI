import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { Users } from './entities/users.entity';
import { Events } from './entities/events.entity';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { PlannersModule } from './modules/planners/planners.module';
import { EventLegends } from './entities/event-legends.entity';
import { EventLegendInstances } from './entities/event-legend-instances.entity';
import { EventPlanners } from './entities/event-planners.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

const ENTITIES = [
  Users,
  Events,
  EventLegends,
  EventLegendInstances,
  EventPlanners,
];

const MODULES = [
  AuthModule,
  EventsModule,
  PlannersModule,
  UsersModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'],
      port: +process.env['DB_PORT'],
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_DATABASE'],
      entities: ENTITIES,
      synchronize: true,
    }),
    ...MODULES,
  ],
})
export class AppModule {
}
