import { BeforeInsert, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ulid } from 'ulid';
import { EventLegends } from './event-legends.entity';
import { EventLegendInstances } from './event-legend-instances.entity';

@Entity()
export class EventPlanners {
  @ApiProperty({ description: 'Unique ULID identifier', example: '01J8H4ZX5Y7R7E2JZP4D2N9Q2M' })
  @PrimaryColumn('char', { length: 26 })
  id: string;

  @OneToMany(() => EventLegends, legend => legend.planner, { cascade: true })
  legends: EventLegends[];

  @OneToMany(() => EventLegendInstances, instance => instance.planner, { cascade: true })
  instances: EventLegendInstances[];

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}