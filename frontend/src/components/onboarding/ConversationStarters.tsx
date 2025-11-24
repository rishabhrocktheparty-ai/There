import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import onboardingService from '../../services/onboardingService';

interface ConversationStartersProps {
  roleType?: string;
  relationshipName?: string;
  onSelectStarter: (starter: string) => void;
}

export const ConversationStarters: React.FC<ConversationStartersProps> = ({
  roleType = 'CUSTOM',
  relationshipName = 'your companion',
  onSelectStarter,
}) => {
  const [starters, setStarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStarters();
  }, [roleType]);

  const loadStarters = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getConversationStarters(roleType);
      setStarters(data.starters);
    } catch (error) {
      console.error('Error loading conversation starters:', error);
      // Fallback starters
      setStarters([
        "I'd like to start a meaningful conversation with you.",
        "What would you like to talk about today?",
        "Tell me something important to you.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ChatIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Conversation Starters
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        Not sure what to say? Try one of these conversation starters with {relationshipName}:
      </Typography>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
        {starters.map((starter, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider />}
            <ListItem disablePadding>
              <ListItemButton onClick={() => onSelectStarter(starter)}>
                <ListItemText
                  primary={starter}
                  secondary={
                    <Chip
                      label="Click to use"
                      size="small"
                      variant="outlined"
                      icon={<SendIcon />}
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Feel free to modify these starters or create your own messages!
        </Typography>
      </Box>
    </Paper>
  );
};
