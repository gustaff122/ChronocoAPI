import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GrantAccessDto {
  @ApiProperty()
  @IsNotEmpty()
  eventId: string;
}


