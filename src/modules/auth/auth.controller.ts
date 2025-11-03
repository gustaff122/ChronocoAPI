import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';
import { UserResponse } from './models/user-response';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IRequest } from '../../models/i-request';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  // Publiczna rejestracja wyłączona zgodnie z wytycznymi


  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful.',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const { user, accessToken } = await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env['HTTPS_COOKIES_SECURE'] === 'true',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 30,
    });

    return user;
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User info retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  public async getSelf(@Req() req: IRequest): Promise<UserResponse> {
    const userId = req?.user['id'];
    return this.authService.findOneByIdWithoutPassword(userId);
  }

  @Post('refresh')
  @ApiOkResponse({ description: 'Access token refreshed.', type: UserResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  public async refresh(
    @Req() req: IRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const accessToken = req?.cookies?.['access_token'];
    const { user, accessToken: newAccessToken } = await this.authService.refreshAccessToken(accessToken);

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env['HTTPS_COOKIES_SECURE'] === 'true',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 30,
    });

    return user;
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  public async logout(@Req() req: IRequest, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env['HTTPS_COOKIES_SECURE'] === 'true',
      sameSite: 'lax',
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  public async changePassword(
    @Req() req: IRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    const userId = req?.user['id'];
    await this.authService.changePassword(userId, dto);
  }
}