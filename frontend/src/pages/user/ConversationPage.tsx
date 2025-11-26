import { Box, Paper, Typography, CircularProgress, IconButton, Chip, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Psychology } from '@mui/icons-material';
import axios from 'axios';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { MessageInput } from '../../components/chat/MessageInput';
import { useAuth } from '../../providers/AuthProvider';

interface Message {
  id: string;
  content: string;
  senderId: string;
  isAI?: boolean;
  emotionalTone: string;
  createdAt: string;
  relationshipId: string;
}

export const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiTyping, setAiTyping] = useState(false);

  const loadMessages = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/conversations/relationship/${id}`);
      setMessages(res.data);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.response?.data?.error || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [id]);

  const handleSend = async (content: string) => {
    if (!id || !content.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      // Send user message
      const userMessageRes = await axios.post('/api/conversations', {
        relationshipId: id,
        content: content.trim(),
        emotionalTone: 'neutral',
      });
      
      // Add user message to UI immediately
      const userMessage = userMessageRes.data;
      setMessages(prev => [...prev, { ...userMessage, isAI: false }]);
      
      // Show AI typing indicator
      setAiTyping(true);
      
      // Request AI response
      try {
        const aiRes = await axios.post('/api/ai/generate', {
          relationshipId: id,
          message: content.trim(),
        });
        
        // Create AI message
        const aiMessage = {
          id: `ai-${Date.now()}`,
          content: aiRes.data.data.content,
          senderId: 'ai',
          isAI: true,
          emotionalTone: aiRes.data.data.emotionalTone || 'neutral',
          createdAt: new Date().toISOString(),
          relationshipId: id,
        };
        
        // Save AI response to backend
        await axios.post('/api/conversations', {
          relationshipId: id,
          content: aiMessage.content,
          emotionalTone: aiMessage.emotionalTone,
        });
        
        // Add AI message to UI
        setMessages(prev => [...prev, aiMessage]);
      } catch (aiError: any) {
        console.error('AI response failed:', aiError);
        // Still show a fallback message
        const fallbackMessage = {
          id: `ai-${Date.now()}`,
          content: "I'm here to listen. Could you tell me more about that?",
          senderId: 'ai',
          isAI: true,
          emotionalTone: 'supportive',
          createdAt: new Date().toISOString(),
          relationshipId: id,
        };
        
        await axios.post('/api/conversations', {
          relationshipId: id,
          content: fallbackMessage.content,
          emotionalTone: fallbackMessage.emotionalTone,
        });
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
      setAiTyping(false);
    }
  };

  const formattedMessages = messages.map(msg => ({
    ...msg,
    isAI: msg.senderId !== user?.id && msg.senderId !== 'user',
  }));

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/app/relationships')} size="small">
          <ArrowBack />
        </IconButton>
        <Psychology color="primary" />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">AI Conversation</Typography>
          <Typography variant="caption" color="text.secondary">
            {aiTyping ? 'AI is typing...' : 'Connected'}
          </Typography>
        </Box>
        <Chip
          label="Active"
          color="success"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Chat Container */}
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
        }}
      >
        <ChatContainer
          messages={formattedMessages}
          loading={loading}
          emptyMessage="Start your conversation! Say hello to begin."
          isTyping={aiTyping}
        />
      </Paper>

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        disabled={sending || aiTyping}
        placeholder={aiTyping ? "AI is responding..." : "Share your thoughts..."}
      />
    </Box>
  );
};
