import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, Fade, Zoom, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ApprovalIcon from '@mui/icons-material/Approval';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    budgetUtilization: 0,
    savings: 0
  });
  const [topCategories, setTopCategories] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await dashboardAPI.getOverview();
        console.log('DASHBOARD API RESPONSE:', res.data); // Debug log
        if (res.data.success) {
          if (user && user.role === 'l1_approver') {
            setStats({
              totalExpenses: res.data.data.approvalStats?.totalApprovals || 0,
              approvedThisMonth: res.data.data.approvalStats?.approvedCount || 0,
              pendingApprovals: Array.isArray(res.data.data.pendingApprovals) ? res.data.data.pendingApprovals.length : 0,
              budgetUtilization: res.data.data.budgetUtilization || 0
            });
          } else {
            // For submitter, map totalAmount to totalAmount, keep other stats as is
            setStats({
              ...res.data.data.userStats,
              totalAmount: res.data.data.userStats?.totalAmount || 0
            });
          }
          setTopCategories(res.data.data.topCategories || []);
          setRecentActivities(res.data.data.recentActivities || []);
        }
      } catch (err) {
        // handle error
      }
    }
    fetchDashboard();
    // Socket event for real-time dashboard refresh
    const socket = io("http://localhost:5001", {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.on('expense-updated', () => {
      fetchDashboard();
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Socket.IO integration (recentActivities update remains as is)
  useEffect(() => {
    const socket = io("http://localhost:5001", { 
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.on('connect', () => {
      if (user?.role) {
        socket.emit('join-role-room', `role-${user.role}`);
      }
      if (user?.site) {
        socket.emit('join-site-room', user.site);
      }
    });
    socket.on('expense-updated', (data) => {
      const newActivity = {
        id: Date.now(),
        type: data.status === 'approved' ? 'expense_approved' : 'expense_rejected',
        title: `Expense ${data.status}`,
        description: `${data.siteName} - ₹${data.amount.toLocaleString()}`,
        time: 'Just now',
        status: data.status
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    });
    socket.on('budget-alert', (data) => {
      const newActivity = {
        id: Date.now(),
        type: 'budget_alert',
        title: 'Budget Alert',
        description: `${data.siteName} - ${data.percentage}% used`,
        time: 'Just now',
        status: 'warning'
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    });
    socket.on('new-expense-submitted', (data) => {
      const newActivity = {
        id: Date.now(),
        type: 'expense_submitted',
        title: 'New Expense Submitted',
        description: `${data.siteName} - ₹${data.amount.toLocaleString()}`,
        time: 'Just now',
        status: 'pending'
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    });
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'expense_submitted': return <ReceiptIcon />;
      case 'expense_approved': return <CheckCircleIcon />;
      case 'expense_rejected': return <WarningIcon />;
      case 'budget_alert': return <NotificationsIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const quickActions = [
    {
      title: 'Submit Expense',
      description: 'Create new expense report',
      icon: <AddIcon />,
      color: '#667eea',
      action: () => navigate('/submit-expense')
    },
    {
      title: 'View Approvals',
      description: 'Check pending approvals',
      icon: <ApprovalIcon />,
      color: '#ff9800',
      action: () => navigate('/approval')
    },
    {
      title: 'Generate Report',
      description: 'Create expense reports',
      icon: <TrendingUpIcon />,
      color: '#4caf50',
      action: () => navigate('/reports')
    },
    {
      title: 'Budget Alerts',
      description: 'Manage budget alerts',
      icon: <WarningIcon />,
      color: '#f44336',
      action: () => navigate('/budget-alerts')
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
                <DashboardIcon />
              </Avatar>
            </Box>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Dashboard
            </Typography>
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
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
                    <AttachMoneyIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#667eea">
                    ₹{Number(stats.totalAmount || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount (YTD)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="#4caf50">
                      +12.5% vs last year
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Zoom in style={{ transitionDelay: '400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 2 }}>
                    <PendingIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#ff9800">
                    {Number(stats.pendingApprovals || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                  <Chip 
                    label="Action Required" 
                    size="small" 
                    sx={{ mt: 1, bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}
                  />
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Zoom in style={{ transitionDelay: '600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#4caf50">
                    {Number(stats.approvedThisMonth || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved This Month
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="#4caf50">
                      +8.3% vs last month
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Zoom in style={{ transitionDelay: '800ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ bgcolor: '#f44336', mx: 'auto', mb: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#f44336">
                    {Number(stats.budgetUtilization || 0).toLocaleString()}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Budget Utilization
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.budgetUtilization} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '1000ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                    Quick Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {quickActions.map((action, index) => (
                      <Card 
                        key={index}
                        sx={{ 
                          p: 2, 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={action.action}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: action.color, width: 40, height: 40 }}>
                            {action.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {action.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '1200ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                    Recent Activities
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {recentActivities.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar sx={{ bgcolor: getActivityColor(activity.status), width: 32, height: 32 }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={500}>
                                {activity.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {activity.time}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Zoom>
            </Grid>

            {/* Top Categories */}
            <Grid item xs={12} md={4}>
              <Zoom in style={{ transitionDelay: '1400ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" fontWeight={600} color="#667eea" gutterBottom>
                    Top Expense Categories
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {topCategories.map((category, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {category.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="#667eea">
                            ₹{category.amount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            flex: 1, 
                            height: 8, 
                            bgcolor: 'rgba(0,0,0,0.1)', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${category.percentage}%`, 
                              height: '100%', 
                              bgcolor: '#667eea',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {category.percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default Dashboard; 