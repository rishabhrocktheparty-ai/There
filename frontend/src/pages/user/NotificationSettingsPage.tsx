import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { profileService, NotificationSettings } from '../../services/profileService';

export const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await profileService.getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettings) => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      const newValue = !settings[key];
      const updated = await profileService.updateNotificationSettings({
        [key]: newValue,
      });
      setSettings(updated);
      setSuccess('Notification settings updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const enableAll = async () => {
    try {
      setSaving(true);
      const updated = await profileService.updateNotificationSettings({
        email: true,
        push: true,
        inApp: true,
        messageAlerts: true,
        relationshipUpdates: true,
        weeklyDigest: true,
        dailyReminders: true,
        achievementNotifications: true,
      });
      setSettings(updated);
      setSuccess('All notifications enabled');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const disableAll = async () => {
    try {
      setSaving(true);
      const updated = await profileService.updateNotificationSettings({
        email: false,
        push: false,
        inApp: false,
        messageAlerts: false,
        relationshipUpdates: false,
        weeklyDigest: false,
        dailyReminders: false,
        achievementNotifications: false,
      });
      setSettings(updated);
      setSuccess('All notifications disabled');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
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
        <Alert severity="error">Failed to load notification settings</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Notification Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage how you receive notifications and alerts
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button size="small" onClick={enableAll} disabled={saving}>
              Enable All
            </Button>
            <Button size="small" onClick={disableAll} disabled={saving}>
              Disable All
            </Button>
          </Box>
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

        {/* Notification Channels */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Notification Channels</Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email || false}
                  onChange={() => handleToggle('email')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Email Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive notifications via email
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.push || false}
                  onChange={() => handleToggle('push')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Push Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive push notifications on your devices
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.inApp || false}
                  onChange={() => handleToggle('inApp')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">In-App Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Show notifications within the application
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Activity Notifications */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <NotificationsActiveIcon color="primary" />
            <Typography variant="h6">Activity Notifications</Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.messageAlerts || false}
                  onChange={() => handleToggle('messageAlerts')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Message Alerts</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get notified when you receive new messages
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.relationshipUpdates || false}
                  onChange={() => handleToggle('relationshipUpdates')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Relationship Updates</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updates about your relationships and milestones
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.achievementNotifications || false}
                  onChange={() => handleToggle('achievementNotifications')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Achievement Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Celebrate milestones and achievements
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Digest & Reminders */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <EmailIcon color="primary" />
            <Typography variant="h6">Digests & Reminders</Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyDigest || false}
                  onChange={() => handleToggle('weeklyDigest')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Weekly Digest</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive a weekly summary of your activity
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dailyReminders || false}
                  onChange={() => handleToggle('dailyReminders')}
                  disabled={saving}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Daily Reminders</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get daily reminders to stay connected
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </Box>

        {/* Notification Summary */}
        <Box mt={4} p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Active Notifications
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {Object.entries(settings).map(([key, value]) =>
              value ? (
                <Chip
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
