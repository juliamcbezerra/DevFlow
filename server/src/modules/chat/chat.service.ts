import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // 1. Salvar Mensagem (Chamado pelo Gateway)
  async saveMessage(senderId: string, receiverId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });
  }

  // 2. Listar Conversas (Quem eu conversei?)
  async getConversations(userId: string) {
    // Busca mensagens onde sou remetente ou destinatário
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'receiverId'], // Truque para pegar únicos (precisa refinar no JS)
      include: {
        sender: { select: { id: true, name: true, username: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, username: true, avatarUrl: true } },
      }
    });

    // Lógica para filtrar apenas o "outro" usuário e a última mensagem
    const conversations = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          date: msg.createdAt,
          read: msg.senderId === userId ? true : msg.read
        });
      }
    });

    return Array.from(conversations.values());
  }

  // 3. Pegar Histórico com um Usuário Específico
  async getMessages(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' } // Do mais antigo para o mais novo (Chat style)
    });
  }
}