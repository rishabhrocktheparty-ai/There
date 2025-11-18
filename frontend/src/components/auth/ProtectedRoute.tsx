import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute = ({ children, requireAdmin }: { children: ReactNode; requireAdmin?: boolean }) => {
  const { token, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && role !== 'super_admin' && role !== 'config_manager' && role !== 'viewer') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
