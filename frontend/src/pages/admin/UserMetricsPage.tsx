import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminService, UserMetrics } from '../../services/adminService';

export const UserMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'CONFIG_MANAGER' | 'VIEWER'>('VIEWER');

  useEffect(() => {
    loadMetrics();
  }, [page, rowsPerPage, search]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserMetrics(page + 1, rowsPerPage, search);
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.adminProfile?.role || 'VIEWER');
    setRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await adminService.updateAdminRole(selectedUser.id, selectedRole);
      setSuccess('Admin role updated successfully');
      setRoleDialogOpen(false);
      loadMetrics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update admin role');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove admin privileges?')) return;

    try {
      await adminService.removeAdmin(userId);
      setSuccess('Admin privileges removed');
      loadMetrics();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove admin');
    }
  };

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          User Metrics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* Search */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by email or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell align="center">Relationships</TableCell>
                <TableCell align="center">Messages</TableCell>
                <TableCell align="center">Events</TableCell>
                <TableCell>Admin Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.displayName || '-'}</TableCell>
                  <TableCell>
                    <Chip label={user.authProvider} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{user._count.relationships}</TableCell>
                  <TableCell align="center">{user._count.sentMessages}</TableCell>
                  <TableCell align="center">{user._count.usageEvents}</TableCell>
                  <TableCell>
                    {user.adminProfile ? (
                      <Chip label={user.adminProfile.role} size="small" color="primary" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openRoleDialog(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {user.adminProfile && (
                      <IconButton size="small" onClick={() => handleRemoveAdmin(user.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {metrics && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={metrics.pagination.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            Update Admin Role
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              User: {selectedUser?.email}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Admin Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                label="Admin Role"
              >
                <MenuItem value="SUPER_ADMIN">
                  <Box>
                    <Typography variant="body1">Super Admin</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Full system access
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="CONFIG_MANAGER">
                  <Box>
                    <Typography variant="body1">Config Manager</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage configurations
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="VIEWER">
                  <Box>
                    <Typography variant="body1">Viewer</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read-only access
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
