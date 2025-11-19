import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.contoller';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [UsersModule, TransactionsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
