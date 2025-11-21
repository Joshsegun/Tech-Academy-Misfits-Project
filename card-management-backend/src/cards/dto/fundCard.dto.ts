import {
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundCardDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Transaction PIN is required' })
  @Length(4, 4, { message: 'Transaction PIN must be 4 digits' })
  pin: string; // Transaction PIN for security
}
