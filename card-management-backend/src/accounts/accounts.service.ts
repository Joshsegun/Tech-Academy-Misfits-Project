// import {
//   Injectable,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { TransactionsService } from '../transactions/transactions.service';
// import { AddBalanceDto } from './dto/addBalance.dto';
// import { FundAccountDto } from './dto/fundAccount.dto';
// import { WithdrawDto } from './dto/withdraw.dto';

// // 🚨 NEW: Mock card balances for simulation purposes
// // In a real application, you would query a Card entity or repository here.
// const MOCK_CARD_BALANCES = [
//   { cardId: 'temu-card', cardName: 'Temu Card', balance: 50.0 },
//   { cardId: 'jumia-card', cardName: 'Jumia Card', balance: 150.0 },
//   { cardId: 'konga-card', cardName: 'Konga Card', balance: 75.0 },
// ];

// @Injectable()
// export class AccountsService {
//   constructor(
//     private usersService: UsersService,
//     private transactionsService: TransactionsService, // ← Added
//   ) {}

//   // Get Account Balance
//   async getBalance(userId: string) {
//     const user = await this.usersService.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     return {
//       accountBalance: user.accountBalance,
//       availableBalance: user.accountBalance,
//       currency: 'NGN',
//       email: user.email,
//     };
//   }

//   // 🚨 UPDATED: Get Account Summary (Now includes card balances)
//   async getAccountSummary(userId: string) {
//     const user = await this.usersService.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // Ensure balance is a number for safety
//     const mainBalance = Number(user.accountBalance) || 0;

//     return {
//       accountNumber: this.generateAccountNumber(userId),
//       accountName: `${user.firstName} ${user.lastName}`,
//       accountBalance: mainBalance, // Main account balance
//       availableBalance: mainBalance,
//       currency: 'NGN',
//       email: user.email,
//       accountType: 'Savings',
//       status: 'Active',
//       // 🚨 NEW DATA FIELD: Consolidated list of virtual card balances
//       cardBalances: MOCK_CARD_BALANCES,
//     };
//   }

//   // Add Balance (For Testing/Simulation)
//   async addBalance(userId: string, addBalanceDto: AddBalanceDto) {
//     const user = await this.usersService.updateBalance(
//       userId,
//       addBalanceDto.amount,
//     );

//     // ✅ Record transaction
//     await this.transactionsService.recordDeposit(
//       userId,
//       addBalanceDto.amount,
//       'Balance added to account',
//     );

//     return {
//       message: 'Balance added successfully',
//       accountBalance: user.accountBalance,
//       amountAdded: addBalanceDto.amount,
//       email: user.email,
//     };
//   }

//   // Fund Account (Simulated deposit)
//   async fundAccount(userId: string, fundAccountDto: FundAccountDto) {
//     const user = await this.usersService.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     const reference = fundAccountDto.reference || this.generateReference();

//     await this.usersService.updateBalance(userId, fundAccountDto.amount);

//     // ✅ Record transaction
//     await this.transactionsService.recordDeposit(
//       userId,
//       fundAccountDto.amount,
//       `Account funded via ${fundAccountDto.source || 'bank transfer'}`,
//     );

//     return {
//       message: 'Account funded successfully',
//       amount: fundAccountDto.amount,
//       reference: reference,
//       newBalance: Number(user.accountBalance) + Number(fundAccountDto.amount),
//       status: 'Completed',
//     };
//   }

//   // Withdraw from Account
//   async withdraw(userId: string, withdrawDto: WithdrawDto) {
//     const user = await this.usersService.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // Verify PIN (Mock - in production use hashed PIN)
//     if (withdrawDto.pin !== '1234') {
//       throw new BadRequestException('Invalid transaction PIN');
//     }

//     // Check sufficient balance
//     if (user.accountBalance < withdrawDto.amount) {
//       throw new BadRequestException('Insufficient account balance');
//     }

//     await this.usersService.updateBalance(userId, -withdrawDto.amount);

//     // ✅ Record transaction
//     await this.transactionsService.recordWithdrawal(
//       userId,
//       withdrawDto.amount,
//       'Withdrawal from account',
//     );

//     return {
//       message: 'Withdrawal successful',
//       amount: withdrawDto.amount,
//       reference: this.generateReference(),
//       newBalance: Number(user.accountBalance) - Number(withdrawDto.amount),
//       status: 'Completed',
//     };
//   }

