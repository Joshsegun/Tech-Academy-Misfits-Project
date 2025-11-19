// import {
//   Injectable,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { AddBalanceDto } from './dto/addBalance.dto';
// import { FundAccountDto } from './dto/fundAccount.dto';
// import { WithdrawDto } from './dto/withdraw.dto';

// @Injectable()
// export class AccountsService {
//   constructor(private usersService: UsersService) {}

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

//   // Get Account Summary
//   async getAccountSummary(userId: string) {
//     const user = await this.usersService.findById(userId);

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     return {
//       accountNumber: this.generateAccountNumber(userId),
//       accountName: `${user.firstName} ${user.lastName}`,
//       accountBalance: user.accountBalance,
//       availableBalance: user.accountBalance,
//       currency: 'NGN',
//       email: user.email,
//       accountType: 'Savings',
//       status: 'Active',
//     };
//   }

//   // Add Balance (For Testing/Simulation)
//   async addBalance(userId: string, addBalanceDto: AddBalanceDto) {
//     const user = await this.usersService.updateBalance(
//       userId,
//       addBalanceDto.amount,
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

//     // In production, you'd integrate with payment gateway here
//     const reference = fundAccountDto.reference || this.generateReference();

//     await this.usersService.updateBalance(userId, fundAccountDto.amount);

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
//     // Simple mock - in production, use proper account number generation
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
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AddBalanceDto } from './dto/addBalance.dto';
import { FundAccountDto } from './dto/fundAccount.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class AccountsService {
  constructor(
    private usersService: UsersService,
    private transactionsService: TransactionsService, // ← Added
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

  // Get Account Summary
  async getAccountSummary(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      accountNumber: this.generateAccountNumber(userId),
      accountName: `${user.firstName} ${user.lastName}`,
      accountBalance: user.accountBalance,
      availableBalance: user.accountBalance,
      currency: 'NGN',
      email: user.email,
      accountType: 'Savings',
      status: 'Active',
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
