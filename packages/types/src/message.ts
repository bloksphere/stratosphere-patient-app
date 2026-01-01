export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  userId: string;
  direction: MessageDirection;
  subject: string;
  body: string;
  parentMessageId?: string;
  threadId?: string;
  status: MessageStatus;
  readAt?: string;
  hasAttachments: boolean;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string;
}

export interface CreateMessageRequest {
  subject: string;
  body: string;
  parentMessageId?: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
}
