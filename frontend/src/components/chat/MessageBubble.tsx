import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';

interface MessageBubbleProps {
  content: string;
  isAI: boolean;
  emotionalTone?: string;
  timestamp: Date;
  senderName?: string;
}

const emotionColors: Record<string, string> = {
  positive: '#4caf50',
  neutral: '#9e9e9e',
  negative: '#f44336',
  joyful: '#ffc107',
  calm: '#2196f3',
  supportive: '#8bc34a',
  encouraging: '#ff9800',
};

export const MessageBubble = ({ content, isAI, emotionalTone, timestamp, senderName }: MessageBubbleProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
        mb: 2,
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      {isAI && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <SmartToy fontSize="small" />
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: isAI ? 'grey.100' : 'primary.main',
            color: isAI ? 'text.primary' : 'primary.contrastText',
            borderRadius: 2,
            borderTopLeftRadius: isAI ? 0 : 2,
            borderTopRightRadius: isAI ? 2 : 0,
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content}
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
          <Typography variant="caption" color="text.secondary">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          
          {emotionalTone && emotionalTone !== 'neutral' && (
            <Chip
              label={emotionalTone}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: emotionColors[emotionalTone.toLowerCase()] || emotionColors.neutral,
                color: 'white',
              }}
            />
          )}
        </Box>
      </Box>
      
      {!isAI && (
        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
          <Person fontSize="small" />
        </Avatar>
      )}
    </Box>
  );
};
