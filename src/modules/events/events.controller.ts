import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto/create-update-event.dto';
import { EventsService } from './events.service';
import { Events } from '../../entities/events.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequest } from '../../models/i-request';
import { SelectEventDto } from './dto/select-event.dto';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/users.entity';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create new event' })
  @ApiResponse({ status: 201, description: 'Event created', type: Events })
  public async create(@Body() dto: CreateEventDto): Promise<Events> {
    return this.eventsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all events' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of events', type: [ Events ] })
  public async findAll(): Promise<Events[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event found', type: Events })
  public async findOne(@Param('id') id: string): Promise<Events> {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiResponse({ status: 200, description: 'Event updated', type: Events })
  public async update(@Param('id') id: string, @Body() dto: UpdateEventDto): Promise<Events> {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  public async remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Post('active-event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set active event for user' })
  @ApiResponse({ status: 200, description: 'Active event set successfully' })
  public async setSelectedEvent(
    @Req() req: IRequest,
    @Body() dto: SelectEventDto,
  ): Promise<void> {
    const userId = req?.user['id'];
    const role = req?.user['role'];
    await this.eventsService.selectEvent(role, userId, dto.id);
  }
}