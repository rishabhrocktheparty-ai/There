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
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SentimentVerySatisfied,
  SentimentNeutral,
  SentimentVeryDissatisfied,
  SentimentSatisfied,
} from '@mui/icons-material';
import { adminService, EmotionalConfig } from '../../services/adminService';

const getToneIcon = (tone: string) => {
  switch (tone) {
    case 'POSITIVE':
      return <SentimentVerySatisfied color="success" />;
    case 'NEUTRAL':
      return <SentimentNeutral color="action" />;
    case 'NEGATIVE':
      return <SentimentVeryDissatisfied color="error" />;
    case 'MIXED':
      return <SentimentSatisfied color="info" />;
    default:
      return <SentimentNeutral />;
  }
};

const getToneColor = (tone: string) => {
  switch (tone) {
    case 'POSITIVE':
      return 'success';
    case 'NEUTRAL':
      return 'default';
    case 'NEGATIVE':
      return 'error';
    case 'MIXED':
      return 'info';
    default:
      return 'default';
  }
};

export const EmotionalIntelligencePage: React.FC = () => {
  const [config, setConfig] = useState<EmotionalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEmotionalConfig();
      setConfig(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load emotional intelligence config');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Emotional Intelligence Tuning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor and analyze emotional tone distribution across the platform
        </Typography>
      </Box>

      {/* Total Messages */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Messages Analyzed
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {config?.totalMessages?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <PsychologyIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tone Distribution */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Current Tone Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Message sentiment breakdown across all interactions
        </Typography>

        <Grid container spacing={3}>
          {config?.toneDistribution.map((stat: any) => (
            <Grid item xs={12} sm={6} key={stat.tone}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getToneIcon(stat.tone)}
                    <Chip
                      label={stat.tone}
                      color={getToneColor(stat.tone) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {stat.count.toLocaleString()} ({stat.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stat.percentage}
                  color={getToneColor(stat.tone) as any}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Growth Trends */}
      {config?.growthMetrics && config.growthMetrics.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Growth Trends
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Message tone distribution over recent time periods
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <Box display="flex" gap={2} minWidth="600px">
              {config.growthMetrics.map((metric: any, index: number) => (
                <Box key={index} flex="1" minWidth="120px">
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {new Date(metric.bucketDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box>
                      <Typography variant="caption" color="success.main">
                        Positive: {metric.positiveCount}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(metric.positiveCount / metric.messagesCount) * 100}
                        color="success"
                        sx={{ height: 4, borderRadius: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Neutral: {metric.neutralCount}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(metric.neutralCount / metric.messagesCount) * 100}
                        sx={{ height: 4, borderRadius: 1 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="error.main">
                        Negative: {metric.negativeCount}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(metric.negativeCount / metric.messagesCount) * 100}
                        color="error"
                        sx={{ height: 4, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Total: {metric.messagesCount}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
