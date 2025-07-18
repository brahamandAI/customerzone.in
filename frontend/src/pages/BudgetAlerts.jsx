import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Fade, Zoom, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Avatar, Alert, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const BudgetAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      site: 'Mumbai Site A',
      category: 'Fuel',
      threshold: 50000,
      current: 45000,
      percentage: 90,
      status: 'active',
      type: 'warning',
      budgetLimit: 50000,
      remainingBudget: 5000
    },
    {
      id: 2,
      site: 'Delhi Site B',
      category: 'Equipment',
      threshold: 100000,
      current: 95000,
      percentage: 95,
      status: 'active',
      type: 'critical',
      budgetLimit: 100000,
      remainingBudget: 5000
    },
    {
      id: 3,
      site: 'Bangalore Site C',
      category: 'Maintenance',
      threshold: 75000,
      current: 60000,
      percentage: 80,
      status: 'inactive',
      type: 'info',
      budgetLimit: 75000,
      remainingBudget: 15000
    }
  ]);

  // Sample site budgets from site creation
  const siteBudgets = [
    {
      site: 'Mumbai Site A',
      clientId: 'CL001',
      monthlyBudget: 200000,
      categoryBudgets: {
        'Petty': 30000,
        'Material': 50000,
        'Misc. Expense': 20000,
        'Fuel': 50000,
        'Equipment': 25000,
        'Maintenance': 15000,
        'Travel': 5000
      },
      currentUtilization: 85,
      alertThreshold: 80
    },
    {
      site: 'Delhi Site B',
      clientId: 'CL002',
      monthlyBudget: 300000,
      categoryBudgets: {
        'Petty': 40000,
        'Material': 80000,
        'Misc. Expense': 30000,
        'Fuel': 60000,
        'Equipment': 50000,
        'Maintenance': 25000,
        'Travel': 11000
      },
      currentUtilization: 92,
      alertThreshold: 80
    }
  ];

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [newAlert, setNewAlert] = useState({
    site: '',
    category: '',
    threshold: '',
    type: 'warning'
  });

  const handleAddAlert = () => {
    setEditingAlert(null);
    setNewAlert({
      site: '',
      category: '',
      threshold: '',
      type: 'warning'
    });
    setOpenDialog(true);
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setNewAlert({
      site: alert.site,
      category: alert.category,
      threshold: alert.threshold,
      type: alert.type
    });
    setOpenDialog(true);
  };

  const handleSaveAlert = () => {
    if (editingAlert) {
      setAlerts(alerts.map(alert => 
        alert.id === editingAlert.id 
          ? { ...alert, ...newAlert, threshold: Number(newAlert.threshold) }
          : alert
      ));
    } else {
      const newId = Math.max(...alerts.map(a => a.id)) + 1;
      setAlerts([...alerts, {
        id: newId,
        ...newAlert,
        threshold: Number(newAlert.threshold),
        current: 0,
        percentage: 0,
        status: 'active'
      }]);
    }
    setOpenDialog(false);
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <WarningIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <NotificationsIcon />;
      default: return <AttachMoneyIcon />;
    }
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Budget Alerts & Monitoring
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAlert}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Add Alert
            </Button>
          </Box>

          {/* Summary Cards */}
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
                  <Avatar sx={{ bgcolor: '#f44336', mx: 'auto', mb: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#f44336">
                    {alerts.filter(a => a.type === 'critical').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Alerts
                  </Typography>
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
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#ff9800">
                    {alerts.filter(a => a.type === 'warning').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Warning Alerts
                  </Typography>
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
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#4caf50">
                    ₹{alerts.reduce((sum, alert) => sum + alert.current, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
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
                  <Avatar sx={{ bgcolor: '#2196f3', mx: 'auto', mb: 2 }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="#2196f3">
                    ₹{alerts.reduce((sum, alert) => sum + alert.threshold, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Budget
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Site Budget Overview */}
          <Zoom in style={{ transitionDelay: '600ms' }}>
            <Paper elevation={16} sx={{ 
              p: 4, 
              mb: 4,
              borderRadius: 3, 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AttachMoneyIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} color="#667eea">
                  Site Budget Overview
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {siteBudgets.map((site, index) => (
                  <Grid item xs={12} md={6} key={site.site}>
                    <Card elevation={8} sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      border: site.currentUtilization > site.alertThreshold ? '2px solid #f44336' : '2px solid #4caf50',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {site.site}
                        </Typography>
                        <Chip 
                          label={`${site.currentUtilization}% Used`}
                          color={site.currentUtilization > site.alertThreshold ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Client ID: {site.clientId}
                      </Typography>
                      
                      <Typography variant="h6" fontWeight={700} color="#667eea" gutterBottom>
                        ₹{site.monthlyBudget.toLocaleString()} / Month
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Category Budgets:
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.entries(site.categoryBudgets).map(([category, budget]) => (
                            <Grid item xs={6} key={category}>
                              <Box sx={{ 
                                p: 1, 
                                bgcolor: 'rgba(102, 126, 234, 0.1)', 
                                borderRadius: 1,
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                              }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {category}
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  ₹{budget.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Alert Threshold: {site.alertThreshold}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {site.currentUtilization > site.alertThreshold ? '⚠️ Alert Active' : '✅ Within Budget'}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Zoom>

          {/* Alerts Table */}
          <Paper elevation={16} sx={{ 
            borderRadius: 3, 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(103, 126, 234, 0.1)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Site</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Threshold</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Current</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: getAlertColor(alert.type), mr: 2, width: 32, height: 32 }}>
                            {getAlertIcon(alert.type)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {alert.site}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={alert.category} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(103, 126, 234, 0.1)', color: '#667eea' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          ₹{alert.threshold.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          ₹{alert.current.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 8, 
                            bgcolor: 'rgba(0,0,0,0.1)', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${alert.percentage}%`, 
                              height: '100%', 
                              bgcolor: getAlertColor(alert.type),
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {alert.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={alert.status} 
                          size="small"
                          color={alert.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditAlert(alert)}
                            sx={{ color: '#667eea' }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteAlert(alert.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Fade>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAlert ? 'Edit Budget Alert' : 'Add New Budget Alert'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Site"
              value={newAlert.site}
              onChange={(e) => setNewAlert({...newAlert, site: e.target.value})}
              fullWidth
            />
            <TextField
              label="Category"
              value={newAlert.category}
              onChange={(e) => setNewAlert({...newAlert, category: e.target.value})}
              fullWidth
            />
            <TextField
              label="Threshold Amount (₹)"
              type="number"
              value={newAlert.threshold}
              onChange={(e) => setNewAlert({...newAlert, threshold: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={newAlert.type}
                label="Alert Type"
                onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAlert} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetAlerts; 