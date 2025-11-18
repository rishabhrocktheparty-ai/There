import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const RoleSelectionPage = () => {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/role-templates');
      setTemplates(res.data);
    };
    load();
  }, []);

  const startRelationship = async (templateId: string) => {
    await axios.post('/api/relationships', { counterpartUserId: 'ai-buddy', roleTemplateId: templateId });
    // In real app, redirect to relationships page
  };

  return (
    <Grid container spacing={2}>
      {templates.map((t) => (
        <Grid item xs={12} md={3} key={t.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t.displayName}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Persona: {t.type}
              </Typography>
              <Button size="small" variant="contained" onClick={() => startRelationship(t.id)}>
                Start Relationship
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {templates.length === 0 && (
        <Box sx={{ p: 2 }}>
          <Typography>No role templates available yet.</Typography>
        </Box>
      )}
    </Grid>
  );
};
