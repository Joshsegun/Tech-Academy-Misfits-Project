/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from '../users/dto/login.dto';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailService: MailService,
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
        accountNumber: user.accountNumber,
        accountBalance: user.accountBalance,
        nin: user.nin,
        bvn: user.bvn,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // 1. Fetch user from the PostgreSQL database
    const user = await this.usersService.findByEmail(loginDto.email.toLowerCase().trim());

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
        accountNumber: user.accountNumber,
        accountBalance: user.accountBalance,
        nin: user.nin,
        bvn: user.bvn,
      },
    };
  }

  async sendOtp(accountNumber: string) {
    const user = await this.usersService.findByAccountNumber(accountNumber);
    if (!user) throw new NotFoundException("Account not found");
  
    const FALLBACK_ENABLED = process.env.OTP_FALLBACK_ENABLED === "true";
    const DEFAULT_OTP = process.env.DEFAULT_OTP || "123456";
  
    try {
      // Race OTP operation vs 3-second timeout
      await Promise.race([
        (async () => {
          const otp = await this.otpService.createOtp(accountNumber);
          await this.mailService.sendOtp(user.email, otp);
          return true;
        })(),
        timeoutAfter(3000), // 3 seconds
      ]);
  
      // If we get here, OTP was successfully sent within 3 seconds
      return { message: "OTP sent successfully" };
    } catch (error) {
      // Timeout or failure triggers fallback
      if (FALLBACK_ENABLED) {
        console.warn("OTP service slow/unavailable — fallback OTP applied");
  
        // Store fallback OTP in DB/cache so verification still works
        await this.otpService.storeOtp(accountNumber, DEFAULT_OTP);
  
        return {
          message: "OTP sent successfully",
          note: "Fallback OTP used (DEV MODE)",
        };
      }
  
      throw new InternalServerErrorException("Unable to send OTP");
    }
  }

  async verifyOtp(otp: string) {
    const otpRecord = await this.otpService.findByOtp(otp);
  
    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP');
    }
  
    // Expiry check (fixed)
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedException('OTP has expired');
    }
  
    if (otpRecord.isUsed) {
      throw new UnauthorizedException('OTP already used');
    }
  
    otpRecord.isUsed = true;
    await this.otpService.save(otpRecord);
  
    const user = await this.usersService.findByAccountNumber(
      otpRecord.accountNumber,
    );
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
  
    return {
      message: 'OTP verified successfully',
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        accountBalance: user.accountBalance,
      },
    };
  }
}  

function timeoutAfter(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), ms)
  );
}