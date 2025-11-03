import { IsEmail, IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@chronoco/entities/users.entity';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(1)
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(64)
  @MinLength(5)
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}