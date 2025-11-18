import { Card, CardContent, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const RelationshipsPage = () => {
  const [relationships, setRelationships] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/relationships');
      setRelationships(res.data);
    };
    load();
  }, []);

  return (
    <Grid container spacing={2}>
      {relationships.map((r) => (
        <Grid item xs={12} md={4} key={r.id}>
          <Card onClick={() => navigate(`/app/relationships/${r.id}/chat`)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Relationship {r.id.slice(0, 6)}</Typography>
              <Typography variant="body2">Persona: {r.roleTemplateId}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {relationships.length === 0 && (
        <Typography>No relationships yet. Start by picking a role.</Typography>
      )}
    </Grid>
  );
};
