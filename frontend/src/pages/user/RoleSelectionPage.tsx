import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField,
  Chip,
  Alert,
  Fade,
  InputAdornment
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { RoleCard } from '../../components/roles/EnhancedRoleCard';
import { RolePreviewDialog } from '../../components/roles/RolePreviewDialog';
import { roleTemplates, roleCategories, filterRoles, RoleTemplate } from '../../data/roleTemplates';
import { useNotifications } from '../../providers/NotificationProvider';

export const RoleSelectionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewRole, setPreviewRole] = useState<RoleTemplate | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const filteredRoles = filterRoles(roleTemplates, selectedCategory, searchTerm);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    addNotification({
      id: `role-${Date.now()}`,
      message: `Selected ${roleTemplates.find(r => r.id === roleId)?.name} role`,
      type: 'success',
    });
    
    // Navigate to dashboard or chat after selection
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 1500);
  };

  const handleLearnMore = (role: RoleTemplate) => {
    setPreviewRole(role);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              fontWeight={700}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Choose Your AI Companion
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
            >
              Select a role that resonates with you. Each AI companion brings unique personality, wisdom, and support.
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                maxWidth: 500, 
                mx: 'auto',
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: 3,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filters */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {roleCategories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  sx={{ 
                    fontWeight: selectedCategory === category.id ? 600 : 400,
                    px: 1,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Selection Confirmation */}
          {selectedRole && (
            <Alert 
              severity="success" 
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
              onClose={() => setSelectedRole(null)}
            >
              Great choice! Preparing your AI companion...
            </Alert>
          )}

          {/* Role Grid */}
          {filteredRoles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No roles found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter criteria.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredRoles.map((role) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={role.id}>
                  <RoleCard
                    role={role}
                    selected={selectedRole === role.id}
                    onSelect={handleRoleSelect}
                    onLearnMore={handleLearnMore}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Preview Dialog */}
          <RolePreviewDialog
            role={previewRole}
            open={!!previewRole}
            onClose={() => setPreviewRole(null)}
            onSelect={handleRoleSelect}
          />
        </Box>
      </Fade>
    </Container>
  );
};
