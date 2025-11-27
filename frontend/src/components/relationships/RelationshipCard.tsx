import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  Archive as ArchiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { Relationship } from '../../types/relationship';
import { formatDistanceToNow } from 'date-fns';

interface RelationshipCardProps {
  relationship: Relationship;
  onChat: (id: string) => void;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'paused' | 'archived') => void;
  onDelete: (id: string) => void;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({
  relationship,
  onChat,
  onViewDetails,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const engagementPercentage = Math.min(relationship.stats.engagementScore * 10, 100);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {/* Status Badge */}
      {relationship.status !== 'active' && (
        <Chip
          label={relationship.status}
          color={getStatusColor(relationship.status) as any}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            textTransform: 'capitalize',
          }}
        />
      )}

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Badge
            badgeContent={
              relationship.stats.streakDays > 0 ? (
                <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
              ) : null
            }
            overlap="circular"
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                fontSize: '1.75rem',
                mr: 2,
              }}
            >
              {relationship.roleAvatar}
            </Avatar>
          </Badge>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap fontWeight={600}>
              {relationship.customization.nickname || relationship.roleName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {relationship.roleType}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -0.5 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            minHeight: 40,
          }}
        >
          {relationship.roleDescription}
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Tooltip title="Total Messages">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {relationship.stats.totalMessages}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Messages
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Conversation Streak">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {relationship.stats.streakDays}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Day Streak
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Total Conversations">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {relationship.stats.totalConversations}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chats
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        {/* Engagement Progress */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Engagement
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {relationship.stats.engagementScore}/10
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={engagementPercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
            }}
          />
        </Box>

        {/* Last Interaction */}
        {relationship.lastInteractionAt && (
          <Typography variant="caption" color="text.secondary">
            Last active{' '}
            {formatDistanceToNow(new Date(relationship.lastInteractionAt), {
              addSuffix: true,
            })}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Tooltip title="Start Chat">
          <IconButton
            color="primary"
            onClick={() => onChat(relationship.id)}
            disabled={relationship.status === 'archived'}
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Details">
          <IconButton onClick={() => onViewDetails(relationship.id)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(relationship.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </CardActions>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {relationship.status === 'active' && (
          <MenuItem onClick={() => handleAction(() => onStatusChange(relationship.id, 'paused'))}>
            <PauseIcon fontSize="small" sx={{ mr: 1 }} />
            Pause Relationship
          </MenuItem>
        )}
        {relationship.status === 'paused' && (
          <MenuItem onClick={() => handleAction(() => onStatusChange(relationship.id, 'active'))}>
            <PlayIcon fontSize="small" sx={{ mr: 1 }} />
            Resume Relationship
          </MenuItem>
        )}
        {relationship.status !== 'archived' && (
          <MenuItem onClick={() => handleAction(() => onStatusChange(relationship.id, 'archived'))}>
            <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
            Archive Relationship
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleAction(() => onDelete(relationship.id))}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Relationship
        </MenuItem>
      </Menu>
    </Card>
  );
};
