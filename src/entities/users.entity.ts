import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Events } from './events.entity';

@Entity()
export class Users {
  @PrimaryColumn('char', { length: 26 })
  id: string;

  @Column({ length: 64 })
  login: string;

  @Column({ length: 64 })
  name: string;

  @Column({ length: 128 })
  password: string;

  @ManyToOne(() => Events)
  @JoinColumn()
  selectedEvent: Events;

  @Column({ type: 'varchar', length: 256, nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date | null;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}
