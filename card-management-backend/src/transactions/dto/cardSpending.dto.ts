import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class CardSpendingDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  merchant: string;
}
