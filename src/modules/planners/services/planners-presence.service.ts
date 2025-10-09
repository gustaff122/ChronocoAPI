import { Injectable } from '@nestjs/common';
import { Users } from '../../../entities/users.entity';

interface PresentUser extends Pick<Users, 'id' | 'name'> {
}

@Injectable()
export class PlannersPresenceService {
  private rooms: Map<string, Set<PresentUser>> = new Map<string, Set<PresentUser>>();

  public join(eventId: string, user: PresentUser): string[] {
    if (!this.rooms.has(eventId)) {
      this.rooms.set(eventId, new Set());
    }

    this.rooms.get(eventId).add(user);
    return Array.from(this.rooms.get(eventId)).map(u => u.name);
  }

  public leave(eventId: string, user: PresentUser): string[] {
    const users = this.rooms.get(eventId);

    if (!users) {
      return [];
    }

    users.delete(user);

    if (users.size === 0) {
      this.rooms.delete(eventId);
    }

    return Array.from(users).map(u => u.name);
  }
}