/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Card, CardType, CardStatus, Currency } from './entities/card.entity';
import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
import { RequestPhysicalCardDto } from './dto/requestPhysicalCard.dto';
import { FundCardDto } from './dto/fundCard.dto';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CardSpendingDto } from 'src/transactions/dto/cardSpending.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  // Create Virtual Card
  async createVirtualCard(
    userId: string,
    createDto: CreateVirtualCardDto,
  ): Promise<Card> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('📥 Received DTO:', createDto);
    console.log('📥 cardName:', createDto.cardName);
    console.log('📥 currency:', createDto.currency);

    // Determine card name
    let cardName: string;
    if (createDto.cardName && createDto.cardName.trim() !== '') {
      cardName = createDto.cardName.trim();
      console.log('✅ Using provided card name:', cardName);
    } else {
      const userCardsCount = await this.cardRepository.count({
        where: { userId },
      });
      cardName = `Virtual Card ${userCardsCount + 1}`;
      console.log('⚠️ Using default card name:', cardName);
    }

    const currency = createDto.currency || Currency.NGN;
    console.log('💰 Final currency:', currency);

    const card = this.cardRepository.create({
      userId,
      cardNumber: Card.generateCardNumber(),
      cvv: Card.generateCVV(),
      expiryDate: Card.generateExpiryDate(),
      cardName: cardName,
      type: CardType.VIRTUAL,
      status: CardStatus.ACTIVE,
      currency: currency,
      balance: 0,
    });

    const savedCard = await this.cardRepository.save(card);
    console.log('✅ Card created:', savedCard);
    return savedCard;
  }

  // Request Physical Card
  async requestPhysicalCard(
    userId: string,
    requestDto: RequestPhysicalCardDto,
  ): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPhysical = await this.cardRepository.findOne({
      where: { userId, type: CardType.PHYSICAL },
    });

    if (existingPhysical) {
      throw new BadRequestException('You already have a physical card');
    }

    const card = this.cardRepository.create({
      userId,
      cardNumber: Card.generateCardNumber(),
      cvv: Card.generateCVV(),
      expiryDate: Card.generateExpiryDate(),
      cardName: requestDto.cardName || 'GTBank Physical Card',
      type: CardType.PHYSICAL,
      status: CardStatus.ACTIVE,
      currency: Currency.NGN,
      balance: 0,
    });

    const savedCard = await this.cardRepository.save(card);

    return {
      message:
        'Physical card request successful. Your card will be delivered to the specified address.',
      card: savedCard,
      deliveryAddress: requestDto.deliveryAddress,
      estimatedDelivery: '5-7 business days',
    };
  }

  // Fund Card
  // async fundCard(
  //   userId: string,
  //   cardId: string,
  //   fundDto: FundCardDto,
  // ): Promise<Card> {
  //   const card = await this.cardRepository.findOne({ where: { id: cardId } });

  //   if (!card) {
  //     throw new NotFoundException('Card not found');
  //   }

  //   if (card.userId !== userId) {
  //     throw new ForbiddenException('You do not have access to this card');
  //   }

  //   if (card.status !== CardStatus.ACTIVE) {
  //     throw new BadRequestException('Card must be active to fund');
  //   }

  //   const user = await this.usersService.findById(userId);
  //   if (user.accountBalance < fundDto.amount) {
  //     throw new BadRequestException('Insufficient account balance');
  //   }

  //   if (fundDto.pin !== '1234') {
  //     throw new BadRequestException('Invalid transaction PIN');
  //   }

  //   await this.usersService.updateBalance(userId, -fundDto.amount);

  //   card.balance = Number(card.balance) + Number(fundDto.amount);

  //   return await this.cardRepository.save(card);
  // }

  async fundCard(
    userId: string,
    cardId: string,
    fundDto: FundCardDto,
  ): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.status !== CardStatus.ACTIVE) {
      throw new BadRequestException('Card must be active to fund');
    }

    const user = await this.usersService.findById(userId);
    if (user.accountBalance < fundDto.amount) {
      throw new BadRequestException('Insufficient account balance');
    }

    if (fundDto.pin !== '1234') {
      throw new BadRequestException('Invalid transaction PIN');
    }

    await this.usersService.updateBalance(userId, -fundDto.amount);

    card.balance = Number(card.balance) + Number(fundDto.amount);

    const updatedCard = await this.cardRepository.save(card);

    // ✅ Record transaction
    await this.transactionsService.recordCardFunding(
      userId,
      cardId,
      fundDto.amount,
      card.cardName,
    );

    return updatedCard;
  }

  // Card Spending (Simulate Purchase)
  async spendOnCard(
    userId: string,
    cardId: string,
    spendingDto: CardSpendingDto,
  ): Promise<any> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.status !== CardStatus.ACTIVE) {
      throw new BadRequestException('Card must be active to make purchases');
    }

    // Check if card has sufficient balance
    if (card.balance < spendingDto.amount) {
      throw new BadRequestException('Insufficient card balance');
    }

    // Store balance before spending
    const balanceBefore = Number(card.balance);

    // Deduct from card balance
    card.balance = Number(card.balance) - Number(spendingDto.amount);

    const updatedCard = await this.cardRepository.save(card);

    // ✅ Record transaction
    await this.transactionsService.recordCardSpending(
      userId,
      cardId,
      spendingDto.amount,
      spendingDto.merchant,
      balanceBefore,
    );

    return {
      message: 'Purchase successful',
      merchant: spendingDto.merchant,
      amount: spendingDto.amount,
      cardName: card.cardName,
      previousBalance: balanceBefore,
      newBalance: card.balance,
      cardNumber: card.getMaskedCardNumber(),
    };
  }

  // Freeze Card
  async freezeCard(userId: string, cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.status === CardStatus.FROZEN) {
      throw new BadRequestException('Card is already frozen');
    }

    if (
      card.status === CardStatus.BLOCKED ||
      card.status === CardStatus.DELETED
    ) {
      throw new BadRequestException('Cannot freeze a blocked or deleted card');
    }

    card.status = CardStatus.FROZEN;
    return await this.cardRepository.save(card);
  }

  // Unfreeze Card
  async unfreezeCard(userId: string, cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.status !== CardStatus.FROZEN) {
      throw new BadRequestException('Card is not frozen');
    }

    card.status = CardStatus.ACTIVE;
    return await this.cardRepository.save(card);
  }

  // Block Card
  async blockCard(userId: string, cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.status === CardStatus.BLOCKED) {
      throw new BadRequestException('Card is already blocked');
    }

    card.status = CardStatus.BLOCKED;
    return await this.cardRepository.save(card);
  }

  // Delete Card
  async deleteCard(userId: string, cardId: string): Promise<any> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (card.type === CardType.PHYSICAL) {
      throw new BadRequestException(
        'Physical cards cannot be deleted. Use block instead.',
      );
    }

    await this.cardRepository.remove(card);

    return {
      message: 'Card deleted successfully',
      cardId,
    };
  }

  // Get all user cards
  async findAllByUser(userId: string): Promise<Card[]> {
    return await this.cardRepository.find({
      where: {
        userId,
        status: Not(CardStatus.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get single card
  async findOne(cardId: string): Promise<any> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return {
      id: card.id,
      cardName: card.cardName,
      cardNumber: card.getMaskedCardNumber(),
      cvv: card.getMaskedCVV(),
      expiryDate: card.expiryDate,
      type: card.type,
      status: card.status,
      currency: card.currency,
      balance: card.balance,
      createdAt: card.createdAt,
    };
  }

  // Get card details (full)
  async getCardDetails(userId: string, cardId: string): Promise<any> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    return {
      id: card.id,
      cardName: card.cardName,
      cardNumber: card.cardNumber,
      cvv: card.cvv,
      expiryDate: card.expiryDate,
      type: card.type,
      status: card.status,
      currency: card.currency,
      balance: card.balance,
      createdAt: card.createdAt,
    };
  }
}
