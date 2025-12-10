// src/transactions/dto/filterTransactions.dto.ts
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FilterTransactionsDto {
  @ApiProperty({ required: false, description: 'Use "inflow" or "outflow"' })
  @IsOptional()
  @IsString()
  type?: string; // Accepts "inflow" | "outflow" (case-insensitive)

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
