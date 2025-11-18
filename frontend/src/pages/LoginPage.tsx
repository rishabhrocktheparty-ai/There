import { Box, Button, Container, Tab, Tabs, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginPage = () => {
  const { loginAdmin, loginUserSocial } = useAuth();
  const [tab, setTab] = useState<'admin' | 'user'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'admin') {
        await loginAdmin(email, password);
        navigate('/admin/dashboard');
      } else {
        await loginUserSocial('google');
        const redirectTo = location.state?.from?.pathname || '/app/relationships';
        navigate(redirectTo);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        There Portal Login
      </Typography>
      <Tabs
        value={tab}
        onChange={(_e, val) => setTab(val)}
        aria-label="login mode"
        sx={{ mb: 2 }}
      >
        <Tab label="Admin" value="admin" />
        <Tab label="User" value="user" />
      </Tabs>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {tab === 'admin' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}
        {tab === 'user' && (
          <Typography variant="body2" sx={{ my: 2 }}>
            User login is simulated with a stub Google sign-in.
          </Typography>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Signing in...' : tab === 'admin' ? 'Sign in as Admin' : 'Continue as User'}
        </Button>
      </Box>
    </Container>
  );
};
