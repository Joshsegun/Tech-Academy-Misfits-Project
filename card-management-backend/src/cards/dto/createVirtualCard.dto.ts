// import { IsString, IsOptional, IsEnum } from 'class-validator';
// import { Currency } from '../entities/card.entity';

// export class CreateVirtualCardDto {
//   @IsString()
//   @IsOptional()
//   cardName?: string;

//   @IsEnum(Currency)
//   @IsOptional()
//   currency?: Currency;
// }

import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Currency } from '../entities/card.entity';

export class CreateVirtualCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardName?: string;

  @IsOptional()
  @IsEnum(Currency, { message: 'Currency must be NGN, USD, EUR, or GBP' })
  currency?: Currency;
}
