const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:5001', {
  withCredentials: true,
  transports: ['websocket']
});

console.log('🔌 Connecting to socket server...');

socket.on('connect', () => {
  console.log('✅ Connected to socket server');
  console.log('🔌 Socket ID:', socket.id);
  
  // Join user room for testing
  const testUserId = '6874fe8918f6927399a77f7d'; // Amit Kumar's ID
  socket.emit('join-user-room', testUserId);
  socket.emit('join-role-room', 'l1_approver');
  
  console.log('🎧 Joined user room:', testUserId);
  console.log('🎧 Joined role room: l1_approver');
  
  // Listen for events
  socket.on('expense-updated', (data) => {
    console.log('📡 Received expense-updated event:', data);
  });
  
  socket.on('expense_approved_l1', (data) => {
    console.log('📡 Received expense_approved_l1 event:', data);
  });
  
  socket.on('dashboard-update', (data) => {
    console.log('📡 Received dashboard-update event:', data);
  });
  
  // Test emit a manual event after 2 seconds
  setTimeout(() => {
    console.log('🧪 Emitting test event...');
    socket.emit('test-dashboard-update', {
      expenseId: 'test-123',
      expenseNumber: 'EXP-TEST',
      title: 'Test Expense',
      amount: 1000,
      status: 'approved',
      submitter: 'Test User',
      site: 'Test Site',
      approver: testUserId,
      level: 1,
      action: 'approve',
      timestamp: new Date(),
      category: 'Test',
      siteName: 'Test Site',
      siteId: 'test-site-id'
    });
  }, 2000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from socket server');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('🏁 Test completed');
  socket.disconnect();
  process.exit(0);
}, 10000); 