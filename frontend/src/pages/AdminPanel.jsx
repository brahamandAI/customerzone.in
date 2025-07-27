import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, Fade, Zoom, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { userAPI, siteAPI, categoryAPI, approvalAPI } from '../services/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalCategories: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const [usersRes, sitesRes, catsRes, approvalsRes] = await Promise.allSettled([
          userAPI.getUsers(),
          siteAPI.getAll(),
          categoryAPI.getAll(),
          approvalAPI.getPending()
        ]);

        setStats({
          totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.data.length : 0,
          totalSites: sitesRes.status === 'fulfilled' ? sitesRes.value.data.data.length : 0,
          totalCategories: catsRes.status === 'fulfilled' ? catsRes.value.data.data.length : 0,
          activeUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.data.filter(u => u.status === 'active').length : 0,
          pendingApprovals: approvalsRes.status === 'fulfilled' ? approvalsRes.value.data.data.length : 0,
          systemHealth: 100 // or fetch from backend if available
        });
        
        if (usersRes.status === 'fulfilled') {
          const users = usersRes.value.data.data;
          console.log('Users data structure:', users);
          setRecentUsers(users.slice(0, 5)); // latest 5 users
        } else {
          setRecentUsers([]);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        // Set default values to prevent crashes
        setStats({
          totalUsers: 0,
          totalSites: 0,
          totalCategories: 0,
          activeUsers: 0,
          pendingApprovals: 0,
          systemHealth: 100
        });
        setRecentUsers([]);
      }
    }
    fetchAdminStats();
  }, []);

  const adminActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, and manage user accounts',
      icon: <PeopleIcon />,
      color: '#667eea',
      action: () => navigate('/manage-users')
    },
    {
      title: 'Manage Sites',
      description: 'Create and configure sites',
      icon: <BusinessIcon />,
      color: '#4caf50',
      action: () => navigate('/create-site')
    },
    {
      title: 'Manage Categories',
      description: 'Configure expense categories',
      icon: <CategoryIcon />,
      color: '#ff9800',
      action: () => navigate('/create-category')
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: <SettingsIcon />,
      color: '#2196f3',
      action: () => navigate('/settings')
    },
    {
      title: 'Security & Permissions',
      description: 'Manage access controls',
      icon: <SecurityIcon />,
      color: '#f44336',
      action: () => console.log('Security clicked')
    },
    {
      title: 'Analytics & Reports',
      description: 'View system analytics',
      icon: <AnalyticsIcon />,
      color: '#9c27b0',
      action: () => navigate('/reports')
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #008080 0%, #20B2AA 100%)',
      p: 4,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img 
                src="/rakshak-logo.png" 
                alt="Rakshak Securitas Logo" 
                style={{ height: '40px' }}
              />
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AdminPanelSettingsIcon />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Admin Panel
            </Typography>
          </Box>

          {/* System Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '200ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#667eea', mx: 'auto', mb: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#667eea">
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#4caf50">
                    {stats.totalSites}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sites
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 2 }}>
                    <CategoryIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#ff9800">
                    {stats.totalCategories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categories
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '800ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#2196f3', mx: 'auto', mb: 2 }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#2196f3">
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '1000ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#4caf50">
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Zoom in style={{ transitionDelay: '1200ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', mx: 'auto', mb: 2 }}>
                    <AnalyticsIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#9c27b0">
                    {stats.systemHealth}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Health
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Admin Actions */}
            <Grid item xs={12} md={8}>
              <Zoom in style={{ transitionDelay: '1400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                    Administrative Actions
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {adminActions.map((action, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card 
                          sx={{ 
                            p: 3, 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: 8
                            }
                          }}
                          onClick={action.action}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: action.color }}>
                              {action.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {action.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {action.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Zoom>
            </Grid>

            {/* Recent Users */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '1600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                    Recent Users
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {recentUsers && recentUsers.length > 0 ? (
                      recentUsers.map((user, index) => (
                        <React.Fragment key={user._id || user.id || index}>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Avatar sx={{ bgcolor: user.status === 'active' ? '#4caf50' : '#f44336', width: 32, height: 32 }}>
                                <PeopleIcon />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={500}>
                                  {user.name || user.fullName || 'Unknown User'}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.role} • {user.site?.name || user.site || 'No Site'}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    Last login: {user.lastLogin || 'Never'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Chip 
                              label={user.status || 'unknown'} 
                              size="small"
                              color={user.status === 'active' ? 'success' : 'error'}
                            />
                          </ListItem>
                          {index < recentUsers.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              No recent users found
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default AdminPanel; 