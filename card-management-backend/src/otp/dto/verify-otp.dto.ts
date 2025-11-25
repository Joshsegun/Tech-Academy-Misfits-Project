import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: '123456',
    description: 'The OTP sent to the user',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
