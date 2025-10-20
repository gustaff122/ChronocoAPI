import { Module } from '@nestjs/common';
import { Users } from '../../entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Module({
  imports: [
    TypeOrmModule.forFeature([ Users ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ ConfigService ],
    }),
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, JwtStrategy, JwtAuthGuard ],
  exports: [ JwtModule, AuthService ],
})
export class AuthModule {
}
