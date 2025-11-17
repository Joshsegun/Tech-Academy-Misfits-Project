/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  private users: User[] = []; // In-memory storage

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = this.users.find(
      (u) => u.email === createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = new User({
      ...createUserDto,
      password: hashedPassword,
    });

    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getAllUsers(): Promise<User[]> {
    return Promise.resolve(
      this.users.map((user) => {
        const { password, ...result } = user;
        return result as User;
      }),
    );
  }

  async updateBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accountBalance = Number(user.accountBalance) + Number(amount);
    return user;
  }
}
