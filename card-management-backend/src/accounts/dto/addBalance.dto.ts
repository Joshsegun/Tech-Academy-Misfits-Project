import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBalanceDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
