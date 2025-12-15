// /* eslint-disable @typescript-eslint/no-unsafe-call */
// import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class CardSpendingDto {
//   @ApiProperty()
//   @IsNumber()
//   @IsPositive()
//   amount: number;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   merchant: string;
// }

/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CardSpendingDto {
  @ApiProperty({
    example: 'GTC-VISA-001',
    description: 'The name or unique identifier of the card to debit.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  cardName: string;

  @ApiProperty({
    example: 'Airtime',
    description: 'The bill category. Example: Airtime, Data, Electricity, Betting, etc.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  merchant: string;

  @ApiProperty({
    example: 5000,
    description: 'Amount to be charged.',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 1234567890,
    description: 'Customer phone number, meter number, or bill reference number.',
  })
  @IsNumber()
  @IsPositive()
  billReference: number;
}
