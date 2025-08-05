import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Divider, Chip } from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ApprovalIcon from '@mui/icons-material/Approval';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getUserRole, hasPermission, getRoleDisplayName } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  // Role-based navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', show: true },
    { label: 'Submit Expense', path: '/submit-expense', show: user && ['submitter', 'SUBMITTER'].includes(user?.role) },
    { label: 'Reports', path: '/reports', show: user && !['submitter', 'SUBMITTER'].includes(user?.role) },
    // Show Approvals for L1, L2, and L3 approvers (but not submitters)
    { label: (user?.role?.toLowerCase() === 'finance') ? 'Payment Processing' : 'Approvals', path: '/approval', show: user && !['submitter', 'SUBMITTER'].includes(user?.role) },
    // L2 and L3 approvers can see admin panel (but not Finance)
    { label: 'Admin', path: '/admin', show: hasPermission('l2_approver') && user?.role?.toLowerCase() !== 'finance' },
  ].filter(item => item.show);

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(45deg, #004D4D 30%, #006666 90%)',
      boxShadow: '0 4px 20px rgba(0, 77, 77, 0.4)',
      color: 'white'
    }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/rakshak-logo.png" 
            alt="Rakshak Securitas Logo"
            style={{
              width: 40,
              height: 40,
              marginRight: 12,
              filter: 'brightness(0) invert(1)'
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1 }}>
            Rakshak Securitas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {navItems.map(item => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{
                fontWeight: location.pathname === item.path ? 800 : 500,
                position: 'relative',
                color: '#fff',
                fontSize: 16,
                px: 2,
                '&:after': location.pathname === item.path ? {
                  content: '""',
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  bottom: 2,
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #ffeb3b 0%, #43a047 100%)',
                  transition: 'all 0.3s',
                } : {},
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }
              }}
            >
              {item.label}
            </Button>
          ))}
          <NotificationBell />
          <Button onClick={handleMenu} sx={{ ml: 1, color: '#fff', textTransform: 'none', fontWeight: 700, fontSize: 16 }}>
            <Avatar sx={{ bgcolor: '#fff', color: '#004D4D', width: 36, height: 36, mr: 1 }}>
              <AccountCircleIcon fontSize="large" />
            </Avatar>
            {user?.name || 'User'}
            <Chip 
              label={getRoleDisplayName(user?.role)} 
              size="small" 
              sx={{ 
                ml: 1, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }} 
            />
          </Button>
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.name || 'User'}</Typography>
                <Typography variant="caption" color="text.secondary">{getRoleDisplayName(user?.role)}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
              <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#f44336' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 