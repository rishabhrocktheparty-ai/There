import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Psychology as PsychologyIcon,
  EmojiPeople as EmojiPeopleIcon,
} from '@mui/icons-material';

interface EmptyRelationshipStateProps {
  onCreateRelationship: () => void;
}

export const EmptyRelationshipState: React.FC<EmptyRelationshipStateProps> = ({
  onCreateRelationship,
}) => {
  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI Companions',
      description: 'Create relationships with AI that understand and support you',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Meaningful Conversations',
      description: 'Have deep, meaningful dialogues that help you grow',
    },
    {
      icon: <EmojiPeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'Various Roles',
      description: 'Choose from mentors, friends, family figures, and more',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          maxWidth: 800,
          width: '100%',
          textAlign: 'center',
          bgcolor: 'background.default',
          border: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: 3,
        }}
      >
        {/* Main Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            p: 3,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            mb: 3,
          }}
        >
          <PeopleIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>

        {/* Heading */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Start Your First AI Relationship
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Create meaningful connections with AI companions who are here to support, guide, and
          understand you. Choose a role that fits your needs and start your journey.
        </Typography>

        {/* Features */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    {feature.icon}
                    <Typography variant="h6" fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onCreateRelationship}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Create Your First Relationship
        </Button>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          It only takes a minute to get started
        </Typography>
      </Paper>
    </Box>
  );
};
