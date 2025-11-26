import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import { Message } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '../../hooks/useDebounce';

interface ChatSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMessage: (message: Message) => void;
  conversationId?: string;
}

export const ChatSearchDialog: React.FC<ChatSearchDialogProps> = ({
  open,
  onClose,
  onSelectMessage,
  conversationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    if (debouncedSearch && open) {
      performSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, open]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await chatService.searchMessages(query);
      
      // Filter by conversation if specified
      const filtered = conversationId
        ? results.filter((msg) => msg.conversationId === conversationId)
        : results;
      
      setSearchResults(filtered);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (message: Message, index: number) => {
    setCurrentIndex(index);
    onSelectMessage(message);
    onClose();
  };

  const handleNavigate = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    let newIndex = currentIndex;
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = currentIndex < searchResults.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentIndex(newIndex);
    onSelectMessage(searchResults[newIndex]);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          style={{
            backgroundColor: '#ffd54f',
            padding: '2px 4px',
            borderRadius: 2,
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: 700,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon color="action" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Search Messages
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
              endAdornment: searchResults.length > 0 && (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${currentIndex + 1}/${searchResults.length}`}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleNavigate('up')}
                      disabled={searchResults.length === 0}
                    >
                      <UpIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleNavigate('down')}
                      disabled={searchResults.length === 0}
                    >
                      <DownIcon />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Search Results */}
        <Box sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : searchResults.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No results found' : 'Start typing to search'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try different keywords or check your spelling'
                  : 'Search through your message history'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {searchResults.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor:
                        currentIndex === index ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleSelectResult(message, index)}
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600}>
                              {message.senderType === 'user' ? 'You' : 'AI'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(message.timestamp), {
                                addSuffix: true,
                              })}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {highlightText(message.content, searchQuery)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
