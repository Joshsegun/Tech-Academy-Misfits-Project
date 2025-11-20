// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/require-await */
// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Card, CardType, CardStatus, Currency } from './entities/card.entity';
// import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
// import { RequestPhysicalCardDto } from './dto/requestPhysicalCard.dto';
// import { FundCardDto } from './dto/fundCard.dto';
// import { UsersService } from '../users/users.service';

// @Injectable()
// export class CardsService {
//   private cards: Card[] = []; // In-memory storage

//   constructor(private usersService: UsersService) {}

//   //  Create Virtual Card
//   //   async createVirtualCard(
//   //     userId: string,
//   //     createDto: CreateVirtualCardDto,
//   //   ): Promise<Card> {
//   //     const user = await this.usersService.findById(userId);
//   //     if (!user) {
//   //       throw new NotFoundException('User not found');
//   //     }

//   //     console.log('📥 Received DTO:', createDto);
//   //     console.log('📥 cardName:', createDto.cardName);
//   //     console.log('📥 currency:', createDto.currency);
//   //     console.log('📥 typeof cardName:', typeof createDto.cardName);
//   //     console.log('📥 typeof currency:', typeof createDto.currency);

//   //     const card = new Card({
//   //       userId,
//   //       cardNumber: Card.generateCardNumber(),
//   //       cvv: Card.generateCVV(),
//   //       expiryDate: Card.generateExpiryDate(),
//   //       cardName:
//   //         createDto.cardName ||
//   //         `Virtual Card ${this.cards.filter((c) => c.userId === userId).length + 1}`,
//   //       type: CardType.VIRTUAL,
//   //       status: CardStatus.ACTIVE,
//   //       currency: createDto.currency || Currency.NGN,
//   //       balance: 0,
//   //     });

//   //     this.cards.push(card);
//   //     return card;
//   //   }

//   async createVirtualCard(
//     userId: string,
//     createDto: CreateVirtualCardDto,
//   ): Promise<Card> {
//     const user = await this.usersService.findById(userId);
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // DEBUG: Log what we received
//     console.log('📥 Received DTO:', createDto);
//     console.log('📥 cardName:', createDto.cardName);
//     console.log('📥 currency:', createDto.currency);
//     console.log('📥 typeof cardName:', typeof createDto.cardName);
//     console.log('📥 typeof currency:', typeof createDto.currency);

//     // Determine card name
//     let cardName: string;
//     if (createDto.cardName && createDto.cardName.trim() !== '') {
//       cardName = createDto.cardName.trim();
//       console.log('✅ Using provided card name:', cardName);
//     } else {
//       const userCards = this.cards.filter((c) => c.userId === userId);
//       cardName = `Virtual Card ${userCards.length + 1}`;
//       console.log('⚠️ Using default card name:', cardName);
//     }

//     // Determine currency
//     const currency = createDto.currency || Currency.NGN;
//     console.log('💰 Final currency:', currency);

//     const card = new Card({
//       userId,
//       cardNumber: Card.generateCardNumber(),
//       cvv: Card.generateCVV(),
//       expiryDate: Card.generateExpiryDate(),
//       cardName: cardName,
//       type: CardType.VIRTUAL,
//       status: CardStatus.ACTIVE,
//       currency: currency,
//       balance: 0,
//     });

//     this.cards.push(card);
//     console.log('✅ Card created:', card);
//     return card;
//   }

//   // Request Physical Card
//   async requestPhysicalCard(
//     userId: string,
//     requestDto: RequestPhysicalCardDto,
//   ): Promise<any> {
//     const user = await this.usersService.findById(userId);
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     // Check if user already has a physical card
//     const existingPhysical = this.cards.find(
//       (c) => c.userId === userId && c.type === CardType.PHYSICAL,
//     );

//     if (existingPhysical) {
//       throw new BadRequestException('You already have a physical card');
//     }

//     // In real scenario, this would create a request that needs approval
//     // For now, we'll create the card immediately
//     const card = new Card({
//       userId,
//       cardNumber: Card.generateCardNumber(),
//       cvv: Card.generateCVV(),
//       expiryDate: Card.generateExpiryDate(),
//       cardName: requestDto.cardName || 'GTBank Physical Card',
//       type: CardType.PHYSICAL,
//       status: CardStatus.ACTIVE,
//       currency: Currency.NGN,
//       balance: 0,
//     });

//     this.cards.push(card);

//     return {
//       message:
//         'Physical card request successful. Your card will be delivered to the specified address.',
//       card,
//       deliveryAddress: requestDto.deliveryAddress,
//       estimatedDelivery: '5-7 business days',
//     };
//   }

//   // Fund Card
//   async fundCard(
//     userId: string,
//     cardId: string,
//     fundDto: FundCardDto,
//   ): Promise<Card> {
//     // const card = await this.findOne(cardId);

//     const card = this.cards.find((c) => c.id === cardId);

//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     if (card.status !== CardStatus.ACTIVE) {
//       throw new BadRequestException('Card must be active to fund');
//     }

