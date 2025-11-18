import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.contoller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
