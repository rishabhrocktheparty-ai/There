import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { profileService, UserProfile } from '../../services/profileService';

export const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    locale: '',
    timezone: '',
  });

  // Load profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        displayName: data.displayName || '',
        locale: data.locale || 'en',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        locale: profile.locale || 'en',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            User Profile
          </Typography>
          {!editing && (
            <Button startIcon={<EditIcon />} onClick={handleEdit} variant="outlined">
              Edit Profile
            </Button>
          )}
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

        <Grid container spacing={3}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box position="relative">
                <Avatar
                  src={profile.avatarProfile?.imageUrl}
                  sx={{ width: 150, height: 150, mb: 2 }}
                >
                  {formData.displayName?.charAt(0) || profile.email.charAt(0)}
                </Avatar>
                {editing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: -10,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    size="small"
                  >
                    <PhotoCamera />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6">{formData.displayName || 'Set your name'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
              <Chip
                label={profile.authProvider}
                size="small"
                sx={{ mt: 1 }}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  disabled={!editing}
                  variant={editing ? 'outlined' : 'filled'}
                  helperText="Your name as it appears to others"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={formData.locale}
                    onChange={(e) => handleChange('locale', e.target.value)}
                    label="Language"
                    variant={editing ? 'outlined' : 'filled'}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                    <MenuItem value="ar">العربية</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    label="Timezone"
                    variant={editing ? 'outlined' : 'filled'}
                  >
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="Europe/London">London (GMT)</MenuItem>
                    <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                    <MenuItem value="Asia/Shanghai">Shanghai (CST)</MenuItem>
                    <MenuItem value="Australia/Sydney">Sydney (AEDT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {editing && (
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Account Information */}
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Account Created
            </Typography>
            <Typography variant="body1">
              {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">
              {new Date(profile.updatedAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Voice & Avatar Profiles */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voice Profile
            </Typography>
            {profile.voiceProfile ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Voice profile configured
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                  Manage Voice
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No voice profile set up yet
                </Typography>
                <Button variant="contained" size="small" sx={{ mt: 1 }}>
                  Set Up Voice
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Avatar Profile
            </Typography>
            {profile.avatarProfile ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Avatar profile configured
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                  Manage Avatar
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No avatar profile set up yet
                </Typography>
                <Button variant="contained" size="small" sx={{ mt: 1 }}>
                  Set Up Avatar
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
