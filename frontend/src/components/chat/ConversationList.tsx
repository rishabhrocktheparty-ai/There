import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  PushPin as PinIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { Conversation } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onMarkAsRead?: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onMarkAsRead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [contextMenu, setContextMenu] = useState<{
    conversationId: string;
    anchorEl: HTMLElement;
  } | null>(null);

  const handleContextMenu = (
    event: React.MouseEvent<HTMLElement>,
    conversationId: string
  ) => {
    event.preventDefault();
    setContextMenu({
      conversationId,
      anchorEl: event.currentTarget,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMarkAsRead = () => {
    if (contextMenu) {
      onMarkAsRead?.(contextMenu.conversationId);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      onDeleteConversation?.(contextMenu.conversationId);
      handleCloseContextMenu();
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filterType === 'all' || (filterType === 'unread' && conv.unreadCount > 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Messages
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
          />
          <Chip
            label="Unread"
            size="small"
            onClick={() => setFilterType('unread')}
            color={filterType === 'unread' ? 'primary' : 'default'}
          />
        </Box>
      </Box>

      <Divider />

      {/* Conversations List */}
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {filteredConversations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {searchTerm
                ? 'No conversations found'
                : 'No conversations yet. Start a new conversation!'}
            </Typography>
          </Box>
        ) : (
          filteredConversations.map((conversation) => (
            <Fade key={conversation.id} in timeout={300}>
              <ListItem
                disablePadding
                sx={{
                  backgroundColor:
                    activeConversationId === conversation.id
                      ? 'action.selected'
                      : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemButton
                  onClick={() => onSelectConversation(conversation.id)}
                  onContextMenu={(e) => handleContextMenu(e, conversation.id)}
                  sx={{ py: 1.5, px: 2 }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="error"
                      overlap="circular"
                    >
                      <Avatar
                        sx={{
                          background:
                            'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          fontSize: '1.25rem',
                        }}
                      >
                        {conversation.roleAvatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={conversation.unreadCount > 0 ? 600 : 400}
                          noWrap
                        >
                          {conversation.roleName}
                        </Typography>
                        {conversation.lastMessage && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessage.timestamp),
                              { addSuffix: false }
                            )}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color={
                          conversation.unreadCount > 0
                            ? 'text.primary'
                            : 'text.secondary'
                        }
                        fontWeight={conversation.unreadCount > 0 ? 500 : 400}
                        noWrap
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {conversation.isTyping ? (
                          <>
                            <span>typing</span>
                            <span
                              style={{
                                animation: 'blink 1.4s infinite',
                              }}
                            >
                              ...
                            </span>
                          </>
                        ) : (
                          conversation.lastMessage?.content || 'No messages yet'
                        )}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          ))
        )}
      </List>

      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        anchorEl={contextMenu?.anchorEl}
        onClose={handleCloseContextMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleMarkAsRead}>
          <MarkReadIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Read
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Conversation
        </MenuItem>
      </Menu>
    </Box>
  );
};
