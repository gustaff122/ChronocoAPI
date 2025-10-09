import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EventLegendInstances } from './event-legend-instances.entity';
import { ulid } from 'ulid';
import { EventPlanners } from './event-planners.entity';

@Entity()
export class EventLegends {
  @ApiProperty({ description: 'Unique ULID identifier', example: '01J8H4ZX5Y7R7E2JZP4D2N9Q2M' })
  @PrimaryColumn('char', { length: 26 })
  id: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => EventPlanners, planner => planner.legends, { nullable: false, onDelete: 'CASCADE' })
  planner: EventPlanners;

  @OneToMany(() => EventLegendInstances, instance => instance.legend, { cascade: true })
  instances: EventLegendInstances[];

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}