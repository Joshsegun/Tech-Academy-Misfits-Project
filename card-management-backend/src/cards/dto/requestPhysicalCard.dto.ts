import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPhysicalCardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cardName?: string;
}
