import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  DataUsage as DataUsageIcon,
  DeleteForever as DeleteIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { profileService, PrivacySettings } from '../../services/profileService';

export const PrivacySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await profileService.getPrivacySettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof PrivacySettings) => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      const newValue = !settings[key];
      const updated = await profileService.updatePrivacySettings({
        [key]: newValue,
      });
      setSettings(updated);
      setSuccess('Privacy settings updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (value: 'public' | 'private' | 'friends') => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updatePrivacySettings({
        profileVisibility: value,
      });
      setSettings(updated);
      setSuccess('Visibility updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update visibility');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setError(null);
      const blob = await profileService.exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError(null);
      await profileService.deleteAccount(confirmEmail);
      setSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Failed to load privacy settings</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Privacy & Data Controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control your privacy settings and manage your data
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

        {/* Profile Visibility */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <VisibilityIcon color="primary" />
            <Typography variant="h6">Profile Visibility</Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Who can see your profile</InputLabel>
            <Select
              value={settings.profileVisibility || 'private'}
              onChange={(e) => handleVisibilityChange(e.target.value as any)}
              label="Who can see your profile"
              disabled={saving}
            >
              <MenuItem value="public">
                <Box>
                  <Typography variant="body1">Public</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Anyone can see your profile
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="friends">
                <Box>
                  <Typography variant="body1">Friends Only</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only your connections can see your profile
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="private">
                <Box>
                  <Typography variant="body1">Private</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only you can see your profile
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showOnlineStatus || false}
                  onChange={() => handleToggle('showOnlineStatus')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Show Online Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Let others see when you're online
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Collection */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <DataUsageIcon color="primary" />
            <Typography variant="h6">Data Collection & Usage</Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowDataCollection || false}
                  onChange={() => handleToggle('allowDataCollection')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Allow Data Collection</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collect usage data to improve service quality
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowAnalytics || false}
                  onChange={() => handleToggle('allowAnalytics')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Allow Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Help us understand how you use the platform
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shareUsageData || false}
                  onChange={() => handleToggle('shareUsageData')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Share Usage Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Share anonymized data for research and development
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowPersonalization || false}
                  onChange={() => handleToggle('allowPersonalization')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Allow Personalization</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use your data to personalize your experience
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Management */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Data Management</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <DownloadIcon color="primary" />
                    <Typography variant="h6">Export Your Data</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Download a copy of all your data including profiles, messages, and settings.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    fullWidth
                  >
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <DeleteIcon color="error" />
                    <Typography variant="h6" color="error">
                      Delete Account
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Permanently delete your account and all associated data. This cannot be undone.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    fullWidth
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Privacy Summary */}
        <Box p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Your Privacy Settings
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            <Chip
              label={`Profile: ${settings.profileVisibility}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={settings.showOnlineStatus ? 'Online Status: Visible' : 'Online Status: Hidden'}
              size="small"
              color={settings.showOnlineStatus ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              label={settings.allowDataCollection ? 'Data Collection: On' : 'Data Collection: Off'}
              size="small"
              color={settings.allowDataCollection ? 'info' : 'default'}
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="error" />
            <Typography variant="h6">Delete Account</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Warning: This action is permanent and cannot be undone!
          </Alert>
          <Typography variant="body1" paragraph>
            Deleting your account will:
          </Typography>
          <ul>
            <li>Permanently delete all your data</li>
            <li>Remove all relationships and conversations</li>
            <li>Delete voice and avatar profiles</li>
            <li>Cancel any active subscriptions</li>
          </ul>
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            Please enter your email address to confirm:
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={!confirmEmail || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
