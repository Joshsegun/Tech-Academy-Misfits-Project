import {
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class FundCardDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Transaction PIN is required' })
  @Length(4, 4, { message: 'Transaction PIN must be 4 digits' })
  pin: string; // Transaction PIN for security
}
