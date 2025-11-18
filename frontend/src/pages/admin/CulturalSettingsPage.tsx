import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const CulturalSettingsPage = () => {
  const [region, setRegion] = useState('');
  const [settings, setSettings] = useState('{}');
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const res = await axios.get('/api/cultural', { params: region ? { region } : {} });
    setList(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await axios.post('/api/cultural', { region, settings: JSON.parse(settings || '{}') });
    setSettings('{}');
    load();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Region Settings</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Region code"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="JSON Settings"
            value={settings}
            onChange={(e) => setSettings(e.target.value)}
            multiline
            minRows={4}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreate} disabled={!region}>
            Save
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Defined Regions</Typography>
          <Button size="small" sx={{ mb: 1 }} onClick={load}>
            Refresh
          </Button>
          {list.length === 0 ? (
            <Typography>No regions yet.</Typography>
          ) : (
            <Box component="ul" sx={{ pl: 2 }}>
              {list.map((c) => (
                <li key={c.id}>
                  <Typography>
                    {c.region} – {JSON.stringify(c.settings)}
                  </Typography>
                </li>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
