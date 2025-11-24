import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  EmojiEmotions as EmojiIcon,
  Timeline as TimelineIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { profileService, UsageStats } from '../../services/profileService';

export const UsageStatsPage: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUsageStats(timeRange);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load usage statistics');
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

  if (error || !stats) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Failed to load statistics'}</Alert>
      </Paper>
    );
  }

  const { summary, emotionalDistribution, eventDistribution, recentActivity, messagesPerDay } = stats;

  // Get color for emotional tone
  const getEmotionColor = (tone: string) => {
    const lowerTone = tone.toLowerCase();
    if (lowerTone === 'positive') return 'success';
    if (lowerTone === 'negative') return 'error';
    if (lowerTone === 'mixed') return 'warning';
    return 'default';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Usage Statistics & Insights
        </Typography>
        <FormControl size="small">
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as number)}>
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <MessageIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Messages
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {summary.totalMessages.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.avgMessagesPerDay.toFixed(1)} per day
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <GroupIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Relationships
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {summary.totalRelationships}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.activeRelationships} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Activity
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {eventDistribution.reduce((sum, e) => sum + e.count, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total events
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TimelineIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Time Range
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {timeRange}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days analyzed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emotional Distribution */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <EmojiIcon color="primary" />
          <Typography variant="h6">Emotional Distribution</Typography>
        </Box>
        <Grid container spacing={2}>
          {emotionalDistribution.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.tone}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight="medium">
                    {item.tone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  color={getEmotionColor(item.tone) as any}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Messages Per Day Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Activity
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {messagesPerDay.slice(-14).map((day, index) => (
                <Box key={index} mb={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{formatDate(day.date)}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {day.count} messages
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((day.count / Math.max(...messagesPerDay.map((d) => d.count))) * 100, 100)}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List dense sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.type.replace(/_/g, ' ')}
                    secondary={new Date(activity.createdAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Event Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Breakdown
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {eventDistribution.map((event) => (
                <Chip
                  key={event.type}
                  label={`${event.type}: ${event.count}`}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Insights */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Most Active Day
            </Typography>
            <Typography variant="h6">
              {messagesPerDay.length > 0
                ? formatDate(
                    messagesPerDay.reduce((prev, curr) => (curr.count > prev.count ? curr : prev)).date
                  )
                : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Engagement Rate
            </Typography>
            <Typography variant="h6">
              {summary.totalRelationships > 0
                ? `${((summary.activeRelationships / summary.totalRelationships) * 100).toFixed(0)}%`
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
