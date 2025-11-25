import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('otps')
  export class Otp {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    accountNumber: string;
  
    @Column()
    otp: string;
  
    @Column()
    expiresAt: Date;
  
    @Column({ default: false })
    isUsed: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  