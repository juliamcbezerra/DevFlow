import api from "./api";

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  interestTags: string[];
  _count?: {
    followedBy: number; 
  };
}

export const userService = {
  getAll: async () => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  follow: async (userId: string) => {
    await api.post(`/users/${userId}/follow`);
  },
  
  unfollow: async (userId: string) => {
    await api.delete(`/users/${userId}/follow`);
  }
};