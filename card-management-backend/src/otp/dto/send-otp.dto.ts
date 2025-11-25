// send-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '1234567890',
    description: 'User’s account number for OTP dispatch',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10) 
  accountNumber: string;
}
