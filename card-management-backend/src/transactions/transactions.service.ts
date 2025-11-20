/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { FilterTransactionsDto } from './dto/filterTransactions.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private usersService: UsersService,
  ) {}

  // Create Transaction
  async createTransaction(
    userId: string,
    createDto: CreateTransactionDto,
    balanceBefore: number,
    balanceAfter: number,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      userId,
      amount: createDto.amount,
      type: createDto.type,
      description: createDto.description,
      merchant: createDto.merchant,
      cardId: createDto.cardId,
      reference: createDto.reference,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
    });

    return await this.transactionRepository.save(transaction);
  }

  // Get All User Transactions
  async getUserTransactions(
    userId: string,
    filterDto?: FilterTransactionsDto,
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    // Apply filters
    if (filterDto) {
      if (filterDto.type) {
        queryBuilder.andWhere('transaction.type = :type', {
          type: filterDto.type,
        });
      }

      if (filterDto.status) {
        queryBuilder.andWhere('transaction.status = :status', {
          status: filterDto.status,
        });
      }

      if (filterDto.cardId) {
        queryBuilder.andWhere('transaction.cardId = :cardId', {
          cardId: filterDto.cardId,
        });
      }

      if (filterDto.startDate) {
        queryBuilder.andWhere('transaction.createdAt >= :startDate', {
          startDate: new Date(filterDto.startDate),
        });
      }

      if (filterDto.endDate) {
        queryBuilder.andWhere('transaction.createdAt <= :endDate', {
          endDate: new Date(filterDto.endDate),
        });
      }
    }

    // Sort by date descending
    return await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  // Get Single Transaction
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // Get Card Transactions
  async getCardTransactions(
    userId: string,
    cardId: string,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { userId, cardId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get Recent Transactions
  async getRecentTransactions(
    userId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Get Transaction Statistics
  async getTransactionStats(userId: string): Promise<any> {
    const userTransactions = await this.transactionRepository.find({
      where: { userId },
    });

    const totalInflow = userTransactions
      .filter(
        (txn) =>
          txn.type === TransactionType.DEPOSIT ||
          txn.type === TransactionType.INFLOW,
      )
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    const totalOutflow = userTransactions
      .filter(
        (txn) =>
          txn.type === TransactionType.WITHDRAW ||
          txn.type === TransactionType.OUTFLOW ||
          txn.type === TransactionType.CARD_FUNDING ||
          txn.type === TransactionType.CARD_SPENDING,
      )
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    const totalCardSpending = userTransactions
      .filter((txn) => txn.type === TransactionType.CARD_SPENDING)
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    return {
      totalTransactions: userTransactions.length,
      totalInflow,
      totalOutflow,
      totalCardSpending,
      netFlow: totalInflow - totalOutflow,
      transactionsByType: this.groupByType(userTransactions),
      transactionsByStatus: this.groupByStatus(userTransactions),
    };
  }

  // Helpers
  private groupByType(transactions: Transaction[]): any {
    const grouped = {};
    transactions.forEach((txn) => {
      if (!grouped[txn.type]) {
        grouped[txn.type] = { count: 0, total: 0 };
      }
      grouped[txn.type].count += 1;
      grouped[txn.type].total += Number(txn.amount);
    });
    return grouped;
  }

  private groupByStatus(transactions: Transaction[]): any {
    const grouped = {};
    transactions.forEach((txn) => {
      if (!grouped[txn.status]) {
        grouped[txn.status] = 0;
      }
      grouped[txn.status] += 1;
    });
    return grouped;
  }

  // Record Deposit
  async recordDeposit(
    userId: string,
    amount: number,
    description: string,
  ): Promise<Transaction> {
    const user = await this.usersService.findById(userId);
    const balanceBefore = user.accountBalance;
    const balanceAfter = Number(balanceBefore) + Number(amount);

    return this.createTransaction(
      userId,
      {
        amount,
        type: TransactionType.DEPOSIT,
        description,
      },
      balanceBefore,
      balanceAfter,
    );
  }

  // Record Withdrawal
  async recordWithdrawal(
    userId: string,
    amount: number,
    description: string,
  ): Promise<Transaction> {
    const user = await this.usersService.findById(userId);
    const balanceBefore = user.accountBalance;
    const balanceAfter = Number(balanceBefore) - Number(amount);

    return this.createTransaction(
      userId,
      {
        amount,
        type: TransactionType.WITHDRAW,
        description,
      },
      balanceBefore,
      balanceAfter,
    );
  }

  // Record Card Funding
  async recordCardFunding(
    userId: string,
    cardId: string,
    amount: number,
    cardName: string,
  ): Promise<Transaction> {
    const user = await this.usersService.findById(userId);
    const balanceBefore = user.accountBalance;
    const balanceAfter = Number(balanceBefore) - Number(amount);

    return this.createTransaction(
      userId,
      {
        amount,
        type: TransactionType.CARD_FUNDING,
        description: `Funded ${cardName}`,
        cardId,
      },
      balanceBefore,
      balanceAfter,
    );
  }

  // Record Card Spending
  async recordCardSpending(
    userId: string,
    cardId: string,
    amount: number,
    merchant: string,
    cardBalance: number,
  ): Promise<Transaction> {
    return this.createTransaction(
      userId,
      {
        amount,
        type: TransactionType.CARD_SPENDING,
        description: `Purchase at ${merchant}`,
        merchant,
        cardId,
      },
      cardBalance + amount,
      cardBalance,
    );
  }
}
