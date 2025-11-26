/**
 * Role Preview Dialog
 * Full-screen modal with detailed role information
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  EmojiPeople as EmojiPeopleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface RolePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  role: {
    id: string;
    type: string;
    name: string;
    description: string;
    longDescription?: string;
    emoji: string;
    gradient: string;
    traits: string[];
    strengths: string[];
    bestFor: string[];
    communicationStyle?: string;
    topics?: string[];
  } | null;
  onSelect: (roleId: string) => void;
}

export const RolePreviewDialog: React.FC<RolePreviewDialogProps> = ({
  open,
  onClose,
  role,
  onSelect,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!role) return null;

  const handleSelect = () => {
    onSelect(role.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          maxHeight: fullScreen ? '100%' : '90vh',
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Hero Section */}
      <Box
        sx={{
          background: role.gradient,
          p: 4,
          pb: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        <Avatar
          sx={{
            width: 120,
            height: 120,
            fontSize: 60,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto',
            mb: 2,
            boxShadow: 3,
          }}
        >
          {role.emoji}
        </Avatar>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            mb: 1,
          }}
        >
          {role.name}
        </Typography>
        <Chip
          label={role.type}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
          }}
        />
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Description */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            About This Role
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {role.longDescription || role.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Key Features Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Personality Traits */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PsychologyIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personality Traits
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {role.traits.map((trait) => (
                    <Chip
                      key={trait}
                      label={trait}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Communication Style */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ChatIcon color="info" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Communication Style
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {role.communicationStyle || 'Warm, supportive, and understanding with active listening.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Strengths */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeIcon color="warning" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Key Strengths
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {role.strengths.map((strength, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2">{strength}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Best For */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FavoriteIcon color="error" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Best For
            </Typography>
          </Box>
          <List>
            {role.bestFor.map((item, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Preferred Topics */}
        {role.topics && role.topics.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Conversation Topics
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {role.topics.map((topic) => (
                <Chip
                  key={topic}
                  label={topic}
                  variant="outlined"
                  size="medium"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          size="large"
          startIcon={<EmojiPeopleIcon />}
          sx={{ px: 4 }}
        >
          Select This Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};
