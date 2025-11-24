import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Favorite as FavoriteIcon,
  BarChart as BarChartIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { UserProfilePage } from './UserProfilePage';
import { NotificationSettingsPage } from './NotificationSettingsPage';
import { PrivacySettingsPage } from './PrivacySettingsPage';
import { RelationshipPreferencesPage } from './RelationshipPreferencesPage';
import { UsageStatsPage } from './UsageStatsPage';

type SettingsSection =
  | 'profile'
  | 'notifications'
  | 'privacy'
  | 'relationships'
  | 'usage';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const settingsSections = [
    {
      id: 'profile' as SettingsSection,
      title: 'User Profile',
      description: 'Manage your personal information',
      icon: <PersonIcon />,
      component: <UserProfilePage />,
    },
    {
      id: 'relationships' as SettingsSection,
      title: 'Relationship Preferences',
      description: 'Customize AI relationships',
      icon: <FavoriteIcon />,
      component: <RelationshipPreferencesPage />,
    },
    {
      id: 'notifications' as SettingsSection,
      title: 'Notifications',
      description: 'Control notification settings',
      icon: <NotificationsIcon />,
      component: <NotificationSettingsPage />,
    },
    {
      id: 'privacy' as SettingsSection,
      title: 'Privacy & Data',
      description: 'Manage privacy and data controls',
      icon: <SecurityIcon />,
      component: <PrivacySettingsPage />,
    },
    {
      id: 'usage' as SettingsSection,
      title: 'Usage Statistics',
      description: 'View your activity insights',
      icon: <BarChartIcon />,
      component: <UsageStatsPage />,
    },
  ];

  const activeComponent = settingsSections.find((s) => s.id === activeSection)?.component;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings & Preferences
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account, preferences, and privacy settings
      </Typography>

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ position: 'sticky', top: 20 }}>
            <List component="nav">
              {settingsSections.map((section) => (
                <React.Fragment key={section.id}>
                  <ListItemButton
                    selected={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <ListItemIcon>{section.icon}</ListItemIcon>
                    <ListItemText
                      primary={section.title}
                      secondary={section.description}
                      primaryTypographyProps={{ fontWeight: activeSection === section.id ? 'bold' : 'normal' }}
                    />
                    <ChevronRightIcon />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Settings Content */}
        <Grid item xs={12} md={9}>
          {activeComponent}
        </Grid>
      </Grid>
    </Box>
  );
};
