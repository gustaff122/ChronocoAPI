import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SelectEventDto {
  @ApiProperty({ description: 'Event id', maxLength: 26, example: '...' })
  @IsString()
  @IsNotEmpty()
  @Length(26, 26)
  public id: string;

}