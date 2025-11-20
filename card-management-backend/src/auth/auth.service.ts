import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      message: 'User registered successfully',
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountBalance: user.accountBalance,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // 1. Fetch user from the PostgreSQL database
    const user = await this.usersService.findByEmail(loginDto.email);

    // 2. 🛑 CRITICAL FIX: Check if the user exists BEFORE trying to access user.password
    if (!user) {
      // User not found in DB
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Now, compare the password using the HASHED password retrieved from the DB
    console.log('Comparing password for user:', user.email);
    console.log(loginDto.password, user.password); // For debugging only; remove in production
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // User found, but password was wrong
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. If everything passes, generate the token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountBalance: user.accountBalance,
      },
    };
  }
}
