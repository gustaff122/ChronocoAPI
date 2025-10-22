import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Events } from './events.entity';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  USER = 'USER',
}

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ManyToOne(() => Events)
  @JoinColumn()
  selectedEvent: Events;

  @ManyToMany(() => Events)
  @JoinTable({ name: 'users_events_access' })
  accessibleEvents: Events[];

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date | null;

  @BeforeInsert()
  generateId() {
    this.id = ulid();
  }
}
