import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import onboardingService, { RoleGuidance } from '../../services/onboardingService';

interface RoleSelectionGuidanceProps {
  open: boolean;
  onClose: () => void;
  onSelectRole: (roleType: string) => void;
}

export const RoleSelectionGuidance: React.FC<RoleSelectionGuidanceProps> = ({
  open,
  onClose,
  onSelectRole,
}) => {
  const [guidance, setGuidance] = useState<RoleGuidance[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleGuidance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadGuidance();
    }
  }, [open]);

  const loadGuidance = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getRoleGuidance();
      setGuidance(data);
    } catch (error) {
      console.error('Error loading role guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (role: RoleGuidance) => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole.roleType);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Choose Your AI Companion Role
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select the type of relationship that best fits your needs
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {selectedRole ? (
          // Detailed view
          <Box>
            <Button
              startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
              onClick={() => setSelectedRole(null)}
              sx={{ mb: 2 }}
            >
              Back to all roles
            </Button>

            <Card variant="outlined">
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Typography variant="h2">{selectedRole.icon}</Typography>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {selectedRole.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedRole.description}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Key Characteristics
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedRole.characteristics.map((char, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <InfoIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{char}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Best For:
                  </Typography>
                  <Typography variant="body2">{selectedRole.bestFor}</Typography>
                </Box>

                <Box display="flex" justifyContent="center" gap={2}>
                  <Button variant="outlined" onClick={() => setSelectedRole(null)}>
                    Choose Different Role
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleConfirm}
                  >
                    Select {selectedRole.title}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          // Grid view
          <Grid container spacing={2}>
            {guidance.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.roleType}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleRoleClick(role)} sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box textAlign="center" mb={2}>
                        <Typography variant="h1" sx={{ fontSize: 48 }}>
                          {role.icon}
                        </Typography>
                      </Box>

                      <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
                        {role.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        textAlign="center"
                        sx={{ flexGrow: 1 }}
                      >
                        {role.description}
                      </Typography>

                      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5}>
                        {role.characteristics.slice(0, 2).map((char, index) => (
                          <Chip key={index} label={char} size="small" variant="outlined" />
                        ))}
                        {role.characteristics.length > 2 && (
                          <Chip
                            label={`+${role.characteristics.length - 2} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Box textAlign="center" mt={2}>
                        <Button endIcon={<ArrowForwardIcon />} size="small">
                          Learn More
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};
