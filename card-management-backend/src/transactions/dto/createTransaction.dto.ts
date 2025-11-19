import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  merchant?: string;

  @IsString()
  @IsOptional()
  cardId?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
