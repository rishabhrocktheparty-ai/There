import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Collapse,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: any;
  responseTime?: number;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceStatus;
    authentication: ServiceStatus;
    api: ServiceStatus;
    cache?: ServiceStatus;
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
  },
  degraded: {
    icon: WarningIcon,
    color: 'warning' as const,
    label: 'Degraded',
  },
  unhealthy: {
    icon: ErrorIcon,
    color: 'error' as const,
    label: 'Unhealthy',
  },
};

export const HealthStatus = () => {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      setError(null);
      const response = await axios.get<HealthCheckResponse>('/api/health');
      setHealthData(response.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(axios.isAxiosError(err) ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon color={config.color} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!healthData) return null;

  const overallStatus = statusConfig[healthData.status];

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">System Health</Typography>
            <Chip
              icon={getStatusIcon(healthData.status)}
              label={overallStatus.label}
              color={overallStatus.color}
              size="small"
            />
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => {
                setLoading(true);
                fetchHealthStatus();
              }}
              title="Refresh"
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Overview */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Environment
            </Typography>
            <Typography variant="body2">{healthData.environment}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Uptime
            </Typography>
            <Typography variant="body2">{formatUptime(healthData.uptime)}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Version
            </Typography>
            <Typography variant="body2">{healthData.version}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Memory
            </Typography>
            <Typography variant="body2">{healthData.system.memory.percentage}%</Typography>
          </Grid>
        </Grid>

        {/* Services Status */}
        <Typography variant="subtitle2" gutterBottom>
          Services
        </Typography>
        <Grid container spacing={1} mb={2}>
          {Object.entries(healthData.services).map(([name, service]) => (
            <Grid item xs={6} sm={3} key={name}>
              <Box display="flex" alignItems="center" gap={0.5}>
                {getStatusIcon(service.status)}
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {name}
                </Typography>
              </Box>
              {service.responseTime && (
                <Typography variant="caption" color="text.secondary">
                  {service.responseTime}ms
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>

        {/* Detailed Information */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              System Details
            </Typography>
            
            {/* Memory Details */}
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary">
                Memory Usage
              </Typography>
              <Typography variant="body2">
                Used: {formatBytes(healthData.system.memory.used)} / 
                Total: {formatBytes(healthData.system.memory.total)} 
                ({healthData.system.memory.percentage}%)
              </Typography>
            </Box>

            {/* Service Details */}
            {Object.entries(healthData.services).map(([name, service]) => (
              <Box key={name} mb={2}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {name} Service
                </Typography>
                <Typography variant="body2">{service.message}</Typography>
                {service.details && (
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 0.5,
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(service.details, null, 2)}
                  </Typography>
                )}
              </Box>
            ))}

            <Typography variant="caption" color="text.secondary">
              Last Updated: {new Date(healthData.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
