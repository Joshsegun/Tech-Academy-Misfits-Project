// import { Module } from '@nestjs/common';
// import { CardsService } from './cards.service';
// import { CardsController } from './cards.contoller';
// import { UsersModule } from '../users/users.module';

// @Module({
//   imports: [UsersModule],
//   controllers: [CardsController],
//   providers: [CardsService],
//   exports: [CardsService],
// })
// export class CardsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.contoller';
import { Card } from './entities/card.entity';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), UsersModule, TransactionsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
