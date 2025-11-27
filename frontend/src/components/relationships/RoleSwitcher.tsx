import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Badge,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Relationship } from '../../types/relationship';

interface RoleSwitcherProps {
  relationships: Relationship[];
  activeRelationshipId?: string;
  onSwitch: (relationshipId: string) => void;
  onCreateNew: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  relationships,
  activeRelationshipId,
  onSwitch,
  onCreateNew,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const activeRelationship = relationships.find((r) => r.id === activeRelationshipId);
  const activeRelationships = relationships.filter((r) => r.status === 'active');

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitch = (id: string) => {
    onSwitch(id);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        endIcon={<ArrowDownIcon />}
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          textTransform: 'none',
          justifyContent: 'space-between',
          minWidth: 200,
        }}
      >
        {activeRelationship ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                fontSize: '1rem',
              }}
            >
              {activeRelationship.roleAvatar}
            </Avatar>
            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
              {activeRelationship.customization.nickname || activeRelationship.roleName}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2">Select Relationship</Typography>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" color="text.secondary" fontWeight={600}>
            Active Relationships
          </Typography>
        </Box>

        {activeRelationships.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No active relationships
            </Typography>
          </Box>
        ) : (
          activeRelationships.map((relationship) => (
            <MenuItem
              key={relationship.id}
              onClick={() => handleSwitch(relationship.id)}
              selected={relationship.id === activeRelationshipId}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <Badge
                  badgeContent={
                    relationship.stats.streakDays > 0 ? relationship.stats.streakDays : null
                  }
                  color="error"
                  overlap="circular"
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      fontSize: '1.25rem',
                    }}
                  >
                    {relationship.roleAvatar}
                  </Avatar>
                </Badge>
              </ListItemIcon>

              <ListItemText
                primary={relationship.customization.nickname || relationship.roleName}
                secondary={`${relationship.stats.totalMessages} messages`}
                primaryTypographyProps={{ noWrap: true }}
              />

              {relationship.id === activeRelationshipId && (
                <CheckIcon color="primary" sx={{ ml: 1 }} />
              )}
            </MenuItem>
          ))
        )}

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={() => {
            onCreateNew();
            handleClose();
          }}
          sx={{ py: 1.5, color: 'primary.main' }}
        >
          <ListItemIcon>
            <AddIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Create New Relationship" />
        </MenuItem>
      </Menu>
    </>
  );
};
