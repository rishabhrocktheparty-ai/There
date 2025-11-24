import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: any;
  responseTime?: number;
  timestamp: string;
}

interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceHealth;
    authentication: ServiceHealth;
    api: ServiceHealth;
    cache?: ServiceHealth;
  };
  system: {
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

const statusConfig = {
  healthy: {
    icon: CheckCircleIcon,
    color: 'success' as const,
    label: 'Healthy',
    bgColor: '#e8f5e9',
  },
  degraded: {
    icon: WarningIcon,
    color: 'warning' as const,
    label: 'Degraded',
    bgColor: '#fff3e0',
  },
  unhealthy: {
    icon: ErrorIcon,
    color: 'error' as const,
    label: 'Unhealthy',
    bgColor: '#ffebee',
  },
};

const serviceIcons = {
  database: StorageIcon,
  authentication: SecurityIcon,
  api: ApiIcon,
  cache: StorageIcon,
};

export const HealthCheckPage = () => {
  const [overallHealth, setOverallHealth] = useState<OverallHealth | null>(null);
  const [dbHealth, setDbHealth] = useState<ServiceHealth | null>(null);
  const [authHealth, setAuthHealth] = useState<ServiceHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overall, db, auth] = await Promise.all([
        axios.get<OverallHealth>('/api/health').catch(e => ({ data: null, error: e })),
        axios.get<ServiceHealth>('/api/health/db').catch(e => ({ data: null, error: e })),
        axios.get<ServiceHealth>('/api/health/auth').catch(e => ({ data: null, error: e })),
      ]);

      if ('data' in overall && overall.data) setOverallHealth(overall.data);
      if ('data' in db && db.data) setDbHealth(db.data);
      if ('data' in auth && auth.data) setAuthHealth(auth.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError('Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderServiceCard = (
    name: string,
    health: ServiceHealth | null,
    icon: React.ElementType
  ) => {
    if (!health) {
      return (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {React.createElement(icon, { color: 'disabled' })}
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {name}
              </Typography>
            </Box>
            <CircularProgress size={24} />
          </CardContent>
        </Card>
      );
    }

    const config = statusConfig[health.status];
    const Icon = config.icon;

    return (
      <Card sx={{ bgcolor: config.bgColor }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {React.createElement(icon, { color: config.color })}
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {name}
              </Typography>
            </Box>
            <Chip
              icon={<Icon />}
              label={config.label}
              color={config.color}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {health.message}
          </Typography>

          {health.responseTime && (
            <Typography variant="caption" color="text.secondary">
              Response Time: {health.responseTime}ms
            </Typography>
          )}

          {health.details && (
            <Box
              sx={{
                mt: 2,
                p: 1,
                bgcolor: 'rgba(0,0,0,0.05)',
                borderRadius: 1,
                maxHeight: 150,
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" component="pre">
                {JSON.stringify(health.details, null, 2)}
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Last Check: {new Date(health.timestamp).toLocaleTimeString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading && !overallHealth) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          System Health Monitor
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAllHealth}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overall Status Card */}
      {overallHealth && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5">Overall Status</Typography>
                <Chip
                  icon={React.createElement(statusConfig[overallHealth.status].icon)}
                  label={statusConfig[overallHealth.status].label}
                  color={statusConfig[overallHealth.status].color}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1">{overallHealth.environment}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1">{overallHealth.version}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="body1">{formatUptime(overallHealth.uptime)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Update
                  </Typography>
                  <Typography variant="body1">
                    {new Date(overallHealth.timestamp).toLocaleTimeString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                System Resources
              </Typography>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Memory Usage
                </Typography>
                <Typography variant="body2">
                  {formatBytes(overallHealth.system.memory.used)} / 
                  {formatBytes(overallHealth.system.memory.total)} 
                  ({overallHealth.system.memory.percentage}%)
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  CPU Time
                </Typography>
                <Typography variant="body2">
                  {overallHealth.system.cpu.usage.toFixed(2)}s
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Individual Service Health Cards */}
      <Typography variant="h5" gutterBottom>
        Service Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {renderServiceCard('database', dbHealth, serviceIcons.database)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderServiceCard('authentication', authHealth, serviceIcons.authentication)}
        </Grid>
        <Grid item xs={12} md={4}>
          {overallHealth?.services.api &&
            renderServiceCard('api', overallHealth.services.api as ServiceHealth, serviceIcons.api)}
        </Grid>
      </Grid>

      {/* Auto-refresh indicator */}
      <Box mt={3} display="flex" justifyContent="center">
        <Typography variant="caption" color="text.secondary">
          Auto-refreshing every 30 seconds
        </Typography>
      </Box>
    </Container>
  );
};
