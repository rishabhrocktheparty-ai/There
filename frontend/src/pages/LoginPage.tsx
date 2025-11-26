import { Box, Button, Container, Tab, Tabs, TextField, Typography, Alert, Paper, Fade, Zoom, Divider } from '@mui/material';
import { LockOutlined, PersonOutline, AdminPanelSettings } from '@mui/icons-material';
import { FormEvent, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginPage = () => {
  const { loginAdmin, loginUser, loginUserSocial } = useAuth();
  const [tab, setTab] = useState<'admin' | 'user'>('user');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
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
        if (mode === 'login') {
          await loginUser(email, password);
        } else {
          // For registration, you'd need to implement registerUser
          await loginUser(email, password);
        }
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={10}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Zoom in timeout={600}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h3" gutterBottom fontWeight={700} sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to There Portal
                </Typography>
              </Box>
            </Zoom>
            
            <Tabs
              value={tab}
              onChange={(_e, val) => setTab(val)}
              aria-label="login mode"
              sx={{
                mb: 3,
                '& .MuiTab-root': {
                  flex: 1,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
              variant="fullWidth"
            >
              <Tab 
                icon={<PersonOutline />} 
                iconPosition="start"
                label="User" 
                value="user" 
              />
              <Tab 
                icon={<AdminPanelSettings />}
                iconPosition="start"
                label="Admin" 
                value="admin" 
              />
            </Tabs>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
        {tab === 'user' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="user@there.ai"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="Enter your password"
            />
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Test Credentials:</strong>
              </Typography>
              <Typography variant="caption" display="block">
                Email: user@there.ai
              </Typography>
              <Typography variant="caption" display="block">
                Password: User123!
              </Typography>
            </Box>
          </>
        )}
        
        {tab === 'admin' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@there.ai"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Admin Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter admin password"
            />
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Admin Test Credentials:</strong>
              </Typography>
              <Typography variant="caption" display="block">
                Email: admin@there.ai
              </Typography>
              <Typography variant="caption" display="block">
                Password: Admin123!
              </Typography>
            </Box>
          </>
        )}
        
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          size="large"
          sx={{ 
            mt: 3,
            py: 1.5,
            fontSize: '1.1rem',
          }} 
          disabled={loading || !email || !password}
        >
          {loading ? 'Signing in...' : tab === 'admin' ? 'Sign in as Admin' : 'Sign in'}
        </Button>
        
        {tab === 'user' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>
            <Button 
              variant="outlined" 
              fullWidth 
              size="large"
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await loginUserSocial('google');
                  const redirectTo = location.state?.from?.pathname || '/app/relationships';
                  navigate(redirectTo);
                } catch (err: any) {
                  setError(err?.response?.data?.error || 'Social login failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Continue with Google (Demo)
            </Button>
          </Box>
        )}
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};
