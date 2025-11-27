/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from '../users/dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';
import { SendOtpDto } from 'src/otp/dto/send-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @Post('send-otp')
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.accountNumber);
  }

  @Post('verify-otp')
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.otp);
  }
}
