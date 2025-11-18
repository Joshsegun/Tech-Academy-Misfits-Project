import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class FundAccountDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  source?: string; // e.g., "bank_transfer", "card", etc.

  @IsString()
  @IsOptional()
  reference?: string;
}
