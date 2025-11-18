import { IsEnum } from 'class-validator';
import { CardStatus } from '../entities/card.entity';

export class UpdateCardStatusDto {
  @IsEnum(CardStatus)
  status: CardStatus;
}
