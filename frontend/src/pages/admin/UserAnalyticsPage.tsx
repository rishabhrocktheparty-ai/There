import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const UserAnalyticsPage = () => {
  const [totalEvents, setTotalEvents] = useState(0);
  const [byUser, setByUser] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const total = await axios.get('/api/analytics/usage');
      const perUser = await axios.get('/api/analytics/usage/by-user');
      setTotalEvents(total.data.totalEvents);
      setByUser(perUser.data);
    };
    load();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Total Usage Events</Typography>
          <Typography variant="h3">{totalEvents}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Events by User</Typography>
          {Object.keys(byUser).length === 0 ? (
            <Typography>No events yet.</Typography>
          ) : (
            <ul>
              {Object.entries(byUser).map(([userId, count]) => (
                <li key={userId}>
                  {userId}: {count}
                </li>
              ))}
            </ul>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
