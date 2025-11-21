/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      accountBalance: user.accountBalance,
      email: user.email,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-balance')
  async addBalance(@Request() req, @Body() body: { amount: number }) {
    const user = await this.usersService.updateBalance(
      req.user.userId,
      body.amount,
    );
    return {
      message: 'Balance added successfully',
      newBalance: user.accountBalance,
    };
  }

  // Optional: Get all users (for testing purposes)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}