/**
 * Enhanced Role Card Component
 * Beautiful card with avatar, traits, and smooth animations
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  EmojiPeople as EmojiPeopleIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface RoleCardProps {
  role: {
    id: string;
    type: string;
    name: string;
    description: string;
    emoji: string;
    gradient: string;
    traits: string[];
    strengths: string[];
    bestFor: string[];
  };
  onSelect: (roleId: string) => void;
  selected?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onSelect, selected }) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? 6 : 2,
        border: selected ? 2 : 0,
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Selected Badge */}
      {selected && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            bgcolor: 'primary.main',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
            zIndex: 1,
          }}
        >
          <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
      )}

      {/* Gradient Header */}
      <Box
        sx={{
          background: role.gradient,
          p: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            transition: 'transform 0.3s',
            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          }}
        />
        <Avatar
          sx={{
            width: 80,
            height: 80,
            fontSize: 40,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto',
            mb: 2,
            transition: 'transform 0.3s',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {role.emoji}
        </Avatar>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {role.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          {role.type}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.6,
            minHeight: 60,
          }}
        >
          {role.description}
        </Typography>

        {/* Personality Traits */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            PERSONALITY TRAITS
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {role.traits.slice(0, 3).map((trait) => (
              <Chip
                key={trait}
                label={trait}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 24,
                  fontWeight: 500,
                }}
              />
            ))}
            {role.traits.length > 3 && (
              <Chip
                label={`+${role.traits.length - 3}`}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 24,
                  fontWeight: 500,
                  bgcolor: 'action.hover',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Expand Button */}
        <Button
          size="small"
          onClick={handleExpandClick}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          }
          sx={{ mb: 1 }}
        >
          {expanded ? 'Show Less' : 'Learn More'}
        </Button>

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          
          {/* Strengths */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              STRENGTHS
            </Typography>
            <List dense disablePadding>
              {role.strengths.map((strength) => (
                <ListItem key={strength} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={strength}
                    primaryTypographyProps={{ variant: 'body2', fontSize: 13 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Best For */}
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
            >
              <FavoriteIcon sx={{ fontSize: 14 }} />
              BEST FOR
            </Typography>
            <List dense disablePadding>
              {role.bestFor.map((item) => (
                <ListItem key={item} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{ variant: 'body2', fontSize: 13 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant={selected ? 'outlined' : 'contained'}
          fullWidth
          onClick={() => onSelect(role.id)}
          startIcon={selected ? <CheckCircleIcon /> : <EmojiPeopleIcon />}
          sx={{
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: 15,
          }}
        >
          {selected ? 'Selected' : 'Select Role'}
        </Button>
      </CardActions>
    </Card>
  );
};
