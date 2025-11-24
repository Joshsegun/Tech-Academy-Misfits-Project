/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
import { RequestPhysicalCardDto } from './dto/requestPhysicalCard.dto';
import { FundCardDto } from './dto/fundCard.dto';
import { CardSpendingDto } from 'src/transactions/dto/cardSpending.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Create Virtual Card
  @Post('create-virtual')
  createVirtualCard(@Request() req, @Body() createDto: CreateVirtualCardDto) {
    return this.cardsService.createVirtualCard(req.user.userId, createDto);
  }

  // Request Physical Card
  @Post('request-physical')
  requestPhysicalCard(
    @Request() req,
    @Body() requestDto: RequestPhysicalCardDto,
  ) {
    return this.cardsService.requestPhysicalCard(req.user.userId, requestDto);
  }

  // // Get All User Cards
  //   @Get()
  //   findAll(@Request() req) {
  //     return this.cardsService.findAllByUser(req.user.userId);
  //   }
  // Get All User Cards
  @Get()
  async findAll(@Request() req) {
    const cards = await this.cardsService.findAllByUser(req.user.userId);

    console.log(cards);

    // Mask sensitive data for listing
    return cards.map((card) => ({
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
      updatedAt: card.updatedAt,
    }));
  }

  // Get Single Card (Masked)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  // Get Card Details (Full - for copying)
  @Get(':id/details')
  getCardDetails(@Request() req, @Param('id') id: string) {
    return this.cardsService.getCardDetails(req.user.userId, id);
  }

  // Fund Card
  @Post(':id/fund')
  fundCard(
    @Request() req,
    @Param('id') id: string,
    @Body() fundDto: FundCardDto,
  ) {
    return this.cardsService.fundCard(req.user.userId, id, fundDto);
  }

  // Card Spending (Purchase)
  @Post(':id/spend')
  spendOnCard(
    @Request() req,
    @Param('id') id: string,
    @Body() spendingDto: CardSpendingDto,
  ) {
    return this.cardsService.spendOnCard(req.user.userId, id, spendingDto);
  }

  // Freeze Card
  @Patch(':id/freeze')
  freezeCard(@Request() req, @Param('id') id: string) {
    return this.cardsService.freezeCard(req.user.userId, id);
  }

  // Unfreeze Card
  @Patch(':id/unfreeze')
  unfreezeCard(@Request() req, @Param('id') id: string) {
    return this.cardsService.unfreezeCard(req.user.userId, id);
  }

  // Block Card
  @Patch(':id/block')
  blockCard(@Request() req, @Param('id') id: string) {
    return this.cardsService.blockCard(req.user.userId, id);
  }

  // Delete Card
  @Delete(':id')
  deleteCard(@Request() req, @Param('id') id: string) {
    return this.cardsService.deleteCard(req.user.userId, id);
  }
}
