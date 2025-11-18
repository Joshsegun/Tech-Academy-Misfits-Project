import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestPhysicalCardDto {
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsOptional()
  cardName?: string;
}
