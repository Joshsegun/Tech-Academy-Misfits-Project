import { IsNumber, IsPositive } from 'class-validator';

export class AddBalanceDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
