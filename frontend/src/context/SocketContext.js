import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('No user found, skipping socket connection');
      return;
    }

    // Get JWT token from user or localStorage
    const token = user?.token || localStorage.getItem('token');

    // 1. Fetch notifications from API on mount, with Authorization header
    axios.get('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.data && res.data.data && res.data.data.notifications) {
          setNotifications(res.data.data.notifications.map(n => ({
            ...n,
            // Ensure timestamp is a Date object
            timestamp: new Date(n.timestamp)
          })));
        }
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err);
      });

    console.log('Attempting to connect socket with user:', user);

    // Initialize socket connection
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'] // Try WebSocket first, then fallback to polling
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully! Socket ID:', newSocket.id);
      
      // Join role-based room based on user role
      if (user.role) {
        console.log('Joining role room:', user.role);
        newSocket.emit('join-role-room', user.role);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      console.error('Connection details:', {
        url: 'http://localhost:5001',
        transport: newSocket.io.engine.transport.name,
        userId: user.id,
        role: user.role
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    // Handle new expense notifications
    newSocket.on('new_expense_submitted', (expense) => {
      console.log('Received new expense notification:', expense);
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

    // Handle budget exceeded alerts
    newSocket.on('budget_exceeded_alert', (alert) => {
      console.log('Received budget alert:', alert);
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

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    };
  }, [user]);

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Clear all notifications
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