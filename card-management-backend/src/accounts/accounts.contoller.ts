/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddBalanceDto } from './dto/addBalance.dto';
import { FundAccountDto } from './dto/fundAccount.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  // Get Account Balance
  @Get('balance')
  getBalance(@Request() req) {
    return this.accountsService.getBalance(req.user.userId);
  }

  // Get Account Summary
  @Get('summary')
  getAccountSummary(@Request() req) {
    return this.accountsService.getAccountSummary(req.user.userId);
  }

  // Add Balance (For Testing)
  @Post('add-balance')
  addBalance(@Request() req, @Body() addBalanceDto: AddBalanceDto) {
    return this.accountsService.addBalance(req.user.userId, addBalanceDto);
  }

  // Fund Account
  @Post('fund')
  fundAccount(@Request() req, @Body() fundAccountDto: FundAccountDto) {
    return this.accountsService.fundAccount(req.user.userId, fundAccountDto);
  }

  // Withdraw from Account
  @Post('withdraw')
  withdraw(@Request() req, @Body() withdrawDto: WithdrawDto) {
    return this.accountsService.withdraw(req.user.userId, withdrawDto);
  }
}
