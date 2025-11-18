import { Box, Button, Grid, Paper, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const types = ['father', 'mother', 'sibling', 'mentor'] as const;

export const RoleTemplatesPage = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [type, setType] = useState<(typeof types)[number]>('father');
  const [displayName, setDisplayName] = useState('');

  const load = async () => {
    const res = await axios.get('/api/role-templates');
    setTemplates(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await axios.post('/api/role-templates', {
      type,
      displayName,
      defaultSettings: {},
    });
    setDisplayName('');
    load();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Create Role Template</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              {types.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreate} disabled={!displayName}>
            Save
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Role Templates
          </Typography>
          {templates.length === 0 ? (
            <Typography>No templates yet.</Typography>
          ) : (
            <Box component="ul" sx={{ pl: 2 }}>
              {templates.map((t) => (
                <li key={t.id}>
                  <Typography>
                    {t.displayName} ({t.type})
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
