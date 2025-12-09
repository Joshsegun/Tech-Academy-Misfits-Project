import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Otp } from './entity/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
  }

  async createOtp(accountNumber: string) {
    const otp = this.generateOtp();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const otpEntry = this.otpRepository.create({
      accountNumber,
      otp,
      expiresAt,
    });

    await this.otpRepository.save(otpEntry);

    return otp;
  }

  async verifyOtp(accountNumber: string, submittedOtp: string) {
    const record = await this.otpRepository.findOne({
      where: {
        accountNumber,
        otp: submittedOtp,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    record.isUsed = true;
    await this.otpRepository.save(record);

    return true;
  }

  async findByOtp(otp: string) {
    return await this.otpRepository.findOne({
      where: { otp, isUsed: false },
    });
  }
  
  async save(otpEntity: Otp) {
    return await this.otpRepository.save(otpEntity);
  }
  
  async storeOtp(accountNumber: string, otp: string) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  
    // Create or overwrite OTP record
    const record = await this.otpRepository.findOne({
      where: { accountNumber },
    });
  
    if (record) {
      record.otp = otp;
      record.expiresAt = expiresAt;
      record.isUsed = false;
      return this.otpRepository.save(record);
    }
  
    return this.otpRepository.save({
      accountNumber,
      otp,
      expiresAt,
      isUsed: false,
    });
  }
  
}
