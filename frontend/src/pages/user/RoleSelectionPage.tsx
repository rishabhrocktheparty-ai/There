import { Box, Container, Typography, Grid, CircularProgress, Alert, Fade } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RoleCard } from '../../components/chat/RoleCard';
import { useNotifications } from '../../providers/NotificationProvider';

interface RoleTemplate {
  id: string;
  type: string;
  displayName: string;
  description?: string;
  avatarUrl?: string;
  category?: string;
  tags?: string[];
}

export const RoleSelectionPage = () => {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/role-templates');
      setTemplates(res.data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError(err.response?.data?.error || 'Failed to load role templates');
    } finally {
      setLoading(false);
    }
  };

  const startRelationship = async (templateId: string) => {
    setCreating(templateId);
    setError(null);
    
    try {
      const res = await axios.post('/api/relationships', {
        counterpartUserId: 'ai-companion',
        roleTemplateId: templateId,
      });
      
      addNotification({
        id: `rel-${Date.now()}`,
        message: 'Relationship created successfully!',
        type: 'success',
      });
      
      // Navigate to the conversation page
      navigate(`/app/relationships/${res.data.id}/chat`);
    } catch (err: any) {
      console.error('Failed to create relationship:', err);
      setError(err.response?.data?.error || 'Failed to create relationship');
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to create relationship',
        type: 'error',
      });
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight={700} align="center">
            Choose Your AI Companion
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Select a role that resonates with you. Each AI companion brings unique personality, wisdom, and support.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {templates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No role templates available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please contact an administrator to set up role templates.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <RoleCard
                    id={template.id}
                    type={template.type}
                    displayName={template.displayName}
                    description={template.description}
                    category={template.category}
                    tags={template.tags}
                    onSelect={startRelationship}
                    disabled={creating !== null}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>
    </Container>
  );
};
