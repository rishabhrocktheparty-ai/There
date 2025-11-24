import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  timestamp: string;
  user: {
    email: string;
    profile?: {
      displayName: string;
    };
  };
}

interface PaginatedResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const actionColors: Record<string, any> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'primary',
  LOGOUT: 'default',
};

export const FeedbackModerationPage: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [page, rowsPerPage, filterType]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserFeedback(
        page + 1,
        rowsPerPage,
        filterType === 'all' ? undefined : filterType
      );
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Feedback & Moderation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor user activity and audit logs across the platform
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(0);
            }}
            label="Filter by Type"
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="LOGIN">Login</MenuItem>
            <MenuItem value="LOGOUT">Logout</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {log.user.profile?.displayName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={actionColors[log.action] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'grey.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {log.entityId.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleViewDetails(log)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FeedbackIcon />
            Audit Log Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedLog.user.profile?.displayName || 'Unknown'} ({selectedLog.user.email})
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Action
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedLog.action}
                    color={actionColors[selectedLog.action] || 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Entity
                </Typography>
                <Typography variant="body1">
                  {selectedLog.entityType} ({selectedLog.entityId})
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Typography>
              </Box>

              {selectedLog.metadata && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Metadata
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: 'grey.50',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      overflow: 'auto',
                      maxHeight: '300px',
                    }}
                  >
                    <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
