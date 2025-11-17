// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
//   JoinColumn,
// } from 'typeorm';
// import { CardStatus } from '../../../common/enums/card-status.enum';
// import { User } from '../../users/entities/user.entity';
// import { Transaction } from '../../transactions/entities/transaction.entity';

// @Entity('virtual_cards')
// export class VirtualCard {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ unique: true })
//   cardNumber: string; // Encrypted - full 16 digits

//   @Column()
//   cardHolderName: string;

//   @Column()
//   cvv: string; // Encrypted

//   @Column({ length: 2 })
//   expiryMonth: string;

//   @Column({ length: 4 })
//   expiryYear: string;

//   @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
//   balance: number;

//   @Column({ type: 'decimal', precision: 15, scale: 2, default: 500000 })
//   spendingLimit: number;

//   @Column({ default: 'NGN', length: 3 })
//   currency: string;

//   @Column({
//     type: 'enum',
//     enum: CardStatus,
//     default: CardStatus.ACTIVE,
//   })
//   status: CardStatus;

//   @Column({ nullable: true, length: 100 })
//   nickname: string;

//   @Column({ default: false })
//   isDeleted: boolean;

//   @Column({ type: 'uuid' })
//   userId: string;

//   @ManyToOne(() => User, (user) => user.virtualCards, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'userId' })
//   user: User;

//   @OneToMany(() => Transaction, (transaction) => transaction.virtualCard)
//   transactions: Transaction[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @Column({ type: 'timestamp', nullable: true })
//   deletedAt: Date;

//   @Column({ type: 'timestamp', nullable: true })
//   lastUsedAt: Date;
// }
