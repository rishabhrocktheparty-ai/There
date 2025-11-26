import { Box, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import { Send, Mood } from '@mui/icons-material';
import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string, emotionalTone?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ onSend, disabled, placeholder = "Type your message..." }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    setLoading(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end',
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || loading}
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
      
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!message.trim() || disabled || loading}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
      </IconButton>
    </Paper>
  );
};
