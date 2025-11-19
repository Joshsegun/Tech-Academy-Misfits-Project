/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, NotFoundException } from '@nestjs/common';
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
  private transactions: Transaction[] = []; // In-memory storage

  constructor(private usersService: UsersService) {}

  // Create Transaction
  async createTransaction(
    userId: string,
    createDto: CreateTransactionDto,
    balanceBefore: number,
    balanceAfter: number,
  ): Promise<Transaction> {
    const transaction = new Transaction({
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

    this.transactions.push(transaction);
    return transaction;
  }

  // Get All User Transactions
  async getUserTransactions(
    userId: string,
    filterDto?: FilterTransactionsDto,
  ): Promise<Transaction[]> {
    let userTransactions = this.transactions.filter(
      (txn) => txn.userId === userId,
    );

    // Apply filters
    if (filterDto) {
      if (filterDto.type) {
        userTransactions = userTransactions.filter(
          (txn) => txn.type === filterDto.type,
        );
      }

      if (filterDto.status) {
        userTransactions = userTransactions.filter(
          (txn) => txn.status === filterDto.status,
        );
      }

      if (filterDto.cardId) {
        userTransactions = userTransactions.filter(
          (txn) => txn.cardId === filterDto.cardId,
        );
      }

      if (filterDto.startDate) {
        const startDate = new Date(filterDto.startDate);
        userTransactions = userTransactions.filter(
          (txn) => txn.createdAt >= startDate,
        );
      }

      if (filterDto.endDate) {
        const endDate = new Date(filterDto.endDate);
        userTransactions = userTransactions.filter(
          (txn) => txn.createdAt <= endDate,
        );
      }
    }

    // Sort by date descending (newest first)
    return userTransactions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  // Get Single Transaction
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const transaction = this.transactions.find(
      (txn) => txn.id === transactionId,
    );

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
    return this.transactions
      .filter((txn) => txn.userId === userId && txn.cardId === cardId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get Recent Transactions (Last 10)
  async getRecentTransactions(
    userId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    return this.transactions
      .filter((txn) => txn.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get Transaction Statistics
  async getTransactionStats(userId: string): Promise<any> {
    const userTransactions = this.transactions.filter(
      (txn) => txn.userId === userId,
    );

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

  // Helper: Group by Type
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

  // Helper: Group by Status
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

  // Record Deposit Transaction
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

  // Record Withdrawal Transaction
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

  // Record Card Funding Transaction
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

  // Record Card Spending Transaction
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
