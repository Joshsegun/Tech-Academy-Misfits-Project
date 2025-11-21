import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundAccountDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  source?: string; // e.g., "bank_transfer", "card", etc.

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference?: string;
}
