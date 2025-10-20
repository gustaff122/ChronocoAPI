import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GrantAccessDto } from './dto/grant-access.dto';

@ApiTags('Users (admin)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiResponse({ status: 200, description: 'List users' })
  public async list() {
    return this.usersService.listUsers();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  public async create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Post(':id/grant-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiBody({ type: GrantAccessDto })
  @ApiResponse({ status: 200, description: 'Access granted' })
  public async grantAccess(@Param('id') userId: string, @Body() dto: GrantAccessDto) {
    return this.usersService.grantAccess(userId, dto.eventId);
  }

  @Post(':id/revoke-access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPERADMIN)
  @ApiBody({ type: GrantAccessDto })
  @ApiResponse({ status: 200, description: 'Access revoked' })
  public async revokeAccess(@Param('id') userId: string, @Body() dto: GrantAccessDto) {
    return this.usersService.revokeAccess(userId, dto.eventId);
  }
}


