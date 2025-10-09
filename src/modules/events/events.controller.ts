import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto/create-update-event.dto';
import { EventsService } from './events.service';
import { Events } from '../../entities/events.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequest } from '../../models/i-request';
import { SelectEventDto } from './dto/select-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {
  }

  @Post()
  @ApiOperation({ summary: 'Create new event' })
  @ApiResponse({ status: 201, description: 'Event created', type: Events })
  public async create(@Body() dto: CreateEventDto): Promise<Events> {
    return this.eventsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
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
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiResponse({ status: 200, description: 'Event updated', type: Events })
  public async update(@Param('id') id: string, @Body() dto: UpdateEventDto): Promise<Events> {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
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
    await this.eventsService.selectEvent(userId, dto.id);
  }
}