//     // Verify user has enough balance
//     const user = await this.usersService.findById(userId);
//     if (user.accountBalance < fundDto.amount) {
//       throw new BadRequestException('Insufficient account balance');
//     }

//     // Simple PIN verification (in production, use hashed PIN)
//     if (fundDto.pin !== '1234') {
//       // Mock PIN verification
//       throw new BadRequestException('Invalid transaction PIN');
//     }

//     // Deduct from user account
//     await this.usersService.updateBalance(userId, -fundDto.amount);

//     // Add to card balance
//     card.balance = Number(card.balance) + Number(fundDto.amount);
//     card.updatedAt = new Date();

//     return card;
//   }

//   // Freeze Card
//   async freezeCard(userId: string, cardId: string): Promise<Card> {
//     // const card = await this.findOne(cardId);

//     const card = this.cards.find((c) => c.id === cardId);

//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     if (card.status === CardStatus.FROZEN) {
//       throw new BadRequestException('Card is already frozen');
//     }

//     if (
//       card.status === CardStatus.BLOCKED ||
//       card.status === CardStatus.DELETED
//     ) {
//       throw new BadRequestException('Cannot freeze a blocked or deleted card');
//     }

//     card.status = CardStatus.FROZEN;
//     card.updatedAt = new Date();

//     return card;
//   }

//   // Unfreeze Card
//   async unfreezeCard(userId: string, cardId: string): Promise<Card> {
//     // const card = await this.findOne(cardId);

//     const card = this.cards.find((c) => c.id === cardId);

//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     if (card.status !== CardStatus.FROZEN) {
//       throw new BadRequestException('Card is not frozen');
//     }

//     card.status = CardStatus.ACTIVE;
//     card.updatedAt = new Date();

//     return card;
//   }

//   // Block Card (for lost/stolen cards)
//   async blockCard(userId: string, cardId: string): Promise<Card> {
//     // const card = await this.findOne(cardId);

//     const card = this.cards.find((c) => c.id === cardId);

//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     if (card.status === CardStatus.BLOCKED) {
//       throw new BadRequestException('Card is already blocked');
//     }

//     card.status = CardStatus.BLOCKED;
//     card.updatedAt = new Date();

//     return card;
//   }

//   // Delete Card (soft delete for virtual cards)
//   async deleteCard(userId: string, cardId: string): Promise<any> {
//     // const card = await this.findOne(cardId);

//     const card = this.cards.find((c) => c.id === cardId);

//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     if (card.type === CardType.PHYSICAL) {
//       throw new BadRequestException(
//         'Physical cards cannot be deleted. Use block instead.',
//       );
//     }

//     // For virtual cards, we can actually remove them
//     const index = this.cards.findIndex((c) => c.id === cardId);
//     this.cards.splice(index, 1);

//     return {
//       message: 'Card deleted successfully',
//       cardId,
//     };
//   }

//   //   // Get all user cards
//   //   async findAllByUser(userId: string): Promise<Card[]> {
//   //     return this.cards
//   //       .filter((c) => c.userId === userId && c.status !== CardStatus.DELETED)
//   //       .map((card) => ({
//   //         ...card,
//   //         cardNumber: card.getMaskedCardNumber(),
//   //         cvv: card.getMaskedCVV(),
//   //       }));
//   //   }

//   // Get all user cards
//   async findAllByUser(userId: string): Promise<Card[]> {
//     const userCards = this.cards.filter(
//       (c) => c.userId === userId && c.status !== CardStatus.DELETED,
//     );

//     // Return the cards (they're already Card instances)
//     // Frontend can call getMaskedCardNumber() when displaying
//     return userCards;
//   }

//   // Get single card
//   async findOne(cardId: string): Promise<any> {
//     const card = this.cards.find((c) => c.id === cardId);
//     if (!card) {
//       throw new NotFoundException('Card not found');
//     }
//     // return card;
//     return {
//       id: card.id,
//       cardName: card.cardName,
//       cardNumber: card.getMaskedCardNumber(), // Full number
//       cvv: card.getMaskedCVV(), // Full CVV
//       expiryDate: card.expiryDate,
//       type: card.type,
//       status: card.status,
//       currency: card.currency,
//       balance: card.balance,
//       createdAt: card.createdAt,
//     };
//   }

//   // Get card details (with full card number for copying)
//   async getCardDetails(userId: string, cardId: string): Promise<any> {
//     const card = this.cards.find((c) => c.id === cardId);

//     console.log(card.userId, userId);
//     if (card.userId !== userId) {
//       throw new ForbiddenException('You do not have access to this card');
//     }

//     // Return full details (in production, add extra security here)
//     return {
//       id: card.id,
//       cardName: card.cardName,
//       cardNumber: card.cardNumber, // Full number
//       cvv: card.cvv, // Full CVV
//       expiryDate: card.expiryDate,
//       type: card.type,
//       status: card.status,
//       currency: card.currency,
//       balance: card.balance,
//       createdAt: card.createdAt,
//     };
//   }
// }

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
