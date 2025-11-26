import axios from 'axios';
import { Message, Conversation, SendMessageRequest } from '../types/chat';

class ChatService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: Message) => void> = new Set();
  private typingHandlers: Set<(conversationId: string, isTyping: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize WebSocket connection for real-time messaging
   */
  connectWebSocket(userId: string) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?userId=${userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(userId);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  /**
   * Handle WebSocket reconnection with exponential backoff
   */
  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connectWebSocket(userId), delay);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'message':
        this.messageHandlers.forEach((handler) => handler(data.payload));
        break;
      case 'typing':
        this.typingHandlers.forEach((handler) =>
          handler(data.payload.conversationId, data.payload.isTyping)
        );
        break;
      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Subscribe to new messages
   */
  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(handler: (conversationId: string, isTyping: boolean) => void) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Send a message via WebSocket or HTTP fallback
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    // If WebSocket is connected, send via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const messageId = Math.random().toString(36).substring(7);
        
        this.ws!.send(JSON.stringify({
          type: 'message',
          payload: {
            ...request,
            messageId,
          },
        }));

        // Wait for confirmation
        const timeout = setTimeout(() => {
          reject(new Error('Message send timeout'));
        }, 10000);

        const unsubscribe = this.onMessage((message) => {
          if (message.id === messageId) {
            clearTimeout(timeout);
            unsubscribe();
            resolve(message);
          }
        });
      });
    }

    // Fallback to HTTP
    const formData = new FormData();
    formData.append('content', request.content);
    formData.append('conversationId', request.conversationId);
    
    if (request.replyToMessageId) {
      formData.append('replyToMessageId', request.replyToMessageId);
    }

    if (request.attachments) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await axios.post('/api/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get message history for a conversation
   */
  async getMessages(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
    const response = await axios.get('/api/messages', {
      params: { conversationId, limit, before },
    });
    return response.data;
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await axios.get('/api/conversations');
    return response.data;
  }

  /**
   * Create a new conversation
   */
  async createConversation(roleId: string): Promise<Conversation> {
    const response = await axios.post('/api/conversations', { roleId });
    return response.data;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await axios.delete(`/api/conversations/${conversationId}`);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await axios.post(`/api/conversations/${conversationId}/read`);
  }

  /**
   * Search messages across all conversations
   */
  async searchMessages(query: string): Promise<Message[]> {
    const response = await axios.get('/api/messages/search', {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Add emoji reaction to a message
   */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await axios.post(`/api/messages/${messageId}/reactions`, { emoji });
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await axios.delete(`/api/messages/${messageId}`);
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        payload: { conversationId, isTyping },
      }));
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.typingHandlers.clear();
  }
}

export const chatService = new ChatService();
