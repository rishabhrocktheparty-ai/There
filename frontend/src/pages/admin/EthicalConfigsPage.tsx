import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';

const configSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  data: z.string().min(2),
});

export const EthicalConfigsPage = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', data: '{}' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    const res = await axios.get('/api/configs');
    setConfigs(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    const result = configSchema.safeParse(next);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  };

  const handleCreate = async () => {
    const result = configSchema.safeParse(form);
    if (!result.success) return;
    await axios.post('/api/configs', {
      name: form.name,
      description: form.description,
      data: JSON.parse(form.data || '{}'),
    });
    setForm({ name: '', description: '', data: '{}' });
    load();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Create Ethical Config</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            fullWidth
            margin="normal"
            label="JSON Data"
            value={form.data}
            onChange={(e) => handleChange('data', e.target.value)}
            error={!!errors.data}
            helperText={errors.data || 'Provide ethical configuration as JSON.'}
            multiline
            minRows={4}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreate} disabled={Object.keys(errors).length > 0}>
            Save
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Existing Configurations
          </Typography>
          {configs.length === 0 ? (
            <Typography variant="body2">No configs yet.</Typography>
          ) : (
            <Box component="ul" sx={{ pl: 2 }}>
              {configs.map((c) => (
                <li key={c.id}>
                  <Typography variant="body2">
                    {c.name} (latest v{c.latestVersion})
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
