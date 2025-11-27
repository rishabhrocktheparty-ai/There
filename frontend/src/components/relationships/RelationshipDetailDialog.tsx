import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { Relationship, RelationshipCustomization } from '../../types/relationship';
import { formatDistanceToNow, format } from 'date-fns';

interface RelationshipDetailDialogProps {
  relationship: Relationship | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, customization: Partial<RelationshipCustomization>) => void;
  onDelete: (id: string) => void;
}

export const RelationshipDetailDialog: React.FC<RelationshipDetailDialogProps> = ({
  relationship,
  open,
  onClose,
  onSave,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [editing, setEditing] = React.useState(false);
  const [customization, setCustomization] = React.useState<Partial<RelationshipCustomization>>({});

  React.useEffect(() => {
    if (relationship) {
      setCustomization(relationship.customization);
    }
  }, [relationship]);

  if (!relationship) return null;

  const handleSave = () => {
    onSave(relationship.id, customization);
    setEditing(false);
  };

  const handleCancel = () => {
    setCustomization(relationship.customization);
    setEditing(false);
  };

  const engagementPercentage = Math.min(relationship.stats.engagementScore * 10, 100);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '85vh' },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontSize: '2rem',
            }}
          >
            {relationship.roleAvatar}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              {customization.nickname || relationship.roleName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {relationship.roleType}
            </Typography>
            <Chip
              label={relationship.status}
              size="small"
              color={relationship.status === 'active' ? 'success' : 'default'}
              sx={{ mt: 0.5, textTransform: 'capitalize' }}
            />
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Overview" />
          <Tab label="Customization" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {relationship.roleDescription}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <MessageIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>
                    {relationship.stats.totalMessages}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Messages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <FavoriteIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>
                    {relationship.stats.streakDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>
                    {relationship.stats.engagementScore}/10
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Engagement
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={600}>
                    {relationship.stats.totalConversations}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Conversations
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {customization.personalNotes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Personal Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {customization.personalNotes}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary">
              Created {formatDistanceToNow(new Date(relationship.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        )}

        {/* Customization Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Customize Relationship</Typography>
              {!editing ? (
                <Button startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                    Save
                  </Button>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="Nickname"
              value={customization.nickname || ''}
              onChange={(e) => setCustomization({ ...customization, nickname: e.target.value })}
              disabled={!editing}
              sx={{ mb: 2 }}
              helperText="Give this relationship a personal name"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Personal Notes"
              value={customization.personalNotes || ''}
              onChange={(e) => setCustomization({ ...customization, personalNotes: e.target.value })}
              disabled={!editing}
              sx={{ mb: 3 }}
              helperText="Private notes about this relationship"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Preferences
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Response Style</InputLabel>
              <Select
                value={customization.preferences?.responseStyle || 'balanced'}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    preferences: {
                      ...customization.preferences,
                      responseStyle: e.target.value as any,
                    },
                  })
                }
                disabled={!editing}
                label="Response Style"
              >
                <MenuItem value="concise">Concise</MenuItem>
                <MenuItem value="balanced">Balanced</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Emotional Tone</InputLabel>
              <Select
                value={customization.preferences?.emotionalTone || 'supportive'}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    preferences: {
                      ...customization.preferences,
                      emotionalTone: e.target.value as any,
                    },
                  })
                }
                disabled={!editing}
                label="Emotional Tone"
              >
                <MenuItem value="supportive">Supportive</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Notifications
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={customization.notificationsEnabled || false}
                  onChange={(e) =>
                    setCustomization({ ...customization, notificationsEnabled: e.target.checked })
                  }
                  disabled={!editing}
                />
              }
              label="Enable Notifications"
              sx={{ mb: 2, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={customization.reminderEnabled || false}
                  onChange={(e) =>
                    setCustomization({ ...customization, reminderEnabled: e.target.checked })
                  }
                  disabled={!editing}
                />
              }
              label="Conversation Reminders"
              sx={{ mb: 2, display: 'block' }}
            />

            {customization.reminderEnabled && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Reminder Frequency</InputLabel>
                <Select
                  value={customization.reminderFrequency || 'weekly'}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      reminderFrequency: e.target.value as any,
                    })
                  }
                  disabled={!editing}
                  label="Reminder Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Statistics Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Engagement Metrics
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Engagement
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {relationship.stats.engagementScore}/10
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={engagementPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Favorite Topics
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {relationship.stats.favoriteTopics.length > 0 ? (
                relationship.stats.favoriteTopics.map((topic, index) => (
                  <Chip key={index} label={topic} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start conversations to discover favorite topics
                </Typography>
              )}
            </Box>

            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={format(new Date(relationship.createdAt), 'PPP')}
                />
              </ListItem>
              {relationship.lastInteractionAt && (
                <ListItem>
                  <ListItemText
                    primary="Last Interaction"
                    secondary={format(new Date(relationship.lastInteractionAt), 'PPP p')}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Average Response Time"
                  secondary={`${relationship.stats.averageResponseTime} seconds`}
                />
              </ListItem>
            </List>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="error"
          onClick={() => {
            if (confirm('Are you sure you want to delete this relationship?')) {
              onDelete(relationship.id);
              onClose();
            }
          }}
        >
          Delete Relationship
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
