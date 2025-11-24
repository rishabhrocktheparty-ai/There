import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  WavingHand as WavingIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import onboardingService from '../../services/onboardingService';

interface WelcomeTutorialProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: <WavingIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Welcome to There!',
    description:
      'Create meaningful AI relationships that provide emotional support, guidance, and companionship. Let us show you around.',
    tips: [
      'Connect with AI companions in various roles',
      'Have meaningful conversations anytime',
      'Receive personalized guidance and support',
    ],
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 60, color: 'success.main' }} />,
    title: 'Choose Your Role',
    description:
      'Select the type of relationship that fits your needs. Each role offers a unique personality and communication style.',
    tips: [
      'Father/Mother figures for life advice',
      'Mentors for professional guidance',
      'Friends for casual conversations',
      'Or create a custom role',
    ],
  },
  {
    icon: <PersonIcon sx={{ fontSize: 60, color: 'info.main' }} />,
    title: 'Personalize Your Profile',
    description:
      'Set up your profile with preferences that help us provide the best experience tailored to you.',
    tips: [
      'Choose your preferred language',
      'Set your timezone',
      'Customize notification preferences',
      'Configure privacy settings',
    ],
  },
  {
    icon: <ChatIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
    title: 'Start Conversations',
    description:
      'Begin meaningful dialogues with your AI companions. They remember your conversations and grow with you.',
    tips: [
      'Use conversation starters for inspiration',
      'Share your thoughts and feelings openly',
      'Ask for advice or just chat',
      'Your conversations are private and secure',
    ],
  },
  {
    icon: <SettingsIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
    title: 'Customize Your Experience',
    description:
      'Fine-tune how your AI companions interact with you through advanced settings and preferences.',
    tips: [
      'Adjust communication style and formality',
      'Set cultural adaptation preferences',
      'Control message retention',
      'Manage relationship dynamics',
    ],
  },
  {
    icon: <CelebrationIcon sx={{ fontSize: 60, color: 'success.main' }} />,
    title: "You're All Set!",
    description:
      "You're ready to start building meaningful AI relationships. Create your first companion and begin your journey.",
    tips: [
      'Create your first relationship',
      'Send a message to get started',
      'Explore all features at your own pace',
      'We are here to support you',
    ],
  },
];

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const isLastStep = activeStep === tutorialSteps.length - 1;
  const currentStepData = tutorialSteps[activeStep];

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await onboardingService.completeStep('welcome');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing tutorial:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await onboardingService.skipStep('welcome');
      onClose();
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '600px' },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Getting Started
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress */}
          <Box sx={{ px: 3, pt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {tutorialSteps.map((step, index) => (
                <Step key={index}>
                  <StepLabel />
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={((activeStep + 1) / tutorialSteps.length) * 100}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Step {activeStep + 1} of {tutorialSteps.length}
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4, minHeight: '350px' }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <Box mb={3}>{currentStepData.icon}</Box>

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {currentStepData.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
                {currentStepData.description}
              </Typography>

              <Card sx={{ mt: 3, maxWidth: 500, width: '100%' }} variant="outlined">
                <CardContent>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {currentStepData.tips.map((tip, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1.5}>
                        <CheckIcon color="success" fontSize="small" />
                        <Typography variant="body2" textAlign="left">
                          {tip}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button onClick={handleSkip} color="inherit">
              Skip Tutorial
            </Button>

            <Box display="flex" gap={2}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={isLastStep ? <CheckIcon /> : <ArrowForwardIcon />}
                disabled={completing}
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
