import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBalanceDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
