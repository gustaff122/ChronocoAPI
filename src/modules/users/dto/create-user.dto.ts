import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../../entities/users.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(3)
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  role?: UserRole;
}


