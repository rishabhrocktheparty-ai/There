import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import onboardingService, { OnboardingProgress } from '../../services/onboardingService';

interface ProgressTrackerProps {
  onStepClick?: (stepId: string) => void;
  refreshTrigger?: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  onStepClick,
  refreshTrigger = 0,
}) => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [refreshTrigger]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getProgress();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={2}>
            <Typography variant="body2" color="text.secondary">
              Loading progress...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (progress.isComplete) {
    return (
      <Card sx={{ bgcolor: 'success.light' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CelebrationIcon sx={{ fontSize: 40, color: 'success.main' }} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                Onboarding Complete! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You've completed all the steps. Enjoy your experience!
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              Getting Started
            </Typography>
            <Chip
              label={`${progress.completionPercentage}%`}
              size="small"
              color="primary"
            />
          </Box>
          <Box>
            <IconButton size="small" onClick={loadProgress}>
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={progress.completionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {progress.steps.filter((s) => s.completed).length} of {progress.steps.length} steps
            completed
          </Typography>
        </Box>

        <Collapse in={expanded}>
          <List dense>
            {progress.steps.map((step) => (
              <ListItem
                key={step.id}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: step.completed ? 'action.hover' : 'transparent',
                  cursor: onStepClick && !step.completed ? 'pointer' : 'default',
                  '&:hover': {
                    bgcolor: !step.completed ? 'action.hover' : undefined,
                  },
                }}
                onClick={() => !step.completed && onStepClick?.(step.id)}
              >
                <ListItemIcon>
                  {step.completed ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <UncheckedIcon color="disabled" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={step.name}
                  secondary={
                    step.completed && step.completedAt
                      ? `Completed ${new Date(step.completedAt).toLocaleDateString()}`
                      : progress.currentStep === step.id
                      ? 'Current step'
                      : null
                  }
                  primaryTypographyProps={{
                    sx: {
                      textDecoration: step.completed ? 'line-through' : 'none',
                      fontWeight: progress.currentStep === step.id ? 'bold' : 'normal',
                    },
                  }}
                />
                {progress.currentStep === step.id && (
                  <Chip label="Next" size="small" color="primary" variant="outlined" />
                )}
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};
