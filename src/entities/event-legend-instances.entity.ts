import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { EventLegends } from './event-legends.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EventPlanners } from './event-planners.entity';
import { ulid } from 'ulid';

@Entity()
export class EventLegendInstances {
  @ApiProperty({ description: 'Unique ULID identifier', example: '01J8H4ZX5Y7R7E2JZP4D2N9Q2M' })
  @PrimaryColumn('char', { length: 26 })
  public id: string;

  @ApiProperty({ example: [ 'roomA', 'roomB' ], description: 'Rooms where instance takes place' })
  @Column('text', { array: true })
  rooms: string[];

  @ApiProperty({ example: '2025-09-29T09:00:00.000Z' })
  @Column({ type: 'timestamp' })
  startTime: Date;

  @ApiProperty({ example: '2025-09-29T10:00:00.000Z' })
  @Column({ type: 'timestamp' })
  endTime: Date;

  @ApiProperty({ example: 5, description: 'Render order (higher = on top)' })
  @Column({ default: 0 })
  zIndex: number;

  @ManyToOne(() => EventPlanners, planner => planner.instances, { onDelete: 'CASCADE' })
  planner: EventPlanners;

  @ManyToOne(() => EventLegends, legend => legend.instances, { eager: true })
  legend: EventLegends;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}