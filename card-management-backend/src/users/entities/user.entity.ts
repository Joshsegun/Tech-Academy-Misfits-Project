import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ unique: true })
  accountNumber: string;  

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accountBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @BeforeInsert()
  // generateAccountNumber() {
  //   const prefix = '300258'; // fixed GTBank-style prefix
  //   const randomFour = Math.floor(1000 + Math.random() * 9000); // ensures 4 digits
  //   this.accountNumber = `${prefix}${randomFour}`;
  // }
}
