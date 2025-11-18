import { Button, Paper, Typography } from '@mui/material';
import axios from 'axios';

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const BackupExportPage = () => {
  const exportConfigs = async () => {
    const res = await axios.get('/api/configs');
    downloadJson('configs-backup.json', res.data);
  };

  const exportLogs = async () => {
    const res = await axios.get('/api/admin/audit-logs');
    downloadJson('audit-logs-backup.json', res.data);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Backup & Export
      </Typography>
      <Button variant="contained" sx={{ mr: 2 }} onClick={exportConfigs}>
        Export Configs
      </Button>
      <Button variant="outlined" onClick={exportLogs}>
        Export Audit Logs
      </Button>
    </Paper>
  );
};
