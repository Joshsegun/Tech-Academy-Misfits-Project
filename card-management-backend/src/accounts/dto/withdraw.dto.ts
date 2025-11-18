import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  pin: string; // Transaction PIN
}
