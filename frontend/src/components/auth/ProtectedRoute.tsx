import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { CircularProgress, Box, Typography } from '@mui/material';

export const ProtectedRoute = ({ children, requireAdmin }: { children: ReactNode; requireAdmin?: boolean }) => {
  const { token, role, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (requireAdmin) {
    const isAdmin = user?.isAdmin || 
                   role === 'SUPER_ADMIN' || 
                   role === 'super_admin' || 
                   role === 'CONFIG_MANAGER' ||
                   role === 'config_manager' || 
                   role === 'VIEWER' ||
                   role === 'viewer';
    
    if (!isAdmin) {
      return <Navigate to="/app/relationships" replace />;
    }
  }

  return <>{children}</>;
};
