import { Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const UsageStatsPage = () => {
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/analytics/usage');
      setTotalEvents(res.data.totalEvents);
    };
    load();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Total Messages / Events</Typography>
          <Typography variant="h3">{totalEvents}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
