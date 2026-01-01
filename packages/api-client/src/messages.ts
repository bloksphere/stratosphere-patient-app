import { apiClient } from './client';
import type { Message, CreateMessageRequest, MessageThread } from '@stratosphere/types';

export const messagesApi = {
  getMessages: async (limit: number = 20): Promise<{ messages: MessageThread[]; total: number }> => {
    const response = await apiClient.get('/messages', { params: { limit } });
    return response.data;
  },

  sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data;
  },

  replyToMessage: async (id: string, body: string): Promise<Message> => {
    const response = await apiClient.post(`/messages/${id}/reply`, { body });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/messages/${id}/read`);
  },

  uploadAttachment: async (messageId: string, file: File): Promise<{ filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/messages/${messageId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
