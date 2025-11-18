import { Box, Button, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const ConversationPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  const load = async () => {
    if (!id) return;
    const res = await axios.get(`/api/conversations/relationship/${id}`);
    setMessages(res.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !content) return;
    await axios.post('/api/conversations', {
      relationshipId: id,
      content,
      emotionalTone: 'neutral',
    });
    setContent('');
    load();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Conversation
      </Typography>
      <List>
        {messages.map((m) => (
          <ListItem key={m.id}>
            <ListItemText
              primary={m.content}
              secondary={`${m.senderId} – ${m.emotionalTone} – ${new Date(m.createdAt).toLocaleTimeString()}`}
            />
          </ListItem>
        ))}
      </List>
      <Box component="form" onSubmit={handleSend} sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <TextField fullWidth value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message" />
        <Button type="submit" variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
};
