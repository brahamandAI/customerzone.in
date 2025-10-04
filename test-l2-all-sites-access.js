const axios = require('axios');

// Test L2 Approver All Sites Access
async function testL2AllSitesAccess() {
  console.log('🧪 Testing L2 Approver All Sites Access...\n');
  
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // 1. Login as L2 Approver
    console.log('1️⃣ Logging in as L2 Approver...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@rakshaksecuritas.com',
      password: 'Rakshak@123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as: ${user.name} (${user.role})`);
    console.log(`📍 Assigned Site: ${user.site?.name || 'None'}\n`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Test Dashboard Overview
    console.log('2️⃣ Testing Dashboard Overview...');
    const dashboardResponse = await axios.get(`${baseURL}/dashboard/overview`, { headers });
    const dashboardData = dashboardResponse.data.data;
    
    console.log(`📊 Recent Activities Count: ${dashboardData.recentActivities?.length || 0}`);
    console.log(`📊 Top Categories Count: ${dashboardData.topCategories?.length || 0}`);
    console.log(`📊 User Stats:`, dashboardData.userStats);
    
    // Check if we see expenses from different sites
    if (dashboardData.recentActivities && dashboardData.recentActivities.length > 0) {
      const sites = [...new Set(dashboardData.recentActivities.map(activity => 
        activity.description?.split(' - ')[0] || 'Unknown Site'
      ))];
      console.log(`🌍 Sites in Recent Activities: ${sites.join(', ')}`);
    }
    
    if (dashboardData.topCategories && dashboardData.topCategories.length > 0) {
      console.log(`📈 Top Categories:`, dashboardData.topCategories.map(cat => 
        `${cat.name}: ₹${cat.amount.toLocaleString()}`
      ));
    }
    console.log('');
    
    // 3. Test All Expenses API
    console.log('3️⃣ Testing All Expenses API...');
    const expensesResponse = await axios.get(`${baseURL}/expenses/all`, { headers });
    const allExpenses = expensesResponse.data.data;
    
    console.log(`📊 Total Expenses Found: ${allExpenses.length}`);
    
    if (allExpenses.length > 0) {
      const sites = [...new Set(allExpenses.map(exp => 
        exp.site?.name || 'Unknown Site'
      ))];
      console.log(`🌍 Sites in All Expenses: ${sites.join(', ')}`);
      
      // Check for Rohini site specifically
      const rohiniExpenses = allExpenses.filter(exp => 
        exp.site?.name?.toLowerCase().includes('rohini')
      );
      console.log(`🏢 Rohini Site Expenses: ${rohiniExpenses.length}`);
      
      if (rohiniExpenses.length > 0) {
        console.log(`✅ SUCCESS: Found expenses from Rohini site!`);
        rohiniExpenses.forEach(exp => {
          console.log(`   - ${exp.title}: ₹${exp.amount} (${exp.status})`);
        });
      } else {
        console.log(`❌ WARNING: No expenses found from Rohini site`);
      }
    }
    console.log('');
    
    // 4. Test Recent Activity API
    console.log('4️⃣ Testing Recent Activity API...');
    const recentActivityResponse = await axios.get(`${baseURL}/dashboard/recent-activity?limit=20`, { headers });
    const recentActivities = recentActivityResponse.data.data;
    
    console.log(`📊 Recent Activities Count: ${recentActivities.length}`);
    
    if (recentActivities.length > 0) {
      const sites = [...new Set(recentActivities.map(activity => 
        activity.site?.name || 'Unknown Site'
      ))];
      console.log(`🌍 Sites in Recent Activities: ${sites.join(', ')}`);
    }
    console.log('');
    
    // 5. Test Analytics API
    console.log('5️⃣ Testing Analytics API...');
    const analyticsResponse = await axios.get(`${baseURL}/dashboard/analytics`, { headers });
    const analyticsData = analyticsResponse.data.data;
    
    console.log(`📊 Monthly Trends: ${analyticsData.monthlyTrends?.length || 0} entries`);
    console.log(`📊 Category Analysis: ${analyticsData.categoryAnalysis?.length || 0} categories`);
    console.log(`📊 Top Spenders: ${analyticsData.topSpenders?.length || 0} users`);
    console.log('');
    
    // 6. Test Reports API
    console.log('6️⃣ Testing Reports API...');
    const reportsResponse = await axios.get(`${baseURL}/reports/expense-details`, { headers });
    const reportsData = reportsResponse.data.data;
    
    console.log(`📊 Reports Data Count: ${reportsData.length}`);
    
    if (reportsData.length > 0) {
      const sites = [...new Set(reportsData.map(exp => 
        exp.site?.name || 'Unknown Site'
      ))];
      console.log(`🌍 Sites in Reports: ${sites.join(', ')}`);
    }
    console.log('');
    
    // 7. Test Users API (Admin Panel)
    console.log('7️⃣ Testing Users API (Admin Panel)...');
    const usersResponse = await axios.get(`${baseURL}/users/all`, { headers });
    const allUsers = usersResponse.data.data;
    
    console.log(`👥 Total Users: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      const sites = [...new Set(allUsers.map(user => 
        user.site?.name || 'No Site'
      ))];
      console.log(`🌍 Sites in Users: ${sites.join(', ')}`);
    }
    console.log('');
    
    // 8. Summary
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log(`✅ Dashboard Overview: ${dashboardData.recentActivities?.length || 0} activities`);
    console.log(`✅ All Expenses: ${allExpenses.length} expenses`);
    console.log(`✅ Recent Activities: ${recentActivities.length} activities`);
    console.log(`✅ Analytics: ${analyticsData.monthlyTrends?.length || 0} trends`);
    console.log(`✅ Reports: ${reportsData.length} entries`);
    console.log(`✅ Users: ${allUsers.length} users`);
    
    // Check if we have data from multiple sites
    const allSites = new Set();
    if (dashboardData.recentActivities) {
      dashboardData.recentActivities.forEach(activity => {
        if (activity.description) {
          const site = activity.description.split(' - ')[0];
          allSites.add(site);
        }
      });
    }
    if (allExpenses.length > 0) {
      allExpenses.forEach(exp => {
        if (exp.site?.name) {
          allSites.add(exp.site.name);
        }
      });
    }
    
    console.log(`\n🌍 UNIQUE SITES FOUND: ${Array.from(allSites).join(', ')}`);
    
    if (allSites.size > 1) {
      console.log(`\n🎉 SUCCESS: L2 Approver can see data from multiple sites!`);
    } else if (allSites.size === 1) {
      console.log(`\n⚠️  WARNING: Only seeing data from one site: ${Array.from(allSites)[0]}`);
    } else {
      console.log(`\n❌ ERROR: No site data found!`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testL2AllSitesAccess();
