/* eslint-disable @typescript-eslint/no-unsafe-call */
// This file is now a TypeORM entity.
// We use decorators to define the table structure.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

export enum CardType {
  VIRTUAL = 'VIRTUAL',
  PHYSICAL = 'PHYSICAL',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // The ID of the user owning the card

  @Column({ unique: true }) // Card numbers must be unique
  cardNumber: string; // Fictional, securely stored

  @Column({
    type: 'enum',
    enum: CardType,
  })
  cardType: CardType;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.PENDING,
  })
  status: CardStatus;

  @Column('decimal', { precision: 10, scale: 2 }) // For storing currency
  limit: number;

  @CreateDateColumn() // Automatically set on creation
  createdAt: Date;

  @UpdateDateColumn() // Automatically set on update
  updatedAt: Date;
}
