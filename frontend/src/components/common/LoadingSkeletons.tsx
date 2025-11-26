/**
 * Loading Skeleton Components
 * Reusable skeleton screens for various content types
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Stack,
} from '@mui/material';

/**
 * Dashboard Overview Skeleton
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[1, 2, 3, 4].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Conversation List Skeleton
 */
export const ConversationListSkeleton: React.FC = () => {
  return (
    <Stack spacing={2}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Card key={item}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

/**
 * Chat Messages Skeleton
 */
export const ChatMessagesSkeleton: React.FC = () => {
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {/* User message */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Skeleton variant="rounded" width={300} height={60} />
        </Box>
      </Box>

      {/* AI message */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ maxWidth: '70%' }}>
          <Skeleton variant="rounded" width={350} height={80} />
        </Box>
      </Box>

      {/* User message */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Skeleton variant="rounded" width={250} height={50} />
        </Box>
      </Box>

      {/* AI message */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ maxWidth: '70%' }}>
          <Skeleton variant="rounded" width={400} height={100} />
        </Box>
      </Box>
    </Stack>
  );
};

/**
 * Role Cards Skeleton
 */
export const RoleCardsSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={64} height={64} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={70} height={24} />
                <Skeleton variant="rounded" width={90} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
              <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Profile Settings Skeleton
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width="60%" height={28} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mt: 1 }} />
            <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
            <Stack spacing={3}>
              <Box>
                <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={56} />
              </Box>
              <Box>
                <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={56} />
              </Box>
              <Box>
                <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={120} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Skeleton variant="rounded" width={100} height={40} />
                <Skeleton variant="rounded" width={100} height={40} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

/**
 * Table Skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="rectangular" width="5%" height={40} />
              <Skeleton variant="rectangular" width="25%" height={40} />
              <Skeleton variant="rectangular" width="35%" height={40} />
              <Skeleton variant="rectangular" width="20%" height={40} />
              <Skeleton variant="rectangular" width="15%" height={40} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Generic Card Skeleton
 */
export const CardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};
