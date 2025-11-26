import { Box, Paper, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

export const TypingIndicator = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, alignItems: 'flex-start', gap: 1 }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out both`,
            animationDelay: '-0.32s',
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out both`,
            animationDelay: '-0.16s',
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out both`,
          }}
        />
      </Paper>
    </Box>
  );
};
