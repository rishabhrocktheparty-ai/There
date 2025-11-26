/**
 * User Dashboard Page
 * Main overview page showing user stats, recent conversations, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as TrophyIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../providers/AuthProvider';
import { DashboardSkeleton } from '../../components/common/LoadingSkeletons';

interface DashboardStats {
  totalConversations: number;
  activeRelationships: number;
  messagesThisWeek: number;
  emotionalScore: number;
}

interface RecentConversation {
  id: string;
  roleType: string;
  roleIcon: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    activeRelationships: 0,
    messagesThisWeek: 0,
    emotionalScore: 0,
  });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalConversations: 24,
        activeRelationships: 4,
        messagesThisWeek: 87,
        emotionalScore: 85,
      });

      setRecentConversations([
        {
          id: '1',
          roleType: 'Supportive Father',
          roleIcon: '👨‍👦',
          lastMessage: "I'm proud of your progress this week!",
          timestamp: '2 hours ago',
          unreadCount: 2,
        },
        {
          id: '2',
          roleType: 'Professional Mentor',
          roleIcon: '💼',
          lastMessage: 'Let me help you prepare for that interview.',
          timestamp: '5 hours ago',
        },
        {
          id: '3',
          roleType: 'Best Friend',
          roleIcon: '🤝',
          lastMessage: 'Want to talk about what happened today?',
          timestamp: '1 day ago',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      label: 'Total Conversations',
      value: stats.totalConversations,
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light',
      change: '+12%',
    },
    {
      label: 'Active Relationships',
      value: stats.activeRelationships,
      icon: <PsychologyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light',
      change: '+2',
    },
    {
      label: 'Messages This Week',
      value: stats.messagesThisWeek,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light',
      change: '+24%',
    },
    {
      label: 'Emotional Score',
      value: `${stats.emotionalScore}%`,
      icon: <TrophyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light',
      change: '+5%',
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              You've had {stats.messagesThisWeek} conversations this week. Keep up the great work!
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/user/role-selection')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            Start New Chat
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Conversations */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Conversations
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/user/conversations')}
                >
                  View All
                </Button>
              </Box>

              <List>
                {recentConversations.map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    <ListItemButton
                      onClick={() => navigate(`/user/conversation/${conversation.id}`)}
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.light',
                            fontSize: 28,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {conversation.roleIcon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {conversation.roleType}
                            </Typography>
                            {conversation.unreadCount && (
                              <Chip
                                label={conversation.unreadCount}
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                              }}
                            >
                              {conversation.lastMessage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {conversation.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton edge="end">
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemButton>
                    {index < recentConversations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>

              {recentConversations.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ChatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No conversations yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/user/role-selection')}
                  >
                    Start Your First Chat
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Progress */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/user/role-selection')}
                >
                  New Conversation
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PsychologyIcon />}
                  onClick={() => navigate('/user/ai-insights')}
                >
                  View AI Insights
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/user/analytics')}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Weekly Progress
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Conversation Goal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    87/100
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Emotional Wellness
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    85%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={85}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Streak
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    14 days 🔥
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  textAlign: 'center',
                }}
              >
                <FavoriteIcon sx={{ color: 'success.dark', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                  You're doing amazing! Keep it up! 💪
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
