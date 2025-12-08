import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from 'src/users/users.service';
import { OtpService } from 'src/otp/otp.service';
import { MailService } from 'src/mail/mail.service';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    OtpModule,
    JwtModule.register({
      secret: 'gtco-secret-key-2025',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, OtpService, MailService], // ← AuthService must be here!
  exports: [AuthService],
})
export class AuthModule {}