//   // Helper: Generate Account Number
//   private generateAccountNumber(userId: string): string {
//     const hash = userId.split('_')[1] || 'default';
//     return '01' + hash.padEnd(8, '0').slice(0, 8);
//   }

//   // Helper: Generate Transaction Reference
//   private generateReference(): string {
//     return (
//       'REF' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
//     );
//   }
// }

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AddBalanceDto } from './dto/addBalance.dto';
import { FundAccountDto } from './dto/fundAccount.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Card, CardStatus } from '../cards/entities/card.entity'; // ✅ Import Card entity

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Card) // ✅ Inject Card repository
    private cardRepository: Repository<Card>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  // Get Account Balance
  async getBalance(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      accountBalance: user.accountBalance,
      availableBalance: user.accountBalance,
      currency: 'NGN',
      email: user.email,
    };
  }

  // ✅ UPDATED: Get Account Summary (Now fetches REAL card balances from database)
  async getAccountSummary(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ✅ Fetch real cards from database
    const userCards = await this.cardRepository.find({
      where: {
        userId,
        status: Not(CardStatus.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // ✅ Map cards to the format expected by frontend
    const cardBalances = userCards.map((card) => ({
      cardId: card.id,
      cardName: card.cardName,
      balance: Number(card.balance) || 0,
    }));

    // Ensure balance is a number for safety
    const mainBalance = Number(user.accountBalance) || 0;

    return {
      accountNumber: this.generateAccountNumber(userId),
      accountName: `${user.firstName} ${user.lastName}`,
      accountBalance: mainBalance,
      availableBalance: mainBalance,
      currency: 'NGN',
      email: user.email,
      accountType: 'Savings',
      status: 'Active',
      cardBalances, // ✅ Now returns REAL card data from database
    };
  }

  // Add Balance (For Testing/Simulation)
  async addBalance(userId: string, addBalanceDto: AddBalanceDto) {
    const user = await this.usersService.updateBalance(
      userId,
      addBalanceDto.amount,
    );

    // ✅ Record transaction
    await this.transactionsService.recordDeposit(
      userId,
      addBalanceDto.amount,
      'Balance added to account',
    );

    return {
      message: 'Balance added successfully',
      accountBalance: user.accountBalance,
      amountAdded: addBalanceDto.amount,
      email: user.email,
    };
  }

  // Fund Account (Simulated deposit)
  async fundAccount(userId: string, fundAccountDto: FundAccountDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reference = fundAccountDto.reference || this.generateReference();

    await this.usersService.updateBalance(userId, fundAccountDto.amount);

    // ✅ Record transaction
    await this.transactionsService.recordDeposit(
      userId,
      fundAccountDto.amount,
      `Account funded via ${fundAccountDto.source || 'bank transfer'}`,
    );

    return {
      message: 'Account funded successfully',
      amount: fundAccountDto.amount,
      reference: reference,
      newBalance: Number(user.accountBalance) + Number(fundAccountDto.amount),
      status: 'Completed',
    };
  }

  // Withdraw from Account
  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify PIN (Mock - in production use hashed PIN)
    if (withdrawDto.pin !== '1234') {
      throw new BadRequestException('Invalid transaction PIN');
    }

    // Check sufficient balance
    if (user.accountBalance < withdrawDto.amount) {
      throw new BadRequestException('Insufficient account balance');
    }

    await this.usersService.updateBalance(userId, -withdrawDto.amount);

    // ✅ Record transaction
    await this.transactionsService.recordWithdrawal(
      userId,
      withdrawDto.amount,
      'Withdrawal from account',
    );

    return {
      message: 'Withdrawal successful',
      amount: withdrawDto.amount,
      reference: this.generateReference(),
      newBalance: Number(user.accountBalance) - Number(withdrawDto.amount),
      status: 'Completed',
    };
  }

  // Helper: Generate Account Number
  private generateAccountNumber(userId: string): string {
    const hash = userId.split('_')[1] || 'default';
    return '01' + hash.padEnd(8, '0').slice(0, 8);
  }

  // Helper: Generate Transaction Reference
  private generateReference(): string {
    return (
      'REF' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
    );
  }
}
