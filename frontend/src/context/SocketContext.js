import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const { user } = useAuth();

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching notifications for user:', user._id);
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.data?.notifications) {
        setNotifications(response.data.data.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    // Skip if no user or socket already exists
    if (!user || socketRef.current) {
      console.log('Socket initialization skipped:', { 
        hasUser: !!user, 
        hasSocket: !!socketRef.current 
      });
      return;
    }

    console.log('Creating new socket connection for user:', user._id);
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { userId: user._id, role: user.role }
    });

    // Store socket reference first
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      console.log('👤 User ID:', user._id);
      console.log('👤 User Role:', user.role);
      
      // Join rooms
      const roleRoom = `role-${user.role.toLowerCase()}`;
      const userRoom = `user-${user._id}`;
      const budgetRoom = 'budget-alerts';
      console.log('🎧 Joining rooms:', { roleRoom, userRoom, budgetRoom });
      
      newSocket.emit('join-role-room', roleRoom);
      newSocket.emit('join-user-room', userRoom);
      newSocket.emit('join-room', budgetRoom); // Join budget alerts room
      
      console.log('✅ Joined role room:', roleRoom);
      console.log('✅ Joined user room:', userRoom);
      console.log('✅ Joined budget alerts room:', budgetRoom);

      // Fetch initial data
      fetchNotifications();
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection failed:', {
        error: error.message,
        userId: user._id,
        role: user.role
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', { reason, socketId: newSocket.id });
      if (reason === 'transport close' || reason === 'ping timeout') {
        console.log('Attempting reconnection...');
        newSocket.connect();
      }
    });

    // Handle notifications
    newSocket.on('new_expense_submitted', (expense) => {
      console.log('New expense notification:', expense.expenseNumber);
      setNotifications(prev => [{
        id: expense.expenseId,
        type: 'new_expense',
        title: 'New Expense Submitted',
        message: `New expense #${expense.expenseNumber} submitted by ${expense.submitter}`,
        data: expense,
        timestamp: new Date(expense.timestamp),
        read: false
      }, ...prev]);
    });

    newSocket.on('expense-updated', (data) => {
      console.log('Expense update notification:', data.expenseNumber);
      setNotifications(prev => [{
        id: data.expenseId,
        type: data.status === 'approved' ? 'expense_approved' : 'expense_rejected',
        title: `Expense ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
        message: `Expense #${data.expenseNumber} ${data.status} - ₹${data.amount.toLocaleString()}`,
        data: data,
        timestamp: new Date(data.timestamp),
        read: false
      }, ...prev]);
    });

    newSocket.on('budget_exceeded_alert', (alert) => {
      console.log('Budget alert notification:', alert.site);
      setNotifications(prev => [{
        id: alert.expenseId,
        type: 'budget_alert',
        title: 'Budget Alert',
        message: `${alert.budgetType.charAt(0).toUpperCase() + alert.budgetType.slice(1)} budget exceeded for site ${alert.site}`,
        data: alert,
        timestamp: new Date(alert.timestamp),
        read: false
      }, ...prev]);
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket:', socketRef.current.id);
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user]); // Only depend on user

  // Utility functions
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 