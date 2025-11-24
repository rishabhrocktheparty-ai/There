import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { adminService, RoleTemplate } from '../../services/adminService';

export const RoleManagementPage: React.FC = () => {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<RoleTemplate> | null>(null);

  const [formData, setFormData] = useState<Partial<RoleTemplate>>({
    type: 'CUSTOM',
    key: '',
    displayName: '',
    description: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRoleTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load role templates');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (template?: RoleTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData(template);
    } else {
      setEditingTemplate(null);
      setFormData({
        type: 'CUSTOM',
        key: '',
        displayName: '',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await adminService.upsertRoleTemplate(formData);
      setSuccess(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
      setDialogOpen(false);
      loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminService.deleteRoleTemplate(id);
      setSuccess('Template deleted successfully');
      loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete template');
    }
  };

  if (loading) {
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
            Role Configuration & Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage relationship role templates and configurations
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
          New Template
        </Button>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Usage</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Chip label={template.type} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{template.key}</TableCell>
                  <TableCell>{template.displayName}</TableCell>
                  <TableCell>{template.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={template._count?.relationships || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openDialog(template)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(template.id)}
                      color="error"
                      disabled={(template._count?.relationships || 0) > 0}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PsychologyIcon />
            {editingTemplate ? 'Edit Role Template' : 'Create Role Template'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || 'CUSTOM'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                label="Type"
              >
                <MenuItem value="FATHER">Father</MenuItem>
                <MenuItem value="MOTHER">Mother</MenuItem>
                <MenuItem value="SIBLING">Sibling</MenuItem>
                <MenuItem value="MENTOR">Mentor</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Key"
              value={formData.key || ''}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              helperText="Unique identifier (e.g., father-supportive)"
            />

            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
