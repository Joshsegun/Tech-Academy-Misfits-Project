/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate unique account number
    const accountNumber = await this.generateUniqueAccountNumber();

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      accountBalance: 1000000,
      accountNumber,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      const { password, ...result } = user;
      return result as User;
    });
  }

  async updateBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accountBalance = Number(user.accountBalance) + Number(amount);
    return await this.userRepository.save(user);
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    const prefix = '300258';

    let accountNumber: string;
    let exists = true;

    while (exists) {
      const randomFour = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
      accountNumber = `${prefix}${randomFour}`;

      // Check if account number already exists
      const existing = await this.userRepository.findOne({
        where: { accountNumber },
      });

      exists = !!existing;
    }

    return accountNumber;
  }

  async findByAccountNumber(accountNumber: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { accountNumber },
    });
  }
}
