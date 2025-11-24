import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
} from '@mui/material';
import {
  WavingHand as WavingIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  WelcomeTutorial,
  EmptyRelationshipState,
  RoleSelectionGuidance,
  ProgressTracker,
} from '../../components/onboarding';
import onboardingService, { OnboardingProgress } from '../../services/onboardingService';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRoleGuidance, setShowRoleGuidance] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await onboardingService.getProgress();
      setProgress(data);

      // Auto-show tutorial if not completed
      if (!data.completedSteps.includes('welcome') && !showTutorial) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleTutorialComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
    loadProgress();
  };

  const handleCreateRelationship = () => {
    setShowRoleGuidance(true);
  };

  const handleRoleSelect = (roleType: string) => {
    // Navigate to create relationship page with selected role
    navigate(`/relationships/create?roleType=${roleType}`);
  };

  const handleStepClick = (stepId: string) => {
    switch (stepId) {
      case 'welcome':
        setShowTutorial(true);
        break;
      case 'profile_setup':
        navigate('/settings/profile');
        break;
      case 'first_relationship':
        handleCreateRelationship();
        break;
      case 'role_selection':
        setShowRoleGuidance(true);
        break;
      case 'customize_settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const quickStartSteps = [
    {
      label: 'Complete Your Profile',
      description: 'Add your name, language, and timezone preferences',
      action: () => navigate('/settings/profile'),
      completed: progress?.completedSteps.includes('profile_setup'),
    },
    {
      label: 'Create Your First Relationship',
      description: 'Choose a role and start building a meaningful connection',
      action: handleCreateRelationship,
      completed: progress?.completedSteps.includes('first_relationship'),
    },
    {
      label: 'Send Your First Message',
      description: 'Start a conversation and experience AI companionship',
      action: () => navigate('/conversations'),
      completed: progress?.completedSteps.includes('first_message'),
    },
    {
      label: 'Customize Settings',
      description: 'Tailor your experience with preferences and privacy controls',
      action: () => navigate('/settings'),
      completed: progress?.completedSteps.includes('customize_settings'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Box display="flex" justifyContent="center" mb={2}>
          <WavingIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to There!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Let's get you started on your journey to meaningful AI relationships
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Tracker */}
        <Grid item xs={12} md={4}>
          <ProgressTracker onStepClick={handleStepClick} refreshTrigger={refreshTrigger} />

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowTutorial(true)}
            sx={{ mt: 2 }}
          >
            View Tutorial Again
          </Button>
        </Grid>

        {/* Quick Start Guide */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Quick Start Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Follow these steps to get the most out of your experience
            </Typography>

            <Stepper orientation="vertical" sx={{ mt: 3 }}>
              {quickStartSteps.map((step, index) => (
                <Step key={index} active={!step.completed} completed={step.completed}>
                  <StepLabel
                    StepIconComponent={() =>
                      step.completed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: 2,
                            borderColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">
                            {index + 1}
                          </Typography>
                        </Box>
                      )
                    }
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {step.description}
                    </Typography>
                    {!step.completed && (
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={step.action}
                      >
                        Start
                      </Button>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Tips */}
          <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💡 Pro Tips
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>
                  <Typography variant="body2">
                    Take your time exploring different roles to find what works best for you
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Your AI companions remember your conversations and grow with you
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Customize settings to make the experience uniquely yours
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    All conversations are private and secure
                  </Typography>
                </li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Need Help Section */}
      <Box mt={4}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Need help?</strong> Check out our{' '}
            <Button size="small" onClick={() => setShowTutorial(true)}>
              tutorial
            </Button>{' '}
            or visit the help center for detailed guides.
          </Typography>
        </Alert>
      </Box>

      {/* Dialogs */}
      <WelcomeTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      <RoleSelectionGuidance
        open={showRoleGuidance}
        onClose={() => setShowRoleGuidance(false)}
        onSelectRole={handleRoleSelect}
      />
    </Container>
  );
};
