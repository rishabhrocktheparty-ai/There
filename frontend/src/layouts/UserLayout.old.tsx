import { AppBar, Badge, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../providers/NotificationProvider';
import { useAuth } from '../providers/AuthProvider';

export const UserLayout = () => {
  const { t, i18n } = useTranslation();
  const { notifications } = useNotifications();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event: MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/app/relationships"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            {t('user.title')}
          </Typography>
          <IconButton size="large" color="inherit" onClick={handleNotifOpen} aria-label="notifications">
            <Badge color="secondary" badgeContent={notifications.length} max={9}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifClose} keepMounted>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <MenuItem key={n.id}>{n.message}</MenuItem>
              ))
            )}
          </Menu>
          <IconButton size="large" edge="end" color="inherit" onClick={handleMenu} aria-label="user menu">
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} keepMounted>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.displayName || user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => switchLanguage('en')}>{t('common.language.en')}</MenuItem>
            <MenuItem onClick={() => switchLanguage('es')}>{t('common.language.es')}</MenuItem>
            <MenuItem component={RouterLink} to="/app/settings" onClick={handleClose}>
              {t('user.settings')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
