/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
  
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
  
    const [accountNumber, nin, bvn] = await Promise.all([
      this.generateAccountNumber(),
      this.generateUnique('nin', 11),
      this.generateUnique('bvn', 11),
    ]);
  
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      accountBalance: 1000000,
      accountNumber,
      nin,
      bvn,
    });
  
    return await this.userRepository.save(user);
  }
  

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email: ILike(email) } });
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

  private async generateUnique(field: keyof User, length: number): Promise<string> {
    let value: string;
    let exists = true;
  
    while (exists) {
      value = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  
      exists = !!(await this.userRepository.findOne({ where: { [field]: value } }));
    }
  
    return value;
  }

  private async generateAccountNumber(): Promise<string> {
    const prefix = '300258';
    const randomPart = await this.generateUnique('accountNumber', 4);
    return prefix + randomPart;
  } 

  async findByAccountNumber(accountNumber: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { accountNumber },
    });
  }
}
