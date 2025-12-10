import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getEmailTemplate } from '../../templates/email-template';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // ex: smtp.gmail.com
      port: Number(process.env.SMTP_PORT), // 587
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = getEmailTemplate(
      'Bem-vindo ao DevFlow!',
      'Para garantir a segurança da comunidade, precisamos que você confirme seu endereço de e-mail clicando no botão abaixo.',
      link,
      false // false = mostra botão
    );

    await this.transporter.sendMail({
      from: '"DevFlow Team" <contact.devflow@gmail.com>',
      to: email,
      subject: 'Verifique sua conta no DevFlow 🚀',
      html,
    });
  }

  async sendPasswordResetCode(email: string, code: string) {
    const html = getEmailTemplate(
      'Código de Recuperação',
      'Recebemos um pedido para redefinir sua senha. Use o código abaixo para continuar:',
      code,
      true // true = mostra código gigante
    );

    await this.transporter.sendMail({
      from: '"DevFlow Security" <contact.devflow@gmail.com>',
      to: email,
      subject: `Seu código é: ${code} 🔒`,
      html,
    });
  }
}