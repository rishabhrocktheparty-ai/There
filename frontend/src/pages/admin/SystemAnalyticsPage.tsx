import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  AdminPanelSettings as AdminIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { adminService, SystemAnalytics } from '../../services/adminService';

export const SystemAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemAnalytics(timeRange);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics');
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

  if (error || !analytics) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Failed to load analytics'}</Alert>
      </Paper>
    );
  }

  const { summary, messagesByTone, usageByType, recentAuditLogs } = analytics;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          System Analytics
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
                <PeopleIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {summary.totalUsers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.activeUsers} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
                {summary.avgMessagesPerUser.toFixed(1)} per user
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
                  Engagement
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {summary.engagementRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User engagement rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AdminIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Relationships
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {summary.totalRelationships}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.totalAdmins} admins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emotional Tone Distribution */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TimelineIcon color="primary" />
          <Typography variant="h6">Message Emotional Distribution</Typography>
        </Box>
        <Grid container spacing={2}>
          {messagesByTone.map((item) => {
            const total = messagesByTone.reduce((sum, t) => sum + t.count, 0);
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <Grid item xs={12} sm={6} md={3} key={item.tone}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.tone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count} ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Usage by Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usage Events
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {usageByType.map((event) => (
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

        {/* Recent Audit Logs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List dense sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {recentAuditLogs.slice(0, 10).map((log: any) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${log.action} - ${log.entityType}`}
                      secondary={`${log.actor?.email || 'System'} - ${new Date(log.createdAt).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
