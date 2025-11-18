import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const MonitoringLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/admin/audit-logs');
      setLogs(res.data);
    };
    load();
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Audit Logs
      </Typography>
      {logs.length === 0 ? (
        <Typography>No logs yet.</Typography>
      ) : (
        <ul>
          {logs.map((l) => (
            <li key={l.id}>
              <Typography variant="body2">
                [{l.createdAt}] {l.actorId} {l.action} {l.entityType} {l.entityId}
              </Typography>
            </li>
          ))}
        </ul>
      )}
    </Paper>
  );
};
