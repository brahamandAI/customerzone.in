import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Fade, Zoom, FormControl, InputLabel, Select, MenuItem, TextField, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import { reportAPI } from '../services/api';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSite, setSelectedSite] = useState('all');
  const [expenseData, setExpenseData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [summaryStats, setSummaryStats] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const detailsRes = await reportAPI.getExpenseDetails();
        const barRes = await reportAPI.getBarData();
        const pieRes = await reportAPI.getPieData();
        const summaryRes = await reportAPI.getExpenseSummary();
        setExpenseData(detailsRes.data.data.expenses || []);
        setBarData(barRes.data.data || []);
        setPieData(pieRes.data.data || []);
        setSummaryStats(summaryRes.data.data || []);
      } catch (err) {
        // handle error
      }
    }
    fetchReports();
  }, []);

  const handleExportExcel = () => {
    // This would generate and download Excel file with all expense data
    console.log('Exporting Excel with data:', expenseData);
    // In real implementation, you would use a library like xlsx to generate Excel file
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
        background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'pulse 15s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 }
        }
      }} />
      
      <Fade in timeout={1000}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h3" fontWeight={900} color="white" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Reports & Analytics
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Export Excel
            </Button>
          </Box>

          {/* Filters */}
          <Zoom in style={{ transitionDelay: '200ms' }}>
            <Paper elevation={16} sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 3, 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Filters:</Typography>
                </Box>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={selectedPeriod}
                    label="Period"
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Site</InputLabel>
                  <Select
                    value={selectedSite}
                    label="Site"
                    onChange={(e) => setSelectedSite(e.target.value)}
                  >
                    <MenuItem value="all">All Sites</MenuItem>
                    <MenuItem value="site1">Site A</MenuItem>
                    <MenuItem value="site2">Site B</MenuItem>
                    <MenuItem value="site3">Site C</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Date Range"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
              </Box>
            </Paper>
          </Zoom>

          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {summaryStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Zoom in style={{ transitionDelay: `${400 + index * 100}ms` }}>
                  <Card elevation={12} sx={{ 
                    borderRadius: 3, 
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Chip 
                          label={stat.change} 
                          size="small"
                          color={stat.trend === 'up' ? 'success' : 'error'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="#667eea">
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12} lg={8}>
              <Zoom in style={{ transitionDelay: '600ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Expense Trends vs Budget
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="expenses" fill="#667eea" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="budget" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Zoom>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} lg={4}>
              <Zoom in style={{ transitionDelay: '800ms' }}>
                <Paper elevation={16} sx={{ 
                  p: 4, 
                  borderRadius: 3, 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: 'fit-content'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PieChartIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600} color="#667eea">
                      Expense Categories
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    {pieData.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%', mr: 1 }} />
                        <Typography variant="body2">{item.name}: {item.value}%</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Detailed Expense Table */}
          <Zoom in style={{ transitionDelay: '1000ms' }}>
            <Paper elevation={16} sx={{ 
              p: 4, 
              borderRadius: 3, 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              mt: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TableChartIcon sx={{ color: '#667eea', mr: 2, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} color="#667eea">
                  Detailed Expense Report
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>S. No.</TableCell>
                      <TableCell>Expense Number</TableCell>
                      <TableCell>Expense Category</TableCell>
                      <TableCell>Client ID</TableCell>
                      <TableCell>Client Name</TableCell>
                      <TableCell>Expense Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Submitter Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenseData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.expenseNumber}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.clientId}</TableCell>
                        <TableCell>{row.clientName}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.submitterName}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Zoom>
        </Box>
      </Fade>
    </Box>
  );
};

export default Reports; 