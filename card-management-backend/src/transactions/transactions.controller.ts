/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterTransactionsDto } from './dto/filterTransactions.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Get All User Transactions (with optional filters)
  @Get()
  getUserTransactions(
    @Request() req,
    @Query() filterDto: FilterTransactionsDto,
  ) {
    return this.transactionsService.getUserTransactions(
      req.user.userId,
      filterDto,
    );
  }

  // Get Recent Transactions
  @Get('recent')
  getRecentTransactions(@Request() req, @Query('limit') limit?: number) {
    return this.transactionsService.getRecentTransactions(
      req.user.userId,
      limit || 10,
    );
  }

  // Get Transaction Statistics
  @Get('stats')
  getTransactionStats(@Request() req) {
    return this.transactionsService.getTransactionStats(req.user.userId);
  }

  // Get Single Transaction
  @Get(':id')
  getTransactionById(@Param('id') id: string) {
    return this.transactionsService.getTransactionById(id);
  }

  // Get Card Transactions
  @Get('card/:cardId')
  getCardTransactions(@Request() req, @Param('cardId') cardId: string) {
    return this.transactionsService.getCardTransactions(
      req.user.userId,
      cardId,
    );
  }
}
