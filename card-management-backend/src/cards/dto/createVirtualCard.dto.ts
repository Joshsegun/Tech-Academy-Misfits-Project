import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Currency } from '../entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVirtualCardDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Currency, { message: 'Currency must be NGN, USD, EUR, or GBP' })
  currency?: Currency;
}
