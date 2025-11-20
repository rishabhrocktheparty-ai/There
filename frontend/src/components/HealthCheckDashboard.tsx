import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Memory as MemoryIcon
} from '@mui/icons-material';

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: any;
  responseTime?: number;
}

export interface HealthCheckData {
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

const HealthCheckDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HealthCheckData = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch health status: ${errorMessage}`);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      interval = setInterval(checkHealth, 10000); // 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, checkHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'degraded':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'unhealthy':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatBytes = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const renderServiceCard = (name: string, icon: React.ReactNode, service: ServiceStatus) => (
    <Accordion key={name} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {icon}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {name}
          </Typography>
          <Chip
            icon={getStatusIcon(service.status)}
            label={service.status.toUpperCase()}
            color={getStatusColor(service.status)}
            size="small"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {service.message || 'No message available'}
          </Typography>
          
          {service.responseTime && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Response time: {service.responseTime}ms
            </Typography>
          )}

          {service.details && (
            <Paper
              variant="outlined"
              sx={{ mt: 2, p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}
            >
              <Typography variant="caption" component="pre" sx={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(service.details, null, 2)}
              </Typography>
            </Paper>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const clearData = () => {
    setHealthData(null);
    setLastUpdated(null);
    setError(null);
  };

  if (loading && !healthData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          🏥 System Health Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time monitoring of backend services
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={checkHealth}
          disabled={loading}
        >
          Refresh Status
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={clearData}
        >
          Clear
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          }
          label="Auto-refresh (10s)"
          sx={{ ml: 'auto' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {healthData && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {getStatusIcon(healthData.status)}
                <Typography variant="h5" sx={{ ml: 2, flexGrow: 1 }}>
                  System Status
                </Typography>
                <Chip
                  label={healthData.status.toUpperCase()}
                  color={getStatusColor(healthData.status)}
                  size="medium"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Environment
                    </Typography>
                    <Typography variant="h6">{healthData.environment}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Uptime
                    </Typography>
                    <Typography variant="h6">{formatUptime(healthData.uptime)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="h6">{healthData.version}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="h6">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                🔧 Services
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {renderServiceCard('Database', <StorageIcon />, healthData.services.database)}
              {renderServiceCard('Authentication', <SecurityIcon />, healthData.services.authentication)}
              {renderServiceCard('API Routes', <ApiIcon />, healthData.services.api)}
              {healthData.services.cache && 
                renderServiceCard('Cache (Redis)', <MemoryIcon />, healthData.services.cache)}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                📊 System Metrics
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {healthData.system.memory.percentage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={healthData.system.memory.percentage}
                      sx={{ mb: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatBytes(healthData.system.memory.used)} / {formatBytes(healthData.system.memory.total)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CPU Usage
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {healthData.system.cpu.usage.toFixed(2)}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User CPU time
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {lastUpdated && (
            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default HealthCheckDashboard;
