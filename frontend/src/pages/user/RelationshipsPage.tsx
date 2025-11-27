import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import { RelationshipCard } from '../../components/relationships/RelationshipCard';
import { RelationshipDetailDialog } from '../../components/relationships/RelationshipDetailDialog';
import { RoleSwitcher } from '../../components/relationships/RoleSwitcher';
import { useRelationships } from '../../providers/RelationshipProvider';
import { Relationship, RelationshipFilter, RelationshipCustomization } from '../../types/relationship';

export const RelationshipsPage = () => {
  const navigate = useNavigate();
  const {
    relationships,
    loading,
    switchRelationship,
    updateRelationship,
    deleteRelationship: deleteRel,
  } = useRelationships();

  const [filter, setFilter] = useState<RelationshipFilter>({
    status: 'all',
    sortBy: 'recent',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter relationships
  const filteredRelationships = relationships.filter((rel) => {
    // Status filter
    if (filter.status !== 'all' && rel.status !== filter.status) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        rel.roleName.toLowerCase().includes(search) ||
        rel.roleType.toLowerCase().includes(search) ||
        rel.customization.nickname?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Sort relationships
  const sortedRelationships = [...filteredRelationships].sort((a, b) => {
    switch (filter.sortBy) {
      case 'recent':
        return (
          new Date(b.lastInteractionAt || b.updatedAt).getTime() -
          new Date(a.lastInteractionAt || a.updatedAt).getTime()
        );
      case 'oldest':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'most-active':
        return b.stats.totalMessages - a.stats.totalMessages;
      case 'name':
        return (a.customization.nickname || a.roleName).localeCompare(
          b.customization.nickname || b.roleName
        );
      default:
        return 0;
    }
  });

  const handleChat = (id: string) => {
    navigate(`/user/chat/${id}`);
  };

  const handleViewDetails = (id: string) => {
    const rel = relationships.find((r) => r.id === id);
    if (rel) {
      setSelectedRelationship(rel);
      setDetailDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    handleViewDetails(id);
  };

  const handleStatusChange = async (
    id: string,
    status: 'active' | 'paused' | 'archived'
  ) => {
    try {
      await updateRelationship(id, { status });
    } catch (err) {
      setError('Failed to update relationship status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this relationship?')) {
      try {
        await deleteRel(id);
      } catch (err) {
        setError('Failed to delete relationship');
      }
    }
  };

  const handleSaveCustomization = async (
    id: string,
    customization: Partial<RelationshipCustomization>
  ) => {
    try {
      await updateRelationship(id, { customization });
      setDetailDialogOpen(false);
    } catch (err) {
      setError('Failed to save customization');
    }
  };

  const handleCreateNew = () => {
    navigate('/user/role-selection');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading your relationships...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                My Relationships
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <RoleSwitcher
                  relationships={relationships.filter((r) => r.status === 'active')}
                  onSwitch={switchRelationship}
                  onCreateNew={handleCreateNew}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                >
                  New Relationship
                </Button>
              </Box>
            </Box>

            {/* Search and Filters */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                mb: 2,
              }}
            >
              <TextField
                placeholder="Search relationships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flex: '1 1 300px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setFilter({ ...filter, status: 'all' })}
                  color={filter.status === 'all' ? 'primary' : 'default'}
                />
                <Chip
                  label="Active"
                  onClick={() => setFilter({ ...filter, status: 'active' })}
                  color={filter.status === 'active' ? 'primary' : 'default'}
                />
                <Chip
                  label="Paused"
                  onClick={() => setFilter({ ...filter, status: 'paused' })}
                  color={filter.status === 'paused' ? 'primary' : 'default'}
                />
                <Chip
                  label="Archived"
                  onClick={() => setFilter({ ...filter, status: 'archived' })}
                  color={filter.status === 'archived' ? 'primary' : 'default'}
                />
              </Box>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, value) => value && setViewMode(value)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Relationships Grid/List */}
          {sortedRelationships.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                backgroundColor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || filter.status !== 'all'
                  ? 'No relationships found'
                  : 'No relationships yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filter.status !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by selecting a role to create your first AI relationship'}
              </Typography>
              {!searchTerm && filter.status === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                >
                  Create Your First Relationship
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {sortedRelationships.map((relationship) => (
                <Grid
                  item
                  xs={12}
                  sm={viewMode === 'grid' ? 6 : 12}
                  md={viewMode === 'grid' ? 4 : 12}
                  key={relationship.id}
                >
                  <RelationshipCard
                    relationship={relationship}
                    onChat={handleChat}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Detail Dialog */}
          <RelationshipDetailDialog
            relationship={selectedRelationship}
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            onSave={handleSaveCustomization}
            onDelete={handleDelete}
          />
        </Box>
      </Fade>
    </Container>
  );
};
