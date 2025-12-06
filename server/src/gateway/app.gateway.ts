import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../modules/chat/chat.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  transports: ['websocket'],
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  
  private activeUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService
  ) {}

  afterInit() {
    console.log('🚀 [GATEWAY] WebSocket INICIADO! Pronto para conexões.');
  }

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      
      if (!token) {
        client.disconnect();
        return;
      }

      const cleanToken = token.toString().replace(/^Bearer\s+/i, '').replace(/['"]+/g, '').trim();
      const payload = this.jwtService.verify(cleanToken, { secret: process.env.JWT_SECRET || 'secret' });
      const userId = payload.sub;

      this.activeUsers.set(client.id, userId);
      await client.join(`user_${userId}`);
      
      console.log(`🟢 [GATEWAY] Conectado: ${userId}`);

    } catch (e) {
      console.log(`🔴 [GATEWAY] Falha Auth: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; content: string }
  ) {
    let senderId = this.activeUsers.get(client.id);

    // Fallback: Recupera sessão
    if (!senderId) {
       try {
         const raw = client.handshake.auth?.token || client.handshake.headers?.authorization;
         const t = raw.toString().replace(/^Bearer\s+/i, '').replace(/['"]+/g, '').trim();
         const p = this.jwtService.verify(t, { secret: process.env.JWT_SECRET || 'secret' });
         senderId = p.sub;
         this.activeUsers.set(client.id, senderId as string);
       } catch { return; }
    }

    // Se ainda assim não tiver ID, aborta
    if (!senderId) {
        console.error("❌ [GATEWAY] SenderID não encontrado.");
        return;
    }

    try {
        // --- CORREÇÃO AQUI: Adicionado '!' em senderId! ---
        const savedMessage = await this.chatService.saveMessage(
            senderId!, // <--- O '!' FORÇA O TYPESCRIPT A ACEITAR
            payload.receiverId, 
            payload.content
        );
        
        this.server.to(`user_${payload.receiverId}`).emit('receiveMessage', savedMessage);
        client.emit('receiveMessage', savedMessage);
        
    } catch (error) {
        console.error("❌ [GATEWAY] Erro Chat:", error);
    }
  }
}