import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState, ChangeEvent } from 'react';

export const CustomizationPage = () => {
  const [voiceSettings, setVoiceSettings] = useState('{}');
  const [avatarSettings, setAvatarSettings] = useState('{}');

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/profiles');
      if (res.data.voice) setVoiceSettings(JSON.stringify(res.data.voice.settings, null, 2));
      if (res.data.avatar) setAvatarSettings(JSON.stringify(res.data.avatar.settings, null, 2));
    };
    load();
  }, []);

  const uploadFile = async (type: 'voice' | 'avatar', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`/api/uploads/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.data.url;
    if (type === 'voice') {
      await axios.post('/api/profiles/voice', { settings: JSON.parse(voiceSettings || '{}'), sampleUrl: url });
    } else {
      await axios.post('/api/profiles/avatar', { settings: JSON.parse(avatarSettings || '{}'), imageUrl: url });
    }
  };

  const saveProfiles = async () => {
    await axios.post('/api/profiles/voice', { settings: JSON.parse(voiceSettings || '{}') });
    await axios.post('/api/profiles/avatar', { settings: JSON.parse(avatarSettings || '{}') });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Voice Profile</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Voice Settings (JSON)"
            multiline
            minRows={4}
            value={voiceSettings}
            onChange={(e) => setVoiceSettings(e.target.value)}
          />
          <Button variant="outlined" component="label" sx={{ mr: 2 }}>
            Upload Sample
            <input type="file" hidden accept="audio/*" onChange={(e) => uploadFile('voice', e)} />
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Avatar Profile</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Avatar Settings (JSON)"
            multiline
            minRows={4}
            value={avatarSettings}
            onChange={(e) => setAvatarSettings(e.target.value)}
          />
          <Button variant="outlined" component="label" sx={{ mr: 2 }}>
            Upload Avatar
            <input type="file" hidden accept="image/*" onChange={(e) => uploadFile('avatar', e)} />
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" onClick={saveProfiles}>
            Save All
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
