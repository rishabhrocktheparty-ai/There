import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen = ({ message = 'Loading...', fullScreen = false }: LoadingScreenProps) => {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullScreen ? '100vh' : '400px',
          gap: 3,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              position: 'absolute',
              color: 'primary.main',
            }}
          />
          <CircularProgress
            size={100}
            thickness={2}
            sx={{
              position: 'absolute',
              color: 'secondary.main',
              animationDuration: '2s',
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export const LoadingSpinner = ({ size = 40, message }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export const InlineLoader = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={16} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};
