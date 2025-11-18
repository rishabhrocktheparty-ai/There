import { Box, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import { useState } from 'react';

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Settings & Preferences
      </Typography>
      <Box>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode((d) => !d)} />}
          label="Dark mode (local only demo)"
        />
      </Box>
      <Box>
        <FormControlLabel
          control={<Switch checked={notifications} onChange={() => setNotifications((n) => !n)} />}
          label="Enable notifications (UI demo)"
        />
      </Box>
    </Paper>
  );
};
