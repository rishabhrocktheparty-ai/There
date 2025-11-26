import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { Conversation } from '../../types/chat';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onSearch?: () => void;
  onViewInfo?: () => void;
  onMuteToggle?: () => void;
  onBlock?: () => void;
  isMuted?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onBack,
  onSearch,
  onViewInfo,
  onMuteToggle,
  onBlock,
  isMuted = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewInfo = () => {
    onViewInfo?.();
    handleMenuClose();
  };

  const handleMuteToggle = () => {
    onMuteToggle?.();
    handleMenuClose();
  };

  const handleBlock = () => {
    onBlock?.();
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {/* Back Button (mobile) */}
        {onBack && (
          <IconButton onClick={onBack} sx={{ display: { sm: 'none' } }}>
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Avatar */}
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            fontSize: '1.5rem',
          }}
        >
          {conversation.roleAvatar}
        </Avatar>

        {/* Role Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {conversation.roleName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {conversation.isTyping ? (
              <Typography variant="body2" color="primary">
                typing...
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {conversation.roleType}
              </Typography>
            )}
            {conversation.unreadCount > 0 && (
              <Chip
                label={conversation.unreadCount}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Right Section - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Search Button */}
        <Tooltip title="Search messages">
          <IconButton onClick={onSearch}>
            <SearchIcon />
          </IconButton>
        </Tooltip>

        {/* More Menu */}
        <Tooltip title="More options">
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewInfo}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} />
          View Info
        </MenuItem>
        <MenuItem onClick={handleMuteToggle}>
          <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
          {isMuted ? 'Unmute' : 'Mute'} Notifications
        </MenuItem>
        <MenuItem onClick={handleBlock} sx={{ color: 'error.main' }}>
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          Block Conversation
        </MenuItem>
      </Menu>
    </Box>
  );
};
