// import { IsNotEmpty, IsNumber, IsString, Min, Length } from 'class-validator';
// import { Type } from 'class-transformer';

// export class FundCardDto {
//   @Type(() => Number)
//   @IsNumber({}, { message: 'Amount must be a number' })
//   @IsNotEmpty({ message: 'Amount is required' })
//   @Min(100, { message: 'Minimum funding amount is NGN 100' })
//   amount: number;

//   @IsString()
//   @IsNotEmpty({ message: 'Transaction PIN is required' })
//   @Length(4, 4, { message: 'Transaction PIN must be 4 digits' })
//   transactionPin: string;
// }
