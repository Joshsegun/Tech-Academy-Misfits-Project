import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import {
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';

export class FilterTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
