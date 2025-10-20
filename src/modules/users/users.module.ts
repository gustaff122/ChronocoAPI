import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/users.entity';
import { Events } from '../../entities/events.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ TypeOrmModule.forFeature([ Users, Events ]) ],
  controllers: [ UsersController ],
  providers: [ UsersService ],
})
export class UsersModule {
}


