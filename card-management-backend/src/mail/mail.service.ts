/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: Number(process.env.SMTP_PORT), // 587
    secure: false,
    // false for STARTTLS
    // secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  constructor() {
    // Optional but VERY useful for debugging
    this.transporter.verify((err, success) => {
      if (err) {
        console.log('SMTP Connection Error:', err);
      } else {
        console.log('SMTP Server Ready To Send Emails');
      }
    });
  }

  async sendOtp(email: string, otp: string) {
    return await this.transporter.sendMail({
      from: `"GO-CARD" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'GO-CARD Login OTP Code',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `
        <p>Your OTP is <strong>${otp}</strong>.</p>
        <p>This code expires in <strong>10 minutes</strong>.</p>
      `,
    });
  }
}
