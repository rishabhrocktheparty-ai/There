export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isRead: boolean;
  reactions?: EmojiReaction[];
  attachments?: MessageAttachment[];
  replyTo?: string; // Message ID being replied to
}

export interface EmojiReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Conversation {
  id: string;
  roleId: string;
  roleName: string;
  roleAvatar: string;
  roleType: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isTyping: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  timestamp: Date;
}

export interface ChatSearchResult {
  messageId: string;
  conversationId: string;
  snippet: string;
  timestamp: Date;
  highlightStart: number;
  highlightEnd: number;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
  replyToMessageId?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'reaction';
  payload: any;
  timestamp: Date;
}
