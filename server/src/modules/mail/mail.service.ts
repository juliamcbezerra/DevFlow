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
    const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    const html = getEmailTemplate(
      'Bem-vindo ao DevFlow!',
      'Estamos muito felizes em ter você conosco. Para começar a explorar a comunidade e compartilhar seus projetos, por favor, verifique seu e-mail.',
      link,
      'Verificar Minha Conta'
    );

    await this.transporter.sendMail({
      from: '"DevFlow Team" <noreply@devflow.com>',
      to: email,
      subject: 'Verifique sua conta no DevFlow 🚀',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = getEmailTemplate(
      'Recuperação de Senha',
      'Recebemos uma solicitação para redefinir sua senha. Se não foi você, ignore este e-mail. Caso contrário, clique abaixo:',
      link,
      'Redefinir Senha'
    );

    await this.transporter.sendMail({
      from: '"DevFlow Security" <noreply@devflow.com>',
      to: email,
      subject: 'Redefinição de Senha 🔒',
      html,
    });
  }
}