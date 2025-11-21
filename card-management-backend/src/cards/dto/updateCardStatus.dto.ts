import { IsEnum } from 'class-validator';
import { CardStatus } from '../entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCardStatusDto {
  @ApiProperty()
  @IsEnum(CardStatus)
  status: CardStatus;
}
