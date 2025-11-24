import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  FavoriteBorder as FavoriteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Relationship {
  id: string;
  title: string;
  userId: string;
  roleTemplateId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  roleTemplate: {
    id: string;
    key: string;
    type: string;
    displayName: string;
    description: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    emotionalTone: string;
  };
}

const getRoleColor = (type: string) => {
  const colors: Record<string, string> = {
    FATHER: '#1976d2',
    MOTHER: '#9c27b0',
    SIBLING: '#f57c00',
    MENTOR: '#388e3c',
    CUSTOM: '#757575',
  };
  return colors[type] || '#757575';
};

const getRoleAvatar = (type: string) => {
  const avatars: Record<string, string> = {
    FATHER: '👨',
    MOTHER: '👩',
    SIBLING: '👦',
    MENTOR: '🧑‍🏫',
    CUSTOM: '✨',
  };
  return avatars[type] || '✨';
};

const getEmotionColor = (tone: string) => {
  const colors: Record<string, string> = {
    POSITIVE: 'success',
    NEUTRAL: 'default',
    NEGATIVE: 'error',
    MIXED: 'warning',
  };
  return colors[tone] || 'default';
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const RelationshipsPage = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Relationship[]>('/api/relationships');
      setRelationships(response.data);
    } catch (err) {
      console.error('Error loading relationships:', err);
      setError('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, relationship: Relationship) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRelationship(relationship);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRelationship(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRelationship) return;

    try {
      await axios.delete(`/api/relationships/${selectedRelationship.id}`);
      setRelationships((prev) => prev.filter((r) => r.id !== selectedRelationship.id));
      setDeleteDialogOpen(false);
      setSelectedRelationship(null);
    } catch (err) {
      console.error('Error deleting relationship:', err);
      setError('Failed to delete relationship');
    }
  };

  const handleChatClick = async (relationship: Relationship) => {
    try {
      // Mark as active/recently accessed
      await axios.post(`/api/relationships/${relationship.id}/switch`);
      navigate(`/app/relationships/${relationship.id}/chat`);
    } catch (err) {
      console.error('Error switching relationship:', err);
      // Navigate anyway
      navigate(`/app/relationships/${relationship.id}/chat`);
    }
  };

  const handleViewActivity = (relationshipId: string) => {
    handleMenuClose();
    navigate(`/app/relationships/${relationshipId}/activity`);
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading your relationships...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Relationships
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/app/roles')}
        >
          Add Relationship
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {relationships.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No relationships yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by selecting a role to create your first AI relationship
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/app/roles')}
            >
              Choose a Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {relationships.map((relationship) => (
            <Grid item xs={12} sm={6} md={4} key={relationship.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{
                          bgcolor: getRoleColor(relationship.roleTemplate.type),
                          width: 56,
                          height: 56,
                          fontSize: '2rem',
                        }}
                      >
                        {getRoleAvatar(relationship.roleTemplate.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {relationship.title}
                        </Typography>
                        <Chip
                          label={relationship.roleTemplate.displayName}
                          size="small"
                          sx={{
                            bgcolor: getRoleColor(relationship.roleTemplate.type),
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, relationship)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {relationship.roleTemplate.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      icon={<ChatIcon />}
                      label={`${relationship.messageCount} messages`}
                      size="small"
                      variant="outlined"
                    />
                    {relationship.isActive && (
                      <Chip
                        icon={<CircleIcon sx={{ fontSize: '0.6rem !important' }} />}
                        label="Active"
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>

                  {relationship.lastMessage && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Last message: {formatTimeAgo(relationship.lastMessage.createdAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {relationship.lastMessage.content}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={() => handleChatClick(relationship)}
                  >
                    Chat
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedRelationship && handleViewActivity(selectedRelationship.id)}>
          <TimelineIcon sx={{ mr: 1 }} fontSize="small" />
          View Activity
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Relationship?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your relationship with{' '}
            <strong>{selectedRelationship?.title}</strong>? This will remove all conversation
            history and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
