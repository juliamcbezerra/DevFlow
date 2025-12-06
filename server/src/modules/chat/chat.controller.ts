import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard';
import { ChatService } from './chat.service';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('messages/:otherUserId')
  async getMessages(@Param('otherUserId') otherUserId: string, @Req() req: any) {
    return this.chatService.getMessages(req.user.id, otherUserId);
  }
}