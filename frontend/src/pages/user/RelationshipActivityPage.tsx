import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  SentimentSatisfied as SentimentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RelationshipActivity {
  relationshipId: string;
  period: {
    days: number;
    startDate: string;
  };
  totalMessages: number;
  recentMessages: number;
  dailyMetrics: Array<{
    bucketDate: string;
    messagesCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
  }>;
  emotionalDistribution: Array<{
    emotionalTone: string;
    _count: {
      emotionalTone: number;
    };
  }>;
}

interface Relationship {
  id: string;
  title: string;
  roleTemplate: {
    displayName: string;
    type: string;
  };
}

const EMOTION_COLORS: Record<string, string> = {
  POSITIVE: '#4caf50',
  NEUTRAL: '#2196f3',
  NEGATIVE: '#f44336',
  MIXED: '#ff9800',
};

export const RelationshipActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [activity, setActivity] = useState<RelationshipActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, days]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [relationshipRes, activityRes] = await Promise.all([
        axios.get<Relationship>(`/api/relationships/${id}`),
        axios.get<RelationshipActivity>(`/api/relationships/${id}/activity?days=${days}`),
      ]);

      setRelationship(relationshipRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      console.error('Error loading activity:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading activity data...
        </Typography>
      </Box>
    );
  }

  if (error || !relationship || !activity) {
    return (
      <Alert severity="error">
        {error || 'Failed to load activity data'}
      </Alert>
    );
  }

  // Prepare chart data
  const dailyData = activity.dailyMetrics.map((metric) => ({
    date: new Date(metric.bucketDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    messages: metric.messagesCount,
    positive: metric.positiveCount,
    neutral: metric.neutralCount,
    negative: metric.negativeCount,
  }));

  const emotionData = activity.emotionalDistribution.map((item) => ({
    name: item.emotionalTone,
    value: item._count.emotionalTone,
  }));

  const totalEmotions = emotionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/relationships')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {relationship.title} - Activity
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{activity.totalMessages}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{activity.recentMessages}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last {days} Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <SentimentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {totalEmotions > 0
                      ? Math.round(
                          ((emotionData.find((e) => e.name === 'POSITIVE')?.value || 0) /
                            totalEmotions) *
                            100
                        )
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Positive Tone
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <FavoriteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {activity.dailyMetrics.length > 0
                      ? Math.round(
                          activity.recentMessages / activity.dailyMetrics.length
                        )
                      : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg/Day
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Period Selector */}
      <Box display="flex" gap={1} mb={3}>
        {[7, 14, 30, 90].map((d) => (
          <Chip
            key={d}
            label={`${d} days`}
            onClick={() => setDays(d)}
            color={days === d ? 'primary' : 'default'}
            variant={days === d ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Message Activity Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Message Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#2196f3"
                  strokeWidth={2}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Emotional Tone Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Emotional Tone
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Emotional Breakdown by Day */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Emotional Breakdown by Day
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill={EMOTION_COLORS.POSITIVE} name="Positive" />
                <Bar dataKey="neutral" stackId="a" fill={EMOTION_COLORS.NEUTRAL} name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill={EMOTION_COLORS.NEGATIVE} name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
