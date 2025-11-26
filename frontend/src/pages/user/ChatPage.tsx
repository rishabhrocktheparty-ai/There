import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { MessageInput } from '../../components/chat/MessageInput';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatSearchDialog } from '../../components/chat/ChatSearchDialog';
import { Message, Conversation } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { useNotifications } from '../../providers/NotificationProvider';
import { useAuth } from '../../providers/AuthProvider';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user) {
      chatService.connectWebSocket(user.id);

      // Subscribe to new messages
      const unsubscribeMessages = chatService.onMessage((message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
        updateConversationLastMessage(message);
      });

      // Subscribe to typing indicators
      const unsubscribeTyping = chatService.onTyping((convId, typing) => {
        if (convId === conversationId) {
          setIsTyping(typing);
        }
        updateConversationTyping(convId, typing);
      });

      return () => {
        unsubscribeMessages();
        unsubscribeTyping();
        chatService.disconnect();
      };
    }
  }, [user, conversationId]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to load conversations',
        type: 'error',
      });
    }
  };

  const loadMessages = async (convId: string) => {
    setLoading(true);
    try {
      const msgs = await chatService.getMessages(convId);
      setMessages(msgs);
      
      const conv = conversations.find((c) => c.id === convId);
      setActiveConversation(conv || null);
    } catch (error) {
      console.error('Failed to load messages:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to load messages',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!conversationId) return;

    setSending(true);
    try {
      const message = await chatService.sendMessage({
        conversationId,
        content,
        attachments,
        replyToMessageId: replyTo?.id,
      });

      setMessages((prev) => [...prev, message]);
      setReplyTo(null);
      scrollToBottom();

      // Stop typing indicator
      chatService.sendTyping(conversationId, false);
    } catch (error) {
      console.error('Failed to send message:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to send message',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (convId: string) => {
    navigate(`/user/chat/${convId}`);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await chatService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      
      if (convId === conversationId) {
        navigate('/user/chat');
      }

      addNotification({
        id: `success-${Date.now()}`,
        message: 'Conversation deleted',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to delete conversation',
        type: 'error',
      });
    }
  };

  const markAsRead = async (convId: string) => {
    try {
      await chatService.markAsRead(convId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await chatService.addReaction(messageId, emoji);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  { emoji, userId: user!.id, timestamp: new Date() },
                ],
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      
      addNotification({
        id: `success-${Date.now()}`,
        message: 'Message deleted',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to delete message',
        type: 'error',
      });
    }
  };

  const handleTyping = () => {
    if (!conversationId) return;

    chatService.sendTyping(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(conversationId, false);
    }, 3000);
  };

  const handleSearchMessage = (message: Message) => {
    // Scroll to message or highlight it
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.style.backgroundColor = theme.palette.action.selected;
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === message.conversationId
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      )
    );
  };

  const updateConversationTyping = (convId: string, typing: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, isTyping: typing } : c
      )
    );
  };

  const conversationListContent = (
    <ConversationList
      conversations={conversations}
      activeConversationId={conversationId}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
      onMarkAsRead={markAsRead}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Conversation List - Desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            height: '100%',
          }}
        >
          {conversationListContent}
        </Box>
      )}

      {/* Conversation List - Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
            },
          }}
        >
          {conversationListContent}
        </Drawer>
      )}

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!conversationId || !activeConversation ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ position: 'absolute', top: 16, left: 16 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a conversation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose from your existing conversations or start a new one
            </Typography>
          </Box>
        ) : (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={activeConversation}
              onBack={isMobile ? () => setDrawerOpen(true) : undefined}
              onSearch={() => setSearchOpen(true)}
            />

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                backgroundColor: 'background.default',
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No messages yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start the conversation with {activeConversation.roleName}
                  </Typography>
                </Box>
              ) : (
                <Fade in timeout={300}>
                  <Box>
                    {messages.map((message, index) => (
                      <Box key={message.id} id={`message-${message.id}`}>
                        <MessageBubble
                          message={message}
                          isOwn={message.senderType === 'user'}
                          showAvatar={
                            index === 0 ||
                            messages[index - 1].senderType !== message.senderType
                          }
                          onReply={setReplyTo}
                          onDelete={handleDeleteMessage}
                          onReact={handleReaction}
                        />
                      </Box>
                    ))}
                    
                    {isTyping && <TypingIndicator />}
                    
                    <div ref={messagesEndRef} />
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sending}
                replyTo={
                  replyTo
                    ? { id: replyTo.id, content: replyTo.content }
                    : undefined
                }
                onCancelReply={() => setReplyTo(null)}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Search Dialog */}
      <ChatSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMessage={handleSearchMessage}
        conversationId={conversationId}
      />
    </Box>
  );
};
