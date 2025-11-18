import { Grid, Paper, Typography } from '@mui/material';

export const AdminDashboardPage = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">System Overview</Typography>
          <Typography variant="body2">High-level metrics and health summary.</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Ethical Configs</Typography>
          <Typography variant="body2">Number of configs, last update, etc.</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Usage Analytics</Typography>
          <Typography variant="body2">Summary of usage statistics.</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
