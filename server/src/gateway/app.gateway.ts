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

@WebSocketGateway({
  cors: {
    origin: '*', // Libera geral para evitar erro de CORS em desenvolvimento
    credentials: true,
  },
  transports: ['websocket'], // Força WebSocket direto (evita problemas de polling no Docker)
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  
  // Mapa para guardar socketId -> userId
  private activeUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService
  ) {}

  // --- LOG DE INICIALIZAÇÃO ---
  afterInit(server: Server) {
    console.log('🚀 [GATEWAY] WebSocket INICIADO! Porta pronta para conexões.');
  }

    async handleConnection(client: Socket) {
    let rawToken; // ← Declare ANTES do try para estar acessível no catch
    
    try {
        // 1. Tenta pegar o token
        rawToken = client.handshake.auth?.token || client.handshake.headers?.authorization;
        
        if (!rawToken) {
        console.log(`🔴 [Gateway] Sem token. Desconectando ${client.id}`);
        client.disconnect();
        return;
        }

        if (Array.isArray(rawToken)) rawToken = rawToken[0];

        // 2. Limpeza
        const cleanToken = rawToken
        .toString()
        .replace(/^Bearer\s+/i, '')
        .replace(/['"]+/g, '')
        .trim();

        // 🔍 DEBUG: Veja como está o token
        console.log('🔍 [DEBUG] Token recebido:', cleanToken.substring(0, 20) + '...');
        
        // 3. Validação JWT
        const payload = this.jwtService.verify(cleanToken);
        
        // 4. Sucesso
        this.activeUsers.set(client.id, payload.sub);
        await client.join(`user_${payload.sub}`);
        
        console.log(`🟢 [GATEWAY] Usuário Conectado: ${payload.sub}`);

    } catch (e) {
        console.log(`🔴 [GATEWAY] Erro de Autenticação: ${e.message}`);
        console.log('🔍 [DEBUG] Token problemático:', rawToken);
        client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.activeUsers.get(client.id);
    if (userId) {
        this.activeUsers.delete(client.id);
        // console.log(`🔌 [GATEWAY] Usuário saiu: ${userId}`);
    }
  }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; content: string }
    ) {
    console.log(`📩 [GATEWAY] Recebendo mensagem para: ${payload.receiverId}`);

    let senderId = this.activeUsers.get(client.id);

    // Fallback: Se não achou no mapa
    if (!senderId) {
        try {
        const raw = client.handshake.auth?.token || client.handshake.headers?.authorization;
        const token = raw.toString().replace(/^Bearer\s+/i, '').replace(/['"]+/g, '').trim();
        
        // ⚡ CORREÇÃO: Remove o { secret: ... }
        const decoded = this.jwtService.verify(token);
        
        senderId = decoded.sub;
        this.activeUsers.set(client.id, senderId as string);
        } catch (e) {
        console.error("❌ [GATEWAY] Falha ao recuperar sessão para envio:", e.message);
        return;
        }
    }

    try {
        const savedMessage = await this.chatService.saveMessage(
        senderId!, 
        payload.receiverId, 
        payload.content
        );

        console.log("✅ [GATEWAY] Mensagem salva ID:", savedMessage.id);

        this.server.to(`user_${payload.receiverId}`).emit('receiveMessage', savedMessage);
        client.emit('receiveMessage', savedMessage);

    } catch (error) {
        console.error("❌ [GATEWAY] Erro ao salvar mensagem:", error);
    }
  }
}