import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WsUser } from '../../decorators/ws-user.decorator';
import { Users } from '../../entities/users.entity';
import { PlannersPresenceService } from './services/planners-presence.service';
import { PlannersPlanningService } from './services/planners-planning.service';
import { PlannersClientMessages, PlannersSocketMessages } from './models/planners-messages.enum';
import { EventLegendInstances } from '../../entities/event-legend-instances.entity';
import { EventLegends } from '../../entities/event-legends.entity';

@WebSocketGateway({
  cors: {
    origin: [ 'http://localhost:4200', 'https://dev122.pl', /\.dev122\.pl$/ ],
    credentials: true,
    secure: process.env['HTTPS_COOKIES_SECURE'] === 'true',
  },
})
export class PlannersGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PlannersPresenceService,
    private readonly planningService: PlannersPlanningService,
  ) {
  }

  // === JOIN / LEAVE ===
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.JOIN_PLANNER)
  async handleJoin(
    @MessageBody() { eventId }: { eventId: string },
    @ConnectedSocket() client: Socket,
    @WsUser() user: Users,
  ) {
    client.join(`event_${eventId}`);
    client.data = { eventId, user };

    const users = this.presenceService.join(eventId, user);

    const planner = await this.planningService.getPlanner(eventId);

    client.emit(PlannersSocketMessages.PRESENCE_SNAPSHOT, { users, planner });
    client.to(`event_${eventId}`).emit(PlannersSocketMessages.USER_JOINED, { users });
  }

  public handleDisconnect(client: Socket): void {
    const { eventId, user } = client.data ?? {};
    if (!eventId || !user) return;
    this.presenceService.leave(eventId, user);
    this.server.to(`event_${eventId}`).emit(PlannersSocketMessages.USER_LEFT, { username: user.name });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.ADD_INSTANCE)
  async handleAddInstance(
    @MessageBody() { eventId, instance }: { eventId: string; instance: Partial<EventLegendInstances> },
    @ConnectedSocket() _client: Socket,
  ) {
    const savedInstance = await this.planningService.addInstance(eventId, instance);
    this.server.to(`event_${eventId}`).emit(PlannersSocketMessages.INSTANCE_ADDED, savedInstance);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.UPDATE_INSTANCE)
  async handleUpdateInstance(
    @MessageBody() { id, changes }: { id: string; changes: Partial<EventLegendInstances> },
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.planningService.updateInstance(id, changes);
    this.server.to(`event_${client.data.eventId}`).emit(PlannersSocketMessages.INSTANCE_UPDATED, updated);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.REMOVE_INSTANCE)
  async handleRemoveInstance(
    @MessageBody() { id }: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.planningService.removeInstance(id);
    this.server.to(`event_${client.data.eventId}`).emit(PlannersSocketMessages.INSTANCE_REMOVED, { id });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.ADD_LEGEND)
  async handleAddLegend(
    @MessageBody() { eventId, legend }: { eventId: string; legend: Partial<EventLegends> },
    @ConnectedSocket() _client: Socket,
  ) {
    const savedLegend = await this.planningService.addLegend(eventId, legend);
    this.server.to(`event_${eventId}`).emit(PlannersSocketMessages.LEGEND_ADDED, savedLegend);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.UPDATE_LEGEND)
  async handleUpdateLegend(
    @MessageBody() { id, changes }: { id: string; changes: Partial<EventLegends> },
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.planningService.updateLegend(id, changes);
    this.server.to(`event_${client.data.eventId}`).emit(PlannersSocketMessages.LEGEND_UPDATED, updated);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage(PlannersClientMessages.REMOVE_LEGEND)
  async handleRemoveLegend(
    @MessageBody() { id }: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.planningService.removeLegend(id);
    this.server.to(`event_${client.data.eventId}`).emit(PlannersSocketMessages.LEGEND_REMOVED, { id });
  }
}
