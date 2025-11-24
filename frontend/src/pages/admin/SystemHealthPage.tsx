import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { adminService, SystemHealth } from '../../services/adminService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'unhealthy':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon color="success" />;
    case 'degraded':
      return <WarningIcon color="warning" />;
    case 'unhealthy':
      return <ErrorIcon color="error" />;
    default:
      return <CheckCircleIcon />;
  }
};

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadHealth();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !health) {
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
            System Health Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system status and performance metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            startIcon={<RefreshIcon />}
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <Button variant="outlined" onClick={loadHealth} startIcon={<RefreshIcon />}>
            Refresh Now
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overall Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            {getStatusIcon(health?.status || 'healthy')}
            <Box>
              <Typography variant="h5" fontWeight="bold">
                System Status: {health?.status.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Box textAlign="center">
            <Typography variant="h3" fontWeight="bold" color={getStatusColor(health?.status || 'healthy') + '.main'}>
              {health?.healthScore || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Health Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={health?.healthScore || 0}
              color={getStatusColor(health?.status || 'healthy') as any}
              sx={{ mt: 1, height: 8, borderRadius: 1, width: 200 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Component Status */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <StorageIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Database
                  </Typography>
                  <Chip
                    label={health?.components.database.status.toUpperCase()}
                    color={getStatusColor(health?.components.database.status || 'healthy') as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {health?.components.database.connected ? 'Connected' : 'Disconnected'}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Latency: {health?.components.database.latency}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ApiIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    API
                  </Typography>
                  <Chip
                    label={health?.components.api.status.toUpperCase()}
                    color={getStatusColor(health?.components.api.status || 'healthy') as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Recent Activity
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Messages: {health?.components.api.recentMessages || 0}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Users: {health?.components.api.recentUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ErrorIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Errors
                  </Typography>
                  <Chip
                    label={health?.components.errors.status.toUpperCase()}
                    color={getStatusColor(health?.components.errors.status || 'healthy') as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {health?.components.errors.count === 0 ? 'No recent errors' : 'Errors detected'}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Error Count: {health?.components.errors.count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Metrics */}
      {health?.metrics && health.metrics.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <SpeedIcon />
            <Typography variant="h6" fontWeight="bold">
              System Metrics
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {health.metrics.map((metric: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {metric.label || 'Metric'}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {metric.value || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};
