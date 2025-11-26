import { Box, CircularProgress, Typography } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  emotionalTone?: string;
  createdAt: Date | string;
  senderId?: string;
}

interface ChatContainerProps {
  messages: Message[];
  loading?: boolean;
  emptyMessage?: string;
  isTyping?: boolean;
}

export const ChatContainer = ({ messages, loading, emptyMessage = "No messages yet. Start a conversation!", isTyping = false }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (loading && messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
        <Typography color="text.secondary" variant="body1">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'grey.100',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'grey.400',
          borderRadius: '4px',
        },
      }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          isAI={message.isAI}
          emotionalTone={message.emotionalTone}
          timestamp={new Date(message.createdAt)}
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </Box>
  );
};
