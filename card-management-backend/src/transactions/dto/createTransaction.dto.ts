import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  merchant?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cardId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference?: string;
}
