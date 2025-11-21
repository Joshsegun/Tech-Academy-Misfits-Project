import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import {
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FilterTransactionsDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
