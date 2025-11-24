import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Public as PublicIcon,
  Psychology as PsychologyIcon,
  Translate as TranslateIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { profileService, RelationshipPreferences, UserPreferences } from '../../services/profileService';

export const RelationshipPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<RelationshipPreferences>({
    autoSaveMessages: true,
    messageRetentionDays: 90,
    culturalPreferences: {
      formalityLevel: 'balanced',
      communicationStyle: 'balanced',
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await profileService.getPreferences();
      setPreferences(data);
      if (data.relationship) {
        setFormData(data.relationship);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await profileService.updatePreferences({
        relationship: formData,
      });
      setSuccess('Relationship preferences saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      loadPreferences();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCulturalChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      culturalPreferences: {
        ...prev.culturalPreferences,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Relationship Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize how your AI relationships behave and communicate
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Message Settings */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">Message Settings</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Message Retention Period: {formData.messageRetentionDays} days
              </Typography>
              <Slider
                value={formData.messageRetentionDays || 90}
                onChange={(_, value) => handleChange('messageRetentionDays', value)}
                min={7}
                max={365}
                step={1}
                marks={[
                  { value: 7, label: '7d' },
                  { value: 30, label: '30d' },
                  { value: 90, label: '90d' },
                  { value: 180, label: '180d' },
                  { value: 365, label: '365d' },
                ]}
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="text.secondary">
                How long to keep conversation history
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Cultural Preferences */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PublicIcon color="primary" />
            <Typography variant="h6">Cultural Adaptation</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Communication Style</InputLabel>
                <Select
                  value={formData.culturalPreferences?.communicationStyle || 'balanced'}
                  onChange={(e) => handleCulturalChange('communicationStyle', e.target.value)}
                  label="Communication Style"
                >
                  <MenuItem value="direct">
                    <Box>
                      <Typography variant="body1">Direct</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Straightforward, explicit communication
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="balanced">
                    <Box>
                      <Typography variant="body1">Balanced</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mix of direct and indirect approaches
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="indirect">
                    <Box>
                      <Typography variant="body1">Indirect</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subtle, context-aware communication
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Formality Level</InputLabel>
                <Select
                  value={formData.culturalPreferences?.formalityLevel || 'balanced'}
                  onChange={(e) => handleCulturalChange('formalityLevel', e.target.value)}
                  label="Formality Level"
                >
                  <MenuItem value="casual">
                    <Box>
                      <Typography variant="body1">Casual</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relaxed, friendly tone
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="balanced">
                    <Box>
                      <Typography variant="body1">Balanced</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Professional yet approachable
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="formal">
                    <Box>
                      <Typography variant="body1">Formal</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Respectful, professional tone
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cultural Region</InputLabel>
                <Select
                  value={formData.culturalPreferences?.region || ''}
                  onChange={(e) => handleCulturalChange('region', e.target.value)}
                  label="Cultural Region"
                >
                  <MenuItem value="">Not specified</MenuItem>
                  <MenuItem value="western">Western (US, Europe)</MenuItem>
                  <MenuItem value="east-asian">East Asian (China, Japan, Korea)</MenuItem>
                  <MenuItem value="south-asian">South Asian (India, Pakistan)</MenuItem>
                  <MenuItem value="middle-eastern">Middle Eastern</MenuItem>
                  <MenuItem value="latin-american">Latin American</MenuItem>
                  <MenuItem value="african">African</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* AI Personality Customization */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TranslateIcon color="primary" />
            <Typography variant="h6">AI Personality</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Empathy Level
                  </Typography>
                  <Typography variant="h4" color="primary">
                    High
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emotionally aware and supportive
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Response Length
                  </Typography>
                  <Typography variant="h4" color="primary">
                    Medium
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Balanced detail and brevity
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Humor Level
                  </Typography>
                  <Typography variant="h4" color="primary">
                    Moderate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Occasional lightheartedness
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
