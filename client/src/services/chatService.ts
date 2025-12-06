import api from "./api";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  date: string;
  read: boolean;
}

export const chatService = {
  // Pega lista de quem conversei
  getConversations: async () => {
    const { data } = await api.get<Conversation[]>('/chat/conversations');
    return data;
  },

  // Pega histórico com uma pessoa
  getMessages: async (otherUserId: string) => {
    const { data } = await api.get<Message[]>(`/chat/messages/${otherUserId}`);
    return data;
  }
};