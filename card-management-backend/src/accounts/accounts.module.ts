// import { Module } from '@nestjs/common';
// import { AccountsService } from './accounts.service';
// import { AccountsController } from './accounts.contoller';
// import { UsersModule } from '../users/users.module';
// import { TransactionsModule } from 'src/transactions/transactions.module';

// @Module({
//   imports: [UsersModule, TransactionsModule],
//   controllers: [AccountsController],
//   providers: [AccountsService],
//   exports: [AccountsService],
// })
// export class AccountsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.contoller';
import { AccountsService } from './accounts.service';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Card } from '../cards/entities/card.entity'; // ✅ Import Card entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Card]), // ✅ Add this line - registers Card repository
    UsersModule,
    TransactionsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
